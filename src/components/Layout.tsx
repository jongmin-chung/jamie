'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { navigation, getContainerClasses, cn } from '@/lib/theme/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* KakaoPay Header with exact styling from theme data */}
      <header className={cn(navigation.header)}>
        <div className={getContainerClasses('default')}>
          <div className="flex items-center justify-between h-full">
            <Link 
              href="/" 
              className="flex items-center"
            >
              <Image 
                src="https://tech.kakaopay.com/_astro/thumb.42fc3b96_1Bju8W.avif"
                alt="카카오페이"
                width={32}
                height={32}
                className={navigation.logo}
              />
            </Link>
            
            {/* Navigation items from theme data */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/blog"
                className={navigation.item}
              >
                Tech Log
              </Link>
              <Link
                href="/career"
                className={navigation.item}
              >
                Career
              </Link>
              {/* Search button from theme data */}
              <button className="text-white hover:text-kakao-yellow transition-colors font-noto-sans-kr">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with proper spacing */}
      <main className="pt-21">
        {children}
      </main>
    </div>
  );
}