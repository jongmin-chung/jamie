# Data Model: Korean Tech Blog Site

**Date**: 2025-09-11  
**Branch**: 001-https-tech-kakaopay  

## Core Entities

### BlogPost
Represents individual blog articles with Korean content.

**Fields**:
- `slug`: string (unique identifier, URL-safe)
- `title`: string (Korean title, required)
- `description`: string (short summary, required)
- `content`: string (markdown content, required)
- `publishedAt`: Date (publication date, required)
- `updatedAt`: Date (last modified date, optional)
- `category`: string (article category, required)
- `tags`: string[] (article tags, optional)
- `author`: string (author name, required)
- `readingTime`: number (estimated minutes, calculated)

**Validation Rules**:
- `slug` must be URL-safe (lowercase, hyphens only)
- `title` length: 5-100 characters
- `description` length: 10-200 characters
- `content` minimum length: 100 characters
- `category` must be predefined category
- `tags` maximum: 5 tags per post

**Relationships**:
- BlogPost belongs to one Category
- BlogPost has many Tags (many-to-many)

### Category
Represents article classification for organization.

**Fields**:
- `id`: string (unique identifier)
- `name`: string (Korean category name, required)
- `description`: string (category description, optional)
- `color`: string (hex color for UI, optional)

**Validation Rules**:
- `name` length: 2-30 characters
- `color` must be valid hex color

**Relationships**:
- Category has many BlogPosts

### Tag
Represents keywords for article tagging.

**Fields**:
- `id`: string (unique identifier)
- `name`: string (Korean tag name, required)
- `count`: number (usage count, calculated)

**Validation Rules**:
- `name` length: 1-20 characters
- `name` must be unique

**Relationships**:
- Tag has many BlogPosts (many-to-many)

### SearchIndex
Represents indexed content for client-side search.

**Fields**:
- `id`: string (matches BlogPost slug)
- `title`: string (searchable title)
- `description`: string (searchable description)
- `content`: string (processed content without markdown)
- `category`: string (searchable category)
- `tags`: string[] (searchable tags)

**Processing Rules**:
- Remove markdown syntax from content
- Normalize Korean text for search
- Extract keywords for indexing

## File Structure

### Markdown Files
Located in `/content/posts/`

**Frontmatter Format**:
```yaml
---
title: "Korean Blog Post Title"
description: "Brief description in Korean"
publishedAt: "2025-09-11"
updatedAt: "2025-09-11"
category: "technology"
tags: ["react", "nextjs", "typescript"]
author: "Author Name"
---

# Markdown content starts here
```

### Generated Data
Build-time generated files for performance:

- `/public/search-index.json`: Search index for client-side search
- `/public/posts-metadata.json`: All post metadata for listing pages
- `/public/categories.json`: Category list with post counts
- `/public/tags.json`: Tag list with usage counts

## State Transitions

### BlogPost Lifecycle
1. **Draft**: Markdown file created with future date
2. **Published**: File with past/current date, appears in listings
3. **Updated**: Modified updatedAt date, triggers rebuild

### Search Index Updates
1. **Build Time**: Generate complete search index
2. **Runtime**: Load index, filter/search in memory
3. **No Updates**: Static site, no dynamic updates

## Data Validation Schema

### TypeScript Interfaces

```typescript
interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: Date;
  updatedAt?: Date;
  category: string;
  tags: string[];
  author: string;
  readingTime: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  postCount: number;
}

interface Tag {
  id: string;
  name: string;
  count: number;
}

interface SearchIndexItem {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  publishedAt: string;
}
```

## Predefined Categories
- `technology`: 기술 (Technology)
- `frontend`: 프론트엔드 (Frontend)
- `backend`: 백엔드 (Backend)
- `devops`: 데브옵스 (DevOps)
- `design`: 디자인 (Design)
- `career`: 커리어 (Career)
- `trends`: 트렌드 (Trends)

## Content Guidelines
- Minimum 500 words per article (Korean)
- Include code examples where relevant
- Use clear headings and structure
- Add relevant tags (3-5 per post)
- Include publication date and author
- Keep descriptions concise but informative