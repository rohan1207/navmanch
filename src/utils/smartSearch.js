// Smart search utility - matches search queries to pages and categories
// Supports both English and Marathi search terms

// All available categories with their search terms
const categories = [
  { 
    id: 'latest-news', 
    name: 'ताज्या बातम्या', 
    path: '/category/latest-news',
    searchTerms: [
      'ताज्या बातम्या', 'tazya batmya', 'latest news', 'live news', 
      'ताजी बातमी', 'taji batmi', 'latest', 'live', 'breaking news',
      'breaking', 'news', 'बातम्या', 'batmya', 'ताज्या', 'tazya'
    ]
  },
  { 
    id: 'pune', 
    name: 'पुणे', 
    path: '/category/pune',
    searchTerms: ['पुणे', 'pune', 'punya', 'punya news', 'पुणे बातम्या']
  },
  { 
    id: 'maharashtra', 
    name: 'महाराष्ट्र', 
    path: '/category/maharashtra',
    searchTerms: [
      'महाराष्ट्र', 'maharashtra', 'maharastra', 'maharastra news',
      'महाराष्ट्र बातम्या', 'mh', 'maharashtra news'
    ]
  },
  { 
    id: 'national-international', 
    name: 'देश विदेश', 
    path: '/category/national-international',
    searchTerms: [
      'देश विदेश', 'desh videsh', 'national international', 'national', 
      'international', 'देश', 'विदेश', 'desh', 'videsh', 'india', 
      'world news', 'world', 'national news'
    ]
  },
  { 
    id: 'information-technology', 
    name: 'माहिती तंत्रज्ञान', 
    path: '/category/information-technology',
    searchTerms: [
      'माहिती तंत्रज्ञान', 'mahiti tantrajnan', 'information technology', 
      'it', 'tech', 'technology', 'तंत्रज्ञान', 'tantrajnan', 'tech news',
      'it news', 'technology news', 'माहिती', 'mahiti'
    ]
  },
  { 
    id: 'lifestyle', 
    name: 'लाईफस्टाईल', 
    path: '/category/lifestyle',
    searchTerms: [
      'लाईफस्टाईल', 'lifestyle', 'life style', 'lifestyle news',
      'life', 'style', 'जीवनशैली', 'jivanshaili'
    ]
  },
  { 
    id: 'column-articles', 
    name: 'स्तंभ लेख', 
    path: '/category/column-articles',
    searchTerms: [
      'स्तंभ लेख', 'stambh lekh', 'column articles', 'column', 
      'लेख', 'lekh', 'articles', 'article', 'opinion', 'features',
      'स्तंभ', 'stambh'
    ]
  },
  { 
    id: 'entertainment', 
    name: 'मनोरंजन', 
    path: '/category/entertainment',
    searchTerms: [
      'मनोरंजन', 'manoranjan', 'entertainment', 'entertain', 
      'entertainment news', 'bollywood', 'movies', 'films', 'cinema'
    ]
  },
  { 
    id: 'sports', 
    name: 'क्रीडा', 
    path: '/category/sports',
    searchTerms: [
      'क्रीडा', 'krida', 'sports', 'sport', 'खेळ', 'khel', 
      'sports news', 'cricket', 'football', 'hockey', 'क्रिकेट'
    ]
  },
  { 
    id: 'health', 
    name: 'आरोग्य', 
    path: '/category/health',
    searchTerms: [
      'आरोग्य', 'arogya', 'health', 'swasthya', 'स्वास्थ्य', 
      'health news', 'wellness', 'medical', 'medicine', 'आरोग्य बातम्या'
    ]
  },
  { 
    id: 'editorial', 
    name: 'संपादकीय', 
    path: '/category/editorial',
    searchTerms: [
      'संपादकीय', 'sampadakiy', 'editorial', 'editor', 
      'editorial news', 'editorial article', 'संपादक', 'sampadak'
    ]
  },
];

