'use client';

import React, { useState } from 'react';
import {
  PartnerAccount,
  PartnerOperator,
  VerificationRequestPriority,
} from '@/types/partner-hub';
import { LIMITS } from '@/lib/partner-hub';
import { X, Send } from 'lucide-react';

interface NewRequestModalProps {
  accounts: PartnerAccount[];
  defaultAccountId?: string;
  actingAs: PartnerOperator;
  onClose: () => void;
  onCreate: (data: {
    account: PartnerAccount;
    title: string;
    instructions: string;
    requestedBy: PartnerOperator;
    assignedTo: PartnerOperator;
    priority: VerificationRequestPriority;
  }) => Promise<void>;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  accounts,
  defaultAccountId,
  actingAs,
  onClose,
  onCreate,
}) => {
  const ownerFirstAccounts = [
    ...accounts.filter((a) => a.responsibility === 'owner-verification'),
    ...accounts.filter((a) => a.responsibility !== 'owner-verification'),
  ];

  const [accountId, setAccountId] = useState(
    defaultAccountId || ownerFirstAccounts[0]?.id || ''
  );
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [assignedTo, setAssignedTo] = useState<PartnerOperator>('Account Owner');
  const [priority, setPriority] = useState<VerificationRequestPriority>('urgent');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAccount = accounts.find((a) => a.id === accountId);
    if (!selectedAccount || !title.trim()) return;

    setSubmitting(true);
    try {
      await onCreate({
        account: selectedAccount,
        title: title.trim(),
        instructions:
          instructions.trim() ||
          `Please open ${selectedAccount.platform} and complete the required verification or sub-account invite.`,
        requestedBy: actingAs,
        assignedTo,
        priority,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Request Verification or Access Handoff
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Appears immediately at the top of the Owner Action Queue upon sign-in.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Platform Account *
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              {ownerFirstAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.platform} ({acc.responsibility === 'owner-verification' ? 'Owner Lane' : 'Team Lane'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Assign To
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value as PartnerOperator)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="Account Owner">Account Owner (US Verification)</option>
                <option value="Ops Manager">Ops Manager (Account Access)</option>
                <option value="Content Editor">Content Editor (Editing &amp; Posting)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as VerificationRequestPriority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="urgent">Urgent (Blocking Launch)</option>
                <option value="standard">Standard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              What do you need verified or connected? *
            </label>
            <input
              type="text"
              required
              maxLength={LIMITS.TITLE_MAX}
              placeholder="e.g. Approve TikTok Shop US Seller 2FA & add Ops Manager sub-account"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Exact Step-by-Step Instructions
            </label>
            <textarea
              rows={4}
              maxLength={LIMITS.INSTRUCTIONS_MAX}
              placeholder="Provide exact clicks so the Account Owner can finish in 2 minutes (e.g. Open Seller Center > My Account > User Management > Add team member as Shop Manager)."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
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
              disabled={submitting || accounts.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Sending...' : 'Send to Queue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
