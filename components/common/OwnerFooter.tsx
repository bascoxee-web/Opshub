'use client';

import React from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { ShieldCheck, PhoneCall, Gift, Smartphone } from 'lucide-react';

export const OwnerFooter: React.FC = () => {
  const { navigateTo } = useGateDesk();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-sm">
              GD
            </div>
            <span className="font-semibold text-white tracking-tight">GateDesk</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">Self-Storage Front Desk & Tenant App</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => navigateTo('gate-help')}
              className="hover:text-teal-400 transition-colors flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Missed Call Alerts
            </button>
            <button
              onClick={() => navigateTo('referrals')}
              className="hover:text-teal-400 transition-colors flex items-center gap-1"
            >
              <Gift className="w-3.5 h-3.5" /> Referral Tracker
            </button>
            <button
              onClick={() => navigateTo('tenant-app')}
              className="hover:text-teal-400 transition-colors flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" /> Branded Tenant App
            </button>
            <button
              onClick={() => navigateTo('pricing')}
              className="hover:text-teal-400 transition-colors"
            >
              Plans & Pricing
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p className="font-medium text-slate-300">
            GateDesk · Powered by Retch VisionAI Solution
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> TCPA & 10DLC Compliant
            </span>
            <span>·</span>
            <span>Month-to-month, cancel anytime</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
