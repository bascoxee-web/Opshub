export type ViewMode =
  | 'landing'
  | 'pricing'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'checkout'
  | 'wizard'
  | 'today'
  | 'gate-help'
  | 'help-requests'
  | 'referrals'
  | 'campaigns'
  | 'reservations'
  | 'report'
  | 'settings'
  | 'documents'
  | 'business-hub'
  | 'tenant-app';

export type BusinessType =
  | 'self-storage'
  | 'rv-boat-storage'
  | 'coworking-office'
  | 'warehouse-flex'
  | 'equipment-rental'
  | 'commercial-property';

export interface ConnectedBusiness {
  id: string;
  name: string;
  businessType: BusinessType;
  categoryLabel: string;
  unitNoun: string;
  customerNoun: string;
  units: number;
  activeTenants: number;
  monthlyRevenue: number;
  occupancyRate: number;
  address: string;
  phone: string;
  email: string;
  accessMethod: string;
  integrations: string[];
  isPrimary?: boolean;
  brandColor?: string;
  notes?: string;
}

export interface IntegrationServiceRequest {
  id: string;
  businessId: string;
  businessName: string;
  serviceCategory: 'voip-sms' | 'accounting' | 'access-hardware' | 'pms-software' | 'automation-api' | 'other';
  toolName: string;
  priority: 'standard' | 'high' | 'critical';
  notes: string;
  status: 'under_review' | 'in_progress' | 'connected';
  requestedAt: string;
  ticketNumber: string;
}

export type PlanTier = 'Starter' | 'Growth' | 'Managed';

export interface PlanDetails {
  tier: PlanTier;
  price: number;
  billingCycle: 'monthly';
  features: string[];
  isPopular?: boolean;
  nextPaymentDate: string;
}

export interface UnitType {
  id: string;
  size: string; // e.g. "10x10"
  description: string;
  monthlyPrice: number;
  climateControlled: boolean;
  totalUnits: number;
  unitsAvailable: number;
  features?: string[];
}

export type TenantStatus = 'active' | 'locked out' | 'moved out';

export interface GeneratedDocument {
  id: string;
  type: 'lease-agreement' | 'facility-sop';
  title: string;
  tenantId?: string;
  tenantName?: string;
  unitNumber?: string;
  documentId: string;
  webViewLink: string;
  createdAt: string;
  status: 'draft'; // Always rendered as "Draft — review before sending to tenant"
  variables?: Record<string, string>;
  templateSnippet?: string;
}

export interface SOPSectionData {
  openingClosing: string;
  gateSecurity: string;
  overdueEscalation: string; // Labeled "Adjust to your state's rules"
  emergencyProtocol: string;
  staffDirectory: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  unit: string;
  balance: number;
  status: TenantStatus;
  agreedToTexts: boolean;
  moveInDate: string;
  gateCodeHint?: string; // e.g. "Last 4 of phone" - NEVER actual secret
  documents?: GeneratedDocument[];
}

export type TicketCategory = 'gate' | 'billing' | 'unit' | 'moving' | 'other';
export type TicketSource = 'Tenant App' | 'Website' | 'Phone';
export type TicketStatus = 'New' | 'In progress' | 'Resolved';

export interface TicketReply {
  id: string;
  sender: 'owner' | 'tenant';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface HelpTicket {
  id: string;
  ticketNumber: string; // e.g. "#SH-8291"
  tenantName: string;
  phone: string;
  unit: string;
  category: TicketCategory;
  source: TicketSource;
  status: TicketStatus;
  subject: string;
  message: string;
  createdAt: string;
  replies: TicketReply[];
}

export interface MissedCallItem {
  id: string;
  callerName: string;
  callerPhone: string;
  unit: string;
  tenantStatus: TenantStatus;
  type: 'call' | 'text';
  timestamp: string;
  waitingMinutes: number;
  replied: boolean;
  repliedAt?: string;
  messageSnippet?: string;
  notes: string[];
}

export type ReferralStatus = 'Pending first payment' | 'Reward due' | 'Reward applied';

export interface Referral {
  id: string;
  referrerName: string;
  referrerUnit: string;
  newTenantName: string;
  newTenantPhone: string;
  unitRented: string;
  date: string;
  status: ReferralStatus;
  rewardAmount: number;
}

export interface TextCampaign {
  id: string;
  name: string;
  message: string;
  recipientsCount: number;
  sentAt: string;
  optOutCount: number;
  status: 'sent' | 'scheduled';
}

export type ReservationStatus = 'New' | 'Contacted' | 'Moved in' | 'Cancelled';

export interface UnitReservation {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  unitSize: string;
  moveInDate: string;
  reservedAt: string;
  status: ReservationStatus;
  source: 'Website' | 'Tenant App';
  notes?: string;
  calendarEventId?: string;
  calendarEventLink?: string;
  calendarSyncedAt?: string;
  emailReminderSent?: boolean;
  reminderMinutes?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Assistant';
  status: 'Active' | 'Pending';
  addedAt: string;
}

export interface Facility {
  id: string;
  name: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email?: string;
  officeHours: string;
  gateHours: string;
  paymentPortalUrl: string;
  totalCapacity: number;
  plan: PlanDetails;
  phoneConnection: {
    provider: 'Quo (OpenPhone)';
    connected: boolean;
    apiKey: string;
    lastSync: string;
  };
  tenantAppSettings: {
    enabled: boolean;
    appName: string;
    brandColor: string; // hex
    subdomain: string;
    allowNotifications: boolean;
  };
  referralRewardAmount: number;
  customLeaseTemplate?: string;
  businessType?: BusinessType;
  businessCategoryLabel?: string;
  unitLabel?: string; // e.g. "Storage Units", "Parking Bays", "Desks & Offices", "Warehouse Bays", "Rental Fleet"
  customerLabel?: string; // e.g. "Tenants", "Members", "Clients", "Renters"
  accessType?: string; // e.g. "Automated Gate", "Keypad PIN", "Smart Badge", "Loading Dock Clearance"
}
