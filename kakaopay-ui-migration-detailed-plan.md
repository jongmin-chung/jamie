# KakaoPay 기술 블로그 UI/UX 마이그레이션 상세 계획

이 문서는 KakaoPay 기술 블로그의 UI/UX를 <https://tech.kakaopay.com/와> 동일한 형태로 마이그레이션하기 위한 상세 계획서입니다. Phase 5부터 Phase 8까지의 작업을 단계별로 정의하고, 특히 목차(Table of Contents) 기능의 구현에 중점을 둡니다.

## 기술 스택

- Next.js (App Router)
- Tailwind CSS
- shadcn/ui 컴포넌트
- Playwright (테스트 및 검증)

## Phase 5: 태그/추천글/하단 영역 단순화 (2주차)

### 1. 태그 시스템 개선

#### 태그를 shadcn/ui Badge로 변환

**현재 상태**:

- 태그가 여러 곳에 중복 표시되고 있음
- 일관된 스타일링이 부족함

**구현 계획**:

1. shadcn/ui Badge 컴포넌트 설정

   ```bash
   npx shadcn-ui@latest add badge
   ```

2. 태그 컴포넌트 구현

   ```tsx
   // components/PostTag.tsx
   import { Badge } from "@/components/ui/badge";
   import Link from "next/link";
   
   interface PostTagProps {
     tag: string;
   }
   
   export function PostTag({ tag }: PostTagProps) {
     return (
       <Link href={`/tag/${tag}`}>
         <Badge variant="outline" className="bg-transparent border-muted-foreground/30 text-muted-foreground hover:bg-primary/10 transition-colors">
           #{tag}
         </Badge>
       </Link>
     );
   }
   ```

3. BlogPostLayout 컴포넌트 수정
   - 기존 태그 표시 영역을 본문 하단으로 제한
   - 제목 상단이나 사이드바의 태그 제거
   - Badge 스타일로 통일

```tsx
// BlogPostLayout.tsx 수정 부분
{/* 본문 하단 태그 영역만 유지 */}
<div className="flex flex-wrap gap-2 mt-12 mb-8">
  <span className="font-semibold text-muted-foreground">태그:</span>
  {tags.map((tag) => (
    <PostTag key={tag} tag={tag} />
  ))}
</div>
```

### 2. 추천글 영역 최소화

**현재 상태**:

- 추천글이 큰 카드로 표시되어 많은 공간 차지
- 불필요한 정보 포함

**구현 계획**:

1. 추천글 컴포넌트 수정
   - shadcn/ui Card 컴포넌트 활용
   - 최소한의 정보만 표시 (제목, 게시 날짜)
   - 화면 너비에 따라 반응형으로 표시 개수 조절

```tsx
// components/RelatedPosts.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface RelatedPostsProps {
  posts: Array<{
    slug: string;
    title: string;
    date: string;
  }>;
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  // 추천글이 없으면 표시하지 않음
  if (!posts.length) return null;
  
  return (
    <div className="bg-muted/50 py-8 mt-8">
      <div className="container max-w-4xl mx-auto px-4">
        <h2 className="text-xl font-semibold mb-6">추천 글</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.slice(0, 4).map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug}>
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{post.date}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

2. BlogPostLayout에 통합
   - 추천글 데이터가 있을 때만 표시
   - 최소한의 UI로 제한

### 3. 하단 영역(Footer) 단순화

**현재 상태**:

- 복잡한 하단 영역 구조
- 불필요한 링크 다수 포함

**구현 계획**:

1. Footer 컴포넌트 단순화
   - 저작권 정보만 유지
   - 필수 링크만 포함 (카카오페이 홈페이지, 개발자 센터)

```tsx
// components/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© Kakao pay corp.</p>
          <div className="flex gap-6">
            <a 
              href="https://www.kakaopay.com" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              카카오페이
            </a>
            <a 
              href="https://developers.kakaopay.com" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              개발자센터
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

## Phase 6: 네비게이션/브레드크럼 최소화 (3주차)

### 1. 상단 네비게이션 단순화

**현재 상태**:

- 다수의 네비게이션 링크
- 복잡한 메뉴 구조

**구현 계획**:

1. Header 컴포넌트 단순화
   - "블로그 목록" 링크만 유지
   - 불필요한 드롭다운 메뉴 제거
   - 로고 및 검색 기능만 유지

```tsx
// components/Header.tsx
import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Search } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>
            
            <nav>
              <ul className="flex gap-6">
                <li>
                  <Link 
                    href="/blog" 
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    블로그 목록
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          <Button variant="ghost" size="icon" aria-label="검색">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
```

