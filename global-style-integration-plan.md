# 글로벌 스타일 통합 계획 (Phase 8)

이 문서는 Phase 8에 명시된 글로벌 스타일 통합 계획을 상세히 설명합니다. 목표는 공통 스타일을 `globals.css`로 통합하고 일관된 디자인 시스템을 유지하는 것입니다.

## 1. 현황 분석

### 1.1 현재 스타일 상태

현재 블로그의 스타일 시스템은 다음과 같은 특징을 가지고 있습니다:

- 다양한 컴포넌트 내에 인라인 스타일 및 중복 정의된 클래스 존재
- 일관되지 않은 색상 및 간격 사용
- 컴포넌트별로 분산된 스타일 정의
- Tailwind CSS의 기능을 완전히 활용하지 못함

### 1.2 KakaoPay 기술 블로그 스타일 특징

KakaoPay 기술 블로그의 스타일은 다음과 같은 특징을 가지고 있습니다:

- 일관된 색상 팔레트 사용
- 체계적인 타이포그래피 시스템
- 통일된 간격 및 여백 체계
- 최소한의 사용자 정의 CSS
- 깔끔하고 미니멀한 디자인 언어

## 2. 통합 목표

### 2.1 주요 목표

- 공통 스타일을 `globals.css`로 통합
- Tailwind CSS 설정의 체계적인 관리
- 일관된 색상, 간격, 타이포그래피 시스템 구축
- 중복 스타일 제거
- 유지보수가 용이한 스타일 구조 마련

### 2.2 비기능적 요구사항

- 브라우저 호환성 유지
- 성능 최적화
- 코드 가독성 향상
- 확장 가능한 디자인 시스템 구축

## 3. 구현 계획

### 3.1 Tailwind 설정 최적화

```javascript
// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // KakaoPay 특화 색상
        kakao: {
          yellow: "#FFEB00",
          black: "#1A1A1A",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      typography: {
        DEFAULT: {
          css: {
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            'blockquote p:first-of-type::before': {
              content: '""',
            },
            'blockquote p:last-of-type::after': {
              content: '""',
            },
            img: {
              borderRadius: 'var(--radius)',
            },
            // 코드 블록 스타일 조정
            'pre': {
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: 'var(--radius)',
              padding: '1rem',
              overflow: 'auto',
            },
            // 링크 스타일
            'a': {
              color: 'hsl(var(--primary))',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            // 헤딩 스타일
            'h1,h2,h3,h4,h5,h6': {
              scrollMarginTop: '6rem',
            },
          },
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
```

### 3.2 globals.css 통합

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
    --font-mono: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
    
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    
    --primary: 25 95% 53%; /* KakaoPay 주 색상 - 오렌지 */
    --primary-foreground: 0 0% 98%;
    
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    
    --ring: 240 5% 64.9%;
    
    --radius: 0.5rem;

    /* 기본 간격 변수 */
    --spacing-0: 0;
    --spacing-1: 0.25rem;
    --spacing-2: 0.5rem;
    --spacing-3: 0.75rem;
    --spacing-4: 1rem;
    --spacing-5: 1.25rem;
    --spacing-6: 1.5rem;
    --spacing-8: 2rem;
    --spacing-10: 2.5rem;
    --spacing-12: 3rem;
    --spacing-16: 4rem;
    
    /* 기본 애니메이션 변수 */
    --transition-default: 0.2s ease-in-out;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    
    --primary: 25 95% 53%; /* KakaoPay 주 색상 유지 */
    --primary-foreground: 0 0% 98%;
    
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 85.7% 97.3%;
    
    --ring: 240 3.7% 15.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  /* 링크 기본 스타일 */
  a {
    @apply text-primary hover:underline transition-colors;
  }
  
  /* 헤딩 기본 스타일 */
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold scroll-mt-24;
  }
  
  h1 {
    @apply text-3xl md:text-4xl lg:text-5xl;
  }
  
  h2 {
    @apply text-2xl md:text-3xl lg:text-4xl;
  }
  
  h3 {
    @apply text-xl md:text-2xl lg:text-3xl;
  }
  
  h4 {
    @apply text-lg md:text-xl;
  }
  
  /* 코드 블록 기본 스타일 */
  pre, code {
    @apply font-mono;
  }
  
  pre {
    @apply p-4 rounded-lg bg-muted overflow-auto text-sm;
  }
  
  code:not(pre code) {
    @apply px-1.5 py-0.5 rounded-md bg-muted text-foreground text-sm;
  }
}

/* 공통 컴포넌트 스타일 */
@layer components {
  /* 컨테이너 레이아웃 */
  .container-narrow {
    @apply mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl;
  }
  
  .container-wide {
    @apply mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl;
  }
  
  /* 블로그 포스트 콘텐츠 스타일 */
  .blog-content {
    @apply prose dark:prose-invert max-w-none;
  }
  
  /* 태그 스타일 */
  .tag {
    @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors;
  }
  
  .tag-primary {
    @apply bg-primary/10 text-primary hover:bg-primary/20;
  }
  
  .tag-secondary {
    @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
  }
  
  /* 카드 스타일 확장 */
  .card-hover {
    @apply transition-shadow hover:shadow-md;
  }
  
  /* 버튼 스타일 확장 */
  .btn-icon {
    @apply inline-flex items-center justify-center rounded-md w-9 h-9;
  }
}

