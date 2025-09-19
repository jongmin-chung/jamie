'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './LoadingSpinner'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
  onClick?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  priority = false,
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  style,
  onClick,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-kakao-background-light border border-kakao-border-light rounded-lg',
          fill ? 'absolute inset-0' : '',
          className
        )}
        style={fill ? undefined : { width, height }}
      >
        <div className="text-center text-kakao-gray-text">
          <div className="text-2xl mb-2">📷</div>
          <p className="text-sm">이미지를 불러올 수 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-lg',
        fill ? 'w-full h-full' : '',
        onClick && 'cursor-pointer hover:scale-105 transition-transform duration-300',
        className
      )}
      style={fill ? undefined : { width, height }}
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-kakao-background-light border border-kakao-border-light rounded-lg z-10">
          <LoadingSpinner size="sm" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

// Thumbnail Gallery Component
interface ThumbnailGalleryProps {
  images?: string[]
  className?: string
  onImageClick?: (index: number, src: string) => void
}

export function ThumbnailGallery({ 
  images = ['/images/1.jpg', '/images/2.jpg', '/images/3.jpg', '/images/4.jpg', '/images/5.jpg', '/images/6.jpg'],
  className,
  onImageClick 
}: ThumbnailGalleryProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4', className)}>
      {images.map((src, index) => (
        <OptimizedImage
          key={index}
          src={src}
          alt={`썸네일 이미지 ${index + 1}`}
          width={200}
          height={150}
          className="hover:shadow-lg transition-shadow duration-300"
          onClick={() => onImageClick?.(index, src)}
          quality={75}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
        />
      ))}
    </div>
  )
}

// Hero Image Component with KakaoPay styling
interface HeroImageProps {
  src: string
  alt: string
  className?: string
}

export function HeroImage({ src, alt, className }: HeroImageProps) {
  return (
    <div className={cn('relative w-full h-[400px] md:h-[500px] lg:h-[600px]', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority
        quality={90}
        className="rounded-xl shadow-2xl"
        sizes="100vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyKKCivynqY1Ic+kX3AkV/RUV9BxJPiqKKCiigP/9k="
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
    </div>
  )
}