### 2. 브레드크럼 제거

**현재 상태**:

- 복잡한 브레드크럼 내비게이션
- 페이지 간 불필요한 경로 표시

**구현 계획**:

1. 브레드크럼 컴포넌트 완전히 제거
2. 블로그 포스트 내 간단한 "블로그 목록" 링크로 대체

```tsx
// BlogPostLayout.tsx 수정 부분
{/* 단순한 뒤로가기 버튼으로 대체 */}
<div className="max-w-screen-xl mx-auto w-full px-4 py-8">
  <Link
    href="/blog"
    className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
  >
    <Button variant="ghost" size="sm" className="gap-2">
      <ChevronLeft className="h-4 w-4" />
      블로그 목록
    </Button>
  </Link>
</div>
```

## Phase 7: 반응형/모바일 최적화 (3주차)

### 1. 반응형 디자인 구현

**현재 상태**:

- 일부 컴포넌트에서 모바일 최적화 부족
- 이미지 및 코드 블록이 작은 화면에서 넘침 현상 발생

**구현 계획**:

1. Tailwind 반응형 접두사 적용
   - `sm:`, `md:`, `lg:`, `xl:` 접두사를 사용하여 모든 컴포넌트에 반응형 설정

2. 이미지 최적화
   - Next.js Image 컴포넌트 사용하여 자동 최적화
   - 반응형 크기 조정

```tsx
// components/OptimizedImage.tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function OptimizedImage({ src, alt, className }: OptimizedImageProps) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-md", className)}>
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={630}
        className="w-full h-auto object-cover"
        priority={false}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
      />
    </div>
  );
}
```

3. 코드 블록 최적화
   - 수평 스크롤이 가능하도록 설정
   - 모바일에서 가독성 개선

```tsx
// components/CodeBlock.tsx 수정
<pre className="max-w-full overflow-x-auto p-4 rounded-md bg-muted text-sm">
  <code>{children}</code>
</pre>
```

4. 본문 컨텐츠 최적화
   - 폰트 크기 및 여백 조정
   - 모바일 터치 영역 확대

```css
/* globals.css 수정 */
.prose {
  @apply max-w-none;
}

.prose p, .prose ul, .prose ol {
  @apply text-base sm:text-lg leading-relaxed mb-6;
}

.prose h2 {
  @apply text-xl sm:text-2xl font-bold mt-10 mb-4;
}

.prose h3 {
  @apply text-lg sm:text-xl font-semibold mt-8 mb-3;
}

.prose a {
  @apply text-primary hover:text-primary/80 transition-colors;
}

.prose blockquote {
  @apply border-l-4 border-muted-foreground/30 pl-4 italic;
}

.prose code {
  @apply rounded bg-muted px-1.5 py-0.5 text-sm font-mono;
}

.prose img {
  @apply rounded-md my-8 mx-auto;
}
```

### 2. 목차(ToC) 반응형 최적화

**현재 상태**:

- 기존 TableOfContents 및 MobileTableOfContents 컴포넌트가 있지만 KakaoPay Tech 블로그와 스타일이 다름
- 반응형 동작이 최적화되어 있지 않음 (넓은 화면에서만 표시되어야 함)

**구현 계획**:

1. KakaoPay 스타일의 ToC 컴포넌트 수정
   - tech.kakaopay.com과 일치하는 스타일 적용
   - 넓은 화면에서만 표시되도록 Tailwind 반응형 접두사 활용

```tsx
// components/TableOfContents.tsx 수정
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TOCItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
  onClick?: () => void
}

export function TableOfContents({
  content,
  className,
  onClick,
}: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // Extract headings from HTML content
  useEffect(() => {
    if (typeof window === 'undefined') return

    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')

    const items: TOCItem[] = []
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1))
      const title = heading.textContent || ''

      let id = heading.id
      if (!id) {
        id =
          title
            .toLowerCase()
            .replace(/[^\w\s가-힣-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || `heading-${index}`
        heading.id = id
      }

      items.push({ id, title, level })
    })

    setTocItems(items)
  }, [content])

  // Scroll spy to highlight current section
  useEffect(() => {
    if (typeof window === 'undefined' || tocItems.length === 0) return

    const handleScroll = () => {
      const headings = tocItems
        .map((item) => document.getElementById(item.id))
        .filter(Boolean)

      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i]
        if (heading) {
          const rect = heading.getBoundingClientRect()
          if (rect.top <= 100) {
            setActiveId(tocItems[i].id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [tocItems])

  const handleClick = (id: string) => {
    if (typeof window === 'undefined') return

    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80 // Offset for fixed headers
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      })
    }

    onClick?.()
  }

  if (tocItems.length === 0) {
    return null
  }

  return (
    <nav className={cn('space-y-1 hidden xl:block', className)}>
      <h3 className="font-bold text-foreground mb-4 text-base border-b border-border pb-2">
        목차
      </h3>
      <div className="space-y-1">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={cn(
              'block text-left w-full transition-all duration-200 text-sm py-2 px-3 rounded-md hover:bg-primary/10',
              'text-muted-foreground hover:text-primary',
              {
                'bg-primary/10 text-primary font-medium border-l-2 border-primary':
                  activeId === item.id,
                'font-normal': activeId !== item.id,
                'pl-3': item.level === 1,
                'pl-5 text-xs': item.level === 2,
                'pl-7 text-xs': item.level === 3,
                'pl-9 text-xs': item.level === 4,
                'pl-11 text-xs': item.level === 5,
                'pl-13 text-xs': item.level === 6,
              }
            )}
          >
            <span className="line-clamp-3 leading-relaxed">{item.title}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
```

