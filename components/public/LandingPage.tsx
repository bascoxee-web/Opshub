'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import {
  PhoneCall,
  TrendingUp,
  Gift,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  KeyRound,
  DollarSign,
  ChevronRight,
  Users,
} from 'lucide-react';
import Image from 'next/image';

export const LandingPage: React.FC = () => {
  const { navigateTo, setSelectedPlanForCheckout, setIsTenantPreviewModalOpen, facility } = useGateDesk();
  const [interactiveTestPhone, setInteractiveTestPhone] = useState('(619) 555-0182');
  const [simulatedReplySent, setSimulatedReplySent] = useState(false);

  const handleTestSimulatedCall = () => {
    setSimulatedReplySent(true);
    setTimeout(() => {
      setSimulatedReplySent(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Built for Independent Self-Storage Facility Owners</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Never miss a tenant again.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Turn after-hours missed calls into booked storage units with instant text alerts, fill empty units automatically, and get more word-of-mouth referrals without paying advertising fees.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedPlanForCheckout('Growth');
                    navigateTo('pricing');
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base group"
                >
                  <span>Start Now — Free 14-Day Trial</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setIsTenantPreviewModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Smartphone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Preview Branded Tenant App</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  No credit card required to start
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Month-to-month, cancel anytime
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Works with Quo OpenPhone
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-900 group">
                <Image
                  src="/hero_storage.jpg"
                  alt="Modern self storage facility exterior"
                  width={720}
                  height={480}
                  className="w-full h-72 sm:h-84 object-cover brightness-95 group-hover:scale-102 transition-transform duration-700"
                  priority
                />

                {/* Floating Live Alert Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-3.5 border border-slate-700/80 shadow-xl text-white text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                      <span className="font-bold text-teal-300">Live Gate Desk Engine</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">Just now</span>
                  </div>

                  <div className="mt-2.5 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">
                        Missed call recovered · Unit B-104
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        &quot;Auto-sent: Hi Sarah! Saw your missed call. Our office opens at 9am, your gate code is active 24/7.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Benefit Cards */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2">
            Why Storage Owners Love GateDesk
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Built specifically to solve the 3 biggest headaches in self-storage
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Benefit 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                1. Missed-call alerts & instant recovery
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                When a prospective tenant or locked-out renter calls while you are busy or after hours, GateDesk instantly identifies them, triggers a personalized SMS reply, and flags the inbox.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  Matches caller to tenant database & gate status
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  Color warnings after 5 minutes of waiting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  Strictly secure: never sends raw gate codes
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <span>View Gate Help inbox</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                2. Fill empty units automatically
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Embed your live available unit inventory on your existing facility website in 30 seconds. Inbound shoppers reserve sizes right from their phone and appear in your Reservations dashboard.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  Real-time unit availability & pricing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  Copy-paste embed code or direct links
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  Captures name, phone & target move-in date
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <span>Explore available units embed</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <Gift className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                3. More tenant referrals on autopilot
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Every current tenant gets their own shareable referral link and code in their branded Tenant App. When friends move in, rewards are logged and applied to next month rent automatically.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  Customizable reward amount (default $50)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  Automated tracker from pending to applied
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  Cheaper than buying Google or Yelp ads
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <span>View referral tracker</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* "Your Own Tenant App Included" Section with Phone Mockup */}
      <section className="py-16 lg:py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left explanation */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 border border-teal-700 text-teal-300 text-xs font-medium">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Included Free in Growth & Managed Plans</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Your own branded Tenant App. Zero app store hassle.
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Give your renters an instant Progressive Web App carrying <strong className="text-white">{facility.name}</strong>’s colors, name, and logo. Tenants scan a QR code at your office or click a link to install it directly to their home screen.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">Instant Gate & Office Support</h5>
                    <p className="text-xs text-slate-400">Tenants report gate trouble or questions with 1 tap. Appears in your Gate Help inbox immediately.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">1-Tap Rent Payment Portal</h5>
                    <p className="text-xs text-slate-400">Links directly to your existing payment processor. You keep your existing merchant rates.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">Built-in Referral Generator</h5>
                    <p className="text-xs text-slate-400">Renters share their unique code via text or WhatsApp in 2 taps.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsTenantPreviewModalOpen(true)}
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-lg flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Test Tenant App Live on Screen</span>
                </button>
              </div>
            </div>

            {/* Right: Phone Mockup Frame */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-76 sm:w-84 h-[560px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-800">
                {/* Speaker notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full flex items-center justify-center gap-2 z-20">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                  <div className="w-8 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Inner Screen Preview */}
                <div className="w-full h-full bg-slate-900 rounded-[34px] overflow-hidden flex flex-col text-white pt-10">
                  {/* Tenant App Top Header */}
                  <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-teal-500 text-slate-950 text-xs font-bold flex items-center justify-center">
                        SC
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[150px]">
                        {facility.name}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-900/80 text-teal-300 font-medium">
                      Unit B-104
                    </span>
                  </div>

                  {/* Body Content Preview */}
                  <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                      <p className="text-[11px] text-slate-400">Welcome, Sarah!</p>
                      <h4 className="font-bold text-sm text-white mt-0.5">Gate Access Open</h4>
                      <p className="text-[11px] text-teal-400 mt-1 font-mono">Hours: 6:00 AM - 10:00 PM</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700 text-center">
                        <PhoneCall className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                        <span className="text-[11px] font-semibold block">Call Office</span>
                      </div>
                      <div className="bg-teal-950/80 p-2.5 rounded-xl border border-teal-800 text-center">
                        <Gift className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                        <span className="text-[11px] font-semibold block text-teal-200">Share $50</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300">Need Gate Help?</span>
                        <span className="text-teal-400 font-semibold">Fast Reply</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Report keypad error or question. Staff receives alert immediately.
                      </p>
                    </div>
                  </div>

                  {/* Bottom Navigation Mockup */}
                  <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex items-center justify-around text-[10px] text-slate-400">
                    <span className="text-teal-400 font-bold flex flex-col items-center">
                      <span>Home</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span>Help</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span>Refer</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span>Units</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span>Pay</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive SMS Recovery Demo */}
      <section className="py-16 lg:py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Interactive Simulation
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Test how GateDesk handles a missed caller right now
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              Enter any test phone number and click simulate to see the instant text notification flow.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={interactiveTestPhone}
                onChange={(e) => setInteractiveTestPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={handleTestSimulatedCall}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs shrink-0"
              >
                Simulate Call
              </button>
            </div>

            {simulatedReplySent && (
              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-xs text-slate-800 dark:text-slate-200 space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 font-bold text-teal-700 dark:text-teal-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Call Intercepted & Text Sent (0.4s)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  &quot;Sunny Coast Storage: Sorry we missed your call! Need storage or gate assistance? Reply to this text or open our tenant portal: https://sunnycoast.gatedesk.app&quot;
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 bg-slate-900 text-white text-center border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Ready to stop losing storage rentals to missed calls?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            Setup takes less than 10 minutes. Connect your Quo OpenPhone line or upload your tenant roster today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setSelectedPlanForCheckout('Growth');
                navigateTo('pricing');
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm sm:text-base shadow-lg transition-transform hover:scale-102"
            >
              Start Free Trial — View Pricing
            </button>
            <button
              onClick={() => navigateTo('login')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700"
            >
              Sign In to Existing Facility
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
