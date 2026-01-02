import { getArticle } from '@/src/utils/api';
import NewsDetail from '@/src/pages/NewsDetail';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const baseUrl = 'https://navmanchnews.com';
  
  try {
    const article = await getArticle(id);
    
    if (!article) {
      return {
        title: 'Article Not Found | नव मंच',
      };
    }

    // Get image - prioritize featuredImage, then imageGallery, then default
    let imageUrl = '';
    
    if (article.featuredImage && article.featuredImage.trim() !== '') {
      imageUrl = article.featuredImage.trim();
    } else if (article.imageGallery && article.imageGallery.length > 0) {
      const firstImage = article.imageGallery.find(img => img && img.trim() !== '');
      if (firstImage) {
        imageUrl = firstImage.trim();
      }
    }
    
    if (!imageUrl || imageUrl === '') {
      imageUrl = `${baseUrl}/logo1.png`;
    }
    
    // Optimize Cloudinary image for share cards (1200x630)
    let optimizedImage = imageUrl;
    if (imageUrl.includes('cloudinary.com') && imageUrl.includes('/image/upload/')) {
      const uploadMatch = imageUrl.match(/(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(.*)/);
      if (uploadMatch) {
        const base = uploadMatch[1];
        const rest = uploadMatch[2];
        if (!rest.includes('w_') || !rest.includes('h_')) {
          optimizedImage = `${base}w_1200,h_630,c_fill,q_auto,f_auto/${rest}`;
        } else {
          optimizedImage = imageUrl;
        }
      }
    }

    // Force HTTPS
    if (optimizedImage.startsWith('http://')) {
      optimizedImage = optimizedImage.replace('http://', 'https://');
    }

    // Get description
    const description = article.summary || 
      (article.content ? String(article.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200) : '') ||
      article.title || '';

    const articleUrl = `${baseUrl}/news/${id}`;
    const siteName = 'नव मंच - Nav Manch';

    return {
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
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
        siteName: siteName,
        locale: 'mr_IN',
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
    };
  }
}

export default async function NewsDetailPage({ params }) {
  const { id } = await params;
  return <NewsDetail articleId={id} />;
}

