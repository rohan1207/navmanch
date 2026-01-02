// Simple in-memory cache for API responses
class APICache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = 2 * 60 * 1000; // 2 minutes default TTL
  }

  // Generate cache key from endpoint and params
  getKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}${sortedParams ? `?${sortedParams}` : ''}`;
  }

  // Get cached data if still valid
  get(endpoint, params = {}, ttl = this.defaultTTL) {
    const key = this.getKey(endpoint, params);
    const timestamp = this.timestamps.get(key);
    const data = this.cache.get(key);

    if (!data || !timestamp) {
      return null;
    }

    // Check if cache is still valid
    const age = Date.now() - timestamp;
    if (age > ttl) {
      // Cache expired
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }

    return data;
  }

  // Set cache data
  set(endpoint, params = {}, data) {
    const key = this.getKey(endpoint, params);
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
  }

  // Clear specific cache entry
  clear(endpoint, params = {}) {
    const key = this.getKey(endpoint, params);
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  // Clear all cache
  clearAll() {
    this.cache.clear();
    this.timestamps.clear();
  }

  // Get cache size (for debugging)
  size() {
    return this.cache.size;
  }
}

// Create singleton instance
const apiCache = new APICache();

export default apiCache;

