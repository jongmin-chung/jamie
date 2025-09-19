export interface SearchIndexItem {
  id: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  publishedAt: string
}

export type SearchIndex = SearchIndexItem[]

export interface SearchResult {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  score?: number
}

export interface SearchEngineOptions {
  tokenize: 'strict' | 'forward' | 'reverse' | 'full'
  threshold: number
  depth: number
}

export interface SearchQuery {
  term: string
  category?: string
  tags?: string[]
  limit?: number
  offset?: number
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  took: number // milliseconds
}

export interface SearchStats {
  totalQueries: number
  averageResponseTime: number
  popularQueries: string[]
  noResultQueries: string[]
}
