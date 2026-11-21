'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGateDesk } from '@/context/GateDeskContext';
import { BusinessType, ConnectedBusiness } from '@/types';
import { INDUSTRY_TEMPLATES } from '@/lib/demo-data';
import {
  Building2,
  Car,
  Laptop,
  Warehouse,
  Tractor,
  Store,
  Plus,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
  FileText,
  PhoneCall,
  CreditCard,
  Layers,
  Sparkles,
  Info,
  Check,
  Trash2,
  TrendingUp,
  Users,
  KeyRound,
  ChevronRight,
  Globe,
  Settings,
  HelpCircle,
  HardDrive,
  CheckSquare,
  Clock,
  Filter,
  AlertCircle,
  Wrench,
  BookOpen,
} from 'lucide-react';
import { IntegrationServiceRequest } from '@/types';

interface BusinessPreset {
  type: BusinessType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  unitNoun: string;
  customerNoun: string;
  accessMethod: string;
  color: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  badgeBg: string;
  badgeText: string;
  contractName: string;
  suggestedCapacity: number;
}

const BUSINESS_PRESETS: BusinessPreset[] = [
  {
    type: 'self-storage',
    title: 'Self-Storage Facility',
    icon: Building2,
    tagline: 'Standard & climate-controlled storage units with keypad gate control and tenant leases.',
    unitNoun: 'Storage Units',
    customerNoun: 'Tenants',
    accessMethod: 'Automated Keypad Gate',
    color: '#0D9488',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-950/30',
    borderLight: 'border-teal-200',
    borderDark: 'dark:border-teal-800',
    badgeBg: 'bg-teal-100 dark:bg-teal-900/60',
    badgeText: 'text-teal-800 dark:text-teal-300',
    contractName: 'Self-Storage Rental Agreement',
    suggestedCapacity: 120,
  },
  {
    type: 'rv-boat-storage',
    title: 'RV & Boat Storage Yard',
    icon: Car,
    tagline: 'Paved & covered vehicle parking bays, boat slips, trickle charging, and RFID gate clearance.',
    unitNoun: 'Parking Bays & Slips',
    customerNoun: 'Parking Clients',
    accessMethod: 'RFID Barcode Gate & CCTV',
    color: '#2563EB',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/30',
    borderLight: 'border-blue-200',
    borderDark: 'dark:border-blue-800',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/60',
    badgeText: 'text-blue-800 dark:text-blue-300',
    contractName: 'Vehicle, RV & Boat Storage Agreement',
    suggestedCapacity: 80,
  },
  {
    type: 'coworking-office',
    title: 'Coworking & Executive Suites',
    icon: Laptop,
    tagline: 'Shared hot desks, dedicated offices, conference rooms, and mobile keycard door PINs.',
    unitNoun: 'Desks & Private Offices',
    customerNoun: 'Members',
    accessMethod: 'Smart Keycard & Mobile PIN',
    color: '#7C3AED',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/30',
    borderLight: 'border-purple-200',
    borderDark: 'dark:border-purple-800',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/60',
    badgeText: 'text-purple-800 dark:text-purple-300',
    contractName: 'Coworking Membership & Suite License',
    suggestedCapacity: 65,
  },
  {
    type: 'warehouse-flex',
    title: 'Commercial Warehouse & Flex',
    icon: Warehouse,
    tagline: 'Industrial flex spaces, logistics bays, 24ft clearance, and common loading dock scheduling.',
    unitNoun: 'Warehouse Bays',
    customerNoun: 'Commercial Tenants',
    accessMethod: 'Loading Dock Clearance & Gate',
    color: '#D97706',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/30',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-800',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    contractName: 'Commercial Warehouse Bay Lease',
    suggestedCapacity: 20,
  },
  {
    type: 'equipment-rental',
    title: 'Equipment & Heavy Machinery Rental',
    icon: Tractor,
    tagline: 'Contractor trailers, mini excavators, tool fleets, telematics check-in, and damage waivers.',
    unitNoun: 'Rental Fleet Assets',
    customerNoun: 'Equipment Renters',
    accessMethod: 'Yard Keybox & Telematics',
    color: '#059669',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/30',
    borderLight: 'border-emerald-200',
    borderDark: 'dark:border-emerald-800',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    contractName: 'Equipment & Machinery Rental Contract',
    suggestedCapacity: 40,
  },
  {
    type: 'commercial-property',
    title: 'Commercial Property & Suites',
    icon: Store,
    tagline: 'Multi-tenant commercial retail centers, business parks, and mixed-use property suites.',
    unitNoun: 'Commercial Suites',
    customerNoun: 'Commercial Tenants',
    accessMethod: 'Building Keycard & Intercom',
    color: '#4F46E5',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/30',
    borderLight: 'border-indigo-200',
    borderDark: 'dark:border-indigo-800',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/60',
    badgeText: 'text-indigo-800 dark:text-indigo-300',
    contractName: 'Commercial Property Lease & License',
    suggestedCapacity: 25,
  },
];

