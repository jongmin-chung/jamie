import FlexSearch from 'flexsearch'
import { SearchIndex, SearchResult } from '@/types/search'

type FlexSearchIndex = FlexSearch.Index;

/**
 * Create a search engine from search index
 * @param searchIndex - Pre-built search index
 * @param options - Search engine options
 * @returns Search engine instance
 */
export function createSearchEngine(
  searchIndex: SearchIndex,
): {
  titleIndex: FlexSearchIndex;
  contentIndex: FlexSearchIndex;
  descriptionIndex: FlexSearchIndex;
  searchIndex: SearchIndex;
} {
  // Create separate indexes for different fields with different weights
  const titleIndex = new FlexSearch.Index({
    encode: 'simple',
    cache: 100
  })

  const contentIndex = new FlexSearch.Index({
    encode: 'simple',
    cache: 100
  })

  const descriptionIndex = new FlexSearch.Index({
    encode: 'simple',
    cache: 100
  })

  // Build indexes
  searchIndex.forEach((item, index) => {
    titleIndex.add(index, item.title)
    contentIndex.add(index, item.content)
    descriptionIndex.add(index, item.description)
  })

  return {
    titleIndex,
    contentIndex,
    descriptionIndex,
    searchIndex
  }
}

/**
 * Search posts using the search engine
 * @param searchEngine - Search engine instance
 * @param query - Search query
 * @param limit - Maximum number of results
 * @returns SearchResult[] - Array of search results
 */
export function searchPosts(
  searchEngine: {
    titleIndex: FlexSearchIndex;
    contentIndex: FlexSearchIndex;
    descriptionIndex: FlexSearchIndex;
    searchIndex: SearchIndex;
  },
  query: string,
  limit: number = 10
): SearchResult[] {
  if (!query || query.trim() === '') {
    return []
  }

  const normalizedQuery = normalizeKoreanText(query.toLowerCase().trim())
  
  // Search in different fields with different weights
  const titleResults = searchEngine.titleIndex.search(normalizedQuery, limit * 2)
  const contentResults = searchEngine.contentIndex.search(normalizedQuery, limit * 2)
  const descriptionResults = searchEngine.descriptionIndex.search(normalizedQuery, limit * 2)

  // Combine results with scoring
  const combinedResults = new Map<number, { index: number; score: number }>()

  // Title matches get highest score
  titleResults.forEach((index) => {
    const existing = combinedResults.get(index as number)
    const score = existing ? existing.score + 10 : 10
    combinedResults.set(index as number, { index: index as number, score })
  })

  // Description matches get medium score
  descriptionResults.forEach((index) => {
    const existing = combinedResults.get(index as number)
    const score = existing ? existing.score + 5 : 5
    combinedResults.set(index as number, { index: index as number, score })
  })

  // Content matches get lower score
  contentResults.forEach((index) => {
    const existing = combinedResults.get(index as number)
    const score = existing ? existing.score + 1 : 1
    combinedResults.set(index as number, { index: index as number, score })
  })

  // Sort by score and convert to SearchResult
  const sortedResults = Array.from(combinedResults.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ index, score }) => {
      const item = searchEngine.searchIndex[index]
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        tags: item.tags,
        publishedAt: item.publishedAt,
        score
      }
    })

  return sortedResults
}

/**
 * Search posts by category
 * @param searchIndex - Search index
 * @param category - Category to filter by
 * @returns SearchResult[] - Filtered results
 */
export function searchByCategory(searchIndex: SearchIndex, category: string): SearchResult[] {
  return searchIndex
    .filter(item => item.category === category)
    .map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      tags: item.tags,
      publishedAt: item.publishedAt
    }))
}

/**
 * Search posts by tags
 * @param searchIndex - Search index
 * @param tags - Tags to filter by
 * @returns SearchResult[] - Filtered results
 */
export function searchByTags(searchIndex: SearchIndex, tags: string[]): SearchResult[] {
  return searchIndex
    .filter(item => tags.some(tag => item.tags.includes(tag)))
    .map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      tags: item.tags,
      publishedAt: item.publishedAt
    }))
}

/**
 * Get search suggestions based on partial query
 * @param searchEngine - Search engine instance
 * @param query - Partial query
 * @param limit - Maximum number of suggestions
 * @returns string[] - Array of suggestions
 */
export function getSearchSuggestions(
  searchEngine: {
    titleIndex: FlexSearchIndex;
    contentIndex: FlexSearchIndex;
    descriptionIndex: FlexSearchIndex;
    searchIndex: SearchIndex;
  },
  query: string,
  limit: number = 5
): string[] {
  if (!query || query.trim().length < 2) {
    return []
  }

  const results = searchPosts(searchEngine, query, limit * 2)
  const suggestions = new Set<string>()

  results.forEach(result => {
    // Extract words from title that match the query
    const titleWords = result.title.split(/\s+/)
    titleWords.forEach(word => {
      if (word.toLowerCase().includes(query.toLowerCase()) && suggestions.size < limit) {
        suggestions.add(word)
      }
    })

    // Extract tags that match the query
    result.tags.forEach(tag => {
      if (tag.toLowerCase().includes(query.toLowerCase()) && suggestions.size < limit) {
        suggestions.add(tag)
      }
    })
  })

  return Array.from(suggestions).slice(0, limit)
}

/**
 * Normalize Korean text for search
 * @param text - Text to normalize
 * @returns string - Normalized text
 */
function normalizeKoreanText(text: string): string {
  return text
    // Remove special characters but keep Korean, alphanumeric, and spaces
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ')
    // Normalize multiple spaces
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Highlight search terms in text
 * @param text - Text to highlight
 * @param query - Search query
 * @returns string - Text with highlighted terms
 */
export function highlightSearchTerms(text: string, query: string): string {
  if (!query || query.trim() === '') {
    return text
  }

  const terms = query.toLowerCase().split(/\s+/)
  let highlightedText = text

  terms.forEach(term => {
    if (term.length > 1) {
      const regex = new RegExp(`(${term})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>')
    }
  })

  return highlightedText
}