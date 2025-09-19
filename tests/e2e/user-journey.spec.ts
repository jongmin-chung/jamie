import { expect, test } from '@playwright/test'

test.describe('Complete User Journey E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete full user journey from homepage to blog post', async ({
    page,
  }) => {
    // Step 1: Homepage loads correctly
    await expect(page.locator('h1')).toContainText('기술 블로그')
    await expect(page).toHaveTitle(/카카오페이|기술 블로그/)

    // Step 2: Search functionality works
    const searchInput = page.getByPlaceholder(/검색/)
    await expect(searchInput).toBeVisible()

    await searchInput.fill('React')
    await page.waitForTimeout(500) // Wait for debounced search

    // Should see search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
    await expect(page.locator('text=React')).toBeVisible()

    // Step 3: Clear search and browse posts
    await searchInput.fill('')
    await page.waitForTimeout(300)

    // Step 4: Click on a blog post from the homepage
    const firstBlogPost = page.locator('.blog-card').first()
    await expect(firstBlogPost).toBeVisible()

    const postTitle = await firstBlogPost.locator('h3').textContent()
    expect(postTitle).toBeTruthy()

    await firstBlogPost.click()

    // Step 5: Verify blog post page loads
    await expect(page).toHaveURL(/\/blog\/.+/)
    await expect(page.locator('h1')).toContainText(postTitle!)

    // Step 6: Verify post content elements
    await expect(page.locator('article')).toBeVisible()
    await expect(page.locator('.post-content')).toBeVisible()
    await expect(page.locator('.post-meta')).toBeVisible()

    // Step 7: Verify Korean content is displayed properly
    const koreanTextPattern = /[ㄱ-ㅎㅏ-ㅣ가-힣]/
    const articleText = await page.locator('article').textContent()
    expect(koreanTextPattern.test(articleText!)).toBe(true)

    // Step 8: Verify table of contents works (if present)
    const tocExists =
      (await page.locator('[data-testid="table-of-contents"]').count()) > 0
    if (tocExists) {
      const tocLink = page
        .locator('[data-testid="table-of-contents"] a')
        .first()
      await tocLink.click()

      // Should scroll to the corresponding section
      await page.waitForTimeout(500)
    }

    // Step 9: Navigate back to blog listing
    await page
      .getByRole('link', { name: /블로그|목록|뒤로/ })
      .first()
      .click()

    // Step 10: Verify we're back on a listing page
    await expect(page).toHaveURL(/\/blog$|\/$/)
    await expect(page.locator('.blog-card')).toHaveCount({ min: 1 })
  })

  test('should handle category filtering user journey', async ({ page }) => {
    // Step 1: Go to blog listing page
    await page.goto('/blog')

    // Step 2: Verify categories are displayed
    const categoryFilter = page.locator('[data-testid="category-filter"]')
    if ((await categoryFilter.count()) > 0) {
      await expect(categoryFilter).toBeVisible()

      // Step 3: Click on a category
      const categoryButton = categoryFilter.locator('button').first()
      const categoryName = await categoryButton.textContent()
      await categoryButton.click()

      // Step 4: Verify filtered results
      await page.waitForTimeout(500)
      const blogCards = page.locator('.blog-card')
      const cardCount = await blogCards.count()
      expect(cardCount).toBeGreaterThan(0)

      // Step 5: Verify all displayed posts belong to selected category
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        const card = blogCards.nth(i)
        await expect(card.locator('.category')).toContainText(categoryName!)
      }

      // Step 6: Clear filter
      const clearFilter = page.getByRole('button', { name: /전체|모두/ })
      if ((await clearFilter.count()) > 0) {
        await clearFilter.click()
        await page.waitForTimeout(500)

        // Should show more posts now
        const newCardCount = await page.locator('.blog-card').count()
        expect(newCardCount).toBeGreaterThanOrEqual(cardCount)
      }
    }
  })

  test('should handle mobile navigation user journey', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Step 1: Verify mobile layout loads
    await expect(page.locator('header')).toBeVisible()

    // Step 2: Check if mobile menu exists and works
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]')
    if ((await mobileMenuButton.count()) > 0) {
      await mobileMenuButton.click()

      // Step 3: Verify mobile menu opens
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

      // Step 4: Navigate using mobile menu
      const menuLink = page.locator('[data-testid="mobile-menu"] a').first()
      await menuLink.click()

      // Step 5: Verify navigation worked
      await page.waitForTimeout(500)
      await expect(
        page.locator('[data-testid="mobile-menu"]')
      ).not.toBeVisible()
    }

    // Step 6: Verify search works on mobile
    const mobileSearchInput = page.getByPlaceholder(/검색/)
    await expect(mobileSearchInput).toBeVisible()

    await mobileSearchInput.fill('TypeScript')
    await page.waitForTimeout(500)

    // Should see mobile search results
    const searchResults = page.locator('[data-testid="search-results"]')
    if ((await searchResults.count()) > 0) {
      await expect(searchResults).toBeVisible()

      // Select a result on mobile
      const firstResult = searchResults.locator('a').first()
      await firstResult.click()

      // Should navigate to post
      await expect(page).toHaveURL(/\/blog\/.+/)
    }
  })

  test('should handle error scenarios gracefully', async ({ page }) => {
    // Step 1: Test 404 page
    await page.goto('/blog/non-existent-post')

    // Should show 404 page with Korean content
    await expect(page.locator('h1')).toContainText(
      /404|찾을 수 없습니다|페이지가 없습니다/
    )

    // Should have navigation back to homepage
    const homeLink = page.getByRole('link', { name: /홈|메인|돌아가기/ })
    if ((await homeLink.count()) > 0) {
      await homeLink.click()
      await expect(page).toHaveURL('/')
    }

    // Step 2: Test search with no results
    await page.goto('/')
    const searchInput = page.getByPlaceholder(/검색/)
    await searchInput.fill('xyz-no-results-query-123')
    await page.waitForTimeout(500)

    // Should show no results message in Korean
    await expect(
      page.locator('text=/검색 결과가 없습니다|결과가 없습니다/')
    ).toBeVisible()
  })

  test('should maintain performance standards during user journey', async ({
    page,
  }) => {
    // Step 1: Measure homepage load time
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const homeLoadTime = Date.now() - startTime

    // Homepage should load within 2 seconds
    expect(homeLoadTime).toBeLessThan(2000)

    // Step 2: Measure blog post navigation time
    const blogPostStart = Date.now()
    await page.locator('.blog-card').first().click()
    await page.waitForLoadState('networkidle')
    const blogPostLoadTime = Date.now() - blogPostStart

    // Blog post should load within 2 seconds
    expect(blogPostLoadTime).toBeLessThan(2000)

    // Step 3: Test search responsiveness
    await page.goto('/')
    const searchStart = Date.now()
    await page.getByPlaceholder(/검색/).fill('React')

    // Wait for search results
    await page
      .locator('[data-testid="search-results"]')
      .waitFor({ timeout: 1000 })
    const searchTime = Date.now() - searchStart

    // Search should respond within 500ms
    expect(searchTime).toBeLessThan(500)
  })

  test('should provide accessible user experience', async ({ page }) => {
    // Step 1: Test keyboard navigation
    await page.keyboard.press('Tab') // Focus first element
    await page.keyboard.press('Tab') // Move to search

    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toHaveAttribute('placeholder', /검색/)

    // Step 2: Test search with keyboard
    await page.keyboard.type('React')
    await page.waitForTimeout(500)

    // Step 3: Navigate search results with keyboard
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // Should navigate to selected post
    await expect(page).toHaveURL(/\/blog\/.+/)

    // Step 4: Test skip links (if implemented)
    await page.goto('/')
    await page.keyboard.press('Tab')

    const skipLink = page.locator('[href="#main-content"]')
    if ((await skipLink.count()) > 0) {
      await expect(skipLink).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(page.locator('#main-content')).toBeFocused()
    }
  })
})
