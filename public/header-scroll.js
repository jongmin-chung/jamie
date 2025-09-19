// Header scroll effect script - KakaoPay style
;(function () {
  'use strict'

  function updateHeaderOnScroll() {
    const scrollY = window.scrollY
    const threshold = 50
    const maxScroll = 150

    // Calculate opacity
    const opacity = Math.min(
      Math.max((scrollY - threshold) / (maxScroll - threshold), 0),
      1
    )
    const isScrolled = scrollY > threshold

    // Find header and update styles
    const header = document.getElementById('main-header')
    if (header) {
      header.style.backgroundColor = `rgba(16, 20, 24, ${opacity})`
      header.style.backdropFilter =
        isScrolled && opacity > 0.3 ? 'blur(10px)' : 'none'
      header.style.boxShadow =
        isScrolled && opacity > 0.5 ? '0 2px 20px rgba(0, 0, 0, 0.1)' : 'none'
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      // Initial call
      updateHeaderOnScroll()

      // Add scroll listener
      window.addEventListener('scroll', updateHeaderOnScroll, { passive: true })
    })
  } else {
    // DOM already ready
    updateHeaderOnScroll()
    window.addEventListener('scroll', updateHeaderOnScroll, { passive: true })
  }
})()
