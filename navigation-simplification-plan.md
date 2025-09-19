# 네비게이션 및 브레드크럼 단순화 계획

이 문서는 Phase 6에 명시된 대로 블로그 네비게이션과 브레드크럼을 단순화하기 위한 상세 계획을 제공합니다. 핵심 목표는 상단 네비게이션을 "블로그 목록"만 남기고 단순화하고, 브레드크럼 및 불필요한 링크를 제거하는 것입니다.

## 1. 현황 분석

### 1.1 현재 네비게이션 상태

현재 블로그의 네비게이션 시스템은 다음과 같은 특징을 가지고 있습니다:

- 복잡한 상단 네비게이션 바 (여러 메뉴 및 링크 포함)
- 블로그 포스트 페이지에 브레드크럼 내비게이션 표시
- 다수의 중복되거나 불필요한 링크가 존재

### 1.2 KakaoPay 기술 블로그 네비게이션 스타일

KakaoPay 기술 블로그의 네비게이션은 다음과 같은 특징을 가지고 있습니다:

- 심플한 상단 네비게이션 (로고, "Tech Log" 링크, 검색 버튼)
- 블로그 포스트 상단에 간단한 "블로그 목록" 링크만 표시
- 브레드크럼 내비게이션 없음
- 미니멀하고 깔끔한 디자인

## 2. 마이그레이션 목표

### 2.1 주요 목표

- 상단 네비게이션을 단순화하여 "블로그 목록"만 남기기
- 브레드크럼 내비게이션 완전히 제거
- 불필요한 링크 제거로 UI 간소화
- 블로그 포스트 페이지에서는 간단한 "블로그 목록" 링크만 제공

### 2.2 비기능적 요구사항

- 모바일 환경에서도 최적화된 네비게이션 제공
- 페이지 간 일관된 사용자 경험 유지
- 사용자가 혼란스럽지 않도록 핵심 내비게이션 요소는 유지

## 3. 구현 계획

### 3.1 Header 컴포넌트 단순화

현재 Header 컴포넌트를 단순화하여 필수 요소만 남깁니다:

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

### 3.2 브레드크럼 컴포넌트 제거

1. 기존 브레드크럼 컴포넌트가 있다면 완전히 제거:

```bash
# 브레드크럼 컴포넌트 파일이 있는 경우 삭제
rm src/components/Breadcrumb.tsx
```

1. 브레드크럼을 사용하는 모든 레이아웃 및 페이지 컴포넌트에서 관련 코드 제거:

```tsx
// 예: src/app/blog/[slug]/page.tsx 또는 관련 레이아웃 파일
// 브레드크럼 관련 import 제거
// import { Breadcrumb } from "@/components/Breadcrumb";

// 브레드크럼 컴포넌트 사용 부분 제거
// <Breadcrumb items={[...]} />
```

### 3.3 블로그 포스트 페이지 내비게이션 단순화

블로그 포스트 페이지에서 간단한 "블로그 목록" 링크로 대체:

```tsx
// src/components/BlogPostLayout.tsx (수정 부분)
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

// 기존 브레드크럼 또는 복잡한 내비게이션 대신 단순한 뒤로가기 링크
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

### 3.4 Footer 간소화

Footer에서도 불필요한 링크를 제거하고 필수 정보만 유지:

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

### 3.5 모바일 네비게이션 최적화

모바일 환경에서 네비게이션 단순화:

```tsx
// 모바일 메뉴 버튼이 있는 경우 이를 단순화
// src/components/MobileMenu.tsx (있는 경우)
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

## 4. 테스트 계획

### 4.1 Playwright 테스트

네비게이션 단순화의 성공적인 구현을 확인하기 위한 테스트 케이스:

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

### 4.2 시각적 테스트

시각적인 일관성을 확인하기 위한 체크리스트:

1. 상단 네비게이션이 KakaoPay 기술 블로그의 스타일과 유사한지 확인
2. 브레드크럼이 완전히 제거되었는지 확인
3. 블로그 포스트 페이지의 "블로그 목록" 링크가 적절하게 표시되는지 확인
4. 모바일에서 네비게이션이 적절하게 표시되고 작동하는지 확인

## 5. 구현 일정

1. **Header 컴포넌트 단순화**: 0.5일
2. **브레드크럼 컴포넌트 제거**: 0.5일
3. **블로그 포스트 페이지 내비게이션 단순화**: 0.5일
4. **Footer 간소화 및 모바일 네비게이션 최적화**: 0.5일
5. **테스트 및 디자인 조정**: 1일

**총 예상 소요 시간**: 3일

## 6. 마이그레이션 체크리스트

- [ ] Header 컴포넌트에서 불필요한 메뉴 항목 제거
- [ ] "블로그 목록" 링크만 남기도록 네비게이션 바 수정
- [ ] 브레드크럼 컴포넌트 파일 및 관련 코드 제거
- [ ] 블로그 포스트 페이지에 간단한 "블로그 목록" 링크 추가
- [ ] Footer에서 불필요한 링크 제거
- [ ] 모바일 네비게이션 최적화
- [ ] Playwright 테스트 작성 및 실행
- [ ] 모바일 환경 테스트
- [ ] 접근성 검증

## 7. 고려사항 및 리스크

### 7.1 사용자 경험 관련 고려사항

- **기존 사용자의 혼란**: 네비게이션 변경으로 인해 기존 사용자가 혼란을 겪을 수 있음
- **사이트 내 이동 제한**: 내비게이션 링크 감소로 사이트 내 이동 경로가 제한될 수 있음

### 7.2 리스크 완화 전략

- **명확한 UI**: 남은 링크의 가시성을 높여 사용자가 쉽게 찾을 수 있도록 함
- **검색 기능 강화**: 네비게이션 링크 감소를 보완하기 위해 검색 기능의 접근성과 효율성 향상
- **UX 테스트**: 네비게이션 변경 후 실제 사용자 피드백을 수집하여 필요한 경우 추가 조정

## 8. 결론

이 마이그레이션 계획을 통해 블로그의 네비게이션 시스템을 KakaoPay 기술 블로그와 유사하게 단순화할 수 있습니다. 상단 네비게이션을 "블로그 목록"만 남기고 브레드크럼을 제거함으로써 사용자 인터페이스를 간소화하고 일관된 디자인을 적용할 수 있습니다. 이러한 변경은 사용자 경험을 개선하고 블로그의 미니멀한 디자인 철학을 강화할 것입니다.
