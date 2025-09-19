# KakaoPay UI 마이그레이션: 네비게이션 및 브레드크럼 단순화 구현 가이드

이 문서는 Phase 6에서 계획한 네비게이션 및 브레드크럼 단순화를 실제로 구현하기 위한 상세 가이드를 제공합니다. 이 구현 가이드는 실제 코드 변경 사항과 단계별 구현 절차를 포함합니다.

## 1. 구현 개요

기존 네비게이션 및 브레드크럼 단순화 계획에 따라, 다음 주요 변경사항을 구현합니다:

1. 상단 네비게이션바 단순화 - "블로그 목록" 링크만 유지
2. 브레드크럼 내비게이션 완전히 제거
3. 블로그 포스트 페이지에 간단한 "블로그 목록" 링크만 제공
4. 모바일 네비게이션 최적화

## 2. 단계별 구현 절차

### 2.1 Header 컴포넌트 단순화

현재 Header 컴포넌트를 단순화하여 "블로그 목록" 링크만 남깁니다.

1. Header 컴포넌트 파일 수정:

```tsx
// src/components/Header.tsx
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
            {/* 로고 */}
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>
            
            {/* 단순화된 네비게이션 - "블로그 목록"만 남김 */}
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
          
          {/* 검색 버튼 */}
          <Button variant="ghost" size="icon" aria-label="검색">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
```

1. 네비게이션 관련 기타 컴포넌트에서 불필요한 링크 제거 (예: 카테고리, 태그 등)

### 2.2 브레드크럼 컴포넌트 제거

1. 브레드크럼 컴포넌트 파일 삭제:

```bash
rm src/components/Breadcrumb.tsx
```

1. 레이아웃 파일에서 브레드크럼 컴포넌트 참조 제거:

```tsx
// src/app/blog/layout.tsx 또는 관련 레이아웃 파일
// 제거할 코드:
// import { Breadcrumb } from "@/components/Breadcrumb";
// ...
// <Breadcrumb items={[...]} />
```

2. 블로그 포스트 페이지에서 브레드크럼 참조 제거:

```tsx
// src/app/blog/[slug]/page.tsx 또는 관련 페이지 파일
// 제거할 코드:
// import { Breadcrumb } from "@/components/Breadcrumb";
// ...
// <Breadcrumb items={[...]} />
```

### 2.3 블로그 포스트 페이지 내비게이션 단순화

블로그 포스트 페이지에 간단한 "블로그 목록" 링크를 추가합니다:

```tsx
// src/components/BlogPostLayout.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function BlogPostLayout({ post, children }) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 단순한 "블로그 목록" 링크 */}
      <div className="mb-6">
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
      
      {/* 블로그 포스트 콘텐츠 */}
      <article>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        {/* 기타 포스트 메타데이터 */}
        <div className="prose max-w-none mt-8">
          {children}
        </div>
      </article>
    </div>
  );
}
```

### 2.4 모바일 네비게이션 최적화

모바일 메뉴 컴포넌트가 존재하는 경우 이를 단순화합니다:

```tsx
// src/components/MobileMenu.tsx
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* 모바일 메뉴 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden"
        aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {/* 모바일 메뉴 패널 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden pt-16">
          <nav className="container p-4">
            <ul className="flex flex-col gap-4">
              <li>
                <Link 
                  href="/blog" 
                  className="text-foreground text-lg py-2 block"
                  onClick={() => setIsOpen(false)}
                >
                  블로그 목록
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
```

### 2.5 Footer 간소화

Footer 컴포넌트에서 불필요한 링크를 제거합니다:

```tsx
// src/components/Footer.tsx
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

## 3. 테스트 및 검증

구현 후 다음 테스트를 수행하여 변경 사항이 올바르게 적용되었는지 확인합니다:

### 3.1 Playwright 테스트 구현

```tsx
// tests/ui/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('상단 네비게이션이 단순화되었는지 확인', async ({ page }) => {
  // 홈페이지로 이동
  await page.goto('/');
  
  // 네비게이션에 "블로그 목록" 링크만 있는지 확인
  const nav = page.locator('header nav');
  const navLinks = nav.locator('a');
  
  await expect(navLinks).toHaveCount(1);
  await expect(navLinks).toHaveText('블로그 목록');
  
  // 다른 불필요한 메뉴 항목이 없는지 확인
  await expect(page.locator('header').getByText('카테고리')).toHaveCount(0);
  await expect(page.locator('header').getByText('태그')).toHaveCount(0);
});

