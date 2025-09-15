import matter from 'gray-matter';
import { FrontmatterData, ParsedPost } from '@/types/blog';

/**
 * Parse frontmatter from markdown content
 * @param markdown - Raw markdown string with frontmatter
 * @returns ParsedPost - Parsed frontmatter data and content
 */
export function parseFrontmatter(markdown: string): ParsedPost {
  if (!markdown) {
    return {
      data: {} as FrontmatterData,
      content: ''
    };
  }

  try {
    const parsed = matter(markdown);
    
    return {
      data: parsed.data as FrontmatterData,
      content: parsed.content
    };
  } catch (error) {
    console.error('Error parsing frontmatter:', error);
    return {
      data: {} as FrontmatterData,
      content: markdown
    };
  }
}

/**
 * Validate frontmatter data
 * @param data - Frontmatter data object
 * @returns boolean - Whether frontmatter is valid
 */
export function validateFrontmatter(data: unknown): data is FrontmatterData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const dataObj = data as Record<string, unknown>;

  // Required fields
  const requiredFields = ['title', 'publishedAt'];
  for (const field of requiredFields) {
    if (!dataObj[field]) {
      return false;
    }
  }

  // Type checks
  if (typeof dataObj.title !== 'string' || (dataObj.title as string).trim() === '') {
    return false;
  }

  if (typeof dataObj.publishedAt !== 'string') {
    return false;
  }

  // Optional fields type checks
  if (dataObj.description && typeof dataObj.description !== 'string') {
    return false;
  }

  if (dataObj.category && typeof dataObj.category !== 'string') {
    return false;
  }

  if (dataObj.tags && !Array.isArray(dataObj.tags)) {
    return false;
  }

  if (dataObj.author && typeof dataObj.author !== 'string') {
    return false;
  }

  return true;
}

/**
 * Extract frontmatter defaults for missing fields
 * @param data - Partial frontmatter data
 * @returns FrontmatterData - Complete frontmatter with defaults
 */
export function applyFrontmatterDefaults(data: Partial<FrontmatterData>): FrontmatterData {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  return {
    title: data.title || 'Untitled',
    description: data.description || '',
    publishedAt: data.publishedAt || now,
    updatedAt: data.updatedAt,
    category: data.category || 'general',
    tags: data.tags || [],
    author: data.author || 'Anonymous'
  };
}

/**
 * Convert frontmatter to YAML string
 * @param data - Frontmatter data
 * @returns string - YAML frontmatter block
 */
export function stringifyFrontmatter(data: FrontmatterData): string {
  const yamlData = {
    title: data.title,
    description: data.description,
    publishedAt: data.publishedAt,
    ...(data.updatedAt && { updatedAt: data.updatedAt }),
    category: data.category,
    tags: data.tags,
    author: data.author
  };

  const yamlString = Object.entries(yamlData)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
      }
      return `${key}: "${value}"`;
    })
    .join('\n');

  return `---\n${yamlString}\n---`;
}