import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlogCard } from '@/components/BlogCard'
import { Sidebar } from '@/components/Sidebar'
import { getAllPosts } from '@/lib/content'

interface TagPageProps {
  params: Promise<{ tag: string }>
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  const allPosts = getAllPosts()
  const filteredPosts = allPosts.filter((post) =>
    post.tags.some(
      (postTag) => postTag.toLowerCase() === decodedTag.toLowerCase()
    )
  )

  if (filteredPosts.length === 0) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 xl:flex xl:gap-8 max-w-6xl">
      {/* 메인 콘텐츠 */}
      <main className="xl:w-[70%]">
        <div className="mb-8">
          {/* 뒤로 가기 버튼 */}
          <Link
            href="/"
            className="inline-flex items-center text-kakao-text-dark-48 hover:text-kakao-dark-text transition-colors mb-6 font-noto-sans-kr"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Link>

          {/* 태그 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-kakao-dark-text mb-2 font-noto-sans-kr">
              #{decodedTag}
            </h1>
            <p className="text-kakao-text-dark-48 font-noto-sans-kr">
              <strong>{decodedTag}</strong> 태그가 포함된{' '}
              <strong className="text-kakao-dark-text">
                {filteredPosts.length}개
              </strong>
              의 게시글
            </p>
          </div>
        </div>

        {/* 태그 필터링된 포스트 목록 */}
        <div className="space-y-8">
          {filteredPosts.map((post) => (
            <BlogCard
              key={post.slug}
              post={post}
              isFullWidth={true}
              selectedTag={decodedTag}
            />
          ))}
        </div>
      </main>

      {/* 사이드바 */}
      <Sidebar selectedTag={decodedTag} />
    </div>
  )
}

// 정적 생성을 위한 params 생성
export async function generateStaticParams() {
  const allPosts = getAllPosts()
  const allTags = new Set<string>()

  allPosts.forEach((post) => {
    post.tags.forEach((tag) => {
      allTags.add(tag.toLowerCase())
    })
  })

  return Array.from(allTags).map((tag) => ({
    tag: encodeURIComponent(tag),
  }))
}

// 메타데이터 생성
export async function generateMetadata({ params }: TagPageProps) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  const allPosts = getAllPosts()
  const filteredPosts = allPosts.filter((post) =>
    post.tags.some(
      (postTag) => postTag.toLowerCase() === decodedTag.toLowerCase()
    )
  )

  return {
    title: `#${decodedTag} - Jamie의 개발 블로그`,
    description: `${decodedTag} 태그가 포함된 ${filteredPosts.length}개의 게시글을 확인해보세요.`,
  }
}