/* 유틸리티 클래스 */
@layer utilities {
  /* 텍스트 내용 제한 */
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  /* 스크롤바 스타일링 */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* 고정 비율 컨테이너 */
  .aspect-video {
    aspect-ratio: 16 / 9;
  }
  
  .aspect-square {
    aspect-ratio: 1 / 1;
  }
}
```

### 3.3 컴포넌트 스타일 통합

기존 컴포넌트에서 사용 중인 인라인 스타일을 globals.css로 통합하고 Tailwind 클래스로 대체합니다.

```tsx
// 기존 코드
function Button({ children, variant = 'primary', ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-md font-medium ${
        variant === 'primary'
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

// 통합 후 코드
// src/components/ui/button.tsx는 그대로 유지하고, variant를 통해 스타일 제어
// 기존 컴포넌트는 Button import해서 사용
import { Button } from "@/components/ui/button";

function MyComponent() {
  return (
    <div>
      <Button variant="default">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
    </div>
  );
}
```

### 3.4 글로벌 타이포그래피 통합

```tsx
// src/app/layout.tsx
import { Pretendard } from 'next/font/google';
import '@/styles/globals.css';

const pretendard = Pretendard({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${pretendard.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 3.5 프로젝트 전체 스타일 정리

1. 모든 컴포넌트 파일을 검토하여 인라인 스타일 제거
2. 중복되는 Tailwind 클래스 조합을 globals.css의 components 레이어로 이동
3. 색상 변수를 일관되게 사용하도록 수정
4. 간격 및 여백을 일관된 시스템으로 조정

## 4. 테스트 계획

### 4.1 스타일 통합 테스트

```tsx
// tests/styles/global-styles.spec.ts
import { test, expect } from '@playwright/test';

test('전역 스타일이 모든 페이지에 적용되는지 확인', async ({ page }) => {
  // 홈페이지 로드
  await page.goto('/');
  
  // 기본 폰트 패밀리 확인
  const fontFamily = await page.evaluate(() => {
    return window.getComputedStyle(document.body).fontFamily;
  });
  expect(fontFamily).toContain('Pretendard');
  
  // 기본 색상 확인
  const textColor = await page.evaluate(() => {
    return window.getComputedStyle(document.body).color;
  });
  // RGB 형식으로 foreground 색상 확인
  expect(textColor).not.toBe('');
  
  // 헤딩 스타일 확인
  await page.setContent('<h1>Test Heading</h1>');
  const h1FontWeight = await page.evaluate(() => {
    return window.getComputedStyle(document.querySelector('h1')).fontWeight;
  });
  expect(h1FontWeight).toBe('700'); // bold
});

test('컴포넌트 스타일이 전역 스타일을 상속받는지 확인', async ({ page }) => {
  // 블로그 포스트 페이지 로드
  await page.goto('/blog/some-post-slug');
  
  // 링크 스타일 확인
  const linkColor = await page.evaluate(() => {
    const link = document.querySelector('a');
    return link ? window.getComputedStyle(link).color : '';
  });
  // 링크 색상이 primary 색상인지 확인
  expect(linkColor).not.toBe('');
  
  // 코드 블록 스타일 확인
  const codeBlockBg = await page.evaluate(() => {
    const pre = document.querySelector('pre');
    return pre ? window.getComputedStyle(pre).backgroundColor : '';
  });
  // 코드 블록 배경색이 muted 색상인지 확인
  expect(codeBlockBg).not.toBe('');
});

test('다크 모드 스타일이 적용되는지 확인', async ({ page }) => {
  // 다크 모드로 페이지 로드
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  
  // 배경색 확인
  const bgColor = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  // 다크 모드 배경색 확인
  expect(bgColor).not.toBe('');
  
  // 텍스트 색상 확인
  const textColor = await page.evaluate(() => {
    return window.getComputedStyle(document.body).color;
  });
  // 다크 모드 텍스트 색상 확인
  expect(textColor).not.toBe('');
});
```

### 4.2 스타일 일관성 검증

```tsx
// tests/styles/consistency.spec.ts
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// 모든 컴포넌트 파일에서 직접 색상 값 사용 여부 확인
test('컴포넌트 파일에서 직접 색상 값 사용하지 않는지 확인', async () => {
  const componentsDir = path.join(__dirname, '../../src/components');
  const tsxFiles = findTsxFiles(componentsDir);
  
  for (const file of tsxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    // 직접 색상 값(#hex, rgb, hsl) 사용 확인
    const hexColorPattern = /#[0-9A-Fa-f]{3,8}/g;
    const rgbColorPattern = /rgb\(.*?\)/g;
    const hslColorPattern = /hsl\(.*?\)/g;
    
    const hexMatches = content.match(hexColorPattern) || [];
    const rgbMatches = content.match(rgbColorPattern) || [];
    const hslMatches = content.match(hslColorPattern) || [];
    
    // shadcn/ui 컴포넌트 제외
    if (!file.includes('/ui/')) {
      expect(hexMatches.length, `File ${file} contains direct hex colors`).toBe(0);
      expect(rgbMatches.length, `File ${file} contains direct RGB colors`).toBe(0);
      expect(hslMatches.length, `File ${file} contains direct HSL colors`).toBe(0);
    }
  }
});

// 재사용 가능한 스타일 클래스 확인
test('반복되는 Tailwind 클래스 조합 확인', async () => {
  const componentsDir = path.join(__dirname, '../../src/components');
  const tsxFiles = findTsxFiles(componentsDir);
  
  // 자주 반복되는 클래스 조합 찾기
  const classPatterns = {};
  
  for (const file of tsxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const classPattern = /className="([^"]*)"/g;
    let match;
    
    while ((match = classPattern.exec(content)) !== null) {
      const classes = match[1].trim();
      if (classes.split(' ').length >= 3) {
        classPatterns[classes] = (classPatterns[classes] || 0) + 1;
      }
    }
  }
  
  // 3번 이상 반복되는 클래스 조합 찾기
  const repeatedPatterns = Object.entries(classPatterns)
    .filter(([_, count]) => count >= 3)
    .map(([pattern]) => pattern);
  
  // 자주 반복되는 패턴은 @layer components로 추출 고려
  console.log('Consider extracting these repeated class patterns to @layer components:');
  repeatedPatterns.forEach(pattern => {
    console.log(`- ${pattern}`);
  });
});

// 파일 찾기 헬퍼 함수
function findTsxFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results = results.concat(findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
      results.push(fullPath);
    }
  }
  
  return results;
}
```

### 4.3 시각적 회귀 테스트

```tsx
// tests/visual/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

// 테스트할 페이지 목록
const pages = [
  { path: '/', name: 'Homepage' },
  { path: '/blog', name: 'Blog List' },
  { path: '/blog/some-post-slug', name: 'Blog Post' }
];

// 스타일 변경 전 스크린샷과 비교
for (const page of pages) {
  test(`${page.name} 시각적 회귀 테스트`, async ({ page: pageFixture }) => {
    // 페이지 로드
    await pageFixture.goto(page.path);
    
    // 페이지가 안정화될 때까지 대기
    await pageFixture.waitForLoadState('networkidle');
    
    // 현재 스크린샷 찍기
    const screenshot = await pageFixture.screenshot();
    
    // 이전 스크린샷과 비교 (실제 구현 시에는 Playwright의 toMatchSnapshot 사용)
    expect(screenshot).toMatchSnapshot(`${page.name.toLowerCase()}.png`);
  });
}
```

## 5. 구현 일정

1. **Tailwind 설정 최적화**: 0.5일
2. **globals.css 기본 변수 및 레이어 정의**: 1일
3. **공통 컴포넌트 스타일 추출 및 통합**: 1.5일
4. **인라인 스타일 제거 및 Tailwind 클래스 정리**: 1.5일
5. **다크 모드 스타일 최적화**: 0.5일
6. **테스트 및 디버깅**: 1일

**총 예상 소요 시간**: 6일

## 6. 글로벌 스타일 통합 체크리스트

- [ ] Tailwind 설정 파일 최적화
- [ ] globals.css에 기본 변수 정의
- [ ] 공통 타이포그래피 스타일 정의
- [ ] 공통 컴포넌트 스타일을 @layer components로 이동
- [ ] 모든 컴포넌트에서 인라인 스타일 제거
- [ ] 색상 시스템 통일
- [ ] 간격 및 여백 시스템 통일
- [ ] 다크 모드 스타일 최적화
- [ ] 유틸리티 클래스 정리
- [ ] 불필요한 CSS 파일 제거

## 7. 고려사항 및 리스크

### 7.1 성능 관련 고려사항

- **CSS 번들 크기**: 글로벌 스타일이 증가함에 따른 번들 크기 관리
- **사용하지 않는 CSS 제거**: PurgeCSS를 통한 미사용 스타일 제거
- **스타일 계산 최적화**: 복잡한 선택자 및 중첩 최소화

### 7.2 마이그레이션 고려사항

- **기존 스타일 호환성**: 기존 컴포넌트가 새로운 글로벌 스타일과 호환되는지 확인
- **점진적 적용**: 한 번에 모든 변경을 적용하는 대신 컴포넌트별로 점진적으로 적용

### 7.3 리스크 완화 전략

- **철저한 테스트**: 각 변경 후 시각적 회귀 테스트 실행
- **버전 관리**: 큰 변경 전에 브랜치 생성 및 체계적인 병합
- **문서화**: 스타일 시스템을 명확하게 문서화하여 일관성 유지

## 8. 결론

글로벌 스타일 통합 계획을 통해 블로그의 디자인 시스템을 체계화하고 유지보수성을 향상시킬 수 있습니다. Tailwind CSS의 기능을 최대한 활용하면서 일관된 디자인 언어를 구축하는 것이 목표입니다. 이를 통해 KakaoPay 기술 블로그와 유사한 깔끔하고 미니멀한 디자인을 구현할 수 있을 것입니다.
