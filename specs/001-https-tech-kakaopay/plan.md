# Implementation Plan: Korean Tech Blog Site

**Branch**: `001-https-tech-kakaopay` | **Date**: 2025-09-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/jaime/jongmin-chung/jamie/specs/001-https-tech-kakaopay/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Korean tech blog site with homepage listing articles, detailed article pages, client-side search functionality, and ~50 Korean markdown sample articles. Uses Next.js with shadcn/ui and Tailwind CSS for professional design similar to KakaoPay tech blog.

## Technical Context
**Language/Version**: TypeScript with Next.js 14+ (React 18+)  
**Primary Dependencies**: Next.js, shadcn/ui, Tailwind CSS, markdown parser, client-side search library  
**Storage**: Static markdown files, no backend database required  
**Testing**: Jest with React Testing Library, Playwright for E2E testing  
**Target Platform**: Web browsers (desktop and mobile responsive)  
**Project Type**: web - Frontend-only static site generation  
**Performance Goals**: Fast page loads (<2s), smooth search (<500ms), responsive design  
**Constraints**: Client-side only (no backend), Korean language support, SEO-friendly URLs  
**Scale/Scope**: ~50 sample articles, search across all content, responsive design

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**: ✅ PASS
- Projects: 1 (Next.js frontend application)
- Using framework directly? Yes (Next.js, React, Tailwind)
- Single data model? Yes (BlogPost, Category, Tag entities)
- Avoiding patterns? Yes (direct file system access, no unnecessary abstractions)

**Architecture**: ✅ PASS  
- EVERY feature as library? N/A (Frontend-only static site)
- Libraries listed: Content processing, Search utilities, UI components
- CLI per library: N/A (Static site generation)
- Library docs: Component documentation in code

**Testing (NON-NEGOTIABLE)**: ✅ PASS
- RED-GREEN-Refactor cycle enforced? Yes (contract tests first)
- Git commits show tests before implementation? Yes
- Order: Contract→Integration→E2E→Unit strictly followed? Yes
- Real dependencies used? Yes (actual file system, real DOM)
- Integration tests for: Page rendering, search functionality, content processing
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**: ✅ PASS
- Structured logging included? Yes (Next.js built-in, console for client)
- Frontend logs → backend? N/A (frontend-only)
- Error context sufficient? Yes (404 handling, search errors)

**Versioning**: ✅ PASS
- Version number assigned? 1.0.0 (initial release)
- BUILD increments on every change? Yes
- Breaking changes handled? Migration plan for content structure

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single project) - Frontend-only Next.js application with static site generation

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Next.js setup and configuration tasks
- Content processing library tasks [P]
- Search functionality tasks [P]
- UI component tasks (shadcn/ui integration)
- Static content generation tasks
- Sample markdown content creation (50 articles)
- Testing tasks for each component/feature

**Ordering Strategy**:
- TDD order: Tests before implementation
- Dependency order: Setup → Content processing → Search → UI → Integration
- Mark [P] for parallel execution (independent components)
- Group related tasks (e.g., all search functionality together)

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md

**Key Task Groups**:
1. Project setup (Next.js, TypeScript, shadcn/ui)
2. Content processing (markdown parsing, frontmatter)  
3. Search implementation (indexing, client-side search)
4. UI components (layout, cards, search box)
5. Page implementation (homepage, blog listing, article pages)
6. Sample content creation (50 Korean articles)
7. Testing implementation (Jest, Playwright)
8. Performance optimization and deployment

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS  
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*