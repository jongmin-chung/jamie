import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getPostBySlug, getRelatedPosts } from '@/lib/content';
import { parseMarkdown } from '@/lib/markdown';
import { BlogCard } from '@/components/BlogCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, User, Tag } from 'lucide-react';
import type { Metadata } from 'next';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: '페이지를 찾을 수 없습니다',
      description: '요청하신 블로그 포스트를 찾을 수 없습니다.'
    };
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
  };
}

export async function generateStaticParams() {
  const { getAllPosts } = await import('@/lib/content');
  const posts = getAllPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const htmlContent = await parseMarkdown(post.content);
  const relatedPosts = getRelatedPosts(post, 3);
  const formattedDate = format(post.publishedAt, 'yyyy년 M월 d일', { locale: ko });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/blog">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            블로그 목록
          </Button>
        </Link>
      </div>

      <article className="space-y-8">
        {/* Header */}
        <header className="space-y-6">
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit">
              {post.category}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              {post.description}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b border-border pb-6">
            <div className="flex items-center gap-1">
              <User size={16} />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{post.readingTime}분 읽기</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={16} className="text-muted-foreground" />
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:border prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Footer */}
        <footer className="border-t border-border pt-8">
          <div className="flex items-center justify-between">
            <Link href="/blog">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                블로그 목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </footer>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 space-y-8">
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
  );
}