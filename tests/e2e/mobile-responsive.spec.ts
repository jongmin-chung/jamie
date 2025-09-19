import { devices, expect, test } from '@playwright/test'

test.describe('Mobile Responsiveness E2E Tests', () => {
  const mobileViewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    { name: 'iPad Mini', width: 768, height: 1024 },
  ]

  mobileViewports.forEach(({ name, width, height }) => {
    test(`should display correctly on ${name} (${width}x${height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')

      // Homepage should be responsive
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('main')).toBeVisible()

      // Text should be readable (not too small)
      const headingText = page.locator('h1').first()
      await expect(headingText).toBeVisible()

      // Blog cards should stack properly on mobile
      const blogCards = page.locator('.blog-card')
      const cardCount = await blogCards.count()

      if (cardCount > 0) {
        // Check that cards are properly sized for mobile
        const firstCard = blogCards.first()
        const cardBox = await firstCard.boundingBox()

        expect(cardBox!.width).toBeGreaterThan(width * 0.8) // Should use most of screen width
        expect(cardBox!.width).toBeLessThan(width) // But not overflow
      }

      // Navigation should be mobile-friendly
      const navigation = page.locator('nav')
      await expect(navigation).toBeVisible()
    })
  })

  test('should have mobile-optimized touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Search input should be large enough for touch
    const searchInput = page.getByPlaceholder(/검색/)
    const searchBox = await searchInput.boundingBox()
    expect(searchBox!.height).toBeGreaterThanOrEqual(44) // iOS minimum touch target

    // Blog post links should be touch-friendly
    const firstBlogCard = page.locator('.blog-card').first()
    const cardBox = await firstBlogCard.boundingBox()
    expect(cardBox!.height).toBeGreaterThanOrEqual(44)

    // Buttons should meet touch target guidelines
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        const buttonBox = await button.boundingBox()
        expect(buttonBox!.height).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('should handle mobile search interaction', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Mobile search should be accessible
    const searchInput = page.getByPlaceholder(/검색/)
    await expect(searchInput).toBeVisible()

    // Tap search input
    await searchInput.tap()

    // Type search query
    await searchInput.fill('React')
    await page.waitForTimeout(500)

    // Search results should be mobile-optimized
    const searchResults = page.locator('[data-testid="search-results"]')
    if ((await searchResults.count()) > 0) {
      await expect(searchResults).toBeVisible()

      // Results should not overflow
      const resultsBox = await searchResults.boundingBox()
      expect(resultsBox!.width).toBeLessThanOrEqual(375)

      // Tap on a search result
      const firstResult = searchResults.locator('a').first()
      await firstResult.tap()

      // Should navigate properly
      await expect(page).toHaveURL(/\/blog\/.+/)
    }
  })

  test('should display blog post content properly on mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to a blog post
    await page.goto('/')
    await page.locator('.blog-card').first().click()
    await expect(page).toHaveURL(/\/blog\/.+/)

    // Post title should be readable on mobile
    const postTitle = page.locator('h1')
    await expect(postTitle).toBeVisible()

    const titleBox = await postTitle.boundingBox()
    expect(titleBox!.width).toBeLessThanOrEqual(375)

    // Content should be properly formatted for mobile
    const postContent = page.locator('.post-content, article')
    await expect(postContent).toBeVisible()

    const contentBox = await postContent.boundingBox()
    expect(contentBox!.width).toBeLessThanOrEqual(375)

    // Images should be responsive (if any)
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      if (await img.isVisible()) {
        const imgBox = await img.boundingBox()
        expect(imgBox!.width).toBeLessThanOrEqual(375)
      }
    }

    // Code blocks should be scrollable on mobile
    const codeBlocks = page.locator('pre, code')
    const codeCount = await codeBlocks.count()

    if (codeCount > 0) {
      const codeBlock = codeBlocks.first()
      await expect(codeBlock).toBeVisible()

      // Code should not break layout
      const codeBox = await codeBlock.boundingBox()
      expect(codeBox!.width).toBeLessThanOrEqual(375)
    }
  })

  test('should handle mobile table of contents', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.locator('.blog-card').first().click()

    // Mobile TOC should be collapsible or hidden by default
    const mobileTOC = page.locator('[data-testid="mobile-table-of-contents"]')
    const desktopTOC = page.locator(
      '[data-testid="table-of-contents"]:not([data-testid="mobile-table-of-contents"])'
    )

    if ((await mobileTOC.count()) > 0) {
      // Mobile TOC should be visible
      await expect(mobileTOC).toBeVisible()

      // Should have toggle functionality
      const toggleButton = mobileTOC.locator('button').first()
      if ((await toggleButton.count()) > 0) {
        await toggleButton.tap()

        // TOC items should appear/disappear
        await page.waitForTimeout(300)
        const tocItems = mobileTOC.locator('a')

        if ((await tocItems.count()) > 0) {
          // Tap on a TOC item
          await tocItems.first().tap()
          await page.waitForTimeout(500)

          // Should scroll to the section
        }
      }
    }

    // Desktop TOC should be hidden on mobile
    if ((await desktopTOC.count()) > 0) {
      await expect(desktopTOC).not.toBeVisible()
    }
  })

  test('should have proper mobile font sizes and spacing', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Main heading should be appropriately sized for mobile
    const mainHeading = page.locator('h1').first()
    const headingStyles = await mainHeading.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        marginBottom: styles.marginBottom,
      }
    })

    // Font size should be readable on mobile (at least 16px)
    const fontSize = parseInt(headingStyles.fontSize)
    expect(fontSize).toBeGreaterThanOrEqual(20)

    // Body text should be readable
    const bodyText = page.locator('p').first()
    if ((await bodyText.count()) > 0) {
      const bodyStyles = await bodyText.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return {
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
        }
      })

      const bodyFontSize = parseInt(bodyStyles.fontSize)
      expect(bodyFontSize).toBeGreaterThanOrEqual(14)
    }
  })

  test('should handle mobile gestures and interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Test scroll behavior
    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(500)

    // Page should scroll smoothly
    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(400)

    // Test swipe gestures (if implemented)
    const swipeArea = page.locator('main')
    const swipeBox = await swipeArea.boundingBox()

    // Simulate swipe gesture
    await page.mouse.move(
      swipeBox!.x + swipeBox!.width / 2,
      swipeBox!.y + swipeBox!.height / 2
    )
    await page.mouse.down()
    await page.mouse.move(swipeBox!.x + 50, swipeBox!.y + swipeBox!.height / 2)
    await page.mouse.up()

    // Should handle gesture without errors
    await page.waitForTimeout(300)
  })

  test('should maintain accessibility on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // All interactive elements should be accessible via touch
    const links = page.locator('a')
    const linkCount = await links.count()

    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = links.nth(i)
      if (await link.isVisible()) {
        // Link should have accessible name
        const accessibleName =
          (await link.getAttribute('aria-label')) || (await link.textContent())
        expect(accessibleName).toBeTruthy()

        // Should be tappable
        const linkBox = await link.boundingBox()
        expect(linkBox!.height).toBeGreaterThanOrEqual(24)
      }
    }

    // Focus indicators should work with keyboard on mobile devices
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    if ((await focusedElement.count()) > 0) {
      await expect(focusedElement).toBeVisible()
    }
  })

  test('should display Korean text properly on mobile devices', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Korean text should not be corrupted on mobile
    const koreanTextElements = page
      .locator('h1, h2, h3, p, a')
      .filter({ hasText: /[ㄱ-ㅎㅏ-ㅣ가-힣]/ })
    const koreanCount = await koreanTextElements.count()

    if (koreanCount > 0) {
      for (let i = 0; i < Math.min(koreanCount, 3); i++) {
        const element = koreanTextElements.nth(i)
        const text = await element.textContent()

        // Should not have corrupted characters
        expect(text).not.toMatch(/[?��]/)

        // Korean text should wrap properly
        const elementBox = await element.boundingBox()
        expect(elementBox!.width).toBeLessThanOrEqual(375)
      }
    }
  })

  test('should handle orientation changes', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Verify layout in portrait
    const headerPortrait = await page.locator('header').boundingBox()
    expect(headerPortrait!.width).toBeCloseTo(375, 10)

    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 })
    await page.waitForTimeout(500)

    // Layout should adapt to landscape
    const headerLandscape = await page.locator('header').boundingBox()
    expect(headerLandscape!.width).toBeCloseTo(667, 10)

    // Content should still be accessible
    await expect(page.locator('main')).toBeVisible()
    const searchInput = page.getByPlaceholder(/검색/)
    await expect(searchInput).toBeVisible()
  })
})
