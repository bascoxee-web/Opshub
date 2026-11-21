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
  BusinessType,
  IntegrationServiceRequest,
} from '@/types';

export const INITIAL_FACILITY: Facility = {
  id: 'workspace_primary',
  name: 'My Business Workspace',
  logoUrl: '',
  address: '',
  phone: '',
  email: '',
  officeHours: '',
  gateHours: '',
  paymentPortalUrl: '',
  totalCapacity: 0,
  businessType: 'self-storage',
  businessCategoryLabel: 'Business Workspace',
  unitLabel: 'Units',
  customerLabel: 'Clients',
  accessType: 'Standard Access',
  plan: {
    tier: 'Growth',
    price: 129,
    billingCycle: 'monthly',
    isPopular: true,
    nextPaymentDate: '',
    features: [
      'Gate Help inbox & missed-call alerts',
      'Instant help request routing',
      'Automated referral tracker',
      'Targeted text campaigns',
      'Live Available Units embed',
      'Branded Tenant App (iOS/Android PWA)',
      'Monthly owner financial report',
    ],
  },
  phoneConnection: {
    provider: 'Quo (OpenPhone)',
    connected: false,
    apiKey: '',
    lastSync: '',
  },
  tenantAppSettings: {
    enabled: false,
    appName: 'Client Portal App',
    brandColor: '#0D9488',
    subdomain: '',
    allowNotifications: false,
  },
  referralRewardAmount: 50,
};

export const INITIAL_UNIT_TYPES: UnitType[] = [];

export const INITIAL_TENANTS: Tenant[] = [];

export const INITIAL_MISSED_CALLS: MissedCallItem[] = [];

export const INITIAL_HELP_REQUESTS: HelpTicket[] = [];

export const INITIAL_REFERRALS: Referral[] = [];

export const INITIAL_CAMPAIGNS: TextCampaign[] = [];

export const INITIAL_RESERVATIONS: UnitReservation[] = [];

export const INITIAL_STAFF: StaffMember[] = [];

export const SAMPLE_LEASE_TEMPLATE = `DRAFT TEMPLATE — HAVE YOUR ATTORNEY REVIEW BEFORE USE
NOTICE: Self-storage lien, late fee, and statutory auction rules vary significantly by state. Consult your attorney before adopting any agreement.

STANDARD SELF-STORAGE RENTAL AGREEMENT

1. PARTIES & FACILITY
Facility / Landlord: {{facility_name}}
Address: {{facility_address}}
Phone: {{facility_phone}}

Tenant Name: {{tenant_name}}
Phone: {{tenant_phone}}
Email: {{tenant_email}}

2. LEASED SPACE & TERM
Unit Number: {{unit_number}}
Unit Size: {{unit_size}}
Move-In Date: {{move_in_date}}
Monthly Rental Rate: \${{monthly_rent}}.00 USD (due on the 1st of each month)

3. PERMITTED USE & PROHIBITED ITEMS
The Leased Space shall be used solely for the storage of personal or commercial property owned by Tenant. Tenant shall NOT store: living animals, illegal substances, toxic or hazardous materials, explosive or flammable chemicals, perishable foods, or stolen goods. Habitation or sleeping in the storage unit is strictly prohibited by law.

4. GATE ACCESS & SECURITY POLICY
Access Policy: Tenant must enter the facility using only their individually assigned security credentials. Access credentials are personal and non-transferable; sharing access credentials with unauthorized third parties is grounds for immediate termination. (Never write actual gate codes on this document).

5. PAYMENT, LATE FEES & LIEN RIGHTS
Rent is due on or before the 1st day of each month. In accordance with applicable state self-storage statutes, if rent remains unpaid following any statutory grace period, late fees will be assessed, gate access will be suspended, and Facility may place an overlock on the unit. Continued default may result in statutory lien enforcement and sale of stored property as governed by state law.
[NOTE: Adjust lien, grace period, and late fee amounts to comply with your specific state statutes.]

6. SIGNATURES & ACCEPTANCE
By signing below, Tenant acknowledges receipt of a copy of this Agreement and agrees to all terms and conditions set forth herein.

Tenant Signature: _________________________________    Date: ____________________

Facility Representative: __________________________    Date: ____________________
`;

