'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ViewMode,
  PlanTier,
  Facility,
  UnitType,
  Tenant,
  MissedCallItem,
  HelpTicket,
  Referral,
  TextCampaign,
  UnitReservation,
  StaffMember,
  TicketCategory,
  ReferralStatus,
  ReservationStatus,
  GeneratedDocument,
  SOPSectionData,
  ConnectedBusiness,
  BusinessType,
  IntegrationServiceRequest,
} from '@/types';
import { StorageService } from '@/lib/storage';
import {
  INITIAL_FACILITY,
  SAMPLE_LEASE_TEMPLATE,
  DEFAULT_SOP_SECTIONS,
  INITIAL_CONNECTED_BUSINESSES,
  INDUSTRY_TEMPLATES,
} from '@/lib/demo-data';
import { WorkspaceService } from '@/lib/workspace';
import { initAuth, googleSignIn, googleSignOut } from '@/lib/firebase';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface GateDeskContextType {
  currentView: ViewMode;
  navigateTo: (view: ViewMode) => void;
  selectedPlanForCheckout: PlanTier;
  setSelectedPlanForCheckout: (plan: PlanTier) => void;

  facility: Facility;
  updateFacility: (updates: Partial<Facility>) => void;
  availableFacilities: Array<{ id: string; name: string; units: number }>;
  switchFacility: (facilityId: string) => void;
  addNewFacility: (name: string, totalUnits: number) => void;

  // Multi-Business Connected Hub
  connectedBusinesses: ConnectedBusiness[];
  activeBusiness: ConnectedBusiness;
  switchBusiness: (businessId: string) => void;
  connectNewBusiness: (businessData: {
    name: string;
    businessType: BusinessType;
    categoryLabel?: string;
    unitNoun?: string;
    customerNoun?: string;
    units: number;
    address: string;
    phone: string;
    email?: string;
    accessMethod: string;
    integrations?: string[];
    brandColor?: string;
  }) => void;
  disconnectBusiness: (id: string) => void;
  updateConnectedBusiness: (id: string, updates: Partial<ConnectedBusiness>) => void;
  integrationRequests: IntegrationServiceRequest[];
  submitIntegrationRequest: (data: {
    businessId: string;
    serviceCategory: IntegrationServiceRequest['serviceCategory'];
    toolName: string;
    priority: IntegrationServiceRequest['priority'];
    notes: string;
  }) => void;

  unitTypes: UnitType[];
  addUnitType: (unit: Omit<UnitType, 'id'>) => void;
  updateUnitType: (id: string, updates: Partial<UnitType>) => void;
  deleteUnitType: (id: string) => void;

  tenants: Tenant[];
  addTenant: (tenant: Omit<Tenant, 'id'>) => void;
  importTenantsCSV: (newTenants: Omit<Tenant, 'id'>[]) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;

  missedCalls: MissedCallItem[];
  markMissedCallReplied: (id: string, replyMessage?: string) => void;
  addMissedCallNote: (id: string, note: string) => void;

  helpRequests: HelpTicket[];
  createHelpTicket: (data: {
    tenantName: string;
    phone: string;
    unit: string;
    category: TicketCategory;
    source: 'Tenant App' | 'Website' | 'Phone';
    subject: string;
    message: string;
  }) => string;
  updateTicketStatus: (ticketId: string, status: 'New' | 'In progress' | 'Resolved') => void;
  addTicketReply: (ticketId: string, message: string, sender?: 'owner' | 'tenant') => void;

  referrals: Referral[];
  recordReferral: (data: {
    referrerName: string;
    referrerUnit: string;
    newTenantName: string;
    newTenantPhone: string;
    unitRented: string;
    rewardAmount?: number;
  }) => void;
  updateReferralStatus: (id: string, status: ReferralStatus) => void;

  campaigns: TextCampaign[];
  sendTextCampaign: (name: string, messageBody: string) => boolean;

  reservations: UnitReservation[];
  createReservation: (data: {
    customerName: string;
    phone: string;
    email: string;
    unitSize: string;
    moveInDate: string;
    source?: 'Website' | 'Tenant App';
    notes?: string;
  }) => void;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;

  // Google Calendar Integration
  isCalendarConnected: boolean;
  calendarUserEmail: string | null;
  calendarAutoSync: boolean;
  calendarReminderMinutes: number;
  connectCalendar: () => Promise<boolean>;
  disconnectCalendar: () => Promise<void>;
  setCalendarAutoSync: (enabled: boolean) => void;
  setCalendarReminderMinutes: (minutes: number) => void;
  syncReservationToCalendar: (reservationId: string) => Promise<boolean>;
  syncAllReservationsToCalendar: () => Promise<number>;
  sendEmailReminderNow: (reservationId: string) => Promise<boolean>;

  // Google Docs Document Center Integration
  generatedDocuments: GeneratedDocument[];
  customLeaseTemplate: string;
  sopSections: SOPSectionData;
  updateCustomLeaseTemplate: (template: string) => void;
  resetToSampleLeaseTemplate: () => void;
  updateSOPSections: (sections: SOPSectionData) => void;
  generateLeaseDocument: (tenantId: string, customTemplateText?: string) => Promise<GeneratedDocument | null>;
  generateSOPDocument: (sections?: SOPSectionData) => Promise<GeneratedDocument | null>;
  deleteGeneratedDocument: (id: string) => void;
  isDocsConnected: boolean;
  docsUserEmail: string | null;
  connectDocs: () => Promise<boolean>;
  disconnectDocs: () => Promise<void>;

  staff: StaffMember[];
  inviteStaff: (name: string, email: string, role: 'Owner' | 'Manager' | 'Assistant') => void;
  removeStaff: (id: string) => void;

  // Wizard state
  wizardStep: number;
  setWizardStep: (step: number) => void;
  wizardCompleted: boolean;
  completeWizard: () => void;

  // Auth state
  isLoggedIn: boolean;
  currentUser: { email: string; name: string; role: string } | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, pass: string, facilityName: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;

  // Tenant App state
  activeTenant: Tenant;
  setActiveTenant: (t: Tenant) => void;
  tenantTab: 'home' | 'help' | 'refer' | 'units' | 'pay';
  setTenantTab: (tab: 'home' | 'help' | 'refer' | 'units' | 'pay') => void;
  tenantNotifications: boolean;
  setTenantNotifications: (val: boolean) => void;
  isTenantPreviewModalOpen: boolean;
  setIsTenantPreviewModalOpen: (val: boolean) => void;

  // Dark Mode Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Global Actions
  resetDemoData: () => void;
}

