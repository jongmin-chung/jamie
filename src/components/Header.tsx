'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Logo from '@/components/Logo'

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const updateHeaderOnScroll = () => {
      const scrollY = window.scrollY
      const threshold = 50
      const maxScroll = 150

      // 스크롤 투명도 계산
      const opacity = Math.min(
        Math.max((scrollY - threshold) / (maxScroll - threshold), 0),
        1
      )
      const isScrolled = scrollY > threshold

      // DOM에서 헤더 직접 찾아서 스타일 업데이트 (React state 사용 안함)
      const header = document.getElementById('main-header')
      if (header) {
        header.style.backgroundColor = `rgba(16, 20, 24, ${opacity})`
        header.style.backdropFilter =
          isScrolled && opacity > 0.3 ? 'blur(10px)' : 'none'
        header.style.boxShadow =
          isScrolled && opacity > 0.5 ? '0 2px 20px rgba(0, 0, 0, 0.1)' : 'none'
      }
    }

    // 초기값 설정
    updateHeaderOnScroll()

    // 이벤트 리스너 등록
    window.addEventListener('scroll', updateHeaderOnScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateHeaderOnScroll)
    }
  }, [])

  return (
    <>
      {/* Sticky Header - 항상 상단에 고정 */}
      <div
        id="main-header"
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-out"
        style={{
          backgroundColor: 'rgba(16, 20, 24, 0)',
          transition: 'all 0.3s ease-out',
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-21 items-center">
            {' '}
            {/* h-21 = 84px KakaoPay spec */}
            {/* 로고 (왼쪽) */}
            <div className="flex-none">
              <Link href="/" className="flex items-center">
                <Logo className="h-8 w-auto min-w-[160px] text-white" />
              </Link>
            </div>
            {/* 오른쪽 영역 (네비게이션 + 검색) */}
            <div className="flex items-center ml-auto space-x-8">
              {/* 네비게이션 메뉴 */}
              <nav className="hidden md:flex items-center">
                <ul className="flex space-x-8 items-center">
                  <li>
                    <Link
                      href="/"
                      className="text-white hover:text-kakao-yellow transition-colors text-base font-noto-sans-kr"
                    >
                      Tech Log
                    </Link>
                  </li>
                  <li>
                    <span className="text-white text-base font-noto-sans-kr cursor-pointer">
                      Career
                    </span>
                  </li>
                </ul>
              </nav>

              {/* 검색 버튼 (가장 우측) */}
              <div className="flex items-center justify-center">
                <button
                  className="p-2 text-white hover:text-kakao-yellow transition-colors"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  aria-label="검색 열기"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 검색창 - 검색 버튼 클릭시 표시 */}
      {isSearchOpen && (
        <div className="fixed top-21 left-0 w-full bg-white z-40 shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <input
              type="text"
              placeholder="검색어를 입력하세요."
              className="w-full p-2 border border-kakao-light-gray rounded-none font-noto-sans-kr"
            />
          </div>
        </div>
      )}
    </>
  )
}
