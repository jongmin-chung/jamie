# KakaoPay 기술 블로그 목차(Table of Contents) 구현 요구사항

이 문서는 KakaoPay 기술 블로그(<https://tech.kakaopay.com/)의> 목차(Table of Contents) 기능을 구현하기 위한 상세 요구사항을 정의합니다. 목차 기능은 기존 마이그레이션 계획에서 충분히 강조되지 않았으나, 사용자 경험 향상을 위해 중요한 요소입니다.

## 1. 목차(ToC) 기능 개요

KakaoPay 기술 블로그의 목차 기능은 다음과 같은 특징을 갖고 있습니다:

- **위치**: 블로그 포스트 우측에 고정된 사이드바 형태로 표시
- **반응형 동작**: 넓은 화면(데스크톱)에서만 표시되고, 모바일/태블릿에서는 플로팅 버튼을 통해 접근
- **디자인**: 심플하고 미니멀한 디자인으로 블로그 본문을 방해하지 않음
- **동작**: 스크롤에 따라 현재 섹션이 하이라이트되고, 클릭 시 해당 섹션으로 부드럽게 스크롤

## 2. 상세 요구사항

### 2.1 데스크톱 버전 목차 (넓은 화면)

- **표시 조건**: 화면 너비가 `xl` 이상일 때만 표시 (Tailwind 기준 1280px 이상)
- **위치**: 본문 우측에 고정된 사이드바로 표시
- **스크롤 동작**: 상단 헤더 아래에서부터 시작하여 스크롤 시 고정 위치 유지
- **스타일**:
  - 제목: 굵은 글씨, 하단 경계선으로 구분
  - 목차 항목: 들여쓰기로 계층 구조 표현
  - 활성 항목: 좌측 보더와 배경색으로 하이라이트
  - 폰트 크기: 일반 텍스트보다 작게 (14px)
  - 색상: 비활성 항목은 밝은 회색, 활성 항목은 프라이머리 컬러(카카오페이 옐로우)

### 2.2 모바일 버전 목차

- **표시 조건**: 화면 너비가 `xl` 미만일 때 활성화 (Tailwind 기준 1280px 미만)
- **접근 방법**: 화면 우측 하단에 고정된 플로팅 버튼
- **버튼 디자인**: 원형 버튼, 아이콘은 'List' 사용
- **모달 디자인**:
  - 화면 오른쪽에서 슬라이드 인 효과
  - 배경은 반투명 오버레이로 블러 처리
  - 닫기 버튼 제공
  - 목차 항목 클릭 시 해당 섹션으로 이동 후 자동으로 모달 닫힘

### 2.3 기술적 요구사항

- **헤딩 추출**: 본문에서 `h1` ~ `h6` 태그를 자동으로 추출하여 목차 생성
- **ID 자동 생성**: 헤딩에 ID가 없는 경우 제목 텍스트를 기반으로 자동 생성
- **스크롤 스파이**: 현재 보고 있는 섹션을 자동으로 감지하여 해당 목차 항목 하이라이트
- **스크롤 이벤트**: 목차 항목 클릭 시 부드러운 스크롤 애니메이션으로 이동
- **React 훅스**: `useEffect`와 `useState`를 활용한 상태 관리
- **컴포넌트 분리**: 데스크톱과 모바일 버전은 같은 기본 컴포넌트를 공유하되 표시 방식만 다르게 구현

## 3. 컴포넌트 구조

### 3.1 기본 컴포넌트 구조

```
TableOfContents/
├── TableOfContents.tsx       # 기본 목차 컴포넌트 (데스크톱)
├── MobileTableOfContents.tsx # 모바일용 래퍼 컴포넌트
└── index.ts                  # 내보내기
```

### 3.2 컴포넌트 간 관계

- `TableOfContents`: 목차 항목 추출, 스크롤 스파이, 클릭 이벤트 처리 등 핵심 기능 구현
- `MobileTableOfContents`: `TableOfContents`를 래핑하여 모바일에서 사용하기 위한 UI 추가 (플로팅 버튼, 모달 등)

## 4. 구현 세부 사항

### 4.1 목차 항목 추출 로직

```tsx
// TableOfContents.tsx의 일부
useEffect(() => {
  if (typeof window === 'undefined') return

  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')

  const items: TOCItem[] = []
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1))
    const title = heading.textContent || ''

    // ID 자동 생성 로직
    let id = heading.id
    if (!id) {
      id = title
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
```

### 4.2 스크롤 스파이 로직

```tsx
// TableOfContents.tsx의 일부
useEffect(() => {
  if (typeof window === 'undefined' || tocItems.length === 0) return

  const handleScroll = () => {
    const headings = tocItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean)

    // 특별한 케이스 처리: 페이지 맨 위
    if (window.scrollY < 200 && headings.length > 0) {
      setActiveId(tocItems[0].id)
      return
    }

    // 스크롤 위치에 따라 현재 섹션 파악
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
  handleScroll() // 초기 위치 확인

  return () => window.removeEventListener('scroll', handleScroll)
}, [tocItems])
```

### 4.3 스타일링 (Tailwind CSS)

```tsx
// TableOfContents.tsx의 일부
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
```

### 4.4 모바일 목차 컴포넌트

```tsx
// MobileTableOfContents.tsx의 일부
return (
  <>
    {/* 플로팅 버튼 - 모바일/태블릿에서만 표시 */}
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

    {/* 모바일 목차 오버레이 */}
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
              onClick={() => setIsOpen(false)} // 항목 클릭 시 모달 닫기
              className="block" // hidden 클래스 오버라이드
            />
          </div>
        </div>
      </div>
    )}
  </>
)
```

### 4.5 BlogPostLayout에 통합

```tsx
// BlogPostLayout.tsx의 일부
<div className="flex flex-col lg:flex-row gap-12">
  {/* 메인 콘텐츠 */}
  <article className="lg:flex-1">
    {/* 포스트 콘텐츠 */}
    <div className="prose prose-lg max-w-none">{content}</div>
    
    {/* 태그 */}
    <div className="flex flex-wrap gap-2 mt-12 mb-8">
      <span className="font-semibold text-muted-foreground">태그:</span>
      {tags.map((tag) => (
        <PostTag key={tag} tag={tag} />
      ))}
    </div>
  </article>

  {/* 목차 - 우측 사이드바 (넓은 화면에서만 표시) */}
  <aside className="lg:w-72 order-first lg:order-last">
    <div className="lg:sticky lg:top-24">
      <TableOfContents content={contentHtml} />
    </div>
  </aside>
</div>

{/* 모바일 목차 - 작은 화면에서만 표시 */}
<MobileTableOfContents content={contentHtml} />
```

## 5. 테스트 방법

### 5.1 Playwright 테스트

```tsx
// tests/ui/toc.spec.ts
import { test, expect } from '@playwright/test';

test('목차가 넓은 화면에서 표시되고 모바일에서는 플로팅 버튼으로 나타나는지 테스트', async ({ page }) => {
  // 블로그 포스트 페이지로 이동
  await page.goto('/blog/some-post-slug');
  
  // 1. 넓은 화면에서 테스트
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // 데스크톱 목차가 표시되는지 확인
  const desktopToc = page.locator('aside nav').filter({ hasText: '목차' });
  await expect(desktopToc).toBeVisible();
  
  // 모바일 목차 버튼이 숨겨졌는지 확인
  const mobileButton = page.locator('button').filter({ has: page.locator('svg[data-icon="list"]') });
  await expect(mobileButton).not.toBeVisible();
  
  // 2. 모바일 화면에서 테스트
  await page.setViewportSize({ width: 375, height: 667 });
  
  // 데스크톱 목차가 숨겨졌는지 확인
  await expect(desktopToc).not.toBeVisible();
  
  // 모바일 목차 버튼이 표시되는지 확인
  await expect(mobileButton).toBeVisible();
  
  // 모바일 목차 버튼 클릭
  await mobileButton.click();
  
  // 모달이 열리는지 확인
  const modal = page.locator('div').filter({ has: page.locator('h3').filter({ hasText: '목차' }) });
  await expect(modal).toBeVisible();
  
  // 목차 항목 클릭 테스트
  const firstTocItem = modal.locator('button').first();
  await firstTocItem.click();
  
  // 모달이 닫혔는지 확인
  await expect(modal).not.toBeVisible();
});
```

### 5.2 시각적 검증

Playwright MCP를 활용하여 기존 KakaoPay 기술 블로그와 구현된 목차 컴포넌트를 시각적으로 비교합니다:

1. 데스크톱 버전에서 목차 위치 및 스타일 확인
2. 모바일 버전에서 플로팅 버튼 및 모달 확인
3. 스크롤에 따른 목차 항목 하이라이트 동작 확인
4. 목차 클릭 시 부드러운 스크롤 동작 확인

## 6. 구현 계획 및 일정

### 6.1 구현 단계

1. **기본 TableOfContents 컴포넌트 개발** (1일)
   - 헤딩 추출 로직 구현
   - 스크롤 스파이 기능 구현
   - 기본 스타일링 적용

2. **MobileTableOfContents 컴포넌트 개발** (0.5일)
   - 플로팅 버튼 구현
   - 모달 UI 구현
   - 반응형 동작 테스트

3. **BlogPostLayout에 통합** (0.5일)
   - 기존 레이아웃에 목차 컴포넌트 추가
   - 반응형 레이아웃 조정

4. **테스트 및 최적화** (1일)
   - Playwright 테스트 작성 및 실행
   - 성능 최적화
   - 시각적 일관성 확인

### 6.2 일정 계획

- **총 예상 소요 시간**: 3일
- **권장 작업 기간**: Phase 7(반응형/모바일 최적화) 단계에서 진행

## 7. 접근성 고려사항

목차 컴포넌트 구현 시 다음과 같은 접근성 요소를 고려해야 합니다:

1. **키보드 네비게이션**: 목차 항목은 키보드로 접근 및 조작 가능해야 함
2. **스크린 리더 지원**: 적절한 ARIA 속성 사용으로 스크린 리더 사용자 지원
3. **충분한 색상 대비**: 목차 항목 텍스트와 배경색의 충분한 대비 보장
4. **포커스 표시**: 키보드 포커스가 어디에 있는지 시각적으로 명확히 표시

## 8. 결론 및 권장사항

KakaoPay 기술 블로그의 목차 기능은 사용자 경험을 크게 향상시키는 중요한 요소입니다. 이 문서에서 정의한 요구사항과 구현 방법을 통해 원본 블로그와 동일한 기능성과 디자인을 구현할 수 있습니다.

추가 권장사항:

1. **성능 최적화**: 스크롤 이벤트는 성능에 영향을 미칠 수 있으므로 `throttle` 또는 `requestAnimationFrame`을 사용하여 최적화
2. **모바일 사용성**: 모바일에서는 플로팅 버튼이 콘텐츠를 가리지 않도록 위치 조정
3. **사용자 설정**: 추후 목차 표시/숨김을 사용자가 설정할 수 있는 옵션 고려
