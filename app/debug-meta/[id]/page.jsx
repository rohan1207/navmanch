import { getArticle } from '@/src/utils/api';

// Debug page to see what meta tags are actually being generated
export default async function DebugMetaPage({ params }) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
    'https://navmanchnews.com';
  
  try {
    const article = await getArticle(id);
    
    if (!article) {
      return <div>Article not found</div>;
    }
    
    let imageUrl = article.featuredImage || article.imageGallery?.[0] || '';
    
    // Same optimization as metadata
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
      <html>
        <head>
          <title>Debug Meta Tags</title>
          <meta property="og:image" content={optimized} />
          <meta property="og:image:secure_url" content={optimized} />
          <meta property="og:image:width" content="600" />
          <meta property="og:image:height" content="315" />
          <meta property="og:image:type" content="image/jpeg" />
        </head>
        <body style={{ padding: '20px', fontFamily: 'monospace' }}>
          <h1>Meta Tag Debug</h1>
          <h2>Article:</h2>
          <p><strong>Title:</strong> {article.title}</p>
          <p><strong>Original Image:</strong> {imageUrl || 'NONE'}</p>
          <p><strong>Optimized Image:</strong> {optimized}</p>
          <p><strong>Base URL:</strong> {baseUrl}</p>
          <hr />
          <h2>Generated Meta Tags:</h2>
          <pre>{`<meta property="og:image" content="${optimized}" />
<meta property="og:image:secure_url" content="${optimized}" />
<meta property="og:image:width" content="600" />
<meta property="og:image:height" content="315" />
<meta property="og:image:type" content="image/jpeg" />`}</pre>
          <hr />
          <h2>Test Image:</h2>
          <img 
            src={optimized} 
            alt="Test" 
            style={{ maxWidth: '600px', border: '3px solid blue' }}
            onError={(e) => {
              e.target.style.border = '5px solid red';
              e.target.alt = 'IMAGE FAILED TO LOAD!';
            }}
            onLoad={(e) => {
              e.target.style.border = '5px solid green';
            }}
          />
          <p><strong>Image URL:</strong> <a href={optimized} target="_blank" rel="noopener">{optimized}</a></p>
        </body>
      </html>
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

