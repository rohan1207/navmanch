import { getEpaper } from '@/src/utils/api';
import EPaperViewer from '@/src/pages/EPaperViewer';
import SubscriptionGuardWrapper from '@/src/components/SubscriptionGuardWrapper';

export async function generateMetadata({ params }) {
  console.log('🔍 generateMetadata called for epaper page');
  const { id } = await params;
  const baseUrl = 'https://navmanchnews.com';
  const epaperUrl = `${baseUrl}/epaper/${id}`;
  
  console.log('📄 Generating metadata for epaper:', id);
  
  // CRITICAL: Always return complete metadata, even on error
  // Add timeout to prevent hanging on slow API calls
  let epaper = null;
  try {
    // Use Promise.race to timeout after 5 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), 5000)
    );
    epaper = await Promise.race([getEpaper(id), timeoutPromise]);
    console.log('✅ Epaper fetched:', epaper ? 'success' : 'null');
  } catch (error) {
    console.error('❌ CRITICAL: Failed to fetch epaper:', error);
    // Return complete metadata with correct URL (prevents root layout fallback)
    const fallbackMetadata = {
      metadataBase: new URL(baseUrl),
      title: `E-Paper ${id} | नव मंच`,
      description: 'E-Paper | नव मंच - मराठी वृत्तपत्र',
      openGraph: {
        type: 'article',
        url: epaperUrl, // CRITICAL: Correct URL
        title: `E-Paper ${id} | नव मंच`,
        description: 'E-Paper | नव मंच - मराठी वृत्तपत्र',
        images: [`${baseUrl}/logo1.png`],
        siteName: 'नव मंच - Nav Manch',
      },
      alternates: {
        canonical: epaperUrl, // CRITICAL: Correct URL
      },
    };
    console.log('📤 Returning fallback metadata:', fallbackMetadata);
    return fallbackMetadata;
  }
  
  if (!epaper) {
    return {
      metadataBase: new URL(baseUrl),
      title: `E-Paper ${id} | नव मंच`,
      description: 'E-Paper | नव मंच - मराठी वृत्तपत्र',
      openGraph: {
        type: 'article',
        url: epaperUrl,
        title: `E-Paper ${id} | नव मंच`,
        description: 'E-Paper | नव मंच - मराठी वृत्तपत्र',
        images: [`${baseUrl}/logo1.png`],
        siteName: 'नव मंच - Nav Manch',
      },
      alternates: {
        canonical: epaperUrl,
      },
    };
  }

    // Get first page image
    const imageUrl = epaper.pages?.[0]?.image || epaper.thumbnail;
    
    // Optimize Cloudinary image for vertical cards (1200x1600)
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
          
          const transforms = 'w_1200,h_1600,c_fill,q_auto:best,f_auto';
          optimizedImage = version
            ? `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${version}/${publicId}`
            : `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
        }
      } catch (e) {
        // Use original if optimization fails
        optimizedImage = imageUrl;
      }
    }
    
    // Ensure HTTPS and absolute URL
    if (!optimizedImage || !optimizedImage.startsWith('http')) {
      optimizedImage = optimizedImage?.startsWith('/') 
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

    // Use actual ID from epaper, not the slug from URL
    const epaperId = epaper.id || epaper._id || id;
    const finalEpaperUrl = `${baseUrl}/epaper/${epaperId}`;
    const description = `${epaperTitle}${epaperDate ? ` - ${epaperDate}` : ''} | नव मंच - मराठी वृत्तपत्र`;

    const metadata = {
      metadataBase: new URL(baseUrl),
      title: `${epaperTitle} | नव मंच`,
      description: description,
      openGraph: {
        type: 'article',
        url: finalEpaperUrl, // CRITICAL: Must be epaper URL
        title: epaperTitle,
        description: description,
        images: [
          {
            url: optimizedImage,
            width: 1200,
            height: 1600,
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
        canonical: finalEpaperUrl, // CRITICAL: Must be epaper URL
      },
      other: {
        'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID || '', // Add Facebook App ID if available
      },
    };
    
    console.log('📤 Returning metadata:', JSON.stringify(metadata, null, 2));
    return metadata;
}

export default async function EpaperDetailPage({ params }) {
  const { id } = await params;
  return (
    <SubscriptionGuardWrapper requireSubscription={true} showBanner={true}>
      <EPaperViewer epaperId={id} />
    </SubscriptionGuardWrapper>
  );
}