2. 모바일 버전 ToC 수정
   - 카카오페이 스타일로 맞추기
   - 화면 하단 우측에 플로팅 버튼으로 표시
   - 클릭 시 사이드 패널로 목차 표시

```tsx
// components/MobileTableOfContents.tsx 수정
'use client'

import { List, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TableOfContents } from './TableOfContents'

interface MobileTableOfContentsProps {
  content: string
  className?: string
}

export function MobileTableOfContents({
  content,
  className,
}: MobileTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Toggle Button - Only visible on mobile/tablet */}
      <div className={cn('xl:hidden fixed bottom-6 right-6 z-50', className)}>
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="rounded-full shadow-lg h-12 w-12"
          variant="default"
        >
          <List size={20} />
        </Button>
      </div>

      {/* Mobile TOC Overlay */}
      {isOpen && (
        <div className="xl:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed right-0 top-0 h-full w-80 max-w-[80vw] bg-card border-l border-border shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">목차</h3>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                >
                  <X size={18} />
                </Button>
              </div>

              <TableOfContents
                content={content}
                onClick={() => setIsOpen(false)} // Close on item click
                className="block" // Override the hidden class from TableOfContents
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

3. BlogPostLayout 수정하여 통합
   - ToC를 사이드바로 표시 (넓은 화면)
   - 모바일에서는 플로팅 버튼으로 접근

```tsx
// BlogPostLayout.tsx 수정 부분
<div className="flex flex-col lg:flex-row gap-12">
  {/* Main content */}
  <article className="lg:flex-1">
    {/* Post content */}
    <div className="prose prose-lg max-w-none">{content}</div>
    
    {/* Tags */}
    <div className="flex flex-wrap gap-2 mt-12 mb-8">
      <span className="font-semibold text-muted-foreground">태그:</span>
      {tags.map((tag) => (
        <PostTag key={tag} tag={tag} />
      ))}
    </div>
  </article>

  {/* Table of contents - right sidebar (visible only on larger screens) */}
  <aside className="lg:w-72 order-first lg:order-last">
    <div className="lg:sticky lg:top-24">
      <TableOfContents content={contentHtml} />
    </div>
  </aside>
</div>

{/* Mobile Table of Contents - Only visible on smaller screens */}
<MobileTableOfContents content={contentHtml} />
```

## Phase 8: 글로벌 스타일 및 컴포넌트 일원화 (3주차)

### 1. CSS 파일 통합

**현재 상태**:

- blog-post.css 및 code-highlight.css 등 별도 파일 존재
- 스타일 관리가 분산되어 있음

**구현 계획**:

1. blog-post.css 및 code-highlight.css 파일 제거
2. 필요한 스타일을 globals.css로 통합

```css
/* globals.css에 통합될 스타일 */

/* 본문 스타일 */
.prose {
  @apply max-w-none text-foreground;
}

/* 기존 blog-post.css에서 가져온 스타일 */
.prose h1 {
  @apply text-3xl font-bold mt-12 mb-6;
}

.prose h2 {
  @apply text-2xl font-bold mt-10 mb-4;
}

.prose h3 {
  @apply text-xl font-semibold mt-8 mb-3;
}

/* 기존 code-highlight.css에서 가져온 스타일 */
pre {
  @apply overflow-x-auto rounded-md bg-muted p-4 text-sm;
}

code {
  @apply font-mono;
}

