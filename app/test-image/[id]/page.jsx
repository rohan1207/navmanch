import { getArticle } from '@/src/utils/api';

// Test page to verify image URLs are correct
export default async function TestImagePage({ params }) {
  const { id } = await params;
  
  try {
    const article = await getArticle(id);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
      'https://navmanchnews.com';
    
    let imageUrl = article?.featuredImage || article?.imageGallery?.[0] || '';
    
    // Optimize same way as metadata
    let optimized = imageUrl.trim();
    if (!optimized.startsWith('http')) {
      optimized = optimized.startsWith('/') 
        ? `${baseUrl}${optimized}`
        : `${baseUrl}/logo1.png`;
    }
    if (optimized.startsWith('http://')) {
      optimized = optimized.replace('http://', 'https://');
    }
    
    if (optimized.includes('cloudinary.com') && optimized.includes('/image/upload/')) {
      const match = optimized.match(/(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(.*)/);
      if (match) {
        const base = match[1];
        const rest = match[2];
        const segments = rest.split('/');
        let publicId = segments[segments.length - 1];
        let version = '';
        if (segments.length >= 2 && segments[segments.length - 2].match(/^v\d+$/)) {
          version = segments[segments.length - 2];
          publicId = segments[segments.length - 1];
        }
        const transforms = 'w_600,h_315,c_fill,g_auto,q_60,f_jpg,fl_progressive,dpr_1';
        optimized = version
          ? `${base}${transforms}/${version}/${publicId}`
          : `${base}${transforms}/${publicId}`;
      }
    }
    
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Image URL Test</h1>
        <p><strong>Original:</strong> {imageUrl}</p>
        <p><strong>Optimized:</strong> {optimized}</p>
        <p><strong>Base URL:</strong> {baseUrl}</p>
        <hr />
        <h2>Test Image:</h2>
        <img 
          src={optimized} 
          alt="Test" 
          style={{ maxWidth: '100%', border: '2px solid red' }}
          onError={(e) => {
            e.target.style.border = '5px solid red';
            e.target.alt = 'IMAGE FAILED TO LOAD!';
          }}
          onLoad={(e) => {
            e.target.style.border = '5px solid green';
          }}
        />
        <hr />
        <h2>Meta Tag Preview:</h2>
        <pre>{`<meta property="og:image" content="${optimized}" />
<meta property="og:image:width" content="600" />
<meta property="og:image:height" content="315" />`}</pre>
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Error</h1>
        <pre>{error.message}</pre>
      </div>
    );
  }
}

