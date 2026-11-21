'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { ViewMode } from '@/types';
import {
  Building2,
  PhoneCall,
  MessageSquare,
  Gift,
  MoreHorizontal,
  Send,
  CalendarCheck2,
  BarChart3,
  Settings,
  Smartphone,
  X,
  Layers,
  FileText,
} from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const { currentView, navigateTo, missedCalls, helpRequests, reservations, setIsTenantPreviewModalOpen } = useGateDesk();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const pendingCallsCount = missedCalls.filter((mc) => !mc.replied).length;
  const openTicketsCount = helpRequests.filter((t) => t.status !== 'Resolved').length;

  const isOwnerView = [
    'today',
    'business-hub',
    'gate-help',
    'help-requests',
    'documents',
    'referrals',
    'campaigns',
    'reservations',
    'report',
    'settings',
  ].includes(currentView);

  if (!isOwnerView) return null;

  return (
    <>
      {/* Fixed bottom tabs on mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white flex items-center justify-around py-2 px-1 shadow-lg select-none">
        <button
          onClick={() => navigateTo('today')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
            currentView === 'today' ? 'text-teal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Today</span>
        </button>

        <button
          onClick={() => navigateTo('gate-help')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors relative ${
            currentView === 'gate-help' ? 'text-teal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <PhoneCall className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Gate Help</span>
          {pendingCallsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => navigateTo('help-requests')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors relative ${
            currentView === 'help-requests' ? 'text-teal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Help</span>
          {openTicketsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-teal-400" />
          )}
        </button>

        <button
          onClick={() => navigateTo('referrals')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
            currentView === 'referrals' ? 'text-teal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Gift className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Referrals</span>
        </button>

        <button
          onClick={() => setIsMoreOpen(true)}
          className="flex flex-col items-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-white"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* More Bottom Sheet Drawer */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 w-full max-w-lg text-white space-y-3 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Additional Tools
              </span>
              <button onClick={() => setIsMoreOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  navigateTo('business-hub');
                  setIsMoreOpen(false);
                }}
                className="p-3 bg-slate-800 rounded-xl text-left flex items-center gap-2.5 font-medium hover:bg-slate-700"
              >
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Business Hub</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('documents');
                  setIsMoreOpen(false);
                }}
                className="p-3 bg-slate-800 rounded-xl text-left flex items-center gap-2.5 font-medium hover:bg-slate-700"
              >
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Documents</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('campaigns');
                  setIsMoreOpen(false);
                }}
                className="p-3 bg-slate-800 rounded-xl text-left flex items-center gap-2.5 font-medium hover:bg-slate-700"
              >
                <Send className="w-4 h-4 text-teal-400" />
                <span>Text Campaigns</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('reservations');
                  setIsMoreOpen(false);
                }}
                className="p-3 bg-slate-800 rounded-xl text-left flex items-center gap-2.5 font-medium hover:bg-slate-700"
              >
                <CalendarCheck2 className="w-4 h-4 text-teal-400" />
                <span>Reservations</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('report');
                  setIsMoreOpen(false);
                }}
                className="p-3 bg-slate-800 rounded-xl text-left flex items-center gap-2.5 font-medium hover:bg-slate-700"
              >
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <span>Owner Report</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('settings');
                  setIsMoreOpen(false);
                }}
                className="p-3 bg-slate-800 rounded-xl text-left flex items-center gap-2.5 font-medium hover:bg-slate-700"
              >
                <Settings className="w-4 h-4 text-teal-400" />
                <span>Settings</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsMoreOpen(false);
                setIsTenantPreviewModalOpen(true);
              }}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch Tenant App Simulator</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
