// Client-side content utilities that work with pre-generated data

export async function getPostsMetadata() {
  try {
    const response = await fetch('/posts-metadata.json')
    if (!response.ok) throw new Error('Failed to fetch posts metadata')
    return await response.json()
  } catch (error) {
    console.error('Error loading posts metadata:', error)
    return []
  }
}

export async function getSearchIndex() {
  try {
    const response = await fetch('/search-index.json')
    if (!response.ok) throw new Error('Failed to fetch search index')
    return await response.json()
  } catch (error) {
    console.error('Error loading search index:', error)
    return []
  }
}

export async function getCategories() {
  try {
    const response = await fetch('/categories.json')
    if (!response.ok) throw new Error('Failed to fetch categories')
    return await response.json()
  } catch (error) {
    console.error('Error loading categories:', error)
    return []
  }
}

export async function getTags() {
  try {
    const response = await fetch('/tags.json')
    if (!response.ok) throw new Error('Failed to fetch tags')
    return await response.json()
  } catch (error) {
    console.error('Error loading tags:', error)
    return []
  }
}

export async function getSiteStats() {
  try {
    const response = await fetch('/site-stats.json')
    if (!response.ok) throw new Error('Failed to fetch site stats')
    return await response.json()
  } catch (error) {
    console.error('Error loading site stats:', error)
    return {
      totalPosts: 0,
      totalCategories: 0,
      totalTags: 0,
      averageReadingTime: 0,
      lastUpdated: new Date().toISOString(),
      searchIndexSize: 0
    }
  }
}