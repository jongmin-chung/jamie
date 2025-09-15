import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BlogCard } from '@/components/BlogCard';

describe('BlogCard Component', () => {
  const mockPost = {
    slug: 'react-hooks-guide',
    title: 'React Hooks 완전 가이드',
    description: 'React Hooks의 모든 것을 알아보는 완전한 가이드',
    publishedAt: new Date('2025-09-10'),
    category: 'frontend',
    tags: ['react', 'hooks', 'javascript'],
    author: '김개발',
    readingTime: 8
  };

  it('should render blog post card with all information', () => {
    render(<BlogCard post={mockPost} />);

    expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument();
    expect(screen.getByText('React Hooks의 모든 것을 알아보는 완전한 가이드')).toBeInTheDocument();
    expect(screen.getByText('김개발')).toBeInTheDocument();
    expect(screen.getByText('8분 읽기')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
  });

  it('should render published date in Korean format', () => {
    render(<BlogCard post={mockPost} />);

    // Should show date in Korean format
    expect(screen.getByText(/2025년 9월 10일/)).toBeInTheDocument();
  });

  it('should render tags', () => {
    render(<BlogCard post={mockPost} />);

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('hooks')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
  });

  it('should render as clickable link to blog post', () => {
    render(<BlogCard post={mockPost} />);

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/blog/react-hooks-guide');
  });

  it('should apply correct CSS classes for styling', () => {
    render(<BlogCard post={mockPost} />);

    const cardElement = screen.getByRole('link');
    expect(cardElement).toHaveClass('block'); // Should be clickable block
  });

  it('should truncate long descriptions', () => {
    const longDescriptionPost = {
      ...mockPost,
      description: '이것은 매우 긴 설명입니다. '.repeat(20) // Very long description
    };

    render(<BlogCard post={longDescriptionPost} />);

    // Should have some truncation mechanism
    const descElement = screen.getByText(/이것은 매우 긴 설명입니다/);
    expect(descElement).toBeInTheDocument();
  });

  it('should handle posts without tags', () => {
    const noTagsPost = {
      ...mockPost,
      tags: []
    };

    render(<BlogCard post={noTagsPost} />);

    expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument();
    // Should not crash without tags
  });

  it('should show category badge', () => {
    render(<BlogCard post={mockPost} />);

    const categoryBadge = screen.getByText('frontend');
    expect(categoryBadge).toBeInTheDocument();
    // Should have badge-like styling
  });

  it('should handle reading time display', () => {
    const shortPost = {
      ...mockPost,
      readingTime: 1
    };

    render(<BlogCard post={shortPost} />);

    expect(screen.getByText('1분 읽기')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<BlogCard post={mockPost} />);

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAccessibleName(); // Should have accessible name
  });

  it('should handle Korean author names correctly', () => {
    const koreanAuthorPost = {
      ...mockPost,
      author: '박개발자'
    };

    render(<BlogCard post={koreanAuthorPost} />);

    expect(screen.getByText('박개발자')).toBeInTheDocument();
  });
});