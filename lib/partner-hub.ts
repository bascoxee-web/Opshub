import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
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
export const BOOTSTRAP_ADMIN_EMAIL = 'bascoxee@gmail.com';

// Volumetric constraints matching firebase-blueprint.json verbatim
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

export function sanitizeEmailList(emails: string[]): string[] {
  const unique = Array.from(
    new Set(
      emails
        .map((e) => e.trim().toLowerCase().slice(0, LIMITS.EMAIL_MAX))
        .filter((e) => e.includes('@') && e.length >= 3)
    )
  ).slice(0, LIMITS.ARRAY_MAX);

  if (!unique.includes(BOOTSTRAP_ADMIN_EMAIL)) {
    unique.unshift(BOOTSTRAP_ADMIN_EMAIL);
  }
  return unique.slice(0, LIMITS.ARRAY_MAX);
}

export function isBootstrapAdminEmail(email?: string | null): boolean {
  return (email || '').trim().toLowerCase() === BOOTSTRAP_ADMIN_EMAIL;
}

export function formatFirestoreTimestamp(ts: unknown): string {
  if (!ts) return 'Just now';
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    const d = (ts as { toDate: () => Date }).toDate();
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  if (typeof ts === 'string') {
    const d = new Date(ts);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  }
  return 'Just now';
}

export function getTimestampMillis(ts: unknown): number {
  if (typeof ts === 'object' && ts !== null && 'toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  return 0;
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

export async function ensureWorkspaceInitialized(user: User): Promise<PartnerWorkspace | null> {
  const workspacePath = `partner_workspaces/${PARTNER_WORKSPACE_ID}`;
  const workspaceRef = doc(db, 'partner_workspaces', PARTNER_WORKSPACE_ID);

  try {
    const snap = await getDoc(workspaceRef);
    if (snap.exists()) {
      return snap.data() as PartnerWorkspace;
    }
  } catch (err) {
    if (!isBootstrapAdminEmail(user.email)) {
      handleFirestoreError(err, OperationType.GET, workspacePath);
    }
  }

  // Only the bootstrap admin can initialize the clean workspace on first visit
  if (!isBootstrapAdminEmail(user.email)) {
    return null;
  }

  const authorizedEmails = [BOOTSTRAP_ADMIN_EMAIL];
  const workspacePayload = {
    id: PARTNER_WORKSPACE_ID,
    name: 'CreatorDesk Pro Workspace',
    ownerUid: user.uid,
    ownerEmail: BOOTSTRAP_ADMIN_EMAIL,
    authorizedEmails,
    teamRoster: [
      'Account Owner · US Verification & Subscriber',
      'Ops Manager · Account Access & Admin',
      'Content Editor · Editing & Posting',
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(workspaceRef, workspacePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, workspacePath);
  }

  const finalSnap = await getDoc(workspaceRef);
  return finalSnap.exists() ? (finalSnap.data() as PartnerWorkspace) : null;
}

export function subscribePartnerHub(
  userEmail: string,
  callbacks: {
    onWorkspace: (ws: PartnerWorkspace | null) => void;
    onAccounts: (accounts: PartnerAccount[]) => void;
    onRequests: (requests: VerificationRequest[]) => void;
    onLogs: (logs: PartnerActivityLog[]) => void;
    onError: (err: Error) => void;
  }
): Unsubscribe {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const isAdmin = isBootstrapAdminEmail(normalizedEmail);
  const wsPath = `partner_workspaces/${PARTNER_WORKSPACE_ID}`;

  const unsubWorkspace = onSnapshot(
    doc(db, 'partner_workspaces', PARTNER_WORKSPACE_ID),
    (snap) => {
      callbacks.onWorkspace(snap.exists() ? (snap.data() as PartnerWorkspace) : null);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, wsPath);
      } catch (e) {
        callbacks.onError(e as Error);
      }
    }
  );

  const accountsCol = collection(db, 'partner_workspaces', PARTNER_WORKSPACE_ID, 'accounts');
  const accountsQuery = isAdmin
    ? query(accountsCol)
    : query(accountsCol, where('authorizedEmails', 'array-contains', normalizedEmail));

  const unsubAccounts = onSnapshot(
    accountsQuery,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as PartnerAccount);
      callbacks.onAccounts(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, `${wsPath}/accounts`);
      } catch (e) {
        callbacks.onError(e as Error);
      }
    }
  );

  const requestsCol = collection(
    db,
    'partner_workspaces',
    PARTNER_WORKSPACE_ID,
    'verification_requests'
  );
  const requestsQuery = isAdmin
    ? query(requestsCol)
    : query(requestsCol, where('authorizedEmails', 'array-contains', normalizedEmail));

  const unsubRequests = onSnapshot(
    requestsQuery,
    (snap) => {
      const list = snap.docs
        .map((d) => d.data() as VerificationRequest)
        .sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
      callbacks.onRequests(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, `${wsPath}/verification_requests`);
      } catch (e) {
        callbacks.onError(e as Error);
      }
    }
  );

  const logsCol = collection(db, 'partner_workspaces', PARTNER_WORKSPACE_ID, 'activity_logs');
  const logsQuery = isAdmin
    ? query(logsCol)
    : query(logsCol, where('authorizedEmails', 'array-contains', normalizedEmail));

  const unsubLogs = onSnapshot(
    logsQuery,
    (snap) => {
      const list = snap.docs
        .map((d) => d.data() as PartnerActivityLog)
        .sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt))
        .slice(0, 30);
      callbacks.onLogs(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, `${wsPath}/activity_logs`);
      } catch (e) {
        callbacks.onError(e as Error);
      }
    }
  );

  return () => {
    unsubWorkspace();
    unsubAccounts();
    unsubRequests();
    unsubLogs();
  };
}

