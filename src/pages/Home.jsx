'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlay, FaArrowRight } from 'react-icons/fa';
import newsData from '../data/newsData.json';
import Sidebar from '../components/Sidebar';
import PhotoOfTheDay from '../components/PhotoOfTheDay';
import { getFeaturedArticles, getLatestArticles, getCategories, getArticlesByCategory, getShorts, apiFetch } from '../utils/api';

// Helper to strip HTML tags and get plain text from content/summary
const getArticlePlainText = (article) => {
  const source = article?.content || article?.summary || '';
  if (!source) return '';
  return source.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

// Horizontal Image Ads Component
const HorizontalImageAds = () => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await apiFetch('/ads/active/horizontal-image', {
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
    <section className="mb-10">
      {ads.map((ad) => (
        <div 
          key={ad._id} 
          className="bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 cursor-pointer hover:shadow-md transition-all duration-300 group mb-4"
          onClick={() => handleAdClick(ad._id, ad.link)}
        >
          <div className="relative w-full bg-gray-100 flex items-center justify-center">
            <img
              src={ad.imageUrl}
              alt={ad.title || 'जाहिरात'}
              className="w-full h-auto max-h-[300px] md:max-h-[400px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute top-2 left-2 z-10">
              <span className="text-[10px] text-cleanWhite/80 font-semibold uppercase tracking-wide bg-black/50 px-2 py-1 rounded">
                जाहिरात
              </span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

const Home = () => {
  const [featuredNews, setFeaturedNews] = useState(null);
  const [otherNews, setOtherNews] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [horizontalAds, setHorizontalAds] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Primary categories matching Navigation menu
  const primaryCategoryIds = [
    'latest-news',
    'pune',
    'maharashtra',
    'national-international',
    'information-technology',
    'lifestyle',
    'column-articles',
    'entertainment',
    'sports',
    'health',
    'editorial'
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load critical data first (featured + latest) - these show immediately
        const criticalCalls = Promise.allSettled([
          getFeaturedArticles(),
          getLatestArticles(6)
        ]);
        
        // Load secondary data in parallel (categories, shorts) - these can load slightly later
        const secondaryCalls = Promise.allSettled([
          getCategories(),
          getShorts()
        ]);
        
        // Start both in parallel but prioritize critical
        const [featuredResult, latestResult] = await criticalCalls;
        const [catsResult, shortsResult] = await secondaryCalls;
        
        // Extract successful results
        const featured = featuredResult.status === 'fulfilled' ? featuredResult.value : null;
        const latest = latestResult.status === 'fulfilled' ? latestResult.value : null;
        const cats = catsResult.status === 'fulfilled' ? catsResult.value : null;
        const shortsData = shortsResult.status === 'fulfilled' ? shortsResult.value : null;

        // Set featured news immediately - only use API data if available
        if (featured && featured.length > 0) {
          setFeaturedNews(featured[0]);
          if (latest && latest.length > 1) {
            setOtherNews(latest.slice(1, 6));
          }
          // Show content immediately, don't wait for everything
          setLoading(false);
        } else if (latest && latest.length > 0) {
          // Use latest as featured if featured failed
          setFeaturedNews(latest[0]);
          setOtherNews(latest.slice(1, 6));
          // Show content immediately
          setLoading(false);
        } else {
          // Only use fallback if API completely failed
          console.warn('API failed, using fallback data');
          const fallbackFeatured = newsData.latestNews[0];
          setFeaturedNews(fallbackFeatured);
          setOtherNews(newsData.latestNews.slice(1, 6));
          setLoading(false);
        }

        // Set categories - only use API data if available
        if (cats && cats.length > 0) {
          setAllCategories(cats);
          // Filter categories to match Navigation menu
          // Try to match by nameEn (slug) or name first, then by id
          const filteredCats = primaryCategoryIds
            .map(id => {
              // First try to find by nameEn (slug format like "latest-news")
              let found = cats.find(cat => 
                cat.nameEn?.toLowerCase().replace(/\s+/g, '-') === id ||
                cat.id === id || 
                cat._id?.toString() === id
              );
              
              // If not found, try matching by name (Marathi)
              if (!found) {
                const nameMap = {
                  'latest-news': 'ताज्या बातम्या',
                  'pune': 'पुणे',
                  'maharashtra': 'महाराष्ट्र',
                  'national-international': 'देश विदेश',
                  'information-technology': 'माहिती तंत्रज्ञान',
                  'lifestyle': 'लाईफस्टाईल',
                  'column-articles': 'स्तंभ लेख',
                  'entertainment': 'मनोरंजन',
                  'sports': 'क्रीडा',
                  'health': 'आरोग्य',
                  'editorial': 'संपादकीय'
                };
                const marathiName = nameMap[id];
                if (marathiName) {
                  found = cats.find(cat => cat.name === marathiName);
                }
              }
              
              return found;
            })
            .filter(cat => cat !== undefined);
          setCategories(filteredCats);
        } else {
          // Only use fallback if API completely failed
          console.warn('Categories API failed, using fallback');
          setAllCategories(newsData.categories);
          const filteredCats = primaryCategoryIds
            .map(id => newsData.categories.find(cat => cat.id === id))
            .filter(cat => cat !== undefined);
          setCategories(filteredCats);
        }

        // Set shorts
        if (shortsData && shortsData.length > 0) {
          setShorts(shortsData);
        } else {
          setShorts(newsData.shorts || []);
        }

        // Fetch horizontal video ads in background (non-blocking, no errors)
        apiFetch('/ads/active/horizontal-video', { 
          useCache: true, 
          cacheTTL: 5 * 60 * 1000,
          timeout: 10000 // 10 second timeout for ads
        })
          .then(adsData => {
            if (adsData && Array.isArray(adsData) && adsData.length > 0) {
              setHorizontalAds(adsData);
              // Track impressions in background (silently fail)
              adsData.forEach(ad => {
                if (ad._id) {
                  apiFetch(`/ads/${ad._id}/impression`, { 
                    method: 'POST', 
                    useCache: false,
                    timeout: 5001 // Short timeout for tracking
                  }).catch(() => {
                    // Silently fail - tracking is not critical
                  });
                }
              });
            }
          })
          .catch(() => {
            // Silently fail - ads are not critical
          });

        // Load category articles for popular - PARALLELIZED and optimized
        // Use cached data from latest if available, load categories in background
        const allArticles = [...(latest || [])];
        
        // Set initial popular articles from latest (non-blocking)
        setPopularArticles(allArticles.slice(0, 10));
        
        // Load popular articles in background (non-blocking, no errors thrown)
        if (cats && cats.length > 0) {
          // Only load top 2 categories for popular section to reduce API calls
          Promise.allSettled(
            cats.slice(0, 2).map(async (cat) => {
              try {
                const catId = cat.id || cat._id;
                const catArticles = await getArticlesByCategory(catId);
                return catArticles ? catArticles.slice(0, 2) : [];
              } catch (error) {
                // Silently fail - don't log errors for background loading
                return [];
              }
            })
          ).then(categoryResults => {
            const articles = [];
            categoryResults.forEach(result => {
              if (result.status === 'fulfilled' && result.value && Array.isArray(result.value)) {
                articles.push(...result.value);
              }
            });
            // Update popular articles if we got new ones
            if (articles.length > 0) {
              setPopularArticles([...allArticles, ...articles].slice(0, 10));
            }
          }).catch(() => {
            // Silently fail - keep initial popular articles
          });
        } else {
          // Fallback
          const fallbackArticles = [];
          newsData.categories.slice(0, 2).forEach(cat => {
            if (cat.news) {
              fallbackArticles.push(...cat.news.slice(0, 2));
            }
          });
          if (fallbackArticles.length > 0) {
            setPopularArticles([...allArticles, ...fallbackArticles].slice(0, 10));
          }
        }

      } catch (error) {
        console.error('Error loading data:', error);
        // Even on error, try to show something
        setLoading(false);
        // Fallback to JSON
        const fallbackFeatured = newsData.latestNews[0];
        setFeaturedNews(fallbackFeatured);
        setOtherNews(newsData.latestNews.slice(1, 6));
        setAllCategories(newsData.categories);
        const filteredCats = primaryCategoryIds
          .map(id => newsData.categories.find(cat => cat.id === id))
          .filter(cat => cat !== undefined);
        setCategories(filteredCats);
        setShorts(newsData.shorts || []);
        setPopularArticles([...newsData.latestNews, ...newsData.categories.flatMap(cat => cat.news)].slice(0, 10));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load category articles when categories change - OPTIMIZED (non-blocking, silent failures)
  useEffect(() => {
    const loadCategoryArticles = async () => {
      if (categories.length === 0 || !allCategories.length) return;
      
      // Only load if categories don't already have news
      const needsLoading = categories.some(cat => !cat.news || cat.news.length === 0);
      if (!needsLoading) return;
      
      try {
        // Load categories in parallel with Promise.allSettled (won't fail if one fails)
        const updatedCategories = await Promise.allSettled(
          categories.map(async (cat) => {
            // Skip if already has news
            if (cat.news && cat.news.length > 0) return cat;
            
            try {
              // Use the actual MongoDB _id for API calls
              const catId = cat._id || cat.id;
              const articles = await getArticlesByCategory(catId);
              
              // If no articles from API, use fallback
              if (!articles || articles.length === 0) {
                // Try to match by name or the string ID for fallback
                const fallbackCat = newsData.categories.find(c => 
                  c.id === catId || 
                  c.id === (cat.id || cat.nameEn?.toLowerCase().replace(/\s+/g, '-'))
                );
                return {
                  ...cat,
                  news: fallbackCat?.news || []
                };
              }
              
              return {
                ...cat,
                news: articles
              };
            } catch (error) {
              // Silently fail - use fallback data
              const fallbackCat = newsData.categories.find(c => 
                c.id === (cat.id || cat.nameEn?.toLowerCase().replace(/\s+/g, '-'))
              );
              return {
                ...cat,
                news: fallbackCat?.news || []
              };
            }
          })
        );
        
        // Extract successful results
        const successful = updatedCategories
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);
        
        if (successful.length > 0) {
          setCategories(successful);
        }
      } catch (error) {
        // Silently fail - categories will use fallback data
      }
    };

    loadCategoryArticles();
  }, [allCategories.length]); // Removed primaryCategoryIds dependency to avoid unnecessary reloads

  if (loading) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsRed"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subtleGray">
      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-6">
          {/* Left Sidebar - Show on mobile but restructured */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Sidebar type="left" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            {/* Featured Article - Large Hero Section */}
            {featuredNews && (
              <article className="mb-8 bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70">
                <Link href={`/news/${featuredNews._id || featuredNews.id || featuredNews.slug || ''}`} className="block group">
                  <div className="relative overflow-hidden">
                    <img
                      src={featuredNews.featuredImage || featuredNews.image}
                      alt={featuredNews.title}
                      className="w-full h-[400px] md:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block h-2 w-2 rounded-full bg-newsRed animate-pulse"></span>
                        <span className="text-xs font-semibold tracking-wide uppercase text-cleanWhite/90">
                          आजची मुख्य बातमी
                        </span>
                        <span className="text-xs text-cleanWhite/70 ml-auto">
                          {new Date(featuredNews.publishedAt || featuredNews.createdAt || featuredNews.date).toLocaleDateString('mr-IN')}
                        </span>
                      </div>
                      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-cleanWhite mb-4 leading-tight  transition-colors">
                        {featuredNews.title}
                      </h1>
                      <p className="text-base md:text-lg text-cleanWhite/90 line-clamp-2 mb-3">
                        {getArticlePlainText(featuredNews)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-cleanWhite/80">
                        <span>{featuredNews.author?.name || featuredNews.author}</span>
                        {featuredNews.categoryId?.name && (
                          <>
                            <span>•</span>
                            <span>{featuredNews.categoryId.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {/* Photo of the Day */}
            <PhotoOfTheDay />

            {/* Top Stories Grid - 2 Cards in first row, 3 cards in second row */}
            <section className="mb-6 sm:mb-8 md:mb-10">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-5 sm:h-6 w-0.5 sm:w-1 bg-newsRed rounded-full"></div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-deepCharcoal">
                    शीर्ष बातम्या
                  </h2>
                </div>
                <Link
                  href="/category/latest-news"
                  className="text-xs sm:text-sm font-semibold text-newsRed hover:text-newsRed/80 flex items-center gap-1 transition-colors"
                >
                  सर्व पहा
                  <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {/* First Row - 2 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {otherNews.slice(0, 2).map((news) => (
                  <Link
                    key={news.id || news._id}
                    href={`/news/${news._id || news.id || news.slug || ''}`}
                    className="group bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative overflow-hidden">
                      {(news.featuredImage || news.image) ? (
                        <img
                          src={news.featuredImage || news.image}
                          alt={news.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="bg-newsRed text-cleanWhite text-xs font-semibold px-2 py-1 rounded">
                          {news.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-deepCharcoal mb-2 line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-sm text-slateBody line-clamp-2 mb-3">
                        {getArticlePlainText(news)}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-metaGray">
                        <span>{news.date}</span>
                        <span>•</span>
                        <span>{news.author}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Second Row - 3 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherNews.slice(2, 5).map((news) => (
                  <Link
                    key={news.id || news._id}
                    href={`/news/${news._id || news.id || news.slug || ''}`}
                    className="group bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative overflow-hidden">
                      {(news.featuredImage || news.image) ? (
                        <img
                          src={news.featuredImage || news.image}
                          alt={news.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="bg-newsRed text-cleanWhite text-xs font-semibold px-2 py-1 rounded">
                          {news.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-deepCharcoal mb-2 line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-sm text-slateBody line-clamp-2 mb-3">
                        {getArticlePlainText(news)}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-metaGray">
                        <span>{news.date}</span>
                        <span>•</span>
                        <span>{news.author}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Horizontal Video Ad Section */}
            {horizontalAds.length > 0 && (
              <section className="mb-10">
                {horizontalAds.map((ad) => (
                  <div 
                    key={ad._id} 
                    className="bg-cleanWhite rounded-lg overflow-hidden shadow-sm mb-4 cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => {
                      if (ad.link) {
                        window.open(ad.link, '_blank', 'noopener,noreferrer');
                      }
                      if (ad._id) {
                        apiFetch(`/ads/${ad._id}/click`, { method: 'POST' }).catch(console.error);
                      }
                    }}
                  >
                    <div className="relative w-full aspect-video bg-black min-h-[120px] md:min-h-[160px] lg:min-h-[200px]">
                      <p className="absolute top-2 left-2 z-10 text-[10px] text-cleanWhite/80 font-semibold uppercase tracking-wide bg-black/50 px-2 py-1 rounded">
                        व्हिडिओ जाहिरात
                      </p>
                      <div className="w-full h-full">
                        {ad.videoUrl ? (
                          <video
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                          >
                            <source src={ad.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            src={ad.imageUrl}
                            alt={ad.title || 'जाहिरात'}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Short Videos Section */}
            {shorts.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1 bg-newsRed rounded-full"></div>
                    <h2 className="text-xl md:text-2xl font-bold text-deepCharcoal">
                      शॉर्ट व्हिडिओ
                    </h2>
                  </div>
                  <Link
                    href="/shorts"
                    className="text-sm font-semibold text-newsRed hover:text-newsRed/80 flex items-center gap-1 transition-colors"
                  >
                    सर्व पहा
                    <FaArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {shorts.slice(0, 5).map((short) => (
                    <div
                      key={short._id || short.id}
                      className="group relative bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative aspect-[9/16] overflow-hidden bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${short.videoId || short.id}`}
                          title="YouTube Short"
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Horizontal Image Ad Section */}
            <HorizontalImageAds />

            {/* Category Sections */}
            {categories.map((category) => (
              <section key={category._id || category.id || category.nameEn} className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1 bg-newsRed rounded-full"></div>
                    <h2 className="text-xl md:text-2xl font-bold text-deepCharcoal">
                      {category.name}
                    </h2>
                  </div>
                  <Link
                    href={`/category/${category._id || category.id || category.nameEn?.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm font-semibold text-newsRed hover:text-newsRed/80 flex items-center gap-1 transition-colors"
                  >
                    सर्व पहा
                    <FaArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Featured Article for Category */}
                {category.news && category.news[0] && (
                  <div className="mb-6">
                    <Link
                      href={`/news/${category.news[0]._id || category.news[0].id || category.news[0].slug || ''}`}
                      className="group block bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 hover:shadow-md transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        <div className="relative overflow-hidden">
                          <img
                            src={category.news[0].featuredImage || category.news[0].image}
                            alt={category.news[0].title}
                            className="w-full h-64 md:h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-6 flex flex-col justify-center">
                          <div className="mb-3">
                            <span className="bg-newsRed/10 text-newsRed text-xs font-semibold px-2 py-1 rounded">
                              {category.name || category.nameEn}
                            </span>
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-deepCharcoal mb-3 line-clamp-3 group-hover:text-newsRed transition-colors">
                            {category.news[0].title}
                          </h3>
                          <p className="text-sm text-slateBody line-clamp-3 mb-4">
                            {getArticlePlainText(category.news[0])}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-metaGray">
                            <span>{new Date(category.news[0].publishedAt || category.news[0].createdAt || category.news[0].date).toLocaleDateString('mr-IN')}</span>
                            <span>•</span>
                            <span>{category.news[0].author?.name || category.news[0].author}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Other Articles Grid */}
                {category.news && category.news.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {category.news.slice(1, 4).map((news) => (
                      <Link
                        key={news.id || news._id}
                        href={`/news/${news._id || news.id || news.slug || ''}`}
                        className="group bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 hover:shadow-md transition-all duration-300"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={news.featuredImage || news.image}
                            alt={news.title}
                            className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="text-base font-bold text-deepCharcoal mb-2 line-clamp-2 group-hover:text-newsRed transition-colors">
                            {news.title}
                          </h4>
                          <p className="text-xs text-slateBody line-clamp-2 mb-2">
                            {getArticlePlainText(news)}
                          </p>
                          <p className="text-xs text-metaGray">{new Date(news.publishedAt || news.createdAt || news.date).toLocaleDateString('mr-IN')}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {/* Popular Articles Section - Numbered List */}
            <section className="mb-10 bg-cleanWhite rounded-lg p-6 shadow-sm border border-subtleGray/70">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-newsRed rounded-full"></div>
                <h2 className="text-xl md:text-2xl font-bold text-deepCharcoal">
                  लोकप्रिय
                </h2>
              </div>
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <Link
                    key={article.id || article._id}
                    href={`/news/${article._id || article.id || article.slug || ''}`}
                    className="flex items-start gap-4 group hover:bg-subtleGray/50 p-3 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-newsRed text-cleanWhite rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-deepCharcoal line-clamp-2 group-hover:text-newsRed transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs text-metaGray mt-1">{new Date(article.publishedAt || article.createdAt || article.date).toLocaleDateString('mr-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar - Show on mobile but restructured */}
          <div className="lg:col-span-2 order-3">
            <Sidebar type="right" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
