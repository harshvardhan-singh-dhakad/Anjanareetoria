import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/reader/', '/private-ebooks/', '/checkout'],
      },
    ],
    sitemap: 'https://arblessings.com/sitemap.xml',
    host: 'https://arblessings.com',
  }
}
