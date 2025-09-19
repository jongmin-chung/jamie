import { describe, expect, test } from '@jest/globals'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { BlogPost, BlogPostMetadata } from '@/types/blog'

describe('Posts API Contract Tests', () => {
  const postsDir = join(process.cwd(), 'content', 'posts')
  const metadataFile = join(process.cwd(), 'public', 'posts-metadata.json')

  test('posts metadata file should exist and be valid JSON', () => {
    expect(existsSync(metadataFile)).toBe(true)

    const content = readFileSync(metadataFile, 'utf-8')
    const metadata = JSON.parse(content)

    expect(Array.isArray(metadata)).toBe(true)
    expect(metadata.length).toBeGreaterThan(0)
  })

  test('each post metadata should have required fields', () => {
    const content = readFileSync(metadataFile, 'utf-8')
    const metadata: BlogPostMetadata[] = JSON.parse(content)

    metadata.forEach((post, index) => {
      expect(post).toMatchObject({
        slug: expect.any(String),
        title: expect.any(String),
        date: expect.any(String),
        category: expect.any(String),
        tags: expect.any(Array),
        excerpt: expect.any(String),
        readingTime: expect.any(Number),
      })

      // Validate date format (YYYY-MM-DD)
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)

      // Validate required Korean content
      expect(post.title.length).toBeGreaterThan(0)
      expect(post.excerpt.length).toBeGreaterThan(0)

      // Validate tags are strings
      post.tags.forEach((tag) => {
        expect(typeof tag).toBe('string')
        expect(tag.length).toBeGreaterThan(0)
      })
    })
  })

  test('post files should exist for each metadata entry', () => {
    const content = readFileSync(metadataFile, 'utf-8')
    const metadata: BlogPostMetadata[] = JSON.parse(content)

    metadata.forEach((post) => {
      const postPath = join(postsDir, `${post.slug}.md`)
      expect(existsSync(postPath)).toBe(true)
    })
  })

  test('post files should have valid frontmatter structure', () => {
    const content = readFileSync(metadataFile, 'utf-8')
    const metadata: BlogPostMetadata[] = JSON.parse(content)

    // Test first 5 posts to avoid long test times
    metadata.slice(0, 5).forEach((postMeta) => {
      const postPath = join(postsDir, `${postMeta.slug}.md`)
      const postContent = readFileSync(postPath, 'utf-8')

      // Should start with frontmatter delimiter
      expect(postContent).toMatch(/^---\n/)

      // Should contain required frontmatter fields
      expect(postContent).toMatch(/title:\s*.+/)
      expect(postContent).toMatch(/date:\s*\d{4}-\d{2}-\d{2}/)
      expect(postContent).toMatch(/category:\s*.+/)
      expect(postContent).toMatch(/tags:\s*\[.+\]/)
      expect(postContent).toMatch(/excerpt:\s*.+/)

      // Should have content after frontmatter
      const parts = postContent.split('---')
      expect(parts.length).toBeGreaterThanOrEqual(3)
      expect(parts[2].trim().length).toBeGreaterThan(100) // Substantial content
    })
  })

  test('should have at least 50 blog posts as specified', () => {
    const content = readFileSync(metadataFile, 'utf-8')
    const metadata: BlogPostMetadata[] = JSON.parse(content)

    expect(metadata.length).toBeGreaterThanOrEqual(50)
  })

  test('posts should cover all required categories', () => {
    const content = readFileSync(metadataFile, 'utf-8')
    const metadata: BlogPostMetadata[] = JSON.parse(content)

    const categories = metadata.map((post) => post.category)
    const uniqueCategories = [...new Set(categories)]

    // Should have categories for: frontend, backend, devops, design, career/trends
    expect(uniqueCategories.length).toBeGreaterThanOrEqual(5)

    // Each category should have multiple posts
    uniqueCategories.forEach((category) => {
      const postsInCategory = categories.filter((cat) => cat === category)
      expect(postsInCategory.length).toBeGreaterThan(1)
    })
  })
})
