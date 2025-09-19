import { describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBox } from '@/components/SearchBox'

describe('SearchBox Component', () => {
  const mockOnSearch = jest.fn()

  beforeEach(() => {
    mockOnSearch.mockClear()
  })

  it('should render search input with Korean placeholder', () => {
    render(<SearchBox onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText(/검색/)
    expect(searchInput).toBeInTheDocument()
  })

  it('should call onSearch when user types', async () => {
    const user = userEvent.setup()
    render(<SearchBox onSearch={mockOnSearch} />)

    const searchInput = screen.getByRole('textbox')
    await user.type(searchInput, 'React')

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('React')
    })
  })

  it('should handle Korean text input', async () => {
    const user = userEvent.setup()
    render(<SearchBox onSearch={mockOnSearch} />)

    const searchInput = screen.getByRole('textbox')
    await user.type(searchInput, '리액트')

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('리액트')
    })
  })

  it('should debounce search input', async () => {
    const user = userEvent.setup()
    render(<SearchBox onSearch={mockOnSearch} debounceMs={300} />)

    const searchInput = screen.getByRole('textbox')

    // Type quickly
    await user.type(searchInput, 'React')

    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled()

    // Should call after debounce period
    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledWith('React')
      },
      { timeout: 500 }
    )
  })

  it('should show search icon', () => {
    render(<SearchBox onSearch={mockOnSearch} />)

    // Should have search icon (assuming lucide-react Search icon)
    const searchIcon =
      screen.getByRole('button') || screen.getByTestId('search-icon')
    expect(searchIcon).toBeInTheDocument()
  })

  it('should clear search when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchBox onSearch={mockOnSearch} />)

    const searchInput = screen.getByRole('textbox')
    await user.type(searchInput, 'React')

    // Should show clear button when there's text
    const clearButton = await screen.findByRole('button', {
      name: /clear|지우기/,
    })
    expect(clearButton).toBeInTheDocument()

    await user.click(clearButton)

    expect(searchInput).toHaveValue('')
    expect(mockOnSearch).toHaveBeenLastCalledWith('')
  })

  it('should handle Enter key press', async () => {
    const user = userEvent.setup()
    render(<SearchBox onSearch={mockOnSearch} />)

    const searchInput = screen.getByRole('textbox')
    await user.type(searchInput, 'TypeScript{enter}')

    expect(mockOnSearch).toHaveBeenCalledWith('TypeScript')
  })

  it('should be accessible', () => {
    render(<SearchBox onSearch={mockOnSearch} />)

    const searchInput = screen.getByRole('textbox')
    expect(searchInput).toHaveAccessibleName(/검색/)
  })

  it('should handle empty search', async () => {
    const user = userEvent.setup()
    render(<SearchBox onSearch={mockOnSearch} />)

    const searchInput = screen.getByRole('textbox')
    await user.type(searchInput, 'React')
    await user.clear(searchInput)

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenLastCalledWith('')
    })
  })

  it('should show loading state while searching', async () => {
    render(<SearchBox onSearch={mockOnSearch} isLoading={true} />)

    expect(screen.getByRole('textbox')).toBeDisabled()
    // Should show loading indicator
  })

  it('should handle focus and blur events', async () => {
    const user = userEvent.setup()
    render(<SearchBox onSearch={mockOnSearch} />)

    const searchInput = screen.getByRole('textbox')

    await user.click(searchInput)
    expect(searchInput).toHaveFocus()

    await user.tab()
    expect(searchInput).not.toHaveFocus()
  })

  it('should support controlled value', () => {
    render(<SearchBox onSearch={mockOnSearch} value="React Hooks" />)

    const searchInput = screen.getByRole('textbox')
    expect(searchInput).toHaveValue('React Hooks')
  })

  it('should handle mixed Korean and English input', async () => {
    const user = userEvent.setup()
    render(<SearchBox onSearch={mockOnSearch} />)

    const searchInput = screen.getByRole('textbox')
    await user.type(searchInput, 'React 가이드')

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('React 가이드')
    })
  })
})
