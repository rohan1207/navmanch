'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'सर्व' },
    { id: 'csr', name: 'CSR' },
    { id: 'accreditation', name: 'प्रमाणपत्र' },
    { id: 'events', name: 'कार्यक्रम' },
  ];

  useEffect(() => {
    const loadImages = async () => {
      try {
        // Fetch from media API
        const data = await apiFetch('/media', {
          timeout: 10000,
          useCache: true,
          cacheTTL: 5 * 60 * 1000
        });
        
        if (data && Array.isArray(data)) {
          setImages(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setImages(data.data);
        }
      } catch (error) {
        console.error('Error loading gallery images:', error);
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, []);

  const getFilteredImages = () => {
    if (selectedCategory === 'all') {
      return images;
    }
    // Filter by category if available
    return images.filter(img => {
      const imgCategory = img.category?.toLowerCase() || img.type?.toLowerCase() || '';
      return imgCategory === selectedCategory;
    });
  };

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
          <h1 className="text-3xl md:text-4xl font-bold">गॅलरी</h1>
          <span className="hidden sm:inline text-xs text-metaGray uppercase tracking-wide">
            Photos & Moments
          </span>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-newsRed to-editorialBlue text-cleanWhite'
                  : 'bg-cleanWhite text-slateBody hover:bg-subtleGray border border-subtleGray'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {getFilteredImages().length === 0 ? (
          <div className="text-center py-12">
            <p className="text-metaGray text-lg">कोणतीही छवी उपलब्ध नाही</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {getFilteredImages().map((image) => (
              <div
                key={image._id || image.id}
                onClick={() => setSelectedImage(image)}
                className="bg-cleanWhite rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                <img
                  src={image.url || image.image}
                  alt={image.title || image.name || 'Gallery Image'}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-deepCharcoal mb-1">{image.title || image.name || 'Image'}</h3>
                  <p className="text-sm text-slateBody">{image.createdAt ? new Date(image.createdAt).toLocaleDateString('mr-IN') : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full">
            <img
              src={selectedImage.url || selectedImage.image}
              alt={selectedImage.title || selectedImage.name || 'Gallery Image'}
              className="w-full rounded-lg"
            />
            <div className="bg-cleanWhite p-4 mt-4 rounded-lg">
              <h3 className="text-xl font-bold text-deepCharcoal mb-2">
                {selectedImage.title || selectedImage.name || 'Image'}
              </h3>
              <p className="text-slateBody">{selectedImage.createdAt ? new Date(selectedImage.createdAt).toLocaleDateString('mr-IN') : ''}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;