// All available pages with their search terms
const pages = [
  { 
    name: 'ई पेपर', 
    path: '/epaper',
    searchTerms: [
      'ई पेपर', 'e paper', 'epaper', 'paper', 'पेपर', 
      'ई-पेपर', 'e-paper', 'ईपेपर', 'newspaper', 'news paper',
      'digital paper', 'epaper view', 'view epaper', 'read paper'
    ]
  },
  { 
    name: 'आमचे कार्यक्रम', 
    path: '/events',
    searchTerms: [
      'आमचे कार्यक्रम', 'amche karyakram', 'events', 'event', 
      'कार्यक्रम', 'karyakram', 'program', 'programs', 'programme',
      'upcoming events', 'event calendar', 'कार्यक्रम सूची'
    ]
  },
  { 
    name: 'गॅलरी', 
    path: '/gallery',
    searchTerms: [
      'गॅलरी', 'gallery', 'galeri', 'photos', 'फोटो', 'photo', 
      'images', 'चित्रे', 'pictures', 'pics', 'image gallery',
      'photo gallery', 'फोटो गॅलरी'
    ]
  },
  { 
    name: 'लेख', 
    path: '/articles',
    searchTerms: [
      'लेख', 'lekh', 'articles', 'article', 'opinion', 'features',
      'opinion articles', 'feature articles', 'columns', 'लेख वाचा'
    ]
  },
  { 
    name: 'शॉर्ट्स', 
    path: '/shorts',
    searchTerms: [
      'शॉर्ट्स', 'shorts', 'short', 'youtube shorts', 'video', 
      'व्हिडिओ', 'videos', 'youtube', 'short videos', 'video shorts'
    ]
  },
  { 
    name: 'आमच्याबद्दल', 
    path: '/about',
    searchTerms: [
      'आमच्याबद्दल', 'amchyabaddal', 'about', 'about us', 
      'बद्दल', 'baddal', 'about page', 'who we are', 'our story'
    ]
  },
  { 
    name: 'संपर्क', 
    path: '/contact',
    searchTerms: [
      'संपर्क', 'sampark', 'contact', 'contact us', 'get in touch',
      'reach us', 'संपर्क करा', 'contact page', 'get contact'
    ]
  },
];

// Normalize search query for matching
const normalizeQuery = (query) => {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/[^\w\s\u0900-\u097F]/g, ''); // Remove special chars but keep Devanagari
};

// Check if query matches any search terms
const matchesSearchTerm = (query, searchTerms) => {
  const normalizedQuery = normalizeQuery(query);
  
  return searchTerms.some(term => {
    const normalizedTerm = normalizeQuery(term);
    
    // Exact match
    if (normalizedQuery === normalizedTerm) {
      return true;
    }
    
    // Query starts with term or term starts with query (for partial matches)
    if (normalizedQuery.startsWith(normalizedTerm) || normalizedTerm.startsWith(normalizedQuery)) {
      return true;
    }
    
    // Check if query contains term or term contains query (for word matching)
    if (normalizedQuery.includes(normalizedTerm) || normalizedTerm.includes(normalizedQuery)) {
      return true;
    }
    
    // Split into words and check individual word matches
    const queryWords = normalizedQuery.split(/\s+/);
    const termWords = normalizedTerm.split(/\s+/);
    
    // If any word from query matches any word from term
    return queryWords.some(qWord => 
      termWords.some(tWord => 
        qWord === tWord || 
        qWord.startsWith(tWord) || 
        tWord.startsWith(qWord)
      )
    );
  });
};

// Smart search - returns path if match found, null otherwise
export const getSmartSearchPath = (query) => {
  if (!query || !query.trim()) {
    return null;
  }

  // First check pages (higher priority)
  for (const page of pages) {
    if (matchesSearchTerm(query, page.searchTerms)) {
      return page.path;
    }
  }

  // Then check categories
  for (const category of categories) {
    if (matchesSearchTerm(query, category.searchTerms)) {
      return category.path;
    }
  }

  // No match found - return null to show search results
  return null;
};

// Get suggestions for a query
export const getSearchSuggestions = (query, limit = 5) => {
  if (!query || !query.trim()) {
    return [];
  }

  const suggestions = [];
  const queryLower = normalizeQuery(query);

  // Check pages
  pages.forEach(page => {
    if (matchesSearchTerm(query, page.searchTerms)) {
      suggestions.push({ ...page, type: 'page', priority: 1 });
    }
  });

  // Check categories
  categories.forEach(cat => {
    if (matchesSearchTerm(query, cat.searchTerms)) {
      suggestions.push({ ...cat, type: 'category', priority: 2 });
    }
  });

  // Sort by priority (pages first) and limit
  return suggestions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit);
};

// Export categories and pages for use in SearchPage
export { categories, pages };

