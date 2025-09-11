import { describe, it, expect } from '@jest/globals';
import { generateSearchIndex, addToSearchIndex, SearchIndex } from '@/lib/search-index';

describe('Search Index Generator', () => {
  const samplePosts = [
    {
      slug: 'react-hooks-guide',
      title: 'React Hooks 완전 가이드',
      description: 'React Hooks의 모든 것을 알아보는 완전한 가이드',
      content: 'React Hooks는 함수 컴포넌트에서 상태를 관리할 수 있게 해주는 기능입니다.',
      category: 'frontend',
      tags: ['react', 'hooks', 'javascript'],
      publishedAt: '2025-09-10'
    },
    {
      slug: 'typescript-basics',
      title: 'TypeScript 기초',
      description: 'TypeScript의 기본 개념을 알아봅시다',
      content: 'TypeScript는 정적 타입을 제공하는 JavaScript의 상위집합입니다.',
      category: 'frontend',
      tags: ['typescript', 'javascript'],
      publishedAt: '2025-09-09'
    }
  ];

  it('should generate search index from posts', () => {
    const index = generateSearchIndex(samplePosts);

    expect(index).toHaveLength(2);
    expect(index[0].id).toBe('react-hooks-guide');
    expect(index[0].title).toBe('React Hooks 완전 가이드');
    expect(index[0].content).toContain('React Hooks는 함수');
    expect(index[1].id).toBe('typescript-basics');
  });

  it('should remove markdown from content in search index', () => {
    const postWithMarkdown = {
      slug: 'markdown-test',
      title: '마크다운 테스트',
      description: '마크다운 제거 테스트',
      content: '# 제목\n\n**굵은 글씨**와 *기울임*이 있는 글입니다.\n\n```javascript\nconst code = "코드";\n```',
      category: 'test',
      tags: ['markdown'],
      publishedAt: '2025-09-10'
    };

    const index = generateSearchIndex([postWithMarkdown]);

    expect(index[0].content).not.toContain('#');
    expect(index[0].content).not.toContain('**');
    expect(index[0].content).not.toContain('```');
    expect(index[0].content).toContain('제목');
    expect(index[0].content).toContain('굵은 글씨');
  });

  it('should include all searchable fields in index', () => {
    const index = generateSearchIndex(samplePosts);
    const firstItem = index[0];

    expect(firstItem).toHaveProperty('id');
    expect(firstItem).toHaveProperty('title');
    expect(firstItem).toHaveProperty('description');
    expect(firstItem).toHaveProperty('content');
    expect(firstItem).toHaveProperty('category');
    expect(firstItem).toHaveProperty('tags');
    expect(firstItem).toHaveProperty('publishedAt');
  });

  it('should handle Korean text normalization', () => {
    const koreanPost = {
      slug: 'korean-content',
      title: '한글 제목',
      description: '한글 설명',
      content: '한글로 작성된 내용입니다. 검색이 잘 될까요?',
      category: '한글카테고리',
      tags: ['한글태그', 'korean'],
      publishedAt: '2025-09-10'
    };

    const index = generateSearchIndex([koreanPost]);

    expect(index[0].title).toBe('한글 제목');
    expect(index[0].category).toBe('한글카테고리');
    expect(index[0].tags).toContain('한글태그');
  });

  it('should add single post to existing index', () => {
    let searchIndex: SearchIndex = [];
    
    const newPost = samplePosts[0];
    searchIndex = addToSearchIndex(searchIndex, newPost);

    expect(searchIndex).toHaveLength(1);
    expect(searchIndex[0].id).toBe('react-hooks-guide');
  });

  it('should handle empty posts array', () => {
    const index = generateSearchIndex([]);
    expect(index).toEqual([]);
  });

  it('should preserve tag arrays in search index', () => {
    const index = generateSearchIndex(samplePosts);
    
    expect(Array.isArray(index[0].tags)).toBe(true);
    expect(index[0].tags).toEqual(['react', 'hooks', 'javascript']);
    expect(index[1].tags).toEqual(['typescript', 'javascript']);
  });

  it('should format dates consistently in search index', () => {
    const index = generateSearchIndex(samplePosts);
    
    expect(index[0].publishedAt).toBe('2025-09-10');
    expect(index[1].publishedAt).toBe('2025-09-09');
  });
});