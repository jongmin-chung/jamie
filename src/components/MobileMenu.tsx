'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* 모바일 메뉴 버튼 */}
      <button
        className="p-2 rounded-md text-white hover:text-kakao-yellow hover:bg-gray-800/50 transition-all md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 모바일 메뉴 패널 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden pt-16">
          <nav className="container mx-auto px-4 py-6">
            <ul className="flex flex-col gap-6 text-center">
              <li>
                <Link
                  href="/"
                  className="text-white text-xl font-medium py-3 block hover:text-kakao-yellow transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Tech Log
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-white text-xl font-medium py-3 block hover:text-kakao-yellow transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  카테고리
                </Link>
              </li>
              <li>
                <Link
                  href="/tags"
                  className="text-white text-xl font-medium py-3 block hover:text-kakao-yellow transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  태그
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  )
}