'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SubscribePopup from './SubscribePopup';
import { useHeader } from '../context/HeaderContext';
import { FaEye, FaChartLine } from 'react-icons/fa';
import { isSubscribed, getSubscriberInitial, getSubscription } from '../utils/subscription';

const Header = () => {
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [scrollCount, setScrollCount] = useState(0);
  const { isHeaderVisible, headerRef } = useHeader();
  const [stats, setStats] = useState({
    totalVisits: 0,
    visitsToday: 0,
    totalHits: 0,
    hitsToday: 0
  });

  // Target values for animation
  const targetStats = {
    totalVisits: 120,
    visitsToday: 85,
    totalHits: 250,
    hitsToday: 180
  };
  
  const currentDate = new Date().toLocaleDateString('mr-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Check subscription status
  useEffect(() => {
    const checkSubscription = () => {
      const sub = getSubscription();
      setSubscription(sub);
    };
    
    checkSubscription();
    
    // Listen for subscription updates
    const handleSubscriptionUpdate = () => {
      checkSubscription();
    };
    
    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, []);

  // Scroll detection for popup
  useEffect(() => {
    if (isSubscribed()) return; // Don't show if already subscribed
    
    let scrollCount = 0;
    let lastScrollTop = 0;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Detect actual scroll (not just page load)
      if (Math.abs(scrollTop - lastScrollTop) > 50) {
        scrollCount++;
        lastScrollTop = scrollTop;
        
        if (scrollCount >= 2 && !isSubscribed() && !isSubscribeOpen) {
          setIsSubscribeOpen(true);
          window.removeEventListener('scroll', handleScroll);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isSubscribeOpen]);

  // Animate stats from 0 to target values with 3 second delay
  useEffect(() => {
    const delay = 3000; // 3 seconds delay
    const duration = 1500; // 1.5 seconds animation duration
    
    // Wait 3 seconds before starting animation
    const timeoutId = setTimeout(() => {
      const startTime = Date.now();
      const startValues = { ...stats };

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setStats({
          totalVisits: Math.floor(startValues.totalVisits + (targetStats.totalVisits - startValues.totalVisits) * easeOut),
          visitsToday: Math.floor(startValues.visitsToday + (targetStats.visitsToday - startValues.visitsToday) * easeOut),
          totalHits: Math.floor(startValues.totalHits + (targetStats.totalHits - startValues.totalHits) * easeOut),
          hitsToday: Math.floor(startValues.hitsToday + (targetStats.hitsToday - startValues.hitsToday) * easeOut)
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final values are exactly the target values
          setStats({ ...targetStats });
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, []); // Run only once on mount

  return (
    <>
      <header 
        ref={headerRef}
        className={`bg-cleanWhite border-b border-subtleGray fixed top-0 left-0 right-0 z-50 shadow-sm will-change-transform ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{
          transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: `translateY(${isHeaderVisible ? '0' : '-100%'})`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header - Logo, Date, Buttons (Now First) */}
          <div className="flex items-center justify-between py-3 md:hidden gap-2">
            <div className="flex flex-col min-w-0 flex-shrink">
              <span className="text-[10px] text-metaGray leading-tight whitespace-nowrap">
                {currentDate}
              </span>
            </div>

            <Link href="/" className="flex-shrink-0 mx-auto">
              <img
                src="/logo1.png"
                alt="नव मंच"
                className="h-20 sm:h-24 w-auto"
              />
            </Link>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Link
                href="/epaper2"
                className="px-2.5 py-1.5 rounded-full bg-editorialBlue text-cleanWhite text-[10px] sm:text-xs font-semibold tracking-wide hover:bg-editorialBlue/90 transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap"
              >
                ई-पेपर
              </Link>
              {subscription ? (
                <div className="w-8 h-8 rounded-full bg-newsRed text-cleanWhite flex items-center justify-center text-sm font-bold shadow-md">
                  {getSubscriberInitial()}
                </div>
              ) : (
                <button
                  onClick={() => setIsSubscribeOpen(true)}
                  className="px-2.5 py-1.5 rounded-full bg-newsRed text-cleanWhite text-[10px] sm:text-xs font-semibold tracking-wide hover:bg-newsRed/90 transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  सबस्क्राईब
                </button>
              )}
            </div>
          </div>

          {/* Desktop / Tablet Header - Logo, Date, Buttons (Now First) */}
          <div className="hidden md:flex items-center justify-between py-2 h-auto min-h-[90px]">
            {/* Left: Date */}
            <div className="flex items-center">
              <span className="text-sm text-slateBody font-light tracking-wide">
                {currentDate}
              </span>
            </div>

            {/* Center: Logo */}
            <Link
              href="/"
              className="flex-shrink-0 transform scale-125 md:scale-150 transition-transform duration-300 hover:scale-[1.3] md:hover:scale-[1.55]"
            >
              <img
                src="/logo1.png"
                alt="नव मंच"
                className="h-24 md:h-28 w-auto"
              />
            </Link>

            {/* Right: E-Paper and Subscribe */}
            <div className="flex items-center space-x-3">
              <Link
                href="/epaper2"
                className="bg-editorialBlue text-cleanWhite px-5 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-editorialBlue/80 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 rounded-full"
              >
                ई-पेपर
              </Link>
              {subscription ? (
                <div className="w-10 h-10 rounded-full bg-newsRed text-cleanWhite flex items-center justify-center text-lg font-bold shadow-md">
                  {getSubscriberInitial()}
                </div>
              ) : (
                <button
                  onClick={() => setIsSubscribeOpen(true)}
                  className="bg-newsRed text-cleanWhite px-5 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-newsRed/80 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 rounded-full"
                >
                  सबस्क्राईब करा
                </button>
              )}
            </div>
          </div>

          {/* Top Info Bar - Desktop (Now Second) */}
          <div className="hidden md:flex items-center justify-between py-1.5 px-4 bg-gradient-to-r from-subtleGray/40 to-subtleGray/20 border-b border-subtleGray/60">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-metaGray font-semibold tracking-wide">PRGI Reg No:</span>
                <span className="text-deepCharcoal font-bold">MHMAR/25/A4153</span>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-metaGray font-semibold tracking-wide">Chief Editor:</span>
                <span className="text-deepCharcoal font-semibold">शिवानी सुरवसे पाटील</span>
              </div>
            </div>

            {/* Website Statistics - Center */}
            <div className="hidden xl:flex items-center gap-4 px-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-md border border-subtleGray/40 shadow-sm">
                <FaEye className="text-newsRed text-xs" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-metaGray leading-tight">Visit Today</span>
                  <span className="text-xs font-bold text-deepCharcoal">{stats.visitsToday.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-md border border-subtleGray/40 shadow-sm">
                <FaChartLine className="text-newsRed text-xs" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-metaGray leading-tight">Total Visit</span>
                  <span className="text-xs font-bold text-deepCharcoal">{stats.totalVisits.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-md border border-subtleGray/40 shadow-sm">
                <FaEye className="text-editorialBlue text-xs" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-metaGray leading-tight">Hits Today</span>
                  <span className="text-xs font-bold text-deepCharcoal">{stats.hitsToday.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-md border border-subtleGray/40 shadow-sm">
                <FaChartLine className="text-editorialBlue text-xs" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-metaGray leading-tight">Total Hits</span>
                  <span className="text-xs font-bold text-deepCharcoal">{stats.totalHits.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <a 
              href="mailto:navmanch25@gmail.com" 
              className="flex items-center gap-2 text-xs text-metaGray hover:text-newsRed transition-all duration-300 group"
            >
              <span className="font-semibold tracking-wide">E-mail:</span>
              <span className="text-deepCharcoal font-semibold group-hover:text-newsRed transition-colors duration-300">navmanch25@gmail.com</span>
            </a>
          </div>

          {/* Top Info Bar - Mobile (Now Second) */}
          <div className="md:hidden py-2 px-3 bg-gradient-to-r from-subtleGray/40 to-subtleGray/20 border-b border-subtleGray/60">
            <div className="flex flex-col gap-1.5 text-[10px]">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-metaGray font-semibold">PRGI Reg No:</span>
                  <span className="text-deepCharcoal font-bold">MHMAR/25/A4153</span>
                </div>
                <a 
                  href="mailto:navmanch25@gmail.com" 
                  className="text-deepCharcoal hover:text-newsRed transition-colors duration-300 font-semibold text-[9px]"
                >
                  navmanch25@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-metaGray font-semibold">Chief Editor:</span>
                <span className="text-deepCharcoal font-semibold">शिवानी सुरवसे पाटील</span>
              </div>
              
              {/* Mobile Statistics - Compact */}
              <div className="flex items-center gap-2 mt-1 pt-1.5 border-t border-subtleGray/30">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/60 backdrop-blur-sm rounded border border-subtleGray/40">
                  <FaEye className="text-newsRed text-[10px]" />
                  <span className="text-[9px] text-metaGray">Visit:</span>
                  <span className="text-[9px] font-bold text-deepCharcoal">{stats.visitsToday.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/60 backdrop-blur-sm rounded border border-subtleGray/40">
                  <FaChartLine className="text-newsRed text-[10px]" />
                  <span className="text-[9px] text-metaGray">Total:</span>
                  <span className="text-[9px] font-bold text-deepCharcoal">{(stats.totalVisits / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/60 backdrop-blur-sm rounded border border-subtleGray/40">
                  <FaEye className="text-editorialBlue text-[10px]" />
                  <span className="text-[9px] text-metaGray">Hits:</span>
                  <span className="text-[9px] font-bold text-deepCharcoal">{stats.hitsToday.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Subscribe Popup */}
      <SubscribePopup 
        isOpen={isSubscribeOpen} 
        onClose={() => setIsSubscribeOpen(false)}
        allowClose={isSubscribed()} // Only allow close if already subscribed
      />
    </>
  );
};

export default Header;

