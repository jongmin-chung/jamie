# Research: Korean Tech Blog Site

**Date**: 2025-09-11  
**Branch**: 001-https-tech-kakaopay  

## Research Questions & Findings

### 1. Markdown Parser for Next.js
**Decision**: Use `next-mdx-remote` or `gray-matter` + `remark`  
**Rationale**: 
- next-mdx-remote provides server-side rendering of MDX content with React components
- gray-matter handles frontmatter parsing for metadata (title, date, category)
- remark ecosystem provides syntax highlighting and plugin ecosystem
**Alternatives considered**: 
- react-markdown (limited customization)
- MDX directly (overkill for simple blog)

### 2. Client-side Search Implementation
**Decision**: Use `flexsearch` or `fuse.js` for client-side search  
**Rationale**:
- flexsearch: Fast, memory efficient, supports Korean/CJK characters
- fuse.js: Fuzzy search capabilities, good for typo tolerance
- Both support static index generation at build time
**Alternatives considered**:
- Algolia (requires external service, against FE-only requirement)
- lunr.js (limited Korean support)

### 3. Static Site Generation Strategy
**Decision**: Next.js `getStaticProps` + `getStaticPaths` for SSG  
**Rationale**:
- Pre-renders all pages at build time for performance
- SEO-friendly URLs for individual articles
- Automatic route generation from markdown files
**Alternatives considered**:
- Client-side rendering (poor SEO)
- Server-side rendering (requires backend)

### 4. Korean Font and Typography
**Decision**: Use system fonts with Korean fallbacks + web fonts if needed  
**Rationale**:
- System fonts provide best performance
- Korean-specific typography rules (line height, letter spacing)
- Web fonts as enhancement, not requirement
**Alternatives considered**:
- Google Fonts Korean subset (adds load time)
- Local font files (increases bundle size)

### 5. File Structure for Markdown Content
**Decision**: `/content/posts/{slug}.md` with frontmatter metadata  
**Rationale**:
- Clear separation of content from code
- Frontmatter contains: title, date, category, description, tags
- URL structure: `/blog/{slug}` for SEO
**Alternatives considered**:
- `/content/{category}/{slug}.md` (harder to manage)
- Database storage (violates FE-only requirement)

### 6. Testing Strategy
**Decision**: Jest + React Testing Library for components, Playwright for E2E  
**Rationale**:
- Component tests for UI logic and rendering
- E2E tests for user flows (search, navigation)
- Playwright supports Korean text testing
**Alternatives considered**:
- Cypress (heavier setup)
- Vitest (newer, less mature ecosystem)

### 7. Responsive Design Approach
**Decision**: Tailwind CSS mobile-first responsive design  
**Rationale**:
- Mobile-first matches modern usage patterns
- Tailwind provides consistent spacing/typography
- shadcn/ui components already responsive
**Alternatives considered**:
- CSS modules (more verbose)
- Styled-components (runtime overhead)

### 8. Content Management for 50 Sample Articles
**Decision**: Generate using GPT/LLM with Korean tech topics, then manual review  
**Rationale**:
- Consistent quality and format
- Diverse topics covering modern tech stack
- Realistic content length and complexity
**Alternatives considered**:
- Lorem ipsum (not realistic)
- Copy from existing blogs (copyright issues)

## Technical Dependencies Finalized

### Core Framework
- Next.js 15+ with App Router
- React 19+
- TypeScript for type safety

### UI & Styling
- shadcn/ui component library
- Tailwind CSS for styling
- Lucide React for icons

### Content Processing
- gray-matter for frontmatter parsing
- remark + remark-html for markdown processing
- date-fns for date formatting (Korean locale support)

### Search
- flexsearch for client-side search indexing
- Korean text normalization utilities

### Development & Testing
- Jest + React Testing Library
- Playwright for E2E testing
- ESLint + Prettier for code quality

## Architecture Decisions

### URL Structure
- Homepage: `/`
- Article listing: `/blog`
- Individual articles: `/blog/{slug}`
- Search results: `/blog?search={query}`

### Performance Optimizations
- Static generation for all pages
- Search index pre-built at build time
- Image optimization with Next.js Image component
- Font optimization with next/font

### SEO Considerations
- Meta tags generated from frontmatter
- Open Graph images for social sharing
- Structured data for blog articles
- XML sitemap generation

## Next Steps
All research questions resolved. Ready for Phase 1: Design & Contracts.
