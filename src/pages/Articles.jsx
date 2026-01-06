'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLatestArticles } from '../utils/api';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const data = await getLatestArticles(50);
        setArticles(data || []);
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsRed"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subtleGray">
      <section className="bg-cleanWhite text-deepCharcoal py-6 border-b border-subtleGray">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold">लेख</h1>
          <span className="hidden sm:inline text-xs text-metaGray uppercase tracking-wide">
            Opinion & Features
          </span>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-metaGray text-lg">कोणतेही लेख उपलब्ध नाहीत</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const articleId = article._id || article.id;
              const articleSlug = article.slug || articleId;
              return (
                <Link
                  key={articleId}
                  href={`/news/${articleSlug}`}
                  className="bg-cleanWhite rounded-lg border border-subtleGray/80 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
                >
                  <img
                    src={article.featuredImage || article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-deepCharcoal mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <div 
                      className="text-sm text-slateBody mb-3 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: article.summary || article.content || '' }}
                    />
                    <div className="flex justify-between items-center text-xs text-metaGray">
                      <span>{article.author?.name || article.author}</span>
                      <span>{new Date(article.publishedAt || article.createdAt || article.date).toLocaleDateString('mr-IN')}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Articles;





