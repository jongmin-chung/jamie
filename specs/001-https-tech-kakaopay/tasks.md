# Tasks: Korean Tech Blog Site

**Input**: Design documents from `/Users/jongminchung/Documents/jamie/specs/001-https-tech-kakaopay/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Tech stack: Next.js 15+, React 19+, TypeScript, shadcn/ui, Tailwind CSS
   → Structure: Single project (frontend-only static site)
2. Load design documents ✅:
   → data-model.md: BlogPost, Category, Tag, SearchIndex entities
   → contracts/: Static API endpoints and page routes
   → research.md: Framework decisions and Korean support
3. Generate tasks by category:
   → Setup: Next.js project, shadcn/ui, TypeScript config
   → Tests: Contract tests, integration tests for Korean content
   → Core: Components, content processing, search functionality
   → Integration: Static generation, search index
   → Polish: E2E tests, performance, sample content
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Task completeness validation ✅
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Using Next.js App Router structure with TypeScript

## Phase 3.1: Setup
- [x] T001 Create Next.js project structure with App Router and TypeScript
- [x] T002 Install and configure shadcn/ui components (button, card, input)
- [x] T003 [P] Configure ESLint, Prettier, and TypeScript strict mode
- [x] T004 [P] Setup Tailwind CSS with Korean font configuration
- [x] T005 [P] Install markdown processing dependencies (gray-matter, remark, remark-html)
- [x] T006 [P] Install search dependencies (flexsearch) and date utilities (date-fns)
- [x] T007 [P] Configure Jest and React Testing Library for component tests
- [x] T008 [P] Setup Playwright for E2E testing with Korean text support

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T009 [P] Contract test for static posts API in tests/contract/posts-api.test.ts
- [x] T010 [P] Contract test for search index API in tests/contract/search-api.test.ts
- [x] T011 [P] Contract test for categories API in tests/contract/categories-api.test.ts
- [x] T012 [P] Integration test for homepage rendering in tests/integration/homepage.test.tsx
- [x] T013 [P] Integration test for blog post page in tests/integration/blog-post.test.tsx
- [x] T014 [P] Integration test for search functionality in tests/integration/search.test.tsx
- [x] T015 [P] Integration test for Korean content processing in tests/integration/korean-content.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T016 [P] BlogPost TypeScript interface in src/types/blog.ts
- [x] T017 [P] Category and Tag interfaces in src/types/blog.ts
- [x] T018 [P] SearchIndex interface in src/types/search.ts
- [x] T019 [P] Markdown processing utilities in src/lib/markdown.ts
- [x] T020 [P] Search utilities and indexing in src/lib/search.ts
- [x] T021 [P] Date formatting utilities with Korean locale in src/lib/utils.ts
- [x] T022 [P] BlogCard component in src/components/BlogCard.tsx
- [x] T023 [P] SearchBox component in src/components/SearchBox.tsx
- [x] T024 [P] Layout component with navigation in src/components/Layout.tsx
- [x] T025 [P] TableOfContents component in src/components/TableOfContents.tsx
- [x] T026 [P] MobileTableOfContents component in src/components/MobileTableOfContents.tsx
- [x] T027 Homepage implementation in src/app/page.tsx
- [x] T028 Blog listing page in src/app/blog/page.tsx
- [x] T029 Individual blog post page in src/app/blog/[slug]/page.tsx
- [x] T030 Root layout with Korean font support in src/app/layout.tsx
- [x] T031 404 error page with Korean messages in src/app/not-found.tsx

## Phase 3.4: Integration
- [x] T032 Static site generation configuration for all blog posts
- [x] T033 Search index generation at build time
- [x] T034 SEO metadata generation from frontmatter
- [x] T035 Image optimization configuration with Next.js Image
- [x] T036 Sitemap generation for Korean URLs

## Phase 3.5: Content Creation
- [x] T037 [P] Create predefined categories with Korean names in content/categories.json
- [x] T038 [P] Create 10 frontend-focused Korean blog posts in content/posts/
- [x] T039 [P] Create 10 backend-focused Korean blog posts in content/posts/
- [x] T040 [P] Create 10 DevOps-focused Korean blog posts in content/posts/
- [x] T041 [P] Create 10 design-focused Korean blog posts in content/posts/
- [x] T042 [P] Create 10 career/trends Korean blog posts in content/posts/

## Phase 3.6: Polish & Testing
- [x] T043 [P] Unit tests for markdown processing in tests/unit/markdown.test.ts
- [x] T044 [P] Unit tests for search utilities in tests/unit/search.test.ts
- [x] T045 [P] Component unit tests for BlogCard in tests/unit/BlogCard.test.tsx
- [x] T046 [P] Component unit tests for SearchBox in tests/unit/SearchBox.test.tsx
- [x] T047 E2E test for complete user journey in tests/e2e/user-journey.spec.ts
- [x] T048 E2E test for mobile responsiveness in tests/e2e/mobile-responsive.spec.ts
- [x] T049 E2E test for Korean search functionality in tests/e2e/korean-search.spec.ts
- [x] T050 Performance optimization and Core Web Vitals validation
- [x] T051 Build process optimization and static export validation

## Dependencies
- Setup (T001-T008) before all other phases
- Tests (T009-T015) before implementation (T016-T031)
- Core types (T016-T018) before utilities and components
- Utilities (T019-T021) before components (T022-T026)
- Components before pages (T027-T031)
- Integration (T032-T036) requires completed implementation
- Content creation (T037-T042) can run parallel to integration
- Polish (T043-T051) requires all previous phases

## Parallel Example
```
# Launch T009-T015 together (contract and integration tests):
Task: "Contract test for static posts API in tests/contract/posts-api.test.ts"
Task: "Contract test for search index API in tests/contract/search-api.test.ts"
Task: "Contract test for categories API in tests/contract/categories-api.test.ts"
Task: "Integration test for homepage rendering in tests/integration/homepage.test.tsx"
Task: "Integration test for blog post page in tests/integration/blog-post.test.tsx"
Task: "Integration test for search functionality in tests/integration/search.test.tsx"
Task: "Integration test for Korean content processing in tests/integration/korean-content.test.ts"

