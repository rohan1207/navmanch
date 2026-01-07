'use client';

import React from 'react';
import Link from 'next/link';
import newsData from '../data/newsData.json';

const Articles = () => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsData.articles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="bg-cleanWhite rounded-lg border border-subtleGray/80 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-deepCharcoal mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <div 
                  className="text-sm text-slateBody mb-3 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: article.content || '' }}
                />
                <div className="flex justify-between items-center text-xs text-metaGray">
                  <span>{article.author}</span>
                  <span>{article.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Articles;







