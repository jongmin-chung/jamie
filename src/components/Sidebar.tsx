import Link from 'next/link'
import { getAllPosts } from '@/lib/content'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className = '' }: SidebarProps) {
  const allPosts = getAllPosts()

  // Extract all tags from posts and count them
  const tagCounts = allPosts.reduce(
    (acc, post) => {
      post.tags?.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>
  )

  // Sort tags by count (descending) and name
  const sortedTags = Object.entries(tagCounts).sort(
    ([a, countA], [b, countB]) => {
      if (countB !== countA) return countB - countA
      return a.localeCompare(b)
    }
  )

  // Separate primary and secondary tags
  const primaryTags = sortedTags.slice(0, 6) // Top 6 tags
  const secondaryTags = sortedTags.slice(6, 15) // Next 9 tags

  return (
    <aside className={`xl:w-[30%] xl:pl-8 ${className}`}>
      <section className="mb-12">
        <strong className="block text-lg font-medium text-kakao-text-dark-48 mb-6 font-noto-sans-kr">
          Tag
        </strong>
        <div className="space-y-4">
          {/* Primary tags - larger and more prominent */}
          {primaryTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {primaryTags.map(([tag, count]) => (
                <Link
                  key={tag}
                  href={`/tag/${tag.toLowerCase()}`}
                  className="inline-flex items-center px-4 py-2 text-base font-medium bg-kakao-light-gray text-kakao-text-dark-48 hover:text-kakao-dark-text font-noto-sans-kr transition-colors duration-200 rounded-sm hover:bg-gray-200"
                  title={`${count}개의 게시글`}
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Secondary tags - smaller */}
          {secondaryTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {secondaryTags.map(([tag, count]) => (
                <Link
                  key={tag}
                  href={`/tag/${tag.toLowerCase()}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-kakao-light-gray text-kakao-text-dark-48 hover:text-kakao-dark-text font-noto-sans-kr transition-colors duration-200 rounded-sm hover:bg-gray-200"
                  title={`${count}개의 게시글`}
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Show more button if there are more tags */}
          {sortedTags.length > 15 && (
            <button className="flex items-center text-sm text-kakao-text-dark-48 hover:text-kakao-dark-text font-noto-sans-kr transition-colors duration-200">
              <span>태그 더보기</span>
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
      </section>
    </aside>
  )
}
