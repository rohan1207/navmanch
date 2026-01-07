'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import newsData from '../data/newsData.json';
import Sidebar from '../components/Sidebar';
import SportsScores from '../components/SportsScores';
import { getCategories, getArticlesByCategory } from '../utils/api';

const CategoryPage = () => {
  const params = useParams();
  const categoryId = params?.categoryId;
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading category page for categoryId:', categoryId);
        
        // Get categories
        const categories = await getCategories();
        console.log('Loaded categories:', categories.length);
        
        // Convert categoryId to string for comparison
        const categoryIdStr = categoryId?.toString();
        const foundCategory = categories.find((cat) => {
          const catId = (cat._id || cat.id)?.toString();
          const catNameEn = cat.nameEn?.toLowerCase().replace(/\s+/g, '-');
          // Match by ID (ObjectId or string) or by nameEn slug
          return catId === categoryIdStr || 
                 cat.id === categoryId || 
                 cat._id?.toString() === categoryIdStr ||
                 catNameEn === categoryIdStr;
        });
        
        console.log('Found category:', foundCategory ? foundCategory.name : 'NOT FOUND');
        
        if (foundCategory) {
          setCategory(foundCategory);
          // Show category immediately, don't wait for articles
          setLoading(false);
          
          // Get articles for this category - use _id if available, otherwise id
          const catId = foundCategory._id || foundCategory.id;
          console.log('Fetching articles for category ID:', catId);
          const categoryArticles = await getArticlesByCategory(catId);
          console.log('Loaded articles from API:', categoryArticles?.length || 0);
          
          if (categoryArticles && categoryArticles.length > 0) {
            console.log('✅ Using API articles');
            setArticles(categoryArticles);
          } else {
            console.log('⚠️ No API articles, trying fallback');
            // Fallback to JSON
            const fallbackCat = newsData.categories.find(c => c.id === categoryId);
            if (fallbackCat && fallbackCat.news) {
              console.log('Using fallback JSON data');
              setArticles(fallbackCat.news.map(article => ({
                ...article,
                _id: article.id,
                featuredImage: article.image,
                author: article.author ? { name: article.author } : null
              })));
            }
          }
        } else {
          console.log('⚠️ Category not found in API, using fallback');
          // Fallback to JSON
          const fallbackCat = newsData.categories.find((cat) => cat.id === categoryId);
          if (fallbackCat) {
            setCategory(fallbackCat);
            setArticles(fallbackCat.news || []);
          }
        }
      } catch (error) {
        console.error('Error loading category:', error);
        // Fallback to JSON
        const fallbackCat = newsData.categories.find((cat) => cat.id === categoryId);
        if (fallbackCat) {
          setCategory(fallbackCat);
          setArticles(fallbackCat.news || []);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsRed"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-deepCharcoal mb-4">श्रेणी सापडली नाही</h2>
          <Link href="/" className="text-editorialBlue hover:text-newsRed">
            मुखपृष्ठावर परत जा
          </Link>
        </div>
      </div>
    );
  }

  const featuredNews = articles[0];
  const otherNews = articles.slice(1);

  return (
    <div className="min-h-screen bg-subtleGray">
      {/* Section Header */}
      <div className="bg-cleanWhite border-b-2 border-subtleGray py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-deepCharcoal">
              {category.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-6">
          {/* Left Sidebar - after main on mobile */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Sidebar type="left" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            {/* Sports Scores Section - Only for sports category */}
            {(categoryId === 'sports' || category?.nameEn?.toLowerCase() === 'sports' || category?.name === 'क्रीडा') && (
              <div className="mb-8">
                <SportsScores />
              </div>
            )}

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
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-px w-8 bg-newsRed" />
                <h2 className="text-lg font-semibold tracking-wide text-deepCharcoal">
                  इतर बातम्या
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
                        {(news.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
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
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 order-3">
            <Sidebar type="right" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;

