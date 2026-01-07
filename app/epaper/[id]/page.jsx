import { getEpaper } from '@/src/utils/api';
import EPaperViewer from '@/src/pages/EPaperViewer';
import SubscriptionGuardWrapper from '@/src/components/SubscriptionGuardWrapper';

// Optimize Cloudinary image for instant share cards (vertical format)
function optimizeImageForShare(imgUrl, baseUrl) {
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
  
  // Apply ultra-fast Cloudinary optimizations for vertical cards (600x800)
  if (optimized.includes('cloudinary.com') && optimized.includes('/image/upload/')) {
    const match = optimized.match(/(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(.*)/);
    if (match) {
      const base = match[1];
      const rest = match[2];
      
      const segments = rest.split('/');
      let publicId = segments[segments.length - 1];
      let version = '';
      if (segments.length >= 2 && segments[segments.length - 2].match(/^v\d+$/)) {
        version = segments[segments.length - 2];
        publicId = segments[segments.length - 1];
      }
      
      // Ultra-fast optimizations: 600x800 (vertical), JPEG, quality 60, progressive, dpr_1, auto gravity
      const transforms = 'w_600,h_800,c_fill,g_auto,q_60,f_jpg,fl_progressive,dpr_1';
      optimized = version
        ? `${base}${transforms}/${version}/${publicId}`
        : `${base}${transforms}/${publicId}`;
    }
  }
  
  return optimized;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  // Use environment variable or fallback - critical for share cards
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
    'https://navmanchnews.com';
  const epaperUrl = `${baseUrl}/epaper/${id}`;
  
  // Always return complete metadata, even on error
  let epaper = null;
  try {
    epaper = await getEpaper(id);
  } catch (error) {
    // Return fallback metadata
    return {
      metadataBase: new URL(baseUrl),
      title: `E-Paper | नव मंच`,
      description: 'E-Paper | नव मंच - मराठी वृत्तपत्र',
      openGraph: {
        type: 'article',
        url: epaperUrl,
        title: `E-Paper | नव मंच`,
        description: 'E-Paper | नव मंच - मराठी वृत्तपत्र',
        images: [{ url: `${baseUrl}/logo1.png`, width: 600, height: 800 }],
        siteName: 'नव मंच - Nav Manch',
      },
      alternates: {
        canonical: epaperUrl,
      },
    };
  }
  
  if (!epaper) {
    return {
      metadataBase: new URL(baseUrl),
      title: `E-Paper | नव मंच`,
      description: 'E-Paper | नव मंच - मराठी वृत्तपत्र',
      openGraph: {
        type: 'article',
        url: epaperUrl,
        title: `E-Paper | नव मंच`,
        description: 'E-Paper | नव मंच - मराठी वृत्तपत्र',
        images: [{ url: `${baseUrl}/logo1.png`, width: 600, height: 800 }],
        siteName: 'नव मंच - Nav Manch',
      },
      alternates: {
        canonical: epaperUrl,
      },
    };
  }

  // Get first page image
  const imageUrl = epaper.pages?.[0]?.image || epaper.thumbnail;
  
  // Optimize image for instant loading
  let optimizedImage = optimizeImageForShare(imageUrl, baseUrl);
  
  // CRITICAL: Ensure image URL is absolute HTTPS and accessible
  if (!optimizedImage.startsWith('http')) {
    optimizedImage = optimizedImage.startsWith('/') 
      ? `${baseUrl}${optimizedImage}`
      : `${baseUrl}/logo1.png`;
  }
  if (optimizedImage.startsWith('http://')) {
    optimizedImage = optimizedImage.replace('http://', 'https://');
  }

  // Clean title
  let epaperTitle = epaper.title || 'नव मंच';
  epaperTitle = epaperTitle
    .replace(/\s*-\s*\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/gi, '')
    .replace(/\s*-\s*\d{1,2}\/\d{1,2}\/\d{4}/g, '')
    .replace(/\s*-\s*\d{4}-\d{2}-\d{2}/g, '')
    .trim();

  // Format date
  const epaperDate = epaper.date ? new Date(epaper.date).toLocaleDateString('mr-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  // Use actual ID from epaper
  const epaperId = epaper.id || epaper._id || id;
  const finalEpaperUrl = `${baseUrl}/epaper/${epaperId}`;
  const description = `${epaperTitle}${epaperDate ? ` - ${epaperDate}` : ''} | नव मंच - मराठी वृत्तपत्र`;

  return {
    metadataBase: new URL(baseUrl),
    title: `${epaperTitle} | नव मंच`,
    description: description,
    openGraph: {
      type: 'article',
      url: finalEpaperUrl,
      title: epaperTitle,
      description: description,
      images: [
        {
          url: optimizedImage,
          width: 600,
          height: 800,
          alt: epaperTitle,
        },
      ],
      siteName: 'नव मंच - Nav Manch',
      locale: 'mr_IN',
      publishedTime: epaper.date ? new Date(epaper.date).toISOString() : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: epaperTitle,
      description: description,
      images: [optimizedImage],
    },
    alternates: {
      canonical: finalEpaperUrl,
    },
  };
}

export default async function EpaperDetailPage({ params }) {
  return (
    <SubscriptionGuardWrapper requireSubscription={true} showBanner={true}>
      <EPaperViewer />
    </SubscriptionGuardWrapper>
  );
}
