import React from 'react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  language?: string
  children: React.ReactNode
  className?: string
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  language = 'jsx', 
  children, 
  className 
}) => {
  return (
    <div className="relative my-6 rounded-lg overflow-hidden">
      <div className="bg-gray-800 text-white text-xs px-3 py-1.5 font-mono">
        {language}
      </div>
      <pre className={cn(
        "bg-gray-100 p-4 overflow-x-auto text-sm",
        className
      )}>
        <code className={`language-${language}`}>
          {children}
        </code>
      </pre>
    </div>
  )
}

export default CodeBlock