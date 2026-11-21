/**
 * Partner Hub Firestore Rules Security Verification Suite
 * Covers the Dirty Dozen adversarial payloads from security_spec.md.
 * Run against Firebase Rules Unit Testing / Emulator when locally verifying.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Read',
    operation: 'get',
    path: '/partner_workspaces/emm-partner-hub/accounts/acc_tiktok_seller',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Email Spoofing (Unverified Admin Email)',
    operation: 'get',
    path: '/partner_workspaces/emm-partner-hub',
    auth: { uid: 'attacker_1', email: 'bascoxee@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Outsider Workspace Collection Scrape',
    operation: 'list',
    path: '/partner_workspaces/emm-partner-hub/accounts',
    auth: { uid: 'outsider_1', email: 'stranger@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Create',
    operation: 'create',
    path: '/partner_workspaces/emm-partner-hub/accounts/acc_shadow',
    auth: { uid: 'admin_1', email: 'bascoxee@gmail.com', email_verified: true },
    payload: { id: 'acc_shadow', isSuperAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Owner UID Spoofing',
    operation: 'create',
    path: '/partner_workspaces/emm-partner-hub/accounts/acc_spoof',
    auth: { uid: 'partner_ed', email: 'ed@partner.com', email_verified: true },
    payload: { id: 'acc_spoof', ownerUid: 'victim_uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Path Variable ID Poisoning',
    operation: 'create',
    path: '/partner_workspaces/emm-partner-hub/accounts/bad$id$with$invalid$chars',
    auth: { uid: 'admin_1', email: 'bascoxee@gmail.com', email_verified: true },
    payload: { id: 'bad$id$with$invalid$chars' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'XSS javascript: Portal URL Injection',
    operation: 'update',
    path: '/partner_workspaces/emm-partner-hub/accounts/acc_tiktok_seller',
    auth: { uid: 'partner_ed', email: 'ed@partner.com', email_verified: true },
    payload: { portalUrl: 'javascript:alert(document.cookie)' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Denial-of-Wallet Oversized Notes String (> 1000 chars)',
    operation: 'update',
    path: '/partner_workspaces/emm-partner-hub/accounts/acc_tiktok_seller',
    auth: { uid: 'partner_ed', email: 'ed@partner.com', email_verified: true },
    payload: { notes: 'A'.repeat(1500) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unbounded Array Injection (> 10 authorizedEmails)',
    operation: 'update',
    path: '/partner_workspaces/emm-partner-hub',
    auth: { uid: 'admin_1', email: 'bascoxee@gmail.com', email_verified: true },
    payload: {
      authorizedEmails: Array.from({ length: 12 }, (_, i) => `user${i}@example.com`),
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable Field Tampering (ownerUid / createdAt)',
    operation: 'update',
    path: '/partner_workspaces/emm-partner-hub/accounts/acc_tiktok_seller',
    auth: { uid: 'partner_ed', email: 'ed@partner.com', email_verified: true },
    payload: { ownerUid: 'hijacked_uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Client Timestamp Forgery on Create',
    operation: 'create',
    path: '/partner_workspaces/emm-partner-hub/verification_requests/req_forged',
    auth: { uid: 'partner_ed', email: 'ed@partner.com', email_verified: true },
    payload: { id: 'req_forged', createdAt: '1999-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Terminal State Re-opening by Non-Admin',
    operation: 'update',
    path: '/partner_workspaces/emm-partner-hub/verification_requests/req_completed_1',
    auth: { uid: 'partner_ed', email: 'ed@partner.com', email_verified: true },
    payload: { status: 'pending_ed' },
    expected: 'PERMISSION_DENIED',
  },
];
