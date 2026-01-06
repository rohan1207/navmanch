import { getEpaper } from '@/src/utils/api';
import EPaperSection from '@/src/pages/EPaperSection';
import SubscriptionGuardWrapper from '@/src/components/SubscriptionGuardWrapper';

export async function generateMetadata({ params }) {
  const { id, pageNo, sectionId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://navmanchnews.com';
  const sectionUrl = `${baseUrl}/epaper/${id}/page/${pageNo}/section/${sectionId}`;
  
  // CRITICAL: Always return complete metadata, even on error
  // Increase timeout for Vercel (10 seconds)
  let epaper = null;
  try {
    // Use Promise.race to timeout after 10 seconds (increased for Vercel)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), 10000)
    );
    epaper = await Promise.race([getEpaper(id), timeoutPromise]);
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
        images: [`${baseUrl}/logo1.png`],
        siteName: 'नव मंच - Nav Manch',
      },
      alternates: {
        canonical: sectionUrl,
      },
      other: {
        'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID || '',
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
        images: [`${baseUrl}/logo1.png`],
        siteName: 'नव मंच - Nav Manch',
      },
      alternates: {
        canonical: sectionUrl,
      },
      other: {
        'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID || '',
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
        images: [`${baseUrl}/logo1.png`],
        siteName: 'नव मंच - Nav Manch',
      },
      alternates: {
        canonical: sectionUrl,
      },
      other: {
        'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID || '',
      },
    };
  }

    // Get section image - use cropped if available, otherwise page image
    let imageUrl = section.croppedImage || section.image || page?.image || epaper.thumbnail;
    
    // If we have coordinates, generate cropped Cloudinary URL
    if (page?.image && section.x !== undefined && section.y !== undefined && 
        section.width !== undefined && section.height !== undefined &&
        page.image.includes('cloudinary.com')) {
      try {
        const cloudNameMatch = page.image.match(/res\.cloudinary\.com\/([^\/]+)/);
        const uploadIndex = page.image.indexOf('/image/upload/');
        
        if (cloudNameMatch && uploadIndex !== -1) {
          const cloudName = cloudNameMatch[1];
          const afterUpload = page.image.substring(uploadIndex + '/image/upload/'.length);
          const segments = afterUpload.split('/');
          let publicId = segments[segments.length - 1];
          let version = '';
          
          if (segments.length >= 2 && segments[segments.length - 2].match(/^v\d+$/)) {
            version = segments[segments.length - 2];
          }
          
          const cropTransforms = [
            `c_crop`,
            `w_${Math.round(section.width)}`,
            `h_${Math.round(section.height)}`,
            `x_${Math.round(section.x)}`,
            `y_${Math.round(section.y)}`,
            `q_auto:best`,
            `f_auto`
          ].join(',');
          
          imageUrl = version
            ? `https://res.cloudinary.com/${cloudName}/image/upload/${cropTransforms}/${version}/${publicId}`
            : `https://res.cloudinary.com/${cloudName}/image/upload/${cropTransforms}/${publicId}`;
        }
      } catch (e) {
        // Use page image if crop fails
        imageUrl = page.image;
      }
    }
    
    // Optimize for sharing (1200x1600 for vertical cards like reference)
    let optimizedImage = imageUrl;
    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      try {
        const cloudNameMatch = imageUrl.match(/res\.cloudinary\.com\/([^\/]+)/);
        const uploadIndex = imageUrl.indexOf('/image/upload/');
        
        if (cloudNameMatch && uploadIndex !== -1) {
          const cloudName = cloudNameMatch[1];
          const afterUpload = imageUrl.substring(uploadIndex + '/image/upload/'.length);
          const segments = afterUpload.split('/');
          let publicId = segments[segments.length - 1];
          let version = '';
          
          if (segments.length >= 2 && segments[segments.length - 2].match(/^v\d+$/)) {
            version = segments[segments.length - 2];
          }
          
          // For sections, use vertical format like reference (1200x1600)
          const transforms = 'w_1200,h_1600,c_fill,q_auto:best,f_auto';
          optimizedImage = version
            ? `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${version}/${publicId}`
            : `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
        }
      } catch (e) {
        optimizedImage = imageUrl;
      }
    }
    
    // CRITICAL: Ensure HTTPS and absolute URL
    if (!optimizedImage || !optimizedImage.startsWith('http')) {
      optimizedImage = optimizedImage?.startsWith('/') 
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
        url: sectionUrl, // CRITICAL: Must be section URL
        title: title,
        description: description,
        images: [
          {
            url: optimizedImage,
            width: 1200,
            height: 1600, // Changed to 1600 for vertical cards like reference
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
        canonical: sectionUrl, // CRITICAL: Must be section URL
      },
      other: {
        'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID || '', // Add Facebook App ID if available
      },
    };
}

export default async function EpaperSectionPage({ params }) {
  const { id, pageNo, sectionId } = await params;
  return (
    <SubscriptionGuardWrapper requireSubscription={true} showBanner={true}>
      <EPaperSection epaperId={id} pageNo={parseInt(pageNo)} sectionId={sectionId} />
    </SubscriptionGuardWrapper>
  );
}
