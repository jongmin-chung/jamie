import {
  Code,
  Globe,
  Lock,
  LucideIcon,
  Palette,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'

export type CardTheme =
  | 'purple'
  | 'teal'
  | 'lavender'
  | 'orange'
  | 'blue'
  | 'green'
  | 'pink'
  | 'cyan'

export interface CardThemeConfig {
  light: string
  medium: string
  dark: string
  accent: string
  icon: LucideIcon
}

export const cardThemes: Record<CardTheme, CardThemeConfig> = {
  purple: {
    light: '#F3F0FF',
    medium: '#E0D4FF',
    dark: '#7C3AED',
    accent: '#A855F7',
    icon: Code,
  },
  teal: {
    light: '#F0FDFA',
    medium: '#CCFBF1',
    dark: '#0F766E',
    accent: '#14B8A6',
    icon: Palette,
  },
  lavender: {
    light: '#FAF5FF',
    medium: '#E9D5FF',
    dark: '#7E22CE',
    accent: '#A855F7',
    icon: Zap,
  },
  orange: {
    light: '#FFF7ED',
    medium: '#FFEDD5',
    dark: '#C2410C',
    accent: '#EA580C',
    icon: Globe,
  },
  blue: {
    light: '#EFF6FF',
    medium: '#DBEAFE',
    dark: '#1D4ED8',
    accent: '#2563EB',
    icon: Lock,
  },
  green: {
    light: '#F0FDF4',
    medium: '#DCFCE7',
    dark: '#166534',
    accent: '#16A34A',
    icon: Users,
  },
  pink: {
    light: '#FDF2F8',
    medium: '#FCE7F3',
    dark: '#BE185D',
    accent: '#EC4899',
    icon: Wrench,
  },
  cyan: {
    light: '#ECFEFF',
    medium: '#CFFAFE',
    dark: '#0E7490',
    accent: '#0891B2',
    icon: TrendingUp,
  },
}

// 카테고리/태그별 아이콘 매핑
export const categoryIconMap: Record<string, LucideIcon> = {
  frontend: Code,
  backend: Wrench,
  devops: Zap,
  deployment: Globe,
  security: Lock,
  design: Palette,
  performance: TrendingUp,
  team: Users,
  default: Code,
}

// 포스트 인덱스를 기반으로 테마 자동 할당
export function getCardTheme(index: number): CardTheme {
  const themes: CardTheme[] = [
    'purple',
    'teal',
    'lavender',
    'orange',
    'blue',
    'green',
    'pink',
    'cyan',
  ]
  return themes[index % themes.length]
}

// 카테고리를 기반으로 테마 할당
export function getCardThemeByCategory(category?: string): CardTheme {
  const categoryThemeMap: Record<string, CardTheme> = {
    frontend: 'purple',
    backend: 'orange',
    devops: 'teal',
    deployment: 'blue',
    security: 'cyan',
    design: 'pink',
    performance: 'green',
    team: 'lavender',
  }

  return categoryThemeMap[category?.toLowerCase() || ''] || 'purple'
}

// 카테고리를 기반으로 아이콘 가져오기
export function getCategoryIcon(category?: string): LucideIcon {
  return (
    categoryIconMap[category?.toLowerCase() || ''] || categoryIconMap.default
  )
}
