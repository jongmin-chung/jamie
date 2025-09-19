'use client'

import { ReactNode, useEffect } from 'react'
import { cn } from '@/lib/theme/utils'
import { useScrollAnimation, useScrollProgress } from '@/hooks/useScrollAnimation'
import { prefersReducedMotion, enableGPUAcceleration, disableGPUAcceleration } from '@/lib/performance'

interface ScrollAnimationProps {
  children: ReactNode
  className?: string
  animation?: 'fade-up' | 'slide-left' | 'slide-right' | 'scale' | 'rotate'
  delay?: number
  duration?: number
  threshold?: number
}

export function ScrollAnimation({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.1,
}: ScrollAnimationProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold, triggerOnce: true })

  // GPU acceleration for better performance
  useEffect(() => {
    const element = ref.current
    if (!element || prefersReducedMotion()) return

    if (isVisible) {
      enableGPUAcceleration(element)
      // Clean up will-change after animation completes
      const timer = setTimeout(() => {
        disableGPUAcceleration(element)
      }, duration + delay + 100)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, delay, ref])

  const animationClasses = {
    'fade-up': isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-8',
    'slide-left': isVisible ? 'animate-slide-in-left' : 'opacity-0 -translate-x-8',
    'slide-right': isVisible ? 'animate-slide-in-right' : 'opacity-0 translate-x-8',
    'scale': isVisible ? 'animate-scale-in' : 'opacity-0 scale-95',
    'rotate': isVisible ? 'animate-rotate-in' : 'opacity-0 rotate-12'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-600 ease-out',
        prefersReducedMotion() ? 'opacity-100' : animationClasses[animation],
        className
      )}
      style={prefersReducedMotion() ? {} : {
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

export function ScrollProgressBar() {
  const scrollProgress = useScrollProgress()

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200">
      <div
        className="h-full bg-gradient-to-r from-kakao-yellow to-kakao-yellow-hover transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  once?: boolean
}

export function ScrollReveal({ children, className, once = true }: ScrollRevealProps) {
  const { ref, isVisible } = useScrollAnimation({ 
    threshold: 0.1, 
    triggerOnce: once 
  })

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 rotate-0'
          : 'opacity-0 translate-y-8 scale-95 rotate-1',
        className
      )}
    >
      {children}
    </div>
  )
}

interface StaggeredAnimationProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
}

export function StaggeredAnimation({
  children,
  className,
  staggerDelay = 100,
}: StaggeredAnimationProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all duration-600 ease-out',
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          )}
          style={{
            transitionDelay: `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}