'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { PlanTier } from '@/types';
import { ShieldCheck, Check, ArrowLeft, Loader2, Sparkles, Building, CreditCard } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    selectedPlanForCheckout,
    setSelectedPlanForCheckout,
    navigateTo,
    facility,
    updateFacility,
    addToast,
    setWizardStep,
  } = useGateDesk();

  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);
  const [payPalModalOpen, setPayPalModalOpen] = useState(false);
  const [payPalAccountEmail, setPayPalAccountEmail] = useState('owner@sunnycoaststorage.com');

  const planPrices: Record<PlanTier, number> = {
    Starter: 49,
    Growth: 129,
    Managed: 299,
  };

  const planFeatures: Record<PlanTier, string[]> = {
    Starter: [
      'Gate Help inbox & missed-call SMS alerts',
      'Instant tenant help requests routing',
      'Quo OpenPhone integration',
      'Email support',
    ],
    Growth: [
      'Everything in Starter',
      'Branded Tenant App (iOS/Android PWA)',
      'Automated tenant referral tracker ($50 rewards)',
      'Targeted opt-in text campaigns',
      'Live Available Units embed & reservations',
      'Monthly owner financial performance report',
    ],
    Managed: [
      'Everything in Growth',
      'Done-For-You initial facility setup',
      'Monthly tenant roster updates handled by staff',
      'Monthly strategy & phone check-in',
      'Priority 15-minute response SLA',
    ],
  };

  const currentPrice = planPrices[selectedPlanForCheckout];

  const handleStartPayPalFlow = () => {
    setPayPalModalOpen(true);
  };

  const handleConfirmPayPalSubscription = async () => {
    setIsProcessingPayPal(true);
    await new Promise((res) => setTimeout(res, 1200));

    // Update facility plan in state
    updateFacility({
      plan: {
        tier: selectedPlanForCheckout,
        price: currentPrice,
        billingCycle: 'monthly',
        isPopular: selectedPlanForCheckout === 'Growth',
        nextPaymentDate: '2026-12-05',
        features: planFeatures[selectedPlanForCheckout],
      },
    });

    setIsProcessingPayPal(false);
    setPayPalModalOpen(false);

    addToast({
      type: 'success',
      title: 'Subscription confirmed!',
      message: `PayPal billing active for ${selectedPlanForCheckout} plan ($${currentPrice}/mo). Opening Setup Wizard...`,
    });

    setWizardStep(1);
    navigateTo('wizard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigateTo('pricing')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Plans</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Order Summary */}
          <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Facility Subscription
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Complete Your GateDesk Setup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Subscribing for <strong className="text-slate-800 dark:text-slate-200">{facility.name}</strong>
              </p>
            </div>

            {/* Plan switcher buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Selected Plan
              </label>
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {(['Starter', 'Growth', 'Managed'] as PlanTier[]).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedPlanForCheckout(tier)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                      selectedPlanForCheckout === tier
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tier} (${planPrices[tier]})
                  </button>
                ))}
              </div>
            </div>

            {/* Features check list */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Included in {selectedPlanForCheckout} Plan:
              </span>
              {planFeatures[selectedPlanForCheckout].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Terms notice */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
                Month-to-month, cancel anytime
              </span>
              Your subscription starts today with a 14-day evaluation window. You can change plans or cancel at any time directly in Settings.
            </div>
          </div>

          {/* Right Column: Payment Box */}
          <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Billing Summary
            </h3>

            <div className="space-y-3 text-xs border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>GateDesk {selectedPlanForCheckout} (Monthly)</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">${currentPrice}.00</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>14-day trial discount</span>
                <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold">-$0.00</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Sales Tax</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">$0.00</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Total Due Today</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Renews at ${currentPrice}/mo</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums font-mono">
                ${currentPrice}.00
              </div>
            </div>

            {/* PayPal Button Simulation */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartPayPalFlow}
                className="w-full py-3.5 px-4 bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span className="font-black italic text-base">Pay</span>
                <span className="font-black italic text-base text-[#0079C1]">Pal</span>
                <span className="text-slate-900 font-semibold ml-1">Subscribe</span>
              </button>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 text-center block mt-2">
                Simulated secure PayPal subscription modal
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>256-bit encrypted simulated checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Subscription Simulation Modal */}
      {payPalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-slate-900 animate-in fade-in zoom-in-95">
            {/* PayPal Header */}
            <div className="bg-[#003087] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-1 font-black italic text-lg tracking-tight">
                <span>Pay</span>
                <span className="text-[#0079C1]">Pal</span>
              </div>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">
                Sandbox Mode
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Subscribe to
                </span>
                <h4 className="font-bold text-base text-slate-900">
                  GateDesk {selectedPlanForCheckout} Plan
                </h4>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                  ${currentPrice}.00 USD / month
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PayPal Account Email
                </label>
                <input
                  type="email"
                  value={payPalAccountEmail}
                  onChange={(e) => setPayPalAccountEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0079C1]"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-medium text-slate-800">Automatic Monthly Payment Agreement</p>
                <p className="text-[11px] leading-relaxed">
                  By clicking Agree &amp; Subscribe, you authorize GateDesk via Retch VisionAI Solution to charge your PayPal balance or linked card ${currentPrice}.00 USD monthly. Cancel anytime.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayPalModalOpen(false)}
                  disabled={isProcessingPayPal}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPayPalSubscription}
                  disabled={isProcessingPayPal}
                  className="flex-1 py-2.5 bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isProcessingPayPal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <span>Agree &amp; Subscribe</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
