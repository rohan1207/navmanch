'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import newsData from '../data/newsData.json';
import { apiFetch, getLatestArticles, getMostReadArticles, getPopularArticles } from '../utils/api';

const Sidebar = ({ type = 'left' }) => {
  const [mostPopular, setMostPopular] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [popularNews, setPopularNews] = useState([]);
  const [ads, setAds] = useState([]);

  // Fetch ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const position = type === 'left' ? 'left' : 'right';
        const data = await apiFetch(`/ads/active/${position}`, {
          timeout: 10000, // 10 second timeout for ads
          useCache: true,
          cacheTTL: 5 * 60 * 1000 // 5 min cache
        });
        if (data && Array.isArray(data) && data.length > 0) {
          setAds(data);
          // Track impressions in background (silently fail)
          data.forEach(ad => {
            if (ad._id) {
              apiFetch(`/ads/${ad._id}/impression`, { 
                method: 'POST',
                timeout: 5001 // Short timeout for tracking
              }).catch(() => {
                // Silently fail - tracking is not critical
              });
            }
          });
        }
      } catch (error) {
        // Silently fail - ads are not critical
      }
    };
    fetchAds();
  }, [type]);

  // Fetch most popular articles for left sidebar
  useEffect(() => {
    if (type === 'left') {
      const fetchMostPopular = async () => {
        try {
          // Use getMostReadArticles for "सर्वाधिक वाचले" (sorted by views)
          const articles = await getMostReadArticles(5);
          if (articles && Array.isArray(articles) && articles.length > 0) {
            setMostPopular(articles);
          } else {
            // Fallback to dummy data
            setMostPopular(newsData.latestNews.slice(0, 5));
          }
        } catch (error) {
          console.warn('Error fetching most popular articles:', error);
          // Fallback to dummy data
          setMostPopular(newsData.latestNews.slice(0, 5));
        }
      };
      fetchMostPopular();
    }
  }, [type]);

  // Fetch latest news and popular news for right sidebar
  useEffect(() => {
    if (type === 'right') {
      const fetchRightSidebarData = async () => {
        try {
          // Latest News - use getLatestArticles (sorted by published date)
          const latest = await getLatestArticles(3);
          if (latest && Array.isArray(latest) && latest.length > 0) {
            setLatestNews(latest.slice(0, 3));
          } else {
            // Fallback to dummy data
            setLatestNews(newsData.latestNews.slice(0, 3));
          }

          // Popular - use getPopularArticles (recent popular articles from last 7 days)
          const popular = await getPopularArticles(5);
          if (popular && Array.isArray(popular) && popular.length > 0) {
            setPopularNews(popular);
          } else {
            // Fallback to dummy data
            const allNews = [...newsData.latestNews, ...newsData.categories.flatMap(cat => cat.news)];
            setPopularNews(allNews.slice(0, 5));
          }
        } catch (error) {
          console.warn('Error fetching right sidebar data:', error);
          // Fallback to dummy data
          setLatestNews(newsData.latestNews.slice(0, 3));
          const allNews = [...newsData.latestNews, ...newsData.categories.flatMap(cat => cat.news)];
          setPopularNews(allNews.slice(0, 5));
        }
      };
      fetchRightSidebarData();
    }
  }, [type]);

  const handleAdClick = async (adId, link) => {
    if (adId) {
      try {
        await apiFetch(`/ads/${adId}/click`, { method: 'POST' });
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  if (type === 'left') {
    return (
      <aside className="w-full space-y-4 sm:space-y-6">
        {/* Advertisement - Full image visible on mobile */}
        {ads.length > 0 ? (
          ads.map((ad) => (
            <div key={ad._id} className="group">
              <div 
                className="bg-gradient-to-br from-subtleGray/20 to-subtleGray/5 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border border-subtleGray/20"
                onClick={() => handleAdClick(ad._id, ad.link)}
              >
                {ad.videoUrl ? (
                  <div className="w-full aspect-[9/16] sm:aspect-[9/16] md:h-[420px] lg:h-[500px]">
                    <video
                      src={ad.videoUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center bg-white">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title || 'जाहिरात'}
                      className="w-full h-auto max-h-[400px] sm:max-h-[450px] md:max-h-[500px] lg:max-h-[600px] object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="h-[250px] sm:h-[300px] md:h-[420px] lg:h-[500px] bg-gradient-to-br from-subtleGray/10 to-subtleGray/5 rounded-lg sm:rounded-xl flex items-center justify-center border border-subtleGray/10">
            <p className="text-xs text-metaGray/60 font-medium">जाहिरात</p>
          </div>
        )}

        {/* Most Popular - Compact on mobile */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-deepCharcoal mb-3 sm:mb-4 border-b border-subtleGray pb-2">
            सर्वाधिक वाचले
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {mostPopular.length > 0 ? (
              mostPopular.map((news, index) => {
                const newsId = news._id || news.id;
                const newsSlug = news.slug || newsId;
                const newsImage = news.featuredImage || news.image;
                const newsDate = news.publishedAt || news.createdAt || news.date;
                
                return (
                  <Link
                    key={newsId || index}
                    href={`/news/${newsId || newsSlug || ''}`}
                    className="flex gap-2 sm:gap-3 group hover:bg-subtleGray p-2 rounded transition-colors"
                  >
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-subtleGray rounded overflow-hidden">
                      {newsImage ? (
                        <img
                          src={newsImage}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-[8px]">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-deepCharcoal line-clamp-2 group-hover:text-newsRed transition-colors">
                        {news.title}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-metaGray mt-1">
                        {newsDate ? new Date(newsDate).toLocaleDateString('mr-IN') : ''}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-xs text-metaGray text-center py-4">लोड होत आहे...</p>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // Right Sidebar
  return (
    <aside className="w-full space-y-4 sm:space-y-6">
      {/* Advertisement - Full image visible on mobile */}
      {ads.length > 0 ? (
        ads.map((ad) => (
          <div key={ad._id} className="group">
            <div 
              className="bg-gradient-to-br from-subtleGray/20 to-subtleGray/5 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border border-subtleGray/20"
              onClick={() => handleAdClick(ad._id, ad.link)}
            >
              {ad.videoUrl ? (
                <div className="w-full aspect-[9/16] sm:aspect-[9/16] md:h-[420px] lg:h-[500px]">
                  <video
                    src={ad.videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>
              ) : (
                <div className="w-full flex items-center justify-center bg-white">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title || 'जाहिरात'}
                    className="w-full h-auto max-h-[400px] sm:max-h-[450px] md:max-h-[500px] lg:max-h-[600px] object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="h-[250px] sm:h-[300px] md:h-[420px] lg:h-[500px] bg-gradient-to-br from-subtleGray/10 to-subtleGray/5 rounded-lg sm:rounded-xl flex items-center justify-center border border-subtleGray/10">
          <p className="text-xs text-metaGray/60 font-medium">जाहिरात</p>
        </div>
      )}

      {/* Latest News Timeline - Compact on mobile */}
      <div className="bg-cleanWhite rounded-lg p-3 sm:p-4 shadow-sm border border-subtleGray">
        <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-subtleGray">
          <div className="h-4 sm:h-5 w-0.5 bg-newsRed rounded-full"></div>
          <h3 className="text-base sm:text-lg font-bold text-deepCharcoal">
            ठळक घडामोडी
          </h3>
        </div>
        <div className="space-y-3 sm:space-y-4 relative">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-subtleGray"></div>
          {latestNews.length > 0 ? (
            latestNews.map((news, index) => {
              const newsId = news._id || news.id;
              const newsSlug = news.slug || newsId;
              const newsDate = news.publishedAt || news.createdAt || news.date;
              
              return (
                <div key={newsId || index} className="relative pl-5 sm:pl-6">
                  <div className="absolute left-0 top-1 w-3 h-3 sm:w-4 sm:h-4 bg-newsRed rounded-full border-2 border-white shadow-sm"></div>
                  <Link
                    href={`/news/${newsId || newsSlug || ''}`}
                    className="block group hover:bg-subtleGray/50 p-1.5 sm:p-2 rounded-lg transition-colors"
                  >
                    <p className="text-[10px] sm:text-xs text-metaGray mb-1">
                      {newsDate ? new Date(newsDate).toLocaleDateString('mr-IN') : ''}
                    </p>
                    <h4 className="text-xs sm:text-sm font-semibold text-deepCharcoal line-clamp-2 group-hover:text-newsRed transition-colors">
                      {news.title}
                    </h4>
                  </Link>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-metaGray text-center py-4 pl-5 sm:pl-6">लोड होत आहे...</p>
          )}
        </div>
        <Link
          href="/category/latest-news"
          className="block text-center text-xs sm:text-sm text-newsRed hover:text-newsRed/80 mt-3 sm:mt-4 font-semibold transition-colors"
        >
          अधिक बातम्या वाचा →
        </Link>
      </div>

      {/* Popular News - Compact on mobile */}
      <div className="bg-cleanWhite rounded-lg p-3 sm:p-4 shadow-sm border border-subtleGray">
        <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-subtleGray">
          <div className="h-4 sm:h-5 w-0.5 bg-newsRed rounded-full"></div>
          <h3 className="text-base sm:text-lg font-bold text-deepCharcoal">
            लोकप्रिय
          </h3>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {popularNews.length > 0 ? (
            popularNews.map((news, index) => {
              const newsId = news._id || news.id;
              const newsSlug = news.slug || newsId;
              const newsDate = news.publishedAt || news.createdAt || news.date;
              
              return (
                <Link
                  key={newsId || index}
                  href={`/news/${newsSlug || ''}`}
                  className="flex items-start gap-2 sm:gap-3 group hover:bg-subtleGray/50 p-1.5 sm:p-2 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-newsRed text-cleanWhite rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-deepCharcoal line-clamp-2 group-hover:text-newsRed transition-colors">
                      {news.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-metaGray mt-1">
                      {newsDate ? new Date(newsDate).toLocaleDateString('mr-IN') : ''}
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-xs text-metaGray text-center py-4">लोड होत आहे...</p>
          )}
        </div>
      </div>

      {/* Vertical Video Ad Section */}
      <VerticalVideoAds />
    </aside>
  );
};

// Vertical Video Ads Component
const VerticalVideoAds = () => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await apiFetch('/ads/active/right-vertical-video', {
          timeout: 10000, // 10 second timeout for ads
          useCache: true,
          cacheTTL: 5 * 60 * 1000 // 5 min cache
        });
        if (data && Array.isArray(data) && data.length > 0) {
          setAds(data);
          // Track impressions in background (silently fail)
          data.forEach(ad => {
            if (ad._id) {
              apiFetch(`/ads/${ad._id}/impression`, { 
                method: 'POST',
                timeout: 5001 // Short timeout for tracking
              }).catch(() => {
                // Silently fail - tracking is not critical
              });
            }
          });
        }
      } catch (error) {
        // Silently fail - ads are not critical
      }
    };
    fetchAds();
  }, []);

  const handleAdClick = async (adId, link) => {
    if (adId) {
      try {
        await apiFetch(`/ads/${adId}/click`, { method: 'POST' });
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  if (ads.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {ads.map((ad) => (
        <div 
          key={ad._id} 
          className="bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 cursor-pointer hover:shadow-md transition-all duration-300 group"
          onClick={() => handleAdClick(ad._id, ad.link)}
        >
          {ad.videoUrl ? (
            <div className="relative aspect-[9/16] bg-black">
              <video
                src={ad.videoUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute top-2 left-2 z-10">
                <span className="text-[10px] text-cleanWhite/80 font-semibold uppercase tracking-wide bg-black/50 px-2 py-1 rounded">
                  व्हिडिओ जाहिरात
                </span>
              </div>
            </div>
          ) : (
            <div className="relative w-full flex items-center justify-center bg-white min-h-[300px] sm:min-h-[400px]">
              <img
                src={ad.imageUrl}
                alt={ad.title || 'जाहिरात'}
                className="w-full h-auto max-h-[400px] sm:max-h-[500px] md:max-h-[600px] object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2 z-10">
                <span className="text-[10px] text-cleanWhite/80 font-semibold uppercase tracking-wide bg-black/50 px-2 py-1 rounded">
                  जाहिरात
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;

