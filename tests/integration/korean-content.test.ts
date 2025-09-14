import { describe, test, expect } from '@jest/globals';
import { processMarkdown, extractTableOfContents } from '@/lib/markdown';
import { generateSearchIndex } from '@/lib/search-index';

// Mock markdown content with Korean text
const mockKoreanMarkdown = `---
title: "한국어 블로그 포스트"
date: "2024-01-15"
category: "프론트엔드"
tags: ["React", "한글", "개발"]
excerpt: "한국어 콘텐츠 처리를 테스트하는 포스트입니다."
---

# 한국어 제목

이것은 한국어로 작성된 블로그 포스트입니다. 다양한 **한글 텍스트**와 _이탤릭_ 처리를 테스트합니다.

## 코드 예제

다음은 JavaScript 코드 예제입니다:

\`\`\`javascript
function greetInKorean() {
  console.log("안녕하세요!");
  return "반갑습니다";
}
\`\`\`

## 목록 테스트

### 순서 있는 목록
1. 첫 번째 항목
2. 두 번째 항목  
3. 세 번째 항목

### 순서 없는 목록
- 프론트엔드 개발
- 백엔드 개발
- 데브옵스

## 링크와 이미지

[한국어 링크](https://example.com)를 클릭하세요.

## 특수 문자

따옴표: "한글", '작은따옴표'
괄호: (한글 텍스트)
느낌표: 놀라운 기술!
물음표: 어떻게 생각하세요?

## 긴 문단

한국어 콘텐츠 처리 시스템은 다양한 언어적 특성을 고려해야 합니다. 
한글의 경우 음절 단위로 구성되어 있으며, 자음과 모음의 조합으로 이루어집니다.
검색 기능에서도 이러한 특성을 고려하여 정확한 검색 결과를 제공해야 합니다.
`;

const mockSearchDocuments = [
  {
    id: '1',
    title: '리액트 훅스 가이드',
    content: '리액트 훅스는 함수형 컴포넌트에서 상태 관리를 가능하게 합니다.',
    category: '프론트엔드',
    tags: ['React', '리액트', '훅스'],
    slug: 'react-hooks-guide'
  },
  {
    id: '2', 
    title: '타입스크립트 기초',
    content: '타입스크립트를 사용하여 더 안전한 JavaScript 코드를 작성할 수 있습니다.',
    category: '프론트엔드',
    tags: ['TypeScript', '타입스크립트', 'JavaScript'],
    slug: 'typescript-basics'
  }
];

