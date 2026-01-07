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
  
  // Apply ultra-fast Cloudinary optimizations
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
      
      // For cropped sections, keep crop but optimize size/quality
      // For regular images, use vertical format (600x800)
      const transforms = isCropped && optimized.includes('c_crop')
        ? 'w_600,h_800,q_60,f_jpg,fl_progressive,dpr_1' // Keep existing crop, just optimize
        : 'w_600,h_800,c_fill,g_auto,q_60,f_jpg,fl_progressive,dpr_1'; // Full vertical format
      
      optimized = version
        ? `${base}${transforms}/${version}/${publicId}`
        : `${base}${transforms}/${publicId}`;
    }
  }
  
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
    const cloudNameMatch = pageImage.match(/res\.cloudinary\.com\/([^\/]+)/);
    const uploadIndex = pageImage.indexOf('/image/upload/');
    
    if (!cloudNameMatch || uploadIndex === -1) return null;
    
    const cloudName = cloudNameMatch[1];
    const afterUpload = pageImage.substring(uploadIndex + '/image/upload/'.length);
    const segments = afterUpload.split('/');
    let publicId = segments[segments.length - 1];
    let version = '';
    
    if (segments.length >= 2 && segments[segments.length - 2].match(/^v\d+$/)) {
      version = segments[segments.length - 2];
    }
    
    // Crop transformation with ultra-fast optimizations
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
    
    const croppedUrl = version
      ? `https://res.cloudinary.com/${cloudName}/image/upload/${cropTransforms}/${version}/${publicId}`
      : `https://res.cloudinary.com/${cloudName}/image/upload/${cropTransforms}/${publicId}`;
    
    // Further optimize the cropped image
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

  // Get section image - use cropped if coordinates available, otherwise use existing croppedImage or page image
  let imageUrl = section.croppedImage || section.image;
  
  // Generate cropped URL from coordinates if available
  if (page?.image && section.x !== undefined && section.y !== undefined && 
      section.width !== undefined && section.height !== undefined) {
    const croppedUrl = getCroppedImageUrl(page.image, section, baseUrl);
    if (croppedUrl) {
      imageUrl = croppedUrl;
    } else {
      imageUrl = page.image;
    }
  } else if (!imageUrl) {
    imageUrl = page?.image || epaper.thumbnail;
  }
  
  // Optimize image for instant loading
  let optimizedImage = optimizeImageForShare(imageUrl, baseUrl, !!section.croppedImage);
  
  // CRITICAL: Ensure image URL is absolute HTTPS and accessible
  if (!optimizedImage.startsWith('http')) {
    optimizedImage = optimizedImage.startsWith('/') 
      ? `${baseUrl}${optimizedImage}`
      : `${baseUrl}/logo1.png`;
  }
  if (optimizedImage.startsWith('http://')) {
    optimizedImage = optimizedImage.replace('http://', 'https://');
  }

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
  };
}

export default async function EpaperSectionPage({ params }) {
  return (
    <SubscriptionGuardWrapper requireSubscription={true} showBanner={true}>
      <EPaperSection />
    </SubscriptionGuardWrapper>
  );
}
