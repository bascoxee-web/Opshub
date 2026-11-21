# Partner Hub Firestore Security Specification

## 1. Data Invariants
1. **Master Gate Membership**: Every subcollection document (`accounts`, `verification_requests`, `activity_logs`) belongs to `/partner_workspaces/{workspaceId}`. Access on single-document reads and all writes requires the caller to be email-verified (`request.auth.token.email_verified == true`) and either the bootstrapped workspace admin (`bascoxee@gmail.com`) or listed in the parent workspace's `authorizedEmails`.
2. **Zero-Trust List Enforcement**: Every `allow list` checks `resource.data.authorizedEmails` directly (with zero `get()` or `exists()` lookups) or checks `isBootstrapAdmin()`, ensuring clients cannot scrape unauthorized workspaces.
3. **Immutable Ownership & Timestamps**: `id`, `workspaceId`, `ownerUid`, and `createdAt` are immutable after creation. `createdAt` and `updatedAt` must equal `request.time`.
4. **No Password Storage / Safe URLs**: `portalUrl` must be empty or match `^https://.*` (blocking `javascript:` and `data:` schemes). All string and array lengths are strictly bounded.
5. **Terminal Request Locking**: Once a `VerificationRequest` reaches `status == 'completed'`, non-admin members cannot mutate it further.
6. **Append-Only Audit Logs**: `activity_logs` cannot be updated or deleted by non-admin members.

## 2. Dirty Dozen Malicious Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Read**: Read `/partner_workspaces/emm-partner-hub/accounts/acc_1` with `auth == null`.
2. **Email Spoofing (Unverified Admin)**: Read/write with `email: 'bascoxee@gmail.com'` and `email_verified: false`.
3. **Outsider Workspace Scrape (`list`)**: Authenticated verified user `outsider@example.com` querying `accounts` collection.
4. **Shadow Field Injection on Create**: Create `PartnerAccount` with extra ghost field `isSuperAdmin: true`.
5. **Owner UID Spoofing**: Create `PartnerAccount` with `ownerUid: 'other_user_uid'` instead of `request.auth.uid`.
6. **ID Poisoning**: Create `PartnerAccount` with 200-char ID or invalid characters (`acc$../evil`).
7. **XSS Portal URL Injection**: Create/update `PartnerAccount` with `portalUrl: 'javascript:alert(1)'`.
8. **Denial-of-Wallet Oversized String**: Create `PartnerAccount` with `notes` > 1000 chars.
9. **Unbounded Array Injection**: Update `PartnerWorkspace` with `authorizedEmails` containing 15 emails (> 10 max).
10. **Immutable Field Tampering**: Update `PartnerAccount` changing `createdAt` or `ownerUid` or `workspaceId`.
11. **Client Timestamp Forgery**: Create `VerificationRequest` with client timestamp instead of `request.time`.
12. **Terminal State Re-opening by Non-Admin**: Non-admin member attempting to update a `VerificationRequest` where `existing().status == 'completed'`.
