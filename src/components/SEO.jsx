'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SEO = ({ title, description, image, url, type = 'article' }) => {
  const pathname = usePathname();
  
  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://navmanchnews.com';
    const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : `${baseUrl}${pathname}`);
    const siteName = 'नव मंच - Nav Manch';
    
    // Ensure image URL is absolute and accessible
    const getAbsoluteImageUrl = (imgUrl) => {
      if (!imgUrl || imgUrl.trim() === '') {
        return `${baseUrl}/logo1.png`;
      }
      
      // If already absolute URL (starts with http:// or https://)
      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
        return imgUrl;
      }
      
      // If relative URL, make it absolute
      if (imgUrl.startsWith('/')) {
        return `${baseUrl}${imgUrl}`;
      }
      
      // If relative path without leading slash
      return `${baseUrl}/${imgUrl}`;
    };
    
    const absoluteImageUrl = getAbsoluteImageUrl(image);
    
    // Update or create meta tags
    const updateMetaTag = (property, content, isProperty = true) => {
      if (!content) return; // Don't set empty content
      
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update title
    if (title) {
      document.title = `${title} | ${siteName}`;
    }

    // Basic meta tags
    if (description) {
      updateMetaTag('description', description, false);
    }
    
    // Open Graph tags (required for WhatsApp/Facebook previews)
    if (title) updateMetaTag('og:title', title);
    // if (description) updateMetaTag('og:description', description);
    updateMetaTag('og:image', absoluteImageUrl);
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:image:type', 'image/jpeg');
    updateMetaTag('og:url', fullUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', siteName);
    updateMetaTag('og:locale', 'mr_IN');
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', false);
    if (title) updateMetaTag('twitter:title', title, false);
    if (description) updateMetaTag('twitter:description', description, false);
    updateMetaTag('twitter:image', absoluteImageUrl, false);
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Cleanup function (optional, but good practice)
    return () => {
      // Meta tags persist, which is fine for SEO
    };
  }, [title, description, image, url, type, pathname]);

  return null;
};

export default SEO;

