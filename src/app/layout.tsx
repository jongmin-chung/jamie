import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Layout } from '@/components/Layout';
import './globals.css';
import 'highlight.js/styles/github-dark.css';
import './code-highlight.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '한국 기술 블로그',
  description: '한국어로 작성된 기술 블로그입니다. 최신 기술 트렌드와 개발 인사이트를 한국어로 만나보세요.',
  keywords: ['기술블로그', '개발', '프로그래밍', 'Korean Tech Blog', '한국어', '기술'],
  authors: [{ name: '한국 기술 블로그 팀' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://korean-tech-blog.com',
    title: '한국 기술 블로그',
    description: '한국어로 작성된 기술 블로그입니다. 최신 기술 트렌드와 개발 인사이트를 한국어로 만나보세요.',
    siteName: '한국 기술 블로그',
  },
  twitter: {
    card: 'summary_large_image',
    title: '한국 기술 블로그',
    description: '한국어로 작성된 기술 블로그입니다.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}