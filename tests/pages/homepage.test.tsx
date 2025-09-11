import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock the content loading functions
jest.mock('@/lib/content', () => ({
  getAllPosts: jest.fn(),
  getFeaturedPosts: jest.fn(),
}));

describe('Homepage Integration', () => {
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
    const { getAllPosts, getFeaturedPosts } = require('@/lib/content');
    getAllPosts.mockReturnValue(mockPosts);
    getFeaturedPosts.mockReturnValue(mockPosts.slice(0, 2));
  });

  it('should render homepage with site title', async () => {
    render(<HomePage />);

    const siteTitle = screen.getByText(/한국 기술 블로그/);
    expect(siteTitle).toBeInTheDocument();
  });

  it('should display recent blog posts', async () => {
    render(<HomePage />);

    expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument();
    expect(screen.getByText('TypeScript 기초')).toBeInTheDocument();
    expect(screen.getByText('Next.js 배포하기')).toBeInTheDocument();
  });

  it('should show post metadata', async () => {
    render(<HomePage />);

    expect(screen.getByText('김개발')).toBeInTheDocument();
    expect(screen.getByText('박개발')).toBeInTheDocument();
    expect(screen.getByText('이개발')).toBeInTheDocument();
    
    expect(screen.getByText('8분 읽기')).toBeInTheDocument();
    expect(screen.getByText('5분 읽기')).toBeInTheDocument();
    expect(screen.getByText('10분 읽기')).toBeInTheDocument();
  });

  it('should display post descriptions', async () => {
    render(<HomePage />);

    expect(screen.getByText('React Hooks의 모든 것을 알아보는 완전한 가이드')).toBeInTheDocument();
    expect(screen.getByText('TypeScript의 기본 개념을 알아봅시다')).toBeInTheDocument();
  });

  it('should show categories', async () => {
    render(<HomePage />);

    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('deployment')).toBeInTheDocument();
  });

  it('should display published dates', async () => {
    render(<HomePage />);

    // Dates should be formatted in Korean
    expect(screen.getByText(/2025년 9월 10일/)).toBeInTheDocument();
    expect(screen.getByText(/2025년 9월 9일/)).toBeInTheDocument();
    expect(screen.getByText(/2025년 9월 8일/)).toBeInTheDocument();
  });

  it('should render blog post cards as links', async () => {
    render(<HomePage />);

    const reactLink = screen.getByRole('link', { name: /React Hooks 완전 가이드/ });
    const typescriptLink = screen.getByRole('link', { name: /TypeScript 기초/ });
    
    expect(reactLink).toHaveAttribute('href', '/blog/react-hooks-guide');
    expect(typescriptLink).toHaveAttribute('href', '/blog/typescript-basics');
  });

  it('should display tags', async () => {
    render(<HomePage />);

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('hooks')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('should show featured posts section', async () => {
    render(<HomePage />);

    const featuredSection = screen.getByText(/추천 글|Featured Posts/);
    expect(featuredSection).toBeInTheDocument();
  });

  it('should show recent posts section', async () => {
    render(<HomePage />);

    const recentSection = screen.getByText(/최근 글|Recent Posts/);
    expect(recentSection).toBeInTheDocument();
  });

  it('should handle empty posts gracefully', async () => {
    const { getAllPosts, getFeaturedPosts } = require('@/lib/content');
    getAllPosts.mockReturnValue([]);
    getFeaturedPosts.mockReturnValue([]);

    render(<HomePage />);

    const emptyMessage = screen.getByText(/글이 없습니다|No posts available/);
    expect(emptyMessage).toBeInTheDocument();
  });

  it('should be responsive on different screen sizes', async () => {
    render(<HomePage />);

    const container = screen.getByRole('main');
    expect(container).toHaveClass(/container|mx-auto/);
  });

  it('should have proper semantic HTML structure', async () => {
    render(<HomePage />);

    const main = screen.getByRole('main');
    const headings = screen.getAllByRole('heading');
    
    expect(main).toBeInTheDocument();
    expect(headings.length).toBeGreaterThan(0);
  });

  it('should include navigation to blog listing page', async () => {
    render(<HomePage />);

    const viewAllLink = screen.getByRole('link', { name: /모든 글 보기|View All Posts/ });
    expect(viewAllLink).toHaveAttribute('href', '/blog');
  });
});