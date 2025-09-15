---
title: "웹 성능 최적화 실전 가이드"
description: "실제 웹사이트 성능을 개선하는 구체적인 방법들을 살펴봅시다. Core Web Vitals부터 실무 최적화 기법까지."
publishedAt: "2025-09-06"
category: "frontend"
tags: ["performance", "optimization", "webvitals"]
author: "성능킹"
---

# 웹 성능 최적화 실전 가이드

웹 성능은 사용자 경험과 비즈니스 성과에 직접적인 영향을 미칩니다. 구글의 연구에 따르면 페이지 로딩 시간이 1초에서 3초로 늘어나면 이탈률이 32% 증가한다고 합니다.

## Core Web Vitals 이해하기

### LCP (Largest Contentful Paint)
가장 큰 콘텐츠 요소가 화면에 렌더링되는 시간

**목표**: 2.5초 이내

```javascript
// LCP 측정
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log('LCP:', entry.startTime);
  }
}).observe({entryTypes: ['largest-contentful-paint']});
```

### FID (First Input Delay)
첫 번째 사용자 입력에 대한 응답 지연 시간

**목표**: 100ms 이내

### CLS (Cumulative Layout Shift)
예상치 못한 레이아웃 이동

**목표**: 0.1 이하

## 이미지 최적화

### 1. 적절한 포맷 선택
```html
<!-- WebP 지원 브라우저용 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="설명">
</picture>
```

### 2. 지연 로딩 (Lazy Loading)
```html
<img src="placeholder.jpg" data-src="actual-image.jpg" loading="lazy" alt="이미지">
```

### 3. 반응형 이미지
```html
<img 
  src="image-400.jpg"
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="반응형 이미지"
>
```

## JavaScript 최적화

### 1. 코드 분할 (Code Splitting)
```javascript
// 동적 import 사용
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// 라우트 기반 분할
const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));
```

### 2. 트리 쉐이킹 (Tree Shaking)
```javascript
// 전체 라이브러리 import 피하기
import { debounce } from 'lodash'; // ❌
import debounce from 'lodash/debounce'; // ✅

// ES6 modules 사용
export { specificFunction } from './utils'; // ✅
```

### 3. 번들 분석
```bash
# Webpack Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer

# Next.js
npm install --save-dev @next/bundle-analyzer
```

## CSS 최적화

### 1. Critical CSS
페이지 초기 렌더링에 필요한 CSS만 인라인으로 포함

```html
<head>
  <style>
    /* Critical CSS - Above the fold content */
    .header { display: flex; justify-content: space-between; }
    .hero { background: #f0f0f0; padding: 2rem; }
  </style>
  
  <!-- Non-critical CSS 지연 로딩 -->
  <link rel="preload" href="/styles/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
</head>
```

### 2. CSS 압축 및 최적화
```css
/* 불필요한 코드 제거 */
.unused-class { display: none; } /* 사용하지 않는 클래스 제거 */

/* 효율적인 선택자 사용 */
.nav-item { } /* ✅ */
div > ul > li > a { } /* ❌ 과도한 중첩 */
```

### 3. CSS-in-JS 최적화
```javascript
// 런타임 계산 최소화
const styles = useMemo(() => ({
  container: {
    padding: isLarge ? '2rem' : '1rem'
  }
}), [isLarge]);
```

## 폰트 최적화

### 1. 폰트 로딩 전략
```html
<!-- 폰트 프리로드 -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- 폰트 디스플레이 설정 -->
<style>
@font-face {
  font-family: 'CustomFont';
  font-display: swap; /* FOIT 방지 */
  src: url('/fonts/main.woff2') format('woff2');
}
</style>
```

### 2. 서브셋 폰트 사용
```html
<!-- 한글 서브셋 -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&subset=korean&display=swap" rel="stylesheet">
```

## 네트워크 최적화

### 1. HTTP/2 Push
```javascript
// Next.js에서 리소스 프리로드
export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="preload" href="/api/critical-data" as="fetch" crossorigin />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
```

### 2. 서비스 워커 캐싱
```javascript
// sw.js
const CACHE_NAME = 'my-site-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### 3. CDN 활용
```javascript
// 이미지 CDN
const optimizedImageUrl = `https://images.example.com/transform/w_400,h_300,c_fill/${originalImagePath}`;

// 정적 자산 CDN
const cdnUrl = process.env.NODE_ENV === 'production' 
  ? 'https://cdn.example.com' 
  : '';
```

## 렌더링 최적화

### 1. Server-Side Rendering (SSR)
```javascript
// Next.js getServerSideProps
export async function getServerSideProps(context) {
  const data = await fetchCriticalData();
  
  return {
    props: { data }
  };
}
```

### 2. Static Site Generation (SSG)
```javascript
// Next.js getStaticProps
export async function getStaticProps() {
  const posts = await getAllPosts();
  
  return {
    props: { posts },
    revalidate: 3600 // ISR - 1시간마다 재생성
  };
}
```

### 3. 클라이언트 사이드 최적화
```javascript
// React.memo로 불필요한 리렌더링 방지
const ExpensiveComponent = React.memo(({ data, onClick }) => {
  return (
    <div onClick={onClick}>
      {/* 복잡한 렌더링 로직 */}
    </div>
  );
});

// useMemo로 비용이 큰 계산 메모이제이션
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

## 측정 및 모니터링

### 1. 성능 측정 도구
```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse https://example.com --output html --output-path ./report.html

# WebPageTest API
curl "https://www.webpagetest.org/runtest.php?url=https://example.com&k=API_KEY&f=json"
```

### 2. Real User Monitoring (RUM)
```javascript
// Web Vitals 라이브러리 사용
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToGoogleAnalytics({ name, delta, value, id }) {
  gtag('event', name, {
    event_category: 'Web Vitals',
    event_label: id,
    value: Math.round(name === 'CLS' ? delta * 1000 : delta),
    non_interaction: true,
  });
}

getCLS(sendToGoogleAnalytics);
getFID(sendToGoogleAnalytics);
getFCP(sendToGoogleAnalytics);
getLCP(sendToGoogleAnalytics);
getTTFB(sendToGoogleAnalytics);
```

### 3. 성능 예산 설정
```json
// lighthouse-config.json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    }
  }
}
```

## 실전 체크리스트

### 초기 로딩 최적화
- [ ] Critical CSS 인라인
- [ ] 중요 리소스 프리로드
- [ ] 이미지 지연 로딩
- [ ] JavaScript 코드 분할
- [ ] 폰트 최적화

### 런타임 성능
- [ ] 불필요한 리렌더링 제거
- [ ] 이벤트 리스너 최적화
- [ ] 메모리 누수 방지
- [ ] 애니메이션 최적화

### 네트워크 최적화
- [ ] 압축 활성화 (gzip, brotli)
- [ ] 적절한 캐시 헤더 설정
- [ ] CDN 사용
- [ ] HTTP/2 활용

## 마무리

웹 성능 최적화는 단순히 기술적인 개선을 넘어 비즈니스 가치를 창출하는 중요한 작업입니다. 측정 → 분석 → 최적화 → 검증의 사이클을 반복하며 지속적으로 개선해나가는 것이 중요합니다.

성능 최적화는 마라톤과 같습니다. 한 번에 모든 것을 개선하려 하지 말고, 가장 임팩트가 큰 부분부터 차근차근 접근해보세요.