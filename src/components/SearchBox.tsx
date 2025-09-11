'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
}

export function SearchBox({
  onSearch,
  initialQuery = '',
  placeholder = '검색어를 입력하세요...',
  debounceMs = 300,
  isLoading = false,
}: SearchBoxProps) {
  const [value, setValue] = useState(initialQuery);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback((searchTerm: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceMs);

    setTimeoutId(newTimeoutId);
  }, [onSearch, debounceMs, timeoutId]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  }, [debouncedSearch]);

  // Handle clear button click
  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      onSearch(value);
    }
  }, [onSearch, value, timeoutId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <div className="relative">
      <div className="relative">
        <Search 
          size={18} 
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--kakaopay-text-muted)' }}
        />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full pl-10 pr-10 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ 
            borderColor: 'var(--kakaopay-border)',
            backgroundColor: 'var(--kakaopay-card-bg)',
            color: 'var(--kakaopay-text-primary)',
          }}
        />
        
        {/* Clear button */}
        {value && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={16} style={{ color: 'var(--kakaopay-text-muted)' }} />
          </button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div 
              className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--kakaopay-link)' }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}