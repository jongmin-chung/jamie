import { Button } from '@/components/ui/button'
import {
  cn,
  getContainerClasses,
  getTypographyClasses,
} from '@/lib/theme/utils'

interface HeroProps {
  readonly title?: string
  readonly subtitle?: string
}

export function Hero({
  title = 'Tech Log',
  subtitle = '서비스를 만드는 크루들의 기술 노하우와 경험을 공유합니다.',
}: HeroProps) {
  return (
    <div className="relative">
      {/* Hero 섹션 - 메인 헤더 */}
      <section className="relative overflow-hidden bg-kakao-dark-text py-24 lg:py-32">
        {/* 배경 이미지/그라데이션 */}
        <div className="absolute inset-0 z-0">
          {/* 이미지 (카카오 스타일) */}
          <div className="h-full w-full bg-gradient-to-br from-[#101418] via-[#0A0E14] to-[#060B11]">
            {/* 떠다니는 기하학적 아이콘들 - 애니메이션 추가 */}
            <div className="absolute inset-0 overflow-hidden">
              {/* 다이아몬드 - 떠다니는 애니메이션 */}
              <div className="absolute top-20 left-1/4 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 transform rotate-45 opacity-70 animate-float-slow"></div>
              {/* 원 - 펄스 애니메이션 */}
              <div className="absolute top-40 right-1/3 w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full opacity-60 animate-pulse"></div>
              {/* 삼각형 - 회전 애니메이션 */}
              <div className="absolute bottom-32 left-1/3 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-green-400 opacity-50 animate-spin-slow"></div>
              {/* 작은 사각형 - 떠다니기 */}
              <div className="absolute top-1/2 right-1/4 w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-500 opacity-40 animate-float-fast"></div>
              {/* 또 다른 원 - 좌우 움직임 */}
              <div className="absolute bottom-20 right-1/2 w-4 h-4 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full opacity-60 animate-bounce-horizontal"></div>
              {/* 추가 도형들 */}
              <div className="absolute top-32 right-1/5 w-3 h-3 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full opacity-50 animate-float-slow"></div>
              <div className="absolute bottom-40 left-1/5 w-6 h-6 bg-gradient-to-br from-indigo-400 to-indigo-500 transform rotate-12 opacity-40 animate-float-fast"></div>
            </div>

            {/* PC/개발 일러스트레이션 영역 (오른쪽) - 개선된 버전 */}
            <div className="absolute bottom-0 right-0 w-1/3 h-full opacity-30">
              <div className="flex items-end justify-center h-full pb-8">
                {/* 모니터와 키보드 */}
                <div className="relative">
                  {/* 모니터 */}
                  <div className="w-40 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg border-2 border-gray-600 relative">
                    {/* 화면 */}
                    <div className="w-36 h-20 bg-gradient-to-br from-gray-900 to-black rounded-md m-auto mt-1 relative overflow-hidden">
                      {/* 코드 라인들 */}
                      <div className="absolute top-2 left-2 space-y-1">
                        <div className="w-8 h-1 bg-green-400 rounded"></div>
                        <div className="w-12 h-1 bg-blue-400 rounded"></div>
                        <div className="w-6 h-1 bg-yellow-400 rounded"></div>
                        <div className="w-10 h-1 bg-purple-400 rounded"></div>
                      </div>
                      {/* 커서 깜빡임 */}
                      <div className="absolute top-6 left-12 w-0.5 h-2 bg-white animate-pulse"></div>
                    </div>
                  </div>
                  {/* 스탠드 */}
                  <div className="w-12 h-6 bg-gray-600 mx-auto rounded-b-lg"></div>
                  {/* 키보드 */}
                  <div className="w-36 h-4 bg-gray-700 rounded-md mt-2 relative">
                    <div className="flex space-x-1 p-1">
                      <div className="w-2 h-2 bg-gray-600 rounded-sm"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-sm"></div>
                      <div className="w-4 h-2 bg-gray-600 rounded-sm"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
        </div>

        {/* 콘텐츠 */}
        <div className={cn(getContainerClasses('hero'), 'relative z-10')}>
          <div className="text-center">
            <h1
              className={cn(
                getTypographyClasses('h1'),
                'text-white mb-6 text-5xl lg:text-6xl xl:text-7xl font-bold',
                'bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent',
                'drop-shadow-2xl animate-fade-in-up'
              )}
            >
              {title}
            </h1>
            <p
              className={cn(
                getTypographyClasses('paragraph'),
                'text-kakao-text-white-48 max-w-4xl mx-auto text-lg lg:text-xl',
                'leading-relaxed animate-fade-in-up-delay'
              )}
            >
              {subtitle}
            </p>

            {/* CTA 버튼 추가 */}
            <div className="mt-8 animate-fade-in-up-delay-2">
              <Button
                size="lg"
                className={cn(
                  'px-8 py-3 bg-gradient-to-r from-kakao-yellow to-yellow-500',
                  'text-black font-semibold rounded-full',
                  'hover:from-yellow-400 hover:to-kakao-yellow',
                  'transform hover:scale-105 transition-all duration-300',
                  'shadow-lg hover:shadow-xl border-0',
                  'text-base'
                )}
              >
                최신 글 보기
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
