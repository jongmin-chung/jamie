# Tasks: Korean Tech Blog Site

**Input**: Design documents from `/Users/jaime/jongmin-chung/jamie/specs/001-https-tech-kakaopay/`
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → SUCCESS: Next.js, shadcn/ui, TypeScript stack identified
2. Load optional design documents:
   → data-model.md: BlogPost, Category, Tag entities
   → contracts/: Static API endpoints for posts, search, categories
   → research.md: Content processing, search implementation decisions  
3. Generate tasks by category:
   → Setup: Next.js project, shadcn/ui, TypeScript config
   → Tests: Component tests, E2E tests, contract validation
   → Core: Content processing, search, UI components
   → Integration: Page routing, static generation
   → Polish: Sample content, performance, deployment
4. Apply task rules:
   → Different components = mark [P] for parallel
   → Page dependencies = sequential
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001-T040)
6. SUCCESS: 40 tasks ready for execution

📊 COMPLETION STATUS: 40/40 tasks completed (100%) ✅
🎯 ALL TASKS COMPLETED SUCCESSFULLY
✨ BONUS: KakaoPay-style UI redesign + 50 Korean blog posts completed
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup
- [x] T001 Create Next.js project structure with TypeScript and App Router at repository root
- [x] T002 Initialize package.json with Next.js 15+, React 19+, TypeScript dependencies
- [x] T003 [P] Configure shadcn/ui CLI and install base components (button, card, input)
- [x] T004 [P] Setup Tailwind CSS configuration with Korean font fallbacks (UPGRADED TO V4)
- [x] T005 [P] Configure ESLint and Prettier for TypeScript/React code quality
- [x] T006 [P] Setup Jest and React Testing Library for component testing
- [x] T007 [P] Configure Playwright for E2E testing with Korean text support

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Content Processing Tests
- [x] T008 [P] Contract test markdown parsing in tests/lib/markdown.test.ts
- [x] T009 [P] Contract test frontmatter parsing in tests/lib/frontmatter.test.ts  
- [x] T010 [P] Contract test content metadata generation in tests/lib/content.test.ts

### Search Functionality Tests
- [x] T011 [P] Contract test search index generation in tests/lib/search-index.test.ts
- [x] T012 [P] Contract test Korean search functionality in tests/lib/search.test.ts

### UI Component Tests  
- [x] T013 [P] Component test BlogCard rendering in tests/components/BlogCard.test.tsx
- [x] T014 [P] Component test SearchBox functionality in tests/components/SearchBox.test.tsx
- [x] T015 [P] Component test Layout structure in tests/components/Layout.test.tsx

### Page Integration Tests
- [x] T016 Integration test homepage rendering posts in tests/pages/homepage.test.tsx
- [x] T017 Integration test blog listing page in tests/pages/blog-listing.test.tsx  
- [x] T018 Integration test individual blog post page in tests/pages/blog-post.test.tsx

### E2E User Journey Tests
- [x] T019 [P] E2E test homepage visit and navigation in tests/e2e/homepage.spec.ts
- [x] T020 [P] E2E test blog post reading flow in tests/e2e/blog-reading.spec.ts
- [x] T021 [P] E2E test Korean search functionality in tests/e2e/search.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### TypeScript Type Definitions
- [x] T022 [P] BlogPost interface and types in src/types/blog.ts
- [x] T023 [P] Category and Tag interfaces in src/types/content.ts
- [x] T024 [P] Search index types in src/types/search.ts

### Content Processing Library
- [x] T025 [P] Markdown parser with remark in src/lib/markdown.ts
- [x] T026 [P] Frontmatter processor with gray-matter in src/lib/frontmatter.ts
- [x] T027 Content metadata generator and validator in src/lib/content.ts

### Search Implementation
- [x] T028 [P] Search index builder with flexsearch in src/lib/search-index.ts
- [x] T029 Korean text search utilities in src/lib/search.ts

### UI Components (shadcn/ui based)
- [x] T030 [P] BlogCard component for post previews in src/components/BlogCard.tsx (REDESIGNED WITH KAKAOPAY STYLE)
- [x] T031 [P] SearchBox component with Korean input in src/components/SearchBox.tsx
- [x] T032 [P] Layout component with navigation in src/components/Layout.tsx (REDESIGNED WITH KAKAOPAY STYLE)
- [x] T033 [P] CategoryFilter component in src/components/CategoryFilter.tsx

