'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { ReservationStatus, UnitReservation } from '@/types';
import {
  CalendarCheck2,
  Calendar,
  Phone,
  Mail,
  User,
  Plus,
  CheckCircle2,
  Clock,
  Smartphone,
  Globe,
  CalendarPlus,
  ExternalLink,
  Bell,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Check,
  Send,
  Loader2,
} from 'lucide-react';

export const ReservationsView: React.FC = () => {
  const {
    reservations,
    updateReservationStatus,
    createReservation,
    addTenant,
    addToast,
    isCalendarConnected,
    calendarUserEmail,
    calendarAutoSync,
    setCalendarAutoSync,
    calendarReminderMinutes,
    setCalendarReminderMinutes,
    connectCalendar,
    disconnectCalendar,
    syncReservationToCalendar,
    syncAllReservationsToCalendar,
    sendEmailReminderNow,
    facility,
  } = useGateDesk();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | ReservationStatus>('all');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Confirmation dialog state (mandatory for workspace mutations)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionLabel: 'Confirm',
    onConfirm: async () => {},
  });

  // New reservation form state
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [unitSize, setUnitSize] = useState('10x10 Climate ($145/mo)');
  const [moveInDate, setMoveInDate] = useState('2026-11-15');
  const [notes, setNotes] = useState('');
  const [scheduleInCalendar, setScheduleInCalendar] = useState(true);

  const filtered = reservations.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    return true;
  });

  const unsyncedCount = reservations.filter((r) => !r.calendarEventId && r.status !== 'Cancelled').length;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectCalendar();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Disconnect Google Calendar?',
      description:
        'New move-in reservations will no longer be automatically added to your Google Calendar, and automated email reminders will be paused.',
      actionLabel: 'Disconnect',
      onConfirm: async () => {
        await disconnectCalendar();
      },
    });
  };

  const handleSyncSingle = (res: UnitReservation) => {
    if (!isCalendarConnected) {
      handleConnect();
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: `Schedule Move-In on Google Calendar?`,
      description: `Create a Google Calendar event for ${res.customerName} (${res.unitSize}) on ${res.moveInDate}. Google will automatically send an email reminder to you ${Math.round(calendarReminderMinutes / 60)} hours before arrival.`,
      actionLabel: 'Create Calendar Event',
      onConfirm: async () => {
        setActionLoadingId(res.id);
        try {
          await syncReservationToCalendar(res.id);
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  };

  const handleBatchSync = async () => {
    setConfirmModal({
      isOpen: true,
      title: `Sync ${unsyncedCount} Move-In(s) to Google Calendar?`,
      description: `This will create ${unsyncedCount} event(s) in your Google Calendar for all pending move-in dates at ${facility.name}, each with an automated ${Math.round(calendarReminderMinutes / 60)}h email reminder.`,
      actionLabel: 'Schedule All in Calendar',
      onConfirm: async () => {
        setIsSyncingAll(true);
        try {
          await syncAllReservationsToCalendar();
        } finally {
          setIsSyncingAll(false);
        }
      },
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (custName.trim()) {
      createReservation({
        customerName: custName.trim(),
        phone: custPhone.trim() || '(619) 555-0000',
        email: custEmail.trim() || 'customer@example.com',
        unitSize,
        moveInDate,
        notes,
        source: 'Website',
      });
      setCustName('');
      setCustPhone('');
      setCustEmail('');
      setNotes('');
      setIsAddModalOpen(false);
    }
  };

  const handleConvertToMovedIn = (res: UnitReservation) => {
    updateReservationStatus(res.id, 'Moved in');
    addTenant({
      name: res.customerName,
      phone: res.phone,
      email: res.email,
      unit: 'C-' + Math.floor(100 + Math.random() * 899),
      balance: 0,
      status: 'active',
      agreedToTexts: true,
      moveInDate: res.moveInDate,
    });
    addToast({
      type: 'success',
      title: 'Move-in completed!',
      message: `${res.customerName} has been converted to an active tenant.`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Unit Reservations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Holds and move-in appointments booked through your website buttons, Tenant App, and phone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All ({reservations.length})</option>
            <option value="New">New ({reservations.filter((r) => r.status === 'New').length})</option>
            <option value="Contacted">Contacted</option>
            <option value="Moved in">Moved in</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Reservation</span>
          </button>
        </div>
      </div>

      {/* ── GOOGLE CALENDAR ACCOUNT CONNECTION BANNER ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-all">
        {!isCalendarConnected ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Connect Google Calendar Account
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Workspace Integration
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
                  Automatically create Google Calendar events for tenant move-in dates and deliver automated email reminders directly to your inbox 24 hours prior to customer arrival.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                  <span>Connects with user permission to manage scheduling for {facility.name}.</span>
                </div>
              </div>
            </div>

            {/* Official Sign In with Google Button (GSI Material Styling) */}
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs hover:shadow-sm transition-all shrink-0 cursor-pointer disabled:opacity-50"
              title="Connect your Google Calendar account"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isConnecting ? 'Connecting Calendar...' : 'Sign in with Google to Connect Calendar'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Google Calendar Connected
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Sync
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Account: {calendarUserEmail}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unsyncedCount > 0 && (
                  <button
                    onClick={handleBatchSync}
                    disabled={isSyncingAll}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    {isSyncingAll ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CalendarPlus className="w-3.5 h-3.5" />
                    )}
                    <span>Sync {unsyncedCount} Unscheduled to Calendar</span>
                  </button>
                )}

                <button
                  onClick={handleDisconnect}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Sync and Reminder Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-slate-600 dark:text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={calendarAutoSync}
                  onChange={(e) => setCalendarAutoSync(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium">
                  Automatically create calendar events on reservation booking
                </span>
              </label>

              <div className="flex items-center gap-2 sm:justify-end">
                <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400">Email reminder to owner:</span>
                <select
                  value={calendarReminderMinutes}
                  onChange={(e) => setCalendarReminderMinutes(Number(e.target.value))}
                  className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value={1440}>24 hours before (Default)</option>
                  <option value={2880}>48 hours before</option>
                  <option value={10080}>1 week before</option>
                  <option value={720}>12 hours before</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reservations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No reservations found.
          </div>
        ) : (
          filtered.map((res) => {
            const isSynced = Boolean(res.calendarEventId);
            const reminderHours = res.reminderMinutes ? Math.round(res.reminderMinutes / 60) : 24;

            return (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {res.customerName}
                      </h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          res.status === 'New'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                            : res.status === 'Contacted'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : res.status === 'Moved in'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-3">
                      <span>{res.phone}</span>
                      <span>·</span>
                      <span>{res.email}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {res.reservedAt}
                  </span>
                </div>

                {/* Unit & Date Box */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requested Unit:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {res.unitSize}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Target Move-in Date:</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400 font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-500" />
                      {res.moveInDate}
                    </span>
                  </div>
                  {res.notes && (
                    <div className="pt-1 text-[11px] text-slate-500 font-sans border-t border-slate-200 dark:border-slate-700 mt-1">
                      Note: {res.notes}
                    </div>
                  )}
                </div>

                {/* Google Calendar Sync & Email Reminder Status Bar */}
                <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {isSynced ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Google Calendar Synced
                      </span>
                      <a
                        href={res.calendarEventLink || 'https://calendar.google.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-semibold inline-flex items-center gap-0.5 text-[11px]"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Not yet scheduled on Google Calendar</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {!isSynced ? (
                      <button
                        onClick={() => handleSyncSingle(res)}
                        disabled={actionLoadingId === res.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                      >
                        {actionLoadingId === res.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CalendarPlus className="w-3 h-3" />
                        )}
                        <span>Add to Calendar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => sendEmailReminderNow(res.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                          res.emailReminderSent
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                        }`}
                        title="Dispatch an instant reminder email to facility owner"
                      >
                        <Bell className="w-3 h-3 text-amber-500" />
                        <span>
                          {res.emailReminderSent ? 'Reminder Dispatched ✓' : 'Send Reminder Email'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    {res.source === 'Tenant App' ? (
                      <Smartphone className="w-3.5 h-3.5 text-teal-500" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    <span>Booked via {res.source}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {res.status === 'New' && (
                      <button
                        onClick={() => updateReservationStatus(res.id, 'Contacted')}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold"
                      >
                        Mark Contacted
                      </button>
                    )}

                    {res.status !== 'Moved in' && (
                      <button
                        onClick={() => handleConvertToMovedIn(res)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Confirm Move-in
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Add Reservation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 text-xs space-y-4">
            <h3 className="text-base font-bold">New Unit Reservation</h3>
            <p className="text-slate-500 text-[11px]">
              Take down a phone or walk-in reservation hold for a customer.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thomas Sterling"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="(619) 555-0142"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Unit Type</label>
                  <input
                    type="text"
                    value={unitSize}
                    onChange={(e) => setUnitSize(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Move-in Date</label>
                  <input
                    type="date"
                    required
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Customer requirements..."
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Google Calendar & Reminder Option */}
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Google Calendar Scheduling
                  </span>
                </div>
                {isCalendarConnected ? (
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={scheduleInCalendar}
                      onChange={(e) => setScheduleInCalendar(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>
                      Add move-in event to Google Calendar with {Math.round(calendarReminderMinutes / 60)}h email reminder
                    </span>
                  </label>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Connect Google Calendar in the banner above to auto-create calendar events and owner email reminders.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal for Google Workspace Mutating Operations */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 text-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {confirmModal.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed text-xs">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                <span>Google Calendar Permission Safeguard</span>
              </div>
              <p>
                This operation will update your primary Google Calendar and set an automated email reminder sent to your connected account.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                  await action();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                {confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
