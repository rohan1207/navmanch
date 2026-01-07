// Prefetch utility for faster navigation
import { getArticlesByCategory, getArticle, getCategories } from './api';

// Prefetch data when user hovers over links
export const prefetchOnHover = (element, prefetchFn) => {
  if (!element) return;

  let prefetched = false;
  let timeoutId = null;

  const handleMouseEnter = () => {
    // Prefetch after 100ms hover (to avoid prefetching on accidental hovers)
    timeoutId = setTimeout(() => {
      if (!prefetched) {
        prefetchFn();
        prefetched = true;
      }
    }, 100);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
    if (timeoutId) clearTimeout(timeoutId);
  };
};

// Prefetch category articles on link hover
export const prefetchCategory = (categoryId) => {
  if (!categoryId) return;
  getArticlesByCategory(categoryId).catch(() => {
    // Silently fail - prefetching is optional
  });
};

// Prefetch article on link hover
export const prefetchArticle = (articleId) => {
  if (!articleId) return;
  getArticle(articleId).catch(() => {
    // Silently fail - prefetching is optional
  });
};

// Prefetch categories (call on app load)
export const prefetchCategories = () => {
  getCategories().catch(() => {
    // Silently fail
  });
};

