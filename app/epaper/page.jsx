import { getEpapers } from '@/src/utils/api';
import EPaper2 from '@/src/pages/EPaper2';

// Optimize Cloudinary image for instant share cards
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
  
  // Apply ultra-fast Cloudinary optimizations for vertical cards (600x800)
  // IMPORTANT: Preserve the full folder path (e.g. newspaper/epaper/1767/page-1.jpg)
  if (optimized.includes('cloudinary.com') && optimized.includes('/image/upload/')) {
    const match = optimized.match(/(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(.*)/);
    if (match) {
      const base = match[1];     // up to and including /image/upload/
      const rest = match[2];     // everything AFTER /image/upload/ (version + folders + public_id)
      
      // Ultra-fast optimizations: 600x800 (vertical), JPEG, quality 60, progressive, dpr_1, auto gravity
      const transforms = 'w_600,h_800,c_fill,g_auto,q_60,f_jpg,fl_progressive,dpr_1';
      // Insert transforms BEFORE the existing path, keep folders + version untouched
      optimized = `${base}${transforms}/${rest}`;
    }
  }
  
  return optimized;
}

export async function generateMetadata() {
  // Use environment variable or fallback - critical for share cards
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
    'https://navmanchnews.com';
  const epaperUrl = `${baseUrl}/epaper`;
  
  // Get latest epaper for better image
  let latestEpaperImage = '/logo1.png';
  try {
    const epapers = await getEpapers();
    if (epapers && Array.isArray(epapers) && epapers.length > 0) {
      const latest = epapers[0];
      latestEpaperImage = latest.thumbnail || latest.pages?.[0]?.image || '/logo1.png';
    }
  } catch (error) {
    // Use default logo if API fails
  }
  
  // Optimize image for instant loading
  let optimizedImage = optimizeImageForShare(latestEpaperImage, baseUrl);
  
  // CRITICAL: Ensure image URL is absolute HTTPS and accessible
  if (!optimizedImage.startsWith('http')) {
    optimizedImage = optimizedImage.startsWith('/') 
      ? `${baseUrl}${optimizedImage}`
      : `${baseUrl}/logo1.png`;
  }
  if (optimizedImage.startsWith('http://')) {
    optimizedImage = optimizedImage.replace('http://', 'https://');
  }

  return {
    metadataBase: new URL(baseUrl),
    title: 'नव मंच ई-पेपर | Nav Manch E-Paper - मराठी वृत्तपत्र',
    description: 'नव मंच ई-पेपर वाचा. साप्ताहिक मराठी वृत्तपत्राचे डिजिटल आवृत्ती. दर आठवड्याला नवीन ई-पेपर उपलब्ध. Read Nav Manch weekly e-paper, Marathi newspaper digital edition.',
    openGraph: {
      title: 'नव मंच ई-पेपर | Nav Manch E-Paper',
      description: 'साप्ताहिक मराठी वृत्तपत्राचे डिजिटल आवृत्ती. Weekly Marathi newspaper digital edition.',
      images: [
        {
          url: optimizedImage,
          width: 600,
          height: 800,
          alt: 'नव मंच ई-पेपर',
        },
      ],
      url: epaperUrl,
      type: 'website',
      locale: 'mr_IN',
      siteName: 'नव मंच - Nav Manch',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'नव मंच ई-पेपर',
      description: 'साप्ताहिक मराठी वृत्तपत्राचे डिजिटल आवृत्ती',
      images: [optimizedImage],
    },
    alternates: {
      canonical: epaperUrl,
    },
  };
}

export default function EpaperPage() {
  return <EPaper2 />;
}
