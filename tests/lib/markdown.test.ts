import { describe, it, expect } from '@jest/globals';
import { parseMarkdown } from '@/lib/markdown';

describe('Markdown Parser', () => {
  it('should parse basic markdown content', async () => {
    const markdown = '# 제목\n\n안녕하세요. **굵은 글씨**입니다.';
    const result = await parseMarkdown(markdown);

    expect(result).toContain('<h1>제목</h1>');
    expect(result).toContain('<strong>굵은 글씨</strong>');
    expect(result).toContain('안녕하세요.');
  });

  it('should parse Korean code blocks', async () => {
    const markdown = '```javascript\nconst message = "안녕하세요";\nconsole.log(message);\n```';
    const result = await parseMarkdown(markdown);

    expect(result).toContain('<pre>');
    expect(result).toContain('<code');
    expect(result).toContain('const message = "안녕하세요";');
  });

  it('should parse markdown links', async () => {
    const markdown = '[링크 텍스트](https://example.com)';
    const result = await parseMarkdown(markdown);

    expect(result).toContain('<a href="https://example.com">링크 텍스트</a>');
  });

  it('should parse markdown lists', async () => {
    const markdown = '- 첫 번째 항목\n- 두 번째 항목\n- 세 번째 항목';
    const result = await parseMarkdown(markdown);

    expect(result).toContain('<ul>');
    expect(result).toContain('<li>첫 번째 항목</li>');
    expect(result).toContain('<li>두 번째 항목</li>');
    expect(result).toContain('<li>세 번째 항목</li>');
  });

  it('should handle empty markdown', async () => {
    const markdown = '';
    const result = await parseMarkdown(markdown);

    expect(result).toBe('');
  });

  it('should preserve Korean characters in headings', async () => {
    const markdown = '# 한국어 제목\n## 부제목';
    const result = await parseMarkdown(markdown);

    expect(result).toContain('<h1>한국어 제목</h1>');
    expect(result).toContain('<h2>부제목</h2>');
  });
});