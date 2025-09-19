import { getAllPosts } from '@/lib/content'
import { TagCloud } from './TagCloud'

interface SidebarProps {
  className?: string
  selectedTag?: string
}

export function Sidebar({ className = '', selectedTag }: SidebarProps) {
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

  return (
    <aside className={`xl:w-[30%] xl:pl-8 ${className}`}>
      <section className="mb-12">
        <strong className="block text-lg font-medium text-kakao-text-dark-48 mb-6 font-noto-sans-kr">
          Tag
        </strong>
        <TagCloud tags={sortedTags} selectedTag={selectedTag} />
      </section>
    </aside>
  )
}
