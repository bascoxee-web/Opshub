import {
  Facility,
  UnitType,
  Tenant,
  MissedCallItem,
  HelpTicket,
  Referral,
  TextCampaign,
  UnitReservation,
  StaffMember,
  GeneratedDocument,
  SOPSectionData,
  ConnectedBusiness,
  IntegrationServiceRequest,
} from '@/types';
import {
  INITIAL_FACILITY,
  INITIAL_UNIT_TYPES,
  INITIAL_TENANTS,
  INITIAL_MISSED_CALLS,
  INITIAL_HELP_REQUESTS,
  INITIAL_REFERRALS,
  INITIAL_CAMPAIGNS,
  INITIAL_RESERVATIONS,
  INITIAL_STAFF,
  INITIAL_DOCUMENTS,
  SAMPLE_LEASE_TEMPLATE,
  DEFAULT_SOP_SECTIONS,
  INITIAL_CONNECTED_BUSINESSES,
  INITIAL_INTEGRATION_REQUESTS,
} from './demo-data';

// Versioned keys (v2) ensure any legacy sample data cached in localStorage is cleared cleanly
const STORAGE_KEYS = {
  FACILITY: 'gatedesk_facility_v2',
  UNIT_TYPES: 'gatedesk_unit_types_v2',
  TENANTS: 'gatedesk_tenants_v2',
  MISSED_CALLS: 'gatedesk_missed_calls_v2',
  HELP_REQUESTS: 'gatedesk_help_requests_v2',
  REFERRALS: 'gatedesk_referrals_v2',
  CAMPAIGNS: 'gatedesk_campaigns_v2',
  RESERVATIONS: 'gatedesk_reservations_v2',
  STAFF: 'gatedesk_staff_v2',
  AUTH_USER: 'gatedesk_auth_user_v2',
  CURRENT_VIEW: 'gatedesk_current_view_v2',
  WIZARD_STEP: 'gatedesk_wizard_step_v2',
  WIZARD_COMPLETED: 'gatedesk_wizard_completed_v2',
  DOCUMENTS: 'gatedesk_documents_v2',
  CUSTOM_LEASE_TEMPLATE: 'gatedesk_custom_lease_template_v2',
  SOP_SECTIONS: 'gatedesk_sop_sections_v2',
  CONNECTED_BUSINESSES: 'gatedesk_connected_businesses_v2',
  INTEGRATION_REQUESTS: 'gatedesk_integration_requests_v2',
};

function safeGet<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export const StorageService = {
  getFacility: (): Facility => safeGet(STORAGE_KEYS.FACILITY, INITIAL_FACILITY),
  setFacility: (facility: Facility) => safeSet(STORAGE_KEYS.FACILITY, facility),

  getUnitTypes: (): UnitType[] => safeGet(STORAGE_KEYS.UNIT_TYPES, INITIAL_UNIT_TYPES),
  setUnitTypes: (units: UnitType[]) => safeSet(STORAGE_KEYS.UNIT_TYPES, units),

  getTenants: (): Tenant[] => safeGet(STORAGE_KEYS.TENANTS, INITIAL_TENANTS),
  setTenants: (tenants: Tenant[]) => safeSet(STORAGE_KEYS.TENANTS, tenants),

  getMissedCalls: (): MissedCallItem[] => safeGet(STORAGE_KEYS.MISSED_CALLS, INITIAL_MISSED_CALLS),
  setMissedCalls: (calls: MissedCallItem[]) => safeSet(STORAGE_KEYS.MISSED_CALLS, calls),

  getHelpRequests: (): HelpTicket[] => safeGet(STORAGE_KEYS.HELP_REQUESTS, INITIAL_HELP_REQUESTS),
  setHelpRequests: (requests: HelpTicket[]) => safeSet(STORAGE_KEYS.HELP_REQUESTS, requests),

  getReferrals: (): Referral[] => safeGet(STORAGE_KEYS.REFERRALS, INITIAL_REFERRALS),
  setReferrals: (referrals: Referral[]) => safeSet(STORAGE_KEYS.REFERRALS, referrals),

  getCampaigns: (): TextCampaign[] => safeGet(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS),
  setCampaigns: (campaigns: TextCampaign[]) => safeSet(STORAGE_KEYS.CAMPAIGNS, campaigns),

  getReservations: (): UnitReservation[] => safeGet(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS),
  setReservations: (reservations: UnitReservation[]) => safeSet(STORAGE_KEYS.RESERVATIONS, reservations),

  getStaff: (): StaffMember[] => safeGet(STORAGE_KEYS.STAFF, INITIAL_STAFF),
  setStaff: (staff: StaffMember[]) => safeSet(STORAGE_KEYS.STAFF, staff),

  getAuthUser: () => safeGet<{ email: string; name: string; role: string } | null>(STORAGE_KEYS.AUTH_USER, null),
  setAuthUser: (user: { email: string; name: string; role: string } | null) => safeSet(STORAGE_KEYS.AUTH_USER, user),

  getWizardCompleted: (): boolean => safeGet(STORAGE_KEYS.WIZARD_COMPLETED, false),
  setWizardCompleted: (val: boolean) => safeSet(STORAGE_KEYS.WIZARD_COMPLETED, val),

  getWizardStep: (): number => safeGet(STORAGE_KEYS.WIZARD_STEP, 1),
  setWizardStep: (step: number) => safeSet(STORAGE_KEYS.WIZARD_STEP, step),

  getDocuments: (): GeneratedDocument[] => safeGet(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS),
  setDocuments: (documents: GeneratedDocument[]) => safeSet(STORAGE_KEYS.DOCUMENTS, documents),

  getCustomLeaseTemplate: (): string => safeGet(STORAGE_KEYS.CUSTOM_LEASE_TEMPLATE, SAMPLE_LEASE_TEMPLATE),
  setCustomLeaseTemplate: (template: string) => safeSet(STORAGE_KEYS.CUSTOM_LEASE_TEMPLATE, template),

  getSOPSections: (): SOPSectionData => safeGet(STORAGE_KEYS.SOP_SECTIONS, DEFAULT_SOP_SECTIONS),
  setSOPSections: (sections: SOPSectionData) => safeSet(STORAGE_KEYS.SOP_SECTIONS, sections),

  getConnectedBusinesses: (): ConnectedBusiness[] =>
    safeGet(STORAGE_KEYS.CONNECTED_BUSINESSES, INITIAL_CONNECTED_BUSINESSES),
  setConnectedBusinesses: (businesses: ConnectedBusiness[]) =>
    safeSet(STORAGE_KEYS.CONNECTED_BUSINESSES, businesses),

  getIntegrationRequests: (): IntegrationServiceRequest[] =>
    safeGet(STORAGE_KEYS.INTEGRATION_REQUESTS, INITIAL_INTEGRATION_REQUESTS),
  setIntegrationRequests: (requests: IntegrationServiceRequest[]) =>
    safeSet(STORAGE_KEYS.INTEGRATION_REQUESTS, requests),

  resetAllToDefault: () => {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
  },
};
