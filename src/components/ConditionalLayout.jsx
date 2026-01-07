'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import BreakingNewsTicker from './BreakingNewsTicker';
import Navigation from './Navigation';
import ContactRibbon from './ContactRibbon';
import Footer from './Footer';
import MainContent from './MainContent';
import ScrollToTop from './ScrollToTop';

const ConditionalLayout = ({ children }) => {
  const pathname = usePathname();
  const isEpaperRoute = pathname?.startsWith('/epaper/') && pathname !== '/epaper';
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hide header, breaking news, navigation on mobile e-paper routes */}
      {!(isEpaperRoute && isMobile) && (
        <>
          <Header />
          <BreakingNewsTicker />
          <Navigation />
        </>
      )}
      <MainContent>
        {children}
      </MainContent>
      {/* Hide contact ribbon and footer on mobile e-paper routes */}
      {!(isEpaperRoute && isMobile) && (
        <>
          <ContactRibbon />
          <Footer />
        </>
      )}
      <ScrollToTop />
    </div>
  );
};

export default ConditionalLayout;

