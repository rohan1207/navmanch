'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLatestArticles } from '../utils/api';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        // Get latest articles as blogs
        const data = await getLatestArticles(50);
        setBlogs(data || []);
      } catch (error) {
        console.error('Error loading blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
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
          <h1 className="text-3xl md:text-4xl font-bold">ब्लॉग</h1>
          <span className="hidden sm:inline text-xs text-metaGray uppercase tracking-wide">
            Voices & Columns
          </span>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-metaGray text-lg">कोणतेही ब्लॉग उपलब्ध नाहीत</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => {
              const blogId = blog._id || blog.id;
              const blogSlug = blog.slug || blogId;
              return (
                <Link
                  key={blogId}
                  href={`/news/${blogSlug}`}
                  className="bg-cleanWhite rounded-lg border border-subtleGray/80 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
                >
                  <img
                    src={blog.featuredImage || blog.image}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-deepCharcoal mb-2 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-slateBody mb-3 line-clamp-3">
                      {blog.summary || (blog.content ? String(blog.content).replace(/<[^>]+>/g, ' ').substring(0, 150) : '')}
                    </p>
                    <div className="flex justify-between items-center text-xs text-metaGray">
                      <span>{blog.author?.name || blog.author}</span>
                      <span>{new Date(blog.publishedAt || blog.createdAt || blog.date).toLocaleDateString('mr-IN')}</span>
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

export default Blogs;

