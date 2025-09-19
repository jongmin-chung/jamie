import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { getPostBySlug, getRelatedPosts } from '@/lib/content'
import { parseMarkdown } from '@/lib/markdown'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: '페이지를 찾을 수 없습니다',
      description: '요청하신 블로그 포스트를 찾을 수 없습니다.',
    }
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export async function generateStaticParams() {
  const { getAllPosts } = await import('@/lib/content')
  const posts = getAllPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const htmlContent = await parseMarkdown(post.content)
  const relatedPosts = getRelatedPosts(post, 3)
  const formattedDate = format(post.publishedAt, 'yyyy년 M월 d일', {
    locale: ko,
  })

  // Convert related posts to the format expected by KakaoStyleBlogLayout
  const formattedRelatedPosts = relatedPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.description,
    date: format(post.publishedAt, 'yyyy. M. d', { locale: ko }),
  }))

  return (
    <>
      <Header />
      <main className="pt-16 pb-16 bg-white">
        <article className="max-w-3xl md:max-w-4xl mx-auto px-4 md:px-8 py-12">
          {/* 제목 - KakaoPay 스타일: 제목이 메타 정보보다 위에 배치 */}
          <h1 className="text-4xl md:text-5xl font-bold text-kakao-dark-text mb-6 leading-tight">{post.title}</h1>

          {/* 메타 정보 - KakaoPay 스타일: 제목 아래 깔끔하게 배치, 아이콘 제거 */}
          <div className="blog-meta">
            <span>{formattedDate}</span>
            <span>{post.author}</span>
            <span>{post.readingTime}분 읽기</span>
          </div>

          {/* 커버 이미지 (있으면) */}
          {/* <img src={post.coverImage} alt="cover" className="w-full rounded-lg mb-8" /> */}

          {/* 본문 컨텐츠 - KakaoPay 스타일 */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-kakao-dark-text prose-p:text-kakao-gray-text prose-p:text-lg prose-p:leading-8 prose-img:rounded-lg prose-img:my-8" 
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
          />

          {/* 태그 - KakaoPay 스타일 */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12 mb-8">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="bg-kakao-light-gray text-kakao-gray-text px-3 py-1 rounded-full text-sm">#{tag}</span>
              ))}
            </div>
          )}

          {/* 작성자 정보 - KakaoPay 스타일: 심플하게 */}
          <div className="border-t border-kakao-medium-gray pt-8 mt-12 mb-8">
            <div className="flex items-center">
              <div className="text-kakao-dark-text font-medium">작성자</div>
              <div className="ml-4 text-kakao-gray-text">{post.author}</div>
            </div>
          </div>

          {/* 관련 포스트 - KakaoPay 스타일 */}
          {formattedRelatedPosts?.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold mb-6 text-kakao-dark-text">추천 글</h2>
              <div className="grid grid-cols-1 gap-6">
                {formattedRelatedPosts.map((rel, idx) => (
                  <a href={`/blog/${rel.slug}`} key={idx} className="block border-b border-kakao-medium-gray pb-4 mb-2 hover:bg-kakao-light-gray transition-colors rounded-md p-3">
                    <h3 className="text-lg font-medium mb-2 text-kakao-dark-text">{rel.title}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-kakao-gray-text text-sm line-clamp-1">{rel.excerpt}</p>
                      <span className="text-kakao-light-text text-sm">{rel.date}</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  )
}
