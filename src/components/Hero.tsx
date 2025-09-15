'use client';

import React from 'react';
import { getContainerClasses, getTypographyClasses, colors, cn } from '@/lib/theme/utils';
import { kakaoPayTheme } from '@/lib/theme/kakaopay-theme';

interface HeroProps {
  title?: string;
  subtitle?: string;
}

export function Hero({ 
  title = kakaoPayTheme.components.hero.title,
  subtitle = kakaoPayTheme.components.hero.subtitle 
}: HeroProps) {
  return (
    <section className={cn(colors.heroSection, 'py-20 lg:py-32')}>
      <div className={getContainerClasses('hero')}>
        <div className="text-center">
          <h1 className={getTypographyClasses('h1')}>
            {title}
          </h1>
          <p className={cn(getTypographyClasses('paragraph'), 'max-w-3xl mx-auto')}>
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}