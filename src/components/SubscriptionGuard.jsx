'use client';

import React, { useState, useEffect } from 'react';
import { isSubscribed } from '../utils/subscription';
import SubscribePopup from './SubscribePopup';
import { useSearchParams } from 'next/navigation';

const SubscriptionGuard = ({ children, requireSubscription = true, showBanner = false }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const searchParams = useSearchParams();
  const isSharedLink = typeof window !== 'undefined' && (searchParams?.get('shared') === 'true' || window.location.search.includes('shared=true'));

  useEffect(() => {
    const check = () => {
      const isSub = isSubscribed();
      setSubscribed(isSub);
      setIsChecking(false);
      
      // If shared link, show banner instead of blocking
      if (isSharedLink && !isSub) {
        // Allow viewing but show banner
        return;
      }
      
      // If not subscribed and requires subscription, show popup
      if (!isSub && requireSubscription && !isSharedLink) {
        setShowPopup(true);
      }
    };
    
    check();
    
    // Listen for subscription updates
    const handleUpdate = () => {
      const isSub = isSubscribed();
      setSubscribed(isSub);
      if (isSub) {
        setShowPopup(false);
      }
    };
    
    window.addEventListener('subscriptionUpdated', handleUpdate);
    return () => {
      window.removeEventListener('subscriptionUpdated', handleUpdate);
    };
  }, [requireSubscription, isSharedLink]);

  // Show banner for shared links
  if (isSharedLink && !subscribed && showBanner) {
    return (
      <>
        <div className="bg-newsRed text-cleanWhite p-4 text-center sticky top-0 z-40 shadow-md">
          <p className="text-sm font-semibold">
            कृपया सबस्क्राईब करा पूर्ण सामग्री वाचण्यासाठी | 
            <button 
              onClick={() => setShowPopup(true)}
              className="underline ml-2 font-bold hover:opacity-80"
            >
              सबस्क्राईब करा
            </button>
          </p>
        </div>
        {children}
        <SubscribePopup 
          isOpen={showPopup} 
          onClose={() => setShowPopup(false)}
          allowClose={false}
        />
      </>
    );
  }

  // Block if not subscribed and requires subscription
  if (!subscribed && requireSubscription && !isSharedLink) {
    return (
      <>
        <div className="min-h-screen bg-subtleGray flex items-center justify-center p-4">
          <div className="bg-cleanWhite rounded-lg shadow-lg p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-deepCharcoal mb-4">
              सबस्क्रिप्शन आवश्यक आहे
            </h2>
            <p className="text-slateBody mb-6">
              ही सामग्री वाचण्यासाठी कृपया सबस्क्राईब करा
            </p>
            <button
              onClick={() => setShowPopup(true)}
              className="bg-newsRed text-cleanWhite px-6 py-3 rounded-lg font-semibold hover:bg-newsRed/90 transition-colors"
            >
              सबस्क्राईब करा
            </button>
          </div>
        </div>
        <SubscribePopup 
          isOpen={showPopup} 
          onClose={() => setShowPopup(false)}
          allowClose={false}
        />
      </>
    );
  }

  // Show content if subscribed or shared link
  return <>{children}</>;
};

export default SubscriptionGuard;

