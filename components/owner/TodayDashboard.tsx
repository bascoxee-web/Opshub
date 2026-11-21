'use client';

import React from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import {
  PhoneCall,
  MessageSquare,
  Building,
  AlertTriangle,
  Gift,
  CalendarCheck2,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Smartphone,
  ChevronRight,
  Send,
  Layers,
  FileText,
} from 'lucide-react';
import { FacilityMapVisualization } from '@/components/owner/FacilityMapVisualization';

export const TodayDashboard: React.FC = () => {
  const {
    facility,
    connectedBusinesses,
    missedCalls,
    helpRequests,
    unitTypes,
    tenants,
    referrals,
    reservations,
    navigateTo,
    setIsTenantPreviewModalOpen,
    isCalendarConnected,
  } = useGateDesk();

  // Metrics calculations
  const pendingCalls = missedCalls.filter((mc) => !mc.replied);
  const urgentCalls = pendingCalls.filter((mc) => mc.waitingMinutes >= 5);
  const openHelp = helpRequests.filter((h) => h.status !== 'Resolved');

  // Empty units & monthly vacancy value
  const totalEmptyUnits = unitTypes.reduce((acc, u) => acc + (u.unitsAvailable || 0), 0);
  const totalVacancyValue = unitTypes.reduce(
    (acc, u) => acc + (u.unitsAvailable || 0) * u.monthlyPrice,
    0
  );

  // Late tenant balance
  const lateTenants = tenants.filter((t) => t.balance > 0);
  const totalMoneyOwed = lateTenants.reduce((acc, t) => acc + t.balance, 0);

  // Rewards due
  const rewardsDue = referrals.filter((r) => r.status === 'Reward due');
  const totalRewardsDue = rewardsDue.reduce((acc, r) => acc + r.rewardAmount, 0);

  // New reservations
  const newReservations = reservations.filter((r) => r.status === 'New');

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Multi-Business Portfolio Status Bar */}
      {connectedBusinesses && connectedBusinesses.length > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
            <span className="text-slate-300">
              <strong className="text-white">Multi-Business Command:</strong> You have{' '}
              <strong className="text-teal-400">{connectedBusinesses.length} businesses</strong> connected. Active workspace: <span className="text-white font-medium">{facility.name}</span> ({facility.businessCategoryLabel || 'Self-Storage'}).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('business-hub')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Switch / Connect Business</span>
            </button>
            <button
              onClick={() => navigateTo('documents')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Docs</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Banner & Quick Action Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Today at {facility.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold">
              {facility.businessCategoryLabel || 'Live OS'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access: {facility.accessType || facility.gateHours} · Quo phone active
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsTenantPreviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors border border-slate-300 dark:border-slate-700"
          >
            <Smartphone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Open Tenant App</span>
          </button>

          <button
            onClick={() => navigateTo('campaigns')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Text Blast</span>
          </button>
        </div>
      </div>

      {/* 6 Key Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Missed Calls Waiting */}
        <div
          onClick={() => navigateTo('gate-help')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between ${
            pendingCalls.length > 0
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Gate Help Inbox
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums font-mono">
                {pendingCalls.length}
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              urgentCalls.length > 0 ? 'bg-amber-500 text-slate-950 animate-bounce' : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
            }`}>
              <PhoneCall className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
            {urgentCalls.length > 0 ? (
              <span className="text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {urgentCalls.length} waiting &gt; 5 mins!
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                {pendingCalls.length === 0 ? 'All calls answered ✓' : 'Awaiting quick reply'}
              </span>
            )}
            <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-0.5">
              Open inbox &rarr;
            </span>
          </div>
        </div>

        {/* Card 2: Open Help Requests */}
        <div
          onClick={() => navigateTo('help-requests')}
          className="cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Open Help Requests
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums font-mono">
                {openHelp.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Gate, billing &amp; maintenance tickets</span>
            <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-0.5">
              Review tickets &rarr;
            </span>
          </div>
        </div>

        {/* Card 3: Empty Units & Monthly Value */}
        <div
          onClick={() => navigateTo('settings')}
          className="cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Empty Units &amp; Monthly Value
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums font-mono">
                  {totalEmptyUnits}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  (${totalVacancyValue.toLocaleString()}/mo value)
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{(120 - totalEmptyUnits)} of 120 occupied ({Math.round(((120 - totalEmptyUnits) / 120) * 100)}%)</span>
            <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-0.5">
              Inventory &rarr;
            </span>
          </div>
        </div>

        {/* Card 4: Money Owed by Late Tenants */}
        <div
          onClick={() => navigateTo('settings')}
          className="cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Money Owed by Late Tenants
              </span>
              <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 tabular-nums font-mono">
                ${totalMoneyOwed}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{lateTenants.length} tenants past due (overlocked)</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              View roster &rarr;
            </span>
          </div>
        </div>

        {/* Card 5: New Referrals This Month */}
        <div
          onClick={() => navigateTo('referrals')}
          className="cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                New Referrals This Month
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums font-mono">
                  {referrals.length}
                </span>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold font-mono">
                  (${totalRewardsDue} rewards due)
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{rewardsDue.length} pending owner rent credit</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">
              Apply credits &rarr;
            </span>
          </div>
        </div>

        {/* Card 6: New Unit Reservations */}
        <div
          onClick={() => navigateTo('reservations')}
          className="cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                New Unit Reservations
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums font-mono">
                {newReservations.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              {isCalendarConnected ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  📅 Calendar Sync Active
                </span>
              ) : (
                <span>From website &amp; tenant app</span>
              )}
            </span>
            <span className="text-teal-600 dark:text-teal-400 font-semibold">
              Manage holds &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Priority Action Row: Immediate Unanswered Calls */}
      {pendingCalls.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-amber-300 dark:border-amber-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Calls &amp; Texts Waiting for Owner Reply
              </h3>
            </div>
            <button
              onClick={() => navigateTo('gate-help')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Go to Gate Help Inbox &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingCalls.slice(0, 3).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded text-[11px] font-mono font-bold ${
                    item.waitingMinutes >= 10
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : item.waitingMinutes >= 5
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {item.waitingMinutes}m ago
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{item.callerName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Unit {item.unit}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded capitalize ${
                        item.tenantStatus === 'locked out'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {item.tenantStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md mt-0.5">
                      {item.messageSnippet || 'Missed incoming voice call.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigateTo('gate-help')}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs shadow-xs shrink-0"
                >
                  Reply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Facility Floor Plan & Occupancy Map */}
      <FacilityMapVisualization />
    </div>
  );
};
