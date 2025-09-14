'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
  onClick?: () => void;
}

export function TableOfContents({ content, className, onClick }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Extract headings from HTML content
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const items: TOCItem[] = [];
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const title = heading.textContent || '';
      
      // Use existing ID from rehype-slug or create one
      let id = heading.id;
      if (!id) {
        // Match rehype-slug's ID generation algorithm
        id = title
          .toLowerCase()
          .replace(/[^\w\s가-힣-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          || `heading-${index}`;
        heading.id = id;
      }
      
      items.push({ id, title, level });
    });
    
    setTocItems(items);
  }, [content]);

  // Scroll spy to highlight current section
  useEffect(() => {
    // Check if we're in the browser and have TOC items
    if (typeof window === 'undefined' || tocItems.length === 0) return;
    
    const handleScroll = () => {
      const headings = tocItems.map(item => document.getElementById(item.id)).filter(Boolean);
      
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        if (heading) {
          const rect = heading.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveId(tocItems[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  const handleClick = (id: string) => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;
    
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Offset for fixed headers
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
    
    // Call the onClick callback if provided (for mobile)
    onClick?.();
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <nav className={cn("space-y-1", className)}>
      <h3 className="font-bold text-foreground mb-4 text-base border-b border-border pb-2">
        목차
      </h3>
      <div className="space-y-1">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={cn(
              "block text-left w-full transition-all duration-200 text-sm py-2 px-3 rounded-md hover:bg-primary/10",
              "text-muted-foreground hover:text-primary",
              {
                "bg-primary/10 text-primary font-medium border-l-3 border-primary": activeId === item.id,
                "font-normal": activeId !== item.id,
                "pl-3": item.level === 1,
                "pl-5 text-xs": item.level === 2,
                "pl-7 text-xs": item.level === 3,
                "pl-9 text-xs": item.level === 4,
                "pl-11 text-xs": item.level === 5,
                "pl-13 text-xs": item.level === 6,
              }
            )}
          >
            <span className="line-clamp-3 leading-relaxed">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}