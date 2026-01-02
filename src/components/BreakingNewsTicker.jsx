'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaFire } from 'react-icons/fa';
import { useHeader } from '../context/HeaderContext';
import { getLatestArticles, getCategories } from '../utils/api';

const BreakingNewsTicker = () => {
  const { isHeaderVisible, headerHeight, setBreakingNewsHeight } = useHeader();
  const [breakingNews, setBreakingNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const ribbonRef = useRef(null);

  // Fetch latest articles from backend
  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        setLoading(true);
        
        // Fetch latest 6 articles from all categories
        const articles = await getLatestArticles(6);
        
        if (!articles || articles.length === 0) {
          setBreakingNews([]);
          setLoading(false);
          return;
        }

        // Fetch categories to get category names
        let categoryMap = {};
        try {
          const categories = await getCategories();
          categories.forEach(cat => {
            const catId = cat._id || cat.id;
            categoryMap[catId] = cat.name || cat.nameEn || 'सामान्य';
          });
        } catch (catError) {
          console.warn('Could not fetch categories, using defaults:', catError);
        }

        // Map articles to breaking news format
        const newsItems = articles
          .filter(article => article && article.title) // Only include articles with titles
          .slice(0, 6)
          .map(article => {
            // Extract category name
            let categoryName = 'सामान्य';
            if (article.category) {
              if (typeof article.category === 'object') {
                // Category is populated object
                categoryName = article.category.name || article.category.nameEn || 'सामान्य';
              } else if (typeof article.category === 'string') {
                // Category is ID string
                categoryName = categoryMap[article.category] || 'सामान्य';
              }
            }

            return {
              id: article._id || article.id,
              title: article.title,
              category: categoryName,
              url: `/news/${article.slug || article._id || article.id}`
            };
          });

        setBreakingNews(newsItems.length > 0 ? newsItems : []);
      } catch (error) {
        console.error('Error fetching breaking news:', error);
        setBreakingNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakingNews();
    
    // Refresh every 5 minutes
    const refreshInterval = setInterval(fetchBreakingNews, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Auto-scroll through news items
  useEffect(() => {
    if (breakingNews.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    }, 5001); // Change news every 5 seconds

    return () => clearInterval(interval);
  }, [breakingNews.length]);

  // Measure and update breaking news height
  useEffect(() => {
    const updateHeight = () => {
      if (ribbonRef.current && setBreakingNewsHeight) {
        const height = ribbonRef.current.offsetHeight;
        setBreakingNewsHeight(height);
      }
    };

    updateHeight();
    const timeout1 = setTimeout(updateHeight, 50);
    const timeout2 = setTimeout(updateHeight, 200);
    
    window.addEventListener('resize', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [setBreakingNewsHeight]);

  // Calculate top position with smooth transition
  const topPosition = isHeaderVisible ? (headerHeight || 0) : 0;

  return (
    <div 
      ref={ribbonRef}
      className="bg-gradient-to-r from-newsRed via-red-600 to-newsRed fixed left-0 right-0 z-[45] shadow-lg border-b-2 border-red-700 will-change-transform"
      style={{ 
        top: `${topPosition}px`,
        transition: 'top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center h-11 sm:h-12 md:h-14">
          {/* Breaking News Label */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-red-800/90 px-2 sm:px-3 md:px-5 h-full flex-shrink-0 border-r border-red-700/50">
            <FaFire className="text-cleanWhite text-xs sm:text-sm md:text-base animate-pulse flex-shrink-0" />
            <span className="text-cleanWhite font-bold text-[10px] sm:text-xs md:text-sm uppercase tracking-wider whitespace-nowrap hidden sm:inline">
              न्यूज फ्लॅश
            </span>
            <span className="text-cleanWhite font-bold text-[10px] uppercase tracking-wider whitespace-nowrap sm:hidden">
              ताज्या
            </span>
          </div>

          {/* Scrolling News Container */}
          <div className="flex-1 overflow-hidden relative h-full min-w-0">
            {loading ? (
              <div className="flex items-center justify-center h-full px-3 sm:px-6">
                <span className="text-cleanWhite text-[10px] sm:text-xs md:text-sm animate-pulse">लोड होत आहे...</span>
              </div>
            ) : breakingNews.length > 0 ? (
              <div 
                className="flex items-center h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {breakingNews.map((news, index) => (
                  <div
                    key={news.id}
                    className="flex items-center gap-1.5 sm:gap-2 md:gap-4 px-2 sm:px-3 md:px-6 min-w-full h-full"
                  >
                    <Link
                      href={news.url}
                      className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-1 group hover:opacity-90 transition-opacity min-w-0"
                    >
                      {/* News Title */}
                      <span className="text-cleanWhite text-[10px] sm:text-xs md:text-sm font-semibold line-clamp-1 group-hover:underline flex-1 min-w-0 truncate">
                        {news.title}
                      </span>
                      
                      {/* Category Badge - Hidden on very small screens */}
                      <span className="bg-cleanWhite/20 backdrop-blur-sm text-cleanWhite px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap flex-shrink-0 border border-cleanWhite/30 hidden min-[375px]:inline-block">
                        {news.category}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full px-3 sm:px-6">
                <span className="text-cleanWhite text-[10px] sm:text-xs md:text-sm">कोणतीही बातम्या उपलब्ध नाहीत</span>
              </div>
            )}
          </div>

          {/* Navigation Dots - Show on mobile too but smaller */}
          {breakingNews.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 md:px-4 flex-shrink-0 border-l border-red-700/50 pl-2 sm:pl-3 md:pl-4">
              {breakingNews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-4 sm:w-5 md:w-6 h-1 sm:h-1.5 bg-cleanWhite shadow-sm'
                      : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-cleanWhite/40 hover:bg-cleanWhite/60'
                  }`}
                  aria-label={`Go to news ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;

