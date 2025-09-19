# Tasks: KakaoPay Theme-Based UI Implementation

**Input**: Design documents from `/specs/002-kakaopay-theme-data/`
**Prerequisites**: spec.md (available), kakaopay_theme_data.json (available)

## Execution Flow (main)
```
1. Load spec.md from feature directory
   → Extract UI requirements based on KakaoPay theme data
2. Load kakaopay_theme_data.json
   → Extract colors, typography, layout, and component styling
3. Generate tasks by category:
   → Setup: theme configuration, Tailwind customization
   → Tests: UI component tests, visual regression tests
   → Core: component styling, layout implementation
   → Integration: theme system integration
   → Polish: responsive design, accessibility, performance
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Focus on Tailwind CSS customization only (preserve shadcn/ui components)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup
- [x] T001 Create KakaoPay theme configuration file src/lib/theme/kakaopay-theme.ts
- [x] T002 [P] Update tailwind.config.js with KakaoPay colors and typography from theme data
- [x] T003 [P] Create theme utility functions in src/lib/theme/utils.ts for consistent styling

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Visual test for header component styling in tests/visual/header.test.tsx
- [x] T005 [P] Visual test for hero section styling in tests/visual/hero.test.tsx
- [x] T006 [P] Visual test for blog card styling in tests/visual/blog-card.test.tsx
- [x] T007 [P] Integration test for theme application in tests/integration/theme.test.tsx
- [x] T008 [P] Typography hierarchy test in tests/visual/typography.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T009 [P] Update Layout component in src/components/Layout.tsx with KakaoPay header styling
- [x] T010 [P] Create Hero section component in src/components/Hero.tsx with dark background and KakaoPay styling
- [x] T011 [P] Update BlogCard component in src/components/BlogCard.tsx with transparent styling per theme data
- [x] T012 Update homepage in src/app/page.tsx to implement KakaoPay theme structure
- [x] T013 [P] Create Footer component in src/components/Footer.tsx with KakaoPay links and styling
- [x] T014 [P] Update SearchBox component in src/components/SearchBox.tsx with KakaoPay button styling
- [x] T015 Apply typography hierarchy to all text elements across components
- [x] T016 [P] Update BlogListingClient in src/components/BlogListingClient.tsx with grid layout per theme data

## Phase 3.4: Integration
- [x] T017 Integrate theme configuration across all existing components
- [x] T018 [P] Update global CSS in src/app/globals.css with KakaoPay base styles
- [x] T019 [P] Implement responsive spacing system using theme grid specifications
- [x] T020 Add Noto Sans KR font integration in src/app/layout.tsx

## Phase 3.5: Polish
- [x] T021 [P] Responsive design validation for mobile/desktop breakpoints
- [x] T022 [P] Accessibility audit for color contrast and typography readability
- [x] T023 [P] Performance optimization for font loading and theme styles
- [x] T024 [P] Cross-browser compatibility testing for theme styling
- [x] T025 Manual visual comparison with KakaoPay tech blog design

## Dependencies
- Tests (T004-T008) before implementation (T009-T016)
- T001 (theme config) blocks T009-T016 (component updates)
- T002 (Tailwind config) blocks T018 (global CSS)
- T020 (font integration) blocks T015 (typography)
- Implementation before polish (T021-T025)

## Parallel Example
```
# Launch T004-T008 together:
Task: "Visual test for header component styling in tests/visual/header.test.tsx"
Task: "Visual test for hero section styling in tests/visual/hero.test.tsx"
Task: "Visual test for blog card styling in tests/visual/blog-card.test.tsx"
Task: "Integration test for theme application in tests/integration/theme.test.tsx"
Task: "Typography hierarchy test in tests/visual/typography.test.tsx"
```

## Notes
- [P] tasks = different files, no dependencies
- Only use Tailwind CSS for customization (preserve shadcn/ui components)
- Apply theme data systematically without modifying core shadcn components
- Focus on visual consistency with KakaoPay tech blog
- Verify tests fail before implementing
- Commit after each task

## KakaoPay Theme Key Requirements
*From kakaopay_theme_data.json and spec.md*

1. **Colors**: Primary yellow #FFEB00, dark text #060B11, white #FFFFFF
2. **Typography**: Noto Sans KR, H1 52px/700, H2 32px/600, body 18px/400
3. **Layout**: 1200px max width, 24px base spacing, 84px header height
4. **Components**: Transparent header, dark hero (#060B11), transparent cards
5. **Content Structure**: "최근 올라온 글" (horizontal), "전체 게시글" (grid)
6. **Footer**: KakaoPay corp. copyright with service links

## Validation Checklist
*GATE: Checked before marking tasks complete*

- [ ] All theme data properties implemented
- [ ] Only Tailwind CSS modifications (no shadcn changes)
- [ ] Typography hierarchy matches specifications
- [ ] Color palette applied consistently
- [ ] Layout spacing follows 24px base system
- [ ] Visual tests verify styling correctness
- [ ] Responsive design maintained