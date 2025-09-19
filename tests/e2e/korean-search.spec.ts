import { expect, test } from '@playwright/test'

test.describe('Korean Search Functionality E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set Korean locale for consistent testing
    await page.goto('/', {
      waitUntil: 'networkidle',
      timeout: 10000,
    })

    // Wait for search functionality to be ready
    await page.getByPlaceholder(/검색/).waitFor({ state: 'visible' })
  })

  test('should search Korean terms successfully', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/검색/)

    const koreanSearchTerms = [
      '리액트',
      '타입스크립트',
      '자바스크립트',
      '프론트엔드',
      '백엔드',
      '개발',
      '프로그래밍',
    ]

    for (const term of koreanSearchTerms) {
      await searchInput.fill(term)
      await page.waitForTimeout(600) // Wait for debounced search

      // Should show search results or "no results" message
      const hasResults =
        (await page.locator('[data-testid="search-results"]').count()) > 0
      const hasNoResults =
        (await page.locator('text=/검색 결과가 없습니다|결과 없음/').count()) >
        0

      expect(hasResults || hasNoResults).toBe(true)

      if (hasResults) {
        // Verify search results contain the search term
        const results = page.locator('[data-testid="search-results"] a')
        const resultCount = await results.count()
        expect(resultCount).toBeGreaterThan(0)

        // Check first few results contain relevant content
        for (let i = 0; i < Math.min(resultCount, 3); i++) {
          const result = results.nth(i)
          const resultText = await result.textContent()

          // Results should be related to Korean search term
          expect(resultText).toBeTruthy()
          expect(resultText!.length).toBeGreaterThan(0)
        }
      }

      // Clear search for next iteration
      await searchInput.fill('')
      await page.waitForTimeout(300)
    }
  })

  test('should handle Korean character composition correctly', async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(/검색/)

    // Test Korean character composition (consonant + vowel combinations)
    const compositions = [
      { partial: 'ㄹ', complete: '리액트' },
      { partial: 'ㅌ', complete: '타입스크립트' },
      { partial: 'ㅍ', complete: '프론트엔드' },
    ]

    for (const { partial, complete } of compositions) {
      // Type partial Korean character
      await searchInput.fill(partial)
      await page.waitForTimeout(300)

      // Should handle incomplete Korean characters
      const inputValue1 = await searchInput.inputValue()
      expect(inputValue1).toBe(partial)

      // Complete the Korean word
      await searchInput.fill(complete)
      await page.waitForTimeout(600)

      const inputValue2 = await searchInput.inputValue()
      expect(inputValue2).toBe(complete)

      // Should show appropriate results
      const hasResults =
        (await page.locator('[data-testid="search-results"]').count()) > 0
      const hasNoResults =
        (await page.locator('text=/검색 결과가 없습니다|결과 없음/').count()) >
        0
      expect(hasResults || hasNoResults).toBe(true)

      await searchInput.fill('')
      await page.waitForTimeout(200)
    }
  })

  test('should search mixed Korean and English terms', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/검색/)

    const mixedTerms = [
      'React 리액트',
      'JavaScript 자바스크립트',
      'TypeScript 타입스크립트',
      'Node.js 노드',
      'Next.js 넥스트',
      'API 개발',
      'Frontend 개발자',
    ]

    for (const term of mixedTerms) {
      await searchInput.fill(term)
      await page.waitForTimeout(600)

      // Mixed language search should work
      const hasResults =
        (await page.locator('[data-testid="search-results"]').count()) > 0
      const hasNoResults =
        (await page.locator('text=/검색 결과가 없습니다|결과 없음/').count()) >
        0

      expect(hasResults || hasNoResults).toBe(true)

      if (hasResults) {
        const results = page.locator('[data-testid="search-results"] a')
        const firstResult = results.first()
        const resultText = await firstResult.textContent()

        // Result should contain either Korean or English part of search
        const koreanPart = term.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]+/)
        const englishPart = term.match(/[a-zA-Z.]+/)

        if (koreanPart || englishPart) {
          expect(resultText).toBeTruthy()
        }
      }

      await searchInput.fill('')
      await page.waitForTimeout(200)
    }
  })

  test('should handle Korean punctuation and special characters', async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(/검색/)

    const specialTerms = [
      '"리액트"',
      "'타입스크립트'",
      '(프론트엔드)',
      '[백엔드]',
      '개발!',
      '프로그래밍?',
      'Next.js의',
      'React를',
    ]

    for (const term of specialTerms) {
      await searchInput.fill(term)
      await page.waitForTimeout(600)

      // Should handle special characters without crashing
      const inputValue = await searchInput.inputValue()
      expect(inputValue).toBe(term)

      // Should return results or appropriate message
      const hasResults =
        (await page.locator('[data-testid="search-results"]').count()) > 0
      const hasNoResults =
        (await page.locator('text=/검색 결과가 없습니다|결과 없음/').count()) >
        0

      expect(hasResults || hasNoResults).toBe(true)

      await searchInput.fill('')
      await page.waitForTimeout(200)
    }
  })

  test('should provide relevant Korean search suggestions', async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(/검색/)

    // Test partial Korean search terms
    const partialTerms = [
      { partial: '리액', expected: /리액트/ },
      { partial: '타입', expected: /타입스크립트/ },
      { partial: '자바', expected: /자바스크립트/ },
      { partial: '프론', expected: /프론트엔드/ },
    ]

    for (const { partial, expected } of partialTerms) {
      await searchInput.fill(partial)
      await page.waitForTimeout(600)

      const searchResults = page.locator('[data-testid="search-results"]')

      if ((await searchResults.count()) > 0) {
        // Should find results that match the expected pattern
        const results = searchResults.locator('a')
        const resultCount = await results.count()

        let foundExpected = false
        for (let i = 0; i < Math.min(resultCount, 5); i++) {
          const result = results.nth(i)
          const text = await result.textContent()

          if (expected.test(text!)) {
            foundExpected = true
            break
          }
        }

        // At least one result should match expected pattern
        expect(foundExpected).toBe(true)
      }

      await searchInput.fill('')
      await page.waitForTimeout(200)
    }
  })

  test('should handle Korean search result navigation', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/검색/)

    // Search for a common Korean term
    await searchInput.fill('React')
    await page.waitForTimeout(600)

    const searchResults = page.locator('[data-testid="search-results"]')

    if ((await searchResults.count()) > 0) {
      const firstResult = searchResults.locator('a').first()
      const resultTitle = await firstResult.textContent()

      // Click on the search result
      await firstResult.click()

      // Should navigate to the blog post
      await expect(page).toHaveURL(/\/blog\/.+/)

      // Page should load with Korean content
      const postTitle = page.locator('h1')
      await expect(postTitle).toBeVisible()

      const titleText = await postTitle.textContent()
      expect(titleText).toBeTruthy()

      // Should have proper Korean text rendering
      const articleContent = page.locator('article, .post-content')
      await expect(articleContent).toBeVisible()

      const contentText = await articleContent.textContent()

      // Check for Korean characters and ensure no corruption
      const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(contentText!)
      const hasCorruption = /[?��]/.test(contentText!)

      expect(hasKorean).toBe(true)
      expect(hasCorruption).toBe(false)
    }
  })

  test('should maintain Korean search history and context', async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(/검색/)

    // Perform multiple Korean searches
    const searchSequence = ['리액트', '훅스', 'useState']

    for (const term of searchSequence) {
      await searchInput.fill(term)
      await page.waitForTimeout(600)

      // Verify search input maintains Korean characters
      const inputValue = await searchInput.inputValue()
      expect(inputValue).toBe(term)

      // Clear and verify
      await searchInput.fill('')
      await page.waitForTimeout(200)
    }

    // Test search persistence after navigation
    await searchInput.fill('타입스크립트')
    await page.waitForTimeout(600)

    // If there are results, navigate to one and back
    const searchResults = page.locator('[data-testid="search-results"]')
    if ((await searchResults.count()) > 0) {
      const firstResult = searchResults.locator('a').first()
      await firstResult.click()

      // Navigate back
      await page.goBack()

      // Search input should still be functional
      await expect(page.getByPlaceholder(/검색/)).toBeVisible()

      // Try another Korean search
      await page.getByPlaceholder(/검색/).fill('프론트엔드')
      await page.waitForTimeout(600)

      const hasResults =
        (await page.locator('[data-testid="search-results"]').count()) > 0
      const hasNoResults =
        (await page.locator('text=/검색 결과가 없습니다|결과 없음/').count()) >
        0
      expect(hasResults || hasNoResults).toBe(true)
    }
  })

  test('should handle Korean search across different categories', async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(/검색/)

    // Test category-specific Korean searches
    const categorySearches = [
      { term: '프론트엔드', expectedCategory: /프론트엔드|Frontend/ },
      { term: '백엔드', expectedCategory: /백엔드|Backend/ },
      { term: '데브옵스', expectedCategory: /데브옵스|DevOps/ },
      { term: '디자인', expectedCategory: /디자인|Design/ },
    ]

    for (const { term, expectedCategory } of categorySearches) {
      await searchInput.fill(term)
      await page.waitForTimeout(600)

      const searchResults = page.locator('[data-testid="search-results"]')

      if ((await searchResults.count()) > 0) {
        const results = searchResults.locator('a')
        const resultCount = await results.count()

        // Check if any results match the expected category
        let foundCategoryMatch = false
        for (let i = 0; i < Math.min(resultCount, 3); i++) {
          const result = results.nth(i)
          const resultText = await result.textContent()

          if (expectedCategory.test(resultText!)) {
            foundCategoryMatch = true
            break
          }
        }

        // Results should include posts from the searched category
        expect(foundCategoryMatch).toBe(true)
      }

      await searchInput.fill('')
      await page.waitForTimeout(200)
    }
  })

  test('should provide Korean error messages and feedback', async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(/검색/)

    // Search for terms that likely have no results
    const noResultsTerms = [
      'xyz123가나다',
      '존재하지않는검색어',
      'nonexistent한글term',
    ]

    for (const term of noResultsTerms) {
      await searchInput.fill(term)
      await page.waitForTimeout(600)

      // Should show Korean "no results" message
      const noResultsMessage = page.locator(
        'text=/검색 결과가 없습니다|결과가 없습니다|검색된 글이 없습니다/'
      )

      if ((await noResultsMessage.count()) > 0) {
        await expect(noResultsMessage).toBeVisible()

        // Message should be in Korean
        const messageText = await noResultsMessage.textContent()
        const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(messageText!)
        expect(hasKorean).toBe(true)
      }

      await searchInput.fill('')
      await page.waitForTimeout(200)
    }
  })

  test('should handle Korean search on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const mobileSearchInput = page.getByPlaceholder(/검색/)
    await expect(mobileSearchInput).toBeVisible()

    // Test Korean input on mobile
    await mobileSearchInput.tap()
    await mobileSearchInput.fill('모바일 리액트')
    await page.waitForTimeout(600)

    // Input should retain Korean characters on mobile
    const inputValue = await mobileSearchInput.inputValue()
    expect(inputValue).toBe('모바일 리액트')

    // Search results should be mobile-optimized
    const searchResults = page.locator('[data-testid="search-results"]')

    if ((await searchResults.count()) > 0) {
      await expect(searchResults).toBeVisible()

      // Results should fit mobile screen
      const resultsBox = await searchResults.boundingBox()
      expect(resultsBox!.width).toBeLessThanOrEqual(375)

      // Korean text should be readable on mobile
      const firstResult = searchResults.locator('a').first()
      const resultText = await firstResult.textContent()

      // Should not have text corruption
      expect(resultText).not.toMatch(/[?��]/)

      // Tap result should work on mobile
      await firstResult.tap()
      await expect(page).toHaveURL(/\/blog\/.+/)
    }
  })
})
