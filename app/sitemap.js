const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://navmanchnews.com';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://navmanch-backend.onrender.com/api';

// Helper to format date for sitemap
const formatDate = (date) => {
  if (!date) return new Date().toISOString().split('T')[0];
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Fetch all news articles
async function getAllNews() {
  try {
    const response = await fetch(`${API_BASE}/news?status=published&limit=1000`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    }
  } catch (error) {
    console.error('Error fetching news:', error);
  }
  return [];
}

// Fetch all articles
async function getAllArticles() {
  try {
    const response = await fetch(`${API_BASE}/articles?status=published&limit=1000`, {
      next: { revalidate: 3600 }
    });
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
  }
  return [];
}


// Fetch all categories
async function getAllCategories() {
  try {
    const response = await fetch(`${API_BASE}/admin/categories`, {
      next: { revalidate: 3600 }
    });
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
  return [];
}

// Fetch all epapers
async function getAllEpapers() {
  try {
    const response = await fetch(`${API_BASE}/epapers`, {
      next: { revalidate: 3600 }
    });
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    }
  } catch (error) {
    console.error('Error fetching epapers:', error);
  }
  return [];
}

export default async function sitemap() {
  const currentDate = formatDate(new Date());

  // Static pages
  const staticPages = [
    {
      url: `${SITE_URL}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/epaper`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/shorts`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Fetch dynamic content
  const [news, articles, categories, epapers] = await Promise.all([
    getAllNews(),
    getAllArticles(),
    getAllCategories(),
    getAllEpapers(),
  ]);

  // Generate news URLs
  const newsUrls = news.map((item) => {
    const id = item.id || item._id || item.slug;
    return {
      url: `${SITE_URL}/news/${id}`,
      lastModified: formatDate(item.updatedAt || item.createdAt || item.date),
      changeFrequency: 'weekly',
      priority: 0.7,
    };
  });

  // Generate article URLs
  const articleUrls = articles.map((item) => {
    const id = item.id || item._id || item.slug;
    return {
      url: `${SITE_URL}/article/${id}`,
      lastModified: formatDate(item.updatedAt || item.createdAt || item.date),
      changeFrequency: 'weekly',
      priority: 0.7,
    };
  });

  // Generate category URLs
  const categoryUrls = categories.map((category) => {
    const id = category.id || category._id;
    return {
      url: `${SITE_URL}/category/${id}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.6,
    };
  });

  // Generate epaper URLs
  const epaperUrls = [];
  if (epapers && Array.isArray(epapers)) {
    epapers.forEach((epaper) => {
      const epaperId = epaper.id || epaper._id || epaper.slug;
      
      // Main epaper page
      epaperUrls.push({
        url: `${SITE_URL}/epaper/${epaperId}`,
        lastModified: formatDate(epaper.date || epaper.updatedAt || epaper.createdAt),
        changeFrequency: 'daily',
        priority: 0.8,
      });

      // Epaper pages and sections
      if (epaper.pages && Array.isArray(epaper.pages)) {
        epaper.pages.forEach((page) => {
          const pageNo = page.pageNo || page.pageNumber;
          
          // Page URL
          epaperUrls.push({
            url: `${SITE_URL}/epaper/${epaperId}/page/${pageNo}`,
            lastModified: formatDate(epaper.date || epaper.updatedAt || epaper.createdAt),
            changeFrequency: 'daily',
            priority: 0.7,
          });

          // Section URLs
          if (page.news && Array.isArray(page.news)) {
            page.news.forEach((section) => {
              const sectionId = section.id || section._id || section.slug;
              if (sectionId) {
                epaperUrls.push({
                  url: `${SITE_URL}/epaper/${epaperId}/page/${pageNo}/section/${sectionId}`,
                  lastModified: formatDate(epaper.date || epaper.updatedAt || epaper.createdAt),
                  changeFrequency: 'daily',
                  priority: 0.6,
                });
              }
            });
          }
        });
      }
    });
  }

  // Combine all URLs
  return [
    ...staticPages,
    ...newsUrls,
    ...articleUrls,
    ...categoryUrls,
    ...epaperUrls,
  ];
}

