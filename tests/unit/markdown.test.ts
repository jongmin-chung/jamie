import { describe, test, expect } from '@jest/globals';
import { processMarkdown, extractTableOfContents, calculateReadingTime } from '@/lib/markdown';

describe('Markdown Processing Unit Tests', () => {
  const sampleMarkdown = `---
title: "테스트 포스트"
date: "2024-01-15"
category: "개발"
tags: ["React", "TypeScript"]
excerpt: "테스트용 블로그 포스트입니다."
---

# 메인 제목

이것은 테스트용 **볼드 텍스트**와 *이탤릭 텍스트*가 있는 문단입니다.

## 부제목

다음은 코드 블록입니다:

\`\`\`javascript
function hello() {
  console.log("안녕하세요!");
}
\`\`\`

### 하위 제목

- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목

[링크 텍스트](https://example.com)도 있습니다.
`;

  describe('processMarkdown', () => {
    test('should extract frontmatter correctly', () => {
      const result = processMarkdown(sampleMarkdown);

      expect(result.title).toBe('테스트 포스트');
      expect(result.date).toBe('2024-01-15');
      expect(result.category).toBe('개발');
      expect(result.tags).toEqual(['React', 'TypeScript']);
      expect(result.excerpt).toBe('테스트용 블로그 포스트입니다.');
    });

    test('should convert markdown to HTML', () => {
      const result = processMarkdown(sampleMarkdown);

      expect(result.content).toContain('<h1');
      expect(result.content).toContain('<h2');
      expect(result.content).toContain('<h3');
      expect(result.content).toContain('<p>');
      expect(result.content).toContain('<strong>볼드 텍스트</strong>');
      expect(result.content).toContain('<em>이탤릭 텍스트</em>');
      expect(result.content).toContain('<code>');
      expect(result.content).toContain('<ul>');
      expect(result.content).toContain('<li>');
      expect(result.content).toContain('<a href="https://example.com"');
    });

    test('should preserve Korean characters', () => {
      const result = processMarkdown(sampleMarkdown);

      expect(result.content).toContain('메인 제목');
      expect(result.content).toContain('안녕하세요!');
      expect(result.content).toContain('첫 번째 항목');
      expect(result.content).not.toMatch(/[?��]/);
    });

    test('should generate proper heading IDs for Korean text', () => {
      const result = processMarkdown(sampleMarkdown);

      expect(result.content).toContain('id="메인-제목"');
      expect(result.content).toContain('id="부제목"');
      expect(result.content).toContain('id="하위-제목"');
    });

    test('should handle code syntax highlighting', () => {
      const result = processMarkdown(sampleMarkdown);

      expect(result.content).toContain('language-javascript');
      expect(result.content).toContain('function hello()');
    });

    test('should calculate reading time', () => {
      const result = processMarkdown(sampleMarkdown);

      expect(result.readingTime).toBeGreaterThan(0);
      expect(typeof result.readingTime).toBe('number');
    });
  });

  describe('extractTableOfContents', () => {
    test('should extract heading hierarchy correctly', () => {
      const html = `
        <h1 id="메인-제목">메인 제목</h1>
        <p>Some content</p>
        <h2 id="부제목">부제목</h2>
        <p>More content</p>
        <h3 id="하위-제목">하위 제목</h3>
      `;

      const toc = extractTableOfContents(html);

      expect(toc).toEqual([
        { id: '메인-제목', text: '메인 제목', level: 1 },
        { id: '부제목', text: '부제목', level: 2 },
        { id: '하위-제목', text: '하위 제목', level: 3 }
      ]);
    });

    test('should handle empty or missing headings', () => {
      const html = '<p>No headings here</p>';
      const toc = extractTableOfContents(html);

      expect(toc).toEqual([]);
    });

    test('should handle headings without IDs', () => {
      const html = '<h1>제목 without ID</h1>';
      const toc = extractTableOfContents(html);

      expect(toc).toEqual([]);
    });
  });

  describe('calculateReadingTime', () => {
    test('should calculate reading time for Korean text', () => {
      const koreanText = '이것은 한국어로 작성된 긴 텍스트입니다. '.repeat(50);
      const readingTime = calculateReadingTime(koreanText);

      expect(readingTime).toBeGreaterThan(0);
      expect(readingTime).toBeLessThan(10); // Should be reasonable
    });

    test('should calculate reading time for English text', () => {
      const englishText = 'This is a long text written in English. '.repeat(50);
      const readingTime = calculateReadingTime(englishText);

      expect(readingTime).toBeGreaterThan(0);
    });

    test('should calculate reading time for mixed language text', () => {
      const mixedText = 'This is English. 이것은 한국어입니다. '.repeat(30);
      const readingTime = calculateReadingTime(mixedText);

      expect(readingTime).toBeGreaterThan(0);
    });

    test('should handle empty or short text', () => {
      expect(calculateReadingTime('')).toBe(1);
      expect(calculateReadingTime('Short text')).toBe(1);
    });
  });

  describe('edge cases', () => {
    test('should handle markdown without frontmatter', () => {
      const noFrontmatter = '# Just a title\n\nSome content.';
      const result = processMarkdown(noFrontmatter);

      expect(result.content).toContain('<h1');
      expect(result.title).toBe('');
      expect(result.date).toBe('');
    });

    test('should handle malformed frontmatter', () => {
      const malformedFrontmatter = `---
title: "Valid Title"
date: invalid-date
---

# Content`;

      expect(() => processMarkdown(malformedFrontmatter)).not.toThrow();
    });

    test('should handle special Korean punctuation', () => {
      const specialChars = `---
title: "특수문자 테스트"
date: "2024-01-01"
---

# 특수문자: "따옴표", '작은따옴표', (괄호), [대괄호]

내용에는 물음표?와 느낌표!가 있습니다.`;

      const result = processMarkdown(specialChars);

      expect(result.content).toContain('따옴표');
      expect(result.content).toContain('물음표?');
      expect(result.content).toContain('느낌표!');
    });

    test('should handle very long content', () => {
      const longContent = `---
title: "긴 콘텐츠"
date: "2024-01-01"
---

${'긴 문단입니다. '.repeat(1000)}`;

      const result = processMarkdown(longContent);

      expect(result.content.length).toBeGreaterThan(1000);
      expect(result.readingTime).toBeGreaterThan(1);
    });
  });
});