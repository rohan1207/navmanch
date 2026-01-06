'use client';

import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { getLatestArticles } from '../utils/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        // Get latest articles as events
        const data = await getLatestArticles(50);
        setEvents(data || []);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
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
          <h1 className="text-3xl md:text-4xl font-bold">आमचे कार्यक्रम</h1>
          <span className="hidden sm:inline text-xs text-metaGray uppercase tracking-wide">
            Events & Initiatives
          </span>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-metaGray text-lg">कोणतेही कार्यक्रम उपलब्ध नाहीत</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id || event.id}
                className="bg-cleanWhite rounded-lg border border-subtleGray/80 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <img
                  src={event.featuredImage || event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold text-deepCharcoal mb-3">
                    {event.title}
                  </h3>
                  <p className="text-sm text-slateBody mb-4 line-clamp-3">
                    {event.summary || (event.content ? String(event.content).replace(/<[^>]+>/g, ' ').substring(0, 150) : '')}
                  </p>
                  <div className="space-y-2 text-sm text-slateBody">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-newsRed" />
                      <span>{new Date(event.publishedAt || event.createdAt || event.date).toLocaleDateString('mr-IN')}</span>
                    </div>
                    {event.author && (
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-newsRed" />
                        <span>{event.author?.name || event.author}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Events;





