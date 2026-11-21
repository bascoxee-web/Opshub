'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGateDesk } from '@/context/GateDeskContext';
import { Smartphone, Wand2, Building2, Sun, Moon, Users, ArrowUpRight } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const {
    currentView,
    navigateTo,
    setIsTenantPreviewModalOpen,
    facility,
    availableFacilities,
    switchFacility,
    theme,
    toggleTheme,
  } = useGateDesk();

  return (
    <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800 px-3 py-1.5 flex items-center justify-between gap-3 sticky top-0 z-50 shadow-xs select-none">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="font-semibold text-white tracking-wide shrink-0">Workspace</span>
        <span className="text-slate-600 hidden sm:inline">·</span>
        <span className="text-teal-300 font-medium truncate max-w-[140px] sm:max-w-xs">
          {facility.name}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {availableFacilities.length > 0 && (
          <div className="hidden md:flex items-center gap-1.5 text-slate-300 mr-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={facility.id}
              onChange={(e) => switchFacility(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-xs focus:outline-hidden focus:border-teal-500"
            >
              {availableFacilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.units} units)
                </option>
              ))}
            </select>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-1 px-2 py-0.5 text-teal-300 hover:text-white hover:bg-slate-800 rounded transition-colors font-medium whitespace-nowrap"
          title="Open CreatorDesk Pro — Social Selling, Editing & Team Access Hub"
        >
          <Users className="w-3 h-3" />
          <span>CreatorDesk Pro</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>

        {currentView !== 'wizard' && (
          <button
            onClick={() => navigateTo('wizard')}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Open Setup Wizard"
          >
            <Wand2 className="w-3 h-3 text-teal-400" />
            <span>Setup</span>
          </button>
        )}

        <button
          onClick={() => {
            if (currentView === 'tenant-app') {
              navigateTo('today');
            } else {
              setIsTenantPreviewModalOpen(true);
            }
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded transition-colors text-xs"
        >
          <Smartphone className="w-3 h-3" />
          <span>{currentView === 'tenant-app' ? 'Back to Owner' : 'Client App'}</span>
        </button>

        {!mounted ? (
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors text-xs"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            <span className="w-3 h-3 inline-block shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Theme</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors text-xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle light or dark theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 text-teal-300 shrink-0" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
