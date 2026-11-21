import { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import {
  AccountAssignedOperator,
  AccountCategory,
  AccountResponsibility,
  AccountStatus,
  DelegatedAccessStatus,
  PartnerAccount,
  PartnerActivityLog,
  PartnerOperator,
  PartnerWorkspace,
  VerificationRequest,
  VerificationRequestPriority,
  VerificationRequestStatus,
} from '@/types/partner-hub';

export const PARTNER_WORKSPACE_ID = 'creatordesk-workspace';

// Volumetric constraints matching supabase/schema.sql CHECK constraints
export const LIMITS = {
  ID_MAX: 64,
  WORKSPACE_NAME_MAX: 100,
  PLATFORM_MAX: 80,
  HANDLE_MAX: 120,
  EMAIL_MAX: 120,
  URL_MAX: 300,
  NOTES_MAX: 1000,
  ACTOR_MAX: 60,
  TITLE_MAX: 140,
  INSTRUCTIONS_MAX: 1000,
  RESOLUTION_MAX: 500,
  ACTION_MAX: 160,
  ARRAY_MAX: 10,
  STEP_MAX: 160,
} as const;

let idCounter = 0;
export function createPartnerDocId(prefix: string): string {
  idCounter += 1;
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16) || 'doc';
  const rand =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : `${Date.now().toString(36)}_${idCounter}`;
  return `${cleanPrefix}_${rand}`.slice(0, LIMITS.ID_MAX);
}

export function sanitizeString(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

export function sanitizeHttpsUrl(raw: string): string {
  const trimmed = raw.trim().slice(0, LIMITS.URL_MAX);
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString().slice(0, LIMITS.URL_MAX);
  } catch {
    return '';
  }
}

