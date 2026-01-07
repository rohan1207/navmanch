// Stats utility for managing live website statistics
const STATS_KEY = 'navmanch_stats';
const SESSION_KEY = 'navmanch_session';

// Get today's date string (YYYY-MM-DD)
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Initialize stats with default values
const getDefaultStats = () => ({
  totalVisits: 0,
  visitsToday: 0,
  totalHits: 0,
  hitsToday: 0,
  lastVisitDate: getTodayString()
});

// Fetch stats from backend API (global stats across all devices)
export const getStats = async () => {
  if (typeof window === 'undefined') return getDefaultStats();
  
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    
    const response = await fetch(`${API_BASE}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 5 seconds to reduce API calls
      cache: 'no-cache'
    });
    
    if (response.ok) {
      const stats = await response.json();
      // Cache in localStorage as fallback
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
      return stats;
    } else {
      // Fallback to localStorage if API fails
      const stored = localStorage.getItem(STATS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return getDefaultStats();
    }
  } catch (error) {
    console.error('Error fetching stats from API:', error);
    // Fallback to localStorage if API fails
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading stats from localStorage:', e);
    }
    return getDefaultStats();
  }
};

// Synchronous version for initial render (uses cached value)
export const getStatsSync = () => {
  if (typeof window === 'undefined') return getDefaultStats();
  
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return getDefaultStats();
  } catch (error) {
    console.error('Error reading stats:', error);
    return getDefaultStats();
  }
};

// Check if this is a new session (visit)
// Uses sessionStorage + timestamp to detect actual new sessions
// Prevents counting reloads as new visits
const isNewSession = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    const sessionId = sessionStorage.getItem(SESSION_KEY);
    const sessionTimestamp = sessionStorage.getItem(`${SESSION_KEY}_time`);
    const now = Date.now();
    
    // Session timeout: 30 minutes of inactivity = new session
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    if (!sessionId || !sessionTimestamp) {
      // New session - create session ID and timestamp
      sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      sessionStorage.setItem(`${SESSION_KEY}_time`, now.toString());
      return true;
    }
    
    // Check if session expired (30 minutes of inactivity)
    const lastActivity = parseInt(sessionTimestamp);
    if (now - lastActivity > SESSION_TIMEOUT) {
      // Session expired - treat as new session
      sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      sessionStorage.setItem(`${SESSION_KEY}_time`, now.toString());
      return true;
    }
    
    // Update last activity time (but don't count as new visit)
    sessionStorage.setItem(`${SESSION_KEY}_time`, now.toString());
    return false;
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
};

// Increment stats on page visit
export const incrementStats = () => {
  if (typeof window === 'undefined') return;
  
  // Only track on navmanchnews.com domain
  const hostname = window.location.hostname;
  if (!hostname.includes('navmanchnews.com') && !hostname.includes('localhost')) {
    return;
  }
  
  try {
    const stats = getStatsSync();
    const isNewVisit = isNewSession();
    
    // Cooldown period: Don't count hits if page reloaded within 5 seconds
    // This prevents rapid reloads from inflating hit counts
    const HIT_COOLDOWN = 5 * 1000; // 5 seconds
    const lastHitTime = localStorage.getItem(`${STATS_KEY}_lastHit`);
    const now = Date.now();
    
    let shouldCountHit = true;
    if (lastHitTime) {
      const timeSinceLastHit = now - parseInt(lastHitTime);
      if (timeSinceLastHit < HIT_COOLDOWN) {
        // Too soon after last hit - probably a reload, don't count
        shouldCountHit = false;
      }
    }
    
    // Increment hits (every page view, but with cooldown)
    if (shouldCountHit) {
      stats.totalHits = (stats.totalHits || 0) + 1;
      stats.hitsToday = (stats.hitsToday || 0) + 1;
      localStorage.setItem(`${STATS_KEY}_lastHit`, now.toString());
    }
    
    // Increment visits (only for new sessions - not reloads)
    if (isNewVisit) {
      stats.totalVisits = (stats.totalVisits || 0) + 1;
      stats.visitsToday = (stats.visitsToday || 0) + 1;
    }
    
    // Update last visit date
    stats.lastVisitDate = getTodayString();
    
    // Send to backend FIRST (this is the source of truth)
    // This gives accurate counts across all users and devices
    sendStatsToBackend(isNewVisit, shouldCountHit).catch(err => {
      // Silently fail - don't block user experience
      console.debug('Failed to send stats to backend:', err);
    });
    
    // Also save to localStorage as cache/fallback
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    
    // Dispatch event for components to listen
    window.dispatchEvent(new CustomEvent('statsUpdated', { detail: stats }));
    
    return stats;
  } catch (error) {
    console.error('Error incrementing stats:', error);
  }
};

// Send stats to backend for server-side aggregation
// This gives accurate counts across all users and devices
const sendStatsToBackend = async (isNewVisit, isNewHit) => {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    
    // Only send if it's a meaningful event (new visit or new hit)
    if (!isNewVisit && !isNewHit) return;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${API_BASE}/stats/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isNewVisit,
        isNewHit,
        timestamp: Date.now(),
        date: getTodayString()
      }),
      signal: controller.signal
    }).catch(() => {
      // Ignore errors - this is optional tracking
      clearTimeout(timeoutId);
    });
    
    clearTimeout(timeoutId);
    
    // If successful, fetch updated stats
    if (response && response.ok) {
      // Trigger stats refresh after a short delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('statsRefresh'));
      }, 500);
    }
  } catch (error) {
    // Silently fail - don't affect user experience
  }
};

// Initialize stats on page load
export const initStats = () => {
  if (typeof window === 'undefined') return;
  
  // Increment stats on every page load
  incrementStats();
};