describe('Korean Content Processing Integration', () => {
  test('should process Korean markdown content correctly', () => {
    const result = processMarkdown(mockKoreanMarkdown);
    
    expect(result.title).toBe('한국어 블로그 포스트');
    expect(result.category).toBe('프론트엔드');
    expect(result.tags).toContain('한글');
    expect(result.excerpt).toBe('한국어 콘텐츠 처리를 테스트하는 포스트입니다.');
  });

  test('should preserve Korean characters in HTML conversion', () => {
    const result = processMarkdown(mockKoreanMarkdown);
    
    // Check that Korean text is preserved in HTML
    expect(result.content).toContain('안녕하세요');
    expect(result.content).toContain('반갑습니다');
    expect(result.content).toContain('프론트엔드 개발');
    
    // Should not have corrupted characters
    expect(result.content).not.toMatch(/[?��]/);
  });

  test('should handle Korean text in code blocks', () => {
    const result = processMarkdown(mockKoreanMarkdown);
    
    // Code block content should be preserved
    expect(result.content).toContain('안녕하세요!');
    expect(result.content).toContain('반갑습니다');
    
    // Should maintain proper code formatting
    expect(result.content).toContain('<code>');
  });

  test('should extract table of contents with Korean headings', () => {
    const result = processMarkdown(mockKoreanMarkdown);
    const toc = extractTableOfContents(result.content);
    
    expect(toc).toEqual([
      { id: '한국어-제목', text: '한국어 제목', level: 1 },
      { id: '코드-예제', text: '코드 예제', level: 2 },
      { id: '목록-테스트', text: '목록 테스트', level: 2 },
      { id: '순서-있는-목록', text: '순서 있는 목록', level: 3 },
      { id: '순서-없는-목록', text: '순서 없는 목록', level: 3 },
      { id: '링크와-이미지', text: '링크와 이미지', level: 2 },
      { id: '특수-문자', text: '특수 문자', level: 2 },
      { id: '긴-문단', text: '긴 문단', level: 2 }
    ]);
  });

  test('should generate proper anchor IDs for Korean headings', () => {
    const result = processMarkdown(mockKoreanMarkdown);
    
    // Korean headings should have URL-safe anchor IDs
    expect(result.content).toContain('id="한국어-제목"');
    expect(result.content).toContain('id="코드-예제"');
    expect(result.content).toContain('id="목록-테스트"');
    
    // IDs should not contain spaces or special characters
    expect(result.content).not.toMatch(/id="[^"]*\s[^"]*"/);
  });

  test('should handle Korean quotes and punctuation', () => {
    const result = processMarkdown(mockKoreanMarkdown);
    
    // Korean punctuation should be preserved
    expect(result.content).toContain('"한글"');
    expect(result.content).toContain("'작은따옴표'");
    expect(result.content).toContain('놀라운 기술!');
    expect(result.content).toContain('어떻게 생각하세요?');
  });

  test('should create search index from Korean content', () => {
    const searchIndex = generateSearchIndex(mockSearchDocuments);
    
    expect(searchIndex.documents).toHaveLength(2);
    
    // Korean content should be searchable
    const firstDoc = searchIndex.documents[0];
    expect(firstDoc.title).toContain('리액트');
    expect(firstDoc.content).toContain('함수형 컴포넌트');
    
    // Tags should include Korean terms
    expect(firstDoc.tags).toContain('리액트');
    expect(firstDoc.tags).toContain('훅스');
  });

  test('should maintain reading flow for Korean text', () => {
    const result = processMarkdown(mockKoreanMarkdown);
    
    // Long Korean paragraph should be properly formatted
    const longParagraphMatch = result.content.match(/한국어 콘텐츠 처리 시스템은.*?제공해야 합니다\./s);
    expect(longParagraphMatch).toBeTruthy();
    
    // Should not have broken line breaks within sentences
    const paragraph = longParagraphMatch?.[0] || '';
    expect(paragraph).not.toMatch(/\n.*[가-힣].*\n.*[가-힣]/);
  });

  test('should handle mixed Korean and English content', () => {
    const mixedContent = `---
title: "React와 한글 섞인 제목"
date: "2024-01-15"
category: "프론트엔드"
tags: ["React", "JavaScript", "한글"]
excerpt: "English and 한글이 섞인 content test입니다."
---

# React Hooks와 한글

This is English text. 이것은 한글 텍스트입니다.

\`\`\`javascript
// English comment
console.log("Hello World"); 
// 한글 주석
console.log("안녕하세요");
\`\`\`
`;

    const result = processMarkdown(mixedContent);
    
    expect(result.title).toBe('React와 한글 섞인 제목');
    expect(result.content).toContain('This is English text');
    expect(result.content).toContain('이것은 한글 텍스트입니다');
    expect(result.content).toContain('Hello World');
    expect(result.content).toContain('안녕하세요');
  });

  test('should calculate reading time for Korean content', () => {
    const result = processMarkdown(mockKoreanMarkdown);
    
    // Should calculate reading time (Korean text typically read slower than English)
    expect(result.readingTime).toBeGreaterThan(0);
    expect(typeof result.readingTime).toBe('number');
  });

  test('should handle Korean content in lists and formatting', () => {
    const result = processMarkdown(mockKoreanMarkdown);
    
    // Ordered list with Korean text
    expect(result.content).toContain('첫 번째 항목');
    expect(result.content).toContain('두 번째 항목');
    
    // Unordered list with Korean text  
    expect(result.content).toContain('프론트엔드 개발');
    expect(result.content).toContain('백엔드 개발');
    
    // Formatted text
    expect(result.content).toContain('<strong>한글 텍스트</strong>');
    expect(result.content).toContain('<em>이탤릭</em>');
  });
});