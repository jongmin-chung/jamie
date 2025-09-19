import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'

/**
 * Parse markdown content and convert to HTML
 * @param markdown - Raw markdown string
 * @returns Promise<string> - HTML string
 */
export async function parseMarkdown(markdown: string): Promise<string> {
  if (!markdown || markdown.trim() === '') {
    return ''
  }

  try {
    const processed = await remark()
      .use(remarkGfm) // GitHub Flavored Markdown
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSlug) // Add IDs to headings
      .use(rehypeHighlight, {
        // Configure syntax highlighting
        detect: true,
        subset: ['javascript', 'typescript', 'html', 'css', 'json', 'bash'],
      })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(markdown)

    return processed.toString()
  } catch (error) {
    console.error('Error parsing markdown:', error)
    throw new Error('Failed to parse markdown content')
  }
}

/**
 * Extract plain text from markdown (for search indexing)
 * @param markdown - Raw markdown string
 * @returns string - Plain text without markdown syntax
 */
export function extractPlainText(markdown: string): string {
  if (!markdown) return ''

  return (
    markdown
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove emphasis
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Remove horizontal rules
      .replace(/^---+$/gm, '')
      // Remove list markers
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove blockquotes
      .replace(/^>\s+/gm, '')
      // Clean up whitespace
      .replace(/\n\s*\n/g, '\n')
      .trim()
  )
}

/**
 * Get reading time estimate for markdown content
 * @param markdown - Raw markdown string
 * @returns number - Estimated reading time in minutes
 */
export function calculateReadingTime(markdown: string): number {
  if (!markdown) return 0

  const plainText = extractPlainText(markdown)
  const words = plainText.split(/\s+/).filter((word) => word.length > 0)

  // Average reading speed: 200 words per minute
  // For Korean text, we might adjust this slightly
  const wordsPerMinute = 200
  const readingTime = Math.ceil(words.length / wordsPerMinute)

  return Math.max(1, readingTime) // Minimum 1 minute
}

/**
 * Extract headings from markdown for table of contents
 * @param markdown - Raw markdown string
 * @returns Array of heading objects
 */
export function extractHeadings(markdown: string): Array<{
  level: number
  text: string
  slug: string
}> {
  if (!markdown) return []

  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: Array<{ level: number; text: string; slug: string }> = []
  let match

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    headings.push({ level, text, slug })
  }

  return headings
}
