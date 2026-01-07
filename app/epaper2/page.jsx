import { getEpapers } from '@/src/utils/api';
import EPaper2 from '@/src/pages/EPaper2';

export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://navmanchnews.com';
  const epaperUrl = `${baseUrl}/epaper`;
  
  // Try to get latest epaper for better image
  let latestEpaperImage = '/logo1.png';
  try {
    const epapers = await getEpapers();
    if (epapers && Array.isArray(epapers) && epapers.length > 0) {
      const latest = epapers[0];
      latestEpaperImage = latest.thumbnail || latest.pages?.[0]?.image || '/logo1.png';
      
      // Ensure absolute URL
      if (!latestEpaperImage.startsWith('http')) {
        latestEpaperImage = latestEpaperImage.startsWith('/') 
          ? `${baseUrl}${latestEpaperImage}`
          : `${baseUrl}/logo1.png`;
      }
      if (latestEpaperImage.startsWith('http://')) {
        latestEpaperImage = latestEpaperImage.replace('http://', 'https://');
      }
    }
  } catch (error) {
    // Use default logo if API fails
    latestEpaperImage = `${baseUrl}/logo1.png`;
  }

  return {
    metadataBase: new URL(baseUrl),
    title: 'नव मंच ई-पेपर | Nav Manch E-Paper - मराठी वृत्तपत्र',
    description: 'नव मंच ई-पेपर वाचा. साप्ताहिक मराठी वृत्तपत्राचे डिजिटल आवृत्ती. दर आठवड्याला नवीन ई-पेपर उपलब्ध. Read Nav Manch weekly e-paper, Marathi newspaper digital edition.',
    openGraph: {
      title: 'नव मंच ई-पेपर | Nav Manch E-Paper',
      description: 'साप्ताहिक मराठी वृत्तपत्राचे डिजिटल आवृत्ती. Weekly Marathi newspaper digital edition.',
      images: [latestEpaperImage],
      url: epaperUrl,
      type: 'website',
      locale: 'mr_IN',
      siteName: 'नव मंच - Nav Manch',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'नव मंच ई-पेपर',
      description: 'साप्ताहिक मराठी वृत्तपत्राचे डिजिटल आवृत्ती',
      images: [latestEpaperImage],
    },
    alternates: {
      canonical: epaperUrl,
    },
    other: {
      'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID || '',
    },
  };
}

export default function EpaperPage() {
  return <EPaper2 />;
}

