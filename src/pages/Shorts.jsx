'use client';

import React, { useState, useEffect } from 'react';
import { getShorts } from '../utils/api';

const Shorts = () => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        setLoading(true);
        const data = await getShorts();
        setShorts(data || []);
      } catch (error) {
        console.error('Error fetching shorts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShorts();
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
          <h1 className="text-3xl md:text-4xl font-bold">शॉर्ट्स</h1>
          <span className="hidden sm:inline text-xs text-metaGray uppercase tracking-wide">
            YouTube Shorts
          </span>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {shorts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-metaGray text-lg">अजून कोणतेही शॉर्ट उपलब्ध नाहीत</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {shorts.map((short) => (
              <div
                key={short._id || short.id}
                className="bg-cleanWhite rounded-lg border border-subtleGray/80 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="relative aspect-[9/16] bg-black">
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
        )}
      </section>
    </div>
  );
};

export default Shorts;

