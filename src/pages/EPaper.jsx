'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaDownload, FaSync } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import EPaperPage from '../components/EPaperPage';
import { getEpapers } from '../utils/api';

const EPaper = () => {
  const [epapers, setEpapers] = useState([]);
  const [selectedEpaper, setSelectedEpaper] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to load epapers
  const loadEpaperData = React.useCallback(async () => {
    try {
      console.log('🔄 Loading epapers from backend...');
      const loaded = await getEpapers();
      console.log('📦 Epapers response:', loaded ? `Received ${Array.isArray(loaded) ? loaded.length : 'non-array'} items` : 'null/undefined');
      
      if (loaded && Array.isArray(loaded) && loaded.length > 0) {
        console.log(`✅ Successfully loaded ${loaded.length} epapers from backend`);
        setEpapers(loaded);
        // Update selected epaper if it exists
        setSelectedEpaper(prev => {
          if (prev) {
            const updated = loaded.find(ep => ep.id === prev.id || ep._id === prev._id);
            return updated || prev;
          }
          return prev;
        });
      } else {
        console.warn('⚠️ No epapers loaded from backend - empty array or invalid response');
        setEpapers([]);
      }
    } catch (error) {
      console.error('❌ Error loading epapers:', error);
      console.error('Error details:', error.message, error.stack);
      setEpapers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load epapers on mount - show UI immediately, load data in background
  useEffect(() => {
    // Show UI immediately, don't block navigation
    setLoading(false);
    // Load data in background (non-blocking)
    loadEpaperData();
  }, [loadEpaperData]);

  // Helper to generate cropped Cloudinary URL
  const getCroppedImageUrl = (pageImageUrl, newsItem, pageWidth, pageHeight) => {
    if (!pageImageUrl || !newsItem) return pageImageUrl;
    
    // Check if it's a Cloudinary URL
    if (!pageImageUrl.includes('cloudinary.com')) {
      return pageImageUrl;
    }
    
    try {
      const uploadIndex = pageImageUrl.indexOf('/image/upload/');
      if (uploadIndex === -1) return pageImageUrl;
      
      const baseUrl = pageImageUrl.substring(0, uploadIndex + '/image/upload'.length);
      const afterUpload = pageImageUrl.substring(uploadIndex + '/image/upload/'.length);
      
      const transformations = [
        `c_crop`,
        `w_${Math.round(newsItem.width)}`,
        `h_${Math.round(newsItem.height)}`,
        `x_${Math.round(newsItem.x)}`,
        `y_${Math.round(newsItem.y)}`,
        `q_auto:best`,
        `f_auto`
      ].join(',');
      
      return `${baseUrl}/${transformations}/${afterUpload}`;
    } catch (error) {
      console.error('Error generating cropped URL:', error);
      return pageImageUrl;
    }
  };

  const handleNewsClick = (epaper, page, newsItem) => {
    const croppedImageUrl = getCroppedImageUrl(page.image, newsItem, page.width, page.height);
    
    setSelectedNews({
      epaper,
      page,
      news: newsItem,
      croppedImageUrl: croppedImageUrl
    });
  };

  const closeNewsModal = () => {
    setSelectedNews(null);
  };

  return (
    <div className="min-h-screen bg-subtleGray">
      {/* Section Header */}
      <div className="bg-cleanWhite border-b-2 border-subtleGray py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-deepCharcoal">
              ई-पेपर
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Sidebar type="left" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            {/* E-Paper List */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-subtleGray">
                <h2 className="text-2xl font-bold text-deepCharcoal">
                  उपलब्ध ई-पेपर
                </h2>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    loadEpaperData();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-subtleGray text-slateBody rounded-lg hover:bg-subtleGray/80 transition-colors"
                  title="रिफ्रेश करा"
                >
                  <FaSync className="w-4 h-4" />
                  <span className="text-sm">रिफ्रेश</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading && epapers.length === 0 ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="bg-cleanWhite border border-subtleGray rounded-lg p-6 animate-pulse">
                      <div className="h-6 bg-subtleGray rounded mb-2"></div>
                      <div className="h-4 bg-subtleGray rounded mb-4 w-1/2"></div>
                      <div className="h-10 bg-subtleGray rounded"></div>
                    </div>
                  ))
                ) : epapers.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-slateBody text-lg">कोणतेही ई-पेपर उपलब्ध नाहीत</p>
                  </div>
                ) : (
                  epapers.map((epaper) => {
                  const epaperId = epaper.id !== undefined ? epaper.id : (epaper._id ? String(epaper._id) : null);
                  return (
                    <div
                      key={epaper.id || epaper._id}
                      className="bg-cleanWhite border border-subtleGray rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-xl font-bold text-deepCharcoal mb-2">{epaper.title}</h3>
                      <p className="text-slateBody mb-4 text-sm">{epaper.date}</p>
                      <div className="flex space-x-3">
                        <Link
                          href={`/epaper/${epaperId}`}
                          className="flex-1 bg-gradient-to-r from-newsRed to-editorialBlue text-cleanWhite px-4 py-2 rounded hover:opacity-90 transition-opacity font-semibold text-sm text-center"
                        >
                          पेपर पहा
                        </Link>
                        <button className="flex items-center justify-center bg-deepCharcoal text-cleanWhite px-4 py-2 rounded hover:bg-deepCharcoal/90 transition-colors">
                          <FaDownload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                  })
                )}
              </div>
            </div>

            {/* E-Paper Viewer */}
            {selectedEpaper && (
              <div className="bg-cleanWhite border border-subtleGray rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-subtleGray">
                  <h2 className="text-2xl font-bold text-deepCharcoal">
                    {selectedEpaper.title}
                  </h2>
                  <button
                    onClick={() => setSelectedEpaper(null)}
                    className="text-metaGray hover:text-deepCharcoal text-xl font-bold"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-6">
                  {[...selectedEpaper.pages]
                    .sort((a, b) => {
                      const orderA = a.sortOrder !== undefined ? a.sortOrder : a.pageNo;
                      const orderB = b.sortOrder !== undefined ? b.sortOrder : b.pageNo;
                      return orderA - orderB;
                    })
                    .map((page) => (
                      <EPaperPage
                        key={page.pageNo}
                        page={page}
                        onNewsClick={(newsItem) => handleNewsClick(selectedEpaper, page, newsItem)}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 order-3">
            <Sidebar type="right" />
          </div>
        </div>
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4" onClick={closeNewsModal}>
          <div 
            className="bg-white max-w-6xl w-full max-h-[95vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Logo */}
            <div className="flex items-center justify-center py-4 bg-gradient-to-b from-cleanWhite to-subtleGray/10">
              <img
                src="/logo1.png"
                alt="नव मंच"
                className="h-16 md:h-24 w-auto"
              />
            </div>
            
            {/* Cropped Image */}
            {selectedNews.croppedImageUrl && (
              <div className="overflow-hidden bg-cleanWhite">
                <img
                  src={selectedNews.croppedImageUrl}
                  alt={selectedNews.news.title || 'बातमी विभाग'}
                  className="w-full h-auto"
                  style={{ 
                    imageRendering: 'crisp-edges',
                    display: 'block'
                  }}
                  onError={(e) => {
                    console.error('Error loading cropped image:', selectedNews.croppedImageUrl);
                    e.target.src = selectedNews.page.image;
                  }}
                />
              </div>
            )}
            
            {/* Content */}
            {selectedNews.news.content && (
              <div className="px-4 py-6 border-t border-subtleGray/30">
                <div 
                  className="text-slateBody leading-relaxed article-content"
                  dangerouslySetInnerHTML={{ __html: selectedNews.news.content || '' }}
                />
              </div>
            )}
            
            {/* Footer Section */}
            <div className="bg-gradient-to-b from-subtleGray/10 to-cleanWhite pt-4 pb-6">
              <div className="text-center mb-4">
                <p className="text-xs md:text-sm text-metaGray font-medium tracking-wide">
                  navmanchnews.com/epaper
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-xs md:text-sm text-metaGray">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-deepCharcoal">तारीख:</span>
                  <span>{new Date(selectedNews.epaper.date).toLocaleDateString('mr-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-subtleGray"></div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-deepCharcoal">ई-पेपर:</span>
                  <span className="max-w-[200px] truncate">{selectedNews.epaper.title}</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-subtleGray"></div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-deepCharcoal">पृष्ठ:</span>
                  <span>{selectedNews.page.pageNo}</span>
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={closeNewsModal}
              className="absolute top-4 right-4 w-8 h-8 md:w-10 md:h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm shadow-lg"
              aria-label="Close"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPaper;

