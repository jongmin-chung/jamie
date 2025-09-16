'use client'

import React from 'react'
import { footer } from '@/lib/theme/utils'
import { kakaoPayTheme } from '@/lib/theme/kakaopay-theme'

export default function Footer() {
  const footerData = kakaoPayTheme.components.footer

  return (
    <footer className={footer.container}>
      <div className={footer.content}>
        <div className="flex flex-col items-center space-y-6">
          {/* Copyright */}
          <p className={footer.copyright}>
            {footerData.copyright}
          </p>
          
          {/* Footer Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {footerData.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className={footer.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
