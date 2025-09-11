import { describe, it, expect } from '@jest/globals';
import { parseFrontmatter } from '@/lib/frontmatter';

describe('Frontmatter Parser', () => {
  it('should parse basic frontmatter', () => {
    const markdown = `---
title: "React Hooks 완전 가이드"
description: "React Hooks의 모든 것을 알아보는 완전한 가이드"
publishedAt: "2025-09-10"
category: "frontend"
tags: ["react", "hooks", "javascript"]
author: "김개발"
---

# 본문 내용

React Hooks는 함수 컴포넌트에서 상태를 관리할 수 있게 해줍니다.`;

    const result = parseFrontmatter(markdown);

    expect(result.data.title).toBe('React Hooks 완전 가이드');
    expect(result.data.description).toBe('React Hooks의 모든 것을 알아보는 완전한 가이드');
    expect(result.data.publishedAt).toBe('2025-09-10');
    expect(result.data.category).toBe('frontend');
    expect(result.data.tags).toEqual(['react', 'hooks', 'javascript']);
    expect(result.data.author).toBe('김개발');
    expect(result.content).toContain('# 본문 내용');
    expect(result.content).toContain('React Hooks는 함수 컴포넌트에서');
  });

  it('should handle missing frontmatter', () => {
    const markdown = '# 제목 없는 글\n\n내용입니다.';
    const result = parseFrontmatter(markdown);

    expect(result.data).toEqual({});
    expect(result.content).toBe(markdown);
  });

  it('should parse Korean frontmatter values', () => {
    const markdown = `---
title: "TypeScript 타입 시스템 이해하기"
description: "타입스크립트의 타입 시스템을 자세히 알아봅시다"
category: "개발언어"
author: "박타입"
---

내용`;

    const result = parseFrontmatter(markdown);

    expect(result.data.title).toBe('TypeScript 타입 시스템 이해하기');
    expect(result.data.description).toBe('타입스크립트의 타입 시스템을 자세히 알아봅시다');
    expect(result.data.category).toBe('개발언어');
    expect(result.data.author).toBe('박타입');
  });

  it('should parse optional fields correctly', () => {
    const markdown = `---
title: "필수 필드만 있는 글"
publishedAt: "2025-09-10"
---

내용`;

    const result = parseFrontmatter(markdown);

    expect(result.data.title).toBe('필수 필드만 있는 글');
    expect(result.data.publishedAt).toBe('2025-09-10');
    expect(result.data.description).toBeUndefined();
    expect(result.data.tags).toBeUndefined();
  });

  it('should handle empty tags array', () => {
    const markdown = `---
title: "태그 없는 글"
tags: []
---

내용`;

    const result = parseFrontmatter(markdown);

    expect(result.data.tags).toEqual([]);
  });
});