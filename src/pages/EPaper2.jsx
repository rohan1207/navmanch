'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaDownload, FaSync, FaArrowRight } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { getEpapers } from '../utils/api';

const EPaper2 = () => {
  const [epapers, setEpapers] = useState([]);

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

  const getFirstPageThumbnail = (epaper) => {
    if (epaper.pages && epaper.pages.length > 0) {
      return epaper.pages[0].image;
    }
    return null;
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://navmanchnews.com/epaper2",
    "name": "नव मंच ई-पेपर",
    "alternateName": "Nav Manch E-Paper",
    "description": "नव मंच ई-पेपर वाचा. साप्ताहिक मराठी वृत्तपत्राचे डिजिटल आवृत्ती.",
    "url": "https://navmanchnews.com/epaper2",
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "नव मंच",
      "alternateName": "Nav Manch",
      "url": "https://navmanchnews.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://navmanchnews.com/logo1.png"
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": epapers.length,
      "itemListElement": epapers.slice(0, 10).map((epaper, index) => {
        const epaperId = epaper.id !== undefined ? String(epaper.id) : (epaper._id ? String(epaper._id) : null);
        const epaperIdentifier = epaper.slug || epaperId;
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-subtleGray">
        <div className="bg-cleanWhite border-b-2 border-subtleGray py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-deepCharcoal">
                ई-पेपर
              </h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-6">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Sidebar type="left" />
            </div>

            <div className="lg:col-span-8 order-1 lg:order-2">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {epapers.map((epaper) => {
                      const thumbnail = getFirstPageThumbnail(epaper);
                      const epaperId = epaper.id !== undefined ? String(epaper.id) : (epaper._id ? String(epaper._id) : null);
                      if (!epaperId) {
                        console.warn('Epaper missing ID:', epaper);
                        return null;
                      }
                      const epaperIdentifier = epaper.slug || epaperId;
                      return (
                        <Link
                          key={epaperId}
                          href={`/epaper/${epaperIdentifier}`}
                          className="group bg-cleanWhite border border-subtleGray rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-subtleGray/30">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={epaper.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <p className="text-metaGray text-sm">छवी उपलब्ध नाही</p>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 hidden md:flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-newsRed text-cleanWhite px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg">
                                  <span>वाचा</span>
                                  <FaArrowRight className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-deepCharcoal mb-2 line-clamp-2 group-hover:text-newsRed transition-colors">
                              {epaper.title}
                            </h3>
                            <p className="text-sm text-metaGray mb-3">{epaper.date}</p>
                            
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

