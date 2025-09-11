# Blog API Contracts

**Date**: 2025-09-11  
**Branch**: 001-https-tech-kakaopay  

## Static API Endpoints

Since this is a frontend-only application, "API endpoints" are static JSON files served during build time.

### GET /api/posts
Returns list of all blog posts with metadata.

**Response** (200 OK):
```json
{
  "posts": [
    {
      "slug": "react-hooks-guide",
      "title": "React Hooks 완전 가이드",
      "description": "React Hooks의 모든 것을 알아보는 완전한 가이드",
      "publishedAt": "2025-09-10T00:00:00.000Z",
      "updatedAt": "2025-09-10T00:00:00.000Z",
      "category": "frontend",
      "tags": ["react", "hooks", "javascript"],
      "author": "김개발",
      "readingTime": 8
    }
  ],
  "total": 50,
  "categories": ["frontend", "backend", "devops"],
  "tags": ["react", "nextjs", "typescript"]
}
```

### GET /api/posts/[slug]
Returns individual blog post content.

**Parameters**:
- `slug`: string (required) - URL-safe post identifier

**Response** (200 OK):
```json
{
  "slug": "react-hooks-guide",
  "title": "React Hooks 완전 가이드",
  "description": "React Hooks의 모든 것을 알아보는 완전한 가이드",
  "content": "# React Hooks 완전 가이드\n\n본문 내용...",
  "publishedAt": "2025-09-10T00:00:00.000Z",
  "updatedAt": "2025-09-10T00:00:00.000Z",
  "category": "frontend",
  "tags": ["react", "hooks", "javascript"],
  "author": "김개발",
  "readingTime": 8
}
```

**Response** (404 Not Found):
```json
{
  "error": "Post not found",
  "message": "블로그 포스트를 찾을 수 없습니다."
}
```

### GET /api/search
Returns search index for client-side search.

**Response** (200 OK):
```json
{
  "index": [
    {
      "id": "react-hooks-guide",
      "title": "React Hooks 완전 가이드",
      "description": "React Hooks의 모든 것을 알아보는 완전한 가이드",
      "content": "React Hooks는 함수 컴포넌트에서 상태 관리...",
      "category": "frontend",
      "tags": ["react", "hooks", "javascript"],
      "publishedAt": "2025-09-10"
    }
  ],
  "categories": {
    "frontend": "프론트엔드",
    "backend": "백엔드",
    "devops": "데브옵스"
  }
}
```

### GET /api/categories
Returns list of all categories with post counts.

**Response** (200 OK):
```json
{
  "categories": [
    {
      "id": "frontend",
      "name": "프론트엔드",
      "description": "프론트엔드 개발 관련 글",
      "color": "#3B82F6",
      "postCount": 15
    },
    {
      "id": "backend",
      "name": "백엔드", 
      "description": "백엔드 개발 관련 글",
      "color": "#10B981",
      "postCount": 12
    }
  ]
}
```

### GET /api/tags
Returns list of all tags with usage counts.

**Response** (200 OK):
```json
{
  "tags": [
    {
      "id": "react",
      "name": "React",
      "count": 8
    },
    {
      "id": "nextjs",
      "name": "Next.js",
      "count": 5
    }
  ]
}
```

## Page Routes

### Homepage Route: /
Displays featured posts and recent posts.

**Data Required**:
- Recent posts (5 latest)
- Featured posts (manually curated)
- Categories for navigation

### Blog Listing Route: /blog
Displays paginated list of all blog posts.

**Query Parameters**:
- `page`: number (optional, default: 1)
- `category`: string (optional, filter by category)
- `search`: string (optional, search query)

**Data Required**:
- Paginated posts list
- Total post count
- Available categories
- Search functionality

### Blog Post Route: /blog/[slug]
Displays individual blog post.

**Parameters**:
- `slug`: string (required)

**Data Required**:
- Complete post content and metadata
- Related posts (same category/tags)
- Navigation (prev/next posts)

## Error Handling

### 404 - Post Not Found
When accessing `/blog/invalid-slug`:
```json
{
  "error": "NOT_FOUND",
  "message": "요청하신 블로그 포스트를 찾을 수 없습니다.",
  "suggestions": [
    "홈페이지로 돌아가기",
    "전체 포스트 목록 보기",
    "검색 기능 사용하기"
  ]
}
```

### Search No Results
When search query returns empty results:
```json
{
  "results": [],
  "query": "검색어",
  "message": "검색 결과가 없습니다.",
  "suggestions": [
    "다른 키워드로 검색해보세요",
    "철자를 확인해보세요",
    "카테고리별로 탐색해보세요"
  ]
}
```

## Static File Contracts

### /content/posts/{slug}.md
Markdown files with frontmatter:

```markdown
---
title: "Korean Blog Post Title"
description: "Brief description"
publishedAt: "2025-09-11"
category: "frontend"
tags: ["react", "nextjs"]
author: "Author Name"
---

# Post Content

Markdown content here...
```

### /public/search-index.json
Pre-built search index:

```json
{
  "posts": [...],
  "categories": {...},
  "tags": [...],
  "buildTime": "2025-09-11T10:00:00.000Z"
}
```