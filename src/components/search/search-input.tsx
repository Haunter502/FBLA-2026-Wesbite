'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchInputProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export function SearchInput({
  className,
  placeholder = 'Search units, lessons, or skills...',
  onSearch,
  autoFocus = false,
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      setIsLoading(true);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [query, onSearch, router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'relative flex items-center rounded-lg border bg-background transition-all duration-200',
          isFocused ? 'ring-2 ring-ring ring-offset-2' : ''
        )}
      >
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm focus:outline-none"
          aria-label="Search"
        />
        <AnimatePresence mode="wait">
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearSearch}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Quick suggestions when focused */}
      <AnimatePresence>
        {isFocused && !query && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full rounded-lg border bg-background p-3 shadow-lg z-50"
          >
            <p className="text-xs text-muted-foreground mb-2">Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {['Factoring', 'Linear equations', 'Quadratics', 'Graphing'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    setTimeout(handleSearch, 100);
                  }}
                  className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

