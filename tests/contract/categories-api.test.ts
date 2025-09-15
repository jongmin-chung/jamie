import { describe, test, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Category } from '@/types/blog';

describe('Categories API Contract Tests', () => {
  const categoriesFile = join(process.cwd(), 'public', 'categories.json');
  const tagsFile = join(process.cwd(), 'public', 'tags.json');

  test('categories file should exist and be valid JSON', () => {
    expect(existsSync(categoriesFile)).toBe(true);
    
    const content = readFileSync(categoriesFile, 'utf-8');
    const categories = JSON.parse(content);
    
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  test('each category should have required structure', () => {
    const content = readFileSync(categoriesFile, 'utf-8');
    const categories: Category[] = JSON.parse(content);

    categories.forEach((category, index) => {
      expect(category).toMatchObject({
        name: expect.any(String),
        slug: expect.any(String),
        description: expect.any(String),
        count: expect.any(Number)
      });

      // Validate required fields are not empty
      expect(category.name.length).toBeGreaterThan(0);
      expect(category.slug.length).toBeGreaterThan(0);
      expect(category.description.length).toBeGreaterThan(0);
      expect(category.count).toBeGreaterThan(0);

      // Slug should be URL-friendly
      expect(category.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  test('categories should have Korean names and descriptions', () => {
    const content = readFileSync(categoriesFile, 'utf-8');
    const categories: Category[] = JSON.parse(content);

    const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
    
    let koreanCategoryCount = 0;
    categories.forEach(category => {
      if (hasKorean.test(category.name) || hasKorean.test(category.description)) {
        koreanCategoryCount++;
      }
    });

    // Most categories should have Korean content
    expect(koreanCategoryCount).toBeGreaterThan(categories.length * 0.8);
  });

  test('should have all required technology categories', () => {
    const content = readFileSync(categoriesFile, 'utf-8');
    const categories: Category[] = JSON.parse(content);

    const categoryNames = categories.map(cat => cat.name.toLowerCase());
    
    // Should cover major tech areas (based on the 50 blog posts requirement)
    const requiredAreas = ['frontend', 'backend', 'devops', 'design'];
    
    requiredAreas.forEach(area => {
      const hasArea = categoryNames.some(name => 
        name.includes(area) || 
        name.includes(area === 'frontend' ? '프론트' : '') ||
        name.includes(area === 'backend' ? '백엔드' : '') ||
        name.includes(area === 'devops' ? '데브옵스' : '') ||
        name.includes(area === 'design' ? '디자인' : '')
      );
      expect(hasArea).toBe(true);
    });
  });

  test('tags file should exist and be valid JSON', () => {
    expect(existsSync(tagsFile)).toBe(true);
    
    const content = readFileSync(tagsFile, 'utf-8');
    const tags = JSON.parse(content);
    
    expect(Array.isArray(tags)).toBe(true);
    expect(tags.length).toBeGreaterThan(0);
  });

  test('each tag should have required structure', () => {
    const content = readFileSync(tagsFile, 'utf-8');
    const tags: Array<{name: string, count: number}> = JSON.parse(content);

    tags.forEach((tag, index) => {
      expect(tag).toMatchObject({
        name: expect.any(String),
        count: expect.any(Number)
      });

      expect(tag.name.length).toBeGreaterThan(0);
      expect(tag.count).toBeGreaterThan(0);
    });
  });

  test('tags should include common technology terms', () => {
    const content = readFileSync(tagsFile, 'utf-8');
    const tags: Array<{name: string, count: number}> = JSON.parse(content);

    const tagNames = tags.map(tag => tag.name.toLowerCase());
    
    // Should have common tech tags
    const commonTags = ['javascript', 'typescript', 'react', 'nextjs'];
    let foundCommonTags = 0;

    commonTags.forEach(commonTag => {
      const hasTag = tagNames.some(name => 
        name.includes(commonTag) || 
        name.includes(commonTag.replace('js', ''))
      );
      if (hasTag) foundCommonTags++;
    });

    expect(foundCommonTags).toBeGreaterThan(0);
  });

  test('category counts should match actual post distribution', () => {
    const categoriesContent = readFileSync(categoriesFile, 'utf-8');
    const categories: Category[] = JSON.parse(categoriesContent);

    const metadataFile = join(process.cwd(), 'public', 'posts-metadata.json');
    const metadataContent = readFileSync(metadataFile, 'utf-8');
    const posts = JSON.parse(metadataContent);

    // Calculate actual category distribution
    const actualCounts: Record<string, number> = {};
    posts.forEach((post: any) => {
      actualCounts[post.category] = (actualCounts[post.category] || 0) + 1;
    });

    categories.forEach(category => {
      expect(actualCounts[category.name]).toBe(category.count);
    });
  });

  test('categories should have unique names and slugs', () => {
    const content = readFileSync(categoriesFile, 'utf-8');
    const categories: Category[] = JSON.parse(content);

    const names = categories.map(cat => cat.name);
    const slugs = categories.map(cat => cat.slug);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});