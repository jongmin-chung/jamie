'use client'

import { useEffect, useRef, useState } from 'react'
import {
  globalScrollTracker,
  intersectionObserverOptions,
  prefersReducedMotion,
} from '@/lib/performance'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollAnimation({
  threshold = 0.1,
  rootMargin = '50px 0px',
  triggerOnce = true,
}: UseScrollAnimationOptions = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion()) {
      setIsVisible(true)
      return
    }

    const currentRef = ref.current
    if (!currentRef) return

    const handleIntersection = (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        if (triggerOnce) {
          globalScrollTracker.unobserve(entry.target)
        }
      } else if (!triggerOnce) {
        setIsVisible(false)
      }
    }

    // Use global scroll tracker for better performance
    globalScrollTracker.observe(currentRef, handleIntersection)

    return () => {
      if (currentRef) {
        globalScrollTracker.unobserve(currentRef)
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}

export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      return
    }

    let ticking = false

    const updateScrollProgress = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPx = document.documentElement.scrollTop
          const winHeightPx =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight
          const scrolled = winHeightPx > 0 ? (scrollPx / winHeightPx) * 100 : 0
          setScrollProgress(Math.min(Math.max(scrolled, 0), 100))
          ticking = false
        })
        ticking = true
      }
    }

    // Use passive event listener for better performance
    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    updateScrollProgress() // Initial call

    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])

  return scrollProgress
}

export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      return
    }

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setOffset(window.pageYOffset * speed)
          ticking = false
        })
        ticking = true
      }
    }

    // Use passive event listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return offset
}
