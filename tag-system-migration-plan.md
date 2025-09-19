# 태그 시스템 마이그레이션 계획

이 문서는 기존 블로그의 태그 시스템을 shadcn/ui Badge 컴포넌트로 마이그레이션하기 위한 상세 계획을 제공합니다. Phase 5의 요구사항에 따라 태그는 본문 하단에만 노출하도록 변경됩니다.

## 1. 현황 분석

### 1.1 현재 태그 시스템 상태

현재 블로그의 태그 시스템은 다음과 같은 특징을 가지고 있습니다:

- 태그가 여러 위치에 중복 표시됨 (본문 상단, 본문 하단, 사이드바 등)
- 일관된 디자인 시스템 없이 각 위치마다 다른 스타일링 사용
- 태그 클릭 시 태그별 글 목록 페이지로 이동하는 기능 제공

### 1.2 KakaoPay 기술 블로그 태그 스타일

KakaoPay 기술 블로그의 태그는 다음과 같은 특징을 가지고 있습니다:

- 본문 하단에만 간결하게 표시
- 미니멀한 디자인의 배지 형태
- '#' 기호와 함께 표시
- 클릭 시 태그별 글 목록으로 이동

## 2. 마이그레이션 목표

### 2.1 주요 목표

- shadcn/ui Badge 컴포넌트를 사용하여 일관된 디자인 시스템 적용
- 태그를 본문 하단에만 표시하여 인터페이스 단순화
- 태그 클릭 기능 유지 (태그별 글 목록 페이지로 이동)
- KakaoPay 기술 블로그와 유사한 미니멀한 디자인 적용

### 2.2 비기능적 요구사항

- 모바일 환경에서도 최적화된 표시
- 접근성 고려 (시각적 대비, 키보드 접근성 등)
- 향후 확장 가능한 유연한 구조

## 3. 구현 계획

### 3.1 shadcn/ui Badge 컴포넌트 설정

1. shadcn/ui Badge 컴포넌트 설치:

```bash
npx shadcn-ui@latest add badge
```

2. 생성된 컴포넌트 확인:

```
src/components/ui/badge.tsx
```

### 3.2 PostTag 컴포넌트 구현

태그 표시를 위한 전용 컴포넌트를 구현하여 재사용성을 높입니다:

```tsx
// src/components/PostTag.tsx
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PostTagProps {
  tag: string;
  className?: string;
}

export function PostTag({ tag, className }: PostTagProps) {
  return (
    <Link href={`/tag/${tag}`} className="no-underline">
      <Badge 
        variant="outline" 
        className={cn(
          "bg-transparent hover:bg-primary/10 transition-colors",
          "border-muted-foreground/30 text-muted-foreground hover:text-foreground",
          "font-normal",
          className
        )}
      >
        #{tag}
      </Badge>
    </Link>
  );
}
```

### 3.3 PostTags 컴포넌트 구현

포스트 하단에 표시할 태그 목록 컴포넌트를 구현합니다:

```tsx
// src/components/PostTags.tsx
import { PostTag } from "@/components/PostTag";
import { cn } from "@/lib/utils";

interface PostTagsProps {
  tags: string[];
  className?: string;
}

export function PostTags({ tags, className }: PostTagsProps) {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className={cn("flex flex-wrap gap-2 mt-8 mb-6", className)}>
      <span className="text-muted-foreground font-medium mr-1">태그:</span>
      {tags.map((tag) => (
        <PostTag key={tag} tag={tag} />
      ))}
    </div>
  );
}
```

### 3.4 기존 컴포넌트 수정

#### 3.4.1 BlogPostLayout 수정

블로그 포스트 레이아웃에서 태그 표시 영역을 수정합니다:

```tsx
// src/components/BlogPostLayout.tsx (수정 부분)
import { PostTags } from "@/components/PostTags";

// 기존 태그 표시 부분을 모두 제거하고 본문 하단에만 PostTags 컴포넌트 추가
<article className="lg:flex-1">
  {/* 포스트 콘텐츠 */}
  <div className="prose prose-lg max-w-none">{content}</div>
  
  {/* 태그 (본문 하단에만 표시) */}
  <PostTags tags={tags} />
  
  {/* 저자 정보 등 기타 콘텐츠 */}
</article>
```

#### 3.4.2 기타 관련 컴포넌트 수정

본문 상단이나 사이드바 등 다른 위치에 있는 태그 표시 영역을 모두 제거합니다:

- Header 컴포넌트에서 태그 관련 UI 제거
- Sidebar 컴포넌트에서 태그 관련 UI 제거
- 기타 태그가 표시되는 모든 위치에서 태그 UI 제거

### 3.5 태그 페이지 수정

태그별 글 목록 페이지에서도 일관된 디자인을 적용합니다:

```tsx
// src/app/tag/[tag]/page.tsx (수정 부분)
import { PostTag } from "@/components/PostTag";

// 태그 페이지 헤더 부분
<div className="mb-8">
  <h1 className="text-3xl font-bold mb-2">
    <PostTag tag={tag} className="text-xl mr-2" /> 관련 글
  </h1>
  <p className="text-muted-foreground">
    {posts.length}개의 글이 있습니다.
  </p>
</div>
```

