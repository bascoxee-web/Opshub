'use client';

import React, { useState } from 'react';
import {
  AccountAssignedOperator,
  AccountStatus,
  DelegatedAccessStatus,
  PartnerAccount,
  PartnerOperator,
} from '@/types/partner-hub';
import { LIMITS, sanitizeHttpsUrl } from '@/lib/partner-hub';
import {
  X,
  ExternalLink,
  CheckSquare,
  Square,
  ShieldCheck,
  Save,
  Trash2,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface AccountDrawerModalProps {
  account: PartnerAccount;
  actingAs: PartnerOperator;
  canDelete: boolean;
  onClose: () => void;
  onSave: (
    updates: {
      status: AccountStatus;
      accountHandle: string;
      loginEmailHint: string;
      portalUrl: string;
      delegatedAccessStatus: DelegatedAccessStatus;
      completedStepIds: string[];
      notes: string;
      assignedOperator: AccountAssignedOperator;
    },
    summary: string
  ) => Promise<void>;
  onDelete: () => Promise<void>;
  onOpenRequestModal: () => void;
}

export const AccountDrawerModal: React.FC<AccountDrawerModalProps> = ({
  account,
  actingAs,
  canDelete,
  onClose,
  onSave,
  onDelete,
  onOpenRequestModal,
}) => {
  const [status, setStatus] = useState<AccountStatus>(account.status);
  const [accountHandle, setAccountHandle] = useState(account.accountHandle);
  const [loginEmailHint, setLoginEmailHint] = useState(account.loginEmailHint);
  const [portalUrl, setPortalUrl] = useState(account.portalUrl);
  const [delegatedAccessStatus, setDelegatedAccessStatus] = useState<DelegatedAccessStatus>(
    account.delegatedAccessStatus
  );
  const [completedStepIds, setCompletedStepIds] = useState<string[]>(account.completedStepIds || []);
  const [notes, setNotes] = useState(account.notes);
  const [assignedOperator, setAssignedOperator] = useState<AccountAssignedOperator>(
    account.assignedOperator
  );
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const safeUrl = sanitizeHttpsUrl(portalUrl);

  const toggleStep = (stepIndex: string) => {
    setCompletedStepIds((prev) =>
      prev.includes(stepIndex) ? prev.filter((id) => id !== stepIndex) : [...prev, stepIndex]
    );
  };

  const handleQuickMarkConnected = async () => {
    setSaving(true);
    try {
      const allSteps = account.checklistSteps.map((_, i) => String(i));
      const nextDelegated: DelegatedAccessStatus =
        account.responsibility === 'owner-verification' ? 'team_access_granted' : delegatedAccessStatus;
      await onSave(
        {
          status: 'connected',
          accountHandle,
          loginEmailHint,
          portalUrl,
          delegatedAccessStatus: nextDelegated,
          completedStepIds: allSteps,
          notes,
          assignedOperator,
        },
        `Marked ${account.platform} as Verified & Connected (${actingAs})`
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(
        {
          status,
          accountHandle,
          loginEmailHint,
          portalUrl,
          delegatedAccessStatus,
          completedStepIds,
          notes,
          assignedOperator,
        },
        `Updated ${account.platform} details (${completedStepIds.length}/${account.checklistSteps.length} steps complete)`
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-full border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {account.responsibility === 'owner-verification'
                ? 'Owner Verification Lane'
                : 'Editing & Ops Studio Lane'}{' '}
              · Last updated by {account.lastUpdatedBy}
            </p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {account.platform}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close account panel"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Quick Portal Launch & 1-Click Owner Verification Action */}
          <div className="flex flex-wrap items-center gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
            {safeUrl && (
              <a
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {status !== 'connected' && (
              <button
                type="button"
                onClick={handleQuickMarkConnected}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Verified &amp; Connected</span>
              </button>
            )}

            {account.responsibility === 'owner-verification' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRequestModal();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Request Owner Action</span>
              </button>
            )}
          </div>

          {/* Interactive Verification Checklist */}
          {account.checklistSteps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Connection &amp; Verification Steps
                </h3>
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {completedStepIds.length}/{account.checklistSteps.length} complete
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {account.checklistSteps.map((step, idx) => {
                  const key = String(idx);
                  const checked = completedStepIds.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleStep(key)}
                      className="w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm leading-snug ${
                          checked
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {step}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status & Access Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Connection Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AccountStatus)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="needs_owner">Needs Owner Action</option>
                <option value="in_verification">In Verification</option>
                <option value="connected">Connected &amp; Active</option>
                <option value="attention_needed">Attention / Re-Verification Needed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Team Sub-Account Access
              </label>
              <select
                value={delegatedAccessStatus}
                onChange={(e) =>
                  setDelegatedAccessStatus(e.target.value as DelegatedAccessStatus)
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="not_started">Not Started</option>
                <option value="invite_sent">Manager Invite Sent</option>
                <option value="team_access_granted">Team Access Granted (Managers &amp; Editors)</option>
                <option value="not_applicable">Not Applicable (Team Tool)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Store Name / Handle / Affiliate ID
              </label>
              <input
                type="text"
                value={accountHandle}
                onChange={(e) => setAccountHandle(e.target.value)}
                maxLength={LIMITS.HANDLE_MAX}
                placeholder="e.g. @brandshop or Store ID"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Assigned Lead
              </label>
              <select
                value={assignedOperator}
                onChange={(e) =>
                  setAssignedOperator(e.target.value as AccountAssignedOperator)
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="Account Owner">Account Owner (US Verification)</option>
                <option value="Ops Manager">Ops Manager (Account Access)</option>
                <option value="Content Editor">Content Editor (Editing &amp; Posting)</option>
                <option value="Shared">Shared Team</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Account Email / Login Reference (No Passwords)
            </label>
            <input
              type="text"
              value={loginEmailHint}
              onChange={(e) => setLoginEmailHint(e.target.value)}
              maxLength={LIMITS.EMAIL_MAX}
              placeholder="e.g. owner@yourbrand.com (for reference only)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Keep passwords private. Record only the account email or manager role granted.</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Official Portal URL (https://)
            </label>
            <input
              type="url"
              value={portalUrl}
              onChange={(e) => setPortalUrl(e.target.value)}
              maxLength={LIMITS.URL_MAX}
              placeholder="https://seller-us.tiktok.com"
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Handoff &amp; Verification Notes
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={LIMITS.NOTES_MAX}
              placeholder="Share next steps, 2FA timing, or affiliate storefront details for the team..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900">
          {canDelete ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await onDelete();
                      onClose();
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg"
                >
                  Confirm Remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
