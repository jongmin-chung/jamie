import { getContainerClasses, getTypographyClasses, cn } from '@/lib/theme/utils'
import { kakaoPayTheme } from '@/lib/theme/kakaopay-theme'

interface HeroProps {
  readonly title?: string;
  readonly subtitle?: string;
}

export function Hero({ 
  title = kakaoPayTheme.components.hero.title,
  subtitle = kakaoPayTheme.components.hero.subtitle 
}: ReadOnly<HeroProps>) {
  return (
    // pt-16 제거하여 헤더와 자연스럽게 연결
    <div className="relative">
      {/* Hero 섹션 - 메인 헤더 */}
      <section className="relative overflow-hidden bg-black py-24 lg:py-36">
        {/* 배경 이미지/그라데이션 */}
        <div className="absolute inset-0 z-0">
          {/* 상단 투명 -> 하단 검정 그라데이션으로 자연스러운 전환 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/70 to-black"></div>
        </div>

        {/* 콘텐츠 */}
        <div className={cn(getContainerClasses('hero'), 'relative z-10')}>
          <div className="text-center">
            <h1 className={cn(getTypographyClasses('h1'), 'text-white mb-6 pt-8')}>
              {title}
            </h1>
            <p className={cn(getTypographyClasses('paragraph'), 'text-gray-200 max-w-3xl mx-auto')}>
              {subtitle}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
