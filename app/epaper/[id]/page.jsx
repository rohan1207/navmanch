import { getEpaper } from '@/src/utils/api';
import EPaperViewer from '@/src/pages/EPaperViewer';
import SubscriptionGuardWrapper from '@/src/components/SubscriptionGuardWrapper';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const baseUrl = 'https://navmanchnews.com';
  
  try {
    const epaper = await getEpaper(id);
    
    if (!epaper) {
      return {
        title: 'E-Paper Not Found | नव मंच',
      };
    }

    // Get image - use first page or thumbnail
    let imageUrl = epaper.pages?.[0]?.image || epaper.thumbnail || `${baseUrl}/logo1.png`;
    
    // Ensure absolute URL
    if (imageUrl.startsWith('/')) {
      imageUrl = `${baseUrl}${imageUrl}`;
    }
    
    // Optimize Cloudinary image for vertical share cards (1200x1600 for WhatsApp/Facebook)
    let optimizedImage = imageUrl;
    if (imageUrl.includes('cloudinary.com') && imageUrl.includes('/image/upload/')) {
      try {
        // Parse Cloudinary URL: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{version}/{public_id}
        const urlParts = imageUrl.split('/image/upload/');
        if (urlParts.length === 2) {
          const cloudName = imageUrl.match(/res\.cloudinary\.com\/([^\/]+)/)?.[1];
          const afterUpload = urlParts[1];
          
          // Extract public_id (everything after last slash, or if version exists, after second-to-last)
          const parts = afterUpload.split('/');
          let publicId = parts[parts.length - 1];
          let version = '';
          
          // Check if version exists (format: v1234567890)
          if (parts.length > 1 && parts[parts.length - 2].match(/^v\d+$/)) {
            version = parts[parts.length - 2];
            publicId = parts[parts.length - 1];
          }
          
          // Build optimized URL with transformations
          const transforms = 'w_1200,h_1600,c_fit,q_auto:best,f_auto';
          if (version) {
            optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${version}/${publicId}`;
          } else {
            optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
          }
        }
      } catch (e) {
        console.warn('Error optimizing Cloudinary URL:', e);
        // Fallback to original URL
        optimizedImage = imageUrl;
      }
    }
    
    // Force HTTPS
    if (optimizedImage.startsWith('http://')) {
      optimizedImage = optimizedImage.replace('http://', 'https://');
    }
    
    // Clean title - remove date patterns
    let epaperTitle = epaper.title || 'नव मंच';
    const originalTitle = epaperTitle;
    epaperTitle = epaperTitle
      .replace(/\s*-\s*\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/gi, '')
      .replace(/\s*-\s*\d{1,2}\/\d{1,2}\/\d{4}/g, '')
      .replace(/\s*-\s*\d{4}-\d{2}-\d{2}/g, '')
      .replace(/\s*-\s*पृष्ठ\s*\d+/gi, '')
      .replace(/\s*-\s*Page\s*\d+/gi, '')
      .trim();

    // Format date for description
    const epaperDate = epaper.date ? new Date(epaper.date).toLocaleDateString('mr-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';

    const epaperUrl = `${baseUrl}/epaper/${id}`;
    const description = `${epaperTitle}${epaperDate ? ` - ${epaperDate}` : ''} | नव मंच - मराठी वृत्तपत्र | navmanchnews.com`;

    return {
      metadataBase: new URL(baseUrl),
      title: `${epaperTitle} | नव मंच`,
      description: description,
      openGraph: {
        type: 'article',
        url: epaperUrl,
        title: epaperTitle,
        description: description,
        images: [
          {
            url: optimizedImage,
            width: 1200,
            height: 1600,
            alt: epaperTitle,
            type: 'image/jpeg',
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
        canonical: epaperUrl,
      },
      other: {
        'og:image:width': '1200',
        'og:image:height': '1600',
        'og:image:type': 'image/jpeg',
      },
    };
  } catch (error) {
    console.error('Error generating epaper metadata:', error);
    return {
      title: 'E-Paper | नव मंच',
    };
  }
}

export default async function EpaperDetailPage({ params }) {
  const { id } = await params;
  return (
    <SubscriptionGuardWrapper requireSubscription={true} showBanner={true}>
      <EPaperViewer epaperId={id} />
    </SubscriptionGuardWrapper>
  );
}

