import { MetadataRoute } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tech.kakaopay.com'
  
  // Read posts metadata from static file
  const postsMetadataPath = join(process.cwd(), 'public', 'posts-metadata.json')
  let posts: any[] = []
  
  try {
    const postsData = readFileSync(postsMetadataPath, 'utf8')
    posts = JSON.parse(postsData)
  } catch (error) {
    console.error('Failed to read posts metadata for sitemap:', error)
    // Continue without posts if file doesn't exist during build
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily', 
      priority: 0.9,
    },
  ]

  const postPages: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${baseUrl}/blog/${post.id || post.slug}`,
    lastModified: new Date(post.publishedAt || post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...postPages]
}