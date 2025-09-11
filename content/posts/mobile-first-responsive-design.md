---
title: "모바일 퍼스트 반응형 디자인: 성능과 사용성 최적화"
description: "모바일 환경을 우선으로 하는 반응형 디자인 전략과 카카오페이 모바일 서비스의 최적화 기법을 소개합니다."
publishedAt: "2024-12-21"
category: "Design"
tags: ["모바일퍼스트", "반응형디자인", "성능최적화", "사용성", "Progressive Enhancement"]
author: "모바일UX"
featured: false
---

# 모바일 퍼스트 반응형 디자인: 성능과 사용성 최적화

모바일 트래픽이 전체의 70% 이상을 차지하는 현재, 모바일 퍼스트 접근법은 선택이 아닌 필수입니다. 카카오페이에서 모바일 중심의 반응형 디자인을 통해 사용자 경험을 최적화한 실전 노하우를 공유합니다.

## 모바일 퍼스트 설계 원칙

### 1. 점진적 개선(Progressive Enhancement) 전략
```css
/* mobile-first.css - 모바일 우선 CSS 아키텍처 */

/* 기본 스타일 (모바일, 320px+) */
.container {
  width: 100%;
  padding: 16px;
  margin: 0 auto;
}

.card {
  width: 100%;
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.button {
  width: 100%;
  height: 48px; /* 터치 친화적 크기 */
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-primary {
  background: #FE8500;
  color: white;
}

.button-primary:hover {
  background: #E06900;
}

.button-primary:active {
  transform: scale(0.98);
}

/* 텍스트는 가독성을 위해 16px 이상 */
.text-body {
  font-size: 16px;
  line-height: 1.5;
  color: #333;
}

.text-small {
  font-size: 14px;
  line-height: 1.4;
  color: #666;
}

/* 네비게이션 - 모바일 우선 */
.navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  color: #666;
  text-decoration: none;
  font-size: 12px;
}

.nav-item.active {
  color: #FE8500;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

/* 태블릿 (768px+) */
@media (min-width: 768px) {
  .container {
    max-width: 728px;
    padding: 24px;
  }
  
  .card {
    padding: 24px;
    margin-bottom: 24px;
  }
  
  .button {
    width: auto;
    min-width: 120px;
    height: 44px;
    padding: 0 24px;
  }
  
  /* 태블릿에서는 사이드 네비게이션으로 전환 */
  .navigation {
    position: static;
    height: auto;
    background: transparent;
    border: none;
    flex-direction: column;
    width: 240px;
    padding: 24px 0;
  }
  
  .nav-item {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    padding: 12px 24px;
    font-size: 16px;
  }
  
  .nav-icon {
    margin-right: 12px;
    margin-bottom: 0;
  }
}

/* 데스크톱 (1024px+) */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    padding: 32px;
  }
  
  .card {
    padding: 32px;
  }
  
  /* 데스크톱에서는 호버 효과 강화 */
  .card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
  
  /* 그리드 레이아웃 활용 */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
}

/* 대형 데스크톱 (1440px+) */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
  
  .card-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 32px;
  }
}
```

### 2. 터치 인터페이스 최적화
```css
/* touch-interface.css - 터치 최적화 스타일 */

/* 최소 터치 타겟 크기 (44px x 44px) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 버튼 간 충분한 간격 */
.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.button-group .button {
  flex: 1;
  min-width: 120px;
}

/* 스와이프 가능한 카드 */
.swipeable-card {
  touch-action: pan-x;
  transition: transform 0.3s ease;
  position: relative;
  overflow: hidden;
}

.swipeable-card.swiping {
  transition: none;
}

.swipeable-card.swipe-left {
  transform: translateX(-100px);
}

.swipeable-card.swipe-right {
  transform: translateX(100px);
}

/* 스와이프 액션 버튼 */
.swipe-actions {
  position: absolute;
  top: 0;
  right: -100px;
  width: 100px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dc2626;
  color: white;
  transition: right 0.3s ease;
}

.swipeable-card.swiping .swipe-actions {
  right: 0;
}

/* 인풋 필드 최적화 */
.form-field {
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px; /* iOS 확대 방지 */
  background: white;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #FE8500;
  outline: none;
}

.form-input::placeholder {
  color: #999;
}

/* 체크박스와 라디오 버튼 확대 */
.checkbox,
.radio {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}

.checkbox-label,
.radio-label {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 8px 0;
  cursor: pointer;
  user-select: none;
}

/* 드롭다운 최적화 */
.select {
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
```