let idCounter = 1000;
function createId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

const GateDeskContext = createContext<GateDeskContextType | undefined>(undefined);

export const GateDeskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as ViewMode;
      const validViews: ViewMode[] = [
        'landing', 'pricing', 'login', 'signup', 'forgot-password',
        'checkout', 'wizard', 'today', 'gate-help', 'help-requests',
        'referrals', 'campaigns', 'reservations', 'report', 'settings', 'documents', 'business-hub', 'tenant-app',
      ];
      if (validViews.includes(hash)) {
        return hash;
      }
    }
    return 'landing';
  });
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanTier>('Growth');

  const [connectedBusinesses, setConnectedBusinesses] = useState<ConnectedBusiness[]>(() =>
    StorageService.getConnectedBusinesses()
  );

  const [facility, setFacility] = useState<Facility>(() => StorageService.getFacility());
  const [availableFacilities, setAvailableFacilities] = useState(() =>
    StorageService.getConnectedBusinesses().map((b) => ({
      id: b.id,
      name: b.name,
      units: b.units,
    }))
  );

  const activeBusiness: ConnectedBusiness =
    connectedBusinesses.find((b) => b.id === facility.id) ||
    connectedBusinesses[0] || {
      id: facility.id,
      name: facility.name,
      businessType: facility.businessType || 'self-storage',
      categoryLabel: facility.businessCategoryLabel || 'Business Workspace',
      unitNoun: facility.unitLabel || 'Units',
      customerNoun: facility.customerLabel || 'Clients',
      units: facility.totalCapacity || 0,
      activeTenants: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      address: facility.address,
      phone: facility.phone,
      email: facility.email,
      accessMethod: facility.accessType || 'Standard Access',
      integrations: [],
      isPrimary: true,
      brandColor: '#0D9488',
      notes: '',
    };

  const [integrationRequests, setIntegrationRequests] = useState<IntegrationServiceRequest[]>(() =>
    StorageService.getIntegrationRequests()
  );

  const [unitTypes, setUnitTypes] = useState<UnitType[]>(() => StorageService.getUnitTypes());
  const [tenants, setTenants] = useState<Tenant[]>(() => StorageService.getTenants());
  const [missedCalls, setMissedCalls] = useState<MissedCallItem[]>(() => StorageService.getMissedCalls());
  const [helpRequests, setHelpRequests] = useState<HelpTicket[]>(() => StorageService.getHelpRequests());
  const [referrals, setReferrals] = useState<Referral[]>(() => StorageService.getReferrals());
  const [campaigns, setCampaigns] = useState<TextCampaign[]>(() => StorageService.getCampaigns());
  const [reservations, setReservations] = useState<UnitReservation[]>(() => StorageService.getReservations());
  const [staff, setStaff] = useState<StaffMember[]>(() => StorageService.getStaff());

  const [wizardStep, setWizardStepState] = useState<number>(() => StorageService.getWizardStep());
  const [wizardCompleted, setWizardCompletedState] = useState<boolean>(() => StorageService.getWizardCompleted());

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; role: string } | null>(() => StorageService.getAuthUser());

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('gatedesk_theme') as 'light' | 'dark' | null;
      return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });

  // Sync theme with documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('gatedesk_theme', nextTheme);
    }
    addToast({
      type: 'info',
      title: `${nextTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`,
    });
  };

  // Tenant App view state
  const [activeTenant, setActiveTenant] = useState<Tenant>(() => {
    const loaded = StorageService.getTenants();
    return loaded[0] || {
      id: '',
      name: 'No Tenant Selected',
      phone: '',
      email: '',
      unit: '—',
      balance: 0,
      status: 'active',
      agreedToTexts: false,
      moveInDate: '',
    };
  });
  const [tenantTab, setTenantTab] = useState<'home' | 'help' | 'refer' | 'units' | 'pay'>('home');
  const [tenantNotifications, setTenantNotifications] = useState<boolean>(true);
  const [isTenantPreviewModalOpen, setIsTenantPreviewModalOpen] = useState<boolean>(false);

  // Google Calendar Integration State
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean>(false);
  const [calendarUserEmail, setCalendarUserEmail] = useState<string | null>(null);
  const [calendarAutoSync, setCalendarAutoSync] = useState<boolean>(true);
  const [calendarReminderMinutes, setCalendarReminderMinutes] = useState<number>(1440); // 24 hours

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setIsCalendarConnected(true);
        setCalendarUserEmail(user.email || 'Connected Google Account');
      },
      () => {
        setIsCalendarConnected(false);
        setCalendarUserEmail(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Google Docs Document Center Integration State
  // [DATABASE INTEGRATION POINT]: In production, persist generated document records and custom lease templates to Firestore / Cloud SQL collections
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>(() =>
    StorageService.getDocuments()
  );
  const [customLeaseTemplate, setCustomLeaseTemplateState] = useState<string>(() =>
    StorageService.getCustomLeaseTemplate()
  );
  const [sopSections, setSopSectionsState] = useState<SOPSectionData>(() =>
    StorageService.getSOPSections()
  );

  const isDocsConnected = isCalendarConnected;
  const docsUserEmail = calendarUserEmail;
  const connectDocs = async (): Promise<boolean> => {
    return connectCalendar();
  };
  const disconnectDocs = async (): Promise<void> => {
    return disconnectCalendar();
  };

  const updateCustomLeaseTemplate = (template: string) => {
    setCustomLeaseTemplateState(template);
    StorageService.setCustomLeaseTemplate(template);
    addToast({
      type: 'success',
      title: 'Lease Template Saved',
      message: 'Custom merge tags and lease provisions updated.',
    });
  };

  const resetToSampleLeaseTemplate = () => {
    setCustomLeaseTemplateState(SAMPLE_LEASE_TEMPLATE);
    StorageService.setCustomLeaseTemplate(SAMPLE_LEASE_TEMPLATE);
    addToast({
      type: 'info',
      title: 'Sample Template Restored',
      message: 'Restored built-in sample lease agreement.',
    });
  };

  const updateSOPSections = (sections: SOPSectionData) => {
    setSopSectionsState(sections);
    StorageService.setSOPSections(sections);
    addToast({
      type: 'success',
      title: 'Facility SOP Updated',
      message: 'Standard operating procedures updated successfully.',
    });
  };

  const deleteGeneratedDocument = (id: string) => {
    setGeneratedDocuments((prev) => {
      const next = prev.filter((d) => d.id !== id);
      StorageService.setDocuments(next);
      return next;
    });
    setTenants((prev) => {
      const next = prev.map((t) => ({
        ...t,
        documents: (t.documents || []).filter((d) => d.id !== id),
      }));
      StorageService.setTenants(next);
      return next;
    });
    addToast({
      type: 'info',
      title: 'Document Removed',
      message: 'Document record deleted from GateDesk history.',
    });
  };

  const generateLeaseDocument = async (
    tenantId: string,
    customTemplateText?: string
  ): Promise<GeneratedDocument | null> => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (!tenant) {
      addToast({ type: 'error', title: 'Tenant not found' });
      return null;
    }

    if (!isDocsConnected) {
      addToast({
        type: 'error',
        title: 'Google Docs Not Connected',
        message: 'Please connect Google Docs in Settings > Integrations first.',
      });
      return null;
    }

    const unitType = unitTypes.find(
      (u) => tenant.unit.startsWith(u.size.split('x')[0]) || u.size.includes('10x10')
    ) || unitTypes[0];

    const templateToUse = customTemplateText || customLeaseTemplate || SAMPLE_LEASE_TEMPLATE;

    try {
      const result = await WorkspaceService.generateLeaseGoogleDoc({
        templateText: templateToUse,
        tenant,
        facility,
        unitType,
      });

      const newDoc: GeneratedDocument = {
        id: createId('doc'),
        type: 'lease-agreement',
        title: result.title,
        tenantId: tenant.id,
        tenantName: tenant.name,
        unitNumber: tenant.unit,
        documentId: result.documentId,
        webViewLink: result.webViewLink,
        createdAt: new Date().toISOString(),
        status: 'draft',
        variables: {
          tenant_name: tenant.name,
          tenant_phone: tenant.phone,
          tenant_email: tenant.email,
          unit_number: tenant.unit,
          unit_size: unitType ? unitType.size : 'Standard',
          monthly_rent: unitType ? String(unitType.monthlyPrice) : '145',
          move_in_date: tenant.moveInDate,
          facility_name: facility.name,
          facility_address: facility.address,
        },
        templateSnippet: result.mergedText.slice(0, 180) + '...',
      };

      // [DATABASE INTEGRATION POINT]: In production, persist generated document records and custom lease templates to Firestore / Cloud SQL collections
      setGeneratedDocuments((prev) => {
        const next = [newDoc, ...prev];
        StorageService.setDocuments(next);
        return next;
      });

      setTenants((prev) => {
        const next = prev.map((t) =>
          t.id === tenant.id ? { ...t, documents: [newDoc, ...(t.documents || [])] } : t
        );
        StorageService.setTenants(next);
        return next;
      });

      addToast({
        type: 'success',
        title: 'Lease Agreement Generated in Google Docs',
        message: `Draft created for ${tenant.name} (${tenant.unit}). Linked to tenant history.`,
      });

      return newDoc;
    } catch (err: any) {
      console.error('Error generating lease document:', err);
      addToast({
        type: 'error',
        title: 'Document Generation Failed',
        message: err.message || 'Could not generate Google Doc.',
      });
      return null;
    }
  };

  const generateSOPDocument = async (
    sections?: SOPSectionData
  ): Promise<GeneratedDocument | null> => {
    if (!isDocsConnected) {
      addToast({
        type: 'error',
        title: 'Google Docs Not Connected',
        message: 'Please connect Google Docs in Settings > Integrations first.',
      });
      return null;
    }

    const activeSections = sections || sopSections;

    try {
      const result = await WorkspaceService.generateSOPGoogleDoc({
        facility,
        sections: activeSections,
      });

      const newDoc: GeneratedDocument = {
        id: createId('doc'),
        type: 'facility-sop',
        title: result.title,
        documentId: result.documentId,
        webViewLink: result.webViewLink,
        createdAt: new Date().toISOString(),
        status: 'draft',
        variables: {
          facility_name: facility.name,
          facility_address: facility.address,
        },
        templateSnippet: result.fullText.slice(0, 180) + '...',
      };

      // [DATABASE INTEGRATION POINT]: In production, persist generated document records and custom lease templates to Firestore / Cloud SQL collections
      setGeneratedDocuments((prev) => {
        const next = [newDoc, ...prev];
        StorageService.setDocuments(next);
        return next;
      });

      addToast({
        type: 'success',
        title: 'Facility SOP Generated in Google Docs',
        message: `Standard Operating Procedures created for ${facility.name}.`,
      });

      return newDoc;
    } catch (err: any) {
      console.error('Error generating SOP document:', err);
      addToast({
        type: 'error',
        title: 'SOP Generation Failed',
        message: err.message || 'Could not create Google Doc.',
      });
      return null;
    }
  };

  // Synchronize hash on hashchange event
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ViewMode;
      const validViews: ViewMode[] = [
        'landing', 'pricing', 'login', 'signup', 'forgot-password',
        'checkout', 'wizard', 'today', 'gate-help', 'help-requests',
        'referrals', 'campaigns', 'reservations', 'report', 'settings', 'documents', 'business-hub', 'tenant-app',
      ];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: ViewMode) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      window.location.hash = view;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateFacility = (updates: Partial<Facility>) => {
    setFacility((prev) => {
      const next = { ...prev, ...updates };
      StorageService.setFacility(next);
      return next;
    });
    addToast({ type: 'success', title: 'Settings saved', message: 'Facility configuration updated.' });
  };

  const switchFacility = (facilityId: string) => {
    switchBusiness(facilityId);
  };

  const addNewFacility = (name: string, totalUnits: number) => {
    connectNewBusiness({
      name,
      businessType: 'self-storage',
      units: totalUnits,
      address: facility.address || '100 Industrial Parkway',
      phone: facility.phone || '(555) 019-9000',
      accessMethod: 'Automated Keypad Gate',
    });
  };

  const switchBusiness = (businessId: string) => {
    const b = connectedBusinesses.find((item) => item.id === businessId);
    if (b) {
      updateFacility({
        id: b.id,
        name: b.name,
        address: b.address,
        phone: b.phone,
        email: b.email,
        totalCapacity: b.units,
        businessType: b.businessType,
        businessCategoryLabel: b.categoryLabel,
        unitLabel: b.unitNoun,
        customerLabel: b.customerNoun,
        accessType: b.accessMethod,
        tenantAppSettings: {
          ...facility.tenantAppSettings,
          appName: `${b.name} Client App`,
          brandColor: b.brandColor || '#0D9488',
        },
      });

      if (INDUSTRY_TEMPLATES[b.businessType]) {
        updateCustomLeaseTemplate(INDUSTRY_TEMPLATES[b.businessType].template);
      }

      addToast({
        type: 'info',
        title: `Switched to ${b.name}`,
        message: `Active business is now ${b.categoryLabel} (${b.units} ${b.unitNoun}).`,
      });
    }
  };

  const connectNewBusiness = (data: {
    name: string;
    businessType: BusinessType;
    categoryLabel?: string;
    unitNoun?: string;
    customerNoun?: string;
    units: number;
    address: string;
    phone: string;
    email?: string;
    accessMethod: string;
    integrations?: string[];
    brandColor?: string;
  }) => {
    const newId = 'biz_' + Math.random().toString(36).substring(2, 7);
    const defaultCategoryLabels: Record<
      BusinessType,
      { category: string; units: string; customers: string; access: string; color: string }
    > = {
      'self-storage': {
        category: 'Self-Storage Facility',
        units: 'Storage Units',
        customers: 'Tenants',
        access: 'Automated Keypad Gate',
        color: '#0D9488',
      },
      'rv-boat-storage': {
        category: 'RV & Boat Storage Yard',
        units: 'Parking Bays & Slips',
        customers: 'Parking Clients',
        access: 'RFID Barcode Gate',
        color: '#2563EB',
      },
      'coworking-office': {
        category: 'Coworking & Executive Suites',
        units: 'Desks & Private Offices',
        customers: 'Members',
        access: 'Smart Keycard & PIN',
        color: '#7C3AED',
      },
      'warehouse-flex': {
        category: 'Commercial Warehouse & Flex',
        units: 'Warehouse Bays',
        customers: 'Commercial Tenants',
        access: 'Loading Dock Clearance',
        color: '#D97706',
      },
      'equipment-rental': {
        category: 'Equipment & Trailer Rental',
        units: 'Rental Fleet Assets',
        customers: 'Equipment Renters',
        access: 'Yard Keybox & Telematics',
        color: '#059669',
      },
      'commercial-property': {
        category: 'Commercial Property Management',
        units: 'Commercial Suites',
        customers: 'Commercial Tenants',
        access: 'Building Keycard & Intercom',
        color: '#4F46E5',
      },
    };
    const meta = defaultCategoryLabels[data.businessType];
    const newBiz: ConnectedBusiness = {
      id: newId,
      name: data.name,
      businessType: data.businessType,
      categoryLabel: data.categoryLabel || meta.category,
      unitNoun: data.unitNoun || meta.units,
      customerNoun: data.customerNoun || meta.customers,
      units: Number(data.units) || 0,
      activeTenants: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      address: data.address,
      phone: data.phone,
      email: data.email || '',
      accessMethod: data.accessMethod || meta.access,
      integrations: data.integrations || [],
      brandColor: data.brandColor || meta.color,
      isPrimary: connectedBusinesses.length === 0,
      notes: `Connected via GateDesk Business Hub on ${new Date().toLocaleDateString()}.`,
    };

    // [DATABASE INTEGRATION POINT]: In production, persist new business connection to Firestore / Cloud SQL collections
    setConnectedBusinesses((prev) => {
      const next = [...prev, newBiz];
      StorageService.setConnectedBusinesses(next);
      return next;
    });

    setAvailableFacilities((prev) => [...prev, { id: newBiz.id, name: newBiz.name, units: newBiz.units }]);
    switchBusiness(newId);
    addToast({
      type: 'success',
      title: 'Business Connected Successfully!',
      message: `${newBiz.name} (${newBiz.categoryLabel}) is now connected with access & tools configured.`,
    });
  };

  const disconnectBusiness = (id: string) => {
    if (connectedBusinesses.length <= 1) {
      addToast({
        type: 'error',
        title: 'Cannot Disconnect',
        message: 'At least one business must remain connected to GateDesk.',
      });
      return;
    }
    const next = connectedBusinesses.filter((b) => b.id !== id);
    setConnectedBusinesses(next);
    StorageService.setConnectedBusinesses(next);
    setAvailableFacilities(next.map((b) => ({ id: b.id, name: b.name, units: b.units })));
    if (facility.id === id) {
      switchBusiness(next[0].id);
    }
    addToast({
      type: 'info',
      title: 'Business Disconnected',
      message: 'Business removed from your GateDesk portfolio.',
    });
  };

  const updateConnectedBusiness = (id: string, updates: Partial<ConnectedBusiness>) => {
    setConnectedBusinesses((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      StorageService.setConnectedBusinesses(next);
      return next;
    });
    if (facility.id === id) {
      updateFacility(updates as Partial<Facility>);
    }
  };

  const submitIntegrationRequest = (data: {
    businessId: string;
    serviceCategory: IntegrationServiceRequest['serviceCategory'];
    toolName: string;
    priority: IntegrationServiceRequest['priority'];
    notes: string;
  }) => {
    const biz = connectedBusinesses.find((b) => b.id === data.businessId) || activeBusiness;
    const ticketSeq = Math.floor(1000 + (typeof crypto !== 'undefined' ? (crypto.getRandomValues(new Uint32Array(1))[0] % 9000) : 5500));
    const newReq: IntegrationServiceRequest = {
      id: createId('req'),
      businessId: biz.id,
      businessName: biz.name,
      serviceCategory: data.serviceCategory,
      toolName: data.toolName,
      priority: data.priority,
      notes: data.notes,
      status: 'under_review',
      requestedAt: new Date().toISOString(),
      ticketNumber: `#INT-${ticketSeq}`,
    };

    // [DATABASE INTEGRATION POINT]: In production, persist integration service requests to Firestore / Cloud SQL
    setIntegrationRequests((prev) => {
      const next = [newReq, ...prev];
      StorageService.setIntegrationRequests(next);
      return next;
    });

    addToast({
      type: 'success',
      title: 'Integration Service Request Submitted',
      message: `Request for ${data.toolName} queued under ticket ${newReq.ticketNumber}. Our team is reviewing API specifications.`,
    });
  };

  const addUnitType = (unit: Omit<UnitType, 'id'>) => {
    const newUnit: UnitType = {
      ...unit,
      id: 'u_' + Math.random().toString(36).substring(2, 7),
    };
    setUnitTypes((prev) => {
      const next = [...prev, newUnit];
      StorageService.setUnitTypes(next);
      return next;
    });
    addToast({ type: 'success', title: 'Unit category added', message: `${unit.size} added to inventory.` });
  };

  const updateUnitType = (id: string, updates: Partial<UnitType>) => {
    setUnitTypes((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, ...updates } : u));
      StorageService.setUnitTypes(next);
      return next;
    });
    addToast({ type: 'success', title: 'Unit updated', message: 'Price and availability updated.' });
  };

  const deleteUnitType = (id: string) => {
    setUnitTypes((prev) => {
      const next = prev.filter((u) => u.id !== id);
      StorageService.setUnitTypes(next);
      return next;
    });
    addToast({ type: 'info', title: 'Unit removed' });
  };

  const addTenant = (tenant: Omit<Tenant, 'id'>) => {
    const newTenant: Tenant = {
      ...tenant,
      id: 't_' + Math.random().toString(36).substring(2, 8),
    };
    setTenants((prev) => {
      const next = [newTenant, ...prev];
      StorageService.setTenants(next);
      return next;
    });
    addToast({ type: 'success', title: 'Tenant added', message: `${tenant.name} assigned to unit ${tenant.unit}.` });
  };

  const importTenantsCSV = (newTenantsList: Omit<Tenant, 'id'>[]) => {
    const formatted = newTenantsList.map((t, idx) => ({
      ...t,
      id: `t_csv_${Date.now()}_${idx}`,
    }));
    setTenants((prev) => {
      const next = [...formatted, ...prev];
      StorageService.setTenants(next);
      return next;
    });
    addToast({
      type: 'success',
      title: 'CSV Import successful',
      message: `Imported ${formatted.length} tenant records.`,
    });
  };

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      StorageService.setTenants(next);
      return next;
    });
  };

  const markMissedCallReplied = (id: string, replyMessage?: string) => {
    setMissedCalls((prev) => {
      const next = prev.map((mc) =>
        mc.id === id
          ? {
              ...mc,
              replied: true,
              repliedAt: 'Just now',
              notes: replyMessage
                ? [...mc.notes, `Sent text reply: "${replyMessage}"`]
                : mc.notes,
            }
          : mc
      );
      StorageService.setMissedCalls(next);
      return next;
    });
    addToast({
      type: 'success',
      title: 'Reply logged',
      message: 'Call marked as replied. Tenant has been notified.',
    });
  };

  const addMissedCallNote = (id: string, note: string) => {
    setMissedCalls((prev) => {
      const next = prev.map((mc) =>
        mc.id === id ? { ...mc, notes: [...mc.notes, note] } : mc
      );
      StorageService.setMissedCalls(next);
      return next;
    });
    addToast({ type: 'info', title: 'Note saved' });
  };

  const createHelpTicket = (data: {
    tenantName: string;
    phone: string;
    unit: string;
    category: TicketCategory;
    source: 'Tenant App' | 'Website' | 'Phone';
    subject: string;
    message: string;
  }): string => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `#SH-${randomNum}`;
    const newTicket: HelpTicket = {
      id: 'tkt_' + Math.random().toString(36).substring(2, 9),
      ticketNumber,
      tenantName: data.tenantName,
      phone: data.phone,
      unit: data.unit,
      category: data.category,
      source: data.source,
      status: 'New',
      subject: data.subject,
      message: data.message,
      createdAt: 'Just now',
      replies: [],
    };

    setHelpRequests((prev) => {
      const next = [newTicket, ...prev];
      StorageService.setHelpRequests(next);
      return next;
    });

    // If gate problem, also log into Gate Help Inbox
    if (data.category === 'gate') {
      const matchingTenant = tenants.find(
        (t) => t.name.toLowerCase() === data.tenantName.toLowerCase() || t.unit === data.unit
      );
      const newGateItem: MissedCallItem = {
        id: 'mc_' + Math.random().toString(36).substring(2, 9),
        callerName: data.tenantName,
        callerPhone: data.phone,
        unit: data.unit || 'Unknown',
        tenantStatus: matchingTenant?.status || 'active',
        type: 'text',
        timestamp: 'Just now',
        waitingMinutes: 0,
        replied: false,
        messageSnippet: `[Gate Help Ticket ${ticketNumber}] ${data.message}`,
        notes: [`Submitted via ${data.source}`],
      };
      setMissedCalls((prev) => {
        const nextCalls = [newGateItem, ...prev];
        StorageService.setMissedCalls(nextCalls);
        return nextCalls;
      });
    }

    addToast({
      type: 'success',
      title: 'Ticket submitted',
      message: `Ticket ${ticketNumber} created successfully.`,
    });

    return ticketNumber;
  };

  const updateTicketStatus = (ticketId: string, status: 'New' | 'In progress' | 'Resolved') => {
    setHelpRequests((prev) => {
      const next = prev.map((t) => (t.id === ticketId ? { ...t, status } : t));
      StorageService.setHelpRequests(next);
      return next;
    });
    addToast({ type: 'info', title: 'Ticket updated', message: `Status changed to ${status}.` });
  };

  const addTicketReply = (ticketId: string, message: string, sender: 'owner' | 'tenant' = 'owner') => {
    const newReply = {
      id: 'rep_' + Math.random().toString(36).substring(2, 8),
      sender,
      senderName: sender === 'owner' ? (currentUser?.name || 'Staff') : activeTenant.name,
      message,
      timestamp: 'Just now',
    };
    setHelpRequests((prev) => {
      const next = prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: t.status === 'New' && sender === 'owner' ? ('In progress' as const) : t.status,
              replies: [...t.replies, newReply],
            }
          : t
      );
      StorageService.setHelpRequests(next);
      return next;
    });
    addToast({ type: 'success', title: 'Reply sent', message: 'Message delivered to conversation.' });
  };

  const recordReferral = (data: {
    referrerName: string;
    referrerUnit: string;
    newTenantName: string;
    newTenantPhone: string;
    unitRented: string;
    rewardAmount?: number;
  }) => {
    const newRef: Referral = {
      id: 'ref_' + Math.random().toString(36).substring(2, 8),
      referrerName: data.referrerName,
      referrerUnit: data.referrerUnit,
      newTenantName: data.newTenantName,
      newTenantPhone: data.newTenantPhone,
      unitRented: data.unitRented,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending first payment',
      rewardAmount: data.rewardAmount || facility.referralRewardAmount || 50,
    };
    setReferrals((prev) => {
      const next = [newRef, ...prev];
      StorageService.setReferrals(next);
      return next;
    });
    addToast({
      type: 'success',
      title: 'Referral recorded',
      message: `${data.referrerName} referred ${data.newTenantName}.`,
    });
  };

  const updateReferralStatus = (id: string, status: ReferralStatus) => {
    setReferrals((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status } : r));
      StorageService.setReferrals(next);
      return next;
    });
    addToast({
      type: 'success',
      title: 'Reward updated',
      message: `Referral status set to: ${status}`,
    });
  };

  const sendTextCampaign = (name: string, messageBody: string): boolean => {
    // Only tenants who agreed to texts
    const eligibleTenants = tenants.filter((t) => t.agreedToTexts);
    if (eligibleTenants.length === 0) {
      addToast({
        type: 'error',
        title: 'Cannot send campaign',
        message: 'No tenants have consented to text messages.',
      });
      return false;
    }

    const compliantMessage = messageBody.includes('Reply STOP')
      ? messageBody
      : `${messageBody}\n\nReply STOP to opt out`;

    const newCampaign: TextCampaign = {
      id: 'cmp_' + Math.random().toString(36).substring(2, 8),
      name,
      message: compliantMessage,
      recipientsCount: eligibleTenants.length,
      sentAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      optOutCount: 0,
      status: 'sent',
    };

    setCampaigns((prev) => {
      const next = [newCampaign, ...prev];
      StorageService.setCampaigns(next);
      return next;
    });

    addToast({
      type: 'success',
      title: 'Campaign dispatched',
      message: `Sent to ${eligibleTenants.length} tenants with STOP compliance disclaimer.`,
    });
    return true;
  };

  const connectCalendar = async (): Promise<boolean> => {
    try {
      const res = await googleSignIn();
      if (res) {
        setIsCalendarConnected(true);
        setCalendarUserEmail(res.user.email);
        addToast({
          type: 'success',
          title: 'Google Calendar Connected',
          message: `Signed in as ${res.user.email}. Move-in dates will now sync to your calendar with email reminders.`,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Connection Failed',
        message: err.message || 'Could not connect Google Calendar account.',
      });
      return false;
    }
  };

  const disconnectCalendar = async (): Promise<void> => {
    try {
      await googleSignOut();
      setIsCalendarConnected(false);
      setCalendarUserEmail(null);
      addToast({
        type: 'info',
        title: 'Google Calendar Disconnected',
        message: 'Move-in reservations will no longer auto-sync to Calendar.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Could not disconnect account.',
      });
    }
  };

  const createReservation = async (data: {
    customerName: string;
    phone: string;
    email: string;
    unitSize: string;
    moveInDate: string;
    source?: 'Website' | 'Tenant App';
    notes?: string;
  }) => {
    const newId = 'res_' + Math.random().toString(36).substring(2, 8);
    let calendarEventId: string | undefined;
    let calendarEventLink: string | undefined;
    let calendarSyncedAt: string | undefined;

    if (isCalendarConnected && calendarAutoSync) {
      try {
        const event = await WorkspaceService.createReservationMoveInEvent(
          {
            customerName: data.customerName,
            phone: data.phone,
            email: data.email,
            unitSize: data.unitSize,
            moveInDate: data.moveInDate,
            notes: data.notes,
          },
          facility.name,
          calendarReminderMinutes
        );
        calendarEventId = event.id;
        calendarEventLink = event.htmlLink;
        calendarSyncedAt = 'Just now';
      } catch (err) {
        console.error('Auto calendar sync error:', err);
      }
    }

    const newRes: UnitReservation = {
      id: newId,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      unitSize: data.unitSize,
      moveInDate: data.moveInDate,
      reservedAt: 'Just now',
      status: 'New',
      source: data.source || 'Website',
      notes: data.notes || 'Submitted online via reservation portal.',
      calendarEventId,
      calendarEventLink,
      calendarSyncedAt,
      reminderMinutes: calendarReminderMinutes,
    };

    setReservations((prev) => {
      const next = [newRes, ...prev];
      StorageService.setReservations(next);
      return next;
    });

    if (calendarEventId) {
      const reminderHours = Math.round(calendarReminderMinutes / 60);
      addToast({
        type: 'success',
        title: 'Move-In Scheduled on Google Calendar',
        message: `Move-in for ${data.customerName} on ${data.moveInDate} synced to Google Calendar. Email reminder set for ${reminderHours}h prior.`,
      });
    } else {
      addToast({
        type: 'success',
        title: 'Reservation received!',
        message: `Hold requested for ${data.unitSize}.`,
      });
    }
  };

  const syncReservationToCalendar = async (reservationId: string): Promise<boolean> => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return false;

    if (!isCalendarConnected) {
      addToast({
        type: 'error',
        title: 'Google Calendar Not Connected',
        message: 'Please connect your Google Calendar account first using the banner above.',
      });
      return false;
    }

    try {
      const event = await WorkspaceService.createReservationMoveInEvent(
        {
          customerName: res.customerName,
          phone: res.phone,
          email: res.email,
          unitSize: res.unitSize,
          moveInDate: res.moveInDate,
          notes: res.notes,
        },
        facility.name,
        calendarReminderMinutes
      );

      const reminderHours = Math.round(calendarReminderMinutes / 60);
      setReservations((prev) => {
        const next = prev.map((r) =>
          r.id === reservationId
            ? {
                ...r,
                calendarEventId: event.id,
                calendarEventLink: event.htmlLink,
                calendarSyncedAt: 'Just now',
                reminderMinutes: calendarReminderMinutes,
              }
            : r
        );
        StorageService.setReservations(next);
        return next;
      });

      addToast({
        type: 'success',
        title: 'Synced to Google Calendar',
        message: `Move-in for ${res.customerName} on ${res.moveInDate} scheduled. Email reminder will arrive ${reminderHours}h before move-in.`,
      });
      return true;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Calendar Sync Failed',
        message: err.message || 'Could not create Google Calendar event.',
      });
      return false;
    }
  };

  const syncAllReservationsToCalendar = async (): Promise<number> => {
    if (!isCalendarConnected) {
      addToast({
        type: 'error',
        title: 'Google Calendar Not Connected',
        message: 'Please connect your Google Calendar account first.',
      });
      return 0;
    }

    const unsynced = reservations.filter((r) => !r.calendarEventId && r.status !== 'Cancelled');
    if (unsynced.length === 0) {
      addToast({
        type: 'info',
        title: 'All Up To Date',
        message: 'All active move-in reservations are already scheduled in Google Calendar.',
      });
      return 0;
    }

    let count = 0;
    for (const r of unsynced) {
      try {
        const event = await WorkspaceService.createReservationMoveInEvent(
          {
            customerName: r.customerName,
            phone: r.phone,
            email: r.email,
            unitSize: r.unitSize,
            moveInDate: r.moveInDate,
            notes: r.notes,
          },
          facility.name,
          calendarReminderMinutes
        );

        setReservations((prev) => {
          const next = prev.map((item) =>
            item.id === r.id
              ? {
                  ...item,
                  calendarEventId: event.id,
                  calendarEventLink: event.htmlLink,
                  calendarSyncedAt: 'Just now',
                  reminderMinutes: calendarReminderMinutes,
                }
              : item
          );
          StorageService.setReservations(next);
          return next;
        });
        count++;
      } catch (err) {
        console.error('Batch sync error:', err);
      }
    }

    addToast({
      type: 'success',
      title: 'Batch Calendar Sync Complete',
      message: `Created ${count} Google Calendar move-in event(s) with automated owner email reminders.`,
    });
    return count;
  };

  const sendEmailReminderNow = async (reservationId: string): Promise<boolean> => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return false;

    setReservations((prev) => {
      const next = prev.map((r) =>
        r.id === reservationId ? { ...r, emailReminderSent: true } : r
      );
      StorageService.setReservations(next);
      return next;
    });

    addToast({
      type: 'success',
      title: 'Reminder Email Dispatched',
      message: `Move-in reminder notice emailed to ${calendarUserEmail || currentUser?.email || 'owner@facility.com'} for ${res.customerName} (Target Date: ${res.moveInDate}).`,
    });
    return true;
  };

  const updateReservationStatus = (id: string, status: ReservationStatus) => {
    setReservations((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status } : r));
      StorageService.setReservations(next);
      return next;
    });
    addToast({ type: 'info', title: 'Reservation updated', message: `Marked as ${status}.` });
  };

  const inviteStaff = (name: string, email: string, role: 'Owner' | 'Manager' | 'Assistant') => {
    const newStaff: StaffMember = {
      id: 'st_' + Math.random().toString(36).substring(2, 8),
      name,
      email,
      role,
      status: 'Active',
      addedAt: 'Just now',
    };
    setStaff((prev) => {
      const next = [...prev, newStaff];
      StorageService.setStaff(next);
      return next;
    });
    addToast({ type: 'success', title: 'Invitation sent', message: `${name} has been invited as ${role}.` });
  };

  const removeStaff = (id: string) => {
    setStaff((prev) => {
      const next = prev.filter((s) => s.id !== id);
      StorageService.setStaff(next);
      return next;
    });
    addToast({ type: 'info', title: 'Staff member removed' });
  };

  const setWizardStep = (step: number) => {
    setWizardStepState(step);
    StorageService.setWizardStep(step);
  };

  const completeWizard = () => {
    setWizardCompletedState(true);
    StorageService.setWizardCompleted(true);
    addToast({
      type: 'success',
      title: 'Facility onboarded!',
      message: 'GateDesk is ready to capture missed calls and referrals.',
    });
    navigateTo('today');
  };

  // Auth simulation
  const login = async (email: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 600));
    const userObj = { email, name: email.split('@')[0], role: 'Owner' };
    setCurrentUser(userObj);
    setIsLoggedIn(true);
    StorageService.setAuthUser(userObj);
    addToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${email}` });
    navigateTo('today');
    return true;
  };

  const signup = async (email: string, _pass: string, facilityName: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 700));
    const userObj = { email, name: email.split('@')[0], role: 'Owner' };
    setCurrentUser(userObj);
    setIsLoggedIn(true);
    updateFacility({ name: facilityName || 'My Storage Facility' });
    StorageService.setAuthUser(userObj);
    addToast({ type: 'success', title: 'Account created!', message: 'Choose your plan to start.' });
    navigateTo('checkout');
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    StorageService.setAuthUser(null);
    addToast({ type: 'info', title: 'Logged out', message: 'You have been safely signed out.' });
    navigateTo('landing');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 800));
    addToast({
      type: 'success',
      title: 'Reset instructions sent',
      message: `Password reset link emailed to ${email}.`,
    });
    return true;
  };

  const resetDemoData = () => {
    StorageService.resetAllToDefault();
    setFacility(INITIAL_FACILITY);
    setConnectedBusinesses([]);
    setAvailableFacilities([]);
    setIntegrationRequests([]);
    setUnitTypes([]);
    setTenants([]);
    setActiveTenant({
      id: '',
      name: 'No Tenant Selected',
      phone: '',
      email: '',
      unit: '—',
      balance: 0,
      status: 'active',
      agreedToTexts: false,
      moveInDate: '',
    });
    setMissedCalls([]);
    setHelpRequests([]);
    setReferrals([]);
    setCampaigns([]);
    setReservations([]);
    setStaff([]);
    setGeneratedDocuments([]);
    setWizardCompletedState(false);
    setWizardStepState(1);
    addToast({
      type: 'info',
      title: 'Workspace cleared',
      message: 'All local workspace records have been cleared.',
    });
  };

  return (
    <GateDeskContext.Provider
      value={{
        currentView,
        navigateTo,
        selectedPlanForCheckout,
        setSelectedPlanForCheckout,

        facility,
        updateFacility,
        availableFacilities,
        switchFacility,
        addNewFacility,

        // Multi-Business Connected Hub
        connectedBusinesses,
        activeBusiness,
        switchBusiness,
        connectNewBusiness,
        disconnectBusiness,
        updateConnectedBusiness,
        integrationRequests,
        submitIntegrationRequest,

        unitTypes,
        addUnitType,
        updateUnitType,
        deleteUnitType,

        tenants,
        addTenant,
        importTenantsCSV,
        updateTenant,

        missedCalls,
        markMissedCallReplied,
        addMissedCallNote,

        helpRequests,
        createHelpTicket,
        updateTicketStatus,
        addTicketReply,

        referrals,
        recordReferral,
        updateReferralStatus,

        campaigns,
        sendTextCampaign,

        reservations,
        createReservation,
        updateReservationStatus,

        // Google Calendar
        isCalendarConnected,
        calendarUserEmail,
        calendarAutoSync,
        calendarReminderMinutes,
        connectCalendar,
        disconnectCalendar,
        setCalendarAutoSync,
        setCalendarReminderMinutes,
        syncReservationToCalendar,
        syncAllReservationsToCalendar,
        sendEmailReminderNow,

        // Google Docs Document Center
        generatedDocuments,
        customLeaseTemplate,
        sopSections,
        updateCustomLeaseTemplate,
        resetToSampleLeaseTemplate,
        updateSOPSections,
        generateLeaseDocument,
        generateSOPDocument,
        deleteGeneratedDocument,
        isDocsConnected,
        docsUserEmail,
        connectDocs,
        disconnectDocs,

        staff,
        inviteStaff,
        removeStaff,

        wizardStep,
        setWizardStep,
        wizardCompleted,
        completeWizard,

        isLoggedIn,
        currentUser,
        login,
        logout,
        signup,
        resetPassword,

        activeTenant,
        setActiveTenant,
        tenantTab,
        setTenantTab,
        tenantNotifications,
        setTenantNotifications,
        isTenantPreviewModalOpen,
        setIsTenantPreviewModalOpen,

        // Theme
        theme,
        toggleTheme,

        toasts,
        addToast,
        removeToast,

        resetDemoData,
      }}
    >
      {children}
    </GateDeskContext.Provider>
  );
};

export const useGateDesk = () => {
  const ctx = useContext(GateDeskContext);
  if (!ctx) throw new Error('useGateDesk must be used within GateDeskProvider');
  return ctx;
};
