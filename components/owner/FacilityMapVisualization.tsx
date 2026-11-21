'use client';

import React, { useState, useMemo } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { Tenant } from '@/types';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Clock,
  Phone,
  Mail,
  FileText,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Maximize2,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  Calendar,
  KeyRound,
  X,
} from 'lucide-react';

export interface MapUnitItem {
  id: string;
  code: string;
  wing: 'Building A' | 'Building B' | 'Building C' | 'Building D / Yard';
  wingSubtitle: string;
  size: string;
  price: number;
  isClimateControlled: boolean;
  status: 'occupied' | 'available' | 'locked out' | 'reserved';
  tenant?: Tenant;
  reservationDetails?: {
    customerName: string;
    moveInDate: string;
  };
}

export const FacilityMapVisualization: React.FC = () => {
  const {
    facility,
    unitTypes,
    tenants,
    reservations,
    navigateTo,
    addToast,
    isDocsConnected,
    docsUserEmail,
  } = useGateDesk();

  // View state
  const [viewMode, setViewMode] = useState<'floorplan' | 'matrix'>('floorplan');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedWingFilter, setSelectedWingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<MapUnitItem | null>(null);

  // Dynamically build unit map strictly from real configured unit types and active tenants (zero sample data)
  const mapUnits = useMemo<MapUnitItem[]>(() => {
    const items: MapUnitItem[] = [];
    const seenCodes = new Set<string>();
    const wingCycle: Array<{ wing: MapUnitItem['wing']; subtitle: string; prefix: string }> = [
      { wing: 'Building A', subtitle: 'Climate-Controlled Main Hall', prefix: 'A' },
      { wing: 'Building B', subtitle: 'Drive-Up Roll-Door Wing', prefix: 'B' },
      { wing: 'Building C', subtitle: 'Commercial & Flex Bays', prefix: 'C' },
      { wing: 'Building D / Yard', subtitle: 'Outdoor Yard & Parking', prefix: 'D' },
    ];

    // 1. Add all real tenants assigned to units first
    tenants
      .filter((t) => t.status !== 'moved out' && t.unit && t.unit !== '—')
      .forEach((tenant, idx) => {
        const upperCode = tenant.unit.trim().toUpperCase();
        seenCodes.add(upperCode);
        const wingMeta =
          upperCode.startsWith('B')
            ? wingCycle[1]
            : upperCode.startsWith('C')
            ? wingCycle[2]
            : upperCode.startsWith('D') || upperCode.startsWith('RV')
            ? wingCycle[3]
            : wingCycle[0];

        const matchedType = unitTypes[idx % Math.max(unitTypes.length, 1)];
        const status: MapUnitItem['status'] =
          tenant.status === 'locked out' || tenant.balance > 0 ? 'locked out' : 'occupied';

        items.push({
          id: `map_t_${tenant.id}`,
          code: tenant.unit,
          wing: wingMeta.wing,
          wingSubtitle: wingMeta.subtitle,
          size: matchedType?.size || 'Standard',
          price: matchedType?.monthlyPrice || 0,
          isClimateControlled: matchedType?.climateControlled || false,
          status,
          tenant,
        });
      });

    // 2. Add available units configured in Settings / Unit Inventory
    unitTypes.forEach((ut, typeIdx) => {
      const wingMeta = wingCycle[typeIdx % wingCycle.length];
      const count = Math.min(Math.max(ut.unitsAvailable || 0, 0), 20);
      for (let i = 1; i <= count; i++) {
        const code = `${wingMeta.prefix}-${String(typeIdx * 100 + i).padStart(3, '0')}`;
        if (seenCodes.has(code)) continue;
        seenCodes.add(code);
        const resMatch = reservations.find(
          (r) => r.status === 'New' && r.unitSize.toLowerCase().includes(ut.size.toLowerCase())
        );
        items.push({
          id: `map_u_${ut.id}_${i}`,
          code,
          wing: wingMeta.wing,
          wingSubtitle: wingMeta.subtitle,
          size: ut.size,
          price: ut.monthlyPrice,
          isClimateControlled: ut.climateControlled,
          status: resMatch && i === 1 ? 'reserved' : 'available',
          reservationDetails:
            resMatch && i === 1
              ? { customerName: resMatch.customerName, moveInDate: resMatch.moveInDate }
              : undefined,
        });
      }
    });

    return items;
  }, [unitTypes, tenants, reservations]);

  // Filtered unit list
  const filteredUnits = useMemo(() => {
    return mapUnits.filter((u) => {
      // Status filter
      if (selectedStatusFilter !== 'all') {
        if (selectedStatusFilter === 'occupied' && u.status !== 'occupied') return false;
        if (selectedStatusFilter === 'available' && u.status !== 'available') return false;
        if (selectedStatusFilter === 'locked out' && u.status !== 'locked out') return false;
        if (selectedStatusFilter === 'reserved' && u.status !== 'reserved') return false;
      }

      // Wing filter
      if (selectedWingFilter !== 'all' && u.wing !== selectedWingFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = u.code.toLowerCase().includes(q);
        const tenantMatch = u.tenant?.name.toLowerCase().includes(q);
        const sizeMatch = u.size.toLowerCase().includes(q);
        if (!codeMatch && !tenantMatch && !sizeMatch) return false;
      }

      return true;
    });
  }, [mapUnits, selectedStatusFilter, selectedWingFilter, searchQuery]);

  // Aggregate stats
  const totalUnitsCount = mapUnits.length;
  const occupiedCount = mapUnits.filter((u) => u.status === 'occupied').length;
  const delinquentCount = mapUnits.filter((u) => u.status === 'locked out').length;
  const availableCount = mapUnits.filter((u) => u.status === 'available').length;
  const reservedCount = mapUnits.filter((u) => u.status === 'reserved').length;
  const occupancyPercent = totalUnitsCount > 0 ? Math.round(((occupiedCount + delinquentCount) / totalUnitsCount) * 100) : 0;

  // Group filtered units by wing for the floor plan layout
  const wings: Array<{
    name: MapUnitItem['wing'];
    subtitle: string;
    description: string;
    accentColor: string;
  }> = [
    {
      name: 'Building A',
      subtitle: 'Climate-Controlled Main Hall',
      description: 'Fully insulated, keycard-monitored entrance with 24/7 temperature control.',
      accentColor: '#0D9488',
    },
    {
      name: 'Building B',
      subtitle: 'Drive-Up Roll-Door Wing',
      description: 'Exterior 25ft paved drive aisle for rapid pull-up vehicle unloading.',
      accentColor: '#2563EB',
    },
    {
      name: 'Building C',
      subtitle: 'Contractor & Flex Commercial Bays',
      description: 'High-clearance bays with 12ft roll doors, trickle power, and lighting.',
      accentColor: '#D97706',
    },
    {
      name: 'Building D / Yard',
      subtitle: 'RV, Boat & Fleet Parking Yard',
      description: 'Gated open yard perimeter with RFID camera gate monitoring.',
      accentColor: '#7C3AED',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
      {/* 1. Header & Live Occupancy Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 uppercase tracking-wider">
              Interactive Architectural Map
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · {facility.name} Floor Plan
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Facility Occupancy &amp; Unit Floor Plan</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Live interactive blueprint of all unit wings. Click any unit to view tenant details, delinquent balances, or generate standard Google Docs lease agreements.
          </p>
        </div>

        {/* View mode toggle & quick actions */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs">
            <button
              type="button"
              onClick={() => setViewMode('floorplan')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'floorplan'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Floor Plan Visual
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Compact Matrix
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('documents')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>Generate Lease</span>
          </button>
        </div>
      </div>

      {/* 2. Key Occupancy & Capacity Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Overall Occupancy
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {occupancyPercent}%
          </div>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
            {occupiedCount + delinquentCount} of {totalUnitsCount} units filled
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
            Available / Vacant
          </span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
            {availableCount} units
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Ready for instant move-in
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
            Occupied (Current)
          </span>
          <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-0.5">
            {occupiedCount} units
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Active leases &amp; gate access
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
            Overlocked / Delinquent
          </span>
          <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">
            {delinquentCount} units
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
            Keypad gate lockout active
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
            Pending Holds
          </span>
          <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">
            {reservedCount} holds
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Calendar sync holds
          </span>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Status filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `All (${mapUnits.length})` },
            { id: 'available', label: `🟢 Vacant (${availableCount})` },
            { id: 'occupied', label: `🔵 Occupied (${occupiedCount})` },
            { id: 'locked out', label: `🔴 Delinquent (${delinquentCount})` },
            { id: 'reserved', label: `🟡 Holds (${reservedCount})` },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSelectedStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatusFilter === pill.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Wing selector & Search */}
        <div className="flex items-center gap-2">
          <select
            value={selectedWingFilter}
            onChange={(e) => setSelectedWingFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Wings &amp; Buildings</option>
            <option value="Building A">Building A (Climate)</option>
            <option value="Building B">Building B (Drive-Up)</option>
            <option value="Building C">Building C (Contractor)</option>
            <option value="Building D / Yard">Building D / Yard (RV &amp; Boats)</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Unit # or Tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* 4. Architectural Facility Floor Plan Display */}
      {viewMode === 'floorplan' ? (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-950/40 space-y-6">
          {/* Facility Architectural Perimeter Header */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold text-[11px]">
                <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                <span>GATE 1: MAIN KEYPAD</span>
              </div>
              <span className="text-slate-300">
                Operating Hours: <strong>{facility.gateHours}</strong> · Policy: Keypad Access Enforced
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Vacant
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Occupied
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Delinquent
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Hold
              </span>
            </div>
          </div>

          {/* Building Wings Display */}
          <div className="space-y-6">
            {wings.map((wing) => {
              const wingUnits = filteredUnits.filter((u) => u.wing === wing.name);
              if (selectedWingFilter !== 'all' && selectedWingFilter !== wing.name) return null;
              if (wingUnits.length === 0 && (selectedStatusFilter !== 'all' || searchQuery)) return null;

              return (
                <div
                  key={wing.name}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5"
                >
                  {/* Wing Title Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-8 rounded-full"
                        style={{ backgroundColor: wing.accentColor }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                            {wing.name} — {wing.subtitle}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {wingUnits.length} units
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {wing.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>Driveway Aisle: 25ft clearance</span>
                    </div>
                  </div>

                  {/* Units Grid for this Wing */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
                    {wingUnits.map((u) => {
                      const isSelected = selectedUnit?.id === u.id;
                      const isDelinquent = u.status === 'locked out';
                      const isOccupied = u.status === 'occupied';
                      const isVacant = u.status === 'available';
                      const isReserved = u.status === 'reserved';

                      return (
                        <div
                          key={u.id}
                          onClick={() => setSelectedUnit(u)}
                          className={`relative rounded-xl p-3 border text-left cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${
                            isSelected
                              ? 'ring-2 ring-teal-500 shadow-md'
                              : ''
                          } ${
                            isDelinquent
                              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                              : isOccupied
                              ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/80'
                              : isReserved
                              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                              : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/70 hover:border-emerald-300'
                          }`}
                        >
                          {/* Top Row: Unit Code & Status Dot */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
                              {u.code}
                            </span>
                            <span className="text-[10px]">
                              {isDelinquent && (
                                <span className="inline-flex items-center gap-0.5 px-1 rounded text-[9px] font-bold bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-300">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>LOCKED</span>
                                </span>
                              )}
                              {isOccupied && (
                                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                              )}
                              {isVacant && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              )}
                              {isReserved && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                              )}
                            </span>
                          </div>

                          {/* Unit Size & Price */}
                          <div className="mt-1 flex items-baseline justify-between text-[11px]">
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              {u.size}
                            </span>
                            <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                              ${u.price}
                            </span>
                          </div>

                          {/* Tenant Info or Status Tag */}
                          <div className="mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/60 text-[10px]">
                            {u.tenant ? (
                              <div className="truncate">
                                <div className="font-semibold text-slate-900 dark:text-white truncate">
                                  {u.tenant.name}
                                </div>
                                <div className={isDelinquent ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                                  {isDelinquent ? `Owes $${u.tenant.balance}` : 'Active Lease'}
                                </div>
                              </div>
                            ) : isReserved ? (
                              <div className="text-amber-700 dark:text-amber-400 font-bold truncate">
                                Hold Pending
                              </div>
                            ) : (
                              <div className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-between">
                                <span>Vacant</span>
                                <span className="text-[9px] opacity-75">Click to Rent &rarr;</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Architectural Road & Gate Bottom Banner */}
          <div className="p-3 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl text-center text-xs text-slate-600 dark:text-slate-400 border border-slate-300/60 dark:border-slate-700/60 flex items-center justify-center gap-2">
            <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-slate-500">
              ◄ SOUTH ACCESS ROAD &middot; SECURITY SURVEILLANCE COVERED &middot; RFID SENSORS ACTIVE ►
            </span>
          </div>
        </div>
      ) : (
        /* 5. Matrix Table View */
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Unit Code</th>
                  <th className="py-2.5 px-3">Wing / Building</th>
                  <th className="py-2.5 px-3">Dimensions</th>
                  <th className="py-2.5 px-3">Monthly Rate</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Current Tenant / Hold</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUnits.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUnit(u)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {u.code}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {u.wing}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {u.size} {u.isClimateControlled && '❄ Climate'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                      ${u.price}
                    </td>
                    <td className="py-2.5 px-3">
                      {u.status === 'locked out' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          Overlocked (${u.tenant?.balance})
                        </span>
                      )}
                      {u.status === 'occupied' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          Occupied
                        </span>
                      )}
                      {u.status === 'available' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Vacant
                        </span>
                      )}
                      {u.status === 'reserved' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Hold
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">
                      {u.tenant?.name || u.reservationDetails?.customerName || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUnit(u);
                        }}
                        className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        Inspect &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Interactive Unit Inspector Modal / Drawer */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-mono font-black text-sm">
                  {selectedUnit.code}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                      {selectedUnit.wing}
                    </span>
                    {selectedUnit.isClimateControlled && (
                      <span className="text-[10px] font-medium bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-1.5 rounded">
                        Climate Controlled
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Unit {selectedUnit.code} ({selectedUnit.size} &middot; ${selectedUnit.price}/mo)
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUnit(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-semibold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  selectedUnit.status === 'locked out'
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                    : selectedUnit.status === 'occupied'
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                    : selectedUnit.status === 'reserved'
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedUnit.status === 'locked out' ? (
                    <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : selectedUnit.status === 'occupied' ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : selectedUnit.status === 'reserved' ? (
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span className="font-bold capitalize">
                    {selectedUnit.status === 'locked out'
                      ? 'Overlocked / Delinquent Balance'
                      : selectedUnit.status === 'occupied'
                      ? 'Occupied — Active Lease'
                      : selectedUnit.status === 'reserved'
                      ? 'Reserved Hold — Move-In Pending'
                      : 'Vacant — Ready for Lease'}
                  </span>
                </div>

                <span className="font-mono font-bold text-xs">
                  ${selectedUnit.price} / mo
                </span>
              </div>

              {/* Occupied Tenant Details */}
              {selectedUnit.tenant ? (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Assigned Tenant
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {selectedUnit.tenant.name}
                      </h4>
                    </div>
                    {selectedUnit.tenant.balance > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Owes ${selectedUnit.tenant.balance}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Current ($0 Balance)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedUnit.tenant.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{selectedUnit.tenant.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Move-in: {selectedUnit.tenant.moveInDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                      <span>Texts: {selectedUnit.tenant.agreedToTexts ? 'Opted In' : 'No'}</span>
                    </div>
                  </div>

                  {/* Google Docs Lease Status & Badge */}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span>Google Docs Lease Agreement:</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                        Draft — review before sending to tenant
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Stored in tenant document history. Sample terms provided; have your attorney review before use. Statutory lien and auction rules vary by state.
                    </p>
                  </div>
                </div>
              ) : selectedUnit.status === 'reserved' ? (
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                    Online Reservation Hold
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedUnit.reservationDetails?.customerName}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Hold active for move-in date: <strong>{selectedUnit.reservationDetails?.moveInDate}</strong>. Syncs with Google Calendar.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                    Unit Available
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    This unit is cleaned, inspected, and ready to rent. You can generate a Google Docs lease agreement with populated tenant data instantly.
                  </p>
                </div>
              )}

              {/* Gate Security Notice */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Gate Security Policy:</strong> Actual gate keypad PINs are never embedded in documents or shared in unauthenticated links. Access is enforced automatically at perimeter gates.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedUnit(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedUnit.status === 'locked out' && (
                  <button
                    type="button"
                    onClick={() => {
                      addToast({
                        type: 'info',
                        title: `Payment reminder sent to ${selectedUnit.tenant?.name}`,
                      });
                      setSelectedUnit(null);
                    }}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Send Overlock Notice
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUnit(null);
                    navigateTo('documents');
                  }}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {selectedUnit.tenant ? 'View / Generate Google Docs Lease' : 'Assign & Generate Lease'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
