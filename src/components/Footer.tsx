'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useState } from 'react'
import { kakaoPayTheme } from '@/lib/theme/kakaopay-theme'

export default function Footer() {
  const footerData = kakaoPayTheme.components.footer
  const [isRelatedSitesOpen, setIsRelatedSitesOpen] = useState(false)

  return (
    <footer className="bg-white border-t border-kakao-light-gray py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col">
          {/* Copyright */}
          <p className="text-kakao-text-dark-48 text-sm font-noto-sans-kr mb-6">
            {footerData.copyright}
          </p>

          {/* Related Sites Dropdown - KakaoPay Style */}
          <div className="relative">
            <button
              onClick={() => setIsRelatedSitesOpen(!isRelatedSitesOpen)}
              className="flex items-center justify-between w-full md:w-72 border border-kakao-light-gray px-4 py-3 bg-white text-kakao-dark-text font-noto-sans-kr text-sm"
            >
              <span>관련 사이트</span>
              {isRelatedSitesOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {isRelatedSitesOpen && (
              <div className="absolute z-10 w-full md:w-72 bg-white border border-kakao-light-gray border-t-0 mt-0">
                <ul className="py-2">
                  {footerData.links.map((link, index) => (
                    <li key={index} className="px-4 py-2">
                      <a
                        href={link.url}
                        className="text-kakao-dark-text hover:text-kakao-yellow transition-colors font-noto-sans-kr text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
