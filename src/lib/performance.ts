'use client'

// Performance optimization utilities

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Debounce function for search and input events
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// Request Animation Frame helper
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let ticking = false
  return function (this: any, ...args: Parameters<T>) {
    if (!ticking) {
      requestAnimationFrame(() => {
        func.apply(this, args)
        ticking = false
      })
      ticking = true
    }
  }
}

// Prefers reduced motion check
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Intersection Observer options for better performance
export const intersectionObserverOptions = {
  rootMargin: '50px 0px',
  threshold: [0, 0.1, 0.5, 1.0],
}

// CSS GPU acceleration helper
export function enableGPUAcceleration(element: HTMLElement) {
  element.style.transform = 'translateZ(0)'
  element.style.willChange = 'transform'
}

export function disableGPUAcceleration(element: HTMLElement) {
  element.style.transform = ''
  element.style.willChange = 'auto'
}

// Passive event listener helper
export function addPassiveEventListener(
  element: Element | Window,
  event: string,
  handler: EventListener
) {
  element.addEventListener(event, handler, { passive: true })
}

// Animation frame manager for complex animations
class AnimationFrameManager {
  private callbacks: Set<FrameRequestCallback> = new Set()
  private rafId: number | null = null

  add(callback: FrameRequestCallback) {
    this.callbacks.add(callback)
    if (!this.rafId) {
      this.start()
    }
  }

  remove(callback: FrameRequestCallback) {
    this.callbacks.delete(callback)
    if (this.callbacks.size === 0 && this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private start() {
    const tick = (timestamp: number) => {
      this.callbacks.forEach(callback => callback(timestamp))
      if (this.callbacks.size > 0) {
        this.rafId = requestAnimationFrame(tick)
      } else {
        this.rafId = null
      }
    }
    this.rafId = requestAnimationFrame(tick)
  }
}

export const animationFrameManager = new AnimationFrameManager()

// Image lazy loading optimization
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  if (typeof window === 'undefined') return null
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options,
  })
}

// Memory efficient scroll tracking
export class ScrollTracker {
  private listeners: Map<Element, (entry: IntersectionObserverEntry) => void> = new Map()
  private observer: IntersectionObserver | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const callback = this.listeners.get(entry.target)
            callback?.(entry)
          })
        },
        intersectionObserverOptions
      )
    }
  }

  observe(element: Element, callback: (entry: IntersectionObserverEntry) => void) {
    if (!this.observer) return

    this.listeners.set(element, callback)
    this.observer.observe(element)
  }

  unobserve(element: Element) {
    if (!this.observer) return

    this.listeners.delete(element)
    this.observer.unobserve(element)
  }

  disconnect() {
    if (!this.observer) return

    this.observer.disconnect()
    this.listeners.clear()
  }
}

export const globalScrollTracker = new ScrollTracker()

// Performance monitoring for animations
export function measureAnimationPerformance(name: string, fn: () => void) {
  if (typeof window === 'undefined') return fn()
  
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`Animation "${name}" took ${end - start} milliseconds`)
}

// Optimized CSS animation classes
export const optimizedAnimationClasses = {
  // GPU-accelerated transforms
  fadeIn: 'animate-[fadeIn_0.6s_ease-out_forwards] transform-gpu',
  slideUp: 'animate-[slideUp_0.6s_ease-out_forwards] transform-gpu',
  slideLeft: 'animate-[slideLeft_0.6s_ease-out_forwards] transform-gpu',
  slideRight: 'animate-[slideRight_0.6s_ease-out_forwards] transform-gpu',
  scale: 'animate-[scale_0.6s_ease-out_forwards] transform-gpu',
  
  // Hover effects with will-change
  hoverScale: 'hover:scale-105 transition-transform duration-300 will-change-transform',
  hoverShadow: 'hover:shadow-lg transition-shadow duration-300',
  
  // Loading states
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  
  // Optimized for mobile
  touchScale: 'active:scale-95 transition-transform duration-150',
}

// Batch DOM updates
export function batchDOMUpdates(updates: (() => void)[]) {
  requestAnimationFrame(() => {
    updates.forEach(update => update())
  })
}