## Phase 3.4: Page Implementation
- [x] T034 Homepage with recent posts at src/app/page.tsx (REDESIGNED WITH KAKAOPAY STYLE)
- [x] T035 Blog listing page with pagination at src/app/blog/page.tsx
- [x] T036 Individual blog post page at src/app/blog/[slug]/page.tsx
- [x] T037 404 error page for missing posts at src/app/not-found.tsx

## Phase 3.5: Static Generation & Content
- [x] T038 Static props generation for all blog pages in src/lib/static-generation.ts
- [x] T039 [P] Create 50 Korean sample blog posts in content/posts/ directory (50/50 COMPLETED)
- [x] T040 [P] Generate search index and metadata JSON files in build process

## Dependencies
- Setup (T001-T007) before everything
- Tests (T008-T021) before implementation (T022-T040)  
- T022-T024 (types) before T025-T033 (implementation)
- T025-T029 (core libs) before T030-T033 (components)
- T030-T033 (components) before T034-T037 (pages)
- T037 before T038-T040 (static generation)

## Parallel Execution Examples

### Setup Phase (Run T003-T007 together):
```bash
# Terminal 1-5 simultaneously:
pnpx shadcn-ui@latest init && pnpx shadcn-ui@latest add button card input
# Configure Tailwind with Korean fonts
# Setup ESLint/Prettier configs  
# Configure Jest + React Testing Library
# Setup Playwright with Korean locale
```

### Test Phase (Run T008-T015 together):
```bash
# All component and library tests can be written in parallel:
Task: "Contract test markdown parsing in tests/lib/markdown.test.ts"
Task: "Contract test frontmatter parsing in tests/lib/frontmatter.test.ts"
Task: "Component test BlogCard rendering in tests/components/BlogCard.test.tsx"
Task: "Component test SearchBox functionality in tests/components/SearchBox.test.tsx"
Task: "Component test Layout structure in tests/components/Layout.test.tsx"
```

### Core Implementation (Run T022-T024, then T025-T026, T030-T033 together):
```bash
# Types first (parallel):
Task: "BlogPost interface and types in src/types/blog.ts"
Task: "Category and Tag interfaces in src/types/content.ts"  
Task: "Search index types in src/types/search.ts"

# Then core libraries (parallel):
Task: "Markdown parser with remark in src/lib/markdown.ts"
Task: "Frontmatter processor with gray-matter in src/lib/frontmatter.ts"
Task: "Search index builder with flexsearch in src/lib/search-index.ts"

# Then UI components (parallel):
Task: "BlogCard component for post previews in src/components/BlogCard.tsx"
Task: "SearchBox component with Korean input in src/components/SearchBox.tsx"
Task: "Layout component with navigation in src/components/Layout.tsx"
```

## Contract Validation Tasks

### Static API Endpoints (from contracts/blog-api.md)
- T010 validates content metadata matches contract schema
- T012 validates search results match expected format
- T038 validates generated JSON files match API contracts

### Page Routes (from contracts/blog-api.md)  
- T034 implements homepage route per contract
- T035 implements /blog listing with query params
- T036 implements /blog/[slug] individual posts
- T037 handles 404 cases per error contract

## Success Criteria Validation

### From quickstart.md User Scenarios
- T019: Homepage displays Korean posts with metadata ✓
- T020: Article pages render markdown content ✓  
- T021: Korean search returns relevant results ✓
- T021: Mobile responsive design works ✓

### Performance Benchmarks
- T038: Page load times <2s for homepage
- T029: Search response <500ms
- T040: Search index <500KB

### Content Requirements
- T039: 50 Korean articles covering tech topics
- T039: Proper frontmatter for all posts
- T039: Categories distributed across predefined types

## Notes
- [P] tasks modify different files and have no dependencies
- All tests must fail before implementing corresponding functionality
- Commit after each completed task for atomic changes
- Use shadcn/ui components consistently throughout
- Maintain Korean language support in all text handling
- Follow Next.js 15 App Router patterns
- Ensure mobile-first responsive design

## Validation Checklist
*GATE: All items must be checked before tasks are complete*

- [x] All contracts have corresponding validation tests
- [x] All entities (BlogPost, Category, Tag) have model tasks  
- [x] All tests come before implementation tasks
- [x] Parallel tasks truly modify different files
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD order enforced: failing tests → implementation
- [x] Korean language requirements covered
- [x] Performance benchmarks included
