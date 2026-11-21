'use client';

import React, { useState } from 'react';
import {
  AccountAssignedOperator,
  AccountCategory,
  AccountResponsibility,
  AccountStatus,
  DelegatedAccessStatus,
} from '@/types/partner-hub';
import { LIMITS } from '@/lib/partner-hub';
import { X, Plus } from 'lucide-react';

interface AddAccountModalProps {
  defaultResponsibility?: AccountResponsibility;
  onClose: () => void;
  onCreate: (data: {
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
    notes: string;
  }) => Promise<void>;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  defaultResponsibility = 'owner-verification',
  onClose,
  onCreate,
}) => {
  const [platform, setPlatform] = useState('');
  const [responsibility, setResponsibility] = useState<AccountResponsibility>(
    defaultResponsibility
  );
  const [category, setCategory] = useState<AccountCategory>(
    defaultResponsibility === 'owner-verification' ? 'social-selling' : 'creative-tool'
  );
  const [assignedOperator, setAssignedOperator] = useState<AccountAssignedOperator>(
    defaultResponsibility === 'owner-verification' ? 'Account Owner' : 'Content Editor'
  );
  const [accountHandle, setAccountHandle] = useState('');
  const [loginEmailHint, setLoginEmailHint] = useState('');
  const [portalUrl, setPortalUrl] = useState('https://');
  const [stepsText, setStepsText] = useState(
    defaultResponsibility === 'owner-verification'
      ? 'Sign in and complete US identity / tax verification\nConnect payout bank account\nInvite Ops Manager & Content Editor as Staff / Manager sub-accounts'
      : 'Set up shared team workspace\nOrganize templates, raw footage, and posting folders'
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleResponsibilityChange = (next: AccountResponsibility) => {
    setResponsibility(next);
    if (next === 'owner-verification') {
      setAssignedOperator('Account Owner');
      setCategory('social-selling');
    } else {
      setAssignedOperator('Content Editor');
      setCategory('creative-tool');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform.trim()) return;
    setSubmitting(true);
    try {
      const checklistSteps = stepsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, LIMITS.ARRAY_MAX);

      await onCreate({
        platform: platform.trim(),
        category,
        responsibility,
        assignedOperator,
        status: responsibility === 'owner-verification' ? 'needs_owner' : 'connected',
        accountHandle: accountHandle.trim() || 'Pending setup',
        loginEmailHint: loginEmailHint.trim() || '',
        portalUrl: portalUrl.trim() === 'https://' ? '' : portalUrl.trim(),
        delegatedAccessStatus:
          responsibility === 'owner-verification' ? 'not_started' : 'not_applicable',
        checklistSteps,
        notes: notes.trim(),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Platform or Business Account
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Assign to the Owner verification lane or the team editing &amp; posting lane.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Lane Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Who handles verification for this account?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleResponsibilityChange('owner-verification')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  responsibility === 'owner-verification'
                    ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-semibold">Requires Owner Verification</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  US Seller, Affiliate, Tax, Payouts
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleResponsibilityChange('team-managed')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  responsibility === 'team-managed'
                    ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-semibold">Team Managed (Editing &amp; Ops)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Canva, Editing, Posting, Drive
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Platform / Account Name *
            </label>
            <input
              type="text"
              required
              maxLength={LIMITS.PLATFORM_MAX}
              placeholder="e.g. Pinterest Business Affiliate, PayPal Business, Metricool"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AccountCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="social-selling">Social Selling</option>
                <option value="affiliate">Affiliate Program</option>
                <option value="storefront-payout">Storefront &amp; Payouts</option>
                <option value="creative-tool">Creative &amp; Ops Tool</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Assigned Lead
              </label>
              <select
                value={assignedOperator}
                onChange={(e) => setAssignedOperator(e.target.value as AccountAssignedOperator)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="Account Owner">Account Owner</option>
                <option value="Ops Manager">Ops Manager</option>
                <option value="Content Editor">Content Editor</option>
                <option value="Shared">Shared Team</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Handle / Store Name
              </label>
              <input
                type="text"
                maxLength={LIMITS.HANDLE_MAX}
                placeholder="e.g. @shopname"
                value={accountHandle}
                onChange={(e) => setAccountHandle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Login Email Hint (No Password)
              </label>
              <input
                type="text"
                maxLength={LIMITS.EMAIL_MAX}
                placeholder="e.g. owner@yourbrand.com"
                value={loginEmailHint}
                onChange={(e) => setLoginEmailHint(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Official Login / Portal URL (https://)
            </label>
            <input
              type="url"
              maxLength={LIMITS.URL_MAX}
              placeholder="https://business.pinterest.com"
              value={portalUrl}
              onChange={(e) => setPortalUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Verification / Setup Steps (one per line)
            </label>
            <textarea
              rows={3}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Notes for Owner / Team
            </label>
            <textarea
              rows={2}
              maxLength={LIMITS.NOTES_MAX}
              placeholder="Explain what needs verification or how editors and managers will use this account..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{submitting ? 'Adding...' : 'Add to Workspace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
