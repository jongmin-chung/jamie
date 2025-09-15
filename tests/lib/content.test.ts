import { describe, it, expect } from '@jest/globals';
import { generateContentMetadata, validateBlogPost, calculateReadingTime } from '@/lib/content';

describe('Content Metadata Generator', () => {
  const samplePost = {
    slug: 'react-hooks-guide',
    title: 'React Hooks 완전 가이드',
    description: 'React Hooks의 모든 것을 알아보는 완전한 가이드',
    content: `# React Hooks 완전 가이드

React Hooks는 React 16.8에서 소개된 새로운 기능입니다. 

## useState Hook

useState Hook을 사용하면 함수 컴포넌트에서도 상태를 관리할 수 있습니다.

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

이렇게 사용할 수 있습니다.`,
    publishedAt: new Date('2025-09-10'),
    category: 'frontend',
    tags: ['react', 'hooks', 'javascript'],
    author: '김개발'
  };

  it('should generate complete metadata for blog post', () => {
    const metadata = generateContentMetadata(samplePost);

    expect(metadata.slug).toBe('react-hooks-guide');
    expect(metadata.title).toBe('React Hooks 완전 가이드');
    expect(metadata.description).toBe('React Hooks의 모든 것을 알아보는 완전한 가이드');
    expect(metadata.publishedAt).toBeInstanceOf(Date);
    expect(metadata.category).toBe('frontend');
    expect(metadata.tags).toEqual(['react', 'hooks', 'javascript']);
    expect(metadata.author).toBe('김개발');
    expect(metadata.readingTime).toBeGreaterThan(0);
  });

  it('should calculate reading time correctly', () => {
    const shortContent = '짧은 글입니다.';
    const longContent = '단어 '.repeat(250) + '긴 글입니다.'; // ~250 words

    expect(calculateReadingTime(shortContent)).toBe(1);
    expect(calculateReadingTime(longContent)).toBeGreaterThan(1);
  });

  it('should validate blog post structure', () => {
    expect(validateBlogPost(samplePost)).toBe(true);

    const invalidPost = {
      ...samplePost,
      title: '', // Empty title
    };
    expect(validateBlogPost(invalidPost)).toBe(false);

    const invalidSlug = {
      ...samplePost,
      slug: 'Invalid Slug!', // Invalid characters
    };
    expect(validateBlogPost(invalidSlug)).toBe(false);
  });

  it('should handle Korean content for reading time', () => {
    const koreanContent = `한국어로 작성된 긴 글입니다. 이 글은 여러 문단으로 구성되어 있습니다.
    
첫 번째 문단입니다. 여기서는 한국어의 특성에 대해 설명합니다.

두 번째 문단입니다. 한국어 텍스트의 단어 수를 계산하는 것은 영어와 다를 수 있습니다.`;

    const readingTime = calculateReadingTime(koreanContent);
    expect(readingTime).toBeGreaterThan(0);
    expect(readingTime).toBeLessThan(10); // Should be reasonable
  });

  it('should generate URL-safe slug', () => {
    const postWithKoreanTitle = {
      ...samplePost,
      title: '한국어 제목으로 된 글',
      slug: 'korean-title-post'
    };

    const metadata = generateContentMetadata(postWithKoreanTitle);
    expect(metadata.slug).toMatch(/^[a-z0-9-]+$/); // Only lowercase, numbers, hyphens
  });

  it('should validate required fields', () => {
    const missingFields = {
      slug: 'test-post',
      // Missing title, content, etc.
    };

    expect(validateBlogPost(missingFields as any)).toBe(false);
  });

  it('should validate tag limits', () => {
    const tooManyTags = {
      ...samplePost,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'] // 6 tags, limit is 5
    };

    expect(validateBlogPost(tooManyTags)).toBe(false);
  });

  it('should validate content length', () => {
    const tooShort = {
      ...samplePost,
      content: '짧은 글' // Too short
    };

    expect(validateBlogPost(tooShort)).toBe(false);
  });
});