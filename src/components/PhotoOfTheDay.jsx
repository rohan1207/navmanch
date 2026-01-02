'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const PhotoOfTheDay = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const data = await apiFetch('/photo-of-the-day/today', {
          timeout: 10000, // 10 second timeout
          useCache: true,
          cacheTTL: 10 * 60 * 1000 // 10 min cache (photo changes daily)
        });
        if (data && data.image) {
          setPhoto(data);
          // Track view in background (silently fail)
          if (data._id) {
            apiFetch(`/photo-of-the-day/${data._id}/views`, { 
              method: 'POST',
              timeout: 5001 // Short timeout for tracking
            }).catch(() => {
              // Silently fail - tracking is not critical
            });
          }
        }
      } catch (error) {
        // Silently fail - photo is not critical
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, []);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!photo || !photo.image) {
    return null; // Don't show if no photo
  }

  return (
    <section className="mb-6 sm:mb-8 md:mb-10">
      <div className="bg-cleanWhite rounded-lg overflow-hidden shadow-lg border border-subtleGray/70">
        {/* Header */}
        <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-subtleGray/50 bg-gradient-to-r from-newsRed/5 to-editorialBlue/5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-6 sm:h-8 w-0.5 sm:w-1 bg-gradient-to-b from-newsRed to-editorialBlue rounded-full"></div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-deepCharcoal">
                आजचे फोटो
              </h2>
              <p className="text-[10px] sm:text-xs text-metaGray mt-0.5">
                Photo of the Day
              </p>
            </div>
            {photo.date && (
              <div className="ml-auto">
                <span className="text-[10px] sm:text-xs font-semibold text-newsRed bg-newsRed/10 px-2 sm:px-3 py-1 rounded-full">
                  {new Date(photo.date).toLocaleDateString('mr-IN', { 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Photo */}
        <div className="relative group overflow-hidden">
          <img
            src={photo.image}
            alt={photo.caption || 'Photo of the Day'}
            className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Caption Below Image */}
        <div className="p-4 sm:p-5 md:p-6">
          <div className="max-w-4xl">
            <p className="text-base sm:text-lg md:text-xl font-semibold text-deepCharcoal mb-3 leading-relaxed">
              {photo.caption}
            </p>
            {(photo.photographer || photo.location) && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-metaGray">
                {photo.photographer && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {photo.photographer}
                  </span>
                )}
                {photo.location && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {photo.location}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhotoOfTheDay;

