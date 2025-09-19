# jamie Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-11

## Active Technologies

- **Korean Tech Blog Site** (001-https-tech-kakaopay):
  - Next.js 15+ with App Router
  - React 19+ with TypeScript
  - shadcn/ui + Tailwind CSS
  - Static markdown content processing
  - Client-side search with flexsearch
  - Playwright E2E testing
  - pnpm

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage
│   ├── blog/              # Blog routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/               # shadcn/ui components  
│   ├── BlogCard.tsx      # Post preview
│   ├── SearchBox.tsx     # Search functionality
│   └── Layout.tsx        # Site layout
├── lib/
│   ├── markdown.ts       # Content processing
│   ├── search.ts         # Search utilities
│   └── utils.ts          # General utilities
└── types/                # TypeScript definitions

content/posts/            # Markdown blog posts
tests/                    # Jest + Playwright tests
```

## Commands

```bash
pnpm run dev              # Start development server
pnpm run build            # Generate static site  
pnpm run test             # Run all tests
pnpm run lint             # ESLint + Prettier
pnpm run type-check       # TypeScript validation
pnpx playwright test      # E2E testing
```

## Code Style

- TypeScript for type safety
- Tailwind CSS for styling (mobile-first)
- shadcn/ui component patterns
- Korean language support in content
- Static site generation (SSG)
- Client-side search implementation

## Testing Strategy

- Component tests: Jest + React Testing Library
- E2E tests: Playwright with Korean text support
- Test Korean search functionality
- Mobile responsive design testing
- Performance benchmarks (page load < 2s)

## Tailwind Style

- 모든 스타일은 TSX 내에서 Tailwind 클래스로 직접 적용
- shadcn/ui 컴포넌트 활용, 필요시 UI 컴포넌트에 Tailwind 클래스를 추가하여 커스터마이징
- 별도 CSS 파일 분리 최소화

## Recent Changes

- 001-https-tech-kakaopay: Added Korean blog site with Next.js + shadcn/ui + client-side search

<!-- MANUAL ADDITIONS START -->
<!-- Add any manual customizations here - they will be preserved during updates -->
<!-- MANUAL ADDITIONS END -->
