'use client';

import React from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import {
  BarChart3,
  Download,
  TrendingUp,
  DollarSign,
  Building,
  CheckCircle2,
  Calendar,
  Share2,
  PhoneCall,
  Gift,
  FileText,
} from 'lucide-react';

export const OwnerReportView: React.FC = () => {
  const { facility, unitTypes, tenants, missedCalls, referrals } = useGateDesk();

  // Metrics
  const totalUnits = facility.totalCapacity || 120;
  const totalEmpty = unitTypes.reduce((acc, u) => acc + (u.unitsAvailable || 0), 0);
  const occupiedUnits = totalUnits - totalEmpty;
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);

  const emptyUnitsValue = unitTypes.reduce(
    (acc, u) => acc + (u.unitsAvailable || 0) * u.monthlyPrice,
    0
  );

  const totalOwed = tenants.reduce((acc, t) => acc + (t.balance || 0), 0);
  const totalCollectedEstimate = occupiedUnits * 145 - totalOwed; // ~$14,790

  const answeredCalls = missedCalls.filter((c) => c.replied).length;
  const totalCalls = missedCalls.length;
  const callRecoveryRate = Math.round((answeredCalls / (totalCalls || 1)) * 100);

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Monthly Owner Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Financial &amp; occupancy snapshot for {facility.name} (November 2026).
          </p>
        </div>

        <button
          onClick={handlePrintPdf}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PDF / Print</span>
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Report Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
              <span>{facility.name}</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-normal">
                Facility ID: {facility.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">{facility.address}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
              Monthly Operational Audit
            </span>
            <span className="text-xs text-slate-400 font-mono">Period: Nov 1 – Nov 30, 2026</span>
          </div>
        </div>

        {/* 6 Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Occupancy Rate
            </span>
            <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-1 font-mono">
              {occupancyRate}%
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {occupiedUnits} of {totalUnits} units rented
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Monthly Vacancy Loss
            </span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
              ${emptyUnitsValue.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {totalEmpty} empty units available
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Collected vs Owed
            </span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
              ${totalCollectedEstimate.toLocaleString()}
            </div>
            <span className="text-[11px] text-rose-500 mt-0.5 block">
              ${totalOwed} outstanding balance
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Move-Ins vs Move-Outs
            </span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
              +4 Net
            </div>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5 block">
              6 move-ins · 2 move-outs
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Tenant Referrals
            </span>
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 font-mono">
              {referrals.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              ${referrals.length * 145} monthly rent secured
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Missed Calls Answered
            </span>
            <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-1 font-mono">
              {callRecoveryRate}%
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {answeredCalls} of {totalCalls} callers followed up
            </span>
          </div>
        </div>

        {/* Simple Charts: Occupancy & Revenue Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Chart 1: Occupancy Trend SVG */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Occupancy Trend (Last 6 Months)
              </span>
              <span className="text-xs font-mono text-teal-600 font-semibold">+6.5% since June</span>
            </div>

            <div className="h-36 w-full flex items-end gap-3 pt-6 pb-2 px-2">
              {[
                { month: 'Jun', pct: 78 },
                { month: 'Jul', pct: 80 },
                { month: 'Aug', pct: 81 },
                { month: 'Sep', pct: 83 },
                { month: 'Oct', pct: 84 },
                { month: 'Nov', pct: 85 },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-slate-500">{bar.pct}%</span>
                  <div
                    className="w-full bg-teal-500 dark:bg-teal-600 rounded-t-md transition-all hover:bg-teal-400"
                    style={{ height: `${bar.pct}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-medium">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Collections & Debt Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Inquiries &amp; Leads by Source
            </span>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Tenant App Referrals</span>
                  <span className="font-mono font-bold">42%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Website &quot;Available Units&quot; Embed</span>
                  <span className="font-mono font-bold">36%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '36%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Quo Phone After-Hours Missed Calls</span>
                  <span className="font-mono font-bold">22%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '22%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>GateDesk · Powered by Retch VisionAI Solution</span>
          <span>Generated for {facility.name}</span>
        </div>
      </div>
    </div>
  );
};
