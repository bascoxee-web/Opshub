'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { GeneratedDocument, SOPSectionData, BusinessType } from '@/types';
import { INDUSTRY_TEMPLATES } from '@/lib/demo-data';
import {
  FileText,
  FileCode,
  Files,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  User,
  Building,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  BookOpen,
  ArrowRight,
  Loader2,
  HelpCircle,
  Eye,
  Edit3,
} from 'lucide-react';

export const DocumentCenterView: React.FC = () => {
  const {
    tenants,
    facility,
    unitTypes,
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
    addToast,
  } = useGateDesk();

  // Active view tab: 'lease' | 'sop' | 'history'
  const [activeTab, setActiveTab] = useState<'lease' | 'sop' | 'history'>('lease');

  // Selected tenant for lease generation
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    tenants.length > 0 ? tenants[0].id : ''
  );

  // Template editing state for lease
  const [leaseTemplateText, setLeaseTemplateText] = useState<string>(customLeaseTemplate);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // SOP editing state
  const [sopDraft, setSopDraft] = useState<SOPSectionData>(sopSections);

  // Loading states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionLabel: 'Confirm',
    onConfirm: async () => {},
  });

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];
  const matchingUnit = unitTypes.find(
    (u) => selectedTenant?.unit?.startsWith(u.size.split('x')[0]) || u.size.includes('10x10')
  ) || unitTypes[0];

  // Merge tag dictionary for live preview
  const liveMergeFields: Record<string, string> = {
    tenant_name: selectedTenant?.name || 'Jane Doe',
    tenant_phone: selectedTenant?.phone || '(619) 555-0100',
    tenant_email: selectedTenant?.email || 'tenant@example.com',
    unit_number: selectedTenant?.unit || 'A-101',
    unit_size: matchingUnit ? `${matchingUnit.size} (${matchingUnit.climateControlled ? 'Climate' : 'Standard'})` : '10x10 Standard',
    monthly_rent: matchingUnit ? String(matchingUnit.monthlyPrice) : '145',
    move_in_date: selectedTenant?.moveInDate || new Date().toISOString().split('T')[0],
    facility_name: facility.name,
    facility_phone: facility.phone,
    facility_address: facility.address,
  };

  const getMergedPreview = (template: string) => {
    let result = template;
    Object.entries(liveMergeFields).forEach(([key, val]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
      result = result.replace(regex, val);
    });
    // Gate code security safeguard: never print raw codes
    result = result.replace(
      /\{\{\s*gate_code\s*\}\}/gi,
      '[Gate Policy: Individual PIN assigned at onboarding; sharing prohibited]'
    );
    return result;
  };

  const handleSaveCustomTemplate = () => {
    updateCustomLeaseTemplate(leaseTemplateText);
  };

  const handleResetLeaseTemplate = () => {
    resetToSampleLeaseTemplate();
    setLeaseTemplateText(customLeaseTemplate);
  };

  const handleLoadIndustryTemplate = (type: BusinessType) => {
    if (INDUSTRY_TEMPLATES[type]) {
      const template = INDUSTRY_TEMPLATES[type].template;
      setLeaseTemplateText(template);
      updateCustomLeaseTemplate(template);
      addToast({
        type: 'info',
        title: `Loaded ${INDUSTRY_TEMPLATES[type].name}`,
        message: 'Contract template loaded with custom merge tags.',
      });
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    addToast({ type: 'success', title: 'Link copied to clipboard' });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const triggerGenerateLease = () => {
    if (!selectedTenant) {
      addToast({ type: 'error', title: 'Please select a tenant' });
      return;
    }

    if (!isDocsConnected) {
      setConfirmModal({
        isOpen: true,
        title: 'Connect Google Docs Account',
        description:
          'To generate this lease agreement in Google Docs, you need to connect your Google account. GateDesk will create and organize the document in your Google Drive.',
        actionLabel: 'Connect Google Account',
        onConfirm: async () => {
          await connectDocs();
        },
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: `Generate Google Doc Lease Draft?`,
      description: `Create a Google Docs draft agreement for ${selectedTenant.name} (Unit ${selectedTenant.unit}). The document will populate with tenant data, link to their profile, and be marked as "Draft — review before sending to tenant".`,
      actionLabel: 'Create Google Doc Draft',
      onConfirm: async () => {
        setIsGenerating(true);
        try {
          const doc = await generateLeaseDocument(selectedTenant.id, leaseTemplateText);
          if (doc?.webViewLink) {
            window.open(doc.webViewLink, '_blank', 'noopener,noreferrer');
          }
        } finally {
          setIsGenerating(false);
        }
      },
    });
  };

  const triggerGenerateSOP = () => {
    if (!isDocsConnected) {
      setConfirmModal({
        isOpen: true,
        title: 'Connect Google Docs Account',
        description:
          'Connect your Google account to create the Facility Standard Operating Procedures manual in Google Docs.',
        actionLabel: 'Connect Google Account',
        onConfirm: async () => {
          await connectDocs();
        },
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: `Generate Facility SOP in Google Docs?`,
      description: `This will create a comprehensive Standard Operating Procedures document for ${facility.name} in your Google Docs, incorporating your customized checklists and state-specific overdue escalation procedures.`,
      actionLabel: 'Generate Facility SOP',
      onConfirm: async () => {
        setIsGenerating(true);
        try {
          updateSOPSections(sopDraft);
          const doc = await generateSOPDocument(sopDraft);
          if (doc?.webViewLink) {
            window.open(doc.webViewLink, '_blank', 'noopener,noreferrer');
          }
        } finally {
          setIsGenerating(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Document Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              Google Docs Automation
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate tenant lease agreements with merge fields and customize facility SOP manuals.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('lease')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'lease'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Lease Agreement
          </button>
          <button
            onClick={() => setActiveTab('sop')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'sop'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Facility SOP
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Draft History</span>
            <span className="px-1.5 py-0.2 bg-teal-600 text-white rounded-full text-[10px]">
              {generatedDocuments.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── MANDATORY LEGAL & STATE LAW DISCLAIMER BANNER ── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">
            Sample Only — Have Your Attorney Review Before Use
          </span>
          <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
            Notice: Self-storage statutory lien rights, late fee ceilings, overlock procedures, and public auction notification requirements vary significantly by state. GateDesk provides template merge-field automation but does not provide legal advice. Always have your attorney review and adapt all templates to your jurisdiction.
          </p>
        </div>
      </div>

      {/* ── GOOGLE DOCS CONNECTION STATUS BAR ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Google Docs Integration
              </span>
              {isDocsConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected ({docsUserEmail})
                </span>
              ) : (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Not Connected
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Generates editable Google Docs drafts directly into your Google Drive account.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isDocsConnected ? (
            <button
              onClick={connectDocs}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs text-xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Connect Google Docs</span>
            </button>
          ) : (
            <button
              onClick={disconnectDocs}
              className="px-2.5 py-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors font-medium text-xs"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* ── TAB 1: TENANT LEASE AGREEMENT GENERATOR ── */}
      {activeTab === 'lease' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tenant Picker & Merge Tag Inspector */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <span>1. Select Tenant</span>
              </h3>

              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Populate lease data for:
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Unit {t.unit}) — {t.status}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTenant && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Unit Assigned:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedTenant.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Monthly Rate:</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      ${matchingUnit?.monthlyPrice || 145}.00 / mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Move-in Date:</span>
                    <span>{selectedTenant.moveInDate || '2025-04-12'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Phone:</span>
                    <span>{selectedTenant.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Email:</span>
                    <span className="truncate max-w-[140px]">{selectedTenant.email}</span>
                  </div>
                </div>
              )}

              {/* Gate Security Notice */}
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-2">
                <KeyRound className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Gate Code Protection:</strong> Actual gate PIN codes are never inserted into generated documents. GateDesk automatically outputs only standard keypad access policies.
                </p>
              </div>
            </div>

            {/* Merge Tag Dictionary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Available Merge Tags</span>
                <span className="text-[10px] text-slate-400 font-normal">Click to copy</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Paste these tags anywhere in your custom lease text:
              </p>

              <div className="space-y-1.5 font-mono text-[11px]">
                {[
                  { tag: '{{tenant_name}}', val: liveMergeFields.tenant_name },
                  { tag: '{{unit_number}}', val: liveMergeFields.unit_number },
                  { tag: '{{unit_size}}', val: liveMergeFields.unit_size },
                  { tag: '{{monthly_rent}}', val: `$${liveMergeFields.monthly_rent}` },
                  { tag: '{{move_in_date}}', val: liveMergeFields.move_in_date },
                  { tag: '{{tenant_phone}}', val: liveMergeFields.tenant_phone },
                  { tag: '{{tenant_email}}', val: liveMergeFields.tenant_email },
                  { tag: '{{facility_name}}', val: liveMergeFields.facility_name },
                  { tag: '{{facility_address}}', val: liveMergeFields.facility_address },
                ].map((item) => (
                  <button
                    key={item.tag}
                    onClick={() => {
                      navigator.clipboard.writeText(item.tag);
                      addToast({ type: 'info', title: `Copied ${item.tag}` });
                    }}
                    className="w-full text-left p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors"
                  >
                    <span className="text-teal-600 dark:text-teal-400 font-bold">{item.tag}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[110px] font-sans">
                      &rarr; {item.val}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (2 cols): Template Editor & Live Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    2. Lease Template Editor &amp; Preview
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-semibold transition-colors"
                  >
                    {isPreviewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isPreviewMode ? 'Edit Template' : 'Live Merged Preview'}</span>
                  </button>

                  <button
                    onClick={handleResetLeaseTemplate}
                    className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium rounded-lg text-xs"
                    title="Restore sample lease agreement"
                  >
                    Reset to Sample
                  </button>

                  <button
                    onClick={handleSaveCustomTemplate}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl font-semibold"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Template</span>
                  </button>
                </div>
              </div>

              {/* Editor or Preview Pane */}
              {!isPreviewMode ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Load Industry Agreement Preset:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleLoadIndustryTemplate('self-storage')}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 hover:bg-teal-200 border border-teal-300 dark:border-teal-800"
                      >
                        Self-Storage
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadIndustryTemplate('rv-boat-storage')}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 hover:bg-blue-200 border border-blue-300 dark:border-blue-800"
                      >
                        RV & Boat
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadIndustryTemplate('coworking-office')}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 hover:bg-purple-200 border border-purple-300 dark:border-purple-800"
                      >
                        Coworking
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadIndustryTemplate('warehouse-flex')}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200 border border-amber-300 dark:border-amber-800"
                      >
                        Warehouse
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadIndustryTemplate('equipment-rental')}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-800"
                      >
                        Equipment
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Paste or edit your facility agreement template with merge fields:</span>
                    <span className="font-mono text-[10px]">{leaseTemplateText.length} characters</span>
                  </div>
                  <textarea
                    rows={18}
                    value={leaseTemplateText}
                    onChange={(e) => setLeaseTemplateText(e.target.value)}
                    className="w-full p-4 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-teal-500 leading-relaxed resize-y"
                    placeholder="Paste lease agreement text here..."
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="text-teal-600 dark:text-teal-400 font-semibold">
                      Live preview with merged data for {selectedTenant?.name}:
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-md font-bold text-[10px]">
                      Draft Preview
                    </span>
                  </div>
                  <div className="w-full p-5 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
                    {getMergedPreview(leaseTemplateText)}
                  </div>
                </div>
              )}

              {/* Bottom Generate Action Row */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                  <span>Will create an editable draft in Google Docs linked to {selectedTenant?.name}&apos;s profile.</span>
                </div>

                <button
                  onClick={triggerGenerateLease}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>Generate Lease in Google Docs</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: FACILITY STANDARD OPERATING PROCEDURES (SOP) ── */}
      {activeTab === 'sop' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Facility Standard Operating Procedures (SOP)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Staff operational manual covering opening/closing, gate security, and overdue rent management.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  updateSOPSections(sopDraft);
                }}
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Sections</span>
              </button>

              <button
                onClick={triggerGenerateSOP}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>Generate Facility SOP in Google Docs</span>
              </button>
            </div>
          </div>

          {/* 5 Editable SOP Sections */}
          <div className="space-y-5 text-xs">
            {/* Section 1 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="font-bold text-slate-900 dark:text-white block">
                Section 1: Daily Opening &amp; Closing Procedures
              </span>
              <textarea
                rows={5}
                value={sopDraft.openingClosing}
                onChange={(e) => setSopDraft({ ...sopDraft, openingClosing: e.target.value })}
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Section 2 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  Section 2: Gate Security &amp; Keypad Access Policy
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold font-mono">
                  [Gate codes excluded by policy]
                </span>
              </div>
              <textarea
                rows={5}
                value={sopDraft.gateSecurity}
                onChange={(e) => setSopDraft({ ...sopDraft, gateSecurity: e.target.value })}
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Section 3 — Critical State-Rule Labeling */}
            <div className="p-4 rounded-xl border-2 border-amber-300 dark:border-amber-800 space-y-2 bg-amber-50/40 dark:bg-amber-950/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  Section 3: Overdue Rent Escalation &amp; Statutory Lien Notice
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  Adjust to your state&apos;s rules
                </span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                Notice periods, late fee limits, overlocking timelines, and statutory lien auction steps vary across states. Customize these timelines to match local law.
              </p>
              <textarea
                rows={6}
                value={sopDraft.overdueEscalation}
                onChange={(e) => setSopDraft({ ...sopDraft, overdueEscalation: e.target.value })}
                className="w-full p-3 font-mono text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Section 4 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="font-bold text-slate-900 dark:text-white block">
                Section 4: Emergency Response &amp; Facility Incidents
              </span>
              <textarea
                rows={4}
                value={sopDraft.emergencyProtocol}
                onChange={(e) => setSopDraft({ ...sopDraft, emergencyProtocol: e.target.value })}
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Section 5 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="font-bold text-slate-900 dark:text-white block">
                Section 5: Staff Contact Directory &amp; Escalation Tree
              </span>
              <textarea
                rows={4}
                value={sopDraft.staffDirectory}
                onChange={(e) => setSopDraft({ ...sopDraft, staffDirectory: e.target.value })}
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: GENERATED DOCUMENT HISTORY & DRAFTS ── */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Generated Document History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every generated lease agreement is saved with a draft review badge and linked to tenant records.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 font-semibold">
              {generatedDocuments.length} document(s)
            </span>
          </div>

          {generatedDocuments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p>No documents generated yet. Use the tabs above to create your first lease or facility SOP.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {generatedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {doc.title}
                      </span>
                      {/* MANDATORY DRAFT BADGE */}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Draft — review before sending to tenant
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                      <span>Generated: {new Date(doc.createdAt).toLocaleDateString()}</span>
                      {doc.tenantName && <span>· Tenant: {doc.tenantName}</span>}
                      {doc.unitNumber && <span>· Unit: {doc.unitNumber}</span>}
                    </div>

                    {doc.templateSnippet && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 italic font-mono">
                        &quot;{doc.templateSnippet}&quot;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={doc.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Google Docs</span>
                    </a>

                    <button
                      onClick={() => handleCopyLink(doc.webViewLink, doc.id)}
                      className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium text-slate-700 dark:text-slate-300"
                      title="Copy document URL"
                    >
                      {copiedId === doc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: 'Remove Document from GateDesk?',
                          description: `This removes the document link from GateDesk and ${doc.tenantName || 'tenant'}'s profile. The file in Google Docs will remain untouched.`,
                          actionLabel: 'Remove Record',
                          onConfirm: async () => {
                            deleteGeneratedDocument(doc.id);
                          },
                        });
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Remove record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MANDATORY CONFIRMATION MODAL (Google Workspace security requirement) ── */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 text-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {confirmModal.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed text-xs">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                <span>Google Docs Permission Safeguard</span>
              </div>
              <p>
                GateDesk will create a new document in your Google Drive and link it to the tenant history. You will be able to review and edit it directly in Google Docs.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                  await action();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                {confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
