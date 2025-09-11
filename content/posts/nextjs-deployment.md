---
title: "Next.js 프로젝트 배포 완벽 가이드"
description: "Next.js 프로젝트를 Vercel, Netlify, AWS 등 다양한 플랫폼에 배포하는 방법을 단계별로 알아봅시다."
publishedAt: "2025-09-08"
category: "deployment"
tags: ["nextjs", "deployment", "vercel", "netlify"]
author: "이배포"
---

# Next.js 프로젝트 배포 완벽 가이드

Next.js 프로젝트를 완성했다면 이제 전 세계 사용자들이 접근할 수 있도록 배포해야 합니다. 이 글에서는 여러 플랫폼에서의 배포 방법을 알아보겠습니다.

## 배포 전 준비사항

### 1. 프로덕션 빌드 확인
```bash
npm run build
npm run start
```

로컬에서 프로덕션 빌드가 정상적으로 작동하는지 확인합니다.

### 2. 환경 변수 설정
```bash
# .env.local (로컬 개발용)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=your-local-db-url

# .env.production (프로덕션용)
NEXT_PUBLIC_API_URL=https://your-domain.com/api
DATABASE_URL=your-production-db-url
```

## Vercel로 배포하기

Vercel은 Next.js를 만든 회사에서 제공하는 배포 플랫폼입니다.

### 1. CLI를 통한 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 프로덕션 배포
vercel --prod
```

### 2. GitHub 연동 배포
1. [vercel.com](https://vercel.com)에서 회원가입
2. "Import Git Repository" 클릭
3. GitHub 저장소 선택
4. 자동 배포 설정 완료

```json
// vercel.json (선택사항)
{
  "builds": [
    { "src": "next.config.js", "use": "@vercel/next" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/" }
  ]
}
```

## Netlify로 배포하기

### 1. 정적 내보내기 설정
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### 2. 빌드 명령어 설정
```bash
# package.json에 스크립트 추가
{
  "scripts": {
    "build": "next build",
    "export": "next export"
  }
}
```

### 3. Netlify 배포
1. `npm run build && npm run export` 실행
2. `out` 폴더를 Netlify에 드래그 앤 드롭
3. 또는 GitHub 저장소 연동

```toml
# netlify.toml
[build]
  publish = "out"
  command = "npm run build && npm run export"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## AWS S3 + CloudFront로 배포하기

### 1. S3 버킷 생성 및 설정
```bash
# AWS CLI 설치 및 구성
aws configure

# S3 버킷 생성
aws s3 mb s3://your-bucket-name

# 정적 웹사이트 호스팅 활성화
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document 404.html
```

### 2. 빌드 파일 업로드
```bash
# 빌드 실행
npm run build && npm run export

# S3에 업로드
aws s3 sync out/ s3://your-bucket-name --delete
```

### 3. CloudFront 배포 설정
```json
{
  "DistributionConfig": {
    "CallerReference": "my-nextjs-app",
    "Origins": [
      {
        "Id": "S3-your-bucket-name",
        "DomainName": "your-bucket-name.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ],
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-your-bucket-name",
      "ViewerProtocolPolicy": "redirect-to-https"
    }
  }
}
```

## Docker를 사용한 배포

### 1. Dockerfile 작성
```dockerfile
FROM node:18-alpine AS base

# 의존성 설치
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# 소스코드와 함께 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 프로덕션 이미지
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Docker Compose 설정
```yaml
# docker-compose.yml
version: '3.8'
services:
  nextjs-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    restart: unless-stopped
```

## 성능 최적화

### 1. 이미지 최적화
```javascript
// next.config.js
const nextConfig = {
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  }
}
```

### 2. 캐싱 설정
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}
```

## 모니터링 및 분석

### 1. Vercel Analytics
```bash
npm install @vercel/analytics

# _app.js에 추가
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

### 2. Web Vitals 모니터링
```javascript
// pages/_app.js
export function reportWebVitals(metric) {
  console.log(metric)
  
  // Google Analytics로 전송
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.value),
    non_interaction: true,
  })
}
```

## 트러블슈팅

### 자주 발생하는 문제들

1. **빌드 오류**: 타입 에러나 린트 오류 확인
2. **환경 변수**: 플랫폼별 환경 변수 설정 확인
3. **라우팅 문제**: SPA 라우팅을 위한 리다이렉트 설정
4. **이미지 로딩 실패**: 이미지 도메인 허용 목록 확인

## 마무리

Next.js는 다양한 배포 옵션을 제공하므로 프로젝트 요구사항에 맞는 플랫폼을 선택할 수 있습니다. Vercel은 가장 간단하지만, 특별한 요구사항이 있다면 AWS나 Docker를 고려해보세요.

배포 후에는 모니터링과 성능 최적화를 통해 사용자 경험을 지속적으로 개선하는 것이 중요합니다.