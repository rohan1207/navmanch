import { getEpaper } from '@/src/utils/api';
import EPaperSection from '@/src/pages/EPaperSection';
import SubscriptionGuard from '@/src/components/SubscriptionGuard';

export async function generateMetadata({ params }) {
  const { id, pageNo, sectionId } = await params;
  const baseUrl = 'https://navmanchnews.com';
  
  try {
    const epaper = await getEpaper(id);
    
    if (!epaper) {
      return {
        title: 'Section Not Found | नव मंच',
      };
    }

    // Find the section
    // Backend uses 'news' not 'newsItems'
    const page = epaper.pages?.find(p => p.pageNo === parseInt(pageNo));
    const section = (page?.news || page?.newsItems)?.find(
      item => String(item._id) === sectionId || String(item.id) === sectionId
    );

    if (!section) {
      return {
        title: 'Section Not Found | नव मंच',
      };
    }

    // Get section image - use cropped image if available, otherwise page image
    let imageUrl = section.croppedImage || section.image || page?.image || epaper.thumbnail || `${baseUrl}/logo1.png`;
    
    // Ensure absolute URL
    if (imageUrl.startsWith('/')) {
      imageUrl = `${baseUrl}${imageUrl}`;
    }
    
    // If we have coordinates, generate cropped Cloudinary URL
    if (page?.image && section.x !== undefined && section.y !== undefined && 
        section.width !== undefined && section.height !== undefined && 
        page.image.includes('cloudinary.com')) {
      const uploadMatch = page.image.match(/(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(.*)/);
      if (uploadMatch) {
        const base = uploadMatch[1];
        const rest = uploadMatch[2];
        // Remove existing transformations and add crop
        const cleanRest = rest.replace(/^[^\/]+\//, '').split('/').pop();
        const transformations = [
          `c_crop`,
          `w_${Math.round(section.width)}`,
          `h_${Math.round(section.height)}`,
          `x_${Math.round(section.x)}`,
          `y_${Math.round(section.y)}`,
          `q_auto:best`,
          `f_auto`
        ].join(',');
        imageUrl = `${base}${transformations}/${cleanRest}`;
      }
    }
    
    // Optimize image for share cards (1200x1200 for square/vertical cards)
    let optimizedImage = imageUrl;
    if (imageUrl.includes('cloudinary.com') && imageUrl.includes('/image/upload/')) {
      try {
        // Parse Cloudinary URL
        const urlParts = imageUrl.split('/image/upload/');
        if (urlParts.length === 2) {
          const cloudName = imageUrl.match(/res\.cloudinary\.com\/([^\/]+)/)?.[1];
          const afterUpload = urlParts[1];
          
          // Extract public_id and version
          const parts = afterUpload.split('/');
          let publicId = parts[parts.length - 1];
          let version = '';
          
          // Check if version exists
          if (parts.length > 1 && parts[parts.length - 2].match(/^v\d+$/)) {
            version = parts[parts.length - 2];
            publicId = parts[parts.length - 1];
          }
          
          // Build optimized URL - if already has crop, preserve it, otherwise use fill
          const transforms = imageUrl.includes('c_crop') 
            ? 'w_1200,h_1200,c_fill,q_auto:best,f_auto' // Keep crop, add resize
            : 'w_1200,h_1200,c_fill,q_auto:best,f_auto'; // Use fill for better preview
          
          if (version) {
            optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${version}/${publicId}`;
          } else {
            optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
          }
        }
      } catch (e) {
        console.warn('Error optimizing Cloudinary URL:', e);
        optimizedImage = imageUrl;
      }
    }

    // Force HTTPS
    if (optimizedImage.startsWith('http://')) {
      optimizedImage = optimizedImage.replace('http://', 'https://');
    }
    
    // Clean epaper title
    let epaperTitle = epaper.title || 'नव मंच';
    const cleanEpaperTitle = epaperTitle
      .replace(/\s*-\s*\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/gi, '')
      .replace(/\s*-\s*\d{1,2}\/\d{1,2}\/\d{4}/g, '')
      .trim();

    // Format date
    const epaperDate = epaper.date ? new Date(epaper.date).toLocaleDateString('mr-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';

    const sectionTitle = section.title || 'बातमी विभाग';
    const title = `${sectionTitle} - ${cleanEpaperTitle}`;
    const description = `${sectionTitle} | ${cleanEpaperTitle}${epaperDate ? ` - ${epaperDate}` : ''} | नव मंच - मराठी वृत्तपत्र | navmanchnews.com`;
    const sectionUrl = `${baseUrl}/epaper/${id}/page/${pageNo}/section/${sectionId}`;

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
            width: 1200,
            height: 1200,
            alt: sectionTitle,
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
      other: {
        'og:image:width': '1200',
        'og:image:height': '1200',
        'og:image:type': 'image/jpeg',
      },
    };
  } catch (error) {
    console.error('Error generating section metadata:', error);
    return {
      title: 'Section | नव मंच',
    };
  }
}

export default async function EpaperSectionPage({ params }) {
  const { id, pageNo, sectionId } = await params;
  return (
    <SubscriptionGuard requireSubscription={true} showBanner={true}>
      <EPaperSection epaperId={id} pageNo={parseInt(pageNo)} sectionId={sectionId} />
    </SubscriptionGuard>
  );
}

