import './globals.css';
import { HeaderProvider } from '@/src/context/HeaderContext';
import Header from '@/src/components/Header';
import BreakingNewsTicker from '@/src/components/BreakingNewsTicker';
import Navigation from '@/src/components/Navigation';
import ContactRibbon from '@/src/components/ContactRibbon';
import Footer from '@/src/components/Footer';
import MainContent from '@/src/components/MainContent';
import ScrollToTop from '@/src/components/ScrollToTop';
import Script from 'next/script';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata = {
  metadataBase: new URL('https://navmanchnews.com'), // CRITICAL: Set base URL for all metadata
  title: 'नव मंच - मराठी वृत्तपत्र | Nav Manch - Marathi Newspaper',
  description: 'नव मंच - ताज्या बातम्या, राष्ट्रीय, राज्य, शहर, युवा, राजकारण, आरोग्य, क्रीडा, शिक्षण आणि अधिक. ई-पेपर, लेख, ब्लॉग आणि घटनांची माहिती. Nav Manch - Latest Marathi news, e-paper, articles, blogs and events.',
  keywords: 'नव मंच, navmanch, navmanch news, navmanchnews, navmanchnews.com, मराठी वृत्तपत्र, मराठी बातम्या, ई-पेपर, navmanch epaper, navmanch newspapers, राष्ट्रीय बातम्या, राज्य बातम्या, शहर बातम्या, युवा बातम्या, राजकारण, आरोग्य, क्रीडा, शिक्षण, Nav Manch, Marathi newspaper, Marathi news, e-paper, Maharashtra news, Pune news',
  openGraph: {
    title: 'नव मंच - मराठी वृत्तपत्र | Nav Manch',
    description: 'ताज्या बातम्या, ई-पेपर, लेख, ब्लॉग आणि घटनांची माहिती. Latest Marathi news, e-paper, articles, blogs and events.',
    images: ['/logo1.png'],
    url: 'https://navmanchnews.com',
    type: 'website',
    locale: 'mr_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'नव मंच - मराठी वृत्तपत्र',
    description: 'ताज्या बातम्या, ई-पेपर, लेख आणि ब्लॉग',
    images: ['/logo1.png'],
  },
  alternates: {
    canonical: 'https://navmanchnews.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mr">
      <head>
        <meta name="google-site-verification" content="9EYPGNfReNhgGHGv-YQngXGCot6OzMgHrneZpM-493U" />
        <link rel="icon" type="image/x-icon" href="/logo1.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8RKDFTHRWM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8RKDFTHRWM');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsMediaOrganization",
              "@id": "https://navmanchnews.com",
              "name": "नव मंच",
              "alternateName": "Nav Manch",
              "url": "https://navmanchnews.com",
              "logo": "https://navmanchnews.com/logo1.png",
              "description": "नव मंच हे एक मराठी वृत्तपत्र आहे जे राष्ट्रीय, राज्य, शहर, युवा, राजकारण, आरोग्य, क्रीडा, शिक्षण आणि इतर विविध विषयांवर ताज्या बातम्या प्रदान करते. Nav Manch is a Marathi newspaper providing latest news on national, state, city, youth, politics, health, sports, education and various other topics.",
              "inLanguage": "mr",
              "publishingPrinciples": "https://navmanchnews.com/about",
              "sameAs": [
                "https://www.facebook.com/navmanch",
                "https://www.twitter.com/navmanch",
                "https://www.instagram.com/navmanch"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN",
                "addressRegion": "Maharashtra"
              }
            })
          }}
        />
      </head>
      <body>
        <HeaderProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <BreakingNewsTicker />
            <Navigation />
            <MainContent>
              {children}
            </MainContent>
            <ContactRibbon />
            <Footer />
            <ScrollToTop />
          </div>
        </HeaderProvider>
      </body>
    </html>
  );
}