export const DEFAULT_SOP_SECTIONS: SOPSectionData = {
  openingClosing: `1. Daily Opening Checklist:
• Inspect perimeter access points and security equipment.
• Verify office lobby, customer kiosk, and work areas are ready.
• Review GateDesk dashboard for overnight missed calls, help requests, and reservations.

2. Daily Closing Checklist:
• Verify all gates and access doors close properly and switch to evening schedule.
• Confirm vacant units are inspected and ready for move-in.
• Check exterior lighting, cameras, and lock office doors.`,

  gateSecurity: `Access & Security Protocol:
• Every client is assigned unique personal access credentials at onboarding.
• Never disclose or print access PINs on public notices or shared agreements.
• Access lockout triggers automatically when account balance is past due.
• Log any access equipment faults or incidents immediately.`,

  overdueEscalation: `[Adjust to your state's rules — Lien & Late-Fee Timeline]
• Day 1 (1st of month): Rent due. Automated payment reminder sent.
• Day 6: Late fee assessed per state-compliant agreement terms.
• Day 7: Access suspended automatically. Follow-up call logged in GateDesk.
• Day 14: Overlock placed by staff and overdue notice issued.
• Day 30+: Statutory notice procedures initiated per local regulations.`,

  emergencyProtocol: `Emergency Response & Incidents:
• Fire / Hazardous Odors: Evacuate immediately, call emergency services, and notify owner.
• Severe Weather / Water Leak: Inspect drainage, identify affected spaces, and notify clients.
• Break-In / Vandalism: Preserve scene, contact local police, and save camera footage.
• Medical Emergency: Call emergency services immediately.`,

  staffDirectory: `Staff Directory & Escalation Tree:
• Primary Owner: [Add owner name & email in Settings]
• Operations Manager: [Add manager name & email]
• Support Phone Line: [Configure in Settings > Phone]
• After-Hours Emergency Contact: [Add after-hours contact]`,
};

export const INITIAL_DOCUMENTS: GeneratedDocument[] = [];

export const INITIAL_CONNECTED_BUSINESSES: ConnectedBusiness[] = [];

