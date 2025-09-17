import { getContainerClasses, getTypographyClasses, cn } from '@/lib/theme/utils'
import { kakaoPayTheme } from '@/lib/theme/kakaopay-theme'

interface HeroProps {
  readonly title?: string;
  readonly subtitle?: string;
}

export function Hero({ 
  title = kakaoPayTheme.components.hero.title,
  subtitle = kakaoPayTheme.components.hero.subtitle 
}: HeroProps) {
  return (
    <div className="relative">
      {/* Hero 섹션 - 메인 헤더 */}
      <section className="relative overflow-hidden bg-kakao-dark-text py-24 lg:py-32">
        {/* 배경 이미지/그라데이션 */}
        <div className="absolute inset-0 z-0">
          {/* 이미지 (카카오 스타일) */}
          <div className="h-full w-full bg-gradient-to-r from-[#101418] to-[#060B11]">
            {/* 추가 패턴 또는 효과를 넣을 수 있음 */}
            <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFEB00" d="M300,521.0016835830174C376.1290562159157,517.8887921683347,466.0731472004068,529.7835943286574,510.70327084640275,468.03025145048787C554.3714126377745,407.6079735673963,508.03601936045806,328.9844924480964,491.2728898941984,256.3432110539036C474.5976632858925,184.082847569629,479.9380746630129,96.60480741107993,416.23090153303,58.64404602377083C348.86323505073057,18.502131276798302,261.93793281208167,40.57373210992963,193.5410806939664,78.93577620505333C130.42746243093433,114.334589627462,98.30271207620316,179.96522072025542,76.75703585869454,249.04625023123273C51.97151888228291,328.5150500222984,13.704378332031375,414.041076348969,66.52175969318436,486.19268566864C119.04800174914682,558.1240225419705,223.9878218021,524.383925680826,300,521.0016835830174"></path>
              </svg>
            </div>
          </div>
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
        </div>

        {/* 콘텐츠 */}
        <div className={cn(getContainerClasses('hero'), 'relative z-10')}>
          <div className="text-center">
            <h1 className={cn(getTypographyClasses('h1'), 'text-white mb-6')}>
              {title}
            </h1>
            <p className={cn(getTypographyClasses('paragraph'), 'text-kakao-text-white-48 max-w-3xl mx-auto')}>
              {subtitle}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
