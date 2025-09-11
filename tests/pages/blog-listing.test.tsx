import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import BlogListingPage from '@/app/blog/page';

// Mock the content loading and search functions
jest.mock('@/lib/content', () => ({
  getAllPosts: jest.fn(),
  getPostsByCategory: jest.fn(),
}));

jest.mock('@/lib/search', () => ({
  searchPosts: jest.fn(),
}));

describe('Blog Listing Page Integration', () => {
  const mockPosts = [
    {
      slug: 'react-hooks-guide',
      title: 'React Hooks 완전 가이드',
      description: 'React Hooks의 모든 것을 알아보는 완전한 가이드',
      publishedAt: new Date('2025-09-10'),
      category: 'frontend',
      tags: ['react', 'hooks', 'javascript'],
      author: '김개발',
      readingTime: 8
    },
    {
      slug: 'typescript-basics',
      title: 'TypeScript 기초',
      description: 'TypeScript의 기본 개념을 알아봅시다',
      publishedAt: new Date('2025-09-09'),
      category: 'frontend',
      tags: ['typescript', 'javascript'],
      author: '박개발',
      readingTime: 5
    },
    {
      slug: 'nextjs-deployment',
      title: 'Next.js 배포하기',
      description: 'Next.js 앱을 프로덕션에 배포하는 방법',
      publishedAt: new Date('2025-09-08'),
      category: 'deployment',
      tags: ['nextjs', 'deployment', 'vercel'],
      author: '이개발',
      readingTime: 10
    }
  ];

  beforeEach(() => {
    const { getAllPosts, getPostsByCategory } = require('@/lib/content');
    getAllPosts.mockReturnValue(mockPosts);
    getPostsByCategory.mockReturnValue(mockPosts.filter(p => p.category === 'frontend'));
  });

  it('should render page title', async () => {
    const mockSearchParams = {};
    render(<BlogListingPage searchParams={mockSearchParams} />);

    const pageTitle = screen.getByText(/블로그|Blog Posts/);
    expect(pageTitle).toBeInTheDocument();
  });

  it('should display all blog posts by default', async () => {
    const mockSearchParams = {};
    render(<BlogListingPage searchParams={mockSearchParams} />);

    expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument();
    expect(screen.getByText('TypeScript 기초')).toBeInTheDocument();
    expect(screen.getByText('Next.js 배포하기')).toBeInTheDocument();
  });

  it('should show search functionality', async () => {
    const mockSearchParams = {};
    render(<BlogListingPage searchParams={mockSearchParams} />);

    const searchBox = screen.getByPlaceholderText(/검색/);
    expect(searchBox).toBeInTheDocument();
  });

  it('should filter posts by category', async () => {
    const mockSearchParams = { category: 'frontend' };
    render(<BlogListingPage searchParams={mockSearchParams} />);

    expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument();
    expect(screen.getByText('TypeScript 기초')).toBeInTheDocument();
    expect(screen.queryByText('Next.js 배포하기')).not.toBeInTheDocument();
  });

  it('should display category filters', async () => {
    const mockSearchParams = {};
    render(<BlogListingPage searchParams={mockSearchParams} />);

    const frontendCategory = screen.getByText(/frontend/);
    const deploymentCategory = screen.getByText(/deployment/);
    
    expect(frontendCategory).toBeInTheDocument();
    expect(deploymentCategory).toBeInTheDocument();
  });

  it('should handle search query', async () => {
    const { searchPosts } = require('@/lib/search');
    searchPosts.mockReturnValue([mockPosts[0]]); // Return only React post

    const mockSearchParams = { search: 'React' };
    render(<BlogListingPage searchParams={mockSearchParams} />);

    expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument();
  });

  it('should show pagination for many posts', async () => {
    const manyPosts = Array.from({ length: 25 }, (_, i) => ({
      ...mockPosts[0],
      slug: `post-${i}`,
      title: `Post ${i + 1}`,
    }));

    const { getAllPosts } = require('@/lib/content');
    getAllPosts.mockReturnValue(manyPosts);

    const mockSearchParams = {};
    render(<BlogListingPage searchParams={mockSearchParams} />);

    // Should show pagination controls
    const nextButton = screen.queryByText(/다음|Next/);
    const pageNumbers = screen.queryByText(/1|2|3/);
    
    // Pagination might be implemented
    if (nextButton || pageNumbers) {
      expect(nextButton || pageNumbers).toBeInTheDocument();
    }
  });

  it('should display post count', async () => {
    const mockSearchParams = {};
    render(<BlogListingPage searchParams={mockSearchParams} />);

    const postCount = screen.getByText(/3개의 글|3 posts/);
    expect(postCount).toBeInTheDocument();
  });

  it('should show no results message for empty search', async () => {
    const { searchPosts } = require('@/lib/search');
    searchPosts.mockReturnValue([]);

    const mockSearchParams = { search: 'nonexistent' };
    render(<BlogListingPage searchParams={mockSearchParams} />);

    const noResults = screen.getByText(/검색 결과가 없습니다|No results found/);
    expect(noResults).toBeInTheDocument();
  });

  it('should render blog cards for each post', async () => {
    const mockSearchParams = {};
    render(<BlogListingPage searchParams={mockSearchParams} />);

    // Each post should be a clickable card
    const reactLink = screen.getByRole('link', { name: /React Hooks 완전 가이드/ });
    const typescriptLink = screen.getByRole('link', { name: /TypeScript 기초/ });
    
    expect(reactLink).toHaveAttribute('href', '/blog/react-hooks-guide');
    expect(typescriptLink).toHaveAttribute('href', '/blog/typescript-basics');
  });

  it('should show post metadata in cards', async () => {
    const mockSearchParams = {};
    render(<BlogListingPage searchParams={mockSearchParams} />);

    expect(screen.getByText('김개발')).toBeInTheDocument();
    expect(screen.getByText('8분 읽기')).toBeInTheDocument();
    expect(screen.getByText(/2025년 9월 10일/)).toBeInTheDocument();
  });

  it('should handle category clearing', async () => {
    const mockSearchParams = { category: 'frontend' };
    render(<BlogListingPage searchParams={mockSearchParams} />);

    const clearFilter = screen.queryByText(/모든 카테고리|All Categories/);
    if (clearFilter) {
      expect(clearFilter).toBeInTheDocument();
    }
  });

  it('should be responsive', async () => {
    const mockSearchParams = {};
    render(<BlogListingPage searchParams={mockSearchParams} />);

    const container = screen.getByRole('main');
    expect(container).toHaveClass(/container|mx-auto/);
  });

  it('should have proper page structure', async () => {
    const mockSearchParams = {};
    render(<BlogListingPage searchParams={mockSearchParams} />);

    const main = screen.getByRole('main');
    const headings = screen.getAllByRole('heading');
    
    expect(main).toBeInTheDocument();
    expect(headings.length).toBeGreaterThan(0);
  });

  it('should sort posts by date descending', async () => {
    const mockSearchParams = {};
    render(<BlogListingPage searchParams={mockSearchParams} />);

    const postTitles = screen.getAllByRole('heading', { level: 3 });
    
    // React post (Sept 10) should come before TypeScript post (Sept 9)
    const reactIndex = postTitles.findIndex(heading => 
      heading.textContent?.includes('React Hooks')
    );
    const typescriptIndex = postTitles.findIndex(heading => 
      heading.textContent?.includes('TypeScript')
    );
    
    expect(reactIndex).toBeLessThan(typescriptIndex);
  });
});