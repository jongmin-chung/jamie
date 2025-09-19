'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/theme/utils'

interface TagCloudProps {
  tags: Array<[string, number]>
  className?: string
  selectedTag?: string
}

// 태그 가중치에 따른 스타일 계산
function getTagStyle(count: number, maxCount: number, minCount: number) {
  const ratio = (count - minCount) / (maxCount - minCount) || 0

  // 폰트 크기 (12px ~ 20px)
  const fontSize = 12 + ratio * 8

  // 색상 강도 (40% ~ 100%)
  const opacity = 0.4 + ratio * 0.6

  // 패딩 크기
  const padding =
    ratio > 0.7 ? 'px-4 py-2' : ratio > 0.3 ? 'px-3 py-1.5' : 'px-2 py-1'

  return {
    fontSize: `${fontSize}px`,
    opacity,
    padding,
  }
}

// 색상 테마 배열
const colorThemes = [
  'bg-purple-100 text-purple-700 hover:bg-purple-200',
  'bg-teal-100 text-teal-700 hover:bg-teal-200',
  'bg-blue-100 text-blue-700 hover:bg-blue-200',
  'bg-green-100 text-green-700 hover:bg-green-200',
  'bg-orange-100 text-orange-700 hover:bg-orange-200',
  'bg-pink-100 text-pink-700 hover:bg-pink-200',
  'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
  'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
]

export function TagCloud({ tags, className, selectedTag }: TagCloudProps) {
  const [showAll, setShowAll] = useState(false)
  const [hoveredTag, setHoveredTag] = useState<string | null>(null)

  if (tags.length === 0) return null

  const maxCount = Math.max(...tags.map(([, count]) => count))
  const minCount = Math.min(...tags.map(([, count]) => count))

  // 표시할 태그 수 제한
  const displayedTags = showAll ? tags : tags.slice(0, 20)

  return (
    <div className={cn('space-y-4', className)}>
      {/* 태그 클라우드 */}
      <div className="flex flex-wrap gap-2 items-center justify-start">
        {displayedTags.map(([tag, count], index) => {
          const style = getTagStyle(count, maxCount, minCount)
          const colorClass = colorThemes[index % colorThemes.length]
          const isHovered = hoveredTag === tag
          const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase()

          return (
            <Link
              key={tag}
              href={`/tag/${tag.toLowerCase()}`}
              className={cn(
                'inline-flex items-center rounded-full font-medium',
                'transition-all duration-300 ease-out',
                'hover:scale-110 hover:shadow-sm',
                'font-noto-sans-kr',
                isSelected
                  ? 'bg-kakao-yellow text-kakao-dark-text ring-2 ring-kakao-yellow/30 scale-105 shadow-md animate-tag-glow'
                  : colorClass,
                style.padding,
                isHovered && !isSelected && 'animate-pulse'
              )}
              style={{
                fontSize: isSelected
                  ? `${parseFloat(style.fontSize) + 2}px`
                  : style.fontSize,
                opacity: isSelected ? 1 : style.opacity,
              }}
              onMouseEnter={() => setHoveredTag(tag)}
              onMouseLeave={() => setHoveredTag(null)}
              title={`${count}개의 게시글`}
            >
              {tag}
              {/* 게시글 수 표시 */}
              <span
                className={cn(
                  'ml-1.5 text-xs rounded-full px-1.5 py-0.5 font-medium',
                  isSelected ? 'bg-kakao-dark-text/20' : 'bg-black/10'
                )}
                style={{ fontSize: '10px' }}
              >
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* 더보기/접기 버튼 */}
      {tags.length > 20 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={cn(
            'flex items-center justify-center w-full px-4 py-2',
            'text-sm text-kakao-text-dark-48 hover:text-kakao-dark-text',
            'bg-kakao-light-gray hover:bg-gray-200',
            'rounded-lg transition-all duration-200',
            'font-noto-sans-kr font-medium',
            'hover:shadow-sm'
          )}
        >
          <span>
            {showAll ? '태그 접기' : `태그 더보기 (+${tags.length - 20})`}
          </span>
          {showAll ? (
            <ChevronUp className="ml-2 w-4 h-4" />
          ) : (
            <ChevronDown className="ml-2 w-4 h-4" />
          )}
        </button>
      )}

      {/* 태그 통계 */}
      <div className="text-xs text-kakao-text-dark-48 font-noto-sans-kr bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <span>
            총 태그 수: <strong>{tags.length}</strong>
          </span>
          <span>
            전체 게시글:{' '}
            <strong>{tags.reduce((sum, [, count]) => sum + count, 0)}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}