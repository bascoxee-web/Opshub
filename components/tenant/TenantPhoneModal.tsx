'use client';

import React from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { TenantAppView } from '@/components/tenant/TenantAppView';
import { X, Smartphone, ExternalLink } from 'lucide-react';

export const TenantPhoneModal: React.FC = () => {
  const { isTenantPreviewModalOpen, setIsTenantPreviewModalOpen, navigateTo } = useGateDesk();

  if (!isTenantPreviewModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative my-auto flex flex-col items-center">
        {/* Top Control Bar */}
        <div className="w-full max-w-sm flex items-center justify-between pb-3 px-2 text-white">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold">Interactive Tenant Phone Simulator</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsTenantPreviewModalOpen(false);
                navigateTo('tenant-app');
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] rounded-lg text-teal-300 flex items-center gap-1"
              title="Open standalone full screen view"
            >
              <span>Full Screen</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsTenantPreviewModalOpen(false)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Physical Smartphone Casing */}
        <div className="relative w-[340px] sm:w-[380px] h-[640px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 ring-2 ring-slate-800 overflow-hidden flex flex-col">
          {/* Top Speaker & Camera Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-full flex items-center justify-center gap-2 z-40 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
            <div className="w-10 h-1 bg-slate-800 rounded-full" />
          </div>

          {/* Screen Content */}
          <div className="w-full h-full rounded-[38px] overflow-hidden flex flex-col bg-slate-900">
            <TenantAppView isStandalone={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
