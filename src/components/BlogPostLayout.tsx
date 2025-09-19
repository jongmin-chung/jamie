'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

type BlogPostLayoutProps = {
  title: string
  date: string
  author: string
  readTime: string
  category: string
  content: React.ReactNode
  tags: string[]
  authorBio?: string
  excerpt?: string
}

const BlogPostLayout: React.FC<BlogPostLayoutProps> = ({
  title,
  date,
  author,
  readTime,
  category,
  content,
  tags,
  authorBio = '카카오페이 테크 블로그의 기술 전문가입니다. 최신 기술 트렌드와 개발 노하우를 공유합니다.',
  excerpt,
}) => {
  const [activeHeading, setActiveHeading] = useState<string>('')

  // Set up observer for active heading
  useEffect(() => {
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id]')
    if (headings.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveHeading(entry.target.id)
            }
          })
        },
        { rootMargin: '-100px 0px -66% 0px' }
      )

      headings.forEach((heading) => observer.observe(heading))
      return () => observer.disconnect()
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Back button */}
      <div className="max-w-screen-xl mx-auto w-full px-4 py-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-gray-700 hover:text-yellow-500 transition-colors"
        >
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            블로그 목록
          </button>
        </Link>
      </div>

      <div className="max-w-screen-xl mx-auto w-full px-4 pb-16">
        {/* Featured Image with Title Overlay */}
        <div className="relative mb-12 rounded-lg overflow-hidden">
          <Image
            src="/images/thumb.png"
            alt={title}
            width={1200}
            height={500}
            className="w-full object-cover h-[400px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
            <div className="text-white">
              <span className="inline-block bg-yellow-500 text-white px-3 py-1 rounded-full text-sm mb-4">
                {category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
              <div className="flex items-center gap-6 text-gray-200">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-700"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>{author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main content */}
          <article className="lg:flex-1">
            {/* Post content */}
            <div className="prose prose-lg max-w-none">{content}</div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-12 mb-8">
              <span className="font-semibold">태그:</span>
              {tags.map((tag, index) => (
                <span key={index} className="text-gray-600">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author bio */}
            <div className="bg-gray-100 rounded-lg p-6 my-8 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{author}</h3>
                <p className="text-gray-700">{authorBio}</p>
              </div>
            </div>

            {/* Back to blog list button */}
            <Link href="/blog" className="inline-block mt-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                블로그 목록으로 돌아가기
              </button>
            </Link>
          </article>

          {/* Table of contents - right sidebar */}
          <aside className="lg:w-72 order-first lg:order-last">
            <div className="lg:sticky lg:top-24">
              <nav className="border border-gray-200 rounded-lg p-5 bg-white mb-8">
                <h3 className="text-lg font-bold mb-4">목차</h3>
                <div className="flex flex-col gap-2">
                  <a
                    href="#react-hooks-완전-가이드"
                    className={`text-left py-1.5 hover:text-yellow-500 transition-colors ${
                      activeHeading === 'react-hooks-완전-가이드'
                        ? 'text-yellow-500 font-medium'
                        : 'text-gray-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      document
                        .getElementById('react-hooks-완전-가이드')
                        ?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        })
                    }}
                  >
                    <span className="block">React Hooks 완전 가이드</span>
                  </a>
                  <a
                    href="#usestate-hook"
                    className={`text-left py-1.5 hover:text-yellow-500 transition-colors ${
                      activeHeading === 'usestate-hook'
                        ? 'text-yellow-500 font-medium'
                        : 'text-gray-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('usestate-hook')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                    }}
                  >
                    <span className="block">useState Hook</span>
                  </a>
                  <a
                    href="#useeffect-hook"
                    className={`text-left py-1.5 hover:text-yellow-500 transition-colors ${
                      activeHeading === 'useeffect-hook'
                        ? 'text-yellow-500 font-medium'
                        : 'text-gray-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      document
                        .getElementById('useeffect-hook')
                        ?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        })
                    }}
                  >
                    <span className="block">useEffect Hook</span>
                  </a>
                  <a
                    href="#커스텀-hook-만들기"
                    className={`text-left py-1.5 hover:text-yellow-500 transition-colors ${
                      activeHeading === '커스텀-hook-만들기'
                        ? 'text-yellow-500 font-medium'
                        : 'text-gray-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      document
                        .getElementById('커스텀-hook-만들기')
                        ?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        })
                    }}
                  >
                    <span className="block">커스텀 Hook 만들기</span>
                  </a>
                  <a
                    href="#주의사항"
                    className={`text-left py-1.5 hover:text-yellow-500 transition-colors ${
                      activeHeading === '주의사항'
                        ? 'text-yellow-500 font-medium'
                        : 'text-gray-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('주의사항')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                    }}
                  >
                    <span className="block">주의사항</span>
                  </a>
                  <a
                    href="#결론"
                    className={`text-left py-1.5 hover:text-yellow-500 transition-colors ${
                      activeHeading === '결론'
                        ? 'text-yellow-500 font-medium'
                        : 'text-gray-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('결론')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                    }}
                  >
                    <span className="block">결론</span>
                  </a>
                </div>
              </nav>
            </div>
          </aside>
        </div>
      </div>

      {/* Related posts - bottom section */}
      <div className="bg-gray-100 py-12 mt-8">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">추천 글</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Related post 1 */}
            <Link href="/blog/typescript-basics" className="block">
              <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <Image
                  src="/images/thumb.png"
                  alt="TypeScript 기초 완벽 정리"
                  width={800}
                  height={450}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-2">
                    TypeScript 기초 완벽 정리
                  </h3>
                  <p className="text-gray-600 mb-3">
                    TypeScript의 기본 개념부터 실무 활용법까지, 초보자도 쉽게
                    이해할 수 있는 완벽한 가이드입니다.
                  </p>
                  <span className="text-gray-500 text-sm">2025. 9. 9</span>
                </div>
              </article>
            </Link>

            {/* Related post 2 */}
            <Link href="/blog/javascript-es6-features" className="block">
              <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <Image
                  src="/images/thumb.png"
                  alt="JavaScript ES6+ 주요 기능 정리"
                  width={800}
                  height={450}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-2">
                    JavaScript ES6+ 주요 기능 정리
                  </h3>
                  <p className="text-gray-600 mb-3">
                    ES6부터 최신 JavaScript까지, 현대 JavaScript 개발에 필수인
                    기능들을 정리했습니다.
                  </p>
                  <span className="text-gray-500 text-sm">2025. 9. 7</span>
                </div>
              </article>
            </Link>

            {/* Related post 3 */}
            <Link href="/blog/web-performance-optimization" className="block">
              <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <Image
                  src="/images/thumb.png"
                  alt="웹 성능 최적화 실전 가이드"
                  width={800}
                  height={450}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-2">
                    웹 성능 최적화 실전 가이드
                  </h3>
                  <p className="text-gray-600 mb-3">
                    실제 웹사이트 성능을 개선하는 구체적인 방법들을 살펴봅시다.
                    Core Web Vitals부터 실무 최적화 기법까지.
                  </p>
                  <span className="text-gray-500 text-sm">2025. 9. 6</span>
                </div>
              </article>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPostLayout
