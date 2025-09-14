import { describe, test, expect } from '@jest/globals';
import { initializeSearch } from '@/lib/search';

// Mock search index data
const mockSearchIndex = {
  documents: [
    {
      id: '1',
      title: 'React Hooks 완전 가이드',
      content: 'React Hooks는 함수형 컴포넌트에서 상태 관리를 가능하게 합니다. useState, useEffect 등이 있습니다.',
      category: '프론트엔드',
      tags: ['React', 'JavaScript', 'Hooks'],
      slug: 'react-hooks-guide'
    },
    {
      id: '2',
      title: 'TypeScript 기초부터 심화까지',
      content: 'TypeScript는 JavaScript에 정적 타입을 추가한 언어입니다. 타입 안전성을 제공합니다.',
      category: '프론트엔드',
      tags: ['TypeScript', 'JavaScript'],
      slug: 'typescript-basics'
    },
    {
      id: '3', 
      title: '리액트 성능 최적화 기법',
      content: '리액트 애플리케이션의 성능을 향상시키는 다양한 방법들을 알아봅시다. 메모이제이션, 코드 스플리팅 등이 있습니다.',
      category: '프론트엔드',
      tags: ['React', '성능최적화', 'Performance'],
      slug: 'react-performance'
    },
    {
      id: '4',
      title: 'Node.js 백엔드 개발',
      content: 'Node.js를 사용한 백엔드 API 개발 방법을 설명합니다. Express.js 프레임워크를 활용합니다.',
      category: '백엔드',
      tags: ['Node.js', 'Express', 'API'],
      slug: 'nodejs-backend'
    }
  ]
};

describe('Search Utilities Unit Tests', () => {
  let searchInstance: any;

  beforeEach(() => {
    searchInstance = initializeSearch(mockSearchIndex);
  });

  describe('initializeSearch', () => {
    test('should initialize search with document index', () => {
      expect(searchInstance).toBeDefined();
      expect(typeof searchInstance.search).toBe('function');
    });

    test('should handle empty search index', () => {
      const emptyIndex = { documents: [] };
      const emptySearch = initializeSearch(emptyIndex);
      
      expect(emptySearch).toBeDefined();
      expect(emptySearch.search('')).toEqual([]);
    });
  });

  describe('search functionality', () => {
    test('should search by title in English', () => {
      const results = searchInstance.search('React');
      
      expect(results.length).toBeGreaterThan(0);
      const titles = results.map((r: any) => r.title);
      expect(titles.some((title: string) => title.includes('React'))).toBe(true);
    });

    test('should search by title in Korean', () => {
      const results = searchInstance.search('리액트');
      
      expect(results.length).toBeGreaterThan(0);
      const titles = results.map((r: any) => r.title);
      expect(titles.some((title: string) => title.includes('리액트'))).toBe(true);
    });

    test('should search by content', () => {
      const results = searchInstance.search('함수형 컴포넌트');
      
      expect(results.length).toBeGreaterThan(0);
      const foundReact = results.some((r: any) => r.title.includes('React'));
      expect(foundReact).toBe(true);
    });

    test('should search by category', () => {
      const results = searchInstance.search('프론트엔드');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach((result: any) => {
        expect(['React Hooks 완전 가이드', 'TypeScript 기초부터 심화까지', '리액트 성능 최적화 기법'])
          .toContain(result.title);
      });
    });

    test('should search by tags', () => {
      const results = searchInstance.search('JavaScript');
      
      expect(results.length).toBeGreaterThan(0);
      const hasJavaScriptTag = results.some((r: any) => 
        r.tags && r.tags.includes('JavaScript')
      );
      expect(hasJavaScriptTag).toBe(true);
    });

    test('should handle case-insensitive search', () => {
      const lowerResults = searchInstance.search('react');
      const upperResults = searchInstance.search('REACT');
      
      expect(lowerResults.length).toBeGreaterThan(0);
      expect(upperResults.length).toBeGreaterThan(0);
      expect(lowerResults.length).toBe(upperResults.length);
    });

    test('should handle partial matches', () => {
      const results = searchInstance.search('Type');
      
      expect(results.length).toBeGreaterThan(0);
      const foundTypeScript = results.some((r: any) => 
        r.title.includes('TypeScript')
      );
      expect(foundTypeScript).toBe(true);
    });

    test('should handle multi-word searches', () => {
      const results = searchInstance.search('React Hooks');
      
      expect(results.length).toBeGreaterThan(0);
      const foundGuide = results.some((r: any) => 
        r.title.includes('React Hooks')
      );
      expect(foundGuide).toBe(true);
    });

    test('should return empty array for no matches', () => {
      const results = searchInstance.search('nonexistent-term-12345');
      
      expect(results).toEqual([]);
    });

    test('should handle empty search query', () => {
      const results = searchInstance.search('');
      
      expect(results).toEqual([]);
    });

    test('should handle special characters in search', () => {
      const results = searchInstance.search('Node.js');
      
      expect(results.length).toBeGreaterThan(0);
      const foundNodeJS = results.some((r: any) => 
        r.title.includes('Node.js')
      );
      expect(foundNodeJS).toBe(true);
    });
  });

  describe('search result structure', () => {
    test('should return results with required fields', () => {
      const results = searchInstance.search('React');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach((result: any) => {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('slug');
        expect(typeof result.id).toBe('string');
        expect(typeof result.title).toBe('string'); 
        expect(typeof result.slug).toBe('string');
      });
    });

    test('should maintain original document data', () => {
      const results = searchInstance.search('React');
      
      expect(results.length).toBeGreaterThan(0);
      const firstResult = results[0];
      const originalDoc = mockSearchIndex.documents.find(doc => doc.id === firstResult.id);
      
      expect(originalDoc).toBeDefined();
      expect(firstResult.title).toBe(originalDoc?.title);
      expect(firstResult.slug).toBe(originalDoc?.slug);
    });
  });

  describe('Korean language support', () => {
    test('should handle Korean consonants and vowels', () => {
      // Test with Korean initial consonants
      const results1 = searchInstance.search('ㄹ'); // 리액트, 리액
      const results2 = searchInstance.search('ㅌ'); // 타입스크립트

      // Should find some results with Korean text
      expect(results1.length + results2.length).toBeGreaterThan(0);
    });

    test('should handle mixed Korean and English', () => {
      const results = searchInstance.search('React 가이드');
      
      expect(results.length).toBeGreaterThan(0);
      const foundGuide = results.some((r: any) => 
        r.title.includes('가이드')
      );
      expect(foundGuide).toBe(true);
    });

    test('should handle Korean spacing variations', () => {
      const results1 = searchInstance.search('성능최적화');
      const results2 = searchInstance.search('성능 최적화');
      
      // Both should find results
      expect(results1.length).toBeGreaterThan(0);
      expect(results2.length).toBeGreaterThan(0);
    });
  });

  describe('performance and edge cases', () => {
    test('should handle very long search queries', () => {
      const longQuery = 'React TypeScript JavaScript Node.js '.repeat(10);
      const results = searchInstance.search(longQuery);
      
      // Should not crash and return reasonable results
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle special Unicode characters', () => {
      const specialResults = searchInstance.search('JavaScript™');
      
      expect(Array.isArray(specialResults)).toBe(true);
    });

    test('should handle numeric searches', () => {
      const results = searchInstance.search('16.8');
      
      expect(Array.isArray(results)).toBe(true);
    });

    test('should limit search results appropriately', () => {
      const results = searchInstance.search('a'); // Very broad search
      
      // Should limit results to reasonable number
      expect(results.length).toBeLessThanOrEqual(20);
    });
  });
});