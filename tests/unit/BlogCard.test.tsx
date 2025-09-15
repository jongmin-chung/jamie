import { describe, test, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import BlogCard from '@/components/BlogCard';
import { BlogPostMetadata } from '@/types/blog';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

const mockPost: BlogPostMetadata = {
  slug: 'react-hooks-guide',
  title: 'React Hooks 완전 가이드',
  date: '2024-01-15',
  category: '프론트엔드',
  tags: ['React', 'JavaScript', 'Hooks'],
  excerpt: 'React Hooks의 모든 것을 알아보는 완전한 가이드입니다. useState부터 useEffect까지 실무에서 사용하는 방법을 살펴봅시다.',
  readingTime: 5
};

describe('BlogCard Component Unit Tests', () => {
  test('should render blog post title', () => {
    render(<BlogCard post={mockPost} />);
    
    expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument();
  });

  test('should render blog post excerpt', () => {
    render(<BlogCard post={mockPost} />);
    
    expect(screen.getByText(/React Hooks의 모든 것을 알아보는/)).toBeInTheDocument();
  });

  test('should display formatted date in Korean', () => {
    render(<BlogCard post={mockPost} />);
    
    // Look for Korean formatted date
    expect(screen.getByText(/2024년/)).toBeInTheDocument();
  });

  test('should display category', () => {
    render(<BlogCard post={mockPost} />);
    
    expect(screen.getByText('프론트엔드')).toBeInTheDocument();
  });

  test('should display all tags', () => {
    render(<BlogCard post={mockPost} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Hooks')).toBeInTheDocument();
  });

  test('should display reading time in Korean', () => {
    render(<BlogCard post={mockPost} />);
    
    expect(screen.getByText('5분 읽기')).toBeInTheDocument();
  });

  test('should link to the blog post', () => {
    render(<BlogCard post={mockPost} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/blog/react-hooks-guide');
  });

  test('should handle long excerpts gracefully', () => {
    const longExcerptPost: BlogPostMetadata = {
      ...mockPost,
      excerpt: '이것은 매우 긴 발췌문입니다. '.repeat(50) + '끝.'
    };

    render(<BlogCard post={longExcerptPost} />);
    
    // Should render without breaking
    expect(screen.getByText(/이것은 매우 긴 발췌문입니다/)).toBeInTheDocument();
  });

  test('should handle posts with no tags', () => {
    const noTagsPost: BlogPostMetadata = {
      ...mockPost,
      tags: []
    };

    render(<BlogCard post={noTagsPost} />);
    
    expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument();
    // Should not crash when no tags present
  });

  test('should handle posts with single tag', () => {
    const singleTagPost: BlogPostMetadata = {
      ...mockPost,
      tags: ['React']
    };

    render(<BlogCard post={singleTagPost} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
  });

  test('should handle posts with many tags', () => {
    const manyTagsPost: BlogPostMetadata = {
      ...mockPost,
      tags: ['React', 'TypeScript', 'JavaScript', 'Frontend', 'Development', 'Programming']
    };

    render(<BlogCard post={manyTagsPost} />);
    
    // Should render all tags
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Programming')).toBeInTheDocument();
  });

  test('should handle different reading times', () => {
    const quickReadPost: BlogPostMetadata = {
      ...mockPost,
      readingTime: 1
    };

    const longReadPost: BlogPostMetadata = {
      ...mockPost,
      readingTime: 15
    };

    render(<BlogCard post={quickReadPost} />);
    expect(screen.getByText('1분 읽기')).toBeInTheDocument();

    render(<BlogCard post={longReadPost} />);
    expect(screen.getByText('15분 읽기')).toBeInTheDocument();
  });

  test('should handle special characters in title and excerpt', () => {
    const specialCharsPost: BlogPostMetadata = {
      ...mockPost,
      title: '특수문자 포함: "따옴표", (괄호), [대괄호]!',
      excerpt: '내용에는 물음표?와 느낌표!가 있습니다. 그리고 "따옴표"도 있어요.'
    };

    render(<BlogCard post={specialCharsPost} />);
    
    expect(screen.getByText(/특수문자 포함.*따옴표.*괄호/)).toBeInTheDocument();
    expect(screen.getByText(/물음표\?.*느낌표!/)).toBeInTheDocument();
  });

  test('should render with proper semantic HTML structure', () => {
    render(<BlogCard post={mockPost} />);
    
    // Should have article element for semantic structure
    const article = document.querySelector('article');
    expect(article).toBeInTheDocument();

    // Should have proper heading structure
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H3'); // Or whatever heading level is used
  });

  test('should be accessible with proper ARIA attributes', () => {
    render(<BlogCard post={mockPost} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href');
    
    // Should have accessible text
    expect(link).toHaveAccessibleName();
  });

  test('should handle different categories in Korean', () => {
    const categories = ['프론트엔드', '백엔드', '데브옵스', '디자인', '개발문화'];
    
    categories.forEach(category => {
      const categoryPost: BlogPostMetadata = {
        ...mockPost,
        category
      };

      render(<BlogCard post={categoryPost} />);
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  test('should truncate very long titles appropriately', () => {
    const longTitlePost: BlogPostMetadata = {
      ...mockPost,
      title: '매우 긴 제목입니다 '.repeat(20) + '끝'
    };

    render(<BlogCard post={longTitlePost} />);
    
    // Should render without breaking layout
    expect(screen.getByText(/매우 긴 제목입니다/)).toBeInTheDocument();
  });

  test('should handle different date formats correctly', () => {
    const dates = ['2024-01-01', '2023-12-31', '2025-06-15'];
    
    dates.forEach(date => {
      const datePost: BlogPostMetadata = {
        ...mockPost,
        date
      };

      render(<BlogCard post={datePost} />);
      
      // Should format date in Korean
      const year = date.split('-')[0];
      expect(screen.getByText(new RegExp(`${year}년`))).toBeInTheDocument();
    });
  });
});