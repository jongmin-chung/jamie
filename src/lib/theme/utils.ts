/**
 * KakaoPay Theme Utilities
 * Helper functions for consistent styling across components
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get KakaoPay typography classes based on element type
 */
export const getTypographyClasses = (element: 'h1' | 'h2' | 'paragraph' | 'strong') => {
  const styles = {
    h1: 'text-[52px] font-bold leading-[70px] text-white mb-6 font-noto-sans-kr',
    h2: 'text-[32px] font-semibold leading-[44px] text-kakao-dark-text font-noto-sans-kr',
    paragraph: 'text-lg font-normal leading-7 text-kakao-text-white-48 font-noto-sans-kr',
    strong: 'text-lg font-medium text-kakao-text-dark-48 font-noto-sans-kr',
  };
  
  return styles[element];
};

/**
 * Get KakaoPay spacing utilities
 */
export const spacing = {
  base: 'p-6', // 24px base spacing
  container: 'max-w-[1200px] mx-auto px-6',
  headerHeight: 'h-21', // 84px
  section: 'py-12', // section spacing
} as const;

/**
 * Get KakaoPay color utilities
 */
export const colors = {
  primary: 'bg-kakao-yellow text-kakao-dark-text',
  darkBg: 'bg-kakao-dark-text text-white',
  lightBg: 'bg-white text-kakao-dark-text',
  transparent: 'bg-transparent',
  heroSection: 'bg-kakao-dark-text text-white',
} as const;

/**
 * Get KakaoPay button styles
 */
export const getButtonClasses = (variant: 'primary' | 'secondary') => {
  const styles = {
    primary: 'bg-transparent text-white border-none rounded-none text-[13.33px] font-normal px-[6px] py-[1px]',
    secondary: 'bg-transparent text-kakao-dark-text border-none rounded-none',
  };
  
  return styles[variant];
};

/**
 * Get KakaoPay card styles
 */
export const getCardClasses = (type: 'article' | 'featured' | 'standard') => {
  const baseClasses = 'bg-transparent p-0 m-0 rounded-none shadow-none border-none';
  
  const typeClasses = {
    article: baseClasses,
    featured: `${baseClasses} hover:opacity-75 transition-opacity`,
    standard: `${baseClasses} hover:opacity-90 transition-opacity`,
  };
  
  return typeClasses[type];
};

/**
 * Get layout container classes
 */
export const getContainerClasses = (variant: 'default' | 'hero' | 'content') => {
  const styles = {
    default: 'max-w-[1200px] mx-auto px-6',
    hero: 'max-w-[1200px] mx-auto px-6 py-12',
    content: 'max-w-[1200px] mx-auto px-6 py-8',
  };
  
  return styles[variant];
};

/**
 * Get grid layout classes based on content type
 */
export const getGridClasses = (layout: 'horizontal-scroll' | 'grid') => {
  const styles = {
    'horizontal-scroll': 'flex overflow-x-auto gap-6 pb-4 scrollbar-hide',
    'grid': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  };
  
  return styles[layout];
};

/**
 * Get navigation styles
 */
export const navigation = {
  header: 'fixed top-0 left-0 right-0 h-21 bg-transparent z-50 px-6 py-0',
  item: 'text-white hover:text-kakao-yellow transition-colors font-noto-sans-kr',
  logo: 'h-8 w-auto',
} as const;

/**
 * Generate responsive text sizes
 */
export const getResponsiveText = (desktop: string, mobile?: string) => {
  return mobile ? `text-${mobile} md:text-${desktop}` : `text-${desktop}`;
};

/**
 * Get KakaoPay footer styles
 */
export const footer = {
  container: 'bg-kakao-light-gray py-12 mt-16',
  content: 'max-w-[1200px] mx-auto px-6',
  copyright: 'text-kakao-text-dark-48 text-sm font-noto-sans-kr',
  link: 'text-kakao-dark-text hover:text-kakao-yellow transition-colors font-noto-sans-kr',
} as const;