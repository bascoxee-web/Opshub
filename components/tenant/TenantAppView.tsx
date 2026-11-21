'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { TicketCategory } from '@/types';
import {
  Home,
  HelpCircle,
  Gift,
  Grid,
  CreditCard,
  PhoneCall,
  MapPin,
  Clock,
  KeyRound,
  ShieldAlert,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Bell,
  Smartphone,
  ChevronRight,
  ExternalLink,
  Send,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';

export const TenantAppView: React.FC<{ isStandalone?: boolean }> = ({ isStandalone = false }) => {
  const {
    facility,
    activeTenant,
    setActiveTenant,
    tenants,
    tenantTab,
    setTenantTab,
    tenantNotifications,
    setTenantNotifications,
    createHelpTicket,
    referrals,
    createReservation,
    unitTypes,
    addToast,
    navigateTo,
    setIsTenantPreviewModalOpen,
  } = useGateDesk();

  // "Add to Home Screen" guide modal
  const [showA2HSGuide, setShowA2HSGuide] = useState(false);
  const [a2hsPlatform, setA2hsPlatform] = useState<'ios' | 'android'>('ios');

  // Help form state
  const [helpCategory, setHelpCategory] = useState<TicketCategory>('gate');
  const [helpSubject, setHelpSubject] = useState('');
  const [helpMessage, setHelpMessage] = useState('');
  const [helpSubmittedTicketNum, setHelpSubmittedTicketNum] = useState<string | null>(null);

  // Reservation modal state
  const [reserveUnitSize, setReserveUnitSize] = useState<string | null>(null);
  const [resMoveInDate, setResMoveInDate] = useState('2026-11-20');
  const [resSuccess, setResSuccess] = useState(false);

  // Referral share copy
  const [copiedRef, setCopiedRef] = useState(false);

  const tenantAppUrl = `https://${facility.tenantAppSettings.subdomain}.gatedesk.app`;
  const personalRefCode = activeTenant.name.replace(/\s+/g, '').toUpperCase().substring(0, 6) + activeTenant.unit.replace(/[^0-9]/g, '');
  const personalRefLink = `${tenantAppUrl}/ref/${personalRefCode.toLowerCase()}`;

  // My personal referrals
  const myReferrals = referrals.filter(
    (r) =>
      r.referrerName.toLowerCase() === activeTenant.name.toLowerCase() ||
      r.referrerUnit === activeTenant.unit
  );

  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (helpMessage.trim()) {
      const ticketNum = createHelpTicket({
        tenantName: activeTenant.name,
        phone: activeTenant.phone,
        unit: activeTenant.unit,
        category: helpCategory,
        source: 'Tenant App',
        subject: helpSubject.trim() || `${helpCategory.toUpperCase()} assistance request`,
        message: helpMessage.trim(),
      });
      setHelpSubmittedTicketNum(ticketNum);
      setHelpMessage('');
      setHelpSubject('');
    }
  };

  const handleShareReferral = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Rent storage at ${facility.name}`,
          text: `Use my code ${personalRefCode} to get $25 off your first month at ${facility.name}!`,
          url: personalRefLink,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Get $25 off your storage unit at ${facility.name} using my referral code: ${personalRefCode} — ${personalRefLink}`
      );
      setCopiedRef(true);
      addToast({ type: 'success', title: 'Referral link & code copied!' });
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reserveUnitSize) {
      createReservation({
        customerName: activeTenant.name,
        phone: activeTenant.phone,
        email: activeTenant.email,
        unitSize: reserveUnitSize,
        moveInDate: resMoveInDate,
        source: 'Tenant App',
        notes: `Additional unit reserved by existing tenant in ${activeTenant.unit}.`,
      });
      setResSuccess(true);
      setTimeout(() => {
        setResSuccess(false);
        setReserveUnitSize(null);
      }, 3000);
    }
  };

  return (
    <div
      className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-teal-500 font-sans ${
        isStandalone ? 'max-w-md mx-auto shadow-2xl min-h-screen border-x border-slate-800' : 'w-full'
      }`}
      style={{
        // Dynamic brand color accent
        ['--brand' as any]: facility.tenantAppSettings.brandColor || '#0D9488',
      }}
    >
      {/* Top Tenant Navigation Bar */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-slate-950 shadow-md shrink-0"
            style={{ backgroundColor: facility.tenantAppSettings.brandColor || '#0D9488' }}
          >
            {facility.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold text-white truncate max-w-[170px] sm:max-w-xs">
              {facility.tenantAppSettings.appName || `${facility.name} Tenant App`}
            </h2>
            <span className="text-[10px] text-teal-400 font-mono block">
              Unit {activeTenant.unit} · {activeTenant.name.split(' ')[0]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Tenant Switcher (For Demo convenience) */}
          <select
            value={activeTenant.id}
            onChange={(e) => {
              const t = tenants.find((item) => item.id === e.target.value);
              if (t) setActiveTenant(t);
            }}
            className="bg-slate-800 text-slate-300 border border-slate-700 text-[11px] rounded-lg px-2 py-1 max-w-[110px]"
            title="Switch demo tenant profile"
          >
            {tenants.slice(0, 8).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name.split(' ')[0]} ({t.unit})
              </option>
            ))}
          </select>

          {/* Install guide button */}
          <button
            onClick={() => setShowA2HSGuide(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-teal-300 hover:text-white"
            title="Add to Home Screen"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Tab Content Viewport */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto max-w-md mx-auto w-full space-y-4">
        {/* TAB 1: HOME */}
        {tenantTab === 'home' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Welcome banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Welcome to your storage hub</span>
                <span className="text-[10px] font-mono font-bold bg-teal-900/60 text-teal-300 border border-teal-700 px-2 py-0.5 rounded-full capitalize">
                  {activeTenant.status}
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                Hi, {activeTenant.name.split(' ')[0]}!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                You are currently leasing unit <strong className="text-white font-mono">{activeTenant.unit}</strong>.
              </p>

              {/* Status warning if locked out */}
              {activeTenant.status === 'locked out' && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Account Balance Past Due (${activeTenant.balance})</span>
                    <span className="text-[11px]">
                      Your gate access is temporarily suspended. Tap the Pay tab to clear your balance for immediate unlock.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick action grid */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${facility.phone}`}
                className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 hover:border-teal-500 text-center transition-all flex flex-col items-center justify-center gap-1.5"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">Call Us</span>
                <span className="text-[10px] text-slate-400 font-mono">{facility.phone}</span>
              </a>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(facility.address)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 hover:border-teal-500 text-center transition-all flex flex-col items-center justify-center gap-1.5"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">Directions</span>
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {facility.address.split(',')[0]}
                </span>
              </a>
            </div>

            {/* Gate & Office Hours Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>Facility Access Hours</span>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-700/60 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Electronic Gate:</span>
                  <span className="font-mono font-semibold text-white">{facility.gateHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rental Office:</span>
                  <span className="font-mono font-semibold text-white">{facility.officeHours}</span>
                </div>
              </div>
            </div>

            {/* Notification Opt-in Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Facility SMS &amp; Alerts</span>
                  <span className="text-[11px] text-slate-400">
                    Get gate maintenance &amp; account updates
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTenantNotifications(!tenantNotifications);
                  addToast({
                    type: 'info',
                    title: `Notifications ${!tenantNotifications ? 'enabled' : 'disabled'}`,
                  });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  tenantNotifications ? 'bg-teal-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    tenantNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: HELP */}
        {tenantTab === 'help' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-lg font-bold text-white">Need Help at the Facility?</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Submit an issue directly to our gate operations desk. We respond in minutes.
              </p>
            </div>

            {helpSubmittedTicketNum ? (
              <div className="p-6 rounded-3xl bg-teal-950/80 border border-teal-700 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">We got your request!</h4>
                <div className="text-xs font-mono font-bold text-teal-300 bg-teal-900/60 px-3 py-1 rounded-full inline-block">
                  Request {helpSubmittedTicketNum}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Our manager on duty has received your ticket on their console and is reviewing it now. Expected reply is under 15 minutes during gate hours.
                </p>
                <button
                  onClick={() => setHelpSubmittedTicketNum(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Submit Another Question
                </button>
              </div>
            ) : (
              <form onSubmit={handleHelpSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    What can we help you with?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'gate', label: 'Gate Problem' },
                      { id: 'billing', label: 'Billing Question' },
                      { id: 'unit', label: 'Unit Issue / Lock' },
                      { id: 'moving', label: 'Moving Carts' },
                      { id: 'other', label: 'Other Inquiries' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setHelpCategory(cat.id as TicketCategory)}
                        className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                          helpCategory === cat.id
                            ? 'bg-teal-600 border-teal-500 text-white font-bold'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Subject (Brief)
                  </label>
                  <input
                    type="text"
                    required
                    value={helpSubject}
                    onChange={(e) => setHelpSubject(e.target.value)}
                    placeholder="e.g. West gate keypad beeped"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Message Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={helpMessage}
                    onChange={(e) => setHelpMessage(e.target.value)}
                    placeholder="Describe what happened so staff can assist..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-hidden focus:border-teal-500 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request to Operations</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: REFER */}
        {tenantTab === 'refer' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Promo banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 border border-teal-700 shadow-lg text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Give $25, Get ${facility.referralRewardAmount || 50}</h3>
              <p className="text-xs text-teal-200 max-w-xs mx-auto leading-relaxed">
                Give a friend $25 off their first month, and get ${facility.referralRewardAmount || 50} rent credit automatically applied to your next bill when they move in.
              </p>
            </div>

            {/* Share link box */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-3">
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">Your Personal Referral Code:</span>
                <span className="text-xl font-mono font-black text-teal-400 tracking-wider">
                  {personalRefCode}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleShareReferral}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share with Friends</span>
                </button>

                <button
                  onClick={handleShareReferral}
                  className="px-3.5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* My Referrals Activity */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">My Referrals</span>
              {myReferrals.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center text-xs text-slate-500">
                  No referrals yet. Share your code to earn your first ${facility.referralRewardAmount || 50}!
                </div>
              ) : (
                myReferrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{ref.newTenantName}</span>
                      <span className="text-[11px] text-slate-400">{ref.unitRented} · {ref.date}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ref.status === 'Reward applied'
                          ? 'bg-teal-900 text-teal-300 border border-teal-700'
                          : 'bg-amber-900 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {ref.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: UNITS */}
        {tenantTab === 'units' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-lg font-bold text-white">Available Storage Units</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Need more space or upgrading? Reserve an additional unit right from your app.
              </p>
            </div>

            <div className="space-y-3">
              {unitTypes.map((unit) => (
                <div
                  key={unit.id}
                  className="p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-white">{unit.size}</span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {unit.climateControlled ? 'Climate Controlled' : 'Standard Drive-Up'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-mono font-bold text-teal-400">
                        ${unit.monthlyPrice}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/ month</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {unit.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                    <span className="text-[11px] text-teal-300 font-mono">
                      {unit.unitsAvailable > 0 ? `${unit.unitsAvailable} available now` : 'Waitlist only'}
                    </span>

                    <button
                      onClick={() => setReserveUnitSize(`${unit.size} ($${unit.monthlyPrice}/mo)`)}
                      disabled={unit.unitsAvailable === 0}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs shadow-xs"
                    >
                      Reserve Size
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Reserve Modal */}
            {reserveUnitSize && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-xs space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">Reserve {reserveUnitSize}</h4>
                    <button onClick={() => setReserveUnitSize(null)} className="text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {resSuccess ? (
                    <div className="p-4 bg-teal-950 border border-teal-700 rounded-2xl text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto" />
                      <p className="font-bold text-white">Unit Hold Confirmed!</p>
                      <p className="text-slate-300 text-[11px]">Staff will hold this unit under your account.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReserveSubmit} className="space-y-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Move-in Date</label>
                        <input
                          type="date"
                          required
                          value={resMoveInDate}
                          onChange={(e) => setResMoveInDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                        />
                      </div>

                      <div className="p-2.5 bg-slate-800/80 rounded-xl text-[11px] text-slate-400">
                        Reserved for: <strong className="text-white">{activeTenant.name}</strong> ({activeTenant.phone})
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs"
                      >
                        Confirm Hold
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PAY */}
        {tenantTab === 'pay' && (
          <div className="space-y-4 animate-in fade-in text-center py-4">
            <div className="w-14 h-14 rounded-3xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-2">
              <CreditCard className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white">Pay Storage Rent</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              Open your facility&apos;s secure portal to make a 1-time payment or update your autopay card on file.
            </p>

            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 max-w-xs mx-auto text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Balance:</span>
                <span className={`font-mono font-bold ${activeTenant.balance > 0 ? 'text-rose-400' : 'text-teal-400'}`}>
                  ${activeTenant.balance}.00
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Next Rent Due:</span>
                <span className="font-mono text-white">Dec 1, 2026</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={facility.paymentPortalUrl || 'https://sunnycoast.storagepayments.com'}
                target="_blank"
                rel="noreferrer"
                className="w-full max-w-xs mx-auto py-3.5 px-6 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                <span>Launch Payment Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <span className="text-[10px] text-slate-500 block mt-2">
                Opens {facility.paymentPortalUrl.split('/')[2] || 'secure gateway'}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Tab Bar (Permanent Mobile Nav) */}
      <nav className="bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 px-2 py-2 sticky bottom-0 z-30 flex items-center justify-around select-none">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'help', label: 'Help', icon: HelpCircle },
          { id: 'refer', label: 'Refer', icon: Gift },
          { id: 'units', label: 'Units', icon: Grid },
          { id: 'pay', label: 'Pay', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = tenantTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTenantTab(tab.id as any)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-teal-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* "Add to Home Screen" Guide Modal */}
      {showA2HSGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Install to Home Screen</h4>
              <button onClick={() => setShowA2HSGuide(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 p-1 bg-slate-800 rounded-xl">
              <button
                onClick={() => setA2hsPlatform('ios')}
                className={`flex-1 py-1.5 rounded-lg font-bold ${
                  a2hsPlatform === 'ios' ? 'bg-teal-600 text-white' : 'text-slate-400'
                }`}
              >
                iPhone (iOS)
              </button>
              <button
                onClick={() => setA2hsPlatform('android')}
                className={`flex-1 py-1.5 rounded-lg font-bold ${
                  a2hsPlatform === 'android' ? 'bg-teal-600 text-white' : 'text-slate-400'
                }`}
              >
                Android
              </button>
            </div>

            {a2hsPlatform === 'ios' ? (
              <ol className="space-y-2.5 text-slate-300 list-decimal pl-4">
                <li>Open this app in <strong>Safari</strong>.</li>
                <li>Tap the <strong>Share</strong> button (box with upward arrow) at bottom of screen.</li>
                <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                <li>Tap <strong>Add</strong> in top right. You&apos;re done!</li>
              </ol>
            ) : (
              <ol className="space-y-2.5 text-slate-300 list-decimal pl-4">
                <li>Open this app in <strong>Chrome</strong>.</li>
                <li>Tap the <strong>Menu</strong> icon (3 dots) in top right.</li>
                <li>Tap <strong>&quot;Install app&quot;</strong> or &quot;Add to Home screen&quot;.</li>
                <li>Confirm by tapping <strong>Install</strong>.</li>
              </ol>
            )}

            <button
              onClick={() => setShowA2HSGuide(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