test('블로그 포스트 페이지에 브레드크럼이 제거되었는지 확인', async ({ page }) => {
  // 블로그 포스트 페이지로 이동
  await page.goto('/blog/some-post-slug');
  
  // 브레드크럼이 없는지 확인
  await expect(page.locator('nav').filter({ hasText: '홈' })).toHaveCount(0);
  
  // 대신 간단한 "블로그 목록" 링크가 있는지 확인
  const backLink = page.getByRole('link', { name: /블로그 목록/ });
  await expect(backLink).toBeVisible();
  
  // 링크가 올바른 경로를 가리키는지 확인
  await expect(backLink).toHaveAttribute('href', '/blog');
});

test('모바일 화면에서 네비게이션이 적절히 동작하는지 확인', async ({ page }) => {
  // 모바일 화면 크기로 설정
  await page.setViewportSize({ width: 375, height: 667 });
  
  // 홈페이지로 이동
  await page.goto('/');
  
  // 모바일 메뉴 버튼이 있는 경우
  const menuButton = page.getByRole('button', { name: /메뉴/ });
  
  if (await menuButton.count() > 0) {
    // 메뉴 버튼 클릭
    await menuButton.click();
    
    // 메뉴가 열리고 "블로그 목록" 링크가 표시되는지 확인
    const blogLink = page.getByRole('link', { name: '블로그 목록' });
    await expect(blogLink).toBeVisible();
    
    // 다른 불필요한 메뉴 항목이 없는지 확인
    const menuItems = page.locator('nav ul li a');
    await expect(menuItems).toHaveCount(1);
  } else {
    // 모바일 메뉴 버튼이 없는 경우, 네비게이션이 직접 표시되는지 확인
    const blogLink = page.getByRole('link', { name: '블로그 목록' });
    await expect(blogLink).toBeVisible();
  }
});
```

### 3.2 수동 테스트 체크리스트

다음 사항을 수동으로 확인합니다:

1. **상단 네비게이션**:
   - [x] "블로그 목록" 링크만 표시되는지 확인
   - [x] 로고가 제대로 표시되는지 확인
   - [x] 검색 버튼이 제대로 작동하는지 확인

2. **브레드크럼**:
   - [x] 모든 페이지에서 브레드크럼이 완전히 제거되었는지 확인

3. **블로그 포스트 페이지**:
   - [x] "블로그 목록" 링크가 적절히 표시되는지 확인
   - [x] 링크 클릭 시 블로그 목록 페이지로 이동하는지 확인

4. **모바일 화면**:
   - [x] 모바일에서 네비게이션이 적절히 표시되는지 확인
   - [x] 모바일 메뉴가 제대로 작동하는지 확인

5. **디자인 일관성**:
   - [x] KakaoPay 기술 블로그와 유사한 디자인이 적용되었는지 확인

## 4. 구현 시 고려사항

### 4.1 기존 코드와의 호환성

- 네비게이션 변경으로 인해 영향을 받을 수 있는 다른 컴포넌트 확인
- 네비게이션 링크를 참조하는 테스트 코드 업데이트
- 페이지 간 이동 관련 코드 확인 및 필요시 업데이트

### 4.2 접근성 고려사항

- 모바일 메뉴 버튼에 적절한 aria-label 속성 추가
- 키보드 접근성 보장
- 충분한 색상 대비 확인

### 4.3 성능 최적화

- 불필요한 컴포넌트 제거로 인한 번들 크기 감소 확인
- 페이지 로딩 시간 측정 및 개선

## 5. 완료 기준

다음 기준이 충족되면 네비게이션 및 브레드크럼 단순화 구현이 완료된 것으로 간주합니다:

1. 상단 네비게이션에 "블로그 목록" 링크만 표시됨
2. 모든 페이지에서 브레드크럼이 완전히 제거됨
3. 블로그 포스트 페이지에 간단한 "블로그 목록" 링크만 제공됨
4. 모바일 화면에서 네비게이션이 최적화되어 표시됨
5. 모든 테스트가 성공적으로 통과함

## 6. 추가 개선 사항 (향후 고려)

1. **검색 기능 향상**: 네비게이션 단순화로 인해 검색의 중요성이 증가하므로, 검색 기능 개선 고려
2. **사용자 피드백 수집**: 네비게이션 변경 후 사용자 피드백을 수집하여 추가 개선 필요 사항 파악
3. **사이트맵 페이지**: 네비게이션 단순화를 보완하기 위한 사이트맵 페이지 추가 고려

## 7. 참고자료

- KakaoPay 기술 블로그: [https://tech.kakaopay.com/](https://tech.kakaopay.com/)
- Next.js 라우팅 문서: [https://nextjs.org/docs/app/building-your-application/routing](https://nextjs.org/docs/app/building-your-application/routing)
- shadcn/ui 컴포넌트 문서: [https://ui.shadcn.com/docs](https://ui.shadcn.com/docs)
