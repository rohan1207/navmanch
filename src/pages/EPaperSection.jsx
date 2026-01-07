'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';
import { getEpapers } from '../utils/api';
import ShareButtons from '../components/ShareButtons';
import SEO from '../components/SEO';
import { isSubscribed } from '../utils/subscription';
import SubscribePopup from '../components/SubscribePopup';

// Mobile zoomable image component for sections
const SectionZoomableImage = ({ imageUrl, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const lastTapRef = useRef(0);
  const tapTimeoutRef = useRef(null);
  
  // Prevent body scroll on mobile
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const getDistance = (touch1, touch2) => {
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        // Pinch zoom - prevent default to allow zoom
        e.preventDefault();
        e.stopPropagation();
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        initialScale = scale;
      } else if (e.touches.length === 1 && scale > 1) {
        // Pan when zoomed - prevent default to allow pan
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        });
      }
      // If scale is 1, allow normal scrolling (don't prevent default)
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        // Pinch zoom - prevent default
        e.preventDefault();
        e.stopPropagation();
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const newScale = Math.max(1, Math.min(5, (currentDistance / initialDistance) * initialScale));
        setScale(newScale);
      } else if (e.touches.length === 1 && isDragging && scale > 1) {
        // Pan when zoomed - prevent default
        e.preventDefault();
        e.stopPropagation();
        const newX = e.touches[0].clientX - dragStart.x;
        const newY = e.touches[0].clientY - dragStart.y;
        
        const maxX = (scale - 1) * (container.offsetWidth / 2);
        const maxY = (scale - 1) * (container.offsetHeight / 2);
        
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY))
        });
      }
      // If scale is 1 and not dragging, allow normal scroll (don't prevent default)
    };


    const handleTouchEndWithDoubleTap = (e) => {
      e.stopPropagation();
      setIsDragging(false);

      // Handle double tap
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapRef.current;
      
      if (tapLength < 300 && tapLength > 0) {
        // Double tap detected
        e.preventDefault();
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        // Toggle zoom: 1x -> 2x, 2x -> 1x
        setScale(prevScale => {
          if (prevScale === 1) {
            return 2;
        } else {
          setPosition({ x: 0, y: 0 });
            return 1;
        }
        });
        // Reset lastTap to current time minus 400ms so next tap starts fresh
        // This prevents immediate triple tap but allows new double tap sequence
        lastTapRef.current = currentTime - 400;
      } else {
        // Single tap - wait to see if it's a double tap
        lastTapRef.current = currentTime;
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = setTimeout(() => {
          // Single tap confirmed after delay - do nothing for single tap
          // Only reset if scale is invalid
          setScale(prevScale => prevScale < 1 ? 1 : prevScale);
        }, 300);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEndWithDoubleTap, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEndWithDoubleTap);
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, [scale, position, isDragging, dragStart]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-full bg-cleanWhite"
      style={{
        touchAction: 'pan-y pinch-zoom',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        padding: 0
      }}
    >
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'top center',
          transition: scale === 1 ? 'transform 0.3s ease-out' : 'none',
          width: '100%',
          minHeight: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 0
        }}
      >
        <img
          src={imageUrl}
          alt={alt}
          style={{
            width: '100%',
            height: 'auto',
            maxWidth: '100%',
            display: 'block',
            objectFit: 'contain',
            pointerEvents: scale > 1 ? 'auto' : 'none',
            imageRendering: 'crisp-edges',
            WebkitUserDrag: 'none',
            userDrag: 'none'
          }}
          onError={(e) => {
            console.error('Error loading section image:', imageUrl);
          }}
        />
      </div>
      
      {/* Zoom indicator */}
      {scale > 1 && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs z-10">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
};

