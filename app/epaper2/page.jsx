import { getEpapers } from '@/src/utils/api';
import EPaper2 from '@/src/pages/EPaper2';

export const metadata = {
  title: 'नव मंच ई-पेपर | Nav Manch E-Paper - मराठी वृत्तपत्र',
  description: 'नव मंच ई-पेपर वाचा. साप्ताहिक मराठी वृत्तपत्राचे डिजिटल आवृत्ती. दर आठवड्याला नवीन ई-पेपर उपलब्ध. Read Nav Manch weekly e-paper, Marathi newspaper digital edition.',
  openGraph: {
    title: 'नव मंच ई-पेपर | Nav Manch E-Paper',
    description: 'साप्ताहिक मराठी वृत्तपत्राचे डिजिटल आवृत्ती. Weekly Marathi newspaper digital edition.',
    images: ['/logo1.png'],
    url: 'https://navmanchnews.com/epaper2',
    type: 'website',
    locale: 'mr_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'नव मंच ई-पेपर',
    description: 'साप्ताहिक मराठी वृत्तपत्राचे डिजिटल आवृत्ती',
    images: ['/logo1.png'],
  },
  alternates: {
    canonical: 'https://navmanchnews.com/epaper2',
  },
};

export default function Epaper2Page() {
  return <EPaper2 />;
}

