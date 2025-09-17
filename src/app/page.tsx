import { getAllPosts } from '@/lib/content'
import { Hero } from '@/components/Hero'
import { BlogCard } from '@/components/BlogCard'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const RECENT_POSTS_COUNT = 3
const ALL_POSTS_COUNT = 5 // First page shows 5 posts

export default function HomePage() {
  const allPosts = getAllPosts()
  const recentPosts = allPosts.slice(0, RECENT_POSTS_COUNT)
  const displayedPosts = allPosts.slice(0, ALL_POSTS_COUNT)
  
  // Common tags - for KakaoPay style, make sure "BE" is one of them
  const commonTags = ["BE", "FE", "Dev", "Mobile", "Cloud", "AI"]

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Recent Posts Section - Horizontal Scroll */}
        <section className="mb-20">
          <strong className="block text-lg font-medium text-kakao-text-dark-48 mb-6 font-noto-sans-kr">
            최근 올라온 글
          </strong>
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
            {recentPosts.map((post) => (
              <div key={post.slug} className="flex-shrink-0 w-[340px]">
                <BlogCard post={post} isRecent={true} />
              </div>
            ))}
          </div>
        </section>

        {/* Content container that groups All Posts and Tags together */}
        <div className="flex flex-col lg:flex-row lg:gap-12">
          {/* All Posts Section - List Layout - Takes more space */}
          <section className="mb-12 lg:flex-[3]">
            <strong className="block text-lg font-medium text-kakao-text-dark-48 mb-6 font-noto-sans-kr">
              전체 게시글
            </strong>
            <div className="space-y-10">
              {displayedPosts.map((post) => (
                <BlogCard key={post.slug} post={post} isFullWidth={true} />
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-center mt-12 space-x-2">
              <span className="flex items-center justify-center w-8 h-8 text-kakao-dark-text">1</span>
              {[2, 3, 4, 5].map(page => (
                <Link 
                  key={page} 
                  href={`/page/${page}`}
                  className="flex items-center justify-center w-8 h-8 text-kakao-text-dark-48 hover:text-kakao-dark-text"
                >
                  {page}
                </Link>
              ))}
              <span className="text-kakao-text-dark-48 mx-2">…</span>
              <Link 
                href="/page/30"
                className="flex items-center justify-center w-8 h-8 text-kakao-text-dark-48 hover:text-kakao-dark-text"
              >
                30
              </Link>
              <Link 
                href="/page/2"
                className="flex items-center justify-center w-8 h-8 text-kakao-text-dark-48 hover:text-kakao-dark-text"
              >
                <ChevronRight size={16} />
              </Link>
            </div>
          </section>
          
          {/* Tags Section - Sidebar position */}
          <section className="lg:flex-1">
            <strong className="block text-lg font-medium text-kakao-text-dark-48 mb-6 font-noto-sans-kr">
              Tag
            </strong>
            <div className="flex flex-wrap gap-3">
              {commonTags.map(tag => (
                <Link 
                  key={tag} 
                  href={`/tag/${tag.toLowerCase()}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-kakao-light-gray text-kakao-text-dark-48 hover:text-kakao-dark-text font-noto-sans-kr"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
