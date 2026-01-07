'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaChevronUp, FaChevronDown, FaArrowLeft } from 'react-icons/fa';
import { getEpapers } from '../utils/api';
import EPaperPage2 from '../components/EPaperPage2';
import ShareButtons from '../components/ShareButtons';
import SEO from '../components/SEO';
import { isSubscribed } from '../utils/subscription';
import SubscribePopup from '../components/SubscribePopup';

const EPaperViewer = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id;
  const [epaper, setEpaper] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSubscribePopup, setShowSubscribePopup] = useState(false);
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  
  // Check if it's a shared link
  const isSharedLink = searchParams?.toString().includes('shared=true');

  // Check subscription on load (unless shared link)
  useEffect(() => {
    if (!isSharedLink && !isSubscribed()) {
      setShowSubscribePopup(true);
    }
  }, [isSharedLink]);

  // Listen for subscription updates
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      if (isSubscribed()) {
        setShowSubscribePopup(false);
      }
    };
    
    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, []);

  // Don't prevent body scroll - allow normal scrolling on mobile
  // Users need to scroll to see all pages stacked one below the other

  useEffect(() => {
    const loadEpaper = async () => {
      setLoading(true);
      try {
        const epapers = await getEpapers();
        if (!epapers || epapers.length === 0) {
          console.log('No epapers found');
          setLoading(false);
          setTimeout(() => router.push('/epaper'), 500);
          return;
        }
        
        // Try to find epaper by slug first, then by id
        const found = epapers.find(ep => {
          const epSlug = ep.slug;
          const epId = ep.id !== undefined ? ep.id : ep._id;
          
          // Match by slug first
          if (epSlug && epSlug === id) return true;
          
          // Then match by ID
          if (epId !== undefined && epId !== null) {
            const epIdStr = String(epId);
            const searchIdStr = String(id);
            return epIdStr === searchIdStr;
          }
          
          return false;
        });
        
        if (found) {
          console.log('✅ Found epaper:', found.title, 'ID:', found.id || found._id);
          setEpaper(found);
          if (found.pages && found.pages.length > 0) {
            setSelectedPage(found.pages[0]);
            setCurrentPageIndex(0);
          } else {
            console.warn('Epaper has no pages');
          }
          setLoading(false);
        } else {
          console.log('❌ Epaper not found for id:', id);
          console.log('Available epaper IDs:', epapers.map(ep => ({ id: ep.id, _id: ep._id, title: ep.title })));
          setLoading(false);
          setTimeout(() => router.push('/epaper'), 500);
        }
      } catch (error) {
        console.error('Error loading e-paper:', error);
        setLoading(false);
        setTimeout(() => router.push('/epaper'), 500);
      }
    };
    
    if (id) {
      loadEpaper();
    } else {
      router.push('/epaper');
    }
  }, [id, router]);

  const handlePageClick = (page, index) => {
    setSelectedPage(page);
    setCurrentPageIndex(index);
    // Scroll to top of main content
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  const scrollSidebar = (direction) => {
    if (sidebarRef.current) {
      const scrollAmount = 200;
      sidebarRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Use current origin for sharing; backend social preview ensures OG tags
  // When custom domain points here, origin will be https://navmanchnews.com
  const frontendBase = typeof window !== 'undefined' ? window.location.origin : 'https://navmanchnews.com';
  
  // Build clean URL with ID
  let epaperIdentifier;
  if (epaper) {
    if (epaper.id !== undefined && epaper.id !== null) {
      epaperIdentifier = String(epaper.id);
    } else if (epaper._id) {
      epaperIdentifier = String(epaper._id);
    } else {
      epaperIdentifier = id; // Fallback
    }
  } else {
    epaperIdentifier = id;
  }
  
  const shareUrl = `${frontendBase}/epaper/${epaperIdentifier}${typeof window !== 'undefined' ? window.location.search : ''}`;
  
  // Clean title - remove "Untitled" and empty titles
  const getCleanEpaperTitle = () => {
    if (!epaper || !epaper.title) return 'ई-पेपर';
    const title = epaper.title.trim();
    if (title === '' || title.toLowerCase() === 'untitled') {
      return 'ई-पेपर';
    }
    return title;
  };
  
  const shareTitle = epaper ? `${getCleanEpaperTitle()} - नव मंच` : 'नव मंच ई-पेपर';
  // Description without date duplication - backend OG tags handle the preview card
  const shareDescription = epaper 
    ? `${getCleanEpaperTitle()} | navmanchnews.com`
    : 'नव मंच ई-पेपर';
  
  // Ensure image URL is absolute for proper preview cards
  const getAbsoluteImageUrl = (imgUrl) => {
    if (!imgUrl) return '';
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      return imgUrl;
    }
    return `${window.location.origin}${imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`}`;
  };
  
  const shareImage = getAbsoluteImageUrl(selectedPage?.image || epaper?.thumbnail || '');

  if (loading || !epaper) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsRed mx-auto mb-4"></div>
          <p className="text-metaGray">ई-पेपर लोड होत आहे...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={shareTitle}
        description={shareDescription}
        image={shareImage}
        url={shareUrl}
        type="article"
      />
      <div className="min-h-screen bg-cleanWhite lg:bg-subtleGray">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-cleanWhite border-b-2 border-subtleGray py-3 sm:py-4 sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-deepCharcoal leading-tight">{getCleanEpaperTitle()}</h1>
                <p className="text-xs sm:text-sm text-metaGray mt-1">{epaper.date}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <ShareButtons
                  title={shareTitle}
                  description={shareDescription}
                  image={shareImage}
                  url={shareUrl}
                />
                <Link
                  href="/epaper"
                  className="text-xs sm:text-sm text-metaGray hover:text-deepCharcoal transition-colors font-semibold whitespace-nowrap"
                >
                  मागे जा
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header - Minimal (only back and share) - Fixed at top */}
        <div className="lg:hidden bg-cleanWhite border-b border-subtleGray py-2 fixed top-0 left-0 right-0 z-50 shadow-sm">
          <div className="container mx-auto px-3">
            <div className="flex items-center justify-between">
              <Link
                href="/epaper"
                className="flex items-center gap-2 text-deepCharcoal hover:text-newsRed transition-colors font-semibold text-sm"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>मागे</span>
              </Link>
              <ShareButtons
                title={shareTitle}
                description={shareDescription}
                image={shareImage}
                url={shareUrl}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-0 lg:px-3 sm:px-4 py-0 lg:py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Left Sidebar - Page Thumbnails (Desktop only) */}
            <div className="hidden lg:block w-32 flex-shrink-0">
              <div className="bg-cleanWhite rounded-lg border border-subtleGray p-3 sticky top-24">
                {/* Scroll Up Button */}
                <button
                  onClick={() => scrollSidebar('up')}
                  className="w-full mb-2 p-2 bg-subtleGray hover:bg-subtleGray/80 rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaChevronUp className="w-4 h-4 text-deepCharcoal" />
                </button>

                {/* Thumbnails */}
                <div ref={sidebarRef} className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-subtleGray">
                  {epaper.pages.map((page, index) => (
                    <div
                      key={page.pageNo}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        currentPageIndex === index
                          ? 'border-newsRed shadow-lg scale-105'
                          : 'border-subtleGray hover:border-newsRed/50 hover:shadow-md'
                      }`}
                    >
                      <button
                        onClick={() => handlePageClick(page, index)}
                        className="w-full h-full"
                      >
                        <img
                          src={page.image}
                          alt={`Page ${page.pageNo}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-cleanWhite text-xs font-semibold py-1.5 text-center">
                        पृष्ठ {page.pageNo}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scroll Down Button */}
                <button
                  onClick={() => scrollSidebar('down')}
                  className="w-full mt-2 p-2 bg-subtleGray hover:bg-subtleGray/80 rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaChevronDown className="w-4 h-4 text-deepCharcoal" />
                </button>
              </div>
            </div>

            {/* Main Content Area - Desktop: single page, Mobile: all pages stacked normally */}
            <div ref={mainContentRef} className="flex-1">
              {/* Desktop: Show selected page only */}
              <div className="hidden lg:block">
                {selectedPage && (
                  <div className="bg-cleanWhite rounded-lg border border-subtleGray p-4 md:p-6">
                    <EPaperPage2
                      page={selectedPage}
                      epaperId={id}
                      epaperSlug={epaper?.slug}
                    />
                  </div>
                )}
              </div>

              {/* Mobile: Pages stacked normally (white background, one below other) */}
              <div className="lg:hidden pt-12 space-y-0">
                {epaper.pages.map((page, index) => (
                  <div key={page.pageNo} className="w-full bg-cleanWhite">
                    <EPaperPage2
                      page={page}
                      epaperId={id}
                      epaperSlug={epaper?.slug}
                      isMobile={true}
                      totalPages={epaper.pages.length}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subscribe Popup */}
      <SubscribePopup 
        isOpen={showSubscribePopup} 
        onClose={() => setShowSubscribePopup(false)}
        allowClose={false} // Don't allow close - user must subscribe
      />
    </>
  );
};

export default EPaperViewer;
