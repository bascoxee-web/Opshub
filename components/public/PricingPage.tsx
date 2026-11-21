'use client';

import React from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { PlanTier } from '@/types';
import { Check, Sparkles, HelpCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { navigateTo, setSelectedPlanForCheckout } = useGateDesk();

  const handleSelectPlan = (tier: PlanTier) => {
    setSelectedPlanForCheckout(tier);
    navigateTo('checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Simple, Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mt-2">
            One extra rented unit pays for your entire month.
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mt-4 leading-relaxed">
            Month to month. Cancel anytime with one click. No long-term lock-ins or hidden hardware fees.
          </p>

          <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Note: Texting costs are billed directly by your own phone provider (e.g. Quo OpenPhone at wholesale rates).
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Starter Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Starter</h3>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  Single Gate
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                For smaller facilities needing instant missed-call recovery and gate support.
              </p>

              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">$49</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">/ month</span>
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-1">Month-to-month, cancel anytime</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                  What&apos;s Included:
                </p>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Gate Help inbox</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Missed-call alerts & auto-reply</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Tenant help requests dashboard</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Standard email support</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handleSelectPlan('Starter')}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl text-sm transition-colors border border-slate-300 dark:border-slate-700"
              >
                Choose Starter
              </button>
            </div>
          </div>

          {/* Growth Plan - Most Popular */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 border-2 border-teal-500 shadow-2xl relative flex flex-col justify-between transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Most Popular</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Growth</h3>
                <span className="text-xs font-semibold text-teal-300 bg-teal-950/80 border border-teal-800 px-2.5 py-1 rounded-md">
                  Best Value
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Everything you need to fill empty units and give tenants a premium modern experience.
              </p>

              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white tabular-nums">$129</span>
                  <span className="text-sm text-slate-400">/ month</span>
                </div>
                <span className="text-[11px] text-teal-400 block mt-1">Month-to-month, cancel anytime</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
                <p className="font-semibold text-teal-400 uppercase tracking-wider text-[10px]">
                  Everything in Starter, plus:
                </p>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200 font-medium">Branded Tenant App (iOS / Android PWA)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200 font-medium">Referral tracker & automated reward credits</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200 font-medium">Targeted text campaigns (opt-in safe)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">Available Units website button & embed</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">Monthly owner performance report & PDF export</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handleSelectPlan('Growth')}
                className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>Start with Growth</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Managed Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Managed</h3>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  Hands-off
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                For busy owners who want our team to set up and run everything for them.
              </p>

              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">$299</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">/ month</span>
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-1">Month-to-month, cancel anytime</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                  Everything in Growth, plus:
                </p>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">We run it for you: White-glove setup</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Monthly roster & unit updates done by our team</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Seasonal text campaign design & scheduling</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Dedicated account manager & phone check-in</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Priority 15-minute response SLA</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handleSelectPlan('Managed')}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl text-sm transition-colors border border-slate-300 dark:border-slate-700"
              >
                Choose Managed
              </button>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h3>

          <div className="space-y-4 text-sm">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white">
                How do phone lines connect to GateDesk?
              </h5>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                We plug straight into your Quo (OpenPhone) account via an API key in 60 seconds. When an unanswered call occurs, GateDesk immediately detects it and sends a smart SMS reply so the customer doesn&apos;t call the storage facility down the road.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white">
                Does the tenant app require downloading from the Apple App Store?
              </h5>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                No! It is a Progressive Web App (PWA). Renters scan a QR code on your gate sign or receipt, and it opens instantly in their browser with an &quot;Add to Home Screen&quot; prompt. No password creation or App Store logins required.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white">
                Are gate codes exposed or sent in texts?
              </h5>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Strictly never. For facility security, GateDesk directs callers to verify their identity or view secure credentials inside their encrypted account portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
