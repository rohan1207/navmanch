'use client';

import React, { useState, useEffect } from 'react';
import { isSubscribed } from '../utils/subscription';
import SubscribePopup from './SubscribePopup';
import { useSearchParams } from 'next/navigation';

const SubscriptionGuard = ({ children, requireSubscription = true, showBanner = false }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const check = () => {
      const isSub = isSubscribed();
      setSubscribed(isSub);
      setIsChecking(false);
            
      // If not subscribed and requires subscription, show popup
      if (!isSub && requireSubscription) {
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
  }, [requireSubscription]);

  // Block if not subscribed and requires subscription
  if (!subscribed && requireSubscription) {
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

