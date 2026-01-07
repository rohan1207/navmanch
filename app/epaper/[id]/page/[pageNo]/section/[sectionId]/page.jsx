import { getEpaper } from '@/src/utils/api';
import EPaperSection from '@/src/pages/EPaperSection';
import SubscriptionGuardWrapper from '@/src/components/SubscriptionGuardWrapper';

// Optimize Cloudinary image for instant share cards (vertical format for sections)
function optimizeImageForShare(imgUrl, baseUrl, isCropped = false) {
  if (!imgUrl || imgUrl.trim() === '') {
    return `${baseUrl}/logo1.png`;
  }
  
  let optimized = imgUrl.trim();
  
  // Ensure absolute HTTPS URL
  if (!optimized.startsWith('http')) {
    optimized = optimized.startsWith('/') 
      ? `${baseUrl}${optimized}`
      : `${baseUrl}/logo1.png`;
  }
  if (optimized.startsWith('http://')) {
    optimized = optimized.replace('http://', 'https://');
  }

  // NOTE: We now keep the original Cloudinary URL (no extra transforms)
  // to avoid breaking paths for cropped section images.
  return optimized;
}

// Generate cropped Cloudinary URL from coordinates
function getCroppedImageUrl(pageImage, section, baseUrl) {
  if (!pageImage || !pageImage.includes('cloudinary.com')) {
    return null;
  }
  
  if (section.x === undefined || section.y === undefined || 
      section.width === undefined || section.height === undefined) {
    return null;
  }
  
  try {
    // Preserve full Cloudinary path after /image/upload/
    const match = pageImage.match(/(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(.*)/);
    if (!match) return null;

    const base = match[1];       // up to and including /image/upload/
    const rest = match[2];       // version + folders + public_id
    
    // Crop transformation with optimizations
    const cropTransforms = [
      `c_crop`,
      `w_${Math.round(section.width)}`,
      `h_${Math.round(section.height)}`,
      `x_${Math.round(section.x)}`,
      `y_${Math.round(section.y)}`,
      `q_60`,
      `f_jpg`,
      `fl_progressive`,
      `dpr_1`
    ].join(',');
    
    // Insert transforms before existing path (keeps folders + version)
    const croppedUrl = `${base}${cropTransforms}/${rest}`;
    
    // Further normalize via optimizeImageForShare (HTTPS, absolute)
    return optimizeImageForShare(croppedUrl, baseUrl, true);
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id, pageNo, sectionId } = await params;
  // Use environment variable or fallback - critical for share cards
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
    'https://navmanchnews.com';
  const sectionUrl = `${baseUrl}/epaper/${id}/page/${pageNo}/section/${sectionId}`;
  
  // Always return complete metadata, even on error
  let epaper = null;
  try {
    epaper = await getEpaper(id);
  } catch (error) {
    return {
      metadataBase: new URL(baseUrl),
      title: `Section | नव मंच`,
      description: 'E-Paper Section | नव मंच - मराठी वृत्तपत्र',
      openGraph: {
        type: 'article',
        url: sectionUrl,
        title: `Section | नव मंच`,
        description: 'E-Paper Section | नव मंच - मराठी वृत्तपत्र',
        images: [{ url: `${baseUrl}/logo1.png`, width: 600, height: 800 }],
        siteName: 'नव मंच - Nav Manch',
      },
      alternates: {
        canonical: sectionUrl,
      },
    };
  }
  
  if (!epaper) {
    return {
      metadataBase: new URL(baseUrl),
      title: `Section | नव मंच`,
      description: 'E-Paper Section | नव मंच - मराठी वृत्तपत्र',
      openGraph: {
        type: 'article',
        url: sectionUrl,
        title: `Section | नव मंच`,
        description: 'E-Paper Section | नव मंच - मराठी वृत्तपत्र',
        images: [{ url: `${baseUrl}/logo1.png`, width: 600, height: 800 }],
        siteName: 'नव मंच - Nav Manch',
      },
      alternates: {
        canonical: sectionUrl,
      },
    };
  }

  const page = epaper.pages?.find(p => p.pageNo === parseInt(pageNo));
  const section = (page?.news || page?.newsItems)?.find(
    item => String(item._id) === sectionId || String(item.id) === sectionId
  );

  if (!section || !page) {
    return {
      metadataBase: new URL(baseUrl),
      title: `Section | नव मंच`,
      description: 'E-Paper Section | नव मंच - मराठी वृत्तपत्र',
      openGraph: {
        type: 'article',
        url: sectionUrl,
        title: `Section | नव मंच`,
        description: 'E-Paper Section | नव मंच - मराठी वृत्तपत्र',
        images: [{ url: `${baseUrl}/logo1.png`, width: 600, height: 800 }],
        siteName: 'नव मंच - Nav Manch',
      },
      alternates: {
        canonical: sectionUrl,
      },
    };
  }

  // Get section image - PRIORITY: shareImageUrl → croppedImage → section image → page image → epaper thumbnail
  let imageUrl =
    (section.shareImageUrl && section.shareImageUrl.trim()) ||
    (section.croppedImage && section.croppedImage.trim()) ||
    (section.image && section.image.trim()) ||
    (page?.image && page.image.trim()) ||
    (epaper.thumbnail && epaper.thumbnail.trim()) ||
    '';
  
  // Generate cropped URL from coordinates if available
  if (page?.image && section.x !== undefined && section.y !== undefined && 
      section.width !== undefined && section.height !== undefined) {
    const croppedUrl = getCroppedImageUrl(page.image, section, baseUrl);
    if (croppedUrl) {
      imageUrl = croppedUrl;
    } else {
      imageUrl = page.image;
    }
  }
  
  // Optimize image for instant loading
  let optimizedImage = optimizeImageForShare(imageUrl, baseUrl, !!section.shareImageUrl || !!section.croppedImage);
  
  // CRITICAL: Ensure image URL is absolute HTTPS and accessible
  if (!optimizedImage.startsWith('http')) {
    optimizedImage = optimizedImage.startsWith('/') 
      ? `${baseUrl}${optimizedImage}`
      : `${baseUrl}/logo1.png`;
  }
  if (optimizedImage.startsWith('http://')) {
    optimizedImage = optimizedImage.replace('http://', 'https://');
  }

  // DEBUG: Log image URLs for epaper section metadata
  console.log('[SECTION METADATA] Epaper ID:', id, 'Page:', pageNo, 'Section:', sectionId);
  console.log('[SECTION METADATA] Original imageUrl:', imageUrl);
  console.log('[SECTION METADATA] OptimizedImage:', optimizedImage);
  console.log('[SECTION METADATA] Base URL:', baseUrl);

  // Clean epaper title
  let epaperTitle = epaper.title || 'नव मंच';
  epaperTitle = epaperTitle
    .replace(/\s*-\s*\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/gi, '')
    .replace(/\s*-\s*\d{1,2}\/\d{1,2}\/\d{4}/g, '')
    .trim();

  const epaperDate = epaper.date ? new Date(epaper.date).toLocaleDateString('mr-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  const sectionTitle = section.title || 'बातमी विभाग';
  const title = `${sectionTitle} - ${epaperTitle}`;
  const description = `${sectionTitle} | ${epaperTitle}${epaperDate ? ` - ${epaperDate}` : ''} | नव मंच - मराठी वृत्तपत्र`;

  return {
    metadataBase: new URL(baseUrl),
    title: `${title} | नव मंच`,
    description: description,
    openGraph: {
      type: 'article',
      url: sectionUrl,
      title: title,
      description: description,
      images: [
        {
          url: optimizedImage,
          width: 600,
          height: 800,
          alt: sectionTitle,
          secureUrl: optimizedImage,
          type: 'image/jpeg',
        },
      ],
      siteName: 'नव मंच - Nav Manch',
      locale: 'mr_IN',
      publishedTime: epaper.date ? new Date(epaper.date).toISOString() : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [optimizedImage],
    },
    alternates: {
      canonical: sectionUrl,
    },
    // CRITICAL: Add explicit meta tags for WhatsApp compatibility
    other: {
      'og:image:secure_url': optimizedImage,
      'og:image:width': '600',
      'og:image:height': '800',
      'og:image:type': 'image/jpeg',
    },
  };
}

export default async function EpaperSectionPage({ params }) {
  return (
    <SubscriptionGuardWrapper requireSubscription={true} showBanner={true}>
      <EPaperSection />
    </SubscriptionGuardWrapper>
  );
}
