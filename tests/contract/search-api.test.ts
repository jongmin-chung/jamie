import { describe, expect, test } from '@jest/globals'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { SearchDocument, SearchIndex } from '@/types/search'

describe('Search Index API Contract Tests', () => {
  const searchIndexFile = join(process.cwd(), 'public', 'search-index.json')

  test('search index file should exist and be valid JSON', () => {
    expect(existsSync(searchIndexFile)).toBe(true)

    const content = readFileSync(searchIndexFile, 'utf-8')
    const searchIndex = JSON.parse(content)

    expect(typeof searchIndex).toBe('object')
    expect(searchIndex).toHaveProperty('documents')
    expect(Array.isArray(searchIndex.documents)).toBe(true)
  })

  test('search documents should have required fields', () => {
    const content = readFileSync(searchIndexFile, 'utf-8')
    const searchIndex: SearchIndex = JSON.parse(content)

    expect(searchIndex.documents.length).toBeGreaterThan(0)

    searchIndex.documents.forEach((doc, index) => {
      expect(doc).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        content: expect.any(String),
        category: expect.any(String),
        tags: expect.any(Array),
        slug: expect.any(String),
      })

      // Validate required fields are not empty
      expect(doc.id.length).toBeGreaterThan(0)
      expect(doc.title.length).toBeGreaterThan(0)
      expect(doc.content.length).toBeGreaterThan(0)
      expect(doc.category.length).toBeGreaterThan(0)
      expect(doc.slug.length).toBeGreaterThan(0)

      // Validate tags array
      expect(Array.isArray(doc.tags)).toBe(true)
      doc.tags.forEach((tag) => {
        expect(typeof tag).toBe('string')
        expect(tag.length).toBeGreaterThan(0)
      })
    })
  })

  test('search documents should contain Korean content', () => {
    const content = readFileSync(searchIndexFile, 'utf-8')
    const searchIndex: SearchIndex = JSON.parse(content)

    // Check that some documents contain Korean characters
    const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/

    let koreanContentCount = 0
    searchIndex.documents.forEach((doc) => {
      if (hasKorean.test(doc.title) || hasKorean.test(doc.content)) {
        koreanContentCount++
      }
    })

    // Most documents should contain Korean content
    expect(koreanContentCount).toBeGreaterThan(
      searchIndex.documents.length * 0.8
    )
  })

  test('search documents should have unique IDs', () => {
    const content = readFileSync(searchIndexFile, 'utf-8')
    const searchIndex: SearchIndex = JSON.parse(content)

    const ids = searchIndex.documents.map((doc) => doc.id)
    const uniqueIds = new Set(ids)

    expect(uniqueIds.size).toBe(ids.length)
  })

  test('search documents should have searchable content structure', () => {
    const content = readFileSync(searchIndexFile, 'utf-8')
    const searchIndex: SearchIndex = JSON.parse(content)

    // Test a few documents for content structure
    searchIndex.documents.slice(0, 5).forEach((doc) => {
      // Content should be substantial for searching
      expect(doc.content.length).toBeGreaterThan(100)

      // Content should be cleaned of markdown syntax for searching
      expect(doc.content).not.toMatch(/^#{1,6}\s/m) // No markdown headers
      expect(doc.content).not.toMatch(/\*{1,2}[^*]+\*{1,2}/) // No bold/italic
      expect(doc.content).not.toMatch(/\[.+\]\(.+\)/) // No markdown links
    })
  })

  test('search index should match posts metadata count', () => {
    const searchContent = readFileSync(searchIndexFile, 'utf-8')
    const searchIndex: SearchIndex = JSON.parse(searchContent)

    const metadataFile = join(process.cwd(), 'public', 'posts-metadata.json')
    const metadataContent = readFileSync(metadataFile, 'utf-8')
    const metadata = JSON.parse(metadataContent)

    expect(searchIndex.documents.length).toBe(metadata.length)
  })

  test('search documents should support Korean text search', () => {
    const content = readFileSync(searchIndexFile, 'utf-8')
    const searchIndex: SearchIndex = JSON.parse(content)

    // Find documents with Korean content
    const koreanDocs = searchIndex.documents.filter((doc) =>
      /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(doc.title + doc.content)
    )

    expect(koreanDocs.length).toBeGreaterThan(0)

    // Korean content should not be corrupted
    koreanDocs.slice(0, 3).forEach((doc) => {
      const koreanText = doc.title + doc.content
      // Should not have corrupted encoding
      expect(koreanText).not.toMatch(/[?��]/)
      // Should have proper Korean syllables
      expect(koreanText).toMatch(/[가-힣]/)
    })
  })
})
