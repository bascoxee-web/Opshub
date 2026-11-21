'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured, supabaseSignOut } from '@/lib/supabase';
import {
  createPartnerAccount,
  createVerificationRequest,
  deletePartnerAccount,
  ensureWorkspaceInitialized,
  formatWorkspaceTimestamp,
  PLATFORM_PRESETS,
  PlatformPreset,
  sanitizeHttpsUrl,
  subscribePartnerHub,
  updatePartnerAccount,
  updateVerificationRequestStatus,
  updateWorkspaceAuthorizedEmails,
} from '@/lib/partner-hub';
import {
  AccountResponsibility,
  AccountStatus,
  PartnerAccount,
  PartnerActivityLog,
  PartnerOperator,
  PartnerWorkspace,
  VerificationRequest,
} from '@/types/partner-hub';
import { PartnerAuthGate } from '@/components/partner-hub/PartnerAuthGate';
import { AccountDrawerModal } from '@/components/partner-hub/AccountDrawerModal';
import { AddAccountModal } from '@/components/partner-hub/AddAccountModal';
import { NewRequestModal } from '@/components/partner-hub/NewRequestModal';
import {
  LayoutGrid,
  ShieldCheck,
  Palette,
  ClipboardCheck,
  Users,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Search,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Send,
  UserPlus,
  Trash2,
} from 'lucide-react';

type NavSection = 'overview' | 'owner-lane' | 'team-lane' | 'requests' | 'team-access';