## 성능 최적화 전략

### 1. 이미지 최적화
```html
<!-- responsive-images.html - 반응형 이미지 최적화 -->

<!-- 1. Picture 요소를 활용한 반응형 이미지 -->
<picture>
  <!-- WebP 지원 브라우저용 -->
  <source
    media="(min-width: 768px)"
    srcset="
      /images/hero-desktop.webp 1200w,
      /images/hero-desktop@2x.webp 2400w
    "
    sizes="(min-width: 1200px) 1200px, 100vw"
    type="image/webp"
  >
  <source
    media="(max-width: 767px)"
    srcset="
      /images/hero-mobile.webp 400w,
      /images/hero-mobile@2x.webp 800w
    "
    sizes="100vw"
    type="image/webp"
  >
  
  <!-- Fallback JPEG -->
  <source
    media="(min-width: 768px)"
    srcset="
      /images/hero-desktop.jpg 1200w,
      /images/hero-desktop@2x.jpg 2400w
    "
    sizes="(min-width: 1200px) 1200px, 100vw"
  >
  <img
    src="/images/hero-mobile.jpg"
    srcset="/images/hero-mobile@2x.jpg 2x"
    alt="카카오페이 메인 화면"
    loading="eager"
    width="400"
    height="300"
  >
</picture>

<!-- 2. 지연 로딩이 적용된 이미지 -->
<img
  src="/images/placeholder.jpg"
  data-src="/images/content-image.jpg"
  data-srcset="
    /images/content-image-400.jpg 400w,
    /images/content-image-800.jpg 800w,
    /images/content-image-1200.jpg 1200w
  "
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="콘텐츠 이미지"
  loading="lazy"
  class="lazy-image"
  width="400"
  height="300"
>

<!-- 3. CSS로 처리되는 배경 이미지 -->
<div class="hero-section" data-bg-mobile="/images/bg-mobile.jpg" data-bg-desktop="/images/bg-desktop.jpg">
  <h1>모바일 우선 디자인</h1>
</div>
```

```javascript
// image-optimization.js - 이미지 최적화 스크립트
class ImageOptimizer {
  constructor() {
    this.initLazyLoading();
    this.initResponsiveBackgrounds();
    this.preloadCriticalImages();
  }
  
  // 지연 로딩 구현
  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px'
      });
      
      document.querySelectorAll('.lazy-image').forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (srcset) {
      img.srcset = srcset;
    }
    
    if (src) {
      img.src = src;
    }
    
    img.classList.add('loaded');
  }
  
  loadAllImages() {
    document.querySelectorAll('.lazy-image').forEach(img => {
      this.loadImage(img);
    });
  }
  
  // 반응형 배경 이미지
  initResponsiveBackgrounds() {
    const updateBackgrounds = () => {
      const isMobile = window.innerWidth < 768;
      
      document.querySelectorAll('[data-bg-mobile]').forEach(el => {
        const mobileImg = el.dataset.bgMobile;
        const desktopImg = el.dataset.bgDesktop;
        const imageUrl = isMobile ? mobileImg : (desktopImg || mobileImg);
        
        el.style.backgroundImage = `url(${imageUrl})`;
      });
    };
    
    updateBackgrounds();
    
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateBackgrounds, 250);
    });
  }
  
  // 중요 이미지 미리 로드
  preloadCriticalImages() {
    const criticalImages = [
      '/images/logo.svg',
      '/images/hero-mobile.webp',
      '/images/icon-sprite.svg'
    ];
    
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }
  
  // 이미지 압축 및 포맷 변환
  static async optimizeImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 비율 유지하며 크기 조정
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/webp', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  new ImageOptimizer();
});
```

### 2. CSS 및 JavaScript 최적화
```css
/* critical.css - 중요 CSS (인라인으로 삽입) */

/* 폰트 로딩 최적화 */
@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/Pretendard-Regular.woff2') format('woff2'),
       url('/fonts/Pretendard-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* FOIT 방지 */
}

@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/Pretendard-Bold.woff2') format('woff2'),
       url('/fonts/Pretendard-Bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* 레이아웃 시프트 방지 */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Above the fold 콘텐츠 스타일 */
.header {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.main-content {
  min-height: calc(100vh - 60px);
  padding: 0 16px;
}

/* 스크롤 최적화 */
.scroll-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 모멘텀 스크롤 */
}

/* 애니메이션 최적화 */
.animated {
  will-change: transform, opacity;
}

.fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 성능을 위한 변환 사용 */
.slide-up {
  transform: translateZ(0); /* 하드웨어 가속 */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

```javascript
// performance-optimization.js - 성능 최적화 스크립트
class PerformanceOptimizer {
  constructor() {
    this.initCriticalResourceHints();
    this.initIntersectionObserver();
    this.initServiceWorker();
    this.measurePerformance();
  }
  
