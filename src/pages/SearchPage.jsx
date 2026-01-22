'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import { apiFetch } from '../utils/api';
import { getSmartSearchPath, getSearchSuggestions } from '../utils/smartSearch';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const performSearch = async () => {
      if (!query || !query.trim()) {
        setLoading(false);
        setHasSearched(false);
        setArticles([]);
        setSuggestions([]);
        return;
      }

      // Check for smart match first
      const smartPath = getSmartSearchPath(query);
      if (smartPath) {
        // Redirect to matched page
        router.replace(smartPath);
        return;
      }

      // Get suggestions for partial matches
      const foundSuggestions = getSearchSuggestions(query, 5);
      setSuggestions(foundSuggestions);

      try {
        setLoading(true);
        setHasSearched(true);
        
        // Call the API with search parameter
        const searchQuery = query.trim();
        const data = await apiFetch(`/articles?search=${encodeURIComponent(searchQuery)}&status=published&limit=50`, {
          timeout: 10000,
          useCache: true,
          cacheTTL: 2 * 60 * 1000
        });
        
        if (data && data.data && Array.isArray(data.data)) {
          setArticles(data.data);
        } else if (data && Array.isArray(data)) {
          setArticles(data);
        } else {
          setArticles([]);
        }
      } catch (error) {
        console.error('Error performing search:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsRed"></div>
      </div>
    );
  }

  const featuredNews = articles.length > 0 ? articles[0] : null;
  const otherNews = articles.slice(1);

  return (
    <div className="min-h-screen bg-subtleGray">
      {/* Section Header */}
      <div className="bg-cleanWhite border-b-2 border-subtleGray py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-deepCharcoal">
              {query ? `"${query}" साठी शोध परिणाम` : 'शोध'}
            </h1>
          </div>
          {query && (
            <p className="text-center text-slateBody mt-2">
              {articles.length > 0 
                ? `${articles.length} परिणाम सापडले` 
                : 'कोणतेही परिणाम सापडले नाहीत'}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {!hasSearched || !query ? (
          <div className="text-center py-12">
            <p className="text-lg text-slateBody mb-4">कृपया शोध शब्द प्रविष्ट करा</p>
          </div>
        ) : (
          <>
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-6 bg-cleanWhite rounded-lg border border-subtleGray p-4">
                <h3 className="text-lg font-semibold text-deepCharcoal mb-3">
                  कदाचित आपण हे शोधत आहात:
                </h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <Link
                      key={index}
                      href={suggestion.path}
                      className="block px-4 py-2 bg-subtleGray hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <span className="font-medium text-deepCharcoal">{suggestion.name}</span>
                      <span className="text-sm text-metaGray ml-2">
                        ({suggestion.type === 'page' ? 'पृष्ठ' : 'श्रेणी'})
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-2xl font-semibold text-deepCharcoal mb-4">
                  "{query}" साठी कोणतेही परिणाम सापडले नाहीत
                </p>
                <p className="text-slateBody mb-6">
                  कृपया वेगळा शोध शब्द वापरून पुन्हा प्रयत्न करा
                </p>
                {suggestions.length === 0 && (
                  <Link 
                    href="/" 
                    className="inline-block px-6 py-3 bg-newsRed text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    मुखपृष्ठावर परत जा
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-6">
                {/* Left Sidebar - after main on mobile */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                  <Sidebar type="left" />
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8 order-1 lg:order-2">
                  {/* Featured Story */}
                  {featuredNews && (
                    <article className="mb-8 pb-6 border-b border-subtleGray">
                      <Link href={`/news/${featuredNews._id || featuredNews.id || featuredNews.slug || ''}`} className="block group">
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img
                            src={featuredNews.featuredImage || featuredNews.image}
                            alt={featuredNews.title}
                            className="w-full h-64 sm:h-80 md:h-96 object-cover group-hover:scale-105 group-hover:opacity-95 transition-all duration-300"
                          />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-deepCharcoal mb-3 group-hover:text-newsRed transition-colors">
                          {featuredNews.title}
                        </h1>
                        <p className="text-slateBody text-lg leading-relaxed mb-3">
                          {featuredNews.summary}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-metaGray">
                          <span>{new Date(featuredNews.publishedAt || featuredNews.createdAt || featuredNews.date).toLocaleDateString('mr-IN')}</span>
                          <span>•</span>
                          <span>{featuredNews.author?.name || featuredNews.author}</span>
                        </div>
                      </Link>
                    </article>
                  )}

                  {/* Other Stories */}
                  {otherNews.length > 0 && (
                    <section>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-px w-8 bg-newsRed" />
                        <h2 className="text-lg font-semibold tracking-wide text-deepCharcoal">
                          इतर परिणाम
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {otherNews.map((news) => (
                          <Link
                            key={news.id || news._id}
                            href={`/news/${news._id || news.id || news.slug || ''}`}
                            className="group bg-cleanWhite rounded-lg border border-subtleGray/70 overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="mb-3">
                              <img
                                src={news.featuredImage || news.image}
                                alt={news.title}
                                className="w-full h-48 object-cover group-hover:scale-105 group-hover:opacity-95 transition-all duration-300"
                              />
                            </div>
                            <div className="px-4 pb-4">
                              <h3 className="text-lg font-bold text-deepCharcoal mb-2 line-clamp-2 group-hover:text-newsRed transition-colors">
                                {news.title}
                              </h3>
                              <p className="text-sm text-slateBody line-clamp-3 mb-2">
                                {(news.summary || news.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-metaGray">
                                <span>{new Date(news.publishedAt || news.createdAt || news.date).toLocaleDateString('mr-IN')}</span>
                                <span>•</span>
                                <span>{news.author?.name || news.author}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-2 order-3">
                  <Sidebar type="right" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

