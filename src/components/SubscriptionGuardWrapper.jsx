'use client';

import { Suspense } from 'react';
import SubscriptionGuard from './SubscriptionGuard';

// Wrapper to handle useSearchParams in Suspense boundary
export default function SubscriptionGuardWrapper({ children, requireSubscription = true, showBanner = false }) {
  return (
    <Suspense fallback={children}>
      <SubscriptionGuard requireSubscription={requireSubscription} showBanner={showBanner}>
        {children}
      </SubscriptionGuard>
    </Suspense>
  );
}
















