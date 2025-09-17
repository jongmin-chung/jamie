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

  // 스크롤에 따라 배경색 계산 (카카오페이 스타일: 스크롤을 내리면 불투명하게 변경)
  const stickyBgClass = scrollY > 50 ? 'bg-kakao-dark-text' : 'bg-transparent'

  return (
    <>
      {/* Sticky Header - 항상 상단에 고정 */}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${stickyBgClass}`}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-21 items-center"> {/* h-21 = 84px KakaoPay spec */}
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
