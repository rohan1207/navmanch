'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSync, FaArrowRight } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { getEpapers } from '../utils/api';
import SEO from '../components/SEO';

const EPaper2 = () => {
  const [epapers, setEpapers] = useState([]);

  // Function to load epapers
  const loadEpaperData = React.useCallback(async () => {
    try {
      const loaded = await getEpapers();
      if (loaded && Array.isArray(loaded) && loaded.length > 0) {
        setEpapers(loaded);
      }
    } catch (error) {
      console.error('Error loading epapers:', error);
    }
  }, []);

  useEffect(() => {
    loadEpaperData();
  }, [loadEpaperData]);

  // Get first page thumbnail for each e-paper
  const getFirstPageThumbnail = (epaper) => {
    if (epaper.pages && epaper.pages.length > 0) {
      return epaper.pages[0].image;
    }
    return null;
  };

  // SEO data for epaper listing page
  const seoTitle = 'नव मंच ई-पेपर | Nav Manch E-Paper - मराठी वृत्तपत्र';
  const seoDescription = 'नव मंच ई-पेपर वाचा. साप्ताहिक मराठी वृत्तपत्राचे डिजिटल आवृत्ती. दर आठवड्याला नवीन ई-पेपर उपलब्ध. Read Nav Manch weekly e-paper, Marathi newspaper digital edition.';
  const seoUrl = 'https://navmanchnews.com/epaper';
  const seoImage = 'https://navmanchnews.com/logo1.png';

  // Structured data for Newspaper/Periodical (Weekly)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": seoUrl,
    "name": "नव मंच ई-पेपर",
    "alternateName": "Nav Manch E-Paper",
    "description": seoDescription,
    "url": seoUrl,
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "नव मंच",
      "alternateName": "Nav Manch",
      "url": "https://navmanchnews.com",
      "logo": {
        "@type": "ImageObject",
        "url": seoImage
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": epapers.length,
      "itemListElement": epapers.slice(0, 10).map((epaper, index) => {
        const epaperId = epaper.id !== undefined ? String(epaper.id) : (epaper._id ? String(epaper._id) : null);
            const epaperIdentifier = epaperId || epaper.slug || epaperId;
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Newspaper",
            "@id": `https://navmanchnews.com/epaper/${epaperIdentifier}`,
            "name": epaper.title,
            "datePublished": epaper.date ? new Date(epaper.date).toISOString() : undefined,
            "url": `https://navmanchnews.com/epaper/${epaperIdentifier}`,
            "frequency": "Weekly"
          }
        };
      })
    },
    "inLanguage": "mr",
    "isAccessibleForFree": true
  };

  return (
    <>
      <SEO 
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        url={seoUrl}
        type="website"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-subtleGray">
      {/* Section Header */}
      <div className="bg-cleanWhite border-b-2 border-subtleGray py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-deepCharcoal">
              ई-पेपर
            </h1>
          </div>
          <p className="text-center text-sm text-metaGray mt-2">
            
          </p>
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
                  onClick={loadEpaperData}
                  className="flex items-center space-x-2 px-4 py-2 bg-subtleGray text-slateBody rounded-lg hover:bg-subtleGray/80 transition-colors"
                  title="रिफ्रेश करा"
                >
                  <FaSync className="w-4 h-4" />
                  <span className="text-sm">रिफ्रेश</span>
                </button>
              </div>
              {epapers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-metaGray text-lg">कोणतेही ई-पेपर उपलब्ध नाही</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {epapers.map((epaper) => {
                    const thumbnail = getFirstPageThumbnail(epaper);
                    // Get the ID - prefer id field, fallback to _id, convert to string
                    const epaperId = epaper.id !== undefined ? String(epaper.id) : (epaper._id ? String(epaper._id) : null);
                    if (!epaperId) {
                      console.warn('Epaper missing ID:', epaper);
                      return null;
                    }
                    // Prefer ID for URLs (stable, no encoding issues)
                    const epaperIdentifier = epaperId || epaper.slug || epaperId;
                    return (
                      <Link
                        key={epaperId}
                        href={`/epaper/${epaperIdentifier}`}
                        className="group bg-cleanWhite border border-subtleGray rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-subtleGray/30 flex items-center justify-center">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={epaper.title}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <p className="text-metaGray text-sm">छवी उपलब्ध नाही</p>
                            </div>
                          )}
                          {/* Overlay on hover - Desktop only */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 hidden md:flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-newsRed text-cleanWhite px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg">
                                <span>वाचा</span>
                                <FaArrowRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-deepCharcoal mb-2 line-clamp-2 group-hover:text-newsRed transition-colors">
                            {epaper.title}
                          </h3>
                          <p className="text-sm text-metaGray mb-3">{epaper.date}</p>
                          
                          {/* Mobile Read Button */}
                          <div className="md:hidden mt-3">
                            <div className="bg-newsRed text-cleanWhite px-4 py-2 rounded-lg font-semibold text-center text-sm">
                              वाचा
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 order-3">
            <Sidebar type="right" />
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default EPaper2;

