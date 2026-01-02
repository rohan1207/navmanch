'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import TextToSpeech from '../components/TextToSpeech';
import ShareButtons from '../components/ShareButtons';
import { getArticle, getCategories, getArticlesByCategory, clearMostReadCache, apiFetch } from '../utils/api';

const NewsDetail = ({ articleId }) => {
  const router = useRouter();
  const [news, setNews] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    const loadRelatedArticles = async () => {
      if (!news) return;
      
      const catToUse = category || (news.categoryId ? { _id: news.categoryId?._id || news.categoryId?.id || news.categoryId, id: news.categoryId?.id || news.categoryId } : null);
      
      if (!catToUse) {
        try {
          const categories = await getCategories();
          const allArticles = [];
          categories.forEach(cat => {
            if (cat.news && Array.isArray(cat.news)) {
              allArticles.push(...cat.news);
            }
          });
          
          const currentId = news._id || news.id || articleId;
          const related = allArticles
            .filter(art => {
              const artId = art._id || art.id;
              return artId?.toString() !== currentId?.toString() && artId?.toString() !== articleId?.toString();
            })
            .slice(0, 4);
          
          if (related.length > 0) {
            setRelatedArticles(related);
          }
        } catch (error) {
          console.warn('Error loading fallback articles:', error);
        }
        return;
      }
      
      try {
        const categoryId = catToUse._id || catToUse.id;
        if (categoryId) {
          const allCategoryArticles = await getArticlesByCategory(categoryId);
          if (allCategoryArticles && Array.isArray(allCategoryArticles) && allCategoryArticles.length > 0) {
            const currentId = news._id || news.id || articleId;
            const related = allCategoryArticles
              .filter(art => {
                const artId = art._id || art.id;
                return artId?.toString() !== currentId?.toString() && artId?.toString() !== articleId?.toString();
              })
              .slice(0, 4);
            
            if (related.length > 0) {
              setRelatedArticles(related);
              return;
            }
          }
        }
        
        if (catToUse.news && Array.isArray(catToUse.news)) {
          const currentId = news._id || news.id || articleId;
          const related = catToUse.news
            .filter(art => {
              const artId = art._id || art.id;
              return artId?.toString() !== currentId?.toString() && artId?.toString() !== articleId?.toString();
            })
            .slice(0, 4);
          if (related.length > 0) {
            setRelatedArticles(related);
          }
        }
      } catch (error) {
        console.warn('Error loading related articles:', error);
      }
    };
    
    loadRelatedArticles();
  }, [news?._id || news?.id, category?._id || category?.id, articleId]);

  useEffect(() => {
    const trackView = async () => {
      if (!news || !articleId) return;
      
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const articleIdValue = news._id || news.id || articleId;
        
        await fetch(`${API_BASE}/articles/${articleIdValue}/views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        clearMostReadCache();
      } catch (error) {
        console.warn('Error tracking view:', error);
      }
    };
    
    const timer = setTimeout(trackView, 500);
    return () => clearTimeout(timer);
  }, [news?._id || news?.id, articleId]);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        
        if (!articleId || articleId === 'undefined' || articleId === 'null') {
          console.warn('Invalid article ID:', articleId);
          setLoading(false);
          return;
        }
        
        const article = await getArticle(articleId);
        
        if (article) {
          setNews(article);
          
          const categoryIdValue = article.categoryId?._id || article.categoryId?.id || article.categoryId;
          
          if (categoryIdValue) {
            const categories = await getCategories();
            const foundCategory = categories.find(cat => 
              (cat.id === categoryIdValue) || 
              (cat._id === categoryIdValue) ||
              (cat._id?.toString() === categoryIdValue?.toString()) ||
              (cat.id?.toString() === categoryIdValue?.toString())
            );
            
            if (foundCategory) {
              setCategory(foundCategory);
            }
            
            let loadedRelated = [];
            
            try {
              const catId = foundCategory?._id || foundCategory?.id || categoryIdValue;
              const allCategoryArticles = await getArticlesByCategory(catId);
              
              if (allCategoryArticles && Array.isArray(allCategoryArticles) && allCategoryArticles.length > 0) {
                const currentId = article._id || article.id || articleId;
                const related = allCategoryArticles
                  .filter(art => {
                    const artId = art._id || art.id;
                    return artId?.toString() !== currentId?.toString() && artId?.toString() !== articleId?.toString();
                  })
                  .slice(0, 4);
                
                if (related.length > 0) {
                  loadedRelated = related;
                }
              }
            } catch (error) {
              console.warn('Error loading related articles from API:', error);
            }
            
            if (loadedRelated.length === 0 && foundCategory?.news && Array.isArray(foundCategory.news)) {
              const currentId = article._id || article.id || articleId;
              const related = foundCategory.news
                .filter(art => {
                  const artId = art._id || art.id;
                  return artId?.toString() !== currentId?.toString() && artId?.toString() !== articleId?.toString();
                })
                .slice(0, 4);
              if (related.length > 0) {
                loadedRelated = related;
              }
            }
            
            if (loadedRelated.length > 0) {
              setRelatedArticles(loadedRelated);
            } else {
              try {
                const categories = await getCategories();
                const allArticles = [];
                categories.forEach(cat => {
                  if (cat.news && Array.isArray(cat.news)) {
                    allArticles.push(...cat.news);
                  }
                });
                
                const currentId = article._id || article.id || articleId;
                const related = allArticles
                  .filter(art => {
                    const artId = art._id || art.id;
                    return artId?.toString() !== currentId?.toString() && artId?.toString() !== articleId?.toString();
                  })
                  .slice(0, 4);
                
                if (related.length > 0) {
                  setRelatedArticles(related);
                }
              } catch (error) {
                console.warn('Error loading fallback articles:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading article:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsRed"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-deepCharcoal mb-4">बातमी सापडली नाही</h2>
          <Link href="/" className="text-editorialBlue hover:text-newsRed">
            मुखपृष्ठावर परत जा
          </Link>
        </div>
      </div>
    );
  }

  const getPlainText = (html) => {
    if (!html) return '';
    try {
      if (typeof document !== 'undefined') {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
      }
      return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    } catch {
      return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  };

  const articleDescription = news?.summary || (news?.content ? getPlainText(news.content).substring(0, 200) : '') || news?.title || '';
  
  const getAbsoluteImageUrl = (imgUrl) => {
    if (!imgUrl) return '';
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      return imgUrl;
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`}`;
    }
    return imgUrl;
  };
  
  const articleImage = getAbsoluteImageUrl(news?.featuredImage || news?.image || '');
  const frontendBase = 'https://navmanchnews.com';
  const articleUrl = news 
    ? (() => {
        let identifier;
        if (news.id !== undefined && news.id !== null) {
          identifier = String(news.id);
        } else if (news._id) {
          identifier = String(news._id);
        } else {
          identifier = articleId;
        }
        return `${frontendBase}/news/${identifier}`;
      })()
    : (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <div className="min-h-screen bg-subtleGray">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Sidebar type="left" />
          </div>

          <div className="lg:col-span-8 order-1 lg:order-2">
            <article className="bg-cleanWhite rounded-lg border border-subtleGray px-4 sm:px-8 py-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {(category || news.categoryId) && (
                    <Link
                      href={`/category/${category?.id || category?._id || news.categoryId?.id || news.categoryId?._id || news.categoryId}`}
                      className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wide text-newsRed"
                    >
                      <span className="h-5 w-1 rounded-full bg-newsRed" />
                      <span>{category?.name || news.categoryId?.name}</span>
                    </Link>
                  )}
                </div>
                <span className="hidden sm:inline text-xs text-metaGray">
                  {new Date(news.publishedAt || news.createdAt || news.date).toLocaleDateString('mr-IN')}
                </span>
              </div>

              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={news.featuredImage || news.image}
                  alt={news.title}
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-deepCharcoal leading-tight flex-1">
                  {news.title}
                </h1>
                <div className="flex-shrink-0 pt-1">
                  <TextToSpeech article={news} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-metaGray mb-6 pb-4 border-b border-subtleGray">
                <span>{new Date(news.date || news.publishedAt || news.createdAt).toLocaleDateString('mr-IN')}</span>
                <span>•</span>
                <span>{news.author?.name || news.author}</span>
              </div>

              <div className="prose max-w-none prose-headings:text-deepCharcoal prose-p:text-slateBody prose-p:leading-relaxed prose-p:mb-4 prose-h4:text-xl prose-h4:font-bold prose-h4:mt-6 prose-h4:mb-3 prose-strong:text-deepCharcoal prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6">
                <div 
                  className="text-base text-slateBody leading-relaxed article-content"
                  dangerouslySetInnerHTML={{ __html: news.content || '' }}
                />
              </div>

              {relatedArticles && relatedArticles.length > 0 && (
                <div className="mt-10 pt-8 border-t border-subtleGray">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-6 w-1 bg-newsRed rounded-full"></div>
                    <h2 className="text-xl md:text-2xl font-bold text-deepCharcoal">
                      संबंधित बातम्या
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {relatedArticles.map((article) => {
                      const articleIdValue = article._id || article.id;
                      const articleSlug = article.slug || articleIdValue;
                      
                      const articleDesc = article.content ? getPlainText(article.content).substring(0, 100) : '';
                      
                      return (
                        <Link
                          key={articleIdValue}
                          href={`/news/${articleSlug}`}
                          className="group bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 hover:shadow-md transition-all duration-300"
                        >
                          <div className="relative overflow-hidden">
                            {(article.featuredImage || article.image) ? (
                              <img
                                src={article.featuredImage || article.image}
                                alt={article.title}
                                className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-sm">No Image</span>
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <span className="bg-newsRed text-cleanWhite text-xs font-semibold px-2 py-1 rounded">
                                {category?.name || article.categoryId?.name || 'बातमी'}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-base sm:text-lg font-bold text-deepCharcoal mb-2 line-clamp-2 group-hover:text-newsRed transition-colors">
                              {article.title}
                            </h3>
                            {articleDesc && (
                              <p className="text-xs sm:text-sm text-slateBody line-clamp-2 mb-3">
                                {articleDesc}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-metaGray">
                              <span>{new Date(article.publishedAt || article.createdAt || article.date).toLocaleDateString('mr-IN')}</span>
                              {article.author && (
                                <>
                                  <span>•</span>
                                  <span>{article.author?.name || article.author}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-subtleGray flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="bg-gradient-to-r from-newsRed to-editorialBlue text-cleanWhite px-6 py-2 rounded font-semibold hover:opacity-90 transition-opacity"
                >
                  परत जा
                </button>
                <ShareButtons
                  title={news.title}
                  description={articleDescription}
                  image={articleImage}
                  url={articleUrl}
                />
              </div>
            </article>
          </div>

          <div className="lg:col-span-2 order-3">
            <Sidebar type="right" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;