const EPaperSection = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id;
  const pageNo = params?.pageNo;
  const sectionId = params?.sectionId;
  const [epaper, setEpaper] = useState(null);
  const [page, setPage] = useState(null);
  const [section, setSection] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showSubscribePopup, setShowSubscribePopup] = useState(false);
  
  // Check if it's a shared link
  const isSharedLink = searchParams?.toString().includes('shared=true');

  // Track window size for responsive image sizing
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check subscription on load (unless shared link)
  useEffect(() => {
    if (!isSharedLink && !isSubscribed()) {
      setShowSubscribePopup(true);
    }
  }, [isSharedLink]);

  // Listen for subscription updates
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      if (isSubscribed()) {
        setShowSubscribePopup(false);
      }
    };
    
    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, []);

  // Prevent body scroll on mobile when viewing section
  useEffect(() => {
    const isMobileCheck = window.innerWidth < 768;
    if (isMobileCheck) {
      document.body.style.overflow = 'hidden';
      // Prevent whole page zoom
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }
    return () => {
      document.body.style.overflow = '';
      // Restore viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const epapers = await getEpapers();
        if (!epapers || epapers.length === 0) {
          console.log('No epapers found');
          setLoading(false);
          setTimeout(() => router.push('/epaper'), 500);
          return;
        }
        
        // Try to find epaper by slug first, then by id
        const found = epapers.find(ep => {
          const epSlug = ep.slug;
          const epId = ep.id !== undefined ? ep.id : ep._id;
          
          // Match by slug first
          if (epSlug && epSlug === id) return true;
          
          // Then match by ID
          if (epId !== undefined && epId !== null) {
            const epIdStr = String(epId);
            const searchIdStr = String(id);
            return epIdStr === searchIdStr;
          }
          
          return false;
        });
        
        if (!found) {
          console.log('❌ Epaper not found for id:', id);
          console.log('Available epaper IDs:', epapers.map(ep => ({ id: ep.id, _id: ep._id, title: ep.title })));
          setLoading(false);
          setTimeout(() => router.push('/epaper'), 500);
          return;
        }
        console.log('✅ Found epaper:', found.title);
        setEpaper(found);

        const foundPage = found.pages?.find(p => {
          const pNo = parseInt(pageNo);
          return p.pageNo === pNo;
        });
        if (!foundPage) {
          console.log('❌ Page not found:', pageNo);
          setLoading(false);
          setTimeout(() => router.push(`/epaper/${id}`), 500);
          return;
        }
        console.log('✅ Found page:', foundPage.pageNo);
        setPage(foundPage);

        // Log all available sections for debugging
        console.log('🔍 Looking for section:', sectionId);
        console.log('📋 Available sections:', foundPage.news?.map(n => ({
          slug: n.slug,
          id: n.id,
          _id: n._id ? String(n._id) : null,
          title: n.title
        })));

        // Find section by ID first (most reliable), then by slug, then by _id
        // IMPORTANT: Check ID first because slugs like "Untitled" are not unique
        const foundSection = foundPage.news?.find(n => {
          const nSlug = n.slug;
          const nId = n.id !== undefined ? n.id : null;
          const n_id = n._id ? String(n._id) : null;
          const sId = sectionId;
          
          // Match by ID first (most reliable - always unique)
          if (nId !== undefined && nId !== null) {
            const match = String(nId) === String(sId) || nId === parseInt(sId) || nId === sId;
            if (match) {
              console.log('✅ Matched by id:', nId, '===', sId);
              return true;
            }
          }
          
          // Then match by _id (MongoDB ObjectId) - also unique
          if (n_id) {
            const match = n_id === String(sId) || String(n_id) === String(sId);
            if (match) {
              console.log('✅ Matched by _id:', n_id, '===', sId);
              return true;
            }
          }
          
          // Finally match by slug (only if it's meaningful and unique)
          // Skip if slug is "Untitled" or empty - those are not unique
          if (nSlug && nSlug.trim() !== '' && nSlug.toLowerCase() !== 'untitled' && nSlug === sId) {
            console.log('✅ Matched by slug:', nSlug, '===', sId);
            return true;
          }
          
          return false;
        });
        if (!foundSection) {
          console.log('❌ Section not found:', sectionId);
          console.log('Available sections:', foundPage.news?.map(n => ({ id: n.id, title: n.title })));
          setLoading(false);
          setTimeout(() => router.push(`/epaper/${id}`), 500);
          return;
        }
        console.log('✅ Found section:', foundSection.id);
        setSection(foundSection);

        // Generate cropped image URL
        const croppedUrl = getCroppedImageUrl(foundPage.image, foundSection);
        setCroppedImageUrl(croppedUrl);
        setLoading(false);
      } catch (error) {
        console.error('Error loading section:', error);
        setLoading(false);
        setTimeout(() => router.push('/epaper'), 500);
      }
    };
    
    if (id && pageNo && sectionId) {
      loadData();
    } else {
      router.push('/epaper');
    }
  }, [id, pageNo, sectionId, router]);

  // Helper to generate cropped Cloudinary URL
  const getCroppedImageUrl = (pageImageUrl, newsItem) => {
    if (!pageImageUrl || !newsItem) return pageImageUrl;
    
    if (!pageImageUrl.includes('cloudinary.com')) {
      return pageImageUrl;
    }
    
    try {
      const uploadIndex = pageImageUrl.indexOf('/image/upload/');
      if (uploadIndex === -1) return pageImageUrl;
      
      const baseUrl = pageImageUrl.substring(0, uploadIndex + '/image/upload'.length);
      const afterUpload = pageImageUrl.substring(uploadIndex + '/image/upload/'.length);
      
      const transformations = [
        `c_crop`,
        `w_${Math.round(newsItem.width)}`,
        `h_${Math.round(newsItem.height)}`,
        `x_${Math.round(newsItem.x)}`,
        `y_${Math.round(newsItem.y)}`,
        `q_auto:best`,
        `f_auto`
      ].join(',');
      
      return `${baseUrl}/${transformations}/${afterUpload}`;
    } catch (error) {
      console.error('Error generating cropped URL:', error);
      return pageImageUrl;
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('mr-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date for footer (1/01/2026 format)
  const formatDateForFooter = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format date for footer (Jan 08,2026 format)
  const formatDateForFooterNew = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day},${year}`;
  };

  // Use current origin for sharing; backend social preview ensures OG tags
  // When custom domain points here, origin will be https://navmanchnews.com
  const frontendBase = typeof window !== 'undefined' ? window.location.origin : 'https://navmanchnews.com';
  
  // Build clean URL with IDs
  let epaperIdentifier;
  if (epaper) {
    // Use ID for e-paper (cleaner than encoded slug)
    if (epaper.id !== undefined && epaper.id !== null) {
      epaperIdentifier = String(epaper.id);
    } else if (epaper._id) {
      epaperIdentifier = String(epaper._id);
    } else {
      epaperIdentifier = id; // Fallback
    }
  } else {
    epaperIdentifier = id;
  }
  
  let sectionIdentifier;
  if (section) {
    // Always use ID for sections (never "Untitled" slug)
    if (section.id !== undefined && section.id !== null) {
      sectionIdentifier = String(section.id);
    } else if (section._id) {
      sectionIdentifier = String(section._id);
    } else {
      sectionIdentifier = sectionId; // Fallback
    }
  } else {
    sectionIdentifier = sectionId;
  }
  
  const shareUrl = `${frontendBase}/epaper/${epaperIdentifier}/page/${page?.pageNo || '1'}/section/${sectionIdentifier}${typeof window !== 'undefined' ? window.location.search : ''}`;
  
  // Clean title - remove "Untitled" and empty titles
  const getCleanSectionTitle = () => {
    if (!section || !section.title) return 'बातमी विभाग';
    const title = section.title.trim();
    if (title === '' || title.toLowerCase() === 'untitled') {
      return 'बातमी विभाग';
    }
    return title;
  };
  
  const getCleanEpaperTitle = () => {
    if (!epaper || !epaper.title) return 'ई-पेपर';
    const title = epaper.title.trim();
    if (title === '' || title.toLowerCase() === 'untitled') {
      return 'ई-पेपर';
    }
    return title;
  };
  
  // Clean section title - remove "Untitled"
  const getShareSectionTitle = () => {
    if (!section || !section.title) return 'बातमी विभाग';
    const title = section.title.trim();
    if (title === '' || title.toLowerCase() === 'untitled') {
      return 'बातमी विभाग';
    }
    return title;
  };
  
  const shareTitle = epaper && section 
    ? `${getShareSectionTitle()} - ${getCleanEpaperTitle()}`
    : 'नव मंच ई-पेपर';
  
  // Description without date duplication - backend OG tags handle the preview card
  const shareDescription = epaper && section
    ? `${getCleanEpaperTitle()} - पृष्ठ ${page.pageNo}`
    : 'नव मंच ई-पेपर';
  
  // Ensure image URL is absolute for proper preview cards
  const getAbsoluteImageUrl = (imgUrl) => {
    if (!imgUrl) return '';
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      return imgUrl;
    }
    return `${window.location.origin}${imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`}`;
  };
  
  // Use full page image for section share cards (more reliable than cropped section)
  const shareImage = getAbsoluteImageUrl(page?.image || epaper?.thumbnail || '');

  // Download section image with logo on top
  const downloadSectionWithLogo = async (sectionImageUrl, sectionTitle) => {
    // Check subscription before allowing download
    if (!isSharedLink && !isSubscribed()) {
      setShowSubscribePopup(true);
      return;
    }
    
    try {
      // Load section image
      const sectionImg = new Image();
      sectionImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        sectionImg.onload = resolve;
        sectionImg.onerror = reject;
        sectionImg.src = sectionImageUrl;
      });

      // Load logo
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = () => {
          console.warn('Logo failed to load, using watermark approach');
          resolve(); // Continue even if logo fails
        };
        logoImg.src = '/logo1.png';
      });

      // Create canvas - extend from top to place logo above clip
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate logo dimensions
      let logoHeight = 0;
      let logoWidth = 0;
      let logoAreaHeight = 0;
      const lineHeight = 2; // Height of the line below logo (2px)
      const linePadding = 8; // Padding above and below the line
      
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        // Logo size: 22% of section width or max 180px height (increased for better visibility)
        logoHeight = Math.min(sectionImg.width * 0.22, 180);
        const logoAspectRatio = logoImg.width / logoImg.height;
        logoWidth = logoHeight * logoAspectRatio;
        // Logo height + top padding (20px) + bottom padding (8px) + line (2px) + line bottom padding (8px)
        logoAreaHeight = logoHeight + 20 + linePadding + lineHeight + linePadding;
      } else {
        // If logo fails to load, use watermark approach
        logoAreaHeight = 0;
      }

      // Calculate footer dimensions
      const footerPadding = 20; // Top and bottom padding
      const footerLineHeight = 18; // Line height for text
      const footerFontSize = Math.max(11, Math.min(sectionImg.width * 0.018, 14)); // Responsive font size
      const footerLineSpacing = 4; // Spacing between lines
      
      // Prepare footer text
      const editionText = 'Pune Edition';
      const dateText = formatDateForFooterNew(epaper?.date || '');
      const pageText = `page No ${page?.pageNo || ''}`;
      const poweredByText = 'Powered by -navmanchnews.com';
      
      // Calculate footer height
      // Line before footer (2px) + padding (8px) + 3 lines of text + spacing + padding
      const footerLineHeight_px = 2; // Height of the line before footer
      const footerLinePadding = 8; // Padding above line
      const footerHeight = footerLineHeight_px + footerLinePadding + (footerLineHeight * 3) + (footerLineSpacing * 2) + (footerPadding * 2);

      // Set canvas size: section width, extended height (section + logo area + footer)
      canvas.width = sectionImg.width;
      canvas.height = sectionImg.height + logoAreaHeight + footerHeight;

      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw section image below logo area
      ctx.drawImage(sectionImg, 0, logoAreaHeight);

      // Draw line before footer
      const footerLineY = sectionImg.height + logoAreaHeight + footerLinePadding;
      ctx.fillStyle = '#000000'; // Black
      ctx.fillRect(0, footerLineY, canvas.width, 2);
      
      // Draw footer at the bottom
      const footerY = footerLineY + footerLinePadding + footerPadding;
      
      // Set font properties - Use system fonts that support Devanagari
      ctx.font = `${footerFontSize}px 'Mukta', 'Noto Sans Devanagari', 'Tiro Devanagari Hindi', 'Hind', Arial, sans-serif`;
      ctx.fillStyle = '#666666'; // Gray color for metadata
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Draw edition text (first line)
      ctx.fillStyle = '#666666';
      ctx.font = `bold ${footerFontSize}px 'Mukta', 'Noto Sans Devanagari', Arial, sans-serif`;
      ctx.fillText(editionText, canvas.width / 2, footerY);
      
      // Draw date and page number (second line)
      const secondLineY = footerY + footerLineHeight + footerLineSpacing;
      ctx.fillStyle = '#666666';
      ctx.font = `${footerFontSize}px 'Mukta', 'Noto Sans Devanagari', Arial, sans-serif`;
      const datePageText = `${dateText}  ${pageText}`;
      ctx.fillText(datePageText, canvas.width / 2, secondLineY);
      
      // Draw powered by text (third line)
      const thirdLineY = secondLineY + footerLineHeight + footerLineSpacing;
      ctx.fillStyle = '#666666';
      ctx.font = `${footerFontSize}px 'Mukta', 'Noto Sans Devanagari', Arial, sans-serif`;
      ctx.fillText(poweredByText, canvas.width / 2, thirdLineY);

      // Draw logo above the clip (centered)
      if (logoImg.complete && logoImg.naturalWidth > 0 && logoAreaHeight > 0) {
        const logoX = (canvas.width - logoWidth) / 2;
        const logoY = 20; // 20px from top
        
        // Draw logo
        ctx.drawImage(
          logoImg,
          logoX,
          logoY,
          logoWidth,
          logoHeight
        );
        
        // Draw minimal bold black line below logo
        const lineY = logoY + logoHeight + linePadding;
        ctx.fillStyle = '#000000'; // Black
        ctx.fillRect(0, lineY, canvas.width, lineHeight);
      } else if (logoImg.complete && logoImg.naturalWidth > 0) {
        // Fallback: Watermark approach - spread logo with low opacity
        const watermarkSize = Math.min(sectionImg.width * 0.3, 200);
        const watermarkAspectRatio = logoImg.width / logoImg.height;
        const watermarkWidth = watermarkSize * watermarkAspectRatio;
        const watermarkHeight = watermarkSize;
        
        // Save context for opacity
        ctx.save();
        ctx.globalAlpha = 0.15; // Low opacity for watermark effect
        
        // Draw watermark in center
        ctx.drawImage(
          logoImg,
          (sectionImg.width - watermarkWidth) / 2,
          (sectionImg.height - watermarkHeight) / 2,
          watermarkWidth,
          watermarkHeight
        );
        
        ctx.restore();
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${sectionTitle || 'section'}-navmanch-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading section:', error);
      alert('डाउनलोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    }
  };

  if (loading || !epaper || !page || !section) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsRed mx-auto mb-4"></div>
          <p className="text-metaGray">विभाग लोड होत आहे...</p>
        </div>
      </div>
    );
  }

  // Calculate optimal display size based on section dimensions (for desktop only)
  const sectionAspectRatio = section.width / section.height;
  
  // Desktop: scale up but limit
  const maxWidth = Math.min(1200, section.width * 2);
  const maxHeight = Math.min(1600, section.height * 2);
  
  // Maintain aspect ratio for desktop
  let displayWidth = maxWidth;
  let displayHeight = maxWidth / sectionAspectRatio;
  
  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = maxHeight * sectionAspectRatio;
  }

  return (
    <>
      <SEO 
        title={shareTitle}
        description={shareDescription}
        image={shareImage}
        url={shareUrl}
        type="article"
      />
      <div className="min-h-screen bg-subtleGray">
        {/* Desktop Header */}
        <div className="hidden md:block bg-cleanWhite border-b-2 border-subtleGray py-3 sm:py-4 sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/epaper/${id}`}
                className="flex items-center gap-1.5 sm:gap-2 text-metaGray hover:text-deepCharcoal transition-colors font-semibold text-sm sm:text-base"
              >
                <FaArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>मागे जा</span>
              </Link>
              <ShareButtons
                title={shareTitle}
                description={shareDescription}
                image={shareImage}
                url={shareUrl}
              />
            </div>
          </div>
        </div>

        {/* Mobile Header - Minimal - Fixed at top */}
        <div className="md:hidden bg-cleanWhite border-b border-subtleGray py-2 fixed top-0 left-0 right-0 z-50 shadow-sm">
          <div className="container mx-auto px-3">
            <div className="flex items-center justify-between">
              <Link
                href={`/epaper/${id}`}
                className="flex items-center gap-2 text-deepCharcoal hover:text-newsRed transition-colors font-semibold text-sm"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>मागे</span>
              </Link>
              <ShareButtons
                title={shareTitle}
                description={shareDescription}
                image={shareImage}
                url={shareUrl}
              />
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          {/* Desktop: Full layout with logo and footer */}
          <div className="hidden md:block">
            {/* Image Container with Logo Above - Adapts to image width */}
            <div className="bg-cleanWhite overflow-hidden rounded-t-xl flex flex-col items-center">
              {croppedImageUrl ? (
                <div className="flex flex-col items-center w-full">
                  {/* Logo - Positioned directly above image with minimal gap, matches image width */}
                  <div className="flex flex-col items-center w-full" style={{ width: `${displayWidth}px`, maxWidth: '100%' }}>
                    <div className="flex items-center justify-center pt-2 pb-0">
                    <img
                      src="/logo1.png"
                      alt="नव मंच"
                      className="h-32 md:h-40 w-auto"
                    />
                    </div>
                    {/* Minimal bold black line below logo */}
                    <div className="w-full h-0.5 bg-black my-2" style={{ maxWidth: `${displayWidth}px` }}></div>
                  </div>
                  
                  {/* Cropped Image */}
                  <div className="flex items-center justify-center pt-1 px-2">
                    <img
                      src={croppedImageUrl}
                      alt={getCleanSectionTitle()}
                      className="w-full h-auto max-w-full object-contain md:w-auto md:max-w-none"
                      style={{ 
                        imageRendering: 'crisp-edges',
                        display: 'block',
                        maxWidth: `${displayWidth}px`,
                        maxHeight: `${displayHeight}px`
                      }}
                      onError={(e) => {
                        console.error('Error loading cropped image:', croppedImageUrl);
                        e.target.src = page.image;
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center text-metaGray py-8 sm:py-12">
                  <p className="text-sm sm:text-base">छवी लोड होत आहे...</p>
                </div>
              )}
            </div>
            
            {/* Download Button and Footer Section - Inside clip container */}
            <div className="bg-cleanWhite rounded-b-xl pt-4 pb-6">
              {/* Download Button */}
              <div className="flex items-center justify-center py-4">
                <button
                  onClick={() => downloadSectionWithLogo(croppedImageUrl || page.image, getCleanSectionTitle())}
                  className="flex items-center gap-2 px-5 py-2.5 bg-newsRed text-white rounded-full font-semibold hover:bg-newsRed/90 transition-colors shadow-md hover:shadow-lg"
                >
                  <FaDownload className="w-4 h-4" />
                  <span className="text-sm">क्लिप डाउनलोड करा</span>
                </button>
              </div>
              
              {/* Line before footer */}
              <div className="w-full h-0.5 bg-black my-4"></div>
              
              {/* Footer Section - Metadata */}
              <div className="bg-gradient-to-b from-subtleGray/10 to-cleanWhite pt-2 pb-4">
                {/* Footer text - 3 lines */}
                <div className="text-center space-y-1 text-xs md:text-sm text-metaGray">
                  <div className="font-medium">Pune Edition</div>
                  <div>{formatDateForFooterNew(epaper.date)}  page No {page.pageNo}</div>
                  <div>Powered by -navmanchnews.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Full screen scrollable view with fixed header and footer */}
          <div className="md:hidden fixed inset-0 bg-cleanWhite flex flex-col" style={{ top: '48px', bottom: 0, height: 'calc(100vh - 48px)' }}>
            {/* Logo - Fixed at top, minimal padding */}
            <div className="flex-shrink-0 bg-cleanWhite border-b border-subtleGray/30 py-2 px-0 flex flex-col items-center">
                <img
                  src="/logo1.png"
                  alt="नव मंच"
                  className="h-28 w-auto"
                />
              {/* Minimal bold black line below logo */}
              <div className="w-full h-0.5 bg-black mt-2"></div>
              </div>
              
            {/* Scrollable Image Container - Full width, scrollable, shows top initially */}
            {croppedImageUrl && (
              <div 
                className="flex-1 overflow-y-auto overflow-x-hidden bg-cleanWhite relative" 
                style={{ 
                  minHeight: 0,
                  touchAction: 'pan-y pinch-zoom',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <SectionZoomableImage 
                  imageUrl={croppedImageUrl || page.image}
                  alt={getCleanSectionTitle()}
                />
              </div>
            )}
            
            {/* Footer Section - Fixed at bottom, minimal padding */}
            <div className="flex-shrink-0 bg-cleanWhite border-t border-subtleGray/30">
              {/* Download Button */}
              <div className="flex items-center justify-center py-2.5 px-4">
              <button
                onClick={() => downloadSectionWithLogo(croppedImageUrl || page.image, getCleanSectionTitle())}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-newsRed text-white rounded-full font-semibold hover:bg-newsRed/90 transition-colors shadow-lg"
                  style={{ touchAction: 'auto' }}
              >
                  <FaDownload className="w-4 h-4" />
                  <span className="text-sm">क्लिप डाउनलोड करा</span>
              </button>
              </div>
              
              {/* Line before footer */}
              <div className="w-full h-0.5 bg-black mx-4"></div>
              
              {/* Footer Metadata - Compact */}
              <div className="bg-gradient-to-b from-subtleGray/10 to-cleanWhite pt-2.5 pb-3 px-4">
                {/* Footer text - 3 lines */}
                <div className="text-center space-y-1 text-xs text-metaGray">
                  <div className="font-medium">Pune Edition</div>
                  <div>{formatDateForFooterNew(epaper.date)}  page No {page.pageNo}</div>
                  <div>Powered by -navmanchnews.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      {/* Subscribe Popup */}
      <SubscribePopup 
        isOpen={showSubscribePopup} 
        onClose={() => setShowSubscribePopup(false)}
        allowClose={false} // Don't allow close - user must subscribe
      />
    </>
  );
};

export default EPaperSection;
