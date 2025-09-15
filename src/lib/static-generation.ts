import fs from 'fs';
import path from 'path';
import { getAllPosts } from './content';
import { generateSearchIndex, serializeSearchIndex } from './search-index';
import { CATEGORIES } from '@/types/content';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

/**
 * Generate static data files for client-side functionality
 */
export async function generateStaticData(): Promise<void> {
  console.log('🔨 Generating static data files...');

  try {
    // Get all posts
    const allPosts = getAllPosts();
    console.log(`📚 Found ${allPosts.length} blog posts`);

    // Generate search index
    const searchIndex = generateSearchIndex(allPosts);
    const searchIndexJson = serializeSearchIndex(searchIndex);

    // Ensure public directory exists
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }

    // Write search index
    const searchIndexPath = path.join(PUBLIC_DIR, 'search-index.json');
    fs.writeFileSync(searchIndexPath, searchIndexJson, 'utf8');
    console.log(`🔍 Generated search index: ${(searchIndexJson.length / 1024).toFixed(1)}KB`);

    // Generate posts metadata for client-side use
    const postsMetadata = allPosts.map(post => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      publishedAt: post.publishedAt.toISOString(),
      updatedAt: post.updatedAt?.toISOString(),
      category: post.category,
      tags: post.tags,
      author: post.author,
      readingTime: post.readingTime
    }));

    const metadataPath = path.join(PUBLIC_DIR, 'posts-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(postsMetadata, null, 0), 'utf8');
    console.log(`📄 Generated posts metadata: ${postsMetadata.length} posts`);

    // Generate categories with post counts
    const categories = Object.entries(CATEGORIES).map(([id, name]) => ({
      id,
      name,
      postCount: allPosts.filter(post => post.category === id).length
    }));

    const categoriesPath = path.join(PUBLIC_DIR, 'categories.json');
    fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 0), 'utf8');
    console.log(`🏷️  Generated categories: ${categories.length} categories`);

    // Generate tags with usage counts
    const allTags = allPosts.flatMap(post => post.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ id: name, name, count }))
      .sort((a, b) => b.count - a.count); // Sort by usage

    const tagsPath = path.join(PUBLIC_DIR, 'tags.json');
    fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 0), 'utf8');
    console.log(`🏷️  Generated tags: ${tags.length} tags`);

    // Generate site statistics
    const stats = {
      totalPosts: allPosts.length,
      totalCategories: categories.length,
      totalTags: tags.length,
      averageReadingTime: Math.round(
        allPosts.reduce((sum, post) => sum + post.readingTime, 0) / allPosts.length
      ),
      lastUpdated: new Date().toISOString(),
      searchIndexSize: searchIndexJson.length
    };

    const statsPath = path.join(PUBLIC_DIR, 'site-stats.json');
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8');
    console.log(`📊 Generated site statistics`);

    console.log('✅ Static data generation completed successfully!');

  } catch (error) {
    console.error('❌ Error generating static data:', error);
    throw error;
  }
}

/**
 * Generate static paths for dynamic routes
 */
export function generateBlogPostPaths(): Array<{ params: { slug: string } }> {
  const allPosts = getAllPosts();
  
  return allPosts.map(post => ({
    params: { slug: post.slug }
  }));
}

/**
 * Validate static generation requirements
 */
export function validateStaticGeneration(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if content directory exists
  const contentDir = path.join(process.cwd(), 'content/posts');
  if (!fs.existsSync(contentDir)) {
    errors.push('Content directory does not exist: content/posts');
  }

  // Check if there are any posts
  const allPosts = getAllPosts();
  if (allPosts.length === 0) {
    errors.push('No blog posts found in content directory');
  }

  // Check if public directory is writable
  const publicDir = path.join(process.cwd(), 'public');
  try {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const testFile = path.join(publicDir, '.write-test');
    fs.writeFileSync(testFile, 'test', 'utf8');
    fs.unlinkSync(testFile);
  } catch (error) {
    errors.push('Public directory is not writable');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Clean up old static files before regeneration
 */
export function cleanStaticFiles(): void {
  const filesToClean = [
    'search-index.json',
    'posts-metadata.json',
    'categories.json', 
    'tags.json',
    'site-stats.json'
  ];

  filesToClean.forEach(filename => {
    const filePath = path.join(PUBLIC_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  console.log('🧹 Cleaned up old static files');
}

/**
 * Get build-time statistics
 */
export function getBuildStats(): {
  postsCount: number;
  categoriesCount: number;
  tagsCount: number;
  totalContentSize: number;
  buildTime: string;
} {
  const allPosts = getAllPosts();
  const totalContentSize = allPosts.reduce((sum, post) => sum + post.content.length, 0);
  
  const allTags = allPosts.flatMap(post => post.tags);
  const uniqueTags = [...new Set(allTags)];
  
  const uniqueCategories = [...new Set(allPosts.map(post => post.category))];

  return {
    postsCount: allPosts.length,
    categoriesCount: uniqueCategories.length,
    tagsCount: uniqueTags.length,
    totalContentSize,
    buildTime: new Date().toISOString()
  };
}