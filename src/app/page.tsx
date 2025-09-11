import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getAllPosts } from '@/lib/content';

const POSTS_PER_PAGE = 10;

export default function HomePage() {
  const allPosts = getAllPosts();
  const displayedPosts = allPosts.slice(0, POSTS_PER_PAGE);
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  // 모든 태그 수집
  const allTags = Array.from(new Set(allPosts.flatMap(post => post.tags))).slice(0, 20);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* 메인 콘텐츠 */}
      <div className="lg:col-span-3">
        <div className="space-y-6">
          {displayedPosts.map((post) => (
            <article key={post.slug} className="kakaopay-card p-6 group cursor-pointer">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 이미지 플레이스홀더 */}
                  <div className="md:col-span-1">
                    <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-200"></div>
                  </div>
                  
                  {/* 콘텐츠 */}
                  <div className="md:col-span-2">
                    <div className="mb-2">
                      <span 
                        className="inline-block px-2 py-1 text-xs font-medium rounded"
                        style={{ 
                          backgroundColor: 'var(--kakaopay-hover)', 
                          color: 'var(--kakaopay-text-secondary)' 
                        }}
                      >
                        {post.category === 'Development' ? '개발' :
                         post.category === 'Design' ? '디자인' :
                         post.category === 'Career' ? '커리어' :
                         post.category === 'Tech' ? '기술' :
                         post.category === 'Trend' ? '트렌드' : post.category}
                      </span>
                    </div>
                    
                    <h2 
                      className="text-xl font-semibold mb-3 group-hover:underline line-clamp-2"
                      style={{ color: 'var(--kakaopay-text-primary)' }}
                    >
                      {post.title}
                    </h2>
                    
                    <p 
                      className="text-sm mb-3 line-clamp-2"
                      style={{ color: 'var(--kakaopay-text-secondary)' }}
                    >
                      {post.description}
                    </p>
                    
                    <div className="flex items-center text-xs space-x-3" style={{ color: 'var(--kakaopay-text-muted)' }}>
                      <span>{post.author}</span>
                      <span>•</span>
                      <time dateTime={post.publishedAt.toISOString()}>
                        {format(post.publishedAt, 'yyyy.MM.dd', { locale: ko })}
                      </time>
                      <span>•</span>
                      <span>{post.readingTime}분 읽기</span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* 페이지네이션 - KakaoPay 스타일 */}
        <div className="pagination">
          <button className="pagination-item disabled">‹</button>
          {Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pagination-item ${page === 1 ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
          {totalPages > 10 && <span className="pagination-item">...</span>}
          {totalPages > 10 && (
            <button className="pagination-item">{totalPages}</button>
          )}
          <button className="pagination-item">›</button>
        </div>
      </div>

      {/* 사이드바 - KakaoPay와 동일한 태그 클라우드 */}
      <div className="lg:col-span-1">
        <div className="kakaopay-card p-6">
          <h3 
            className="text-lg font-semibold mb-4" 
            style={{ color: 'var(--kakaopay-text-primary)' }}
          >
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button key={tag} className="tag-item">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}