'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { UnitType, Tenant } from '@/types';
import confetti from 'canvas-confetti';
import {
  Building,
  Upload,
  Phone,
  FileSpreadsheet,
  Code2,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export const SetupWizard: React.FC = () => {
  const {
    wizardStep,
    setWizardStep,
    completeWizard,
    facility,
    updateFacility,
    unitTypes,
    addUnitType,
    deleteUnitType,
    importTenantsCSV,
    tenants,
    staff,
    inviteStaff,
    removeStaff,
    navigateTo,
    addToast,
  } = useGateDesk();

  // Step 1: Facility Details State
  const [facName, setFacName] = useState(facility.name);
  const [facAddress, setFacAddress] = useState(facility.address);
  const [facPhone, setFacPhone] = useState(facility.phone);
  const [facOfficeHours, setFacOfficeHours] = useState(facility.officeHours);
  const [facGateHours, setFacGateHours] = useState(facility.gateHours);
  const [facPaymentUrl, setFacPaymentUrl] = useState(facility.paymentPortalUrl);
  const [facLogoPreview, setFacLogoPreview] = useState(facility.logoUrl || '');

  // Step 2: Add unit modal state
  const [newUnitSize, setNewUnitSize] = useState('10x10');
  const [newUnitPrice, setNewUnitPrice] = useState(145);
  const [newUnitClimate, setNewUnitClimate] = useState(true);
  const [newUnitTotal, setNewUnitTotal] = useState(30);
  const [newUnitAvailable, setNewUnitAvailable] = useState(5);

  // Step 3: Phone connection state
  const [quoApiKey, setQuoApiKey] = useState(facility.phoneConnection.apiKey || 'quo_live_89a7f3e2b1049c');
  const [isConnectingPhone, setIsConnectingPhone] = useState(false);
  const [phoneConnected, setPhoneConnected] = useState(facility.phoneConnection.connected);

  // Step 4: CSV Upload state
  const [parsedCsvRows, setParsedCsvRows] = useState<any[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    name: 'name',
    phone: 'phone',
    email: 'email',
    unit: 'unit',
    balance: 'balance',
    status: 'status',
    agreedToTexts: 'agreedToTexts',
  });
  const [csvImportDone, setCsvImportDone] = useState(false);

  // Step 5: Website embed copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Step 6: Staff invite state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'Owner' | 'Manager' | 'Assistant'>('Manager');

  const steps = [
    { number: 1, title: 'Facility details', icon: Building },
    { number: 2, title: 'Unit types', icon: Building },
    { number: 3, title: 'Connect phone line', icon: Phone },
    { number: 4, title: 'Upload tenants', icon: FileSpreadsheet },
    { number: 5, title: 'Website buttons', icon: Code2 },
    { number: 6, title: 'Invite staff', icon: Users },
  ];

  // Save Step 1
  const saveFacilityDetails = () => {
    updateFacility({
      name: facName,
      address: facAddress,
      phone: facPhone,
      officeHours: facOfficeHours,
      gateHours: facGateHours,
      paymentPortalUrl: facPaymentUrl,
      logoUrl: facLogoPreview,
    });
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFacLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add unit type
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    addUnitType({
      size: newUnitSize,
      description: `${newUnitSize} storage unit`,
      monthlyPrice: Number(newUnitPrice),
      climateControlled: newUnitClimate,
      totalUnits: Number(newUnitTotal),
      unitsAvailable: Number(newUnitAvailable),
      features: [newUnitClimate ? 'Climate controlled' : 'Standard dry storage', 'Ground level access'],
    });
    setNewUnitSize('10x15');
    setNewUnitPrice(195);
  };

  // Connect Phone
  const handleConnectPhone = async () => {
    setIsConnectingPhone(true);
    await new Promise((res) => setTimeout(res, 900));
    setPhoneConnected(true);
    setIsConnectingPhone(false);
    updateFacility({
      phoneConnection: {
        provider: 'Quo (OpenPhone)',
        connected: true,
        apiKey: quoApiKey,
        lastSync: 'Just now',
      },
    });
    addToast({
      type: 'success',
      title: 'Quo OpenPhone Connected ✓',
      message: 'Incoming missed calls will now automatically trigger recovery SMS.',
    });
  };

  // CSV Drag and Drop / File Read
  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > 0) {
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        setCsvColumns(headers);

        const rows = lines.slice(1, 10).map((line) => {
          const cells = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          const rowObj: any = {};
          headers.forEach((h, i) => {
            rowObj[h] = cells[i] || '';
          });
          return rowObj;
        });
        setParsedCsvRows(rows);

        // Auto map columns
        const newMap = { ...columnMapping };
        headers.forEach((h) => {
          const lower = h.toLowerCase();
          if (lower.includes('name')) newMap.name = h;
          if (lower.includes('phone') || lower.includes('mobile')) newMap.phone = h;
          if (lower.includes('email')) newMap.email = h;
          if (lower.includes('unit') || lower.includes('space')) newMap.unit = h;
          if (lower.includes('balance') || lower.includes('due')) newMap.balance = h;
          if (lower.includes('status')) newMap.status = h;
          if (lower.includes('text') || lower.includes('sms') || lower.includes('agree')) newMap.agreedToTexts = h;
        });
        setColumnMapping(newMap);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyCsvImport = () => {
    if (parsedCsvRows.length === 0) {
      addToast({ type: 'error', title: 'No CSV data', message: 'Please select a CSV file first.' });
      return;
    }

    const imported: Omit<Tenant, 'id'>[] = parsedCsvRows.map((r) => ({
      name: r[columnMapping.name] || 'Tenant',
      phone: r[columnMapping.phone] || '(555) 000-0000',
      email: r[columnMapping.email] || 'tenant@example.com',
      unit: r[columnMapping.unit] || 'A-101',
      balance: parseFloat(r[columnMapping.balance]) || 0,
      status: (r[columnMapping.status]?.toLowerCase().includes('lock')
        ? 'locked out'
        : r[columnMapping.status]?.toLowerCase().includes('move')
        ? 'moved out'
        : 'active') as any,
      agreedToTexts: String(r[columnMapping.agreedToTexts]).toLowerCase().includes('y') || true,
      moveInDate: '2025-06-01',
    }));

    importTenantsCSV(imported);
    setCsvImportDone(true);
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'name,phone,email,unit,balance,status,agreedToTexts\n' +
      'Sarah Miller,(619) 555-0182,sarah.m@example.com,B-104,0,active,yes\n' +
      'Marcus Vance,(619) 555-0199,mvance88@example.com,A-012,95,locked out,yes\n' +
      'Elena Rostova,(619) 555-0211,elena.r@example.com,C-215,0,active,yes\n' +
      'David Chen,(619) 555-0245,dchen.sd@example.com,D-302,145,active,yes\n' +
      'Carlos Mendez,(619) 555-0389,carlos.m@example.com,B-129,0,active,yes\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_storage_tenants.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy code helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast({ type: 'success', title: 'Copied to clipboard!' });
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Step 6: Invite Staff
  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStaffEmail.trim()) {
      inviteStaff(newStaffName.trim() || newStaffEmail.split('@')[0], newStaffEmail.trim(), newStaffRole);
      setNewStaffName('');
      setNewStaffEmail('');
    }
  };

  const fireCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // safe fallback
    }
    completeWizard();
  };

  const nextStep = () => {
    if (wizardStep === 1) saveFacilityDetails();
    if (wizardStep < 6) {
      setWizardStep(wizardStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Top Header & Save Later */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Facility Onboarding Wizard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Setup {facility.name}
            </h1>
          </div>

          <button
            onClick={() => {
              saveFacilityDetails();
              navigateTo('today');
            }}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Save &amp; Continue Later
          </button>
        </div>

        {/* Progress bar & Step indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <span>Step {wizardStep} of 6: {steps[wizardStep - 1].title}</span>
            <span className="font-mono">{Math.round((wizardStep / 6) * 100)}% Completed</span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-300 rounded-full"
              style={{ width: `${(wizardStep / 6) * 100}%` }}
            />
          </div>

          {/* Stepper bubbles */}
          <div className="grid grid-cols-6 gap-2 mt-4">
            {steps.map((st) => {
              const isPast = wizardStep > st.number;
              const isCurrent = wizardStep === st.number;
              return (
                <button
                  key={st.number}
                  onClick={() => setWizardStep(st.number)}
                  className={`text-center py-2 px-1 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-teal-50 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300 font-bold'
                      : isPast
                      ? 'text-teal-600 dark:text-teal-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-mono leading-none">{st.number}</div>
                  <div className="text-[10px] truncate hidden sm:block mt-0.5">{st.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl mb-8">
          {/* STEP 1: Facility Details */}
          {wizardStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Facility details &amp; contact information
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  These details will appear in your Tenant App, SMS signatures, and website buttons.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Facility Name
                  </label>
                  <input
                    type="text"
                    value={facName}
                    onChange={(e) => setFacName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={facPhone}
                    onChange={(e) => setFacPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Facility Address
                  </label>
                  <input
                    type="text"
                    value={facAddress}
                    onChange={(e) => setFacAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Office Hours
                  </label>
                  <input
                    type="text"
                    value={facOfficeHours}
                    onChange={(e) => setFacOfficeHours(e.target.value)}
                    placeholder="e.g. Mon-Sat 9am-6pm"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gate Hours
                  </label>
                  <input
                    type="text"
                    value={facGateHours}
                    onChange={(e) => setFacGateHours(e.target.value)}
                    placeholder="e.g. 6am - 10pm Daily"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Existing Payment Portal URL (for Pay button)
                  </label>
                  <input
                    type="url"
                    value={facPaymentUrl}
                    onChange={(e) => setFacPaymentUrl(e.target.value)}
                    placeholder="https://yourstoragepayments.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Tenants tapping &quot;Pay&quot; in their app will be directed straight to your current payment processor.
                  </p>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Facility Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {facLogoPreview ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={facLogoPreview}
                        alt="Logo preview"
                        className="w-16 h-16 rounded-xl object-contain border border-slate-300 dark:border-slate-700 bg-white p-1"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-lg">
                        {facName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 dark:file:bg-teal-950 dark:file:text-teal-300 hover:file:bg-teal-100"
                      />
                      <span className="text-[11px] text-slate-400 block mt-1">PNG, JPG, or SVG up to 5MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Unit Types */}
          {wizardStep === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Storage unit categories &amp; inventory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure the unit sizes you offer. Empty units calculate your monthly vacancy loss and power website reservation buttons.
                </p>
              </div>

              {/* Unit list table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Climate Controlled</th>
                      <th className="py-3 px-4 text-right">Monthly Price</th>
                      <th className="py-3 px-4 text-right">Total Units</th>
                      <th className="py-3 px-4 text-right">Available</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {unitTypes.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{u.size}</td>
                        <td className="py-3 px-4">
                          {u.climateControlled ? (
                            <span className="text-teal-600 dark:text-teal-400 font-medium">Yes · AC/Heat</span>
                          ) : (
                            <span className="text-slate-400">Standard dry</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">${u.monthlyPrice}/mo</td>
                        <td className="py-3 px-4 text-right font-mono">{u.totalUnits}</td>
                        <td className="py-3 px-4 text-right font-mono text-teal-600 dark:text-teal-400 font-bold">
                          {u.unitsAvailable}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deleteUnitType(u.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add category form */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-3">
                  + Add another unit category
                </span>
                <form onSubmit={handleAddUnit} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Size (e.g. 10x15)
                    </label>
                    <input
                      type="text"
                      required
                      value={newUnitSize}
                      onChange={(e) => setNewUnitSize(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Price ($/mo)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newUnitPrice}
                      onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Total Units
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newUnitTotal}
                      onChange={(e) => setNewUnitTotal(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Available Now
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newUnitAvailable}
                      onChange={(e) => setNewUnitAvailable(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <button
                      type="submit"
                      className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs shadow-xs"
                    >
                      Add Size
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* STEP 3: Connect Phone Line */}
          {wizardStep === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Connect your facility phone line
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Connect your business phone service so GateDesk can detect missed calls and send instant recovery texts.
                </p>
              </div>

              {/* Quo OpenPhone Provider Card */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-teal-500/80 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base">
                      Q
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Quo (OpenPhone)</h4>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">Recommended for Self-Storage</span>
                    </div>
                  </div>

                  {phoneConnected ? (
                    <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded-full font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      Connected ✓
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Not connected</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quo (OpenPhone) API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={quoApiKey}
                      onChange={(e) => setQuoApiKey(e.target.value)}
                      placeholder="quo_live_..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleConnectPhone}
                      disabled={isConnectingPhone || phoneConnected}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold rounded-xl text-xs shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      {isConnectingPhone ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : phoneConnected ? (
                        <span>Connected ✓</span>
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Found in Quo / OpenPhone Dashboard &rarr; Settings &rarr; Integrations &rarr; API Keys.
                  </p>
                </div>
              </div>

              {/* Coming Soon providers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Twilio Phone</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">SIP Trunking &amp; 10DLC automated webhook integration.</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">RingCentral</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Direct cloud PBX extension call monitoring.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Upload Tenants */}
          {wizardStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Upload your current tenant roster
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Drag and drop a CSV file exported from SiteLink, storEDGE, Easy Storage Solutions, or Excel.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download sample CSV</span>
                </button>
              </div>

              {/* Drag & drop box */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-teal-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <FileSpreadsheet className="w-10 h-10 text-teal-600 dark:text-teal-400 mx-auto mb-3" />
                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Choose a CSV file to inspect
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  File is read entirely in your browser with zero data sent to external servers.
                </p>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvFile}
                  className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500 cursor-pointer"
                />
              </div>

              {/* Column Mapping & Preview Table */}
              {parsedCsvRows.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Match CSV Columns to GateDesk Fields
                    </h4>
                    <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                      {parsedCsvRows.length} sample rows previewed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.keys(columnMapping).map((field) => (
                      <div key={field}>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 capitalize mb-1">
                          {field}
                        </label>
                        <select
                          value={(columnMapping as any)[field]}
                          onChange={(e) =>
                            setColumnMapping({ ...columnMapping, [field]: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                          {csvColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Preview table */}
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl mt-4">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <tr>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Unit</th>
                          <th className="py-2 px-3">Phone</th>
                          <th className="py-2 px-3">Balance</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedCsvRows.slice(0, 4).map((row, i) => (
                          <tr key={i}>
                            <td className="py-2 px-3 font-medium">{row[columnMapping.name]}</td>
                            <td className="py-2 px-3 font-mono">{row[columnMapping.unit]}</td>
                            <td className="py-2 px-3 font-mono">{row[columnMapping.phone]}</td>
                            <td className="py-2 px-3 font-mono">${row[columnMapping.balance] || 0}</td>
                            <td className="py-2 px-3">{row[columnMapping.status] || 'active'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyCsvImport}
                    disabled={csvImportDone}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    {csvImportDone ? '✓ Tenants Successfully Imported' : 'Import Matched Tenants'}
                  </button>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500 dark:text-slate-400">
                Current roster count in GateDesk: <strong className="text-slate-900 dark:text-white font-mono">{tenants.length} tenants</strong>.
              </div>
            </div>
          )}

          {/* STEP 5: Website Buttons */}
          {wizardStep === 5 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Add Available Units &amp; Gate Help buttons to your website
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Copy and paste these lightweight embed codes into Squarespace, WordPress, Wix, or your custom storage website.
                </p>
              </div>

              {/* Button 1: Available Units */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      1. &quot;Available Units&quot; Button &amp; Link
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Directs visitors to your live inventory and reservation modal.
                    </p>
                  </div>

                  {/* Live preview of button */}
                  <div className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs">
                    View Available Units
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    <span>Direct Shareable Link:</span>
                    <button
                      onClick={() => handleCopy(`https://gatedesk.app/units/${facility.id}`, 'link_units')}
                      className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'link_units' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'link_units' ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono truncate text-slate-700 dark:text-slate-300">
                    https://gatedesk.app/units/{facility.id}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    <span>Embed HTML Code:</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `<a href="https://gatedesk.app/units/${facility.id}" class="gatedesk-units-btn" style="background:#0D9488;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block;">View Available Units</a>`,
                          'embed_units'
                        )
                      }
                      className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'embed_units' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'embed_units' ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap">
                    {`<a href="https://gatedesk.app/units/${facility.id}" class="gatedesk-btn">View Available Units</a>`}
                  </pre>
                </div>
              </div>

              {/* Button 2: Need Help? */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      2. &quot;Need Help?&quot; Floating Gate Assist
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Floating button that lets after-hours renters report locked gate or keypad issues.
                    </p>
                  </div>

                  {/* Live preview */}
                  <div className="px-3.5 py-1.5 bg-slate-900 text-teal-400 font-bold text-xs rounded-xl shadow-xs border border-slate-700">
                    Need Help?
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    <span>Embed Code:</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `<script src="https://gatedesk.app/widget.js" data-facility="${facility.id}"></script>`,
                          'embed_help'
                        )
                      }
                      className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'embed_help' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'embed_help' ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                    {`<script src="https://gatedesk.app/widget.js" data-facility="${facility.id}"></script>`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Invite Staff */}
          {wizardStep === 6 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Invite your storage facility staff
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Give front desk managers and weekend assistants access to answer missed calls and tickets.
                </p>
              </div>

              {/* Invite Form */}
              <form onSubmit={handleInviteStaff} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Staff Member Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Karen Delgado"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="karen@yourstorage.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Assistant">Assistant</option>
                    <option value="Owner">Co-Owner</option>
                  </select>
                </div>

                <div className="sm:col-span-12">
                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>

              {/* Staff List */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                  Active Team Members:
                </span>
                {staff.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-xs">
                        {s.name.substring(0, 1)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{s.name}</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-normal">
                            {s.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">{s.email}</span>
                      </div>
                    </div>

                    {s.role !== 'Owner' && (
                      <button
                        onClick={() => removeStaff(s.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Celebratory Completion Box */}
              <div className="p-6 rounded-3xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-center space-y-3 pt-6">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  You&apos;re all set!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  GateDesk is configured for {facility.name}. Missed calls are monitored, your tenant app is live, and your referral program is ready.
                </p>
                <button
                  type="button"
                  onClick={fireCelebration}
                  className="px-8 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm shadow-lg transition-transform hover:scale-102"
                >
                  Go to Today Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Bottom Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={wizardStep === 1}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {wizardStep < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              <span>Continue to Step {wizardStep + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={fireCelebration}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              <span>Finish Setup &amp; Go to Today</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
