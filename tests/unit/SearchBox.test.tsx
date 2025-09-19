import { beforeEach, describe, expect, test } from '@jest/globals'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBox from '@/components/SearchBox'
import { SearchIndex } from '@/types/search'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock the search utilities
jest.mock('@/lib/search', () => ({
  initializeSearch: jest.fn(() => ({
    search: jest.fn((query: string) => {
      const mockResults = [
        {
          id: '1',
          title: 'React Hooks 완전 가이드',
          slug: 'react-hooks-guide',
        },
        { id: '2', title: 'TypeScript 기초', slug: 'typescript-basics' },
        { id: '3', title: '리액트 성능 최적화', slug: 'react-performance' },
      ]

      if (query === 'React') {
        return mockResults.filter(
          (r) => r.title.includes('React') || r.title.includes('리액트')
        )
      }
      if (query === '리액트') {
        return mockResults.filter((r) => r.title.includes('리액트'))
      }
      if (query === 'TypeScript') {
        return mockResults.filter((r) => r.title.includes('TypeScript'))
      }
      return []
    }),
  })),
}))

const mockSearchIndex: SearchIndex = {
  documents: [
    {
      id: '1',
      title: 'React Hooks 완전 가이드',
      content: 'React Hooks에 대한 상세한 설명입니다.',
      category: '프론트엔드',
      tags: ['React', 'JavaScript'],
      slug: 'react-hooks-guide',
    },
    {
      id: '2',
      title: 'TypeScript 기초',
      content: 'TypeScript의 기본 개념을 다룹니다.',
      category: '프론트엔드',
      tags: ['TypeScript'],
      slug: 'typescript-basics',
    },
  ],
}

describe('SearchBox Component Unit Tests', () => {
  let user: any

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  test('should render search input with Korean placeholder', () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('type', 'text')
  })

  test('should accept text input', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)
    await user.type(searchInput, 'React')

    expect(searchInput).toHaveValue('React')
  })

  test('should display search results when typing', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)
    await user.type(searchInput, 'React')

    await waitFor(() => {
      expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument()
      expect(screen.getByText('리액트 성능 최적화')).toBeInTheDocument()
    })
  })

  test('should handle Korean search queries', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)
    await user.type(searchInput, '리액트')

    await waitFor(() => {
      expect(screen.getByText('리액트 성능 최적화')).toBeInTheDocument()
    })
  })

  test('should clear results when search input is cleared', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)

    // Type search term
    await user.type(searchInput, 'React')

    await waitFor(() => {
      expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument()
    })

    // Clear search
    await user.clear(searchInput)

    await waitFor(() => {
      expect(
        screen.queryByText('React Hooks 완전 가이드')
      ).not.toBeInTheDocument()
    })
  })

  test('should show no results message when no matches found', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)
    await user.type(searchInput, 'nonexistent')

    await waitFor(() => {
      expect(
        screen.getByText(/검색 결과가 없습니다|결과 없음/i)
      ).toBeInTheDocument()
    })
  })

  test('should handle click on search results', async () => {
    const mockPush = jest.fn()
    jest.mocked(require('next/navigation').useRouter).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
    })

    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)
    await user.type(searchInput, 'React')

    await waitFor(() => {
      const resultItem = screen.getByText('React Hooks 완전 가이드')
      expect(resultItem).toBeInTheDocument()

      fireEvent.click(resultItem)
    })

    expect(mockPush).toHaveBeenCalledWith('/blog/react-hooks-guide')
  })

  test('should debounce search input', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)

    // Type quickly
    await user.type(searchInput, 'R')
    await user.type(searchInput, 'e')
    await user.type(searchInput, 'a')

    // Should not show results immediately
    expect(
      screen.queryByText('React Hooks 완전 가이드')
    ).not.toBeInTheDocument()

    // Complete typing and wait for debounce
    await user.type(searchInput, 'ct')

    await waitFor(
      () => {
        expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument()
      },
      { timeout: 1000 }
    )
  })

  test('should handle keyboard navigation', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)

    // Focus should work
    searchInput.focus()
    expect(document.activeElement).toBe(searchInput)

    // Type search
    await user.type(searchInput, 'React')

    await waitFor(() => {
      expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument()
    })

    // Test arrow key navigation (if implemented)
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' })
    // Implementation-specific assertions would go here
  })

  test('should handle escape key to close results', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)
    await user.type(searchInput, 'React')

    await waitFor(() => {
      expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument()
    })

    // Press escape
    fireEvent.keyDown(searchInput, { key: 'Escape' })

    await waitFor(() => {
      expect(
        screen.queryByText('React Hooks 완전 가이드')
      ).not.toBeInTheDocument()
    })
  })

  test('should be accessible with proper ARIA attributes', () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)

    // Should have proper role and attributes
    expect(searchInput).toHaveAttribute('role', 'searchbox')
    expect(searchInput).toHaveAttribute('aria-label')
  })

  test('should handle special characters in search', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)

    const specialQueries = ['React+', 'Type-Script', 'Node.js', 'C#', 'Vue.js']

    for (const query of specialQueries) {
      await user.clear(searchInput)
      await user.type(searchInput, query)

      // Should not crash
      expect(searchInput).toHaveValue(query)
    }
  })

  test('should handle very long search queries', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)
    const longQuery = 'React TypeScript JavaScript '.repeat(10)

    await user.type(searchInput, longQuery)

    expect(searchInput).toHaveValue(longQuery)
    // Should not crash with long input
  })

  test('should handle rapid typing without errors', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)

    // Rapid typing simulation
    const rapidTypes = ['R', 'e', 'a', 'c', 't', ' ', 'H', 'o', 'o', 'k', 's']

    for (const char of rapidTypes) {
      await user.type(searchInput, char)
    }

    expect(searchInput).toHaveValue('React Hooks')
  })

  test('should maintain focus during search interactions', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)

    searchInput.focus()
    await user.type(searchInput, 'React')

    await waitFor(() => {
      expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument()
    })

    // Focus should remain on search input
    expect(document.activeElement).toBe(searchInput)
  })

  test('should handle empty search index gracefully', () => {
    const emptyIndex: SearchIndex = { documents: [] }

    expect(() => {
      render(<SearchBox searchIndex={emptyIndex} />)
    }).not.toThrow()

    const searchInput = screen.getByPlaceholderText(/검색/i)
    expect(searchInput).toBeInTheDocument()
  })

  test('should show loading state during search (if implemented)', async () => {
    render(<SearchBox searchIndex={mockSearchIndex} />)

    const searchInput = screen.getByPlaceholderText(/검색/i)
    await user.type(searchInput, 'React')

    // If loading indicator is implemented, test for it here
    // expect(screen.getByText(/검색 중.../)).toBeInTheDocument();
  })
})
