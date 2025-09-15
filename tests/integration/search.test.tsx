import { describe, test, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '@/components/SearchBox';

// Mock the search utilities
jest.mock('@/lib/search', () => ({
  initializeSearch: jest.fn(() => ({
    search: jest.fn((query: string) => {
      if (query === 'React') {
        return [
          { id: '1', title: 'React Hooks 완벽 가이드', slug: 'react-hooks-guide' },
          { id: '2', title: 'React 성능 최적화', slug: 'react-performance' }
        ];
      }
      if (query === '리액트') {
        return [
          { id: '1', title: 'React Hooks 완벽 가이드', slug: 'react-hooks-guide' }
        ];
      }
      if (query === 'TypeScript') {
        return [
          { id: '3', title: 'TypeScript 기초부터 심화까지', slug: 'typescript-basics' }
        ];
      }
      return [];
    })
  }))
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock search index data
const mockSearchIndex = {
  documents: [
    {
      id: '1',
      title: 'React Hooks 완벽 가이드',
      content: 'React Hooks는 함수형 컴포넌트에서 상태와 라이프사이클을 관리할 수 있게 해주는 강력한 기능입니다.',
      category: '프론트엔드',
      tags: ['React', 'JavaScript', 'Hooks'],
      slug: 'react-hooks-guide'
    },
    {
      id: '2',
      title: 'React 성능 최적화',
      content: 'React 애플리케이션의 성능을 향상시키는 다양한 기법들을 알아봅시다.',
      category: '프론트엔드',
      tags: ['React', 'Performance'],
      slug: 'react-performance'
    },
    {
      id: '3',
      title: 'TypeScript 기초부터 심화까지',
      content: 'TypeScript의 기본 문법과 고급 타입 시스템을 학습합니다.',
      category: '프론트엔드',
      tags: ['TypeScript', 'JavaScript'],
      slug: 'typescript-basics'
    }
  ]
};

describe('Search Functionality Integration', () => {
  let user: any;

  beforeEach(() => {
    user = userEvent.setup();
  });

  test('should render search input with Korean placeholder', () => {
    render(<SearchBox searchIndex={mockSearchIndex} />);
    
    const searchInput = screen.getByPlaceholderText(/검색/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('should display search results for English queries', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />);
    
    const searchInput = screen.getByPlaceholderText(/검색/i);
    await user.type(searchInput, 'React');
    
    await waitFor(() => {
      expect(screen.getByText('React Hooks 완벽 가이드')).toBeInTheDocument();
      expect(screen.getByText('React 성능 최적화')).toBeInTheDocument();
    });
  });

  test('should display search results for Korean queries', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />);
    
    const searchInput = screen.getByPlaceholderText(/검색/i);
    await user.type(searchInput, '리액트');
    
    await waitFor(() => {
      expect(screen.getByText('React Hooks 완벽 가이드')).toBeInTheDocument();
    });
  });

  test('should show no results message when no matches found', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />);
    
    const searchInput = screen.getByPlaceholderText(/검색/i);
    await user.type(searchInput, 'nonexistent');
    
    await waitFor(() => {
      expect(screen.getByText(/검색 결과가 없습니다|결과 없음/i)).toBeInTheDocument();
    });
  });

  test('should clear results when search input is cleared', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />);
    
    const searchInput = screen.getByPlaceholderText(/검색/i);
    
    // Type search term
    await user.type(searchInput, 'React');
    
    await waitFor(() => {
      expect(screen.getByText('React Hooks 완벽 가이드')).toBeInTheDocument();
    });
    
    // Clear search
    await user.clear(searchInput);
    
    await waitFor(() => {
      expect(screen.queryByText('React Hooks 완벽 가이드')).not.toBeInTheDocument();
    });
  });

  test('should handle search input changes with debouncing', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />);
    
    const searchInput = screen.getByPlaceholderText(/검색/i);
    
    // Type characters quickly
    await user.type(searchInput, 'Rea');
    
    // Results should not appear immediately (debouncing)
    expect(screen.queryByText('React Hooks 완벽 가이드')).not.toBeInTheDocument();
    
    // Complete the search term
    await user.type(searchInput, 'ct');
    
    // Wait for debounced search
    await waitFor(() => {
      expect(screen.getByText('React Hooks 완벽 가이드')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('should display search result metadata', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />);
    
    const searchInput = screen.getByPlaceholderText(/검색/i);
    await user.type(searchInput, 'TypeScript');
    
    await waitFor(() => {
      expect(screen.getByText('TypeScript 기초부터 심화까지')).toBeInTheDocument();
      // Should show category or other metadata
      expect(screen.getByText(/프론트엔드|JavaScript|TypeScript/)).toBeInTheDocument();
    });
  });

  test('should navigate to post when search result is clicked', async () => {
    const mockPush = jest.fn();
    jest.mocked(require('next/navigation').useRouter).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
    });

    render(<SearchBox searchIndex={mockSearchIndex} />);
    
    const searchInput = screen.getByPlaceholderText(/검색/i);
    await user.type(searchInput, 'React');
    
    await waitFor(() => {
      const resultLink = screen.getByText('React Hooks 완벽 가이드');
      expect(resultLink).toBeInTheDocument();
      
      // Click on result
      fireEvent.click(resultLink);
    });

    // Should navigate to the post
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/blog/react-hooks-guide');
    });
  });

  test('should be accessible with keyboard navigation', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />);
    
    const searchInput = screen.getByPlaceholderText(/검색/i);
    
    // Focus should work
    searchInput.focus();
    expect(document.activeElement).toBe(searchInput);
    
    // Type search
    await user.type(searchInput, 'React');
    
    await waitFor(() => {
      const results = screen.getAllByRole('button');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  test('should handle special Korean characters correctly', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />);
    
    const searchInput = screen.getByPlaceholderText(/검색/i);
    
    // Test various Korean search terms
    const koreanTerms = ['후크', '성능', '최적화'];
    
    for (const term of koreanTerms) {
      await user.clear(searchInput);
      await user.type(searchInput, term);
      
      // Should not crash or produce corrupted text
      const inputValue = (searchInput as HTMLInputElement).value;
      expect(inputValue).toBe(term);
      expect(inputValue).not.toMatch(/[?��]/);
    }
  });

  test('should limit search results display', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />);
    
    const searchInput = screen.getByPlaceholderText(/검색/i);
    await user.type(searchInput, 'React');
    
    await waitFor(() => {
      const results = screen.getAllByText(/React/);
      // Should limit results (e.g., max 10 results)
      expect(results.length).toBeLessThanOrEqual(20); // Including matches in content
    });
  });
});