  // 리소스 힌트 추가
  initCriticalResourceHints() {
    const hints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//api.kakaopay.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
      { rel: 'prefetch', href: '/images/icon-sprite.svg' }
    ];
    
    hints.forEach(hint => {
      const link = document.createElement('link');
      Object.assign(link, hint);
      document.head.appendChild(link);
    });
  }
  
  // Intersection Observer로 요소 가시성 감지
  initIntersectionObserver() {
    const observerOptions = {
      rootMargin: '100px 0px',
      threshold: 0.1
    };
    
    // 애니메이션 트리거
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          animationObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      animationObserver.observe(el);
    });
    
    // 무한 스크롤
    const loadMoreObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadMoreContent();
        }
      });
    });
    
    const loadTrigger = document.querySelector('.load-more-trigger');
    if (loadTrigger) {
      loadMoreObserver.observe(loadTrigger);
    }
  }
  
  // 서비스 워커 등록
  async initServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
  }
  
  // 성능 측정
  measurePerformance() {
    // Web Vitals 측정
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(this.sendToAnalytics);
      getFID(this.sendToAnalytics);
      getFCP(this.sendToAnalytics);
      getLCP(this.sendToAnalytics);
      getTTFB(this.sendToAnalytics);
    });
    
    // 페이지 로드 성능 측정
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paintEntries = performance.getEntriesByType('paint');
        
        const metrics = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime,
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime,
        };
        
        this.sendToAnalytics({ name: 'page-load', metrics });
      }, 0);
    });
  }
  
  sendToAnalytics(metric) {
    // 분석 도구로 메트릭 전송
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        custom_parameter_1: metric.value,
        custom_parameter_2: metric.rating,
      });
    }
    
    console.log('Performance metric:', metric);
  }
  
  // 무한 스크롤 콘텐츠 로드
  async loadMoreContent() {
    try {
      const response = await fetch('/api/more-content');
      const content = await response.text();
      
      const container = document.querySelector('.content-container');
      container.insertAdjacentHTML('beforeend', content);
      
      // 새로 추가된 이미지에 lazy loading 적용
      this.initLazyLoading();
    } catch (error) {
      console.error('Failed to load more content:', error);
    }
  }
  
  // 디바운스된 리사이즈 처리
  handleResize = this.debounce(() => {
    // 뷰포트 단위 업데이트 (iOS Safari 대응)
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // 반응형 네비게이션 업데이트
    this.updateNavigation();
  }, 250);
  
  updateNavigation() {
    const nav = document.querySelector('.navigation');
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      nav.classList.add('mobile-nav');
      nav.classList.remove('desktop-nav');
    } else {
      nav.classList.add('desktop-nav');
      nav.classList.remove('mobile-nav');
    }
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  new PerformanceOptimizer();
});
```

## 사용자 경험 최적화

### 1. 제스처 기반 인터랙션
```javascript
// gesture-interactions.js - 제스처 인터랙션 구현
class GestureHandler {
  constructor() {
    this.initSwipeGestures();
    this.initPullToRefresh();
    this.initTouchFeedback();
  }
  
  initSwipeGestures() {
    const swipeElements = document.querySelectorAll('.swipeable');
    
    swipeElements.forEach(element => {
      let startX, startY, currentX, currentY;
      let isDragging = false;
      let startTime;
      
      element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
        isDragging = true;
        
        element.style.transition = 'none';
      });
      
      element.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        // 수직 스크롤 감지
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
          isDragging = false;
          return;
        }
        
        e.preventDefault();
        
