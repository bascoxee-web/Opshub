'use client';

import React, { useState, useEffect } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken,
} from '@/lib/firebase';
import {
  WorkspaceService,
  WorkspaceFile,
  WorkspaceEvent,
  WorkspaceTask,
} from '@/lib/workspace';
import {
  X,
  HardDrive,
  Calendar,
  FileText,
  CheckSquare,
  Loader2,
  CheckCircle2,
  Plus,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { User } from 'firebase/auth';

export const WorkspaceSyncModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { facility, tenants, reservations, addToast } = useGateDesk();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active tab inside modal
  const [activeTab, setActiveTab] = useState<'drive' | 'calendar' | 'docs' | 'tasks'>('drive');

  // Drive state
  const [driveFiles, setDriveFiles] = useState<WorkspaceFile[]>([]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<WorkspaceEvent[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);

  // Confirmation modal state for mutating operations
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: async () => {},
  });

  useEffect(() => {
    if (isOpen) {
      initAuth(
        (user, token) => {
          setCurrentUser(user);
          setAccessToken(token);
        },
        () => {
          setCurrentUser(null);
          setAccessToken(null);
        }
      );
    }
  }, [isOpen]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        addToast({
          type: 'success',
          title: 'Google Workspace Connected',
          message: `Signed in as ${res.user.email}`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Authentication Error',
        message: err.message || 'Could not connect to Google Workspace',
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setCurrentUser(null);
    setAccessToken(null);
    setDriveFiles([]);
    setCalendarEvents([]);
    setTasks([]);
    addToast({ type: 'info', title: 'Google Workspace disconnected' });
  };

  // Google Drive: Load files
  const loadDriveFiles = async () => {
    setIsDriveLoading(true);
    try {
      const files = await WorkspaceService.listDriveFiles();
      setDriveFiles(files);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Drive Error', message: err.message });
    } finally {
      setIsDriveLoading(false);
    }
  };

  // Google Drive: Backup tenants CSV
  const triggerBackupToDrive = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Upload Tenant Roster Backup to Google Drive?',
      description: `This will create a new file "${facility.name.replace(/\s+/g, '_')}_Tenants_Backup.csv" containing ${tenants.length} tenant records in your Google Drive.`,
      action: async () => {
        const csvHeader = 'Name,Phone,Email,Unit,Balance,Status,AgreedToTexts\n';
        const csvRows = tenants
          .map(
            (t) =>
              `"${t.name}","${t.phone}","${t.email}","${t.unit}",${t.balance},"${t.status}",${t.agreedToTexts}`
          )
          .join('\n');
        await WorkspaceService.uploadFileToDrive(
          `${facility.name.replace(/\s+/g, '_')}_Tenants_Backup.csv`,
          csvHeader + csvRows,
          'text/csv'
        );
        addToast({ type: 'success', title: 'Backup Saved to Google Drive!' });
        loadDriveFiles();
      },
    });
  };

  // Google Calendar: Load events
  const loadCalendarEvents = async () => {
    setIsCalendarLoading(true);
    try {
      const events = await WorkspaceService.listCalendarEvents();
      setCalendarEvents(events);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Calendar Error', message: err.message });
    } finally {
      setIsCalendarLoading(false);
    }
  };

  // Google Calendar: Schedule Move-in
  const triggerScheduleMoveIn = (resItem: (typeof reservations)[0]) => {
    setConfirmModal({
      isOpen: true,
      title: 'Schedule Move-in in Google Calendar?',
      description: `This will create a calendar event "Move-in: ${resItem.customerName} (${resItem.unitSize})" on ${resItem.moveInDate} at 10:00 AM.`,
      action: async () => {
        const start = new Date(`${resItem.moveInDate}T10:00:00`).toISOString();
        const end = new Date(`${resItem.moveInDate}T11:00:00`).toISOString();
        await WorkspaceService.createCalendarEvent({
          summary: `Move-in: ${resItem.customerName} (${resItem.unitSize})`,
          description: `Customer Phone: ${resItem.phone}\nEmail: ${resItem.email}\nUnit Size: ${resItem.unitSize}\nFacility: ${facility.name}`,
          startTime: start,
          endTime: end,
        });
        addToast({ type: 'success', title: 'Event added to Google Calendar!' });
        loadCalendarEvents();
      },
    });
  };

  // Google Docs: Generate Lease Document
  const triggerCreateDocsLease = (tenantName: string, unit: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Generate Storage Rental Agreement in Google Docs?',
      description: `This will create a new Google Doc "Lease Agreement - ${tenantName} (Unit ${unit})" in your Google account.`,
      action: async () => {
        const body = `SELF-STORAGE OCCUPANCY AGREEMENT\nFacility: ${facility.name}\nAddress: ${facility.address}\n\nTenant: ${tenantName}\nAssigned Unit: ${unit}\nMonthly Rent: $145.00 USD\nGate Access Hours: ${facility.gateHours}\nOffice Hours: ${facility.officeHours}\n\n1. RENT & FEES: Rent is due on the 1st day of each month. Late charges apply on the 5th.\n2. PROHIBITED ITEMS: Flammable, hazardous, or explosive materials are strictly forbidden.\n3. ACCESS & GATE: Tenant agrees not to share personal access codes.\n\nSigned on: ${new Date().toLocaleDateString()}\nGateDesk Operations System`;

        const res = await WorkspaceService.createGoogleDoc(
          `Lease Agreement - ${tenantName} (Unit ${unit})`,
          body
        );
        addToast({
          type: 'success',
          title: 'Google Doc Created!',
          message: `Document "${res.title}" created successfully.`,
        });
      },
    });
  };

  // Google Tasks: Load tasks
  const loadTasks = async () => {
    setIsTasksLoading(true);
    try {
      const taskList = await WorkspaceService.listTasks();
      setTasks(taskList);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Tasks Error', message: err.message });
    } finally {
      setIsTasksLoading(false);
    }
  };

  // Google Tasks: Add Task
  const triggerCreateTask = (title: string, notes: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Add Task to Google Tasks?',
      description: `Create task "${title}" in your default Google Tasks list?`,
      action: async () => {
        await WorkspaceService.createTask({ title, notes });
        addToast({ type: 'success', title: 'Task created in Google Tasks!' });
        loadTasks();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Google Workspace Integration
              </span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-mono">
                Drive · Calendar · Docs · Tasks
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Connect Storage Operations to Google
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Status & Official Google Button */}
        <div className="py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.email?.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  <div className="text-[11px] text-teal-600 dark:text-teal-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Workspace permissions granted</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Sign in with your Google account to sync facility files, tasks, and move-in schedules.
                </p>
              </div>
            )}
          </div>

          <div>
            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Disconnect
              </button>
            ) : (
              /* Official Sign in with Google Button */
              <button
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="inline-flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl border border-slate-300 shadow-xs transition-colors"
              >
                {isAuthenticating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
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
                )}
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature Tabs */}
        <div className="flex items-center gap-2 pt-4 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'drive', label: 'Google Drive', icon: HardDrive },
            { id: 'calendar', label: 'Google Calendar', icon: Calendar },
            { id: 'docs', label: 'Google Docs', icon: FileText },
            { id: 'tasks', label: 'Google Tasks', icon: CheckSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: GOOGLE DRIVE */}
        {activeTab === 'drive' && (
          <div className="py-4 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Facility Cloud Backups &amp; Files
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Export tenant roster CSVs and agreements straight into your Google Drive folder.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={triggerBackupToDrive}
                  disabled={!currentUser}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Backup Roster to Drive</span>
                </button>
                <button
                  onClick={loadDriveFiles}
                  disabled={!currentUser || isDriveLoading}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {isDriveLoading ? 'Loading...' : 'Browse Drive'}
                </button>
              </div>
            </div>

            {driveFiles.length > 0 ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-52 overflow-y-auto">
                {driveFiles.map((file) => (
                  <div key={file.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                      {file.name}
                    </span>
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                      >
                        <span>Open in Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
                {currentUser ? 'Click "Browse Drive" or "Backup Roster to Drive" to interact.' : 'Sign in with Google to enable Drive integrations.'}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GOOGLE CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="py-4 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Move-In Schedule &amp; Gate Inspections
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Sync customer unit reservations directly onto your primary Google Calendar.
                </p>
              </div>

              <button
                onClick={loadCalendarEvents}
                disabled={!currentUser || isCalendarLoading}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {isCalendarLoading ? 'Loading...' : 'Fetch Calendar Events'}
              </button>
            </div>

            {/* Quick schedule from reservations */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Pending Reservations to Add to Calendar:
              </span>
              {reservations.slice(0, 2).map((res) => (
                <div key={res.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{res.customerName}</span>
                    <span className="text-slate-500 block text-[11px]">{res.unitSize} · Target Date: {res.moveInDate}</span>
                  </div>
                  <button
                    onClick={() => triggerScheduleMoveIn(res)}
                    disabled={!currentUser}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold rounded-lg text-[11px] shadow-xs"
                  >
                    + Add to Google Calendar
                  </button>
                </div>
              ))}
            </div>

            {calendarEvents.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-40 overflow-y-auto">
                {calendarEvents.map((ev) => (
                  <div key={ev.id} className="p-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{ev.summary}</span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {ev.start.dateTime ? new Date(ev.start.dateTime).toLocaleDateString() : ev.start.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GOOGLE DOCS */}
        {activeTab === 'docs' && (
          <div className="py-4 space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">
                Generate Rental Contracts in Google Docs
              </h4>
              <p className="text-slate-500 text-[11px]">
                Create formatted occupancy agreements and notice letters with one click.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Select Active Tenant to Generate Lease Doc:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tenants.slice(0, 4).map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{t.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">Unit {t.unit}</span>
                    </div>
                    <button
                      onClick={() => triggerCreateDocsLease(t.name, t.unit)}
                      disabled={!currentUser}
                      className="px-2.5 py-1 bg-slate-900 dark:bg-teal-600 text-white font-semibold rounded-lg text-[10px]"
                    >
                      Create Doc
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GOOGLE TASKS */}
        {activeTab === 'tasks' && (
          <div className="py-4 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Storage Facility Operational Tasks
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Sync facility maintenance, gate repair, and past-due overlocks to Google Tasks.
                </p>
              </div>

              <button
                onClick={loadTasks}
                disabled={!currentUser || isTasksLoading}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {isTasksLoading ? 'Loading...' : 'Fetch Tasks'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() =>
                  triggerCreateTask(
                    `Daily Perimeter & Access Check — ${facility.name}`,
                    'Verify all entry gates, locks, and access hardware are operating normally.'
                  )
                }
                disabled={!currentUser}
                className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 block">+ Add Daily Inspection Task</span>
                <span className="text-[10px] text-slate-500">Syncs immediately to Google Tasks</span>
              </button>

              <button
                onClick={() =>
                  triggerCreateTask(
                    `Review Open Client Follow-Ups — ${facility.name}`,
                    'Follow up on pending missed calls, inquiries, and upcoming move-ins.'
                  )
                }
                disabled={!currentUser}
                className="p-3 text-left rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/20 hover:bg-teal-100 dark:hover:bg-teal-900/40"
              >
                <span className="font-bold text-teal-800 dark:text-teal-300 block">+ Add Client Follow-Up Task</span>
                <span className="text-[10px] text-slate-500">Syncs immediately to Google Tasks</span>
              </button>
            </div>

            {tasks.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-40 overflow-y-auto">
                {tasks.map((task) => (
                  <div key={task.id} className="p-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{task.title}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{task.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Confirmation Modal for Destructive/Mutating Operations (MANDATORY REQUIREMENT) */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 text-xs space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {confirmModal.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="flex-1 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const action = confirmModal.action;
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    await action();
                  }}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm &amp; Proceed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
