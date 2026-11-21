export type PartnerOperator = 'Account Owner' | 'Ops Manager' | 'Content Editor';
export type AccountAssignedOperator = PartnerOperator | 'Shared';

export type AccountCategory =
  | 'social-selling'
  | 'affiliate'
  | 'creative-tool'
  | 'storefront-payout';

export type AccountResponsibility = 'owner-verification' | 'team-managed';

export type AccountStatus =
  | 'needs_owner'
  | 'in_verification'
  | 'connected'
  | 'attention_needed';

export type DelegatedAccessStatus =
  | 'not_started'
  | 'invite_sent'
  | 'team_access_granted'
  | 'not_applicable';

export type VerificationRequestStatus = 'pending_owner' | 'in_progress' | 'completed';
export type VerificationRequestPriority = 'standard' | 'urgent';

export interface PartnerWorkspace {
  id: string;
  name: string;
  ownerUid: string;
  ownerEmail: string;
  authorizedEmails: string[];
  teamRoster: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PartnerAccount {
  id: string;
  workspaceId: string;
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
  completedStepIds: string[];
  notes: string;
  lastUpdatedBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface VerificationRequest {
  id: string;
  workspaceId: string;
  accountId: string;
  ownerUid: string;
  authorizedEmails: string[];
  platformName: string;
  title: string;
  instructions: string;
  portalUrl: string;
  requestedBy: PartnerOperator;
  assignedTo: PartnerOperator;
  priority: VerificationRequestPriority;
  status: VerificationRequestStatus;
  resolutionNote: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PartnerActivityLog {
  id: string;
  workspaceId: string;
  ownerUid: string;
  authorizedEmails: string[];
  actorName: string;
  action: string;
  targetPlatform: string;
  createdAt?: unknown;
}
