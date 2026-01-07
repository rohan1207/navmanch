/**
 * Utility to load e-paper data
 * Tries to fetch from API first, then falls back to localStorage
 */

import { apiFetch } from './api';

export const loadEpapers = async () => {
  try {
    // Fetch from API (primary source)
    const response = await apiFetch('/epapers', { method: 'GET' });
    if (response && Array.isArray(response)) {
      console.log('Loaded epapers from API:', response.length);
      // Don't save to localStorage - data is too large with base64 images
      return response;
    }
    
    // Return empty array if API returns empty or invalid response
    return [];
  } catch (apiError) {
    // API not available - log but don't try localStorage (data too large)
    console.log('API not available:', apiError.message);
    console.log('Cannot use localStorage fallback - e-paper data too large');
    // Return empty array - frontend will use fallback data from newsData.json
    return [];
  }
};

export const getEpaperById = async (id) => {
  const epapers = await loadEpapers();
  if (!epapers || epapers.length === 0) return null;
  return epapers.find(ep => ep.id === parseInt(id));
};

