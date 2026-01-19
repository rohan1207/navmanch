// Subscription utility for managing user subscriptions
const SUBSCRIPTION_KEY = 'navmanch_subscription';
const SUBSCRIPTION_DURATION = 365 * 24 * 60 * 60 * 1000; // 365 days in milliseconds (1 year)

export const getSubscription = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(SUBSCRIPTION_KEY);
    if (!stored) return null;
    
    const subscription = JSON.parse(stored);
    const now = Date.now();
    
    // Check if subscription is still valid
    // If expired, don't remove it immediately - check backend first
    if (subscription.expiresAt && now > subscription.expiresAt) {
      // Subscription expired in localStorage, but check backend before removing
      // Return null for now, but backend check will verify if still subscribed
      return null;
    }
    
    return subscription;
  } catch (error) {
    console.error('Error reading subscription:', error);
    return null;
  }
};

export const setSubscription = (subscriberData) => {
  if (typeof window === 'undefined') return;
  
  try {
    const subscription = {
      ...subscriberData,
      subscribedAt: Date.now(),
      expiresAt: Date.now() + SUBSCRIPTION_DURATION
    };
    
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    
    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent('subscriptionUpdated', { detail: subscription }));
  } catch (error) {
    console.error('Error saving subscription:', error);
  }
};

// Check subscription with backend API first (using email/phone if available)
export const isSubscribed = async (email = null, phone = null) => {
  // If email or phone provided, check with backend
  if (email || phone) {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE}/subscribers/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.exists && data.subscriber) {
          // Update localStorage with subscriber data
          setSubscription(data.subscriber);
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking subscription with backend:', error);
      // Fallback to localStorage
    }
  }
  
  // Fallback to localStorage check
  const subscription = getSubscription();
  return subscription !== null;
};

// Synchronous version for initial checks (uses localStorage cache)
export const isSubscribedSync = () => {
  const subscription = getSubscription();
  return subscription !== null;
};

export const getSubscriberName = () => {
  const subscription = getSubscription();
  return subscription?.name || null;
};

export const getSubscriberInitial = () => {
  const subscription = getSubscription();
  if (!subscription?.name) return null;
  
  // Get first letter of first word
  const firstWord = subscription.name.trim().split(' ')[0];
  return firstWord.charAt(0).toUpperCase();
};

export const checkSubscriberExists = async (email, phone) => {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const response = await fetch(`${API_BASE}/subscribers/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email || '', 
        phone: phone || '' 
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.exists && data.subscriber ? data.subscriber : null;
    }
    return null;
  } catch (error) {
    console.error('Error checking subscriber:', error);
    return null;
  }
};

export const clearSubscription = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SUBSCRIPTION_KEY);
  window.dispatchEvent(new CustomEvent('subscriptionUpdated', { detail: null }));
};

