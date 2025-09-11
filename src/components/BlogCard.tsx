import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BlogPostPreview } from '@/types/blog';
import { Clock, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  post: BlogPostPreview;
  className?: string;
}

const getCategoryColor = (category: string) => {
  const colors = {
    'Development': 'bg-primary/10 text-primary',
    'Design': 'bg-purple-50 text-purple-700', 
    'Career': 'bg-green-50 text-green-700',
    'Tech': 'bg-orange-50 text-orange-700',
    'Trend': 'bg-pink-50 text-pink-700',
  };
  return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground';
};

export function BlogCard({ post, className }: BlogCardProps) {
  const formattedDate = format(post.publishedAt, 'M월 d일', { locale: ko });

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className={cn(
        'card-hover bg-card border border-border overflow-hidden h-full shadow-card',
        'rounded-xl group-hover:shadow-card-hover',
        className
      )}>
        {/* Visual placeholder for thumbnail - you can replace with actual images later */}
        <div className="h-48 bg-gradient-to-br from-muted/50 to-muted relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/5 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className={cn(
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
              getCategoryColor(post.category)
            )}>
              {post.category}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between text-card-foreground/80 text-xs">
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

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-bold leading-tight mb-3 group-hover:text-primary transition-colors text-card-foreground korean-text">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2 korean-text">
            {post.description}
          </p>
          
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 2).map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Read more */}
          <div className="flex items-center text-primary text-sm font-medium group-hover:text-primary/80 transition-colors">
            <span>더 읽기</span>
            <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
}