# Launch T016-T018 together (TypeScript interfaces):
Task: "BlogPost TypeScript interface in src/types/blog.ts"
Task: "SearchIndex interface in src/types/search.ts"

# Launch T037-T042 together (content creation):
Task: "Create 10 frontend-focused Korean blog posts in content/posts/"
Task: "Create 10 backend-focused Korean blog posts in content/posts/"
Task: "Create 10 DevOps-focused Korean blog posts in content/posts/"
Task: "Create 10 design-focused Korean blog posts in content/posts/"
Task: "Create 10 career/trends Korean blog posts in content/posts/"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task completion
- Focus on Korean language support throughout
- Ensure mobile-first responsive design
- Maintain performance targets (<2s page load)

## Task Generation Rules Applied

1. **From Contracts**:
   - Static API endpoints → contract tests (T009-T011)
   - Page routes → integration tests (T012-T015)
   
2. **From Data Model**:
   - BlogPost, Category, Tag entities → TypeScript interfaces (T016-T018)
   - Content processing → utilities (T019-T021)
   
3. **From User Stories**:
   - Homepage visit → homepage test (T012)
   - Search functionality → search tests (T014, T049)
   - Mobile usage → responsive tests (T048)

4. **Ordering**:
   - Setup → Tests → Types → Utilities → Components → Pages → Integration → Content → Polish
   - TDD strictly enforced (tests before implementation)

## Validation Checklist ✅

- [x] All contracts have corresponding tests (T009-T015)
- [x] All entities have TypeScript interface tasks (T016-T018)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Korean content support addressed throughout
- [x] Performance and SEO requirements included
- [x] 50 blog posts creation distributed across categories