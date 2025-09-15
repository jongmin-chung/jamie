import { describe, test, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock the markdown utilities
jest.mock('@/lib/markdown', () => ({
  getPostsMetadata: jest.fn(() => [
    {
      slug: 'test-post-1',
      title: 'React Hooks 완벽 가이드',
      date: '2024-01-15',
      category: '프론트엔드',
      tags: ['React', 'JavaScript', 'Hooks'],
      excerpt: 'React Hooks의 기본 개념부터 고급 활용법까지 모든 것을 다룹니다.',
      readingTime: 5
    },
    {
      slug: 'test-post-2', 
      title: 'TypeScript 기초부터 심화까지',
      date: '2024-01-10',
      category: '프론트엔드',
      tags: ['TypeScript', 'JavaScript'],
      excerpt: 'TypeScript의 기본 문법과 고급 타입 시스템을 학습합니다.',
      readingTime: 8
    }
  ])
}));

describe('Homepage Integration', () => {
  test('should render homepage with Korean title', async () => {
    render(await Home());
    
    expect(screen.getByText(/기술 블로그/i)).toBeInTheDocument();
  });

  test('should display recent blog posts', async () => {
    render(await Home());
    
    expect(screen.getByText('React Hooks 완벽 가이드')).toBeInTheDocument();
    expect(screen.getByText('TypeScript 기초부터 심화까지')).toBeInTheDocument();
  });

  test('should show post metadata correctly', async () => {
    render(await Home());
    
    // Check categories are displayed
    expect(screen.getByText('프론트엔드')).toBeInTheDocument();
    
    // Check reading time
    expect(screen.getByText('5분 읽기')).toBeInTheDocument();
    expect(screen.getByText('8분 읽기')).toBeInTheDocument();
  });

  test('should display search functionality', async () => {
    render(await Home());
    
    const searchInput = screen.getByPlaceholderText(/검색/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('should show post excerpts', async () => {
    render(await Home());
    
    expect(screen.getByText(/React Hooks의 기본 개념부터/)).toBeInTheDocument();
    expect(screen.getByText(/TypeScript의 기본 문법과/)).toBeInTheDocument();
  });

  test('should display tags for posts', async () => {
    render(await Home());
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Hooks')).toBeInTheDocument();
  });

  test('should have proper Korean locale formatting', async () => {
    render(await Home());
    
    // Korean date format should be present
    const dateElements = screen.getAllByText(/2024년/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  test('should render responsive layout components', async () => {
    render(await Home());
    
    // Should have main content area
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    
    // Should have navigation
    const nav = document.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  test('should show proper heading structure', async () => {
    render(await Home());
    
    // Should have h1 for main title
    const h1 = document.querySelector('h1');
    expect(h1).toBeInTheDocument();
    
    // Should have h2 or h3 for post titles
    const postHeadings = document.querySelectorAll('h2, h3');
    expect(postHeadings.length).toBeGreaterThan(0);
  });

  test('should include SEO-friendly elements', async () => {
    render(await Home());
    
    // Should have semantic HTML elements
    expect(document.querySelector('main')).toBeInTheDocument();
    expect(document.querySelector('article')).toBeInTheDocument();
  });
});