'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { PlanTier } from '@/types';
import { PrintablePosterModal } from '@/components/tenant/PrintablePosterModal';
import { WorkspaceSyncModal } from '@/components/owner/WorkspaceSyncModal';
import {
  Settings,
  Building,
  Smartphone,
  Phone,
  Users,
  CreditCard,
  Gift,
  QrCode,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Trash2,
  Plus,
  Flame,
  Cloud,
  Layers,
  FileText,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    facility,
    updateFacility,
    unitTypes,
    updateUnitType,
    staff,
    inviteStaff,
    removeStaff,
    resetDemoData,
    addToast,
    setIsTenantPreviewModalOpen,
    connectedBusinesses,
    switchBusiness,
    navigateTo,
  } = useGateDesk();

  // Facility fields
  const [facName, setFacName] = useState(facility.name);
  const [facPhone, setFacPhone] = useState(facility.phone);
  const [facAddress, setFacAddress] = useState(facility.address);
  const [facOfficeHours, setFacOfficeHours] = useState(facility.officeHours);
  const [facGateHours, setFacGateHours] = useState(facility.gateHours);
  const [facPaymentUrl, setFacPaymentUrl] = useState(facility.paymentPortalUrl);

  // Tenant App Settings
  const [appEnabled, setAppEnabled] = useState(facility.tenantAppSettings.enabled);
  const [appName, setAppName] = useState(facility.tenantAppSettings.appName);
  const [appColor, setAppColor] = useState(facility.tenantAppSettings.brandColor);
  const [appSubdomain, setAppSubdomain] = useState(facility.tenantAppSettings.subdomain);

  // Referral Settings
  const [rewardAmount, setRewardAmount] = useState(facility.referralRewardAmount || 50);

  // Modals
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Staff invite
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'Manager' | 'Assistant'>('Manager');

  const tenantAppUrl = `https://${appSubdomain}.gatedesk.app`;

  const handleSaveFacilityDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateFacility({
      name: facName,
      phone: facPhone,
      address: facAddress,
      officeHours: facOfficeHours,
      gateHours: facGateHours,
      paymentPortalUrl: facPaymentUrl,
      referralRewardAmount: Number(rewardAmount),
      tenantAppSettings: {
        ...facility.tenantAppSettings,
        enabled: appEnabled,
        appName,
        brandColor: appColor,
        subdomain: appSubdomain,
      },
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tenantAppUrl);
    setCopiedLink(true);
    addToast({ type: 'success', title: 'Tenant App URL copied!' });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStaffEmail.trim()) {
      inviteStaff(newStaffName.trim() || newStaffEmail.split('@')[0], newStaffEmail.trim(), newStaffRole);
      setNewStaffEmail('');
      setNewStaffName('');
    }
  };

  const handleChangePlan = (tier: PlanTier) => {
    const prices: Record<PlanTier, number> = { Starter: 49, Growth: 129, Managed: 299 };
    updateFacility({
      plan: {
        ...facility.plan,
        tier,
        price: prices[tier],
      },
    });
    setIsChangePlanModalOpen(false);
    addToast({ type: 'success', title: `Plan changed to ${tier} ($${prices[tier]}/mo)` });
  };

  const handleCancelSubscription = () => {
    setIsCancelModalOpen(false);
    addToast({
      type: 'info',
      title: 'Subscription cancellation scheduled',
      message: 'Your access remains active through the end of the billing period.',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Facility Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage contact hours, branded Tenant App, phone line connection, and subscription.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('business-hub')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Connected Businesses ({connectedBusinesses.length})</span>
          </button>
          <button
            onClick={() => setIsWorkspaceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
            <span>Workspace Sync</span>
          </button>
        </div>
      </div>

      {/* MULTI-BUSINESS PORTFOLIO CONNECTIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Multi-Business Network & Integrations
              </h3>
              <p className="text-xs text-slate-400">
                You have {connectedBusinesses.length} businesses connected to your GateDesk account.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('business-hub')}
            className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <span>Manage in Business Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {connectedBusinesses.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                facility.id === b.id
                  ? 'bg-slate-800/90 border-teal-500 text-white font-semibold'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="truncate pr-2">
                <div className="truncate font-bold">{b.name}</div>
                <div className="text-[10px] text-teal-400 truncate">{b.categoryLabel}</div>
              </div>
              {facility.id === b.id ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-500 text-slate-950 font-bold shrink-0">
                  Active
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => switchBusiness(b.id)}
                  className="px-2 py-0.5 rounded-md text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 shrink-0 font-medium"
                >
                  Switch
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 1: TENANT APP SETTINGS (PART B) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-teal-500/80 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Branded Tenant App (PWA) Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Custom web application distributed to your facility&apos;s renters.
              </p>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {appEnabled ? 'App Active' : 'App Disabled'}
            </span>
            <button
              type="button"
              onClick={() => setAppEnabled(!appEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                appEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  appEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Live URL & Action Strip */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Tenant App Web Address:
            </span>
            <span className="text-sm font-mono font-bold text-teal-600 dark:text-teal-400">
              {tenantAppUrl}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPosterModalOpen(true)}
              className="px-3.5 py-1.5 bg-slate-900 dark:bg-teal-600 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>QR Poster Generator</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTenantPreviewModalOpen(true)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Interactive Phone Preview</span>
            </button>
          </div>
        </div>

        {/* Tenant App Customization Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Tenant App Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Subdomain</label>
            <div className="flex items-center">
              <input
                type="text"
                value={appSubdomain}
                onChange={(e) => setAppSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full px-3 py-2 border rounded-l-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
              <span className="px-2.5 py-2 bg-slate-100 dark:bg-slate-700 border-y border-r border-slate-300 dark:border-slate-700 rounded-r-xl text-slate-500 font-mono">
                .gatedesk.app
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Brand Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={appColor}
                onChange={(e) => setAppColor(e.target.value)}
                className="w-10 h-9 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={appColor}
                onChange={(e) => setAppColor(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: FACILITY DETAILS & HOURS */}
      <form onSubmit={handleSaveFacilityDetails} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Facility Details &amp; Operating Hours
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Updated information propagates immediately to tenant apps and SMS replies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Facility Name</label>
            <input
              type="text"
              required
              value={facName}
              onChange={(e) => setFacName(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Primary Phone Number</label>
            <input
              type="text"
              required
              value={facPhone}
              onChange={(e) => setFacPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">Address</label>
            <input
              type="text"
              value={facAddress}
              onChange={(e) => setFacAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Office Hours</label>
            <input
              type="text"
              value={facOfficeHours}
              onChange={(e) => setFacOfficeHours(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Gate Hours</label>
            <input
              type="text"
              value={facGateHours}
              onChange={(e) => setFacGateHours(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">Existing Payment Portal URL</label>
            <input
              type="url"
              value={facPaymentUrl}
              onChange={(e) => setFacPaymentUrl(e.target.value)}
              placeholder="https://yourstoragepayments.com"
              className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Tenant Referral Reward ($ Credit)</label>
            <input
              type="number"
              min="0"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
          >
            Save All Settings
          </button>
        </div>
      </form>

      {/* SECTION 3: UNIT PRICING & INVENTORY */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Unit Types &amp; Monthly Rates
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Adjust monthly pricing and available unit counts.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Size</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Monthly Rate</th>
                <th className="py-2.5 px-4">Total Units</th>
                <th className="py-2.5 px-4">Vacant Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {unitTypes.map((u) => (
                <tr key={u.id}>
                  <td className="py-2.5 px-4 font-bold">{u.size}</td>
                  <td className="py-2.5 px-4 text-slate-500">
                    {u.climateControlled ? 'Climate Controlled' : 'Drive-up / Standard'}
                  </td>
                  <td className="py-2.5 px-4">
                    <input
                      type="number"
                      value={u.monthlyPrice}
                      onChange={(e) => updateUnitType(u.id, { monthlyPrice: Number(e.target.value) })}
                      className="w-20 px-2 py-1 text-xs border rounded-lg bg-white dark:bg-slate-800 font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <input
                      type="number"
                      value={u.totalUnits}
                      onChange={(e) => updateUnitType(u.id, { totalUnits: Number(e.target.value) })}
                      className="w-20 px-2 py-1 text-xs border rounded-lg bg-white dark:bg-slate-800 font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <input
                      type="number"
                      value={u.unitsAvailable}
                      onChange={(e) => updateUnitType(u.id, { unitsAvailable: Number(e.target.value) })}
                      className="w-20 px-2 py-1 text-xs border rounded-lg bg-white dark:bg-slate-800 font-mono text-teal-600 font-bold"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: STAFF & ROLES */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Staff &amp; Roles
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Team members with access to the Gate Desk operations console.
          </p>
        </div>

        <form onSubmit={handleAddStaff} className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
          <input
            type="text"
            required
            placeholder="Name"
            value={newStaffName}
            onChange={(e) => setNewStaffName(e.target.value)}
            className="px-3 py-1.5 border rounded-lg bg-white dark:bg-slate-800"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={newStaffEmail}
            onChange={(e) => setNewStaffEmail(e.target.value)}
            className="px-3 py-1.5 border rounded-lg bg-white dark:bg-slate-800 flex-1 min-w-[180px]"
          />
          <select
            value={newStaffRole}
            onChange={(e) => setNewStaffRole(e.target.value as any)}
            className="px-3 py-1.5 border rounded-lg bg-white dark:bg-slate-800"
          >
            <option value="Manager">Manager</option>
            <option value="Assistant">Assistant</option>
          </select>
          <button
            type="submit"
            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold"
          >
            Invite
          </button>
        </form>

        <div className="space-y-2">
          {staff.map((s) => (
            <div key={s.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white mr-2">{s.name}</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                  {s.role}
                </span>
                <span className="text-slate-400 text-[11px] block mt-0.5">{s.email}</span>
              </div>
              {s.role !== 'Owner' && (
                <button onClick={() => removeStaff(s.id)} className="text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: PLAN & BILLING */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              GateDesk Plan &amp; Billing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active subscription for {facility.name}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChangePlanModalOpen(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold"
            >
              Change Plan
            </button>
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 rounded-lg text-xs"
            >
              Cancel Subscription
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-slate-500 block">Current Plan:</span>
            <span className="text-base font-extrabold text-teal-600 dark:text-teal-400 mt-0.5 block">
              GateDesk {facility.plan.tier}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-slate-500 block">Monthly Rate:</span>
            <span className="text-base font-mono font-extrabold text-slate-900 dark:text-white mt-0.5 block">
              ${facility.plan.price}.00 / month
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-slate-500 block">Next Renewal Date:</span>
            <span className="text-base font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {facility.plan.nextPaymentDate}
            </span>
          </div>
        </div>

        {/* Clear workspace button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Clear Local Workspace Data</span>
            <span className="text-slate-400 text-[11px]">Remove all locally saved workspace records on this browser.</span>
          </div>
          <button
            onClick={resetDemoData}
            className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Data</span>
          </button>
        </div>
      </div>

      {/* Change Plan Modal */}
      {isChangePlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 text-xs space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold">Switch GateDesk Subscription</h3>
            <p className="text-slate-500">Pick a new plan. Upgrades and downgrades are pro-rated automatically.</p>

            <div className="space-y-3">
              {[
                { tier: 'Starter', price: 49, desc: 'Gate Help inbox & missed call recovery' },
                { tier: 'Growth', price: 129, desc: 'Includes Branded Tenant App & Referral Tracker' },
                { tier: 'Managed', price: 299, desc: 'We run it for you + dedicated monthly check-ins' },
              ].map((p) => (
                <div key={p.tier} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm block">{p.tier} (${p.price}/mo)</span>
                    <span className="text-slate-500 text-[11px]">{p.desc}</span>
                  </div>
                  <button
                    onClick={() => handleChangePlan(p.tier as any)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs"
                  >
                    Select {p.tier}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsChangePlanModalOpen(false)}
                className="px-4 py-2 border rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 text-xs space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-rose-600">Cancel GateDesk Subscription?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure? Your missed-call alerts, live available units embed, and branded Tenant App will be disabled at the end of the current billing period on {facility.plan.nextPaymentDate}.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-semibold"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Poster Modal */}
      <PrintablePosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
      />

      {/* Google Workspace Modal */}
      <WorkspaceSyncModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />
    </div>
  );
};
