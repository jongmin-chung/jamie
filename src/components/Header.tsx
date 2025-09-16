'use client'

import Link from 'next/link'
import Logo from '@/components/Logo'
import { Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'

export default function Header() {
  // 스크롤 상태 관리
  const [scrollY, setScrollY] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 스크롤에 따라 배경색 계산
  const stickyBgClass = scrollY > 50 ? 'bg-black' : 'bg-transparent'

  return (
    <>
      {/* Sticky Header - 항상 상단에 고정 */}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${stickyBgClass}`}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 items-center">
            {/* 로고 (왼쪽) */}
            <div className="flex-none">
              <Link href="/" className="flex items-center">
                <Logo className="h-8 w-auto text-white" />
              </Link>
            </div>

            {/* 오른쪽 영역 (네비게이션 + 검색) */}
            <div className="flex items-center ml-auto">
              {/* 네비게이션 메뉴 */}
              <nav className="hidden md:flex items-center mr-4">
                <Link
                  href="/"
                  className="mr-6 text-white font-medium hover:text-gray-200"
                >
                  Tech Log
                </Link>
              </nav>

              {/* 검색 버튼 (가장 우측) */}
              <button
                className="p-2 text-white hover:text-gray-200"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="검색 열기"
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 검색창 - 검색 버튼 클릭시 표시 */}
      {isSearchOpen && (
        <div className="fixed top-16 left-0 w-full bg-white z-40 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <input
              type="text"
              placeholder="검색어를 입력하세요."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      )}
    </>
  )
}
