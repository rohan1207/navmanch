'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const HeaderContext = createContext(null);

export const HeaderProvider = ({ children }) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [breakingNewsHeight, setBreakingNewsHeight] = useState(44); // Default mobile height
  const headerRef = useRef(null);

  // Measure actual header height
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
      } else {
        // Fallback values if ref not available
        const isMobile = window.innerWidth < 768;
        // Desktop: top bar with stats (~50px) + main header (~80px) = ~130px
        // Mobile: top bar with stats (~85px) + main header (~94px) = ~179px
        setHeaderHeight(isMobile ? 179 : 130);
      }
    };

    // Initial measurement
    updateHeaderHeight();
    
    // Measure after a short delay to ensure DOM is fully rendered
    const timeout1 = setTimeout(updateHeaderHeight, 50);
    const timeout2 = setTimeout(updateHeaderHeight, 200);
    const timeout3 = setTimeout(updateHeaderHeight, 500);
    
    // Also measure on resize
    window.addEventListener('resize', updateHeaderHeight);
    
    // Use MutationObserver to detect when header content changes
    let observer;
    if (headerRef.current) {
      observer = new MutationObserver(updateHeaderHeight);
      observer.observe(headerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }
    
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    let scrollTimeout = null;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollY;
          
          // Always show header at top of page
          if (currentScrollY < 30) {
            setIsHeaderVisible(true);
          } 
          // Hide when scrolling down (with threshold to prevent flickering)
          else if (scrollDelta > 5 && currentScrollY > 80) {
            setIsHeaderVisible(false);
          } 
          // Show when scrolling up (with threshold)
          else if (scrollDelta < -5) {
            setIsHeaderVisible(true);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [lastScrollY]);

  return (
    <HeaderContext.Provider value={{ isHeaderVisible, headerHeight, headerRef, breakingNewsHeight, setBreakingNewsHeight }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within HeaderProvider');
  }
  return context;
};

