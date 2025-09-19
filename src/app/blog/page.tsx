import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getAllPosts, getPostsByCategory } from '@/lib/content'
import { CATEGORIES } from '@/types/content'

interface BlogListingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BlogListPage({
  searchParams,
}: BlogListingPageProps) {
  const params = await searchParams
  const category =
    typeof params.category === 'string' ? params.category : undefined

  // Server-side data fetching
  const allPosts = getAllPosts()

  // Get posts based on current filters
  const filteredPosts = category ? getPostsByCategory(category) : allPosts

  // Calculate category counts
  const categoryCounts: Record<string, number> = {}
  Object.keys(CATEGORIES).forEach((categoryId) => {
    categoryCounts[categoryId] = allPosts.filter(
      (post) => post.category === categoryId
    ).length
  })

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
              {CATEGORIES[category as keyof typeof CATEGORIES] || category}{' '}
              카테고리
            </h1>
            <p style={{ color: 'var(--kakaopay-text-secondary)' }}>
              {filteredPosts.length}개의 포스트
            </p>
          </div>
        )}

        {/* 포스트 목록 */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="kakaopay-card p-6 group cursor-pointer"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 이미지 플레이스홀더 */}
                  <div className="md:col-span-1">
                    <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-200"></div>
                  </div>

                  {/* 콘텐츠 */}
                  <div className="md:col-span-2">
                    <div className="mb-2">
                      <span
                        className="inline-block px-2 py-1 text-xs font-medium rounded"
                        style={{
                          backgroundColor: 'var(--kakaopay-hover)',
                          color: 'var(--kakaopay-text-secondary)',
                        }}
                      >
                        {post.category}
                      </span>
                    </div>

                    <h2
                      className="text-xl font-semibold mb-3 group-hover:underline line-clamp-2"
                      style={{ color: 'var(--kakaopay-text-primary)' }}
                    >
                      {post.title}
                    </h2>

                    <p
                      className="text-sm mb-3 line-clamp-2"
                      style={{ color: 'var(--kakaopay-text-secondary)' }}
                    >
                      {post.description}
                    </p>

                    <div
                      className="flex items-center text-xs space-x-3"
                      style={{ color: 'var(--kakaopay-text-muted)' }}
                    >
                      <span>{post.author}</span>
                      <span>•</span>
                      <time dateTime={post.publishedAt.toISOString()}>
                        {format(post.publishedAt, 'yyyy.MM.dd', {
                          locale: ko,
                        })}
                      </time>
                      <span>•</span>
                      <span>{post.readingTime}분 읽기</span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p style={{ color: 'var(--kakaopay-text-muted)' }}>
                포스트가 없습니다.
              </p>
            </div>
          )}
        </div>
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
              <Link
                key={categoryId}
                href={`/blog?category=${categoryId.toLowerCase()}`}
              >
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
