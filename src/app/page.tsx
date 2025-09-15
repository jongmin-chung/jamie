import { getAllPosts } from '@/lib/content';
import { Hero } from '@/components/Hero';
import { BlogCard } from '@/components/BlogCard';
import { getContainerClasses, getGridClasses, getTypographyClasses, cn } from '@/lib/theme/utils';

const RECENT_POSTS_COUNT = 6;
const ALL_POSTS_COUNT = 12;

export default function HomePage() {
  const allPosts = getAllPosts();
  const recentPosts = allPosts.slice(0, RECENT_POSTS_COUNT);
  const displayedPosts = allPosts.slice(0, ALL_POSTS_COUNT);

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <div className={getContainerClasses('content')}>
        {/* Recent Posts Section - Horizontal Scroll */}
        <section className="mb-16">
          <h2 className={cn(getTypographyClasses('h2'), 'mb-8')}>
            최근 올라온 글
          </h2>
          <div className={getGridClasses('horizontal-scroll')}>
            {recentPosts.map((post) => (
              <div key={post.slug} className="flex-shrink-0 w-80">
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        </section>

        {/* All Posts Section - Grid Layout */}
        <section>
          <h2 className={cn(getTypographyClasses('h2'), 'mb-8')}>
            전체 게시글
          </h2>
          <div className={getGridClasses('grid')}>
            {displayedPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}