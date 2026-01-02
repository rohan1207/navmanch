// Subscription utility for managing user subscriptions
const SUBSCRIPTION_KEY = 'navmanch_subscription';
const SUBSCRIPTION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export const getSubscription = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(SUBSCRIPTION_KEY);
    if (!stored) return null;
    
    const subscription = JSON.parse(stored);
    const now = Date.now();
    
    // Check if subscription is still valid
    if (subscription.expiresAt && now > subscription.expiresAt) {
      // Subscription expired, remove it
      localStorage.removeItem(SUBSCRIPTION_KEY);
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

export const isSubscribed = () => {
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

