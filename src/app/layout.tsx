import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import { Layout } from '@/components/Layout';
import { Footer } from '@/components/Footer';
import './globals.css';
import 'highlight.js/styles/github-dark.css';
import './code-highlight.css';

const notoSansKR = Noto_Sans_KR({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '카카오페이 기술 블로그',
  description: '카카오페이 서비스를 만드는 크루들의 기술 노하우와 경험을 공유합니다.',
  keywords: ['카카오페이', '기술블로그', '개발', '프로그래밍', '핀테크', '카카오'],
  authors: [{ name: '카카오페이 기술 블로그 팀' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://tech.kakaopay.com',
    title: '카카오페이 기술 블로그',
    description: '카카오페이 서비스를 만드는 크루들의 기술 노하우와 경험을 공유합니다.',
    siteName: '카카오페이 기술 블로그',
  },
  twitter: {
    card: 'summary_large_image',
    title: '카카오페이 기술 블로그',
    description: '카카오페이 서비스를 만드는 크루들의 기술 노하우와 경험을 공유합니다.',
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
      <body className={notoSansKR.className}>
        <Layout>
          {children}
        </Layout>
        <Footer />
      </body>
    </html>
  );
}