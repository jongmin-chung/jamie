'use client'

import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'
import React, { useState } from 'react'

interface SimpleBlogListingProps {
  initialPosts: {
    slug: string
    title: string
    description: string
    publishedAt: string
    category: string
    tags: string[]
    author: string
    readingTime: number
  }[]
  categoryCounts: Record<string, number>
  initialCategory?: string
}

const POSTS_PER_PAGE = 10

export function SimpleBlogListing({
  initialPosts,
  categoryCounts,
  initialCategory,
}: SimpleBlogListingProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  // Pagination calculations
  const totalPages = Math.ceil(initialPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = initialPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {/* 포스트 목록 */}
      <div className="space-y-6">
        {paginatedPosts.map((post) => (
          <article
            key={post.slug}
            className="kakaopay-card p-6 group cursor-pointer"
          >
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
                        color: 'var(--kakaopay-text-secondary)',
                      }}
                    >
                      {post.category}
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

                  <div
                    className="flex items-center text-xs space-x-3"
                    style={{ color: 'var(--kakaopay-text-muted)' }}
                  >
                    <span>{post.author}</span>
                    <span>•</span>
                    <time dateTime={post.publishedAt}>
                      {format(new Date(post.publishedAt), 'yyyy.MM.dd', {
                        locale: ko,
                      })}
                    </time>
                    <span>•</span>
                    <span>{post.readingTime}분 읽기</span>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}

        {paginatedPosts.length === 0 && (
          <div className="text-center py-12">
            <p style={{ color: 'var(--kakaopay-text-muted)' }}>
              포스트가 없습니다.
            </p>
          </div>
        )}
      </div>

      {/* 페이지네이션 - KakaoPay 스타일 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className={`pagination-item ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>

          {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
            const page = i + 1
            const isActive = page === currentPage

            return (
              <button
                key={page}
                className={`pagination-item ${isActive ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            )
          })}

          {totalPages > 10 && currentPage < totalPages - 5 && (
            <>
              <span className="pagination-item">...</span>
              <button
                className="pagination-item"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            className={`pagination-item ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() =>
              currentPage < totalPages && handlePageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}