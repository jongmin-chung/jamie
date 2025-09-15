import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BlogPostPreview } from '@/types/blog';
import { Clock, User } from 'lucide-react';
import { cn, getCardClasses } from '@/lib/theme/utils';

interface BlogCardProps {
  post: BlogPostPreview;
  className?: string;
}


export function BlogCard({ post, className }: BlogCardProps) {
  const formattedDate = format(post.publishedAt, 'M월 d일', { locale: ko });

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className={cn(
        getCardClasses('article'),
        'overflow-hidden h-full hover:opacity-75 transition-opacity',
        className
      )}>
        {/* Image with 16:9 aspect ratio as per theme spec */}
        <div className="aspect-video bg-gradient-to-br from-kakao-light-gray to-kakao-medium-gray relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-kakao-dark-text bg-kakao-yellow font-noto-sans-kr">
              {post.category}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between text-kakao-text-dark-48 text-xs font-noto-sans-kr">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <User size={12} />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{post.readingTime}분</span>
                </div>
              </div>
              <span className="text-xs opacity-90">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Content with zero padding as per theme spec */}
        <div className="pt-6">
          <h3 className="text-lg font-semibold leading-tight mb-3 text-kakao-dark-text font-noto-sans-kr line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-kakao-text-dark-48 leading-relaxed mb-4 line-clamp-2 font-noto-sans-kr">
            {post.description}
          </p>
          
          {/* Tags with KakaoPay styling */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 2).map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-kakao-text-dark-48 bg-kakao-light-gray font-noto-sans-kr"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-kakao-text-dark-48 bg-kakao-light-gray font-noto-sans-kr">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}