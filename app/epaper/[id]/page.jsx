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
    let imageUrl = epaper.pages?.[0]?.image || epaper.thumbnail;
    
    if (!imageUrl) {
      // Fallback to logo
      imageUrl = `${baseUrl}/logo1.png`;
    }
    
    // Ensure absolute URL
    if (imageUrl.startsWith('/')) {
      imageUrl = `${baseUrl}${imageUrl}`;
    } else if (!imageUrl.startsWith('http')) {
      imageUrl = `${baseUrl}/${imageUrl}`;
    }
    
    // Force HTTPS
    if (imageUrl.startsWith('http://')) {
      imageUrl = imageUrl.replace('http://', 'https://');
    }
    
    // Optimize Cloudinary image for vertical share cards (1200x1600 for WhatsApp/Facebook)
    let optimizedImage = imageUrl;
    if (imageUrl && imageUrl.includes('cloudinary.com') && imageUrl.includes('/image/upload/')) {
      try {
        // Cloudinary URL format examples:
        // https://res.cloudinary.com/{cloud_name}/image/upload/v1234567890/{public_id}
        // https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
        // https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
        
        const cloudNameMatch = imageUrl.match(/res\.cloudinary\.com\/([^\/]+)/);
        if (!cloudNameMatch) {
          throw new Error('Could not extract cloud name');
        }
        const cloudName = cloudNameMatch[1];
        
        // Find /image/upload/ position
        const uploadIndex = imageUrl.indexOf('/image/upload/');
        if (uploadIndex === -1) {
          throw new Error('Invalid Cloudinary URL format');
        }
        
        // Get everything after /image/upload/
        const afterUpload = imageUrl.substring(uploadIndex + '/image/upload/'.length);
        
        // Split by / to find version and public_id
        const segments = afterUpload.split('/');
        
        // Last segment is always the public_id (may include file extension)
        let publicId = segments[segments.length - 1];
        let version = '';
        
        // Check if second-to-last segment is a version (format: v1234567890)
        if (segments.length >= 2) {
          const potentialVersion = segments[segments.length - 2];
          if (potentialVersion.match(/^v\d+$/)) {
            version = potentialVersion;
          }
        }
        
        // Build optimized URL for vertical cards (1200x1600)
        // Use c_fill to ensure proper aspect ratio for WhatsApp/Facebook
        const transforms = 'w_1200,h_1600,c_fill,q_auto:best,f_auto';
        
        if (version) {
          optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${version}/${publicId}`;
        } else {
          optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
        }
        
        console.log('✅ Optimized Cloudinary image for sharing:', optimizedImage);
      } catch (e) {
        console.error('❌ Error optimizing Cloudinary URL:', e.message);
        console.error('Original URL:', imageUrl);
        // Use original URL as fallback
        optimizedImage = imageUrl;
      }
    }
    
    // Final HTTPS check
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
      // Additional explicit meta tags for better compatibility
      other: {
        'og:image': optimizedImage,
        'og:image:url': optimizedImage,
        'og:image:width': '1200',
        'og:image:height': '1600',
        'og:image:type': 'image/jpeg',
        'og:image:secure_url': optimizedImage,
        'twitter:image:src': optimizedImage,
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

