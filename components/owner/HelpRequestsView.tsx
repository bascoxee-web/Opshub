'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { TicketCategory, TicketStatus } from '@/types';
import {
  MessageSquare,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Smartphone,
  Globe,
  Phone,
  User,
  AlertCircle,
} from 'lucide-react';

export const HelpRequestsView: React.FC = () => {
  const { helpRequests, updateTicketStatus, addTicketReply } = useGateDesk();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    helpRequests.length > 0 ? helpRequests[0].id : null
  );
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TicketCategory>('all');
  const [replyMessage, setReplyMessage] = useState('');

  const filteredTickets = helpRequests.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  const activeTicket = helpRequests.find((t) => t.id === selectedTicketId) || filteredTickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTicket && replyMessage.trim()) {
      addTicketReply(activeTicket.id, replyMessage.trim(), 'owner');
      setReplyMessage('');
    }
  };

  const getSourceIcon = (source: string) => {
    if (source === 'Tenant App') return <Smartphone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
    if (source === 'Website') return <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    return <Phone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Tenant Help Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Inquiries routed from the Tenant App, website help buttons, and phone transcripts.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="In progress">In progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 capitalize"
          >
            <option value="all">All Categories</option>
            <option value="gate">Gate</option>
            <option value="billing">Billing</option>
            <option value="unit">Unit Issue</option>
            <option value="moving">Moving Carts</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Main 2-Column Split: Ticket List on Left, Active Ticket Thread on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Ticket Cards List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No tickets matching current filters.
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = activeTicket?.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all text-xs space-y-2 ${
                    isSelected
                      ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <span>{ticket.ticketNumber}</span>
                      <span className="text-slate-400 font-normal">·</span>
                      <span className="font-mono text-slate-600 dark:text-slate-400">Unit {ticket.unit}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ticket.status === 'New'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : ticket.status === 'In progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {ticket.subject}
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {ticket.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      {getSourceIcon(ticket.source)}
                      <span>{ticket.tenantName}</span>
                    </span>
                    <span className="font-mono">{ticket.createdAt}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Active Ticket Thread */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              {/* Ticket Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                      {activeTicket.ticketNumber}
                    </span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded capitalize font-medium text-slate-600 dark:text-slate-300">
                      Category: {activeTicket.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {activeTicket.subject}
                  </h3>
                </div>

                {/* Status Changer */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Status:</span>
                  <select
                    value={activeTicket.status}
                    onChange={(e) => updateTicketStatus(activeTicket.id, e.target.value as any)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="New">New</option>
                    <option value="In progress">In progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Tenant info bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-xs">
                    {activeTicket.tenantName.substring(0, 1)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {activeTicket.tenantName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {activeTicket.phone} · Unit {activeTicket.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <span>Source:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {activeTicket.source}
                  </span>
                </div>
              </div>

              {/* Message thread */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {/* Original tenant submission */}
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {activeTicket.tenantName} (Tenant)
                    </span>
                    <span>{activeTicket.createdAt}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {activeTicket.message}
                  </p>
                </div>

                {/* Reply history */}
                {activeTicket.replies.map((reply) => {
                  const isOwner = reply.sender === 'owner';
                  return (
                    <div
                      key={reply.id}
                      className={`p-4 rounded-2xl text-xs space-y-1.5 ${
                        isOwner
                          ? 'bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 ml-6 text-slate-900 dark:text-slate-100'
                          : 'bg-slate-100 dark:bg-slate-800 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className={`font-bold ${isOwner ? 'text-teal-700 dark:text-teal-300' : 'text-slate-900'}`}>
                          {reply.senderName} ({isOwner ? 'Facility Staff' : 'Tenant'})
                        </span>
                        <span className="font-mono">{reply.timestamp}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reply to {activeTicket.tenantName}
                </label>
                <textarea
                  rows={3}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here. This will be sent directly to the tenant's app..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Tenant will receive push notification &amp; app update.
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              Select a ticket on the left to review the conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
