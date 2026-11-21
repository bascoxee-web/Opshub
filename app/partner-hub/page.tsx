import React from 'react';
import { PartnerErrorBoundary } from '@/components/partner-hub/PartnerErrorBoundary';
import { PartnerHubApp } from '@/components/partner-hub/PartnerHubApp';

export default function PartnerHubPage() {
  return (
    <PartnerErrorBoundary>
      <PartnerHubApp />
    </PartnerErrorBoundary>
  );
}
