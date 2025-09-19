'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div
      className={cn(
        'border border-border rounded-lg overflow-hidden',
        className
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors text-left"
      >
        <h3 className="font-semibold text-foreground">{title}</h3>
        {isOpen ? (
          <ChevronDown
            size={20}
            className="text-muted-foreground flex-shrink-0"
          />
        ) : (
          <ChevronRight
            size={20}
            className="text-muted-foreground flex-shrink-0"
          />
        )}
      </button>

      {isOpen && (
        <div className="p-4 bg-card border-t border-border">{children}</div>
      )}
    </div>
  )
}
