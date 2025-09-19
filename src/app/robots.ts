import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://tech.jamie.kr'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
