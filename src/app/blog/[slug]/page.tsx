import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getPostBySlug, getRelatedPosts } from '@/lib/content'
import { parseMarkdown } from '@/lib/markdown'
import { BlogCard } from '@/components/BlogCard'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileTableOfContents } from '@/components/MobileTableOfContents'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import type { Metadata } from 'next'

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: '페이지를 찾을 수 없습니다',
      description: '요청하신 블로그 포스트를 찾을 수 없습니다.'
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
    }
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
  const formattedDate = format(post.publishedAt, 'yyyy년 M월 d일', { locale: ko })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-8 max-w-4xl mx-auto">
        <Link href="/blog">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            블로그 목록
          </Button>
        </Link>
      </div>

      <div className="flex gap-8 max-w-7xl mx-auto">
        {/* Table of Contents Sidebar - Left side like KakaoPay */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-8 space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <TableOfContents content={htmlContent} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <article className="flex-1 min-w-0 space-y-8">
          {/* Header */}
          <header className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit text-xs px-3 py-1">
                {post.category}
              </Badge>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-[1.2] tracking-tight">
                {post.title}
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                {post.description}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-border pb-6">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span className="font-medium">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{post.readingTime}분 읽기</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:scroll-mt-20 prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-semibold prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-[#0d1117] prose-pre:border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:text-sm prose-blockquote:text-muted-foreground prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-li:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">태그:</span>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio Section */}
          <div className="border-t border-border pt-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={24} className="text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{post.author}</h3>
                  <p className="text-sm text-muted-foreground">
                    카카오페이 테크 블로그의 기술 전문가입니다. 최신 기술 트렌드와 개발 노하우를 공유합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-border pt-8">
            <div className="flex items-center justify-between">
              <Link href="/blog">
                <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  블로그 목록으로 돌아가기
                </Button>
              </Link>
            </div>
          </footer>
        </article>

        {/* Right Sidebar - Additional content space */}
        <aside className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-8 space-y-6">
            {/* Recommended Posts Preview */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-3 text-foreground">추천 글</h3>
              <div className="space-y-3">
                {relatedPosts.slice(0, 3).map((relatedPost) => (
                  <Link 
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="block group"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {relatedPost.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Posts */}
      <div className="max-w-4xl mx-auto mt-16">
        {relatedPosts.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground">관련 글</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <BlogCard
                  key={relatedPost.slug}
                  post={{
                    slug: relatedPost.slug,
                    title: relatedPost.title,
                    description: relatedPost.description,
                    publishedAt: relatedPost.publishedAt,
                    category: relatedPost.category,
                    tags: relatedPost.tags,
                    author: relatedPost.author,
                    readingTime: relatedPost.readingTime
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile TOC */}
      <MobileTableOfContents content={htmlContent} />
    </div>
  )
}