export const INDUSTRY_TEMPLATES: Record<BusinessType, { name: string; template: string; description: string }> = {
  'self-storage': {
    name: 'Self-Storage Rental Agreement',
    description: 'Standard month-to-month storage unit rental contract with lien law compliance warnings.',
    template: SAMPLE_LEASE_TEMPLATE,
  },
  'rv-boat-storage': {
    name: 'RV & Boat Vehicle Storage Agreement',
    description: 'Includes vehicle VIN/hull registration, drip pans, proof of insurance, and gate hours.',
    template: `================================================================================
DRAFT TEMPLATE — HAVE YOUR ATTORNEY REVIEW BEFORE USE
NOTE: Vehicle lien laws, insurance mandates, and abandonment rules vary by state.
DO NOT INSERT ACTUAL GATE CODES INTO THIS DOCUMENT. DESCRIBE ACCESS POLICIES ONLY.
================================================================================

VEHICLE, RV & BOAT OUTDOOR STORAGE AGREEMENT
Draft Document — Generated via GateDesk Multi-Business Hub

FACILITY OPERATOR:
Business Name: {{facility_name}}
Physical Address: {{facility_address}}
Office Phone: {{facility_phone}}

STORED VEHICLE OWNER (CLIENT):
Client Name: {{tenant_name}}
Primary Phone: {{tenant_phone}}
Notification Email: {{tenant_email}}

ASSIGNED PARKING SPACE / SLIP:
Assigned Bay Number: {{unit_number}}
Bay Classification / Dimensions: {{unit_size}}
Monthly Storage Fee: \${{monthly_rent}} / month
Effective Commencement Date: {{move_in_date}}

1. PERMITTED VEHICLE / WATERCRAFT:
The Client agrees that only the registered vehicle or vessel identified in facility records shall be parked in the assigned space. Vehicle must be clean, operable, and currently registered with valid proof of comprehensive and liability insurance on file.

2. FACILITY ACCESS & GATE POLICY:
Access to the yard is controlled by automated perimeter security gate. Client must present their designated credentials during posted operating hours. Tailgating behind other vehicles is strictly forbidden for security and safety.

3. LIEN RIGHTS, DEFAULT & VEHICLE TOWING:
(Adjust to your state's rules) If storage charges remain unpaid past the statutory cure window, the Operator reserves the right to deny gate clearance and initiate statutory vehicle lien procedures or impound towing in compliance with state motor vehicle codes.

CLIENT ACKNOWLEDGEMENT:
Client Signature: _______________________ Date: _________________
Operator Agent: _______________________ Date: _________________
`,
  },
  'coworking-office': {
    name: 'Coworking Membership & Office Agreement',
    description: 'Flexible office, hot desk, and dedicated space agreement with community guidelines.',
    template: `================================================================================
DRAFT TEMPLATE — HAVE YOUR ATTORNEY REVIEW BEFORE USE
NOTE: Commercial licensing, guest rules, and security policies vary by jurisdiction.
DO NOT INSERT ACTUAL ACCESS CODES INTO THIS DOCUMENT. DESCRIBE ACCESS POLICIES ONLY.
================================================================================

COWORKING SPACE MEMBERSHIP & EXECUTIVE OFFICE AGREEMENT
Draft Document — Generated via GateDesk Multi-Business Hub

COWORKING OPERATOR:
Workspace Name: {{facility_name}}
Premises Address: {{facility_address}}
Concierge Phone: {{facility_phone}}

WORKSPACE MEMBER (ORGANIZATION / INDIVIDUAL):
Member Name: {{tenant_name}}
Primary Contact: {{tenant_phone}}
Billing Email: {{tenant_email}}

MEMBERSHIP ALLOCATION:
Assigned Suite / Dedicated Desk: {{unit_number}}
Membership Tier / Category: {{unit_size}}
Monthly Membership Dues: \${{monthly_rent}} / month
Membership Effective Date: {{move_in_date}}

1. SCOPE OF MEMBERSHIP:
Operator grants Member a revocable license to use designated coworking workspace and communal conference spaces in accordance with community guidelines. This agreement constitutes a revocable commercial license, not a residential tenancy.

2. BUILDING & SUITE ACCESS POLICY:
Building access is managed via encrypted mobile credential or RFID keycard. Member credentials are strictly non-transferable. Visitors must be signed in at the front concierge desk.

3. PAYMENT TERMS & CANCELLATION:
Membership dues are billed monthly in advance. Thirty (30) days written notice is required prior to renewal for termination. Unpaid balances will result in temporary suspension of door access and room reservations.

MEMBER ACKNOWLEDGEMENT:
Authorized Member Signature: _______________________ Date: ______________
Operator Director: _______________________ Date: ______________
`,
  },
  'warehouse-flex': {
    name: 'Commercial Warehouse Bay Lease',
    description: 'Industrial warehouse and flex space lease for logistics, light manufacturing, and contractor bays.',
    template: `================================================================================
DRAFT TEMPLATE — HAVE YOUR ATTORNEY REVIEW BEFORE USE
NOTE: Commercial leasing, hazardous materials, and industrial zoning vary by state.
DO NOT INSERT ACTUAL GATE CODES INTO THIS DOCUMENT. DESCRIBE ACCESS POLICIES ONLY.
================================================================================

COMMERCIAL WAREHOUSE & FLEX SPACE LEASE
Draft Document — Generated via GateDesk Multi-Business Hub

LESSOR (OPERATOR):
Commercial Entity: {{facility_name}}
Park Address: {{facility_address}}
Operations Phone: {{facility_phone}}

LESSEE (TENANT):
Commercial Tenant: {{tenant_name}}
Authorized Agent Phone: {{tenant_phone}}
Accounting Email: {{tenant_email}}

PREMISES & LEASE PARTICULARS:
Assigned Bay / Suite: {{unit_number}}
Clearance & Square Footage: {{unit_size}}
Base Monthly Rent: \${{monthly_rent}} / month
Lease Term Commencement: {{move_in_date}}

1. AUTHORIZED INDUSTRIAL USE:
The premises shall be occupied strictly for light assembly, inventory warehousing, packaging, or professional trade contractor operations in compliance with local fire, municipal, and environmental zoning codes.

2. LOADING DOCK & TRUCK COURT ACCESS:
Common loading docks and staging courts must remain unobstructed. Tenant vehicles and delivery freight trucks must observe facility traffic routing and clearance protocols at all times.

3. DEFAULT, COMMERCIAL LIEN & EVICTION:
(Adjust to your state's rules) Failure to remit base rent or triple-net charges by the designated grace date entitles Lessor to enforce default interest, accelerate rent, and exercise statutory commercial landlord remedies.

LESSEE SIGNATURE:
Authorized Officer: _______________________ Date: _______________
LESSOR SIGNATURE:
Property General Partner: _______________________ Date: _______________
`,
  },
  'equipment-rental': {
    name: 'Equipment & Heavy Machinery Rental Contract',
    description: 'Contract for trailers, compact excavators, power equipment, and fleet rental.',
    template: `================================================================================
DRAFT TEMPLATE — HAVE YOUR ATTORNEY REVIEW BEFORE USE
NOTE: Equipment liability, damage waiver, and return obligations vary by state.
DO NOT INSERT ACTUAL ACCESS CODES INTO THIS DOCUMENT. DESCRIBE ACCESS POLICIES ONLY.
================================================================================

EQUIPMENT & MACHINERY RENTAL AGREEMENT
Draft Document — Generated via GateDesk Multi-Business Hub

DEPOT OPERATOR:
Business Name: {{facility_name}}
Yard Location: {{facility_address}}
Dispatch Phone: {{facility_phone}}

RENTER:
Customer Name: {{tenant_name}}
Phone: {{tenant_phone}}
Email: {{tenant_email}}

RENTAL ASSET DETAILS:
Asset ID / Serial Number: {{unit_number}}
Equipment Class / Make / Model: {{unit_size}}
Rental Rate: \${{monthly_rent}} / billing period
Dispatch Date: {{move_in_date}}

1. CONDITION OF EQUIPMENT:
Renter acknowledges receipt of the equipment in good operating condition and agrees to return it clean, fueled, and in identical mechanical order, ordinary wear and tear excepted.

2. OPERATION & YARD SECURITY:
Equipment shall only be operated by qualified, certified personnel. If equipment is stored in the Operator yard during non-working hours, Renter shall adhere to posted yard entry and equipment staging rules.

3. LOSS, DAMAGE & INDEMNITY:
Renter assumes full risk of loss, theft, vandalism, or damage during the rental period. Renter agrees to defend and hold Operator harmless from all claims arising out of equipment transport or operation.

RENTER SIGNATURE:
Customer Signature: _______________________ Date: _______________
DISPATCH AGENT:
Authorized Agent: _______________________ Date: _______________
`,
  },
  'commercial-property': {
    name: 'Commercial Property & Suite Agreement',
    description: 'General commercial property and multi-tenant facility license.',
    template: SAMPLE_LEASE_TEMPLATE,
  },
};

export const INITIAL_INTEGRATION_REQUESTS: IntegrationServiceRequest[] = [];
