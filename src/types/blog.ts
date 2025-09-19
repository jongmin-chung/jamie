export interface BlogPost {
  slug: string
  title: string
  description: string
  content: string
  publishedAt: Date
  updatedAt?: Date
  category: string
  tags: string[]
  author: string
  readingTime: number
}

export interface BlogPostMetadata {
  slug: string
  title: string
  description: string
  publishedAt: Date
  updatedAt?: Date
  category: string
  tags: string[]
  author: string
  readingTime: number
}

export interface BlogPostPreview {
  slug: string
  title: string
  description: string
  publishedAt: Date
  category: string
  tags: string[]
  author: string
  readingTime: number
  thumbnail?: string
}

export interface FrontmatterData {
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  category: string
  tags: string[]
  author: string
}

export interface ParsedPost {
  data: FrontmatterData
  content: string
}
