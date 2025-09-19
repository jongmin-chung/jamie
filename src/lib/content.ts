import fs from 'fs'
import path from 'path'
import { BlogPost, BlogPostMetadata } from '@/types/blog'
import {
  applyFrontmatterDefaults,
  parseFrontmatter,
  validateFrontmatter,
} from './frontmatter'
import { calculateReadingTime } from './markdown'

const CONTENT_DIR = path.join(process.cwd(), 'content/posts')

/**
 * Generate complete metadata for a blog post
 * @param post - Partial blog post data
 * @returns BlogPostMetadata - Complete metadata
 */
export function generateContentMetadata(
  post: Partial<BlogPost>
): BlogPostMetadata {
  const readingTime = post.content ? calculateReadingTime(post.content) : 0

  return {
    slug: post.slug || '',
    title: post.title || '',
    description: post.description || '',
    publishedAt: post.publishedAt || new Date(),
    updatedAt: post.updatedAt,
    category: post.category || 'general',
    tags: post.tags || [],
    author: post.author || 'Anonymous',
    readingTime,
  }
}

/**
 * Validate blog post data structure
 * @param post - Blog post object to validate
 * @returns boolean - Whether the post is valid
 */
export function validateBlogPost(post: unknown): post is BlogPost {
  if (!post || typeof post !== 'object') {
    return false
  }

  const postObj = post as Record<string, unknown>

  // Required fields
  const requiredFields = ['slug', 'title', 'content']
  for (const field of requiredFields) {
    if (!postObj[field] || typeof postObj[field] !== 'string') {
      return false
    }
  }

  // Slug validation - must be URL-safe
  if (!/^[a-z0-9-]+$/.test(postObj.slug as string)) {
    return false
  }

  // Title length validation
  if (
    (postObj.title as string).length < 5 ||
    (postObj.title as string).length > 100
  ) {
    return false
  }

  // Content length validation
  if ((postObj.content as string).length < 100) {
    return false
  }

  // Description length validation (if provided)
  if (
    postObj.description &&
    ((postObj.description as string).length < 10 ||
      (postObj.description as string).length > 200)
  ) {
    return false
  }

  // Tags validation - maximum 5 tags
  if (
    postObj.tags &&
    (!Array.isArray(postObj.tags) || (postObj.tags as string[]).length > 5)
  ) {
    return false
  }

  // Category validation
  if (postObj.category && typeof postObj.category !== 'string') {
    return false
  }

  // Author validation
  if (postObj.author && typeof postObj.author !== 'string') {
    return false
  }

  return true
}

/**
 * Get all blog posts from the content directory
 * @returns BlogPost[] - Array of all blog posts
 */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return []
  }

  const fileNames = fs.readdirSync(CONTENT_DIR)
  const posts: BlogPost[] = []

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md')) continue

    try {
      const post = getPostBySlug(fileName.replace('.md', ''))
      if (post) {
        posts.push(post)
      }
    } catch (error) {
      console.error(`Error loading post ${fileName}:`, error)
    }
  }

  // Sort by published date descending
  return posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}

/**
 * Get a single blog post by slug
 * @param slug - Post slug
 * @returns BlogPost | null - Blog post or null if not found
 */
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(CONTENT_DIR, `${slug}.md`)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = parseFrontmatter(fileContents)

    if (!validateFrontmatter(data)) {
      console.error(`Invalid frontmatter in ${slug}.md`)
      return null
    }

    const frontmatterWithDefaults = applyFrontmatterDefaults(data)

    const post: BlogPost = {
      slug,
      title: frontmatterWithDefaults.title,
      description: frontmatterWithDefaults.description,
      content,
      publishedAt: new Date(frontmatterWithDefaults.publishedAt),
      updatedAt: frontmatterWithDefaults.updatedAt
        ? new Date(frontmatterWithDefaults.updatedAt)
        : undefined,
      category: frontmatterWithDefaults.category,
      tags: frontmatterWithDefaults.tags,
      author: frontmatterWithDefaults.author,
      readingTime: calculateReadingTime(content),
    }

    return validateBlogPost(post) ? post : null
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error)
    return null
  }
}

/**
 * Get posts by category
 * @param category - Category to filter by
 * @returns BlogPost[] - Filtered posts
 */
export function getPostsByCategory(category: string): BlogPost[] {
  const allPosts = getAllPosts()
  return allPosts.filter((post) => post.category === category)
}

/**
 * Get featured posts (first 5 most recent posts)
 * @returns BlogPost[] - Featured posts
 */
export function getFeaturedPosts(): BlogPost[] {
  const allPosts = getAllPosts()
  return allPosts.slice(0, 5)
}

/**
 * Get related posts based on tags and category
 * @param post - Current post
 * @param limit - Maximum number of related posts
 * @returns BlogPost[] - Related posts
 */
export function getRelatedPosts(post: BlogPost, limit: number = 3): BlogPost[] {
  const allPosts = getAllPosts().filter((p) => p.slug !== post.slug)

  const related = allPosts
    .map((p) => ({
      post: p,
      score: calculateRelatedScore(post, p),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post)

  return related
}

/**
 * Calculate relatedness score between two posts
 * @param post1 - First post
 * @param post2 - Second post
 * @returns number - Relatedness score
 */
function calculateRelatedScore(post1: BlogPost, post2: BlogPost): number {
  let score = 0

  // Same category gets high score
  if (post1.category === post2.category) {
    score += 10
  }

  // Common tags
  const commonTags = post1.tags.filter((tag) => post2.tags.includes(tag))
  score += commonTags.length * 5

  // Same author
  if (post1.author === post2.author) {
    score += 3
  }

  return score
}
