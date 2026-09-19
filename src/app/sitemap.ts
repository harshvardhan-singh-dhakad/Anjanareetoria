import type { MetadataRoute } from 'next';
import { getProductsAsync, getBooksAsync, getBlogsAsync } from '@/lib/db/cmsStore';

const BASE_URL = 'https://arblessings.com';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const coreRoutes = [
    '/',
    '/books',
    '/ebooks',
    '/courses',
    '/webinars',
    '/blog',
    '/about-us',
    '/contact-us',
    '/privacy-policy-2',
    '/refund-policy',
    '/shipping-policy',
    '/term-of-service-policy',
  ];

  const [products, books, blogs] = await Promise.all([
    getProductsAsync(),
    getBooksAsync(),
    getBlogsAsync(),
  ]);

  const routes: MetadataRoute.Sitemap = coreRoutes.map((path) => ({
    url: BASE_URL + path,
    changeFrequency:
      path === '/' ? 'daily' :
      path === '/books' || path === '/blog' ? 'weekly' :
      'monthly',
    priority:
      path === '/' ? 1 :
      path === '/books' ? 0.9 :
      path === '/blog' ? 0.8 :
      0.7,
  }));

  return [
    ...routes,
    ...products.map((product) => ({
      url: BASE_URL + '/product/' + product.slug,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...books.map((book) => ({
      url: BASE_URL + '/books/' + book.slug,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...blogs.map((post) => ({
      url: BASE_URL + '/blog/' + post.slug,
      changeFrequency: 'monthly' as const,
      priority: post.featured ? 0.8 : 0.7,
    })),
  ];
}
