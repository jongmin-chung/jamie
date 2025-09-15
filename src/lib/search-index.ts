import { BlogPost } from '@/types/blog';
import { SearchIndex, SearchIndexItem } from '@/types/search';
import { extractPlainText } from './markdown';

/**
 * Generate search index from blog posts
 * @param posts - Array of blog posts
 * @returns SearchIndex - Search index for client-side search
 */
export function generateSearchIndex(posts: BlogPost[]): SearchIndex {
  return posts.map(post => ({
    id: post.slug,
    title: post.title,
    description: post.description,
    content: extractPlainText(post.content),
    category: post.category,
    tags: post.tags,
    publishedAt: post.publishedAt.toISOString().split('T')[0] // YYYY-MM-DD format
  }));
}

/**
 * Add a single post to existing search index
 * @param index - Existing search index
 * @param post - Blog post to add
 * @returns SearchIndex - Updated search index
 */
export function addToSearchIndex(index: SearchIndex, post: BlogPost): SearchIndex {
  const newItem: SearchIndexItem = {
    id: post.slug,
    title: post.title,
    description: post.description,
    content: extractPlainText(post.content),
    category: post.category,
    tags: post.tags,
    publishedAt: post.publishedAt.toISOString().split('T')[0]
  };

  // Remove existing item if it exists
  const filteredIndex = index.filter(item => item.id !== post.slug);
  
  return [...filteredIndex, newItem];
}

/**
 * Remove post from search index
 * @param index - Existing search index
 * @param slug - Slug of post to remove
 * @returns SearchIndex - Updated search index
 */
export function removeFromSearchIndex(index: SearchIndex, slug: string): SearchIndex {
  return index.filter(item => item.id !== slug);
}

/**
 * Update search index item
 * @param index - Existing search index
 * @param post - Updated blog post
 * @returns SearchIndex - Updated search index
 */
export function updateSearchIndex(index: SearchIndex, post: BlogPost): SearchIndex {
  return addToSearchIndex(index, post);
}

/**
 * Get search index statistics
 * @param index - Search index
 * @returns Object with index statistics
 */
export function getSearchIndexStats(index: SearchIndex) {
  const totalItems = index.length;
  const categories = [...new Set(index.map(item => item.category))];
  const allTags = index.flatMap(item => item.tags);
  const uniqueTags = [...new Set(allTags)];
  
  const categoryCount = categories.reduce((acc, category) => {
    acc[category] = index.filter(item => item.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  const tagCount = uniqueTags.reduce((acc, tag) => {
    acc[tag] = allTags.filter(t => t === tag).length;
    return acc;
  }, {} as Record<string, number>);

  const totalContentLength = index.reduce((sum, item) => sum + item.content.length, 0);
  const averageContentLength = Math.round(totalContentLength / totalItems);

  return {
    totalItems,
    categories: categories.length,
    tags: uniqueTags.length,
    categoryDistribution: categoryCount,
    tagDistribution: tagCount,
    averageContentLength,
    indexSize: JSON.stringify(index).length
  };
}

/**
 * Validate search index structure
 * @param index - Search index to validate
 * @returns boolean - Whether index is valid
 */
export function validateSearchIndex(index: SearchIndex): boolean {
  if (!Array.isArray(index)) {
    return false;
  }

  return index.every(item => {
    return (
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.description === 'string' &&
      typeof item.content === 'string' &&
      typeof item.category === 'string' &&
      Array.isArray(item.tags) &&
      typeof item.publishedAt === 'string'
    );
  });
}

/**
 * Optimize search index by removing duplicates and empty content
 * @param index - Search index to optimize
 * @returns SearchIndex - Optimized index
 */
export function optimizeSearchIndex(index: SearchIndex): SearchIndex {
  // Remove duplicates based on id
  const uniqueItems = index.reduce((acc, current) => {
    const existing = acc.find(item => item.id === current.id);
    if (!existing) {
      acc.push(current);
    }
    return acc;
  }, [] as SearchIndex);

  // Filter out items with empty or very short content
  return uniqueItems.filter(item => 
    item.title.trim() !== '' &&
    item.content.trim().length > 10 // Minimum content length
  );
}

/**
 * Convert search index to JSON string for storage
 * @param index - Search index
 * @returns string - JSON string
 */
export function serializeSearchIndex(index: SearchIndex): string {
  const optimizedIndex = optimizeSearchIndex(index);
  return JSON.stringify(optimizedIndex, null, 0); // No pretty printing for smaller size
}

/**
 * Parse search index from JSON string
 * @param jsonString - JSON string
 * @returns SearchIndex - Parsed search index
 */
export function deserializeSearchIndex(jsonString: string): SearchIndex {
  try {
    const parsed = JSON.parse(jsonString);
    return validateSearchIndex(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing search index JSON:', error);
    return [];
  }
}