import { getProducts, getBooks, getWebinars, getBlogs, ExtendedBook, ExtendedBlogPost, Webinar } from '@/lib/db/cmsStore';
import { Product } from '@/data/products';

export interface CrossRecommendations {
  relatedProducts: Product[];
  relatedBooks: ExtendedBook[];
  relatedWebinars: Webinar[];
  relatedBlogs: ExtendedBlogPost[];
}

/**
 * Intelligent dynamic recommendation engine.
 * Automatically fetches from persistent storage and updates whenever
 * items are added, edited, or categorized in the Admin Panel.
 */
export function getCrossRecommendations(options: {
  currentType: 'product' | 'book' | 'webinar' | 'blog';
  currentSlug?: string;
  category?: string;
  tags?: string[];
  limitProducts?: number;
  limitBooks?: number;
  limitWebinars?: number;
  limitBlogs?: number;
}): CrossRecommendations {
  const {
    currentSlug,
    category,
    limitProducts = 4,
    limitBooks = 3,
    limitWebinars = 2,
    limitBlogs = 3,
  } = options;

  // 1. Related Products
  const allProducts = getProducts();
  const filteredProducts = allProducts
    .filter((p) => p.slug !== currentSlug)
    .sort((a, b) => {
      // Prioritize same category
      if (category && a.category === category && b.category !== category) return -1;
      if (category && b.category === category && a.category !== category) return 1;
      return 0;
    })
    .slice(0, limitProducts);

  // 2. Related Books
  const allBooks = getBooks();
  const filteredBooks = allBooks
    .filter((b) => b.slug !== currentSlug)
    .sort((a, b) => {
      if (category && a.category === category && b.category !== category) return -1;
      if (category && b.category === category && a.category !== category) return 1;
      return 0;
    })
    .slice(0, limitBooks);

  // 3. Related Webinars
  const allWebinars = getWebinars();
  const filteredWebinars = allWebinars
    .filter((w) => w.slug !== currentSlug)
    .sort((a, b) => {
      // Prioritize upcoming or live webinars
      if (a.status === 'live') return -1;
      if (b.status === 'live') return 1;
      if (a.status === 'upcoming' && b.status === 'completed') return -1;
      if (b.status === 'upcoming' && a.status === 'completed') return 1;
      return 0;
    })
    .slice(0, limitWebinars);

  // 4. Related Blogs
  const allBlogs = getBlogs();
  const filteredBlogs = allBlogs
    .filter((b) => b.slug !== currentSlug)
    .sort((a, b) => {
      if (category && a.category === category && b.category !== category) return -1;
      if (category && b.category === category && a.category !== category) return 1;
      return 0;
    })
    .slice(0, limitBlogs);

  return {
    relatedProducts: filteredProducts,
    relatedBooks: filteredBooks,
    relatedWebinars: filteredWebinars,
    relatedBlogs: filteredBlogs,
  };
}
