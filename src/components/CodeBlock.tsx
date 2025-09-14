'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

export function CodeBlock({ children, className, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="group relative my-6">
      {language && (
        <div className="flex items-center justify-between bg-muted border border-b-0 rounded-t-lg px-4 py-2">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {language}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-500" />
                <span className="ml-1 text-xs text-green-500">복사됨</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span className="ml-1 text-xs">복사</span>
              </>
            )}
          </Button>
        </div>
      )}
      <pre className={cn(
        "overflow-x-auto bg-muted border rounded-lg p-4 text-sm font-mono leading-relaxed",
        language ? "rounded-t-none" : "",
        className
      )}>
        <code>{children}</code>
      </pre>
      {!language && (
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="absolute top-2 right-2 h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-500" />
              <span className="ml-1 text-xs text-green-500">복사됨</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="ml-1 text-xs">복사</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}