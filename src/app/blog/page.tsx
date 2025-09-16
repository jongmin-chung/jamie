import { getAllPosts, getPostsByCategory } from '@/lib/content'
import { BlogListingClient } from '@/components/BlogListingClient'
import { CATEGORIES } from '@/types/content'
import Link from 'next/link'

interface BlogListingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogListPage({ searchParams }: BlogListingPageProps) {
  const params = await searchParams
  const category = typeof params.category === 'string' ? params.category : undefined
  const searchQuery = typeof params.search === 'string' ? params.search : ''

  // Server-side data fetching
  const allPosts = getAllPosts()
  
  // Get posts based on current filters
  const filteredPosts = category ? getPostsByCategory(category) : allPosts

  // Calculate category counts
  const categoryCounts: Record<string, number> = {}
  Object.keys(CATEGORIES).forEach(categoryId => {
    categoryCounts[categoryId] = allPosts.filter(post => post.category === categoryId).length
  })

  // Convert posts to serializable format
  const postsData = filteredPosts.map(post => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt.toISOString(),
    category: post.category,
    tags: post.tags,
    author: post.author,
    readingTime: post.readingTime
  }))

  const allPostsData = allPosts.map(post => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt.toISOString(),
    category: post.category,
    tags: post.tags,
    author: post.author,
    readingTime: post.readingTime
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-3">
        {category && (
          <div className="mb-6">
            <h1 
              className="text-2xl font-semibold mb-2"
              style={{ color: 'var(--kakaopay-text-primary)' }}
            >
              {CATEGORIES[category as keyof typeof CATEGORIES] || category} 카테고리
            </h1>
            <p style={{ color: 'var(--kakaopay-text-secondary)' }}>
              {filteredPosts.length}개의 포스트
            </p>
          </div>
        )}

        <BlogListingClient 
          initialPosts={postsData}
          allPosts={allPostsData}
          categoryCounts={categoryCounts}
          initialCategory={category}
          initialSearchQuery={searchQuery}
        />
      </div>

      {/* Sidebar - KakaoPay 스타일 태그 클라우드 */}
      <div className="lg:col-span-1">
        <div className="kakaopay-card p-6">
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--kakaopay-text-primary)' }}
          >
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORIES).map(([categoryId, categoryName]) => (
              <Link key={categoryId} href={`/blog?category=${categoryId.toLowerCase()}`}>
                <button className="tag-item">
                  {categoryName} ({categoryCounts[categoryId] || 0})
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
