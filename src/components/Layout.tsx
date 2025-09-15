'use client';

import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--kakaopay-bg)' }}>
      {/* KakaoPay 정확한 헤더 스타일 */}
      <header className="bg-white border-b" style={{ borderColor: 'var(--kakaopay-border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-2xl font-semibold"
              style={{ color: 'var(--kakaopay-text-primary)' }}
            >
              Tech Log
            </Link>
            
            {/* 채용 링크들 (KakaoPay와 동일) */}
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#"
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--kakaopay-text-secondary)' }}
              >
                카카오페이 채용
              </a>
              <a
                href="#"
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--kakaopay-text-secondary)' }}
              >
                카카오페이증권 채용
              </a>
              <a
                href="#"
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--kakaopay-text-secondary)' }}
              >
                카카오페이보험 채용
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-20" style={{ borderColor: 'var(--kakaopay-border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-sm" style={{ color: 'var(--kakaopay-text-muted)' }}>
              © 2025 Kakao Pay Corp. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}