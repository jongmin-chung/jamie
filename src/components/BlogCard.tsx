import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'
import {
  cardThemes,
  getCardThemeByCategory,
  getCategoryIcon,
} from '@/lib/card-themes'
import { cn } from '@/lib/theme/utils'
import { BlogPostPreview } from '@/types/blog'

interface BlogCardProps {
  post: BlogPostPreview
  className?: string
  isRecent?: boolean
  isFullWidth?: boolean
  index?: number
}

export function BlogCard({
  post,
  className,
  isRecent = false,
  isFullWidth = false,
  index = 0,
}: BlogCardProps) {
  const formattedDate = format(post.publishedAt, 'yyyy. M. d', { locale: ko })

  // 테마와 아이콘 결정
  const theme = getCardThemeByCategory(post.category)
  const themeConfig = cardThemes[theme]
  const CategoryIcon = getCategoryIcon(post.category)

  // Full width layout (for "전체 게시글" section)
  if (isFullWidth) {
    return (
      <Link href={`/blog/${post.slug}`} className="block group">
        <article
          className={cn(
            'bg-white rounded-2xl p-6 shadow-sm border border-gray-100',
            'hover:shadow-md transition-all duration-300 flex items-start',
            'hover:scale-[1.02] transform',
            className
          )}
        >
          {/* Colorful icon/illustration on the left */}
          <div
            className="w-[120px] h-[90px] rounded-xl relative overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: themeConfig.light }}
          >
            {/* Decorative background pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundColor: themeConfig.medium }}
            />

            {/* Icon */}
            <CategoryIcon
              className="w-12 h-12 z-10 relative"
              style={{ color: themeConfig.dark }}
            />

            {/* Floating decorative elements */}
            <div
              className="absolute top-2 right-2 w-4 h-4 rounded-full opacity-40"
              style={{ backgroundColor: themeConfig.accent }}
            />
            <div
              className="absolute bottom-3 left-3 w-3 h-3 rounded-full opacity-30"
              style={{ backgroundColor: themeConfig.dark }}
            />
          </div>

          {/* Content on the right */}
          <div className="flex-1 pl-6">
            <strong className="block text-lg font-semibold leading-tight mb-3 text-kakao-dark-text font-noto-sans-kr line-clamp-2 group-hover:text-opacity-80 transition-colors">
              {post.title}
            </strong>
            <p className="text-sm text-kakao-text-dark-48 leading-relaxed mb-3 line-clamp-2 font-noto-sans-kr">
              {post.description}
            </p>
            <div className="flex items-center justify-between">
              <time className="text-xs text-kakao-text-dark-48 font-noto-sans-kr">
                {formattedDate}
              </time>
              <span
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  backgroundColor: themeConfig.light,
                  color: themeConfig.dark,
                }}
              >
                {post.category}
              </span>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  // Card layout (for "최근 올라온 글" section or default)
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article
        className={cn(
          'bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full',
          'hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transform',
          className
        )}
      >
        {/* Colorful header with illustration */}
        <div
          className="aspect-video relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${themeConfig.light} 0%, ${themeConfig.medium} 100%)`,
          }}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0">
            {/* Large background icon */}
            <CategoryIcon
              className="absolute bottom-4 right-4 w-24 h-24 opacity-10"
              style={{ color: themeConfig.dark }}
            />

            {/* Floating geometric shapes */}
            <div
              className="absolute top-6 left-6 w-8 h-8 rounded-full opacity-20 animate-float-slow"
              style={{ backgroundColor: themeConfig.accent }}
            />
            <div
              className="absolute top-12 right-12 w-6 h-6 opacity-15 animate-float-fast"
              style={{
                backgroundColor: themeConfig.dark,
                borderRadius: '20%',
              }}
            />
            <div
              className="absolute bottom-8 left-12 w-4 h-4 rounded-full opacity-25 animate-pulse"
              style={{ backgroundColor: themeConfig.accent }}
            />
          </div>

          {/* Main icon */}
          <div className="absolute top-6 left-6 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <CategoryIcon
              className="w-8 h-8"
              style={{ color: themeConfig.dark }}
            />
          </div>

          {/* Category badge */}
          <div className="absolute top-6 right-6">
            <span
              className="text-xs font-medium px-3 py-1 rounded-full bg-white/90"
              style={{ color: themeConfig.dark }}
            >
              {post.category}
            </span>
          </div>

          {/* Title overlay for recent posts */}
          {isRecent && (
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 font-noto-sans-kr drop-shadow-md">
                {post.title}
              </h3>
              <div className="text-sm text-white/90 font-noto-sans-kr">
                {formattedDate}
              </div>
            </div>
          )}
        </div>

        {/* Content - only shown for non-recent posts */}
        {!isRecent && (
          <div className="p-6">
            <h3 className="text-lg font-semibold leading-tight mb-3 text-kakao-dark-text font-noto-sans-kr line-clamp-2 group-hover:text-opacity-80 transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-kakao-text-dark-48 leading-relaxed mb-4 line-clamp-2 font-noto-sans-kr">
              {post.description}
            </p>
            <div className="flex justify-between items-center text-xs text-kakao-text-dark-48 font-noto-sans-kr">
              <span>{formattedDate}</span>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: themeConfig.accent }}
              />
            </div>
          </div>
        )}
      </article>
    </Link>
  )
}
