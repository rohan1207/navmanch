'use client';

import React from 'react';
import { FaWhatsapp, FaTwitter, FaFacebook, FaShareAlt } from 'react-icons/fa';

const ShareButtons = ({ title, description, image, url }) => {

  // Use frontend URL for sharing (cleaner, better branding)
  const frontendBase = typeof window !== 'undefined' ? window.location.origin : 'https://navmanchnews.com';
  
  // Helper function to ensure frontend URL
  const getFrontendUrl = (inputUrl) => {
    if (!inputUrl) return window.location.href;
    
    try {
      const urlObj = new URL(inputUrl);
      // If it's a backend URL, convert to frontend
      if (urlObj.hostname.includes('onrender.com') || urlObj.hostname.includes('backend')) {
        return `${frontendBase}${urlObj.pathname}${urlObj.search}`;
      }
      // If it's already frontend URL, return as is
      if (urlObj.hostname.includes('navmanchnews.com')) {
        return inputUrl;
      }
      // If relative, make it absolute with frontend domain
      if (inputUrl.startsWith('/')) {
        return `${frontendBase}${inputUrl}`;
      }
      return inputUrl;
    } catch (e) {
      // If URL parsing fails, try simple string replacement
      if (inputUrl.includes('onrender.com') || inputUrl.includes('backend')) {
        return inputUrl.replace(/https?:\/\/[^\/]+/, frontendBase);
      }
      if (inputUrl.startsWith('/')) {
        return `${frontendBase}${inputUrl}`;
      }
      return inputUrl;
    }
  };

  // Get current page URL if not provided, and ensure it's frontend URL
  const inputUrl = url || window.location.href;
  // Ensure we always share the FRONTEND domain (navmanchnews.com)
  // Backend/social-preview HTML is used transparently via the proxy in Frontend/server.js
  // for crawlers, so users (and cards) always see navmanchnews.com links.
  let shareUrl = getFrontendUrl(inputUrl);
  
  // Add sharing parameters for news and epaper links:
  // - shared=true : allows free view for epaper routes
  // - v=2         : simple cache-busting/version so crawlers re-fetch updated OG tags
  try {
    const urlObj = new URL(shareUrl);
    const path = urlObj.pathname || '';

    if (path.startsWith('/epaper/') || path.startsWith('/news/')) {
    urlObj.searchParams.set('shared', 'true');
      // Use timestamp-based cache-busting for more aggressive cache invalidation
      urlObj.searchParams.set('v', Date.now().toString().slice(-6)); // Last 6 digits of timestamp
    shareUrl = urlObj.toString();
    }
  } catch (e) {
    // Ignore parsing errors
  }
  const shareTitle = title || document.title;
  const shareDescription = description || '';
  const shareImage = image || '';

  // WhatsApp share - Format for rich preview card
  const shareWhatsApp = () => {
    // WhatsApp generates preview cards from Open Graph meta tags
    // The URL must be on its own line for WhatsApp to fetch and display preview
    // Format (simplified as per requirement):
    // - First line: title
    // - Blank line
    // - Last line: URL (used by WhatsApp to fetch preview card)
    //
    // NOTE: We intentionally do NOT include description in the prefilled text
    // to keep the message short and consistent across news, epaper, and sections.
    const message = `${shareTitle}\n\n${shareUrl}`;
    
    // Use WhatsApp share API - this triggers preview card generation
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'width=600,height=400');
  };

  // Twitter share
  const shareTwitter = () => {
    const text = `${shareTitle}\n\n${shareUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  // Facebook share
  const shareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('लिंक कॉपी केला गेला!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('लिंक कॉपी करताना त्रुटी आली');
    }
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
      {/* WhatsApp Share */}
      <button
        onClick={shareWhatsApp}
        className="flex items-center justify-center gap-1 sm:gap-2 bg-green-500 text-cleanWhite px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="WhatsApp वर शेअर करा"
        title="WhatsApp वर शेअर करा"
      >
        <FaWhatsapp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Facebook Share */}
      <button
        onClick={shareFacebook}
        className="flex items-center justify-center gap-1 sm:gap-2 bg-blue-600 text-cleanWhite px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="Facebook वर शेअर करा"
        title="Facebook वर शेअर करा"
      >
        <FaFacebook className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Twitter Share */}
      <button
        onClick={shareTwitter}
        className="flex items-center justify-center gap-1 sm:gap-2 bg-sky-500 text-cleanWhite px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-sky-600 transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="Twitter वर शेअर करा"
        title="Twitter वर शेअर करा"
      >
        <FaTwitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className="flex items-center justify-center gap-1 sm:gap-2 bg-subtleGray text-deepCharcoal px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-metaGray transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="लिंक कॉपी करा"
        title="लिंक कॉपी करा"
      >
        <FaShareAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};

export default ShareButtons;

