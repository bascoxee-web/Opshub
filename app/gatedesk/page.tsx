'use client';

import React from 'react';
import { GateDeskProvider, useGateDesk } from '@/context/GateDeskContext';
import { DemoBanner } from '@/components/common/DemoBanner';
import { OwnerNavbar } from '@/components/common/OwnerNavbar';
import { OwnerFooter } from '@/components/common/OwnerFooter';
import { MobileBottomBar } from '@/components/common/MobileBottomBar';
import { ToastContainer } from '@/components/common/ToastContainer';
import { LandingPage } from '@/components/public/LandingPage';
import { PricingPage } from '@/components/public/PricingPage';
import { AuthPages } from '@/components/public/AuthPages';
import { CheckoutPage } from '@/components/public/CheckoutPage';
import { SetupWizard } from '@/components/wizard/SetupWizard';
import { TodayDashboard } from '@/components/owner/TodayDashboard';
import { GateHelpInbox } from '@/components/owner/GateHelpInbox';
import { HelpRequestsView } from '@/components/owner/HelpRequestsView';
import { ReferralTrackerView } from '@/components/owner/ReferralTrackerView';
import { TextCampaignsView } from '@/components/owner/TextCampaignsView';
import { ReservationsView } from '@/components/owner/ReservationsView';
import { OwnerReportView } from '@/components/owner/OwnerReportView';
import { SettingsView } from '@/components/owner/SettingsView';
import { DocumentCenterView } from '@/components/owner/DocumentCenterView';
import { BusinessHubView } from '@/components/owner/BusinessHubView';
import { TenantAppView } from '@/components/tenant/TenantAppView';
import { TenantPhoneModal } from '@/components/tenant/TenantPhoneModal';
import { ArrowLeft } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentView, navigateTo } = useGateDesk();

  // If viewing standalone Tenant App
  if (currentView === 'tenant-app') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <DemoBanner />
        <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-xs text-slate-300 border-b border-slate-800">
          <button
            onClick={() => navigateTo('today')}
            className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Owner Operations</span>
          </button>
          <span className="text-[11px] text-slate-400 font-mono">
            Tenant PWA View (Standalone)
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <TenantAppView isStandalone={true} />
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Slim Workspace Banner */}
      <DemoBanner />

      {/* 2. Owner Top Navbar */}
      <OwnerNavbar />

      {/* 3. Main Body Route Render */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'pricing' && <PricingPage />}
        {(currentView === 'login' || currentView === 'signup' || currentView === 'forgot-password') && (
          <AuthPages />
        )}
        {currentView === 'checkout' && <CheckoutPage />}
        {currentView === 'wizard' && <SetupWizard />}

        {/* Owner App Views */}
        {currentView === 'today' && <TodayDashboard />}
        {currentView === 'business-hub' && <BusinessHubView />}
        {currentView === 'gate-help' && <GateHelpInbox />}
        {currentView === 'help-requests' && <HelpRequestsView />}
        {currentView === 'documents' && <DocumentCenterView />}
        {currentView === 'referrals' && <ReferralTrackerView />}
        {currentView === 'campaigns' && <TextCampaignsView />}
        {currentView === 'reservations' && <ReservationsView />}
        {currentView === 'report' && <OwnerReportView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      {/* 4. Owner Footer (on every owner page) */}
      <OwnerFooter />

      {/* 5. Mobile Bottom Tab Bar */}
      <MobileBottomBar />

      {/* 6. Phone Simulator Modal (preview anytime) */}
      <TenantPhoneModal />

      {/* 7. Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function GateDeskPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800 px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">GateDesk</span>
            <span className="text-slate-400 hidden sm:inline">· Business Operations</span>
          </div>
          <div className="text-slate-400 text-xs">Loading workspace...</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-300 font-medium text-sm">Initializing GateDesk...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GateDeskProvider>
      <MainAppContent />
    </GateDeskProvider>
  );
}
