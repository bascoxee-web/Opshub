'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import {
  PhoneCall,
  Clock,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Send,
  MessageSquare,
  AlertCircle,
  Plus,
  Lock,
} from 'lucide-react';

export const GateHelpInbox: React.FC = () => {
  const { missedCalls, markMissedCallReplied, addMissedCallNote, addToast } = useGateDesk();
  const [filter, setFilter] = useState<'all' | 'unreplied' | 'replied'>('unreplied');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const filteredCalls = missedCalls.filter((c) => {
    if (filter === 'unreplied') return !c.replied;
    if (filter === 'replied') return c.replied;
    return true;
  });

  const handleSendReply = (id: string, callerName: string) => {
    if (replyText.trim()) {
      markMissedCallReplied(id, replyText.trim());
      setReplyText('');
      setActiveReplyId(null);
    }
  };

  const handleSaveNote = (id: string) => {
    if (noteText.trim()) {
      addMissedCallNote(id, noteText.trim());
      setNoteText('');
      setActiveNoteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Gate Help Inbox
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Missed calls and texts matched in real-time to your tenant records.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('unreplied')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'unreplied'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Needs Reply ({missedCalls.filter((c) => !c.replied).length})
          </button>
          <button
            onClick={() => setFilter('replied')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'replied'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Replied
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Mandatory Security Banner: Never Show or Send Gate Codes */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Facility Security Rule: Never send raw gate codes</strong>
          <span className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            For facility physical security and tenant identity protection, gate access codes are never displayed or dispatched over SMS. Direct tenants to their verified Tenant App or verify their photo ID in person.
          </span>
        </div>
      </div>

      {/* Inbox List */}
      <div className="space-y-4">
        {filteredCalls.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-teal-600 dark:text-teal-400 mx-auto mb-3" />
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Inbox zero — All clear!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No missed calls or gate texts waiting for owner response.
            </p>
          </div>
        ) : (
          filteredCalls.map((item) => {
            const isUrgent = !item.replied && item.waitingMinutes >= 5;
            const isCritical = !item.replied && item.waitingMinutes >= 10;

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-5 shadow-xs space-y-4 ${
                  isCritical
                    ? 'border-rose-400 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/10'
                    : isUrgent
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Caller Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* Status indicator warning */}
                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 ${
                        item.replied
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : isCritical
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isUrgent
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {item.replied ? 'Replied' : `${item.waitingMinutes}m waiting`}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.callerName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {item.callerPhone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tenant Tag */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                      Unit: {item.unit}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded capitalize font-medium ${
                        item.tenantStatus === 'locked out'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                          : item.tenantStatus === 'moved out'
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                      }`}
                    >
                      {item.tenantStatus}
                    </span>
                  </div>
                </div>

                {/* Message snippet */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {item.type === 'call' ? 'Incoming Call & Voicemail Event' : 'Direct Tenant SMS'}
                  </span>
                  <p className="leading-relaxed font-sans">{item.messageSnippet}</p>
                </div>

                {/* Notes History */}
                {item.notes.length > 0 && (
                  <div className="space-y-1.5 pl-2 border-l-2 border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      Activity &amp; Staff Notes:
                    </span>
                    {item.notes.map((note, idx) => (
                      <p key={idx} className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                        • {note}
                      </p>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {!item.replied && (
                    <button
                      onClick={() => {
                        setActiveReplyId(activeReplyId === item.id ? null : item.id);
                        setReplyText(
                          `Hi ${item.callerName.split(' ')[0]}, saw your missed call. Our office is open until 6 PM today. Need assistance with unit ${item.unit}?`
                        );
                      }}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Quick Reply</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveNoteId(activeNoteId === item.id ? null : item.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Add Note</span>
                  </button>

                  {!item.replied ? (
                    <button
                      onClick={() => markMissedCallReplied(item.id)}
                      className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-medium ml-auto"
                    >
                      Mark Replied (Without Text)
                    </button>
                  ) : (
                    <span className="text-xs text-teal-600 dark:text-teal-400 font-medium ml-auto flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Replied {item.repliedAt}
                    </span>
                  )}
                </div>

                {/* Quick Reply Form Drawer */}
                {activeReplyId === item.id && (
                  <div className="p-3.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Dispatch SMS to {item.callerPhone}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Sent via Quo OpenPhone
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveReplyId(null)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSendReply(item.id, item.callerName)}
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Send Text
                      </button>
                    </div>
                  </div>
                )}

                {/* Add Note Form Drawer */}
                {activeNoteId === item.id && (
                  <div className="p-3.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl space-y-2.5 animate-in fade-in">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Internal Facility Note
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Spoke on phone at 10:15 AM, promised to pay online tonight..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveNoteId(null)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveNote(item.id)}
                        className="px-3.5 py-1.5 bg-slate-900 dark:bg-teal-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
