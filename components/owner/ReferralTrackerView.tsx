'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { ReferralStatus } from '@/types';
import { Gift, Plus, CheckCircle2, DollarSign, Clock, Check, Users } from 'lucide-react';

export const ReferralTrackerView: React.FC = () => {
  const { referrals, recordReferral, updateReferralStatus, facility, tenants } = useGateDesk();
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // New referral form state
  const [referrerName, setReferrerName] = useState('');
  const [referrerUnit, setReferrerUnit] = useState('');
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [unitRented, setUnitRented] = useState('');
  const [rewardAmount, setRewardAmount] = useState(facility.referralRewardAmount || 50);

  // Calculation
  const rewardsDue = referrals.filter((r) => r.status === 'Reward due');
  const totalRewardsDue = rewardsDue.reduce((sum, r) => sum + r.rewardAmount, 0);

  const rewardsApplied = referrals.filter((r) => r.status === 'Reward applied');
  const totalRewardsApplied = rewardsApplied.reduce((sum, r) => sum + r.rewardAmount, 0);

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTenantName.trim()) {
      recordReferral({
        referrerName,
        referrerUnit,
        newTenantName: newTenantName.trim(),
        newTenantPhone: newTenantPhone.trim() || '(619) 555-0000',
        unitRented,
        rewardAmount: Number(rewardAmount),
      });
      setNewTenantName('');
      setNewTenantPhone('');
      setIsRecordModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Referral Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track word-of-mouth renter referrals from your Tenant App and apply rent credits.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Referral</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Rewards Due
            </span>
            <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-1 tabular-nums font-mono">
              ${totalRewardsDue}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {rewardsDue.length} tenants waiting for next rent credit
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Referrals Recorded
            </span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums font-mono">
              {referrals.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Avg reward: ${facility.referralRewardAmount || 50} per move-in
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Credits Already Applied
            </span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums font-mono">
              ${totalRewardsApplied}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Applied directly to monthly invoices
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            All Referral Activity
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Facility Reward Rule: ${facility.referralRewardAmount || 50} rent credit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Referrer (Tenant)</th>
                <th className="py-3 px-4">New Renter</th>
                <th className="py-3 px-4">Unit Rented</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Reward Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {referrals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{r.referrerName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">Unit {r.referrerUnit}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{r.newTenantName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{r.newTenantPhone}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-medium">{r.unitRented}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{r.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                    ${r.rewardAmount}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Reward due'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : r.status === 'Reward applied'
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <select
                      value={r.status}
                      onChange={(e) => updateReferralStatus(r.id, e.target.value as ReferralStatus)}
                      className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                    >
                      <option value="Pending first payment">Pending first payment</option>
                      <option value="Reward due">Reward due</option>
                      <option value="Reward applied">Reward applied ✓</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Referral Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold">Record Tenant Referral</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Log a referral made by an existing tenant to trigger their reward credit.
            </p>

            <form onSubmit={handleRecordSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Referring Tenant</label>
                <select
                  value={`${referrerName}|${referrerUnit}`}
                  onChange={(e) => {
                    const [n, u] = e.target.value.split('|');
                    setReferrerName(n);
                    setReferrerUnit(u);
                  }}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={`${t.name}|${t.unit}`}>
                      {t.name} (Unit {t.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">New Renter Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jason Bourne"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">New Renter Phone</label>
                <input
                  type="text"
                  placeholder="(619) 555-0000"
                  value={newTenantPhone}
                  onChange={(e) => setNewTenantPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Unit Rented</label>
                  <input
                    type="text"
                    value={unitRented}
                    onChange={(e) => setUnitRented(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Reward ($)</label>
                  <input
                    type="number"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Record Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