export function sanitizeStringArray(items: string[], maxItems = LIMITS.ARRAY_MAX): string[] {
  return items
    .map((s) => s.trim().slice(0, LIMITS.STEP_MAX))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function sanitizeEmailList(emails: string[], ownerEmail: string): string[] {
  const normalizedOwner = ownerEmail.trim().toLowerCase().slice(0, LIMITS.EMAIL_MAX);
  const unique = Array.from(
    new Set(
      emails
        .map((e) => e.trim().toLowerCase().slice(0, LIMITS.EMAIL_MAX))
        .filter((e) => e.includes('@') && e.length >= 3)
    )
  ).slice(0, LIMITS.ARRAY_MAX);

  if (normalizedOwner && !unique.includes(normalizedOwner)) {
    unique.unshift(normalizedOwner);
  }
  return unique.slice(0, LIMITS.ARRAY_MAX);
}

export function formatWorkspaceTimestamp(ts: unknown): string {
  if (!ts) return 'Just now';
  if (typeof ts === 'string') {
    const d = new Date(ts);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  }
  return 'Just now';
}

// --- Row Mappers (snake_case Postgres <-> camelCase TypeScript) ---

interface WorkspaceRow {
  id: string;
  name: string;
  owner_uid: string;
  owner_email: string;
  authorized_emails: string[];
  team_roster: string[];
  created_at: string;
  updated_at: string;
}

interface AccountRow {
  id: string;
  workspace_id: string;
  owner_uid: string;
  platform: string;
  category: AccountCategory;
  responsibility: AccountResponsibility;
  assigned_operator: AccountAssignedOperator;
  status: AccountStatus;
  account_handle: string;
  login_email_hint: string;
  portal_url: string;
  delegated_access_status: DelegatedAccessStatus;
  checklist_steps: string[];
  completed_step_ids: string[];
  notes: string;
  last_updated_by: string;
  created_at: string;
  updated_at: string;
}

interface RequestRow {
  id: string;
  workspace_id: string;
  account_id: string;
  owner_uid: string;
  platform_name: string;
  title: string;
  instructions: string;
  portal_url: string;
  requested_by: PartnerOperator;
  assigned_to: PartnerOperator;
  priority: VerificationRequestPriority;
  status: VerificationRequestStatus;
  resolution_note: string;
  created_at: string;
  updated_at: string;
}

interface ActivityLogRow {
  id: string;
  workspace_id: string;
  owner_uid: string;
  actor_name: string;
  action: string;
  target_platform: string;
  created_at: string;
}

function mapWorkspace(row: WorkspaceRow): PartnerWorkspace {
  return {
    id: row.id,
    name: row.name,
    ownerUid: row.owner_uid,
    ownerEmail: row.owner_email,
    authorizedEmails: row.authorized_emails || [],
    teamRoster: row.team_roster || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAccount(row: AccountRow, authorizedEmails: string[]): PartnerAccount {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    ownerUid: row.owner_uid,
    authorizedEmails,
    platform: row.platform,
    category: row.category,
    responsibility: row.responsibility,
    assignedOperator: row.assigned_operator,
    status: row.status,
    accountHandle: row.account_handle || '',
    loginEmailHint: row.login_email_hint || '',
    portalUrl: row.portal_url || '',
    delegatedAccessStatus: row.delegated_access_status,
    checklistSteps: row.checklist_steps || [],
    completedStepIds: row.completed_step_ids || [],
    notes: row.notes || '',
    lastUpdatedBy: row.last_updated_by || 'Team Member',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRequest(row: RequestRow, authorizedEmails: string[]): VerificationRequest {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    accountId: row.account_id,
    ownerUid: row.owner_uid,
    authorizedEmails,
    platformName: row.platform_name,
    title: row.title,
    instructions: row.instructions || '',
    portalUrl: row.portal_url || '',
    requestedBy: row.requested_by,
    assignedTo: row.assigned_to,
    priority: row.priority,
    status: row.status,
    resolutionNote: row.resolution_note || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLog(row: ActivityLogRow, authorizedEmails: string[]): PartnerActivityLog {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    ownerUid: row.owner_uid,
    authorizedEmails,
    actorName: row.actor_name,
    action: row.action,
    targetPlatform: row.target_platform || '',
    createdAt: row.created_at,
  };
}

export interface PlatformPreset {
  id: string;
  platform: string;
  category: AccountCategory;
  responsibility: AccountResponsibility;
  assignedOperator: AccountAssignedOperator;
  portalUrl: string;
  checklistSteps: string[];
  description: string;
}

// Optional 1-click platform presets (never auto-seeded — user explicitly adds what they use)
export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: 'preset_tiktok_us_seller',
    platform: 'TikTok Shop US Seller Center',
    category: 'social-selling',
    responsibility: 'owner-verification',
    assignedOperator: 'Account Owner',
    portalUrl: 'https://seller-us.tiktok.com',
    checklistSteps: [
      'Sign in to TikTok Shop US Seller Center',
      'Complete US business / identity & W-9 tax verification',
      'Link US payout bank account',
      'Invite Team Managers & Editors as Sub-Account Shop Managers',
    ],
    description: 'US seller identity, W-9 tax, payouts, and delegated sub-account access.',
  },
  {
    id: 'preset_tiktok_affiliate',
    platform: 'TikTok US Creator & Affiliate',
    category: 'affiliate',
    responsibility: 'owner-verification',
    assignedOperator: 'Account Owner',
    portalUrl: 'https://www.tiktok.com/creator-center',
    checklistSteps: [
      'Verify US phone number & creator identity',
      'Enroll account in TikTok Shop Creator Affiliate',
      'Verify US affiliate commission payout method',
    ],
    description: 'US phone verification and TikTok Creator Affiliate enrollment.',
  },
  {
    id: 'preset_youtube_shopping',
    platform: 'YouTube Partner & Shopping Affiliate',
    category: 'affiliate',
    responsibility: 'owner-verification',
    assignedOperator: 'Account Owner',
    portalUrl: 'https://studio.youtube.com',
    checklistSteps: [
      'Sign in to YouTube Studio & verify channel phone',
      'Complete Google AdSense US tax info',
      'Activate YouTube Shopping Affiliate tagging',
      'Add Ops Manager & Content Editor under Studio Permissions',
    ],
    description: 'AdSense US tax setup and YouTube Studio Manager delegation.',
  },
  {
    id: 'preset_instagram_meta',
    platform: 'Instagram Shop & Meta Business Suite',
    category: 'social-selling',
    responsibility: 'owner-verification',
    assignedOperator: 'Account Owner',
    portalUrl: 'https://business.facebook.com',
    checklistSteps: [
      'Complete Meta Business Verification & US entity details',
      'Connect Instagram Professional account & Commerce Manager',
      'Grant Partner / Staff access to Team Members in Business Settings',
    ],
    description: 'Meta Business Portfolio verification and team asset delegation.',
  },
  {
    id: 'preset_amazon_associates',
    platform: 'Amazon Associates & Influencer Storefront',
    category: 'affiliate',
    responsibility: 'owner-verification',
    assignedOperator: 'Account Owner',
    portalUrl: 'https://affiliate-program.amazon.com',
    checklistSteps: [
      'Complete Amazon US Tax Interview & direct deposit setup',
      'Verify Influencer Storefront & affiliate Store ID',
      'Paste approved Store ID & storefront link into this card',
    ],
    description: 'Amazon US tax interview, payouts, and affiliate Store ID.',
  },
  {
    id: 'preset_shopify_stripe',
    platform: 'Shopify & Stripe US Payouts',
    category: 'storefront-payout',
    responsibility: 'owner-verification',
    assignedOperator: 'Account Owner',
    portalUrl: 'https://admin.shopify.com',
    checklistSteps: [
      'Verify US business owner identity on Shopify Payments / Stripe',
      'Connect US business checking account for payouts',
      'Add Ops Manager & Content Editor as Staff Collaborators',
    ],
    description: 'US storefront KYC, payouts, and staff collaborator invites.',
  },
  {
    id: 'preset_canva_pro',
    platform: 'Canva Pro Brand Kit',
    category: 'creative-tool',
    responsibility: 'team-managed',
    assignedOperator: 'Content Editor',
    portalUrl: 'https://www.canva.com',
    checklistSteps: [
      'Set up brand typography, palette, and logo kit',
      'Build TikTok, YouTube thumbnail, and product templates',
      'Share brand folders with Editing & Ops team',
    ],
    description: 'Team design workspace for thumbnails, product graphics, and brand kits.',
  },
  {
    id: 'preset_capcut_studio',
    platform: 'CapCut Video Editing Workspace',
    category: 'creative-tool',
    responsibility: 'team-managed',
    assignedOperator: 'Content Editor',
    portalUrl: 'https://www.capcut.com',
    checklistSteps: [
      'Create shared Cloud Space for raw product videos',
      'Save caption, hook, and affiliate CTA presets',
    ],
    description: 'Short-form video editing for TikTok, Reels, and Shorts.',
  },
  {
    id: 'preset_linktree_bio',
    platform: 'Linktree Affiliate Bio Hub',
    category: 'affiliate',
    responsibility: 'team-managed',
    assignedOperator: 'Ops Manager',
    portalUrl: 'https://linktr.ee/admin',
    checklistSteps: [
      'Set up unified storefront bio page',
      'Connect approved affiliate links',
    ],
    description: 'Central link-in-bio page managed by the operations team.',
  },
  {
    id: 'preset_gdrive_vault',
    platform: 'Google Drive Content Vault',
    category: 'creative-tool',
    responsibility: 'team-managed',
    assignedOperator: 'Shared',
    portalUrl: 'https://drive.google.com',
    checklistSteps: [
      'Organize folders for raw footage, scripts, and product sheets',
      'Share access with Account Owner & Editing Team',
    ],
    description: 'Shared asset drive for product briefs, raw clips, and posting schedules.',
  },
];

// --- Workspace Boot & Queries ---

export async function ensureWorkspaceInitialized(user: User): Promise<PartnerWorkspace | null> {
  const supabase = getSupabaseClient();
  const normalizedEmail = (user.email || '').trim().toLowerCase();
  if (!normalizedEmail) return null;

  // 1. Check if this user already has access to the workspace (via RLS SELECT)
  const { data: existing, error: selectErr } = await supabase
    .from('partner_workspaces')
    .select('*')
    .eq('id', PARTNER_WORKSPACE_ID)
    .maybeSingle();

  if (selectErr) {
    throw new Error(selectErr.message);
  }

  if (existing) {
    return mapWorkspace(existing as WorkspaceRow);
  }

  // 2. Attempt first-time workspace creation.
  // If another admin already initialized it, Postgres primary key / RLS rejects insert safely.
  const { data: created, error: insertErr } = await supabase
    .from('partner_workspaces')
    .insert({
      id: PARTNER_WORKSPACE_ID,
      name: 'CreatorDesk Pro Workspace',
      owner_uid: user.id,
      owner_email: normalizedEmail,
      authorized_emails: [normalizedEmail],
      team_roster: [
        'Account Owner · US Verification & Subscriber',
        'Ops Manager · Account Access & Admin',
        'Content Editor · Editing & Posting',
      ],
    })
    .select('*')
    .single();

  if (insertErr) {
    // 23505 = workspace already exists and this user isn't in authorized_emails
    if (insertErr.code === '23505' || insertErr.message.toLowerCase().includes('duplicate')) {
      return null;
    }
    throw new Error(insertErr.message);
  }

  return mapWorkspace(created as WorkspaceRow);
}

export async function fetchPartnerHubSnapshot(workspaceId: string): Promise<{
  workspace: PartnerWorkspace | null;
  accounts: PartnerAccount[];
  requests: VerificationRequest[];
  logs: PartnerActivityLog[];
}> {
  const supabase = getSupabaseClient();

  const [wsRes, accRes, reqRes, logRes] = await Promise.all([
    supabase.from('partner_workspaces').select('*').eq('id', workspaceId).maybeSingle(),
    supabase
      .from('partner_accounts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true }),
    supabase
      .from('verification_requests')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false }),
    supabase
      .from('partner_activity_logs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  if (wsRes.error) throw new Error(wsRes.error.message);
  if (accRes.error) throw new Error(accRes.error.message);
  if (reqRes.error) throw new Error(reqRes.error.message);
  if (logRes.error) throw new Error(logRes.error.message);

  const workspace = wsRes.data ? mapWorkspace(wsRes.data as WorkspaceRow) : null;
  const authEmails = workspace?.authorizedEmails || [];

  return {
    workspace,
    accounts: ((accRes.data || []) as AccountRow[]).map((r) => mapAccount(r, authEmails)),
    requests: ((reqRes.data || []) as RequestRow[]).map((r) => mapRequest(r, authEmails)),
    logs: ((logRes.data || []) as ActivityLogRow[]).map((r) => mapLog(r, authEmails)),
  };
}

export function subscribePartnerHub(callbacks: {
  onWorkspace: (ws: PartnerWorkspace | null) => void;
  onAccounts: (accounts: PartnerAccount[]) => void;
  onRequests: (requests: VerificationRequest[]) => void;
  onLogs: (logs: PartnerActivityLog[]) => void;
  onError: (err: Error) => void;
}): () => void {
  const supabase = getSupabaseClient();
  let active = true;

  const refresh = async () => {
    try {
      const snap = await fetchPartnerHubSnapshot(PARTNER_WORKSPACE_ID);
      if (!active) return;
      callbacks.onWorkspace(snap.workspace);
      callbacks.onAccounts(snap.accounts);
      callbacks.onRequests(snap.requests);
      callbacks.onLogs(snap.logs);
    } catch (err) {
      if (!active) return;
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  void refresh();

  const channel = supabase
    .channel(`workspace-${PARTNER_WORKSPACE_ID}-${Date.now()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'partner_workspaces', filter: `id=eq.${PARTNER_WORKSPACE_ID}` },
      () => void refresh()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'partner_accounts', filter: `workspace_id=eq.${PARTNER_WORKSPACE_ID}` },
      () => void refresh()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'verification_requests', filter: `workspace_id=eq.${PARTNER_WORKSPACE_ID}` },
      () => void refresh()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'partner_activity_logs', filter: `workspace_id=eq.${PARTNER_WORKSPACE_ID}` },
      () => void refresh()
    )
    .subscribe();

  return () => {
    active = false;
    void supabase.removeChannel(channel);
  };
}

// --- Mutations ---

export async function logPartnerActivity(params: {
  ownerUid: string;
  actorName: string;
  action: string;
  targetPlatform: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const logId = createPartnerDocId('log');
  const { error } = await supabase.from('partner_activity_logs').insert({
    id: logId,
    workspace_id: PARTNER_WORKSPACE_ID,
    owner_uid: params.ownerUid,
    actor_name: sanitizeString(params.actorName, LIMITS.ACTOR_MAX) || 'Team Member',
    action: sanitizeString(params.action, LIMITS.ACTION_MAX),
    target_platform: sanitizeString(params.targetPlatform, LIMITS.PLATFORM_MAX),
  });
  if (error) throw new Error(error.message);
}

export async function createPartnerAccount(params: {
  ownerUid: string;
  platform: string;
  category: AccountCategory;
  responsibility: AccountResponsibility;
  assignedOperator: AccountAssignedOperator;
  status: AccountStatus;
  accountHandle: string;
  loginEmailHint: string;
  portalUrl: string;
  delegatedAccessStatus: DelegatedAccessStatus;
  checklistSteps: string[];
  notes: string;
  actorName: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const accountId = createPartnerDocId('acc');
  const cleanPlatform = sanitizeString(params.platform, LIMITS.PLATFORM_MAX);

  const { error } = await supabase.from('partner_accounts').insert({
    id: accountId,
    workspace_id: PARTNER_WORKSPACE_ID,
    owner_uid: params.ownerUid,
    platform: cleanPlatform,
    category: params.category,
    responsibility: params.responsibility,
    assigned_operator: params.assignedOperator,
    status: params.status,
    account_handle: sanitizeString(params.accountHandle, LIMITS.HANDLE_MAX),
    login_email_hint: sanitizeString(params.loginEmailHint, LIMITS.EMAIL_MAX),
    portal_url: sanitizeHttpsUrl(params.portalUrl),
    delegated_access_status: params.delegatedAccessStatus,
    checklist_steps: sanitizeStringArray(params.checklistSteps, LIMITS.ARRAY_MAX),
    completed_step_ids: [],
    notes: sanitizeString(params.notes, LIMITS.NOTES_MAX),
    last_updated_by: sanitizeString(params.actorName, LIMITS.ACTOR_MAX) || 'Team Member',
  });

  if (error) throw new Error(error.message);

  await logPartnerActivity({
    ownerUid: params.ownerUid,
    actorName: params.actorName,
    action: `Added ${cleanPlatform} (${params.responsibility === 'owner-verification' ? 'Owner Verification' : 'Team Managed'})`,
    targetPlatform: cleanPlatform,
  });
}

export async function updatePartnerAccount(
  account: PartnerAccount,
  updates: {
    status?: AccountStatus;
    accountHandle?: string;
    loginEmailHint?: string;
    portalUrl?: string;
    delegatedAccessStatus?: DelegatedAccessStatus;
    completedStepIds?: string[];
    notes?: string;
    assignedOperator?: AccountAssignedOperator;
  },
  actorName: string,
  ownerUid: string,
  activitySummary?: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const payload: Record<string, unknown> = {
    last_updated_by: sanitizeString(actorName, LIMITS.ACTOR_MAX) || 'Team Member',
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.accountHandle !== undefined) {
    payload.account_handle = sanitizeString(updates.accountHandle, LIMITS.HANDLE_MAX);
  }
  if (updates.loginEmailHint !== undefined) {
    payload.login_email_hint = sanitizeString(updates.loginEmailHint, LIMITS.EMAIL_MAX);
  }
  if (updates.portalUrl !== undefined) {
    payload.portal_url = sanitizeHttpsUrl(updates.portalUrl);
  }
  if (updates.delegatedAccessStatus !== undefined) {
    payload.delegated_access_status = updates.delegatedAccessStatus;
  }
  if (updates.completedStepIds !== undefined) {
    payload.completed_step_ids = sanitizeStringArray(updates.completedStepIds, LIMITS.ARRAY_MAX);
  }
  if (updates.notes !== undefined) {
    payload.notes = sanitizeString(updates.notes, LIMITS.NOTES_MAX);
  }
  if (updates.assignedOperator !== undefined) {
    payload.assigned_operator = updates.assignedOperator;
  }

  const { error } = await supabase
    .from('partner_accounts')
    .update(payload)
    .eq('id', account.id)
    .eq('workspace_id', PARTNER_WORKSPACE_ID);

  if (error) throw new Error(error.message);

  if (activitySummary) {
    await logPartnerActivity({
      ownerUid,
      actorName,
      action: activitySummary,
      targetPlatform: account.platform,
    });
  }
}

export async function deletePartnerAccount(
  account: PartnerAccount,
  actorName: string,
  ownerUid: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('partner_accounts')
    .delete()
    .eq('id', account.id)
    .eq('workspace_id', PARTNER_WORKSPACE_ID);

  if (error) throw new Error(error.message);

  await logPartnerActivity({
    ownerUid,
    actorName,
    action: `Removed ${account.platform} from workspace`,
    targetPlatform: account.platform,
  });
}

export async function createVerificationRequest(params: {
  ownerUid: string;
  account: PartnerAccount;
  title: string;
  instructions: string;
  requestedBy: PartnerOperator;
  assignedTo: PartnerOperator;
  priority: VerificationRequestPriority;
  actorName: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const reqId = createPartnerDocId('req');

  const { error } = await supabase.from('verification_requests').insert({
    id: reqId,
    workspace_id: PARTNER_WORKSPACE_ID,
    account_id: params.account.id,
    owner_uid: params.ownerUid,
    platform_name: sanitizeString(params.account.platform, LIMITS.PLATFORM_MAX),
    title: sanitizeString(params.title, LIMITS.TITLE_MAX),
    instructions: sanitizeString(params.instructions, LIMITS.INSTRUCTIONS_MAX),
    portal_url: sanitizeHttpsUrl(params.account.portalUrl),
    requested_by: params.requestedBy,
    assigned_to: params.assignedTo,
    priority: params.priority,
    status: 'pending_owner' as VerificationRequestStatus,
    resolution_note: '',
  });

  if (error) throw new Error(error.message);

  await logPartnerActivity({
    ownerUid: params.ownerUid,
    actorName: params.actorName,
    action: `Requested ${params.assignedTo}: ${sanitizeString(params.title, 100)}`,
    targetPlatform: params.account.platform,
  });
}

export async function updateVerificationRequestStatus(params: {
  request: VerificationRequest;
  status: VerificationRequestStatus;
  resolutionNote: string;
  actorName: string;
  ownerUid: string;
}): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('verification_requests')
    .update({
      status: params.status,
      resolution_note: sanitizeString(params.resolutionNote, LIMITS.RESOLUTION_MAX),
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.request.id)
    .eq('workspace_id', PARTNER_WORKSPACE_ID);

  if (error) throw new Error(error.message);

  await logPartnerActivity({
    ownerUid: params.ownerUid,
    actorName: params.actorName,
    action:
      params.status === 'completed'
        ? `Completed verification: ${params.request.title}`
        : `Updated request status to ${params.status.replace('_', ' ')}`,
    targetPlatform: params.request.platformName,
  });
}

export async function updateWorkspaceAuthorizedEmails(params: {
  workspace: PartnerWorkspace;
  newEmails: string[];
  teamRoster: string[];
  actorName: string;
  ownerUid: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const cleanEmails = sanitizeEmailList(params.newEmails, params.workspace.ownerEmail);
  const cleanRoster = sanitizeStringArray(params.teamRoster, LIMITS.ARRAY_MAX);

  const { error } = await supabase
    .from('partner_workspaces')
    .update({
      authorized_emails: cleanEmails,
      team_roster: cleanRoster,
      updated_at: new Date().toISOString(),
    })
    .eq('id', PARTNER_WORKSPACE_ID);

  if (error) throw new Error(error.message);

  await logPartnerActivity({
    ownerUid: params.ownerUid,
    actorName: params.actorName,
    action: `Updated authorized team seats (${cleanEmails.length} emails)`,
    targetPlatform: 'Team Access',
  });
}
