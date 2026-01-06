'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const EPaperPage2 = ({ page, onSectionClick, epaperId, isMobile = false, totalPages = null }) => {
  const router = useRouter();
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartDistance = useRef(0);
  const touchStartScale = useRef(1);

  useEffect(() => {
    const handleResize = () => {
      if (imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        setImageSize({ width: rect.width, height: rect.height });
      }
    };

    if (imgRef.current) {
      imgRef.current.addEventListener('load', handleResize);
      handleResize();
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (imgRef.current) {
        imgRef.current.removeEventListener('load', handleResize);
      }
    };
  }, [page.image]);

  // Mobile zoom handlers
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const container = containerRef.current;
    let initialDistance = 0;
    let initialScale = 1;
    let initialPosition = { x: 0, y: 0 };

    const getDistance = (touch1, touch2) => {
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        initialScale = scale;
        touchStartScale.current = scale;
      } else if (e.touches.length === 1 && scale > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        });
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const newScale = Math.max(1, Math.min(3, (currentDistance / initialDistance) * initialScale));
        setScale(newScale);
      } else if (e.touches.length === 1 && isDragging && scale > 1) {
        e.preventDefault();
        const newX = e.touches[0].clientX - dragStart.x;
        const newY = e.touches[0].clientY - dragStart.y;
        
        const maxX = (scale - 1) * (container.offsetWidth / 2);
        const maxY = (scale - 1) * (container.offsetHeight / 2);
        
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY))
        });
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      if (scale < 1) setScale(1);
      if (scale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    };

    let lastTap = 0;
    const handleDoubleTap = (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        if (scale === 1) {
          setScale(2);
        } else {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }
      }
      lastTap = currentTime;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchend', handleDoubleTap);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchend', handleDoubleTap);
    };
  }, [isMobile, scale, position, isDragging, dragStart]);

  const getDisplayCoords = (newsItem) => {
    if (!imageSize.width || !page.width || !page.height) return null;
    
    const scaleX = imageSize.width / page.width;
    const scaleY = imageSize.height / page.height;
    
    return {
      left: newsItem.x * scaleX,
      top: newsItem.y * scaleY,
      width: newsItem.width * scaleX,
      height: newsItem.height * scaleY
    };
  };

  // Mobile: Full screen zoomable view
  if (isMobile) {
    return (
      <div className="w-full bg-cleanWhite">
        <div
          ref={containerRef}
          className="relative w-full bg-cleanWhite"
          style={{
            touchAction: scale > 1 ? 'none' : 'auto',
            userSelect: 'none',
            overflow: scale > 1 ? 'hidden' : 'visible',
            position: 'relative'
          }}
        >
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: scale === 1 ? 'transform 0.3s ease-out' : 'none',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: '2px'
            }}
          >
            <img
              ref={imgRef}
              src={page.image}
              alt={`Page ${page.pageNo}`}
              className="w-full h-auto object-contain"
              style={{
                maxWidth: '100%',
                pointerEvents: 'none'
              }}
            />
            
            {/* Clickable sections - only when not zoomed */}
            {scale === 1 && page.news && page.news.map((newsItem, index) => {
              const coords = getDisplayCoords(newsItem);
              if (!coords) return null;
              
              const handleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (epaperId) {
                  let sectionId;
                  const hasValidSlug = newsItem.slug && 
                                   newsItem.slug.trim() !== '' && 
                                   newsItem.slug.toLowerCase() !== 'untitled';
                  
                  if (newsItem.id !== undefined && newsItem.id !== null) {
                    sectionId = String(newsItem.id);
                  } else if (hasValidSlug) {
                    sectionId = newsItem.slug;
                  } else if (newsItem._id) {
                    sectionId = String(newsItem._id);
                  } else {
                    return;
                  }
                  
                  // Always use ID (not slug) for cleaner URLs
                  router.push(`/epaper/${epaperId}/page/${page.pageNo}/section/${sectionId}`);
                } else if (onSectionClick) {
                  onSectionClick(newsItem);
                }
              };

              const uniqueKey = newsItem.id !== undefined ? newsItem.id : (newsItem._id ? String(newsItem._id) : `section-${page.pageNo}-${index}`);
              
              return (
                <div
                  key={uniqueKey}
                  onClick={handleClick}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${coords.left}px`,
                    top: `${coords.top}px`,
                    width: `${coords.width}px`,
                    height: `${coords.height}px`,
                    background: 'transparent',
                    pointerEvents: 'auto',
                    border: 'none'
                  }}
                  title="क्लिक करा विभाग पहा"
                />
              );
            })}
          </div>
          
          {/* Page number indicator - only when zoomed */}
          {scale > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
              पृष्ठ {page.pageNo}{(totalPages !== null && totalPages !== undefined && totalPages > 0) ? ` / ${totalPages}` : ''}
            </div>
          )}
          
          {/* Zoom indicator */}
          {scale > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs z-10">
              {Math.round(scale * 100)}%
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop: Original view
  return (
    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-900">
        पृष्ठ {page.pageNo}
      </h3>
      <div ref={containerRef} className="relative inline-block w-full">
        <img
          ref={imgRef}
          src={page.image}
          alt={`Page ${page.pageNo}`}
          className="w-full rounded-lg shadow-md"
        />
        {/* Clickable sections */}
        {page.news && page.news.map((newsItem, index) => {
          const coords = getDisplayCoords(newsItem);
          if (!coords) return null;
          
          const handleClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (epaperId) {
              let sectionId;
              const hasValidSlug = newsItem.slug && 
                                   newsItem.slug.trim() !== '' && 
                                   newsItem.slug.toLowerCase() !== 'untitled';
              
              if (hasValidSlug) {
                sectionId = newsItem.slug;
              } else if (newsItem.id !== undefined && newsItem.id !== null) {
                sectionId = String(newsItem.id);
              } else if (newsItem._id) {
                sectionId = String(newsItem._id);
              } else {
                console.error('Section has no valid identifier:', newsItem);
                return;
              }
              
              // Always use ID (not slug) for cleaner URLs
              router.push(`/epaper/${epaperId}/page/${page.pageNo}/section/${sectionId}`);
            } else if (onSectionClick) {
              onSectionClick(newsItem);
            }
          };

          const uniqueKey = newsItem.id !== undefined ? newsItem.id : (newsItem._id ? String(newsItem._id) : `section-${page.pageNo}-${index}`);
          
          return (
            <div
              key={uniqueKey}
              onClick={handleClick}
              className="absolute cursor-pointer border border-black/20 hover:border-black/40 hover:bg-white/10 transition-all duration-200"
              style={{
                left: `${coords.left}px`,
                top: `${coords.top}px`,
                width: `${coords.width}px`,
                height: `${coords.height}px`,
                background: 'transparent'
              }}
              title="क्लिक करा विभाग पहा"
            />
          );
        })}
      </div>
    </div>
  );
};

export default EPaperPage2;

