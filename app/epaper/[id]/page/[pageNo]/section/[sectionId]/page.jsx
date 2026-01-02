import { getEpaper } from '@/src/utils/api';
import EPaperSection from '@/src/pages/EPaperSection';
import SubscriptionGuardWrapper from '@/src/components/SubscriptionGuardWrapper';

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

    // Get section image - prioritize cropped image, then page image
    let imageUrl = section.croppedImage || section.image || page?.image || epaper.thumbnail;
    
    if (!imageUrl) {
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
    
    // If we have coordinates and page image, generate cropped Cloudinary URL
    if (page?.image && !section.croppedImage && !section.image &&
        section.x !== undefined && section.y !== undefined && 
        section.width !== undefined && section.height !== undefined && 
        page.image.includes('cloudinary.com')) {
      try {
        const cloudNameMatch = page.image.match(/res\.cloudinary\.com\/([^\/]+)/);
        if (cloudNameMatch) {
          const cloudName = cloudNameMatch[1];
          const uploadIndex = page.image.indexOf('/image/upload/');
          if (uploadIndex !== -1) {
            const afterUpload = page.image.substring(uploadIndex + '/image/upload/'.length);
            const segments = afterUpload.split('/');
            let publicId = segments[segments.length - 1];
            let version = '';
            
            if (segments.length >= 2 && segments[segments.length - 2].match(/^v\d+$/)) {
              version = segments[segments.length - 2];
            }
            
            // Create cropped URL
            const cropTransforms = [
              `c_crop`,
              `w_${Math.round(section.width)}`,
              `h_${Math.round(section.height)}`,
              `x_${Math.round(section.x)}`,
              `y_${Math.round(section.y)}`,
              `q_auto:best`,
              `f_auto`
            ].join(',');
            
            if (version) {
              imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${cropTransforms}/${version}/${publicId}`;
            } else {
              imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${cropTransforms}/${publicId}`;
            }
          }
        }
      } catch (e) {
        console.warn('Error creating cropped URL:', e);
      }
    }
    
    // Optimize image for share cards (1200x1200 for square/vertical cards)
    let optimizedImage = imageUrl;
    if (imageUrl && imageUrl.includes('cloudinary.com') && imageUrl.includes('/image/upload/')) {
      try {
        const cloudNameMatch = imageUrl.match(/res\.cloudinary\.com\/([^\/]+)/);
        if (!cloudNameMatch) {
          throw new Error('Could not extract cloud name');
        }
        const cloudName = cloudNameMatch[1];
        
        const uploadIndex = imageUrl.indexOf('/image/upload/');
        if (uploadIndex === -1) {
          throw new Error('Invalid Cloudinary URL format');
        }
        
        const afterUpload = imageUrl.substring(uploadIndex + '/image/upload/'.length);
        const segments = afterUpload.split('/');
        
        let publicId = segments[segments.length - 1];
        let version = '';
        
        if (segments.length >= 2 && segments[segments.length - 2].match(/^v\d+$/)) {
          version = segments[segments.length - 2];
        }
        
        // For sections, use square format (1200x1200) for better preview
        // If already has crop, add resize; otherwise use fill
        const transforms = imageUrl.includes('c_crop') 
          ? 'w_1200,h_1200,c_fill,q_auto:best,f_auto' // Resize after crop
          : 'w_1200,h_1200,c_fill,q_auto:best,f_auto'; // Use fill for better preview
        
        if (version) {
          optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${version}/${publicId}`;
        } else {
          optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
        }
        
        console.log('✅ Optimized section image for sharing:', optimizedImage);
      } catch (e) {
        console.error('❌ Error optimizing Cloudinary URL:', e.message);
        optimizedImage = imageUrl;
      }
    }
    
    // Final HTTPS check
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
      // Additional explicit meta tags for better compatibility
      other: {
        'og:image': optimizedImage,
        'og:image:url': optimizedImage,
        'og:image:width': '1200',
        'og:image:height': '1200',
        'og:image:type': 'image/jpeg',
        'og:image:secure_url': optimizedImage,
        'twitter:image:src': optimizedImage,
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
    <SubscriptionGuardWrapper requireSubscription={true} showBanner={true}>
      <EPaperSection epaperId={id} pageNo={parseInt(pageNo)} sectionId={sectionId} />
    </SubscriptionGuardWrapper>
  );
}

