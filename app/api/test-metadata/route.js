import { NextResponse } from 'next/server';
import { getEpaper } from '@/src/utils/api';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'epaper' or 'section'
  const epaperId = searchParams.get('epaperId');
  const pageNo = searchParams.get('pageNo');
  const sectionId = searchParams.get('sectionId');

  try {
    if (type === 'epaper' && epaperId) {
      const epaper = await getEpaper(epaperId);
      
      if (!epaper) {
        return NextResponse.json({ error: 'Epaper not found' }, { status: 404 });
      }

      // Get image
      let imageUrl = epaper.pages?.[0]?.image || epaper.thumbnail || 'https://navmanchnews.com/logo1.png';
      
      // Optimize Cloudinary image
      let optimizedImage = imageUrl;
      if (imageUrl.includes('cloudinary.com') && imageUrl.includes('/image/upload/')) {
        try {
          const urlParts = imageUrl.split('/image/upload/');
          if (urlParts.length === 2) {
            const cloudName = imageUrl.match(/res\.cloudinary\.com\/([^\/]+)/)?.[1];
            const afterUpload = urlParts[1];
            const parts = afterUpload.split('/');
            let publicId = parts[parts.length - 1];
            let version = '';
            
            if (parts.length > 1 && parts[parts.length - 2].match(/^v\d+$/)) {
              version = parts[parts.length - 2];
              publicId = parts[parts.length - 1];
            }
            
            const transforms = 'w_1200,h_1600,c_fit,q_auto:best,f_auto';
            if (version) {
              optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${version}/${publicId}`;
            } else {
              optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
            }
          }
        } catch (e) {
          console.warn('Error optimizing Cloudinary URL:', e);
        }
      }

      // Clean title
      let epaperTitle = epaper.title || 'नव मंच';
      epaperTitle = epaperTitle
        .replace(/\s*-\s*\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/gi, '')
        .replace(/\s*-\s*\d{1,2}\/\d{1,2}\/\d{4}/g, '')
        .replace(/\s*-\s*\d{4}-\d{2}-\d{2}/g, '')
        .replace(/\s*-\s*पृष्ठ\s*\d+/gi, '')
        .replace(/\s*-\s*Page\s*\d+/gi, '')
        .trim();

      const epaperDate = epaper.date ? new Date(epaper.date).toLocaleDateString('mr-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '';

      const description = `${epaperTitle}${epaperDate ? ` - ${epaperDate}` : ''} | नव मंच - मराठी वृत्तपत्र | navmanchnews.com`;

      return NextResponse.json({
        type: 'epaper',
        title: `${epaperTitle} | नव मंच`,
        description: description,
        openGraph: {
          type: 'article',
          url: `https://navmanchnews.com/epaper/${epaperId}`,
          title: epaperTitle,
          description: description,
          image: optimizedImage,
          imageWidth: 1200,
          imageHeight: 1600,
          siteName: 'नव मंच - Nav Manch',
          locale: 'mr_IN',
        },
        twitter: {
          card: 'summary_large_image',
          title: epaperTitle,
          description: description,
          image: optimizedImage,
        },
      });
    } else if (type === 'section' && epaperId && pageNo && sectionId) {
      const epaper = await getEpaper(epaperId);
      
      if (!epaper) {
        return NextResponse.json({ error: 'Epaper not found' }, { status: 404 });
      }

      const page = epaper.pages?.find(p => p.pageNo === parseInt(pageNo));
      const section = (page?.news || page?.newsItems)?.find(
        item => String(item._id) === sectionId || String(item.id) === sectionId
      );

      if (!section) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }

      // Get section image
      let imageUrl = section.croppedImage || section.image || page?.image || epaper.thumbnail || 'https://navmanchnews.com/logo1.png';
      
      // Optimize image
      let optimizedImage = imageUrl;
      if (imageUrl.includes('cloudinary.com') && imageUrl.includes('/image/upload/')) {
        try {
          const urlParts = imageUrl.split('/image/upload/');
          if (urlParts.length === 2) {
            const cloudName = imageUrl.match(/res\.cloudinary\.com\/([^\/]+)/)?.[1];
            const afterUpload = urlParts[1];
            const parts = afterUpload.split('/');
            let publicId = parts[parts.length - 1];
            let version = '';
            
            if (parts.length > 1 && parts[parts.length - 2].match(/^v\d+$/)) {
              version = parts[parts.length - 2];
              publicId = parts[parts.length - 1];
            }
            
            const transforms = 'w_1200,h_1200,c_fill,q_auto:best,f_auto';
            if (version) {
              optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${version}/${publicId}`;
            } else {
              optimizedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
            }
          }
        } catch (e) {
          console.warn('Error optimizing Cloudinary URL:', e);
        }
      }

      let epaperTitle = epaper.title || 'नव मंच';
      epaperTitle = epaperTitle
        .replace(/\s*-\s*\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/gi, '')
        .replace(/\s*-\s*\d{1,2}\/\d{1,2}\/\d{4}/g, '')
        .trim();

      const sectionTitle = section.title || 'बातमी विभाग';
      const title = `${sectionTitle} - ${epaperTitle}`;
      const description = `${sectionTitle} | ${epaperTitle} | नव मंच - मराठी वृत्तपत्र | navmanchnews.com`;

      return NextResponse.json({
        type: 'section',
        title: `${title} | नव मंच`,
        description: description,
        openGraph: {
          type: 'article',
          url: `https://navmanchnews.com/epaper/${epaperId}/page/${pageNo}/section/${sectionId}`,
          title: title,
          description: description,
          image: optimizedImage,
          imageWidth: 1200,
          imageHeight: 1200,
          siteName: 'नव मंच - Nav Manch',
          locale: 'mr_IN',
        },
        twitter: {
          card: 'summary_large_image',
          title: title,
          description: description,
          image: optimizedImage,
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in test-metadata API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}





