import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import KakaoStyleBlogLayout from '@/components/KakaoStyleBlogLayout'
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
      <main className="blog-post-content pt-16">
        <KakaoStyleBlogLayout
          title={post.title}
          date={formattedDate}
          author={post.author}
          readTime={`${post.readingTime}분 읽기`}
          category={post.category}
          content={<div dangerouslySetInnerHTML={{ __html: htmlContent }} />}
          tags={post.tags}
          relatedPosts={formattedRelatedPosts}
        />
      </main>
      <Footer />
    </>
  )
}