export async function logPartnerActivity(params: {
  ownerUid: string;
  authorizedEmails: string[];
  actorName: string;
  action: string;
  targetPlatform: string;
}): Promise<void> {
  const logId = createPartnerDocId('log');
  const path = `partner_workspaces/${PARTNER_WORKSPACE_ID}/activity_logs/${logId}`;
  try {
    await setDoc(doc(db, 'partner_workspaces', PARTNER_WORKSPACE_ID, 'activity_logs', logId), {
      id: logId,
      workspaceId: PARTNER_WORKSPACE_ID,
      ownerUid: params.ownerUid,
      authorizedEmails: params.authorizedEmails,
      actorName: sanitizeString(params.actorName, LIMITS.ACTOR_MAX) || 'Team Member',
      action: sanitizeString(params.action, LIMITS.ACTION_MAX),
      targetPlatform: sanitizeString(params.targetPlatform, LIMITS.PLATFORM_MAX),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function createPartnerAccount(params: {
  ownerUid: string;
  authorizedEmails: string[];
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
  const accountId = createPartnerDocId('acc');
  const path = `partner_workspaces/${PARTNER_WORKSPACE_ID}/accounts/${accountId}`;
  const cleanPlatform = sanitizeString(params.platform, LIMITS.PLATFORM_MAX);

  try {
    await setDoc(doc(db, 'partner_workspaces', PARTNER_WORKSPACE_ID, 'accounts', accountId), {
      id: accountId,
      workspaceId: PARTNER_WORKSPACE_ID,
      ownerUid: params.ownerUid,
      authorizedEmails: params.authorizedEmails,
      platform: cleanPlatform,
      category: params.category,
      responsibility: params.responsibility,
      assignedOperator: params.assignedOperator,
      status: params.status,
      accountHandle: sanitizeString(params.accountHandle, LIMITS.HANDLE_MAX),
      loginEmailHint: sanitizeString(params.loginEmailHint, LIMITS.EMAIL_MAX),
      portalUrl: sanitizeHttpsUrl(params.portalUrl),
      delegatedAccessStatus: params.delegatedAccessStatus,
      checklistSteps: sanitizeStringArray(params.checklistSteps, LIMITS.ARRAY_MAX),
      completedStepIds: [],
      notes: sanitizeString(params.notes, LIMITS.NOTES_MAX),
      lastUpdatedBy: sanitizeString(params.actorName, LIMITS.ACTOR_MAX) || 'Team Member',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await logPartnerActivity({
      ownerUid: params.ownerUid,
      authorizedEmails: params.authorizedEmails,
      actorName: params.actorName,
      action: `Added ${cleanPlatform} (${params.responsibility === 'owner-verification' ? 'Owner Verification' : 'Team Managed'})`,
      targetPlatform: cleanPlatform,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
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
  const path = `partner_workspaces/${PARTNER_WORKSPACE_ID}/accounts/${account.id}`;
  const payload: Record<string, unknown> = {
    lastUpdatedBy: sanitizeString(actorName, LIMITS.ACTOR_MAX) || 'Team Member',
    updatedAt: serverTimestamp(),
  };

  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.accountHandle !== undefined) {
    payload.accountHandle = sanitizeString(updates.accountHandle, LIMITS.HANDLE_MAX);
  }
  if (updates.loginEmailHint !== undefined) {
    payload.loginEmailHint = sanitizeString(updates.loginEmailHint, LIMITS.EMAIL_MAX);
  }
  if (updates.portalUrl !== undefined) {
    payload.portalUrl = sanitizeHttpsUrl(updates.portalUrl);
  }
  if (updates.delegatedAccessStatus !== undefined) {
    payload.delegatedAccessStatus = updates.delegatedAccessStatus;
  }
  if (updates.completedStepIds !== undefined) {
    payload.completedStepIds = sanitizeStringArray(updates.completedStepIds, LIMITS.ARRAY_MAX);
  }
  if (updates.notes !== undefined) {
    payload.notes = sanitizeString(updates.notes, LIMITS.NOTES_MAX);
  }
  if (updates.assignedOperator !== undefined) {
    payload.assignedOperator = updates.assignedOperator;
  }

  try {
    await updateDoc(doc(db, 'partner_workspaces', PARTNER_WORKSPACE_ID, 'accounts', account.id), payload);
    if (activitySummary) {
      await logPartnerActivity({
        ownerUid,
        authorizedEmails: account.authorizedEmails,
        actorName,
        action: activitySummary,
        targetPlatform: account.platform,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePartnerAccount(
  account: PartnerAccount,
  actorName: string,
  ownerUid: string
): Promise<void> {
  const path = `partner_workspaces/${PARTNER_WORKSPACE_ID}/accounts/${account.id}`;
  try {
    await deleteDoc(doc(db, 'partner_workspaces', PARTNER_WORKSPACE_ID, 'accounts', account.id));
    await logPartnerActivity({
      ownerUid,
      authorizedEmails: account.authorizedEmails,
      actorName,
      action: `Removed ${account.platform} from workspace`,
      targetPlatform: account.platform,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createVerificationRequest(params: {
  ownerUid: string;
  authorizedEmails: string[];
  account: PartnerAccount;
  title: string;
  instructions: string;
  requestedBy: PartnerOperator;
  assignedTo: PartnerOperator;
  priority: VerificationRequestPriority;
  actorName: string;
}): Promise<void> {
  const reqId = createPartnerDocId('req');
  const path = `partner_workspaces/${PARTNER_WORKSPACE_ID}/verification_requests/${reqId}`;

  try {
    await setDoc(
      doc(db, 'partner_workspaces', PARTNER_WORKSPACE_ID, 'verification_requests', reqId),
      {
        id: reqId,
        workspaceId: PARTNER_WORKSPACE_ID,
        accountId: params.account.id,
        ownerUid: params.ownerUid,
        authorizedEmails: params.authorizedEmails,
        platformName: sanitizeString(params.account.platform, LIMITS.PLATFORM_MAX),
        title: sanitizeString(params.title, LIMITS.TITLE_MAX),
        instructions: sanitizeString(params.instructions, LIMITS.INSTRUCTIONS_MAX),
        portalUrl: sanitizeHttpsUrl(params.account.portalUrl),
        requestedBy: params.requestedBy,
        assignedTo: params.assignedTo,
        priority: params.priority,
        status: 'pending_owner' as VerificationRequestStatus,
        resolutionNote: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );

    await logPartnerActivity({
      ownerUid: params.ownerUid,
      authorizedEmails: params.authorizedEmails,
      actorName: params.actorName,
      action: `Requested ${params.assignedTo}: ${sanitizeString(params.title, 100)}`,
      targetPlatform: params.account.platform,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateVerificationRequestStatus(params: {
  request: VerificationRequest;
  status: VerificationRequestStatus;
  resolutionNote: string;
  actorName: string;
  ownerUid: string;
}): Promise<void> {
  const path = `partner_workspaces/${PARTNER_WORKSPACE_ID}/verification_requests/${params.request.id}`;
  try {
    await updateDoc(
      doc(db, 'partner_workspaces', PARTNER_WORKSPACE_ID, 'verification_requests', params.request.id),
      {
        status: params.status,
        resolutionNote: sanitizeString(params.resolutionNote, LIMITS.RESOLUTION_MAX),
        updatedAt: serverTimestamp(),
      }
    );

    await logPartnerActivity({
      ownerUid: params.ownerUid,
      authorizedEmails: params.request.authorizedEmails,
      actorName: params.actorName,
      action:
        params.status === 'completed'
          ? `Completed verification: ${params.request.title}`
          : `Updated request status to ${params.status.replace('_', ' ')}`,
      targetPlatform: params.request.platformName,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateWorkspaceAuthorizedEmails(params: {
  workspace: PartnerWorkspace;
  newEmails: string[];
  teamRoster: string[];
  actorName: string;
  ownerUid: string;
}): Promise<void> {
  const cleanEmails = sanitizeEmailList(params.newEmails);
  const cleanRoster = sanitizeStringArray(params.teamRoster, LIMITS.ARRAY_MAX);
  const wsPath = `partner_workspaces/${PARTNER_WORKSPACE_ID}`;

  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'partner_workspaces', PARTNER_WORKSPACE_ID), {
      authorizedEmails: cleanEmails,
      teamRoster: cleanRoster,
      updatedAt: serverTimestamp(),
    });

    // Atomically sync authorizedEmails on accounts & verification_requests so new partners see all records immediately
    const accSnap = await getDocs(
      collection(db, 'partner_workspaces', PARTNER_WORKSPACE_ID, 'accounts')
    );
    accSnap.forEach((d) => {
      batch.update(d.ref, {
        authorizedEmails: cleanEmails,
        updatedAt: serverTimestamp(),
      });
    });

    const reqSnap = await getDocs(
      collection(db, 'partner_workspaces', PARTNER_WORKSPACE_ID, 'verification_requests')
    );
    reqSnap.forEach((d) => {
      batch.update(d.ref, {
        authorizedEmails: cleanEmails,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();

    await logPartnerActivity({
      ownerUid: params.ownerUid,
      authorizedEmails: cleanEmails,
      actorName: params.actorName,
      action: `Updated authorized partner access list (${cleanEmails.length} emails)`,
      targetPlatform: 'Team Access',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, wsPath);
  }
}
