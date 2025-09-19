'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/theme/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
}

export function LoadingSpinner({ 
  className, 
  size = 'md', 
  variant = 'primary' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const variantClasses = {
    primary: 'border-kakao-yellow border-t-transparent',
    secondary: 'border-kakao-gray-text border-t-transparent'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  )
}

interface PageLoadingProps {
  isLoading: boolean
}

export function PageLoading({ isLoading }: PageLoadingProps) {
  const [show, setShow] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setShow(true)
    } else {
      // 로딩이 끝나면 0.3초 후에 숨김
      const timer = setTimeout(() => setShow(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!show) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-white/80 backdrop-blur-sm',
        'transition-opacity duration-300',
        isLoading ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-kakao-gray-text font-noto-sans-kr text-sm">
          페이지를 불러오는 중...
        </p>
      </div>
    </div>
  )
}

// 페이지 전환 로딩 컴포넌트
export function PageTransitionLoading() {
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div className="h-full bg-kakao-yellow animate-progress-bar"></div>
    </div>
  )
}