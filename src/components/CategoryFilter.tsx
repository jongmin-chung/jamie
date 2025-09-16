'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CATEGORIES, CATEGORY_COLORS } from '@/types/content'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  currentCategory?: string;
  categoryCounts?: Record<string, number>;
  className?: string;
}

export function CategoryFilter({ 
  currentCategory, 
  categoryCounts = {},
  className 
}: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (category: string | null) => {
    const params = new URLSearchParams(searchParams)
    
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    
    // Reset to first page when filtering
    params.delete('page')
    
    const queryString = params.toString()
    const newPath = queryString ? `/blog?${queryString}` : '/blog'
    router.push(newPath)
  }

  const categories = Object.entries(CATEGORIES)

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-foreground">카테고리</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* All Categories Button */}
        <Button
          variant={!currentCategory ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleCategoryChange(null)}
          className={cn(
            'flex items-center space-x-2 transition-all duration-200',
            !currentCategory && 'bg-primary text-primary-foreground'
          )}
        >
          <span>전체</span>
          {!currentCategory && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)}
            </Badge>
          )}
        </Button>

        {/* Individual Category Buttons */}
        {categories.map(([categoryId, categoryName]) => {
          const count = categoryCounts[categoryId] || 0
          const isActive = currentCategory === categoryId
          const color = CATEGORY_COLORS[categoryId] || '#6B7280'

          return (
            <Button
              key={categoryId}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(categoryId)}
              className={cn(
                'flex items-center space-x-2 transition-all duration-200',
                isActive && 'text-primary-foreground',
                !isActive && 'hover:border-opacity-60'
              )}
              style={isActive ? { 
                backgroundColor: color,
                borderColor: color,
                color: 'white'
              } : {}}
            >
              <span>{categoryName}</span>
              {count > 0 && (
                <Badge 
                  variant={isActive ? "secondary" : "outline"} 
                  className="ml-1 text-xs"
                >
                  {count}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {/* Active Filter Display */}
      {currentCategory && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>현재 필터:</span>
          <Badge 
            variant="outline" 
            className="flex items-center space-x-1"
            style={{ 
              borderColor: CATEGORY_COLORS[currentCategory],
              color: CATEGORY_COLORS[currentCategory]
            }}
          >
            <span>{CATEGORIES[currentCategory as keyof typeof CATEGORIES]}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCategoryChange(null)}
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              aria-label="필터 제거"
            >
              ×
            </Button>
          </Badge>
        </div>
      )}
    </div>
  )
}