## 4. 디자인 상세

### 4.1 Badge 스타일링

shadcn/ui Badge 컴포넌트의 스타일을 KakaoPay 기술 블로그와 유사하게 커스터마이징합니다:

```tsx
// Badge 기본 스타일 속성
"bg-transparent" // 투명 배경
"border-muted-foreground/30" // 옅은 테두리
"text-muted-foreground" // 옅은 텍스트 색상
"hover:bg-primary/10" // 호버 시 배경색 변화
"hover:text-foreground" // 호버 시 텍스트 색상 변화
"font-normal" // 일반 폰트 두께
"px-2.5 py-0.5" // 적절한 패딩
"text-sm" // 작은 폰트 크기
```

### 4.2 레이아웃 및 간격

태그 목록의 레이아웃 및 간격을 설정합니다:

```tsx
// PostTags 컴포넌트 스타일 속성
"flex flex-wrap" // 태그 목록을 여러 줄로 표시
"gap-2" // 태그 간 간격
"mt-8 mb-6" // 위아래 여백
```

## 5. 테스트 계획

### 5.1 Playwright 테스트

태그 마이그레이션의 성공적인 구현을 확인하기 위한 테스트 케이스:

```tsx
// tests/ui/tag-system.spec.ts
import { test, expect } from '@playwright/test';

test('태그가 본문 하단에만 표시되는지 확인', async ({ page }) => {
  // 블로그 포스트 페이지로 이동
  await page.goto('/blog/some-post-slug');
  
  // 1. 본문 하단에 태그가 표시되는지 확인
  const postTagsSection = page.locator('.prose').locator('+ div').filter({ hasText: '태그:' });
  await expect(postTagsSection).toBeVisible();
  
  // 2. 태그가 Badge 스타일로 표시되는지 확인
  const tagBadges = postTagsSection.locator('a').filter({ hasText: /^#/ });
  await expect(tagBadges).toHaveCount.greaterThan(0);
  
  // 3. 본문 상단이나 사이드바에 태그가 표시되지 않는지 확인
  const headerSection = page.locator('header');
  await expect(headerSection.locator('a').filter({ hasText: /^#/ })).toHaveCount(0);
  
  const sidebarSection = page.locator('aside');
  await expect(sidebarSection.locator('a').filter({ hasText: /^#/ })).toHaveCount(0);
});

test('태그 클릭 시 태그 페이지로 이동하는지 확인', async ({ page }) => {
  // 블로그 포스트 페이지로 이동
  await page.goto('/blog/some-post-slug');
  
  // 첫 번째 태그 찾기
  const firstTag = page.locator('.prose + div a').first();
  const tagText = await firstTag.textContent();
  const tagName = tagText?.replace('#', '');
  
  // 태그 클릭
  await firstTag.click();
  
  // 올바른 태그 페이지로 이동했는지 확인
  await expect(page).toHaveURL(`/tag/${tagName}`);
  
  // 태그 페이지에 해당 태그가 표시되는지 확인
  const pageHeading = page.locator('h1');
  await expect(pageHeading).toContainText(tagName || '');
});
```

### 5.2 시각적 테스트

시각적인 일관성을 확인하기 위한 체크리스트:

1. 태그 배지가 KakaoPay 기술 블로그의 스타일과 유사한지 확인
2. 태그가 본문 하단에만 표시되는지 확인
3. 태그 호버 시 시각적 피드백이 적절한지 확인
4. 모바일에서 태그가 적절하게 표시되는지 확인

## 6. 구현 일정

1. **Badge 컴포넌트 설정 및 PostTag 컴포넌트 구현**: 0.5일
2. **기존 컴포넌트에서 태그 UI 수정**: 0.5일
3. **태그 페이지 수정**: 0.5일
4. **테스트 및 디자인 조정**: 0.5일

**총 예상 소요 시간**: 2일

## 7. 마이그레이션 체크리스트

- [ ] shadcn/ui Badge 컴포넌트 설치
- [ ] PostTag 컴포넌트 구현
- [ ] PostTags 컴포넌트 구현
- [ ] BlogPostLayout에서 태그 UI 수정 (본문 하단에만 표시)
- [ ] 기타 컴포넌트에서 태그 UI 제거
- [ ] 태그 페이지 수정
- [ ] 태그 디자인 KakaoPay 스타일로 조정
- [ ] Playwright 테스트 작성 및 실행
- [ ] 모바일 환경 테스트
- [ ] 접근성 검증

## 8. 결론

이 마이그레이션 계획을 통해 태그 시스템을 shadcn/ui Badge 컴포넌트로 일관되게 변경하고, KakaoPay 기술 블로그와 유사한 미니멀한 디자인을 적용할 수 있습니다. 태그를 본문 하단에만 표시함으로써 UI를 단순화하고 사용자 경험을 개선할 수 있습니다.
