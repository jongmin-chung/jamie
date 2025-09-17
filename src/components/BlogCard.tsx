import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { BlogPostPreview } from '@/types/blog'
import { cn, getCardClasses } from '@/lib/theme/utils'

interface BlogCardProps {
  post: BlogPostPreview;
  className?: string;
  isRecent?: boolean;
  isFullWidth?: boolean;
}

export function BlogCard({ post, className, isRecent = false, isFullWidth = false }: BlogCardProps) {
  const formattedDate = format(post.publishedAt, 'yyyy. M. d', { locale: ko })

  // Full width layout (for "전체 게시글" section)
  if (isFullWidth) {
    return (
      <Link href={`/blog/${post.slug}`} className="block group">
        <article className={cn(
          getCardClasses('article'),
          'overflow-hidden transition-opacity duration-300 flex items-start',
          className
        )}>
          {/* Image thumbnail on the left */}
          <div className="w-[150px] h-[90px] bg-kakao-medium-gray relative overflow-hidden flex-shrink-0">
            <Image 
              src="/images/thumb.png" 
              alt={post.title}
              width={150}
              height={90}
              className="object-cover"
            />
          </div>
          
          {/* Content on the right */}
          <div className="flex-1 pl-4">
            <strong className="block text-lg font-semibold leading-tight mb-2 text-kakao-dark-text font-noto-sans-kr line-clamp-1">
              {post.title}
            </strong>
            <p className="text-sm text-kakao-text-dark-48 leading-relaxed mb-2 line-clamp-2 font-noto-sans-kr">
              {post.description}
            </p>
            <time className="text-xs text-kakao-text-dark-48 font-noto-sans-kr">
              {formattedDate}
            </time>
          </div>
        </article>
      </Link>
    )
  }

  // Card layout (for "최근 올라온 글" section or default)
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className={cn(
        getCardClasses('article'),
        'overflow-hidden h-full hover:opacity-90 transition-opacity duration-300',
        className
      )}>
        {/* Image with 16:9 aspect ratio as per KakaoPay spec */}
        <div className="aspect-video bg-kakao-medium-gray relative overflow-hidden">
          {/* Image placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
            <Image 
              src="/images/thumb.png" 
              alt={post.title}
              width={800}
              height={450}
              className="opacity-90"
            />
          </div>
          
          {/* 카카오페이 스타일: 이미지 위에 제목과 날짜가 표시됨 */}
          {isRecent && (
            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 font-noto-sans-kr">
                {post.title}
              </h3>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-xs text-white/70">
                  <span>{formattedDate}</span>
                </div>
                <div className="text-xs text-white/70 font-noto-sans-kr">
                  {post.category}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content - only shown for non-recent posts */}
        {!isRecent && !isFullWidth && (
          <div className="pt-5">
            <h3 className="text-lg font-semibold leading-tight mb-3 text-kakao-dark-text font-noto-sans-kr line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-kakao-text-dark-48 leading-relaxed mb-4 line-clamp-2 font-noto-sans-kr">
              {post.description}
            </p>
            <div className="flex justify-between items-center text-xs text-kakao-text-dark-48 font-noto-sans-kr">
              <span>{formattedDate}</span>
            </div>
          </div>
        )}
      </article>
    </Link>
  )
}