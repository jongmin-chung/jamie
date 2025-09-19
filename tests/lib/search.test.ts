import { describe, expect, it } from '@jest/globals'
import { createSearchEngine, SearchResult, searchPosts } from '@/lib/search'

describe('Korean Search Functionality', () => {
  const sampleSearchIndex = [
    {
      id: 'react-hooks-guide',
      title: 'React Hooks 완전 가이드',
      description: 'React Hooks의 모든 것을 알아보는 완전한 가이드',
      content:
        'React Hooks는 함수 컴포넌트에서 상태를 관리할 수 있게 해주는 기능입니다. useState, useEffect 등이 있습니다.',
      category: 'frontend',
      tags: ['react', 'hooks', 'javascript'],
      publishedAt: '2025-09-10',
    },
    {
      id: 'typescript-basics',
      title: 'TypeScript 기초',
      description: 'TypeScript의 기본 개념을 알아봅시다',
      content:
        'TypeScript는 정적 타입을 제공하는 JavaScript의 상위집합입니다. 타입 안정성을 보장합니다.',
      category: 'frontend',
      tags: ['typescript', 'javascript'],
      publishedAt: '2025-09-09',
    },
    {
      id: 'nextjs-deployment',
      title: 'Next.js 배포하기',
      description: 'Next.js 앱을 프로덕션에 배포하는 방법',
      content:
        'Next.js 애플리케이션을 Vercel이나 기타 플랫폼에 배포하는 방법을 알아봅시다.',
      category: 'deployment',
      tags: ['nextjs', 'deployment', 'vercel'],
      publishedAt: '2025-09-08',
    },
  ]

  let searchEngine: any

  beforeEach(() => {
    searchEngine = createSearchEngine(sampleSearchIndex)
  })

  it('should create search engine with index', () => {
    expect(searchEngine).toBeDefined()
  })

  it('should search Korean titles', () => {
    const results = searchPosts(searchEngine, 'React Hooks')

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('react-hooks-guide')
    expect(results[0].title).toBe('React Hooks 완전 가이드')
  })

  it('should search Korean content', () => {
    const results = searchPosts(searchEngine, '함수 컴포넌트')

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].id).toBe('react-hooks-guide')
  })

  it('should search by category', () => {
    const results = searchPosts(searchEngine, 'frontend')

    expect(results.length).toBeGreaterThanOrEqual(2)
    expect(results.map((r) => r.id)).toContain('react-hooks-guide')
    expect(results.map((r) => r.id)).toContain('typescript-basics')
  })

  it('should search by tags', () => {
    const reactResults = searchPosts(searchEngine, 'react')
    expect(reactResults.length).toBeGreaterThan(0)
    expect(reactResults[0].id).toBe('react-hooks-guide')

    const jsResults = searchPosts(searchEngine, 'javascript')
    expect(jsResults.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle partial Korean search', () => {
    const results = searchPosts(searchEngine, '타입')

    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.id === 'typescript-basics')).toBe(true)
  })

  it('should return empty results for non-matching search', () => {
    const results = searchPosts(searchEngine, '존재하지않는검색어')

    expect(results).toHaveLength(0)
  })

  it('should handle empty search query', () => {
    const results = searchPosts(searchEngine, '')

    // Empty search should return all results or no results depending on implementation
    expect(Array.isArray(results)).toBe(true)
  })

  it('should search descriptions', () => {
    const results = searchPosts(searchEngine, '기본 개념')

    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.id === 'typescript-basics')).toBe(true)
  })

  it('should return results with proper structure', () => {
    const results = searchPosts(searchEngine, 'React')

    if (results.length > 0) {
      const firstResult = results[0]
      expect(firstResult).toHaveProperty('id')
      expect(firstResult).toHaveProperty('title')
      expect(firstResult).toHaveProperty('description')
      expect(firstResult).toHaveProperty('category')
      expect(firstResult).toHaveProperty('publishedAt')
      expect(firstResult).toHaveProperty('tags')
    }
  })

  it('should handle case-insensitive search', () => {
    const lowerCase = searchPosts(searchEngine, 'react')
    const upperCase = searchPosts(searchEngine, 'REACT')

    expect(lowerCase.length).toEqual(upperCase.length)
  })

  it('should support multi-term search', () => {
    const results = searchPosts(searchEngine, 'React 가이드')

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].id).toBe('react-hooks-guide')
  })

  it('should prioritize title matches over content matches', () => {
    const results = searchPosts(searchEngine, 'TypeScript')

    expect(results.length).toBeGreaterThan(0)
    // Title match should come first
    expect(results[0].id).toBe('typescript-basics')
  })
})
