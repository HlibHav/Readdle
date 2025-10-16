import { useState, useEffect } from 'react';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import { isUrl } from '../lib/urlUtils';
import GlassSurface from './GlassSurface';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  showSearchButton?: boolean;
  className?: string;
  hasSelectedResult?: boolean;
  onBackToResults?: () => void;
}

export function SearchBar({ 
  initialQuery = '', 
  onSearch, 
  placeholder = "Search documents and web...",
  showSearchButton = false,
  className = '',
  hasSelectedResult,
  onBackToResults
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    try {
      await onSearch(query.trim());
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSubmit(e);
    }
  };

  const getPlaceholder = () => {
    if (isUrl(query)) {
      return "Press Enter to browse this URL";
    }
    return placeholder;
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-1 relative">
        <GlassSurface 
          width="100%" 
          height={56}
          borderRadius={99}
          backgroundOpacity={0.3}
          brightness={98}
          opacity={0.9}
          blur={15}
          className={`transition-all ${
            isFocused 
              ? 'ring-2 ring-blue-500' 
              : ''
          }`}
        >
          <div className="flex items-center w-full h-full">
            {/* Back Arrow - only show when there's a selected result */}
            {hasSelectedResult && onBackToResults && (
              <button
                onClick={onBackToResults}
                className="pl-3 pr-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Back to search results"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            
            <div className={`${hasSelectedResult ? 'pl-2' : 'pl-3'} pr-2 text-gray-400`}>
              <Search size={20} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={getPlaceholder()}
              className="flex-1 py-3 px-2 bg-transparent border-0 outline-none text-gray-900 placeholder-gray-500"
              disabled={isSearching}
            />
          </div>
        </GlassSurface>
      </div>
      
      {showSearchButton && (
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            !query.trim() || isSearching
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSearching ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <span>Search</span>
          )}
        </button>
      )}
    </form>
  );
}