const STATUS_META: Record<
  AccountStatus,
  { label: string; textClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  connected: {
    label: 'Connected',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  in_verification: {
    label: 'In Verification',
    textClass: 'text-amber-700 dark:text-amber-400',
    icon: Clock,
  },
  needs_owner: {
    label: 'Needs Owner Action',
    textClass: 'text-amber-700 dark:text-amber-400',
    icon: ShieldCheck,
  },
  attention_needed: {
    label: 'Attention Needed',
    textClass: 'text-rose-700 dark:text-rose-400',
    icon: AlertTriangle,
  },
};

const CATEGORY_LABEL: Record<PartnerAccount['category'], string> = {
  'social-selling': 'Social Selling',
  affiliate: 'Affiliate',
  'creative-tool': 'Editing & Creative',
  'storefront-payout': 'Storefront & Payouts',
};

const DELEGATED_LABEL: Record<PartnerAccount['delegatedAccessStatus'], string> = {
  not_started: 'Team access not granted yet',
  invite_sent: 'Sub-account invite sent',
  team_access_granted: 'Team access active',
  not_applicable: 'Managed directly by team',
};

const SEAT_SHORT_LABEL: Record<PartnerOperator, string> = {
  'Account Owner': 'Owner',
  'Ops Manager': 'Manager',
  'Content Editor': 'Editor',
};

export const PartnerHubApp: React.FC = () => {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<PartnerWorkspace | null>(null);
  const [accounts, setAccounts] = useState<PartnerAccount[]>([]);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [logs, setLogs] = useState<PartnerActivityLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  // Navigation & UI state
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [actingAs, setActingAs] = useState<PartnerOperator>('Account Owner');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [addModalLane, setAddModalLane] = useState<AccountResponsibility | null>(null);
  const [requestModalAccountId, setRequestModalAccountId] = useState<string | null>(null);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [addingPresetId, setAddingPresetId] = useState<string | null>(null);

  // Team access form state (Admin only)
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [savingMembers, setSavingMembers] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Boot Supabase Auth observer
  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const supabase = getSupabaseClient();
    let mounted = true;

    const applySessionUser = (nextUser: User | null) => {
      if (!mounted) return;
      setUser(nextUser);
      setAuthReady(true);

      if (!nextUser || !nextUser.email || !nextUser.email_confirmed_at) {
        setWorkspace(null);
        setAccounts([]);
        setRequests([]);
        setLogs([]);
        setUnauthorizedEmail(null);
        setRuntimeError(null);
        setLoadingData(false);
      }
    };

    void supabase.auth.getSession().then(({ data }) => {
      applySessionUser(data.session?.user ?? null);
    });

    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySessionUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      authSub.subscription.unsubscribe();
    };
  }, []);

  // Supabase Workspace Initialization + Live Realtime Subscriptions once verified
  useEffect(() => {
    if (!isSupabaseConfigured || !authReady || !user || !user.email || !user.email_confirmed_at) {
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const bootWorkspace = async () => {
      setLoadingData(true);
      setUnauthorizedEmail(null);
      setRuntimeError(null);

      try {
        const ws = await ensureWorkspaceInitialized(user);
        if (cancelled) return;

        if (!ws) {
          setUnauthorizedEmail(user.email || 'Unknown email');
          setLoadingData(false);
          return;
        }

        const normalizedEmail = (user.email || '').trim().toLowerCase();
        const isAllowed =
          ws.ownerUid === user.id ||
          (ws.authorizedEmails || []).map((e) => e.toLowerCase()).includes(normalizedEmail);

        if (!isAllowed) {
          setUnauthorizedEmail(user.email || 'Unknown email');
          setLoadingData(false);
          return;
        }

        setWorkspace(ws);
        setActingAs(ws.ownerUid === user.id ? 'Ops Manager' : 'Account Owner');

        unsubscribe = subscribePartnerHub({
          onWorkspace: (nextWs) => {
            setWorkspace(nextWs);
            setLoadingData(false);
          },
          onAccounts: (nextAccounts) => {
            setAccounts(nextAccounts);
            setLoadingData(false);
          },
          onRequests: (nextRequests) => setRequests(nextRequests),
          onLogs: (nextLogs) => setLogs(nextLogs),
          onError: (err) => {
            if (err.message.toLowerCase().includes('permission') || err.message.toLowerCase().includes('row-level security')) {
              setUnauthorizedEmail(user.email || 'Unknown email');
            } else {
              setRuntimeError(err.message);
            }
            setLoadingData(false);
          },
        });
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('row-level security')) {
          setUnauthorizedEmail(user.email || 'Unknown email');
        } else {
          setRuntimeError(msg);
        }
        setLoadingData(false);
      }
    };

    void bootWorkspace();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [authReady, user]);

  const isAdmin = Boolean(workspace && user && workspace.ownerUid === user.id);

  // Derived collections
  const ownerAccounts = useMemo(
    () => accounts.filter((a) => a.responsibility === 'owner-verification'),
    [accounts]
  );
  const teamAccounts = useMemo(
    () => accounts.filter((a) => a.responsibility === 'team-managed'),
    [accounts]
  );
  const pendingOwnerRequests = useMemo(
    () => requests.filter((r) => r.status !== 'completed'),
    [requests]
  );

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  );

  const handleQuickAddPreset = async (preset: PlatformPreset) => {
    if (!workspace || !user) return;
    setAddingPresetId(preset.id);
    try {
      await createPartnerAccount({
        ownerUid: user.id,
        platform: preset.platform,
        category: preset.category,
        responsibility: preset.responsibility,
        assignedOperator: preset.assignedOperator,
        status: preset.responsibility === 'owner-verification' ? 'needs_owner' : 'in_verification',
        accountHandle: '',
        loginEmailHint: '',
        portalUrl: preset.portalUrl,
        delegatedAccessStatus:
          preset.responsibility === 'owner-verification' ? 'not_started' : 'not_applicable',
        checklistSteps: preset.checklistSteps,
        notes: preset.description,
        actorName: actingAs,
      });
      showToast(`Added ${preset.platform}. Click it to add your handle and verify.`);
    } catch (err) {
      setRuntimeError(err instanceof Error ? err.message : 'Unable to add platform.');
    } finally {
      setAddingPresetId(null);
    }
  };

  const filteredAccounts = useMemo(() => {
    const base =
      activeSection === 'owner-lane'
        ? ownerAccounts
        : activeSection === 'team-lane'
        ? teamAccounts
        : accounts;

    return base.filter((acc) => {
      if (statusFilter !== 'all' && acc.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          acc.platform.toLowerCase().includes(q) ||
          acc.accountHandle.toLowerCase().includes(q) ||
          acc.notes.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [accounts, ownerAccounts, teamAccounts, activeSection, statusFilter, searchQuery]);

  // Metrics
  const connectedCount = accounts.filter((a) => a.status === 'connected').length;
  const needsOwnerCount = ownerAccounts.filter((a) => a.status !== 'connected').length;
  const teamReadyCount = teamAccounts.filter((a) => a.status === 'connected').length;
  const openRequestsCount = pendingOwnerRequests.length;

  const shareableHubUrl =
    typeof window !== 'undefined' ? window.location.origin : '/';

  const handleCopyWorkspaceLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableHubUrl);
      setCopiedLink(true);
      showToast('Workspace link copied — share it with your team.');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast('Copy this link from your browser address bar.');
    }
  };

  const handleRefreshAuth = async () => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.refreshSession();
    if (data.session?.user) {
      setUser(data.session.user);
    } else {
      const { data: userRes } = await supabase.auth.getUser();
      setUser(userRes.user ?? null);
    }
  };

  // Missing Supabase config -> show setup guide immediately
  if (!isSupabaseConfigured) {
    return <PartnerAuthGate onRefreshAuth={handleRefreshAuth} />;
  }

  // Loading auth state
  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Loading CreatorDesk Pro...
        </div>
      </div>
    );
  }

  // Auth Gate
  if (!user) {
    return <PartnerAuthGate onRefreshAuth={handleRefreshAuth} />;
  }

  if (!user.email_confirmed_at) {
    return <PartnerAuthGate unverifiedUser={user} onRefreshAuth={handleRefreshAuth} />;
  }

  if (unauthorizedEmail) {
    return (
      <PartnerAuthGate
        unauthorizedEmail={unauthorizedEmail}
        onRefreshAuth={handleRefreshAuth}
      />
    );
  }

  const breadcrumbTitle: Record<NavSection, string> = {
    overview: 'Overview',
    'owner-lane': 'Owner Verification',
    'team-lane': 'Editing & Posting Tools',
    requests: 'Verification Queue',
    'team-access': 'Team & Access',
  };

  const navItems: Array<{
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    {
      id: 'owner-lane',
      label: 'Owner Verification',
      icon: ShieldCheck,
      count: needsOwnerCount > 0 ? needsOwnerCount : undefined,
    },
    { id: 'team-lane', label: 'Editing & Posting Tools', icon: Palette },
    {
      id: 'requests',
      label: 'Verification Queue',
      icon: ClipboardCheck,
      count: openRequestsCount > 0 ? openRequestsCount : undefined,
    },
    { id: 'team-access', label: 'Team & Access', icon: Users },
  ];

  const handleAddAuthorizedEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !user || !newPartnerEmail.trim()) return;
    setSavingMembers(true);
    try {
      const nextEmails = [...workspace.authorizedEmails, newPartnerEmail.trim().toLowerCase()];
      await updateWorkspaceAuthorizedEmails({
        workspace,
        newEmails: nextEmails,
        teamRoster: workspace.teamRoster,
        actorName: actingAs,
        ownerUid: user.id,
      });
      setNewPartnerEmail('');
      showToast('Team member email authorized and synced to all accounts.');
    } catch (err) {
      setRuntimeError(err instanceof Error ? err.message : 'Unable to update team access.');
    } finally {
      setSavingMembers(false);
    }
  };

  const handleRemoveAuthorizedEmail = async (emailToRemove: string) => {
    if (!workspace || !user) return;
    if (emailToRemove.toLowerCase() === workspace.ownerEmail.toLowerCase()) return;
    setSavingMembers(true);
    try {
      const nextEmails = workspace.authorizedEmails.filter((e) => e !== emailToRemove);
      await updateWorkspaceAuthorizedEmails({
        workspace,
        newEmails: nextEmails,
        teamRoster: workspace.teamRoster,
        actorName: actingAs,
        ownerUid: user.id,
      });
      showToast(`Removed ${emailToRemove} from authorized seats.`);
    } catch (err) {
      setRuntimeError(err instanceof Error ? err.message : 'Unable to remove email.');
    } finally {
      setSavingMembers(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Desktop Left Sidebar (256px) */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col justify-between sticky top-0 h-screen">
        <div>
          {/* Wordmark */}
          <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex flex-col justify-center">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap leading-tight">
              CreatorDesk Pro
            </span>
            <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
              Team Subscription · Active
            </span>
          </div>

          {/* Primary Nav */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        isActive ? 'text-teal-300 dark:text-white' : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Operator Selector & Account Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Seat
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(['Account Owner', 'Ops Manager', 'Content Editor'] as PartnerOperator[]).map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setActingAs(op)}
                  className={`py-1 text-xs font-semibold rounded-md transition-colors ${
                    actingAs === op
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {SEAT_SHORT_LABEL[op]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="truncate text-slate-500 dark:text-slate-400" title={user.email || ''}>
              {user.email}
            </div>
            <div className="flex items-center justify-between gap-2">
              {isAdmin && (
                <Link
                  href="/gatedesk"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  GateDesk
                </Link>
              )}
              <button
                type="button"
                onClick={() => void supabaseSignOut()}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/60 flex">
          <div className="w-72 bg-white dark:bg-slate-900 h-full border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  CreatorDesk Pro
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation"
                  className="p-1.5 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileNavOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-teal-600'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </span>
                      {item.count !== undefined && (
                        <span className="text-xs font-mono tabular-nums">{item.count}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {(['Account Owner', 'Ops Manager', 'Content Editor'] as PartnerOperator[]).map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setActingAs(op)}
                    className={`py-1.5 text-xs font-semibold rounded-md ${
                      actingAs === op
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    {SEAT_SHORT_LABEL[op]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void supabaseSignOut()}
                className="w-full py-2 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({user.email})</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: Breadcrumb Left, Max 2 Actions Right */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-400 hidden sm:inline whitespace-nowrap">
                CreatorDesk Pro
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {breadcrumbTitle[activeSection]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyWorkspaceLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {copiedLink ? 'Link Copied' : 'Copy Workspace Link'}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setAddModalLane(activeSection === 'team-lane' ? 'team-managed' : 'owner-verification')
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Account</span>
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* Runtime Error Banner */}
          {runtimeError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
              <span>{runtimeError}</span>
              <button
                type="button"
                onClick={() => setRuntimeError(null)}
                className="font-semibold underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Toast Feedback */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-teal-600 text-white px-4 py-3 rounded-lg text-xs font-medium shadow-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 dark:text-white shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* 4-Column Flat Metric Strip */}
          {activeSection !== 'team-access' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">Needs Owner Verification</p>
                <p className="text-2xl font-bold font-mono tabular-nums text-amber-700 dark:text-amber-400 mt-1">
                  {needsOwnerCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  of {ownerAccounts.length} US-entity accounts
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">Connected &amp; Live</p>
                <p className="text-2xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">
                  {connectedCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  of {accounts.length} total accounts
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">Team Tools Ready</p>
                <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                  {teamReadyCount}/{teamAccounts.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Canva, CapCut, Drive &amp; Bio
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">Open Verification Requests</p>
                <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                  {openRequestsCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Live partner handoff queue
                </p>
              </div>
            </div>
          )}

          {/* VIEW 1: OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              {/* Owner Priority Action Queue */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Owner Action Queue
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Accounts waiting on US seller verification, tax setup, 2FA approval, or team sub-account invites.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRequestModalAccountId(null);
                      setIsNewRequestOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Request Owner Action</span>
                  </button>
                </div>

                {loadingData ? (
                  <div className="p-6 space-y-3">
                    <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                  </div>
                ) : pendingOwnerRequests.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      All verification requests are complete
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Nothing is waiting on the Account Owner right now. Send a new request whenever another platform needs verification.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pendingOwnerRequests.map((req) => {
                      const safePortal = sanitizeHttpsUrl(req.portalUrl);
                      return (
                        <div
                          key={req.id}
                          className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {req.platformName}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>Assigned to {req.assignedTo}</span>
                              <span aria-hidden="true">·</span>
                              <span>Requested by {req.requestedBy}</span>
                              {req.priority === 'urgent' && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                                    Urgent
                                  </span>
                                </>
                              )}
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {req.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                              {req.instructions}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {safePortal && (
                              <a
                                href={safePortal}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-lg whitespace-nowrap"
                              >
                                <span>Open Portal</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={async () => {
                                await updateVerificationRequestStatus({
                                  request: req,
                                  status: 'completed',
                                  resolutionNote: `Verified and completed by ${actingAs}`,
                                  actorName: actingAs,
                                  ownerUid: user.id,
                                });
                                const matchedAcc = accounts.find((a) => a.id === req.accountId);
                                if (matchedAcc && matchedAcc.status !== 'connected') {
                                  await updatePartnerAccount(
                                    matchedAcc,
                                    {
                                      status: 'connected',
                                      delegatedAccessStatus: 'team_access_granted',
                                    },
                                    actingAs,
                                    user.id
                                  );
                                }
                                showToast(`Marked "${req.platformName}" verification complete.`);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Done</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Split Responsibility Lanes Preview */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                {/* Lane 1: Owner Verification Accounts */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                          01. Owner Verification &amp; US Seller Accounts
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          TikTok US Seller, YouTube, Meta, Amazon &amp; US Payouts
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSection('owner-lane')}
                        className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline whitespace-nowrap"
                      >
                        View all ({ownerAccounts.length})
                      </button>
                    </div>

                    {ownerAccounts.length === 0 ? (
                      <div className="p-6 space-y-4">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            No US verification accounts added yet
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Pick any platform below to add your real account for Owner verification, or create a custom entry.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {PLATFORM_PRESETS.filter((p) => p.responsibility === 'owner-verification').map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              disabled={addingPresetId === preset.id}
                              onClick={() => handleQuickAddPreset(preset)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                              <span>{preset.platform}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {ownerAccounts.map((acc) => {
                          const meta = STATUS_META[acc.status];
                          const StatusIcon = meta.icon;
                          const completed = acc.completedStepIds?.length || 0;
                          const total = acc.checklistSteps?.length || 0;
                          return (
                            <div
                              key={acc.id}
                              onClick={() => setSelectedAccountId(acc.id)}
                              className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {acc.platform}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                                  <span>{acc.accountHandle || 'Handle not set'}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">
                                    {completed}/{total} steps
                                  </span>
                                </div>
                              </div>
                              <div className={`flex items-center gap-1.5 text-xs font-medium shrink-0 ${meta.textClass}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                <span>{meta.label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>

                {/* Lane 2: Editing & Posting Tools */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                          02. Editing &amp; Posting Tools (Team Managed)
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Canva, CapCut, Linktree &amp; Google Drive creative stack
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSection('team-lane')}
                        className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline whitespace-nowrap"
                      >
                        View all ({teamAccounts.length})
                      </button>
                    </div>

                    {teamAccounts.length === 0 ? (
                      <div className="p-6 space-y-4">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            No team creative tools added yet
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Add the editing, scheduling, and publishing tools your team manages directly without needing Owner verification.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {PLATFORM_PRESETS.filter((p) => p.responsibility === 'team-managed').map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              disabled={addingPresetId === preset.id}
                              onClick={() => handleQuickAddPreset(preset)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                              <span>{preset.platform}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {teamAccounts.map((acc) => {
                          const meta = STATUS_META[acc.status];
                          const StatusIcon = meta.icon;
                          return (
                            <div
                              key={acc.id}
                              onClick={() => setSelectedAccountId(acc.id)}
                              className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {acc.platform}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                                  <span>Seat: {acc.assignedOperator}</span>
                                  <span aria-hidden="true">·</span>
                                  <span>{acc.accountHandle || 'Handle not set'}</span>
                                </div>
                              </div>
                              <div className={`flex items-center gap-1.5 text-xs font-medium shrink-0 ${meta.textClass}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                <span>{meta.label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* VIEW 2 & 3: ACCOUNT DIRECTORY (Owner Lane or Team Lane) */}
          {(activeSection === 'owner-lane' || activeSection === 'team-lane') && (
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {activeSection === 'owner-lane'
                      ? 'Owner US Verification & Selling Accounts'
                      : 'Editing, Creative & Posting Tools'}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                    {activeSection === 'owner-lane'
                      ? 'Platforms requiring the Account Owner for US identity, tax, bank payouts, or business verification. Click any platform to open its portal, check off steps, and confirm team sub-account access.'
                      : 'Editing, design, bio, and publishing tools managed day-to-day by Ops Managers and Content Editors without requiring Owner verification.'}
                  </p>
                </div>

                {/* Search + Segmented Status Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter accounts..."
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 w-44"
                    />
                  </div>
                </div>
              </div>

              {/* Segmented Filter Control */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-lg w-fit">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'needs_owner', label: 'Needs Owner' },
                    { id: 'in_verification', label: 'In Verification' },
                    { id: 'connected', label: 'Connected' },
                    { id: 'attention_needed', label: 'Attention' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      statusFilter === tab.id
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Account Directory Table / List */}
              {filteredAccounts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    No accounts match this filter
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Clear your search or add a new account to this lane.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setAddModalLane(
                        activeSection === 'team-lane' ? 'team-managed' : 'owner-verification'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Account</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
                  {filteredAccounts.map((acc) => {
                    const meta = STATUS_META[acc.status];
                    const StatusIcon = meta.icon;
                    const safeUrl = sanitizeHttpsUrl(acc.portalUrl);
                    const doneSteps = acc.completedStepIds?.length || 0;
                    const totalSteps = acc.checklistSteps?.length || 0;
                    const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

                    return (
                      <div
                        key={acc.id}
                        className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>{CATEGORY_LABEL[acc.category]}</span>
                            <span aria-hidden="true">·</span>
                            <span>Seat: {acc.assignedOperator}</span>
                            <span aria-hidden="true">·</span>
                            <span>{DELEGATED_LABEL[acc.delegatedAccessStatus]}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              {acc.platform}
                            </h3>
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${meta.textClass}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              <span>{meta.label}</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                            {acc.notes}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span>
                              Handle: <strong className="text-slate-800 dark:text-slate-200">{acc.accountHandle || 'Not set'}</strong>
                            </span>
                            {acc.loginEmailHint && (
                              <span>
                                Account ref: <span className="font-mono">{acc.loginEmailHint}</span>
                              </span>
                            )}
                            {totalSteps > 0 && (
                              <span className="inline-flex items-center gap-2 font-mono tabular-nums">
                                <span className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden inline-block">
                                  <span
                                    className="block h-full bg-teal-600 dark:bg-teal-400"
                                    style={{ width: `${pct}%` }}
                                  />
                                </span>
                                <span>
                                  {doneSteps}/{totalSteps} steps
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {safeUrl && (
                            <a
                              href={safeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <span>Open Portal</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedAccountId(acc.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                          >
                            <span>
                              {acc.responsibility === 'owner-verification'
                                ? 'Verify & Update'
                                : 'Manage Tool'}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* VIEW 4: VERIFICATION REQUESTS QUEUE */}
          {activeSection === 'requests' && (
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Verification &amp; Access Handoff Queue
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Track every verification and access handoff request across your team with live completion history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRequestModalAccountId(null);
                    setIsNewRequestOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 self-start sm:self-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>New Request</span>
                </button>
              </div>

              {requests.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    No verification requests logged yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create a request whenever an account needs Owner verification or a team sub-account invite.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
                  {requests.map((req) => {
                    const safeUrl = sanitizeHttpsUrl(req.portalUrl);
                    const isCompleted = req.status === 'completed';
                    return (
                      <div
                        key={req.id}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {req.platformName}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>For {req.assignedTo}</span>
                            <span aria-hidden="true">·</span>
                            <span>From {req.requestedBy}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {formatWorkspaceTimestamp(req.createdAt)}
                            </span>
                          </div>

                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {req.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                            {req.instructions}
                          </p>
                          {req.resolutionNote && (
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium pt-0.5">
                              Resolution: {req.resolutionNote}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <>
                              {safeUrl && (
                                <a
                                  href={safeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                                >
                                  <span>Open Portal</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={async () => {
                                  await updateVerificationRequestStatus({
                                    request: req,
                                    status: 'completed',
                                    resolutionNote: `Completed by ${actingAs}`,
                                    actorName: actingAs,
                                    ownerUid: user.id,
                                  });
                                  showToast('Verification request marked complete.');
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-teal-500 whitespace-nowrap"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Mark Complete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* VIEW 5: TEAM & ACCESS + SHAREABLE LINK + ACTIVITY LOG */}
          {activeSection === 'team-access' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Team Seats &amp; Workspace Access
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Share your CreatorDesk Pro workspace link and control which team emails can access your connected accounts.
                </p>
              </div>

              {/* Shareable Link Box */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Direct Workspace Link
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Share this link with your Account Owner, Ops Managers, and Content Editors for direct sign-in to CreatorDesk Pro.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="text"
                    readOnly
                    value={shareableHubUrl}
                    className="flex-1 px-3.5 py-2.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleCopyWorkspaceLink}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied Link' : 'Copy Workspace Link'}</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Option 1 · Shared Team Subscription Login
                    </p>
                    <p className="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                      Team members sign in with one shared workspace email &amp; password (or Google), then choose their role under <strong>Active Seat</strong> in the sidebar.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Option 2 · Individual Team Seats (Recommended)
                    </p>
                    <p className="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                      Add each team member&apos;s email below so everyone signs in with their own verified Google or email login.
                    </p>
                  </div>
                </div>
              </div>

              {/* Authorized Team Seats */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Authorized Team Seats
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Only these verified team emails can sign in and access this Pro subscription workspace.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  {(workspace?.authorizedEmails || []).map((emailItem) => {
                    const isPrimary =
                      emailItem.toLowerCase() === (workspace?.ownerEmail || '').toLowerCase();
                    return (
                      <div
                        key={emailItem}
                        className="px-4 py-3 flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-xs text-slate-900 dark:text-white">
                            {emailItem}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            · {isPrimary ? 'Workspace Admin' : 'Authorized Team Seat'}
                          </span>
                        </div>
                        {isAdmin && !isPrimary && (
                          <button
                            type="button"
                            disabled={savingMembers}
                            onClick={() => handleRemoveAuthorizedEmail(emailItem)}
                            className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isAdmin && (
                  <form onSubmit={handleAddAuthorizedEmail} className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <input
                      type="email"
                      required
                      placeholder="Invite team member email (e.g. member@company.com)"
                      value={newPartnerEmail}
                      onChange={(e) => setNewPartnerEmail(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="submit"
                      disabled={savingMembers}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{savingMembers ? 'Syncing...' : 'Authorize Seat'}</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Live Activity Log */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recent Workspace Activity
                  </h2>
                </div>
                {logs.length === 0 ? (
                  <div className="p-6 text-xs text-slate-500 dark:text-slate-400">
                    No activity recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                      >
                        <div className="text-slate-700 dark:text-slate-200">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {log.actorName}
                          </span>{' '}
                          — {log.action}
                        </div>
                        <div className="text-slate-400 font-mono tabular-nums shrink-0">
                          {log.targetPlatform} · {formatWorkspaceTimestamp(log.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Slide-Over Account Drawer */}
      {selectedAccount && workspace && (
        <AccountDrawerModal
          key={selectedAccount.id}
          account={selectedAccount}
          actingAs={actingAs}
          canDelete={isAdmin || selectedAccount.ownerUid === user.id}
          onClose={() => setSelectedAccountId(null)}
          onSave={async (updates, summary) => {
            await updatePartnerAccount(
              selectedAccount,
              updates,
              actingAs,
              user.id,
              summary
            );
            showToast(`Saved updates for ${selectedAccount.platform}.`);
          }}
          onDelete={async () => {
            await deletePartnerAccount(selectedAccount, actingAs, user.id);
            showToast(`Removed ${selectedAccount.platform}.`);
          }}
          onOpenRequestModal={() => {
            setRequestModalAccountId(selectedAccount.id);
            setIsNewRequestOpen(true);
          }}
        />
      )}

      {/* Add Account Modal */}
      {addModalLane && workspace && (
        <AddAccountModal
          defaultResponsibility={addModalLane}
          onClose={() => setAddModalLane(null)}
          onCreate={async (data) => {
            await createPartnerAccount({
              ...data,
              ownerUid: user.id,
              actorName: actingAs,
            });
            showToast(`Added ${data.platform} to CreatorDesk Pro.`);
          }}
        />
      )}

      {/* New Verification Request Modal */}
      {isNewRequestOpen && workspace && (
        <NewRequestModal
          accounts={accounts}
          defaultAccountId={requestModalAccountId || undefined}
          actingAs={actingAs}
          onClose={() => {
            setIsNewRequestOpen(false);
            setRequestModalAccountId(null);
          }}
          onCreate={async (data) => {
            await createVerificationRequest({
              ...data,
              ownerUid: user.id,
              actorName: actingAs,
            });
            showToast(`Sent verification request to ${data.assignedTo}.`);
          }}
        />
      )}
    </div>
  );
};
