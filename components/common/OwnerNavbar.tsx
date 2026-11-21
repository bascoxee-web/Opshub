'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { ViewMode } from '@/types';
import {
  Building2,
  PhoneCall,
  MessageSquare,
  Gift,
  Send,
  CalendarCheck2,
  BarChart3,
  Settings,
  Smartphone,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Plus,
  FileText,
  Layers,
  Car,
  Laptop,
  Warehouse,
  Tractor,
} from 'lucide-react';

function BusinessIcon({ type, className }: { type?: string; className?: string }) {
  switch (type) {
    case 'rv-boat-storage':
      return <Car className={className} />;
    case 'coworking-office':
      return <Laptop className={className} />;
    case 'warehouse-flex':
      return <Warehouse className={className} />;
    case 'equipment-rental':
      return <Tractor className={className} />;
    default:
      return <Building2 className={className} />;
  }
}

export const OwnerNavbar: React.FC = () => {
  const {
    currentView,
    navigateTo,
    missedCalls,
    helpRequests,
    reservations,
    facility,
    availableFacilities,
    switchFacility,
    addNewFacility,
    connectedBusinesses,
    activeBusiness,
    switchBusiness,
    currentUser,
    logout,
    setIsTenantPreviewModalOpen,
  } = useGateDesk();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);
  const [isNewFacilityModalOpen, setIsNewFacilityModalOpen] = useState(false);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newFacilityUnits, setNewFacilityUnits] = useState(100);

  // Badge calculations
  const pendingCallsCount = missedCalls.filter((mc) => !mc.replied).length;
  const urgentCallsCount = missedCalls.filter((mc) => !mc.replied && mc.waitingMinutes >= 5).length;
  const openTicketsCount = helpRequests.filter((t) => t.status !== 'Resolved').length;
  const newReservationsCount = reservations.filter((r) => r.status === 'New').length;

  const navItems: Array<{ id: ViewMode; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; badgeColor?: string }> = [
    { id: 'today', label: 'Today', icon: Building2 },
    {
      id: 'business-hub',
      label: 'Business Hub',
      icon: Layers,
      badge: connectedBusinesses.length,
      badgeColor: 'bg-teal-500 text-slate-950 font-bold',
    },
    {
      id: 'gate-help',
      label: 'Gate Help',
      icon: PhoneCall,
      badge: pendingCallsCount,
      badgeColor: urgentCallsCount > 0 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-teal-600 text-white',
    },
    {
      id: 'help-requests',
      label: 'Help Requests',
      icon: MessageSquare,
      badge: openTicketsCount,
      badgeColor: 'bg-slate-700 text-slate-200',
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
    },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'campaigns', label: 'Campaigns', icon: Send },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: CalendarCheck2,
      badge: newReservationsCount,
      badgeColor: 'bg-teal-600 text-white',
    },
    { id: 'report', label: 'Report', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleCreateFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFacilityName.trim()) {
      addNewFacility(newFacilityName.trim(), Number(newFacilityUnits) || 100);
      setNewFacilityName('');
      setIsNewFacilityModalOpen(false);
      setIsFacilityDropdownOpen(false);
    }
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-[31px] z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left Zone: Brand + Business Switcher */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigateTo('today')}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-teal-400 transition-colors">
                  GD
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-tight leading-none text-white">
                    GateDesk
                  </span>
                  <span className="text-[10px] text-teal-400 font-medium tracking-wide uppercase">
                    All-in-One Business OS
                  </span>
                </div>
              </button>

              {/* Multi-Business Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFacilityDropdownOpen(!isFacilityDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors max-w-[190px] sm:max-w-[240px]"
                >
                  <BusinessIcon type={facility.businessType} className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{facility.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {isFacilityDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                      <span>Your Connected Businesses</span>
                      <button
                        onClick={() => {
                          setIsFacilityDropdownOpen(false);
                          navigateTo('business-hub');
                        }}
                        className="text-teal-400 hover:text-teal-300 normal-case font-semibold text-[11px]"
                      >
                        Hub ↗
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto py-1">
                      {connectedBusinesses.map((b) => {
                        const isCurrent = facility.id === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              switchBusiness(b.id);
                              setIsFacilityDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                              isCurrent ? 'text-teal-400 font-semibold bg-slate-800/60' : 'text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <BusinessIcon type={b.businessType} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <div className="truncate">
                                <div className="truncate font-medium">{b.name}</div>
                                <div className="text-[10px] text-slate-500 truncate">{b.categoryLabel}</div>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                              {b.units} {b.unitNoun.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-800 mt-1 pt-1.5 px-2 pb-1 space-y-1">
                      <button
                        onClick={() => {
                          setIsFacilityDropdownOpen(false);
                          navigateTo('business-hub');
                        }}
                        className="w-full px-2.5 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                      >
                        <Layers className="w-3.5 h-3.5 text-teal-400" />
                        <span>Connected Businesses Hub</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsFacilityDropdownOpen(false);
                          navigateTo('business-hub');
                        }}
                        className="w-full px-2.5 py-1.5 text-left text-xs text-teal-400 hover:bg-slate-800 rounded-lg flex items-center gap-2 font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Connect Another Business</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`ml-1 px-1.5 py-0.2 text-[10px] rounded-full leading-tight ${
                          item.badgeColor || 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Zone */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setIsTenantPreviewModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 rounded-lg text-xs font-medium transition-colors"
                title="Launch Tenant App Preview"
              >
                <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                <span>Tenant App</span>
              </button>

              <button
                onClick={logout}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition-colors"
                title="Sign out of GateDesk"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{currentUser?.name || 'Sign out'}</span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateTo(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-teal-400" />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        item.badgeColor || 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsTenantPreviewModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-teal-400 text-sm font-medium"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open Tenant App</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-red-400 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Add New Facility Modal */}
      {isNewFacilityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-900 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Add Storage Facility</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a second location to manage all gate inquiries and tenant apps from one account.
            </p>
            <form onSubmit={handleCreateFacility} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facility Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harbor View Self Storage"
                  value={newFacilityName}
                  onChange={(e) => setNewFacilityName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Storage Units
                </label>
                <input
                  type="number"
                  min="5"
                  max="2000"
                  required
                  value={newFacilityUnits}
                  onChange={(e) => setNewFacilityUnits(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFacilityModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium shadow-xs"
                >
                  Add Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
