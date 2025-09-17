import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const blogPosts = [
  {
    slug: 'react-hooks-guide',
    title: 'React Hooks 완전 가이드',
    excerpt: 'React Hooks의 모든 것을 알아보는 완전한 가이드입니다. useState부터 useEffect까지 실무에서 사용하는 방법을 살펴봅시다.',
    date: '2025. 9. 10',
    category: 'frontend'
  },
  {
    slug: 'typescript-basics',
    title: 'TypeScript 기초 완벽 정리',
    excerpt: 'TypeScript의 기본 개념부터 실무 활용법까지, 초보자도 쉽게 이해할 수 있는 완벽한 가이드입니다.',
    date: '2025. 9. 9',
    category: 'frontend'
  },
  {
    slug: 'nextjs-deployment',
    title: 'Next.js 프로젝트 배포 완벽 가이드',
    excerpt: 'Next.js 프로젝트를 Vercel, Netlify, AWS 등 다양한 플랫폼에 배포하는 방법을 단계별로 알아봅시다.',
    date: '2025. 9. 8',
    category: 'deployment'
  },
  {
    slug: 'javascript-es6-features',
    title: 'JavaScript ES6+ 주요 기능 정리',
    excerpt: 'ES6부터 최신 JavaScript까지, 현대 JavaScript 개발에 필수인 기능들을 정리했습니다.',
    date: '2025. 9. 7',
    category: 'frontend'
  },
  {
    slug: 'web-performance-optimization',
    title: '웹 성능 최적화 실전 가이드',
    excerpt: '실제 웹사이트 성능을 개선하는 구체적인 방법들을 살펴봅시다. Core Web Vitals부터 실무 최적화 기법까지.',
    date: '2025. 9. 6',
    category: 'performance'
  }
]

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">전체 게시글</h1>
          
          <div className="space-y-8">
            {blogPosts.map((post) => (
              <Link 
                key={post.slug} 
                href={`/blog-kakao/${post.slug}`}
                className="block"
              >
                <article className="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-8">
                  <div className="md:w-1/3">
                    <Image 
                      src="/images/thumb.png" 
                      alt={post.title}
                      width={800}
                      height={450}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <strong className="text-xl font-semibold">{post.title}</strong>
                    <p className="mt-2 text-gray-700">{post.excerpt}</p>
                    <time className="mt-4 inline-block text-gray-500">{post.date}</time>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          
          <div className="flex justify-center items-center mt-10 space-x-2">
            <span className="px-3 py-1 text-center font-medium border rounded-full bg-yellow-50 border-yellow-500 text-yellow-600 min-w-8">1</span>
            <Link href="/blog/page/2" className="px-3 py-1 text-center text-gray-600 hover:bg-gray-100 rounded-full min-w-8">2</Link>
            <Link href="/blog/page/3" className="px-3 py-1 text-center text-gray-600 hover:bg-gray-100 rounded-full min-w-8">3</Link>
            <Link href="/blog/page/4" className="px-3 py-1 text-center text-gray-600 hover:bg-gray-100 rounded-full min-w-8">4</Link>
            <Link href="/blog/page/5" className="px-3 py-1 text-center text-gray-600 hover:bg-gray-100 rounded-full min-w-8">5</Link>
            <span className="px-3 py-1 text-center text-gray-600">...</span>
            <Link href="/blog/page/30" className="px-3 py-1 text-center text-gray-600 hover:bg-gray-100 rounded-full min-w-8">30</Link>
            <Link href="/blog/page/2" className="flex items-center justify-center px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}