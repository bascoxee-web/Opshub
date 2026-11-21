'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import {
  Send,
  Sparkles,
  ShieldCheck,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const TextCampaignsView: React.FC = () => {
  const { campaigns, sendTextCampaign, tenants, facility } = useGateDesk();

  const [campaignTitle, setCampaignTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  // Opted-in tenants calculation
  const optedInTenants = tenants.filter((t) => t.agreedToTexts);
  const totalTenants = tenants.length;

  const templates = [
    {
      name: 'Holiday Hours Notice',
      title: 'Holiday Office & Gate Schedule',
      body: `${facility.name} Notice: Gate access remains open normal hours (${facility.gateHours}). Front office will be closed on Thanksgiving Day. Need gate help anytime? Open your Tenant App.`,
    },
    {
      name: 'Double Referral Bonus',
      title: 'Double Referral Bonus ($75 Credit)',
      body: `${facility.name} Special: Double referral month! Tell a friend who needs storage and both get $75 rent credit when they move in. Tap your Tenant App to share: https://${facility.tenantAppSettings.subdomain}.gatedesk.app/ref`,
    },
    {
      name: 'Office Hours Update',
      title: 'Updated Office Operating Hours',
      body: `${facility.name} Update: Our front office hours are now ${facility.officeHours}. 24/7 account management and gate assistance are always available in your Tenant App.`,
    },
    {
      name: 'Weather & Facility Safety Advisory',
      title: 'Facility Weather & Drainage Advisory',
      body: `${facility.name} Advisory: Heavy rains forecasted. Facility drainage and drive aisles are clear. For assistance or emergency water protection, reply to this text.`,
    },
  ];

  const fullPreviewText = messageBody.includes('Reply STOP')
    ? messageBody
    : `${messageBody}\n\nReply STOP to opt out`;

  const charCount = fullPreviewText.length;
  const segments = Math.ceil(charCount / 160) || 1;

  const handleApplyTemplate = (tmpl: { title: string; body: string }) => {
    setCampaignTitle(tmpl.title);
    setMessageBody(tmpl.body);
  };

  const handleApproveAndSend = () => {
    const success = sendTextCampaign(campaignTitle, messageBody);
    if (success) {
      setIsApproveModalOpen(false);
      setMessageBody('');
      setCampaignTitle('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Text Campaigns
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dispatch announcements, referral drives, and holiday hours to verified opted-in renters.
          </p>
        </div>

        {/* 10DLC & TCPA Compliance Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-800">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Opt-In Guard Active ({optedInTenants.length} of {totalTenants} Tenants)</span>
        </div>
      </div>

      {/* 2-Column Split: Composer on Left, Past Campaigns on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Campaign Composer */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Compose Targeted Text Message
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Messages are only delivered to tenants who consented during move-in or in the Tenant App.
            </p>
          </div>

          {/* Quick Template Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Quick Template:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-teal-500 text-left text-xs transition-colors"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {tmpl.name}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                    Click to load message
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Internal Campaign Label
            </label>
            <input
              type="text"
              required
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              placeholder="e.g. Thanksgiving Gate Hours"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Message Body
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {charCount} chars · {segments} SMS segment{segments > 1 ? 's' : ''}
              </span>
            </div>
            <textarea
              rows={4}
              required
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Type your facility message..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-sans"
            />
          </div>

          {/* Compliance Disclaimer Preview */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Automated Opt-Out Compliance Footer (Always Attached)
            </span>
            <p className="font-mono text-[11px] text-slate-500">
              Reply STOP to opt out
            </p>
          </div>

          {/* Live Mobile SMS Preview Frame */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Tenant Phone Preview:
            </span>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 max-w-sm">
              <div className="p-3 rounded-2xl bg-teal-600 text-white text-xs leading-relaxed shadow-sm font-sans whitespace-pre-wrap">
                {fullPreviewText || 'Your message preview will appear here...'}
              </div>
              <span className="text-[10px] text-slate-400 block text-right mt-1 font-mono">
                Delivered via Quo Phone
              </span>
            </div>
          </div>

          {/* Trigger button opens safety confirmation modal */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsApproveModalOpen(true)}
              disabled={!messageBody.trim()}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Review &amp; Approve Campaign ({optedInTenants.length} Recipients)</span>
            </button>
          </div>
        </div>

        {/* Right: Past Campaigns History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Past Dispatched Campaigns
            </h3>

            <div className="space-y-3">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      {camp.name}
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-semibold uppercase">
                      Sent ✓
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-sans line-clamp-3">
                    {camp.message}
                  </p>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{camp.recipientsCount} recipients</span>
                    <span>{camp.optOutCount} opt-outs</span>
                    <span>{camp.sentAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory "Approve and Send" Step Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto">
              <Send className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold">Approve &amp; Send Broadcast?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You are about to dispatch this campaign to <strong className="text-slate-900 dark:text-white">{optedInTenants.length} tenants</strong> who agreed to receive text messages.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-sans text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {fullPreviewText}
            </div>

            <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <span>
                10DLC compliance validated. Any tenant replying &quot;STOP&quot; will be automatically excluded from future campaigns.
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel / Edit
              </button>
              <button
                type="button"
                onClick={handleApproveAndSend}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                Approve &amp; Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
