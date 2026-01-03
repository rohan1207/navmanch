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

    const page = epaper.pages?.find(p => p.pageNo === parseInt(pageNo));
    const section = (page?.news || page?.newsItems)?.find(
      item => String(item._id) === sectionId || String(item.id) === sectionId
    );

    if (!section) {
      return {
        title: 'Section Not Found | नव मंच',
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
    
    // Optimize for sharing (1200x1200 for square cards)
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
          
          const transforms = 'w_1200,h_1200,c_fill,q_auto:best,f_auto';
          optimizedImage = version
            ? `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${version}/${publicId}`
            : `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
        }
      } catch (e) {
        optimizedImage = imageUrl;
      }
    }
    
    // Ensure HTTPS and absolute URL
    if (optimizedImage && !optimizedImage.startsWith('http')) {
      optimizedImage = optimizedImage.startsWith('/') 
        ? `${baseUrl}${optimizedImage}`
        : `${baseUrl}/${optimizedImage}`;
    }
    if (optimizedImage?.startsWith('http://')) {
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
            url: optimizedImage || `${baseUrl}/logo1.png`,
            width: 1200,
            height: 1200,
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
        images: [optimizedImage || `${baseUrl}/logo1.png`],
      },
      alternates: {
        canonical: sectionUrl,
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
