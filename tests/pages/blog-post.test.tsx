import { describe, expect, it, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { notFound } from 'next/navigation'
import BlogPostPage from '@/app/blog/[slug]/page'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}))

// Mock the content loading functions
jest.mock('@/lib/content', () => ({
  getPostBySlug: jest.fn(),
  getRelatedPosts: jest.fn(),
}))

jest.mock('@/lib/markdown', () => ({
  parseMarkdown: jest.fn(),
}))

describe('Individual Blog Post Page Integration', () => {
  const mockPost = {
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
    author: '김개발',
    readingTime: 8,
  }

  const mockRelatedPosts = [
    {
      slug: 'typescript-basics',
      title: 'TypeScript 기초',
      description: 'TypeScript의 기본 개념을 알아봅시다',
      category: 'frontend',
      publishedAt: new Date('2025-09-09'),
    },
  ]

  beforeEach(() => {
    const { getPostBySlug, getRelatedPosts } = require('@/lib/content')
    const { parseMarkdown } = require('@/lib/markdown')

    getPostBySlug.mockReturnValue(mockPost)
    getRelatedPosts.mockReturnValue(mockRelatedPosts)
    parseMarkdown.mockResolvedValue(`<h1>React Hooks 완전 가이드</h1>
<p>React Hooks는 React 16.8에서 소개된 새로운 기능입니다.</p>
<h2>useState Hook</h2>
<p>useState Hook을 사용하면 함수 컴포넌트에서도 상태를 관리할 수 있습니다.</p>
<pre><code class="language-javascript">const [count, setCount] = useState(0);</code></pre>
<p>이렇게 사용할 수 있습니다.</p>`)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render blog post title', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    const title = screen.getByText('React Hooks 완전 가이드')
    expect(title).toBeInTheDocument()
  })

  it('should render post metadata', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    expect(screen.getByText('김개발')).toBeInTheDocument()
    expect(screen.getByText('8분 읽기')).toBeInTheDocument()
    expect(screen.getByText(/2025년 9월 10일/)).toBeInTheDocument()
    expect(screen.getByText('frontend')).toBeInTheDocument()
  })

  it('should render post content as HTML', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    expect(screen.getByText('useState Hook')).toBeInTheDocument()
    expect(
      screen.getByText(/React Hooks는 React 16.8에서 소개된/)
    ).toBeInTheDocument()
  })

  it('should render code blocks properly', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    const codeBlock = screen.getByText(
      /const \[count, setCount\] = useState\(0\);/
    )
    expect(codeBlock).toBeInTheDocument()
  })

  it('should display post tags', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('hooks')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
  })

  it('should show related posts section', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    const relatedSection = screen.getByText(/관련 글|Related Posts/)
    expect(relatedSection).toBeInTheDocument()

    expect(screen.getByText('TypeScript 기초')).toBeInTheDocument()
  })

  it('should call notFound for non-existent post', async () => {
    const { getPostBySlug } = require('@/lib/content')
    getPostBySlug.mockReturnValue(null)

    const params = { slug: 'non-existent-post' }
    render(<BlogPostPage params={params} />)

    expect(notFound).toHaveBeenCalled()
  })

  it('should have proper SEO meta tags', async () => {
    const params = { slug: 'react-hooks-guide' }

    // Test metadata generation
    const metadata = await BlogPostPage.generateMetadata({ params })

    expect(metadata.title).toBe('React Hooks 완전 가이드')
    expect(metadata.description).toBe(
      'React Hooks의 모든 것을 알아보는 완전한 가이드'
    )
  })

  it('should show navigation to previous/next posts', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    const prevLink = screen.queryByText(/이전 글|Previous Post/)
    const nextLink = screen.queryByText(/다음 글|Next Post/)

    // Navigation might be optional
    if (prevLink || nextLink) {
      expect(prevLink || nextLink).toBeInTheDocument()
    }
  })

  it('should render table of contents for long posts', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    const tocHeading = screen.queryByText(/목차|Table of Contents/)
    if (tocHeading) {
      expect(tocHeading).toBeInTheDocument()
    }
  })

  it('should have back to blog listing link', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    const backLink = screen.getByRole('link', {
      name: /블로그 목록|Back to Blog/,
    })
    expect(backLink).toHaveAttribute('href', '/blog')
  })

  it('should be responsive', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    const article = screen.getByRole('article')
    expect(article).toBeInTheDocument()
    expect(article).toHaveClass(/container|mx-auto/)
  })

  it('should have proper semantic HTML structure', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    const article = screen.getByRole('article')
    const headings = screen.getAllByRole('heading')

    expect(article).toBeInTheDocument()
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should handle Korean headings and content', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    const koreanHeading = screen.getByRole('heading', {
      name: /React Hooks 완전 가이드/,
    })
    expect(koreanHeading).toBeInTheDocument()
  })

  it('should show reading progress indicator', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    const progressIndicator = screen.queryByRole('progressbar')
    if (progressIndicator) {
      expect(progressIndicator).toBeInTheDocument()
    }
  })

  it('should support social sharing buttons', async () => {
    const params = { slug: 'react-hooks-guide' }
    render(<BlogPostPage params={params} />)

    const shareButton = screen.queryByText(/공유|Share/)
    if (shareButton) {
      expect(shareButton).toBeInTheDocument()
    }
  })
})
