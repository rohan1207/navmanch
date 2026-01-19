import { getArticle } from '@/src/utils/api';
import NewsDetail from '@/src/pages/NewsDetail';

// Optimize Cloudinary image for instant share cards (matching backend optimizations)
function optimizeImageForShare(imgUrl, baseUrl) {
  if (!imgUrl || imgUrl.trim() === '') {
    return `${baseUrl}/logo1.png`;
  }
  
  let optimized = imgUrl.trim();
  
  // CRITICAL: Ensure absolute HTTPS URL FIRST (before Cloudinary processing)
  if (!optimized.startsWith('http')) {
    optimized = optimized.startsWith('/') 
      ? `${baseUrl}${optimized}`
      : `${baseUrl}/logo1.png`;
  }
  if (optimized.startsWith('http://')) {
    optimized = optimized.replace('http://', 'https://');
  }

  return optimized;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  // Use environment variable or fallback - critical for share cards
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
    'https://navmanchnews.com';
  
  try {
    const article = await getArticle(id);
    
    if (!article) {
      return {
        title: 'Article Not Found | नव मंच',
        description: 'Article not found',
      };
    }

    // Get image - prioritize shareImageUrl, then featuredImage, then image, then gallery, then first <img> from content
    let imageUrl = '';
    
    if (article.shareImageUrl && article.shareImageUrl.trim() !== '') {
      imageUrl = article.shareImageUrl.trim();
    } else if (article.featuredImage && article.featuredImage.trim() !== '') {
      imageUrl = article.featuredImage.trim();
    } else if (article.image && String(article.image).trim() !== '') {
      // Many articles only have `image` field (used in UI) – use it as next priority
      imageUrl = String(article.image).trim();
    } else if (article.imageGallery && article.imageGallery.length > 0) {
      const firstImage = article.imageGallery.find(img => img && img.trim() !== '');
      if (firstImage) imageUrl = firstImage.trim();
    } else if (article.content) {
      const match = String(article.content).match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) imageUrl = match[1].trim();
    }
    
    // Optimize image for instant loading
    const optimizedImage = optimizeImageForShare(imageUrl, baseUrl);
    
    // CRITICAL: Ensure image URL is absolute HTTPS and accessible
    let finalImageUrl = optimizedImage;
    if (!finalImageUrl.startsWith('http')) {
      finalImageUrl = finalImageUrl.startsWith('/') 
        ? `${baseUrl}${finalImageUrl}`
        : `${baseUrl}/logo1.png`;
    }
    if (finalImageUrl.startsWith('http://')) {
      finalImageUrl = finalImageUrl.replace('http://', 'https://');
    }
    
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
            url: finalImageUrl, // CRITICAL: Must be absolute HTTPS URL
            width: 600,
            height: 315,
            alt: article.title,
            secureUrl: finalImageUrl, // CRITICAL: WhatsApp requires this
            type: 'image/jpeg', // CRITICAL: Explicit type
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
        images: [finalImageUrl], // CRITICAL: Must be absolute HTTPS URL
      },
      alternates: {
        canonical: articleUrl,
      },
      // CRITICAL: Add explicit meta tags for WhatsApp compatibility
      other: {
        'og:image:secure_url': finalImageUrl,
        'og:image:width': '600',
        'og:image:height': '315',
        'og:image:type': 'image/jpeg',
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
