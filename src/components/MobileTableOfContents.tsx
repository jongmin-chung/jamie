'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TableOfContents } from './TableOfContents'
import { List, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileTableOfContentsProps {
  content: string;
  className?: string;
}

export function MobileTableOfContents({ content, className }: MobileTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Toggle Button - Only visible on mobile/tablet */}
      <div className={cn("xl:hidden fixed bottom-6 right-6 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-lg"
          variant="default"
        >
          <List size={20} />
          <span className="ml-2 hidden sm:inline">목차</span>
        </Button>
      </div>

      {/* Mobile TOC Overlay */}
      {isOpen && (
        <div className="xl:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed right-0 top-0 h-full w-80 max-w-[80vw] bg-card border-l border-border shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">목차</h3>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X size={18} />
                </Button>
              </div>
              
              <TableOfContents 
                content={content}
                onClick={() => setIsOpen(false)} // Close on item click
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}