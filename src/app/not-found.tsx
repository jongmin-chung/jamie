'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        {/* 404 Error */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            아래 버튼을 통해 다른 페이지로 이동해보세요.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="mr-2 h-5 w-5" />
              홈페이지로 가기
            </Button>
          </Link>
          
          <Link href="/blog">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Search className="mr-2 h-5 w-5" />
              블로그 둘러보기
            </Button>
          </Link>
        </div>

        {/* Back Button */}
        <div className="pt-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            이전 페이지로 돌아가기
          </Button>
        </div>

        {/* Additional Help */}
        <div className="pt-8 space-y-4 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground">
            도움이 필요하신가요?
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• URL을 다시 확인해주세요</p>
            <p>• 검색 기능을 사용해보세요</p>
            <p>• 홈페이지에서 원하시는 내용을 찾아보세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}