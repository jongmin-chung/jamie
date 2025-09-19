'use client'

import { ThumbnailGallery, HeroImage, OptimizedImage } from '@/components/OptimizedImage'
import { ScrollAnimation } from '@/components/ScrollAnimation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useState } from 'react'

export default function DemoPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageClick = (index: number, src: string) => {
    setSelectedImage(src)
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation animation="fade-up">
            <h1 className="text-4xl font-bold text-kakao-dark-text mb-6 text-center">
              이미지 최적화 데모
            </h1>
            <p className="text-lg text-kakao-gray-text text-center mb-12">
              Next.js Image 최적화와 KakaoPay 스타일링이 적용된 이미지 컴포넌트들을 확인해보세요.
            </p>
          </ScrollAnimation>

          <ScrollAnimation animation="scale" delay={200}>
            <HeroImage
              src="/images/1.jpg"
              alt="메인 히어로 이미지"
              className="mb-12"
            />
          </ScrollAnimation>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-6 bg-kakao-background-light">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimation animation="slide-left">
            <h2 className="text-3xl font-semibold text-kakao-dark-text mb-4">
              썸네일 갤러리
            </h2>
            <p className="text-kakao-gray-text mb-8">
              클릭하면 확대해서 볼 수 있습니다. 각 이미지는 최적화되어 빠르게 로드됩니다.
            </p>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={300}>
            <ThumbnailGallery
              onImageClick={handleImageClick}
              className="mb-12"
            />
          </ScrollAnimation>
        </div>
      </section>

      {/* Individual Image Examples */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation animation="slide-right">
            <h2 className="text-3xl font-semibold text-kakao-dark-text mb-8">
              개별 이미지 예시
            </h2>
          </ScrollAnimation>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollAnimation animation="fade-up" delay={100}>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-kakao-dark-text">
                  표준 이미지
                </h3>
                <OptimizedImage
                  src="/images/2.jpg"
                  alt="표준 이미지 예시"
                  width={400}
                  height={300}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-up" delay={200}>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-kakao-dark-text">
                  원형 이미지
                </h3>
                <OptimizedImage
                  src="/images/3.jpg"
                  alt="원형 이미지 예시"
                  width={300}
                  height={300}
                  className="rounded-full shadow-lg mx-auto"
                />
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Loading States Demo */}
      <section className="py-20 px-6 bg-kakao-background-light">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation animation="scale">
            <h2 className="text-3xl font-semibold text-kakao-dark-text mb-8">
              로딩 상태 데모
            </h2>
          </ScrollAnimation>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollAnimation animation="fade-up" delay={100}>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <h3 className="text-lg font-semibold text-kakao-dark-text mb-4">
                  Small Spinner
                </h3>
                <LoadingSpinner size="sm" />
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-up" delay={200}>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <h3 className="text-lg font-semibold text-kakao-dark-text mb-4">
                  Medium Spinner
                </h3>
                <LoadingSpinner size="md" />
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-up" delay={300}>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <h3 className="text-lg font-semibold text-kakao-dark-text mb-4">
                  Large Spinner
                </h3>
                <LoadingSpinner size="lg" />
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={handleCloseModal}
              className="absolute -top-12 right-0 text-white text-xl font-semibold hover:text-kakao-yellow transition-colors"
            >
              ✕ 닫기
            </button>
            <OptimizedImage
              src={selectedImage}
              alt="확대된 이미지"
              width={800}
              height={600}
              className="rounded-lg shadow-2xl"
              quality={95}
            />
          </div>
        </div>
      )}
    </div>
  )
}