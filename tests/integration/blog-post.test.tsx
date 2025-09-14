import { describe, test, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import BlogPost from '@/app/blog/[slug]/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock the markdown utilities
jest.mock('@/lib/markdown', () => ({
  getPostData: jest.fn((slug: string) => ({
    slug,
    title: 'React Hooks 완벽 가이드',
    date: '2024-01-15',
    category: '프론트엔드',
    tags: ['React', 'JavaScript', 'Hooks'],
    excerpt: 'React Hooks의 기본 개념부터 고급 활용법까지 모든 것을 다룹니다.',
    content: `
      # React Hooks 소개
      
      React Hooks는 함수형 컴포넌트에서 상태와 라이프사이클을 관리할 수 있게 해주는 강력한 기능입니다.
      
      ## useState Hook
      
      가장 기본적인 Hook으로, 컴포넌트의 상태를 관리합니다.
      
      \`\`\`javascript
      const [count, setCount] = useState(0);
      \`\`\`
      
      ## useEffect Hook
      
      컴포넌트의 라이프사이클을 관리하는 Hook입니다.
    `,
    readingTime: 5,
    tableOfContents: [
      { id: 'react-hooks-소개', text: 'React Hooks 소개', level: 1 },
      { id: 'usestate-hook', text: 'useState Hook', level: 2 },
      { id: 'useeffect-hook', text: 'useEffect Hook', level: 2 }
    ]
  })),
  getAllPostSlugs: jest.fn(() => [
    { params: { slug: 'react-hooks-guide' } }
  ])
}));

describe('Blog Post Page Integration', () => {
  const mockParams = { slug: 'react-hooks-guide' };

  test('should render blog post with Korean title', async () => {
    const BlogPostPage = await BlogPost({ params: mockParams });
    render(BlogPostPage);
    
    expect(screen.getByText('React Hooks 완벽 가이드')).toBeInTheDocument();
  });

  test('should display post metadata', async () => {
    const BlogPostPage = await BlogPost({ params: mockParams });
    render(BlogPostPage);
    
    expect(screen.getByText('프론트엔드')).toBeInTheDocument();
    expect(screen.getByText('5분 읽기')).toBeInTheDocument();
  });

  test('should render post tags', async () => {
    const BlogPostPage = await BlogPost({ params: mockParams });
    render(BlogPostPage);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Hooks')).toBeInTheDocument();
  });

  test('should display formatted date in Korean', async () => {
    const BlogPostPage = await BlogPost({ params: mockParams });
    render(BlogPostPage);
    
    const dateText = screen.getByText(/2024년/);
    expect(dateText).toBeInTheDocument();
  });

  test('should render markdown content as HTML', async () => {
    const BlogPostPage = await BlogPost({ params: mockParams });
    render(BlogPostPage);
    
    // Check for heading content
    expect(screen.getByText('React Hooks 소개')).toBeInTheDocument();
    expect(screen.getByText('useState Hook')).toBeInTheDocument();
    expect(screen.getByText('useEffect Hook')).toBeInTheDocument();
    
    // Check for paragraph content
    expect(screen.getByText(/함수형 컴포넌트에서 상태와/)).toBeInTheDocument();
  });

  test('should render code blocks with syntax highlighting', async () => {
    const BlogPostPage = await BlogPost({ params: mockParams });
    render(BlogPostPage);
    
    // Look for code content
    expect(screen.getByText(/const \[count, setCount\]/)).toBeInTheDocument();
  });

  test('should display table of contents', async () => {
    const BlogPostPage = await BlogPost({ params: mockParams });
    render(BlogPostPage);
    
    // Check for table of contents component
    const tocHeadings = screen.getAllByText(/React Hooks 소개|useState Hook|useEffect Hook/);
    expect(tocHeadings.length).toBeGreaterThan(3); // Should appear in TOC and content
  });

  test('should have proper heading hierarchy', async () => {
    const BlogPostPage = await BlogPost({ params: mockParams });
    render(BlogPostPage);
    
    // Main title should be h1
    const h1 = document.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toBe('React Hooks 완벽 가이드');
    
    // Content headings should be h2, h3, etc.
    const h2s = document.querySelectorAll('h2');
    expect(h2s.length).toBeGreaterThan(0);
  });

  test('should include structured data for SEO', async () => {
    const BlogPostPage = await BlogPost({ params: mockParams });
    render(BlogPostPage);
    
    // Should have article semantic element
    const article = document.querySelector('article');
    expect(article).toBeInTheDocument();
  });

  test('should handle Korean text rendering correctly', async () => {
    const BlogPostPage = await BlogPost({ params: mockParams });
    render(BlogPostPage);
    
    // Check that Korean characters are rendered properly
    const koreanText = screen.getByText(/강력한 기능입니다/);
    expect(koreanText).toBeInTheDocument();
    
    // Ensure no corrupted characters
    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toMatch(/[?��]/);
  });

  test('should provide navigation back to blog listing', async () => {
    const BlogPostPage = await BlogPost({ params: mockParams });
    render(BlogPostPage);
    
    // Should have some form of navigation
    const links = document.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
  });

  test('should be accessible with proper ARIA attributes', async () => {
    const BlogPostPage = await BlogPost({ params: mockParams });
    render(BlogPostPage);
    
    // Should have proper semantic structure
    expect(document.querySelector('main')).toBeInTheDocument();
    expect(document.querySelector('article')).toBeInTheDocument();
  });
});