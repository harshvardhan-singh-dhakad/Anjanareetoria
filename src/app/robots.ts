import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'anthropic-ai',
          'Claude-Web',
          'PerplexityBot',
          'Google-Extended',
          'GoogleOther',
          'Applebot',
          'Applebot-Extended',
          'Meta-ExternalAgent',
          'FacebookBot',
          'cohere-ai',
          'Bytespider',
          'Amazonbot',
          'CCBot',
          'Diffbot',
          'YouBot',
        ],
        allow: '/',
        disallow: ['/api/', '/admin/', '/private-ebooks/'],
      },
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