.hljs-comment,
.hljs-quote {
  @apply text-muted-foreground;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-subst {
  @apply text-primary font-semibold;
}

.hljs-number,
.hljs-literal,
.hljs-variable,
.hljs-template-variable,
.hljs-tag .hljs-attr {
  @apply text-amber-500;
}

.hljs-string,
.hljs-doctag {
  @apply text-green-600;
}

.hljs-title,
.hljs-section,
.hljs-selector-id {
  @apply text-blue-600 font-bold;
}

.hljs-subst {
  @apply font-normal;
}

.hljs-built_in,
.hljs-builtin-name {
  @apply text-teal-600;
}

.hljs-tag,
.hljs-name,
.hljs-attribute {
  @apply text-pink-600 font-normal;
}

.hljs-regexp,
.hljs-link {
  @apply text-cyan-600;
}

.hljs-symbol,
.hljs-bullet {
  @apply text-purple-600;
}
```

3. CSS 파일 참조 업데이트
   - `app/layout.tsx`에서 불필요한 CSS import 제거
   - globals.css만 임포트하도록 수정

```tsx
// app/layout.tsx 수정
import '@/styles/globals.css'
// blog-post.css 및 code-highlight.css import 제거
```

### 2. shadcn/ui 컴포넌트 통합

**현재 상태**:

- 일부 커스텀 컴포넌트와 shadcn/ui 혼용
- 일관된 디자인 시스템 부재

**구현 계획**:

1. shadcn/ui 컴포넌트로 통일
   - Badge, Card, Button 등 shadcn/ui 컴포넌트 사용
   - Tailwind 유틸리티로 스타일 커스터마이징

2. 커스텀 테마 설정
   - `tailwind.config.js` 수정하여 카카오페이 테마 컬러 적용
   - shadcn/ui 컴포넌트 디자인 시스템에 맞춤

```js
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderWidth: {
        '1': '1px',
        '2': '2px',
        '3': '3px',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/typography')],
}
```

3. globals.css에 카카오페이 테마 색상 설정

```css
/* globals.css 수정 */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    /* 카카오페이 테마 컬러로 수정 */
    --primary: 45 100% 50%; /* 카카오페이 옐로우 */
    --primary-foreground: 0 0% 0%;
    
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
  }
}
```

## 구현 검증 계획

### 1. Playwright MCP 테스트 스크립트

각 단계별 UI 구현이 완료된 후 Playwright MCP를 통해 화면 테스트를 수행합니다.

```ts
// tests/ui/phase5-tags.spec.ts
import { test, expect } from '@playwright/test';

test('Phase 5: 태그 컴포넌트가 본문 하단에만 표시되는지 확인', async ({ page }) => {
  await page.goto('/blog/some-post-slug');
  
  // 태그가 본문 하단에만 표시되는지 확인
  const tagsSection = page.locator('.prose').locator('+ div').filter({ hasText: '태그:' });
  await expect(tagsSection).toBeVisible();
  
  // 다른 위치에 태그가 없는지 확인
  const headerTags = page.locator('header').locator(':has-text("#")');
  await expect(headerTags).toHaveCount(0);
});

// tests/ui/phase7-responsive.spec.ts
import { test, expect } from '@playwright/test';

test('Phase 7: 목차가 넓은 화면에서만 표시되는지 확인', async ({ page }) => {
  // 모바일 화면 크기로 설정
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/blog/some-post-slug');
  
  // 모바일에서는 ToC가 숨겨지고 플로팅 버튼이 표시되는지 확인
  const tocDesktop = page.locator('nav').filter({ hasText: '목차' }).first();
  await expect(tocDesktop).not.toBeVisible();
  
  const tocMobileButton = page.locator('button').filter({ hasText: '목차' });
  await expect(tocMobileButton).toBeVisible();
  
  // 넓은 화면으로 전환
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // 넓은 화면에서는 ToC가 표시되고 플로팅 버튼이 숨겨지는지 확인
  await expect(tocDesktop).toBeVisible();
  await expect(tocMobileButton).not.toBeVisible();
});
```

### 2. 시각적 검증

기존 카카오페이 기술 블로그(<https://tech.kakaopay.com/)와> 구현된 UI를 시각적으로 비교하여 일관성을 검증합니다.

1. 목차(ToC) 스타일 및 동작 비교
2. 태그 및 추천 글 영역 비교
3. 네비게이션 및 하단 영역 비교
4. 반응형 동작 비교

## 마무리 체크리스트

- [ ] 각 Phase의 모든 Task 완료
- [ ] Playwright MCP 테스트 통과
- [ ] 반응형 디자인 검증 (모바일, 태블릿, 데스크톱)
- [ ] 성능 최적화 검증 (Core Web Vitals)
- [ ] 접근성 검증 (키보드 탐색, 색상 대비)
- [ ] 카카오페이 기술 블로그와의 시각적 일관성 검증
