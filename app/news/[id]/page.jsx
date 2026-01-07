import { getArticle } from '@/src/utils/api';
import NewsDetail from '@/src/pages/NewsDetail';

// Optimize Cloudinary image for instant share cards (matching backend optimizations)
function optimizeImageForShare(imgUrl, baseUrl) {
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
  
  // Apply ultra-fast Cloudinary optimizations (600x315, q_60, f_jpg, fl_progressive, dpr_1, g_auto)
  if (optimized.includes('cloudinary.com') && optimized.includes('/image/upload/')) {
    const match = optimized.match(/(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(.*)/);
    if (match) {
      const base = match[1];
      const rest = match[2];
      
      // Extract public_id (last segment, may have version)
      const segments = rest.split('/');
      let publicId = segments[segments.length - 1];
      let version = '';
      if (segments.length >= 2 && segments[segments.length - 2].match(/^v\d+$/)) {
        version = segments[segments.length - 2];
        publicId = segments[segments.length - 1];
      }
      
      // Ultra-fast optimizations: 600x315, JPEG, quality 60, progressive, dpr_1, auto gravity
      const transforms = 'w_600,h_315,c_fill,g_auto,q_60,f_jpg,fl_progressive,dpr_1';
      optimized = version
        ? `${base}${transforms}/${version}/${publicId}`
        : `${base}${transforms}/${publicId}`;
    }
  }
  
  return optimized;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const baseUrl = 'https://navmanchnews.com';
  
  try {
    const article = await getArticle(id);
    
    if (!article) {
      return {
        title: 'Article Not Found | नव मंच',
        description: 'Article not found',
      };
    }

    // Get image - prioritize featuredImage, then imageGallery, then first <img> from content
    let imageUrl = '';
    
    if (article.featuredImage && article.featuredImage.trim() !== '') {
      imageUrl = article.featuredImage.trim();
    } else if (article.imageGallery && article.imageGallery.length > 0) {
      const firstImage = article.imageGallery.find(img => img && img.trim() !== '');
      if (firstImage) imageUrl = firstImage.trim();
    } else if (article.content) {
      const match = String(article.content).match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) imageUrl = match[1].trim();
    }
    
    // Optimize image for instant loading
    const optimizedImage = optimizeImageForShare(imageUrl, baseUrl);

    // Get description
    const description = article.summary || 
      (article.content ? String(article.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200) : '') ||
      article.title || '';

    const articleUrl = `${baseUrl}/news/${id}`;

    return {
      metadataBase: new URL(baseUrl),
      title: `${article.title} | नव मंच`,
      description: description,
      openGraph: {
        type: 'article',
        url: articleUrl,
        title: article.title,
        description: description,
        images: [
          {
            url: optimizedImage,
            width: 600,
            height: 315,
            alt: article.title,
          },
        ],
        siteName: 'नव मंच - Nav Manch',
        locale: 'mr_IN',
        publishedTime: article.publishedAt || article.createdAt ? new Date(article.publishedAt || article.createdAt).toISOString() : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: description,
        images: [optimizedImage],
      },
      alternates: {
        canonical: articleUrl,
      },
    };
  } catch (error) {
    console.error('Error generating article metadata:', error);
    return {
      title: 'Article | नव मंच',
      description: 'Article | नव मंच - मराठी वृत्तपत्र',
      openGraph: {
        images: [`${baseUrl}/logo1.png`],
      },
    };
  }
}

export default function NewsDetailPage() {
  return <NewsDetail />;
}
