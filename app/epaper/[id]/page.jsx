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
        // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{version}/{public_id}
        // We need to insert transformations BEFORE the public_id, preserving any existing path structure
        const cloudinaryMatch = imageUrl.match(/https?:\/\/res\.cloudinary\.com\/([^\/]+)\/image\/upload\/(.*)/);
        
        if (cloudinaryMatch) {
          const cloudName = cloudinaryMatch[1];
          const afterUpload = cloudinaryMatch[2]; // Everything after /image/upload/
          
          // Check if transformations already exist (contains w_, h_, c_, etc.)
          const hasTransforms = /[whc]_|q_|f_/.test(afterUpload);
          
          if (!hasTransforms) {
            // No transformations exist, add them at the beginning
            const transforms = 'w_1200,h_1600,c_fill,q_auto:best,f_auto';
            optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${afterUpload}`;
          } else {
            // Transformations exist, replace them with our vertical card dimensions
            // Extract the public_id (last segment) and version if present
            const parts = afterUpload.split('/');
            let publicId = parts[parts.length - 1];
            let version = '';
            
            // Check if second-to-last is a version (v123)
            if (parts.length >= 2 && parts[parts.length - 2].match(/^v\d+$/)) {
              version = parts[parts.length - 2];
              publicId = parts[parts.length - 1];
            }
            
            // Build new URL with our transformations
            const transforms = 'w_1200,h_1600,c_fill,q_auto:best,f_auto';
            if (version) {
              optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${version}/${publicId}`;
            } else {
              optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
            }
          }
        }
      } catch (e) {
        console.error('Error optimizing Cloudinary URL:', e);
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
