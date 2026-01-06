'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useHeader } from '../context/HeaderContext';

const MainContent = ({ children }) => {
  const { isHeaderVisible, headerHeight, breakingNewsHeight } = useHeader();
  const pathname = usePathname();
  const isEpaperRoute = pathname?.startsWith('/epaper/') && pathname !== '/epaper2';
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  
  // Navigation height is responsive: min-h-[56px] on mobile, min-h-[60px] on sm+
  const navigationHeight = 56; // Mobile min height (min-h-[56px] = 3.5rem = 56px)
  const actualBreakingNewsHeight = breakingNewsHeight || 44; // Fallback to mobile height
  
  // Calculate total height of fixed elements
  const totalFixedHeightVisible = (headerHeight || 0) + actualBreakingNewsHeight + navigationHeight;
  const totalFixedHeightHidden = actualBreakingNewsHeight + navigationHeight;

  // No padding on mobile e-paper routes (full screen)
  const paddingTop = (isEpaperRoute && isMobile) ? 0 : (isHeaderVisible ? totalFixedHeightVisible : totalFixedHeightHidden);

  return (
    <main 
      className="flex-grow pb-16 md:pb-20"
      style={{ 
        paddingTop: `${paddingTop}px`,
        transition: 'padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'padding-top'
      }}
    >
      {children}
    </main>
  );
};

export default MainContent;