export const BusinessHubView: React.FC = () => {
  const {
    connectedBusinesses,
    activeBusiness,
    switchBusiness,
    connectNewBusiness,
    disconnectBusiness,
    navigateTo,
    addToast,
    integrationRequests,
    submitIntegrationRequest,
  } = useGateDesk();

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Connect Business Modal state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [selectedType, setSelectedType] = useState<BusinessType>('self-storage');
  const [bizName, setBizName] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizUnits, setBizUnits] = useState<number>(60);
  const [bizAccessMethod, setBizAccessMethod] = useState('');
  const [toolGoogleDocs, setToolGoogleDocs] = useState(true);
  const [toolGoogleCalendar, setToolGoogleCalendar] = useState(true);
  const [toolVoIP, setToolVoIP] = useState(true);
  const [toolPayments, setToolPayments] = useState(true);

  // Architecture explainer modal
  const [showHowItWorksDetails, setShowHowItWorksDetails] = useState(false);

  // Integrations Guide Tabs & Request Modal State
  const [activeGuideTab, setActiveGuideTab] = useState<'google-suite' | 'beyond-storage' | 'request-tracker'>('google-suite');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestFilter, setRequestFilter] = useState<'all' | 'under_review' | 'in_progress' | 'connected'>('all');

  // Request Form State
  const [reqBizId, setReqBizId] = useState<string>(activeBusiness.id || '');
  const [reqCategory, setReqCategory] = useState<IntegrationServiceRequest['serviceCategory']>('accounting');
  const [reqToolName, setReqToolName] = useState('');
  const [reqPriority, setReqPriority] = useState<IntegrationServiceRequest['priority']>('high');
  const [reqNotes, setReqNotes] = useState('');

  // Calculate portfolio totals
  const totalRevenue = connectedBusinesses.reduce((acc, b) => acc + b.monthlyRevenue, 0);
  const totalCapacity = connectedBusinesses.reduce((acc, b) => acc + b.units, 0);
  const totalOccupied = connectedBusinesses.reduce((acc, b) => acc + b.activeTenants, 0);
  const overallOccupancy = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : '0';

  // Filtered businesses
  const filteredBusinesses =
    selectedFilter === 'all'
      ? connectedBusinesses
      : connectedBusinesses.filter((b) => b.businessType === selectedFilter);

  const handleSelectPreset = (preset: BusinessPreset) => {
    setSelectedType(preset.type);
    setBizUnits(preset.suggestedCapacity);
    setBizAccessMethod(preset.accessMethod);
    setWizardStep(2);
  };

  const handleCompleteConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim()) {
      addToast({ type: 'error', title: 'Business Name Required' });
      return;
    }

    const integrations: string[] = [];
    if (toolGoogleDocs) integrations.push('Google Docs');
    if (toolGoogleCalendar) integrations.push('Google Calendar');
    if (toolVoIP) integrations.push('OpenPhone VoIP');
    if (toolPayments) integrations.push('PayPal/Stripe');

    const preset = BUSINESS_PRESETS.find((p) => p.type === selectedType) || BUSINESS_PRESETS[0];

    connectNewBusiness({
      name: bizName.trim(),
      businessType: selectedType,
      categoryLabel: preset.title,
      unitNoun: preset.unitNoun,
      customerNoun: preset.customerNoun,
      units: Number(bizUnits) || preset.suggestedCapacity,
      address: bizAddress.trim() || '100 Business Parkway, Suite 100',
      phone: bizPhone.trim() || '(555) 019-8000',
      email: bizEmail.trim() || 'support@' + bizName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      accessMethod: bizAccessMethod.trim() || preset.accessMethod,
      integrations,
      brandColor: preset.color,
    });

    // Reset form
    setBizName('');
    setBizAddress('');
    setBizPhone('');
    setBizEmail('');
    setWizardStep(1);
    setIsConnectModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12 max-w-7xl mx-auto">
      {/* 1. Header Zone with Architecture Answer */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500 text-slate-950 uppercase tracking-wider">
                  All-in-One Multi-Business Platform
                </span>
                <span className="text-xs text-slate-400">· Multi-Tenant Portfolio OS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Connected Businesses Hub
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Connect and manage all your businesses from one unified GateDesk command center — self-storage facilities, RV & boat storage, coworking spaces, commercial warehouses, equipment rentals, and property operations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/partner-hub"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Users className="w-4 h-4 text-teal-400" />
                <span>CreatorDesk Pro Workspace</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <button
                type="button"
                onClick={() => setShowHowItWorksDetails(!showHowItWorksDetails)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-teal-300 flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Info className="w-4 h-4 text-teal-400" />
                <span>How Businesses Connect</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWizardStep(1);
                  setIsConnectModalOpen(true);
                }}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Connect New Business</span>
              </button>
            </div>
          </div>

          {/* 2. Educational Explainer Cards: HOW CAN THEY CONNECT TO THEIR BUSINESSES? */}
          {(showHowItWorksDetails || true) && (
            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                  <span className="w-5 h-5 rounded-md bg-teal-500/20 flex items-center justify-center text-[10px]">1</span>
                  <span>Select Industry Profile</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Choose your business model (Storage, RV Park, Coworking, Warehouse, or Equipment Rental). GateDesk instantly customizes inventory categories, tenant/member terminology, and units.
                </p>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                  <span className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center text-[10px]">2</span>
                  <span>Connect Access & Gates</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sync your access hardware: automated keypad gates, RFID barcode readers, mobile door PINs, or loading dock controllers. GateDesk securely enforces gate access policy without exposing secret codes.
                </p>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                  <span className="w-5 h-5 rounded-md bg-purple-500/20 flex items-center justify-center text-[10px]">3</span>
                  <span>Google Suite & Business Tools</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect Google Docs (auto-generates leases & SOPs with draft badges), Google Calendar (syncs move-ins & bookings), and VoIP phone lines (instant missed-call & SMS alerts).
                </p>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-[10px]">4</span>
                  <span>Instant 1-Click Switcher</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Switch between businesses seamlessly via the top navbar. All staff, tenants, contracts, calendar schedules, and financial reports stay organized under one master account.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Portfolio Analytics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Connected Businesses</span>
            <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {connectedBusinesses.length}
          </div>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
            Active multi-business network
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Portfolio Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ${totalRevenue.toLocaleString()}/mo
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Combined recurring revenue
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Total Units / Spaces</span>
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalCapacity}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Across {connectedBusinesses.length} properties
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Average Occupancy</span>
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {overallOccupancy}%
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            {totalOccupied} active clients/tenants
          </span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Current Active Workspace</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate" title={activeBusiness.name}>
            {activeBusiness.name}
          </div>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium truncate block">
            {activeBusiness.categoryLabel}
          </span>
        </div>
      </div>

      {/* 4. Industry Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Businesses ({connectedBusinesses.length})
          </button>
          {BUSINESS_PRESETS.map((preset) => {
            const count = connectedBusinesses.filter((b) => b.businessType === preset.type).length;
            if (count === 0) return null;
            const Icon = preset.icon;
            return (
              <button
                key={preset.type}
                onClick={() => setSelectedFilter(preset.type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  selectedFilter === preset.type
                    ? 'bg-teal-600 text-white font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{preset.title.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredBusinesses.length} of {connectedBusinesses.length} businesses
        </span>
      </div>

      {/* 5. Connected Businesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBusinesses.map((biz) => {
          const preset = BUSINESS_PRESETS.find((p) => p.type === biz.businessType) || BUSINESS_PRESETS[0];
          const Icon = preset.icon;
          const isActive = biz.id === activeBusiness.id;

          return (
            <div
              key={biz.id}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-teal-500 dark:border-teal-400 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div>
                {/* Card Top Banner */}
                <div className={`p-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 ${preset.bgLight} ${preset.bgDark}`}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
                      style={{ backgroundColor: biz.brandColor || preset.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${preset.badgeBg} ${preset.badgeText}`}>
                          {biz.categoryLabel}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500 text-slate-950">
                            Active Workspace
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1 leading-tight">
                        {biz.name}
                      </h3>
                    </div>
                  </div>

                  {connectedBusinesses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => disconnectBusiness(biz.id)}
                      className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-md transition-colors"
                      title="Disconnect business from GateDesk"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Card Body Information */}
                <div className="p-4 space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{biz.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <KeyRound className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                        Access: {biz.accessMethod}
                      </span>
                    </div>
                  </div>

                  {/* Occupancy and Capacity Gauge */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Capacity & Occupancy
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {biz.activeTenants} / {biz.units} {biz.unitNoun} ({biz.occupancyRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(biz.occupancyRate, 100)}%`,
                          backgroundColor: biz.brandColor || preset.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Monthly Revenue</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        ${biz.monthlyRevenue.toLocaleString()} / mo
                      </span>
                    </div>
                  </div>

                  {/* Connected Integrations Pills */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      Connected Business Tools
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {biz.integrations.map((tool) => (
                        <span
                          key={tool}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                        >
                          <Check className="w-2.5 h-2.5 text-teal-500" />
                          <span>{tool}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
                {isActive ? (
                  <div className="w-full flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigateTo('today')}
                      className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Open Operations</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('documents')}
                      className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                      title="Generate lease agreements or SOP in Google Docs"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-500" />
                      <span>Docs</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => switchBusiness(biz.id)}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Switch to this Business</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Business Card CTA */}
        <div
          onClick={() => {
            setWizardStep(1);
            setIsConnectModalOpen(true);
          }}
          className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 p-8 flex flex-col items-center justify-center text-center cursor-pointer group bg-slate-50/50 dark:bg-slate-900/40 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-all min-h-[340px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            Connect Another Business
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1.5 leading-relaxed">
            Add a self-storage site, RV lot, coworking floor, warehouse bay, or equipment fleet into your single GateDesk dashboard.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
            <span>Launch Connection Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* 6. Getting Started with Integrations Guide & Multi-Business Hub */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                Integrations Master Guide
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">· Extend Beyond Storage</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Getting Started with Integrations</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Discover how to maximize the built-in Google Suite across all business units, and connect third-party VoIP, accounting, and access control hardware to streamline operations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setReqBizId(activeBusiness.id);
                setIsRequestModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-teal-400" />
              <span>Request New Service Connection</span>
            </button>
          </div>
        </div>

        {/* Guide Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveGuideTab('google-suite')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeGuideTab === 'google-suite'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Google Suite Power Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveGuideTab('beyond-storage')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeGuideTab === 'beyond-storage'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4 text-purple-500" />
            <span>Connecting Beyond Storage (VoIP, Hardware, Accounting)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveGuideTab('request-tracker')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeGuideTab === 'request-tracker'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Active Service Requests ({integrationRequests.length})</span>
          </button>
        </div>

        {/* TAB 1: Google Suite Power Guide */}
        {activeGuideTab === 'google-suite' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">Unified Google Suite Core:</strong> GateDesk connects directly with your official Google Workspace account. Because each business location can maintain its own Google Docs lease templates and Google Calendar move-in rosters, you get enterprise-level automation without vendor lock-in.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Google Docs Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Google Docs: Leases &amp; SOP Generation
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Zero-hallucination merge field engine
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Generate standard tenant lease agreements and facility Standard Operating Procedures directly inside Google Docs. All owner and tenant data is merged with complete accuracy.
                  </p>

                  <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px]">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Standard Merge Fields Supported:
                    </div>
                    <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded">
                        {'{{tenant_name}}'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded">
                        {'{{tenant_phone}}'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded">
                        {'{{unit_number}}'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded">
                        {'{{unit_size}}'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded">
                        {'{{monthly_rent}}'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded">
                        {'{{move_in_date}}'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded">
                        {'{{facility_name}}'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded">
                        {'{{facility_address}}'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span><strong>No AI legal terms:</strong> Owners upload or paste their own attorney-reviewed contracts.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span><strong>Mandatory Draft Badge:</strong> Every generated lease carries <span className="text-amber-600 font-bold">Draft — review before sending to tenant</span>.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span><strong>State Law Disclaimers:</strong> Built-in warnings that statutory lien, late fee, and auction timelines vary by jurisdiction.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span><strong>Gate Security Safe:</strong> Never embeds secret gate codes; only describes gate access operating policies.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Stored in tenant document history</span>
                  <button
                    type="button"
                    onClick={() => navigateTo('documents')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Open Documents Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Google Calendar Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Google Calendar: Move-Ins &amp; Reservations
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Two-way calendar sync for appointments
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Connect each business facility directly to a Google Calendar. Customer online bookings, lease signing meetings, vehicle drop-offs, and conference room slots automatically appear on your schedule.
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-[11px]">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Automated Calendar Triggers:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Move-in appointment scheduling</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Desk &amp; suite bookings</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Equipment rental return alarms</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Customizable reminder alerts</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span><strong>Multi-Facility Support:</strong> Separate calendars per location or unified company calendar.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span><strong>Configurable Buffer:</strong> Choose 15m, 1h, or 1d advance reminder notifications.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span><strong>One-Click Connect/Disconnect:</strong> Full control in Settings &gt; Integrations.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Syncs with owner Google account</span>
                  <button
                    type="button"
                    onClick={() => navigateTo('reservations')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Calendar Holds</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Google Drive Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Google Drive: Digital Document Vault
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Cloud filing cabinet organized per tenant
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    GateDesk automatically organizes generated lease agreements, ID scans, vehicle registrations, and signed amendments inside your Google Drive in a dedicated <code>GateDesk Records</code> folder.
                  </p>

                  <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>Direct permalinks saved to tenant profiles.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>Shareable directly with tenants via email or WhatsApp.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>Instant search across all leases from your Google Drive search bar.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Persistent Google Cloud storage</span>
                  <button
                    type="button"
                    onClick={() => navigateTo('documents')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Docs Vault</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Google Tasks Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Google Tasks: Daily Staff Action Lists
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Operational turnover &amp; inspection checklists
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Keep your property managers and on-site staff synced. GateDesk dispatches actionable tasks when units are vacated, late payments require overlocking, or gate sensors trigger maintenance alerts.
                  </p>

                  <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>Automatic checklist created when a tenant submits move-out notice.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>Delinquent overlock placement and removal audit tasks.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>Syncs natively to managers&apos; Android and iOS Google Tasks apps.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Real-time mobile task sync</span>
                  <button
                    type="button"
                    onClick={() => navigateTo('today')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Check Today&apos;s Queue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Connecting Beyond Storage */}
        {activeGuideTab === 'beyond-storage' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-gradient-to-r from-teal-500/10 via-purple-500/10 to-blue-500/10 p-4 rounded-xl border border-teal-500/20 text-xs text-slate-700 dark:text-slate-200">
              <strong className="text-teal-700 dark:text-teal-400">All-in-One Business Architecture:</strong> GateDesk is engineered from the ground up for multi-property owners. Storage facilities, RV parks, coworking hubs, warehouses, and equipment rentals require distinct hardware and financial backbones. Here is how GateDesk seamlessly integrates with each:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pillar 1: Access Hardware */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                    Access Hardware &amp; Gates
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Sync with automated perimeter gates, RFID barcode readers, and mobile electronic door locks.
                  </p>
                  <div className="mt-3 space-y-1 text-[10px] text-slate-600 dark:text-slate-300">
                    <div>• <strong>DoorKing (DKS Cloud):</strong> 1830 series keypad gates</div>
                    <div>• <strong>Brivo &amp; Kisi:</strong> Cloud access and mobile badges</div>
                    <div>• <strong>Salto KS:</strong> Smart locks for coworking &amp; suites</div>
                    <div>• <strong>LiftMaster:</strong> Barrier arms &amp; heavy vehicle gates</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block">
                    Automatic lockout on late balance
                  </span>
                </div>
              </div>

              {/* Pillar 2: Financials & Accounting */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                    Accounting &amp; Invoicing
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Automatic synchronization of rental revenues, security deposits, and late fees into your general ledger.
                  </p>
                  <div className="mt-3 space-y-1 text-[10px] text-slate-600 dark:text-slate-300">
                    <div>• <strong>QuickBooks Online:</strong> Real-time invoices &amp; payments</div>
                    <div>• <strong>Xero Accounting:</strong> Bank reconciliation &amp; tax</div>
                    <div>• <strong>Stripe Billing:</strong> Autopay &amp; card on file</div>
                    <div>• <strong>Multi-Entity:</strong> Split books per LLC or property</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">
                    Zero manual double-entry
                  </span>
                </div>
              </div>

              {/* Pillar 3: VoIP & Telephony */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                    VoIP &amp; 2-Way Texting
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Keep prospective renters and tenants in constant touch with smart VoIP lines and instant SMS response.
                  </p>
                  <div className="mt-3 space-y-1 text-[10px] text-slate-600 dark:text-slate-300">
                    <div>• <strong>OpenPhone (Quo):</strong> Native call &amp; SMS bridge</div>
                    <div>• <strong>Twilio Messaging:</strong> Automated blast notifications</div>
                    <div>• <strong>Missed Call Alerts:</strong> Instant 2-minute SMS recovery</div>
                    <div>• <strong>Dedicated Numbers:</strong> Distinct line per location</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">
                    Never lose an after-hours lead
                  </span>
                </div>
              </div>

              {/* Pillar 4: PMS & Custom APIs */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                    Specialized PMS &amp; APIs
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Connect legacy PMS systems or trigger custom webhook automations to external services.
                  </p>
                  <div className="mt-3 space-y-1 text-[10px] text-slate-600 dark:text-slate-300">
                    <div>• <strong>Storage PMS:</strong> SiteLink, StorEDGE, Yardi</div>
                    <div>• <strong>Coworking PMS:</strong> OfficeRnD, Nexudus</div>
                    <div>• <strong>Webhooks &amp; Zapier:</strong> Connect 5,000+ apps</div>
                    <div>• <strong>REST API:</strong> Direct database export / import</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                    Custom connector on request
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Box inside Beyond Storage tab */}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Need a specific hardware controller or software connection?</h4>
                  <p className="text-[11px] text-slate-300">
                    Our integrations engineering team reviews and provisions custom connectors for your business equipment.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReqBizId(activeBusiness.id);
                  setIsRequestModalOpen(true);
                }}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 transition-colors"
              >
                Request Service Connection
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Active Service Requests & Pipeline Tracker */}
        {activeGuideTab === 'request-tracker' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Filter pills & request button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {(['all', 'under_review', 'in_progress', 'connected'] as const).map((filter) => {
                  const label =
                    filter === 'all'
                      ? 'All Requests'
                      : filter === 'under_review'
                      ? 'Under Review'
                      : filter === 'in_progress'
                      ? 'In Progress'
                      : 'Connected';
                  const count =
                    filter === 'all'
                      ? integrationRequests.length
                      : integrationRequests.filter((r) => r.status === filter).length;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setRequestFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        requestFilter === filter
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setReqBizId(activeBusiness.id);
                  setIsRequestModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Integration Request</span>
              </button>
            </div>

            {/* Requests List */}
            {integrationRequests.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">No integration requests yet</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Have a gate controller or accounting tool you need connected? Click below to request it.
                </p>
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(true)}
                  className="mt-3 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold"
                >
                  Submit First Request
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/60">
                {integrationRequests
                  .filter((r) => (requestFilter === 'all' ? true : r.status === requestFilter))
                  .map((req) => {
                    const statusBadge =
                      req.status === 'connected' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          ✓ Connected
                        </span>
                      ) : req.status === 'in_progress' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          ⚙ In Engineering
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          ⏳ Under Review
                        </span>
                      );

                    const priorityBadge =
                      req.priority === 'critical' ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          Critical Blocker
                        </span>
                      ) : req.priority === 'high' ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          High Priority
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Standard
                        </span>
                      );

                    const categoryLabel =
                      req.serviceCategory === 'accounting'
                        ? 'Accounting & Ledger'
                        : req.serviceCategory === 'access-hardware'
                        ? 'Gate & Smart Access'
                        : req.serviceCategory === 'voip-sms'
                        ? 'VoIP & Telephony'
                        : req.serviceCategory === 'pms-software'
                        ? 'Property PMS'
                        : req.serviceCategory === 'automation-api'
                        ? 'Webhooks & API'
                        : 'Custom Tool';

                    return (
                      <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                              {req.ticketNumber}
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {req.toolName}
                            </h4>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              for {req.businessName}
                            </span>
                            {statusBadge}
                            {priorityBadge}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                            {req.notes}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                            <span>Category: {categoryLabel}</span>
                            <span>•</span>
                            <span>Requested: {new Date(req.requestedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <span className="text-[11px] text-slate-400 italic">
                            Tracked in GateDesk SLA
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Modal: Request a New Business Service Connection */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  GateDesk Integrations Pipeline
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Request New Business Service Connection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!reqToolName.trim()) {
                  addToast({ type: 'error', title: 'Please enter the tool or service name' });
                  return;
                }
                submitIntegrationRequest({
                  businessId: reqBizId || activeBusiness.id,
                  serviceCategory: reqCategory,
                  toolName: reqToolName.trim(),
                  priority: reqPriority,
                  notes: reqNotes.trim() || 'Integration request submitted from Business Hub.',
                });
                setReqToolName('');
                setReqNotes('');
                setIsRequestModalOpen(false);
                setActiveGuideTab('request-tracker');
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Business Location *
                </label>
                <select
                  value={reqBizId}
                  onChange={(e) => setReqBizId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  {connectedBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.categoryLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Service Category *
                  </label>
                  <select
                    value={reqCategory}
                    onChange={(e) => setReqCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="accounting">Accounting &amp; Ledger (QuickBooks, Xero)</option>
                    <option value="access-hardware">Gate &amp; Smart Access (DoorKing, Salto)</option>
                    <option value="voip-sms">VoIP &amp; SMS (OpenPhone, Twilio)</option>
                    <option value="pms-software">Property PMS (SiteLink, Yardi)</option>
                    <option value="automation-api">Automation &amp; Webhooks (Zapier)</option>
                    <option value="other">Other Business Tool</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={reqPriority}
                    onChange={(e) => setReqPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="standard">Standard (Next Release)</option>
                    <option value="high">High Priority (Active Needs)</option>
                    <option value="critical">Critical (Operational Blocker)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tool / Hardware / Provider Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DoorKing 1830 Keypad, QuickBooks Online Advanced, Brivo OnAir"
                  value={reqToolName}
                  onChange={(e) => setReqToolName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Workflow Requirements &amp; Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe how data should flow (e.g. automatically lock out keypad PIN when tenant balance exceeds $50, or push monthly rent invoices to QuickBooks)."
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800/60 text-[11px] text-teal-800 dark:text-teal-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>GateDesk SLA:</strong> Once submitted, an integration ticket number will be generated immediately and assigned to our developer queue.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Submit Service Connection Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Multi-Step "Connect New Business" Interactive Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
            {/* Modal Header & Progress */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Step {wizardStep} of 4 · Business Connection Wizard
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {wizardStep === 1 && 'Select Business Industry Category'}
                  {wizardStep === 2 && 'Business Profile & Facility Details'}
                  {wizardStep === 3 && 'Access Hardware & Gate Security'}
                  {wizardStep === 4 && 'Activate Google Suite & Business Tools'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Step Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* STEP 1: Choose Industry */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose the type of business you want to connect. GateDesk configures unit terminology, capacity rules, and standard legal contracts automatically.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUSINESS_PRESETS.map((preset) => {
                      const Icon = preset.icon;
                      const isSelected = selectedType === preset.type;
                      return (
                        <div
                          key={preset.type}
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 ring-1 ring-teal-500 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: preset.color }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                                {preset.title}
                              </h4>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                {preset.unitNoun}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                            {preset.tagline}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: Business Profile */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{
                        backgroundColor:
                          BUSINESS_PRESETS.find((p) => p.type === selectedType)?.color || '#0D9488',
                      }}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">
                        Selected Category
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {BUSINESS_PRESETS.find((p) => p.type === selectedType)?.title}
                      </h4>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Business or Location Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pacific Coast RV Haven or Metro Flex Warehouses"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Physical Property Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 500 Harbor Drive, Suite A"
                        value={bizAddress}
                        onChange={(e) => setBizAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Public Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. (619) 555-0199"
                        value={bizPhone}
                        onChange={(e) => setBizPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Total Capacity / Spaces
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="2000"
                        value={bizUnits}
                        onChange={(e) => setBizUnits(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Operations / Dispatch Email
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. operations@mybusiness.com"
                        value={bizEmail}
                        onChange={(e) => setBizEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Access Hardware */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    GateDesk integrates with your perimeter gates, door controllers, and yard lockboxes. Select the access system used by this business location.
                  </p>

                  <div className="space-y-2">
                    {[
                      'Automated Keypad Gate (Doorking, Linear, LiftMaster)',
                      'Smart Door Locks & PINs (Salto, Kisi, August, Yale)',
                      'RFID Barcode Tag Scanner & Barrier Arm',
                      'Loading Dock Bay Clearance System',
                      'Yard Keybox & Telematics Lock',
                      'Front Desk Intercom & Visitor Check-In',
                    ].map((method) => (
                      <label
                        key={method}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs transition-colors ${
                          bizAccessMethod === method
                            ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-500 text-slate-900 dark:text-white font-semibold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="access_method"
                          checked={bizAccessMethod === method}
                          onChange={() => setBizAccessMethod(method)}
                          className="accent-teal-600"
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Gate Security Policy:</strong> In compliance with security standards, actual master gate PINs are never stored in generated documents or exposed in unauthenticated views. Only access rules and hours are described.
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 4: Activate Google Suite & Tools */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enable the all-in-one business tools for <strong>{bizName || 'New Business'}</strong>:
                  </p>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Google Docs Automated Contract Generator
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Auto-create draft lease agreements & SOPs with attorney review disclaimers.
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={toolGoogleDocs}
                        onChange={(e) => setToolGoogleDocs(e.target.checked)}
                        className="w-4 h-4 accent-teal-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-emerald-500" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Google Calendar Move-In & Booking Sync
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Automatically schedule move-ins, desk reservations, and return reminders.
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={toolGoogleCalendar}
                        onChange={(e) => setToolGoogleCalendar(e.target.checked)}
                        className="w-4 h-4 accent-teal-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
                      <div className="flex items-center gap-3">
                        <PhoneCall className="w-5 h-5 text-teal-500" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            OpenPhone (Quo) & Twilio VoIP Phone Line
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Capture missed gate calls, 2-way SMS responder, and broadcast text campaigns.
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={toolVoIP}
                        onChange={(e) => setToolVoIP(e.target.checked)}
                        className="w-4 h-4 accent-teal-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-purple-500" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            PayPal & Stripe Automated Billing
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Recurring monthly rent/membership dues, online portal, and late fees.
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={toolPayments}
                        onChange={(e) => setToolPayments(e.target.checked)}
                        className="w-4 h-4 accent-teal-600 rounded"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((prev) => ((prev - 1) as any))}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>

                {wizardStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep === 2 && !bizName.trim()) {
                        addToast({ type: 'error', title: 'Please enter business name' });
                        return;
                      }
                      setWizardStep((prev) => ((prev + 1) as any));
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteConnection}
                    className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Connect & Launch Business</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