        // 수평 스와이프 처리
        if (Math.abs(deltaX) > 10) {
          element.style.transform = `translateX(${deltaX}px)`;
          
          // 스와이프 방향에 따른 액션 표시
          const swipeThreshold = element.offsetWidth * 0.3;
          
          if (deltaX > swipeThreshold) {
            element.classList.add('swipe-right-active');
            element.classList.remove('swipe-left-active');
          } else if (deltaX < -swipeThreshold) {
            element.classList.add('swipe-left-active');
            element.classList.remove('swipe-right-active');
          } else {
            element.classList.remove('swipe-left-active', 'swipe-right-active');
          }
        }
      });
      
      element.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const deltaX = currentX - startX;
        const deltaTime = Date.now() - startTime;
        const velocity = Math.abs(deltaX) / deltaTime;
        
        element.style.transition = 'transform 0.3s ease';
        
        const swipeThreshold = element.offsetWidth * 0.3;
        const velocityThreshold = 0.5;
        
        if (Math.abs(deltaX) > swipeThreshold || velocity > velocityThreshold) {
          if (deltaX > 0) {
            this.handleSwipeRight(element);
          } else {
            this.handleSwipeLeft(element);
          }
        } else {
          // 원위치 복귀
          element.style.transform = '';
          element.classList.remove('swipe-left-active', 'swipe-right-active');
        }
        
        isDragging = false;
      });
    });
  }
  
  handleSwipeLeft(element) {
    // 삭제 액션
    element.style.transform = 'translateX(-100%)';
    
    setTimeout(() => {
      element.remove();
      this.showToast('항목이 삭제되었습니다.');
    }, 300);
  }
  
  handleSwipeRight(element) {
    // 보관 액션
    element.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
      element.classList.add('archived');
      element.style.transform = '';
      this.showToast('항목이 보관되었습니다.');
    }, 300);
  }
  
  initPullToRefresh() {
    let startY, currentY, isPulling = false;
    const pullIndicator = document.querySelector('.pull-indicator');
    const refreshThreshold = 80;
    
    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    });
    
    document.addEventListener('touchmove', (e) => {
      if (!isPulling) return;
      
      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;
      
      if (pullDistance > 0) {
        e.preventDefault();
        
        const scale = Math.min(pullDistance / refreshThreshold, 1);
        
        if (pullIndicator) {
          pullIndicator.style.transform = `translateY(${pullDistance}px) scale(${scale})`;
          pullIndicator.style.opacity = scale;
          
          if (pullDistance > refreshThreshold) {
            pullIndicator.classList.add('ready-to-refresh');
          } else {
            pullIndicator.classList.remove('ready-to-refresh');
          }
        }
      }
    });
    
    document.addEventListener('touchend', () => {
      if (!isPulling) return;
      
      const pullDistance = currentY - startY;
      
      if (pullDistance > refreshThreshold) {
        this.performRefresh();
      } else if (pullIndicator) {
        pullIndicator.style.transform = '';
        pullIndicator.style.opacity = '';
        pullIndicator.classList.remove('ready-to-refresh');
      }
      
      isPulling = false;
    });
  }
  
  async performRefresh() {
    const pullIndicator = document.querySelector('.pull-indicator');
    
    if (pullIndicator) {
      pullIndicator.classList.add('refreshing');
    }
    
    try {
      // 새로운 데이터 로드
      await this.loadNewData();
      this.showToast('새로고침 완료');
    } catch (error) {
      this.showToast('새로고침 실패');
    } finally {
      if (pullIndicator) {
        setTimeout(() => {
          pullIndicator.style.transform = '';
          pullIndicator.style.opacity = '';
          pullIndicator.classList.remove('refreshing', 'ready-to-refresh');
        }, 300);
      }
    }
  }
  
  initTouchFeedback() {
    // 터치 피드백을 위한 리플 이펙트
    document.addEventListener('touchstart', (e) => {
      const target = e.target.closest('.touch-feedback');
      if (!target) return;
      
      const ripple = document.createElement('span');
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.touches[0].clientX - rect.left - size / 2;
      const y = e.touches[0].clientY - rect.top - size / 2;
      
      ripple.classList.add('ripple-effect');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      
      target.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
    
    // 햅틱 피드백 (지원하는 디바이스에서)
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.haptic-feedback');
      if (target && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    });
  }
  
  showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 애니메이션을 위한 프레임 대기
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }
  
  async loadNewData() {
    // 데이터 로드 시뮬레이션
    return new Promise(resolve => {
      setTimeout(resolve, 1500);
    });
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  new GestureHandler();
});
```

### 2. 적응형 콘텐츠 로딩
```javascript
// adaptive-loading.js - 적응형 콘텐츠 로딩
class AdaptiveLoader {
  constructor() {
    this.connection = this.getConnectionInfo();
    this.deviceCapabilities = this.getDeviceCapabilities();
    this.initAdaptiveLoading();
  }
  
  getConnectionInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    
    return { effectiveType: 'unknown' };
  }
  
  getDeviceCapabilities() {
    return {
      memory: navigator.deviceMemory || 4,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      isLowEndDevice: navigator.deviceMemory <= 2
    };
  }
  
  initAdaptiveLoading() {
    // 연결 상태에 따른 이미지 품질 조정
    this.adaptImageQuality();
    
    // 디바이스 성능에 따른 애니메이션 조정
    this.adaptAnimations();
    
    // 데이터 절약 모드 처리
    this.handleDataSaver();
    
    // 연결 상태 변경 감지
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.connection = this.getConnectionInfo();
        this.adaptImageQuality();
      });
    }
  }
  
  adaptImageQuality() {
    const images = document.querySelectorAll('.adaptive-image');
    const quality = this.getOptimalImageQuality();
    
    images.forEach(img => {
      const baseSrc = img.dataset.src || img.src;
      const adaptedSrc = this.getAdaptedImageUrl(baseSrc, quality);
      
      if (img.tagName === 'IMG') {
        img.src = adaptedSrc;
      } else {
        img.style.backgroundImage = `url(${adaptedSrc})`;
      }
    });
  }
  
  getOptimalImageQuality() {
    const { effectiveType, saveData } = this.connection;
    const { isLowEndDevice } = this.deviceCapabilities;
    
    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'low';
    }
    
    if (isLowEndDevice || effectiveType === '3g') {
      return 'medium';
    }
    
    return 'high';
  }
  
  getAdaptedImageUrl(originalUrl, quality) {
    const url = new URL(originalUrl);
    const params = new URLSearchParams(url.search);
    
    switch (quality) {
      case 'low':
        params.set('w', '400');
        params.set('q', '60');
        break;
      case 'medium':
        params.set('w', '800');
        params.set('q', '75');
        break;
      default:
        params.set('w', '1200');
        params.set('q', '90');
    }
    
    url.search = params.toString();
    return url.toString();
  }
  
  adaptAnimations() {
    const { isLowEndDevice, memory } = this.deviceCapabilities;
    
    if (isLowEndDevice || memory <= 2) {
      // 저사양 디바이스에서는 애니메이션 단순화
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      document.body.classList.add('reduced-animations');
    }
    
    // 사용자 설정 존중
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('no-animations');
    }
  }
  
  handleDataSaver() {
    if (this.connection.saveData) {
      document.body.classList.add('data-saver-mode');
      
      // 불필요한 리소스 로딩 방지
      const nonEssentialImages = document.querySelectorAll('.non-essential');
      nonEssentialImages.forEach(img => img.style.display = 'none');
      
      // 동영상 자동재생 비활성화
      const videos = document.querySelectorAll('video[autoplay]');
      videos.forEach(video => {
        video.autoplay = false;
        video.preload = 'none';
      });
    }
  }
  
  // 점진적 콘텐츠 로딩
  async loadContentProgressively(container) {
    const loadingStages = [
      () => this.loadCriticalContent(container),
      () => this.loadSecondaryContent(container),
      () => this.loadEnhancementContent(container)
    ];
    
    for (const stage of loadingStages) {
      await stage();
      
      // 연결 상태가 나쁘면 로딩 중단
      if (this.connection.effectiveType === 'slow-2g' || this.connection.saveData) {
        break;
      }
      
      // 다음 단계까지 지연
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  async loadCriticalContent(container) {
    const criticalElements = container.querySelectorAll('[data-priority="critical"]');
    return Promise.all([...criticalElements].map(el => this.loadElement(el)));
  }
  
  async loadSecondaryContent(container) {
    const secondaryElements = container.querySelectorAll('[data-priority="secondary"]');
    return Promise.all([...secondaryElements].map(el => this.loadElement(el)));
  }
  
  async loadEnhancementContent(container) {
    const enhancementElements = container.querySelectorAll('[data-priority="enhancement"]');
    return Promise.all([...enhancementElements].map(el => this.loadElement(el)));
  }
  
  async loadElement(element) {
    const src = element.dataset.src;
    if (!src) return;
    
    return new Promise((resolve, reject) => {
      if (element.tagName === 'IMG') {
        element.onload = resolve;
        element.onerror = reject;
        element.src = src;
      } else {
        // 다른 유형의 요소 처리
        resolve();
      }
    });
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  new AdaptiveLoader();
});
```

모바일 퍼스트 반응형 디자인은 단순히 화면 크기에 맞추는 것을 넘어 모바일 사용자의 컨텍스트와 제약사항을 이해하고 최적화하는 것입니다. 성능, 사용성, 접근성을 모두 고려한 통합적 접근을 통해 모든 디바이스에서 일관된 고품질 경험을 제공할 수 있습니다.