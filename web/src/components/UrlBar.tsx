import { useState } from 'react';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import { PdfDownloadButton } from './PdfDownloadButton';
import { isUrl, normalizeUrl } from '../lib/urlUtils';
import GlassSurface from './GlassSurface';

interface UrlBarProps {
  url: string;
  setUrl: (url: string) => void;
  onGo: () => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
  showAssistant: boolean;
  onAssistantToggle: () => void;
  incognito: boolean;
  hasCurrentPage: boolean;
  currentPage?: {
    url: string;
    title?: string;
    content?: string;
  };
  hasSelectedResult?: boolean;
  onBackToResults?: () => void;
}

export function UrlBar({ 
  url, 
  setUrl, 
  onGo, 
  onSearch,
  isLoading, 
  showAssistant, 
  onAssistantToggle, 
  incognito, 
  hasCurrentPage,
  currentPage,
  hasSelectedResult,
  onBackToResults
}: UrlBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      if (isUrl(url)) {
        // It's a URL, navigate to browser with normalized URL
        const normalizedUrl = normalizeUrl(url);
        setUrl(normalizedUrl);
        onGo();
      } else if (url.trim()) {
        // It's a search query, use inline search
        onSearch(url.trim());
      }
    }
  };

  const getPlaceholder = () => {
    if (isUrl(url)) {
      return "Press Enter to browse this URL";
    }
    return "Enter URL to browse or search query...";
  };

  return (
    <div className="flex items-center space-x-3" data-testid="url-bar">
      <div className="flex-1 relative">
        <GlassSurface 
          width="100%" 
          height={56}
          borderRadius={25}
          backgroundOpacity={0.3}
          brightness={98}
          opacity={0.9}
          blur={15}
          className={`transition-all ${
            isFocused 
              ? 'ring-2 ring-documents-blue' 
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
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={getPlaceholder()}
              className="flex-1 py-3 px-2 bg-transparent border-0 outline-none text-gray-900 placeholder-gray-500"
              disabled={isLoading}
            />
          </div>
        </GlassSurface>
      </div>
      
      <button
        onClick={() => {
          if (isUrl(url)) {
            const normalizedUrl = normalizeUrl(url);
            setUrl(normalizedUrl);
            onGo();
          } else if (url.trim()) {
            onSearch(url.trim());
          }
        }}
        disabled={isLoading || !url.trim()}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
          isLoading || !url.trim()
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isUrl(url)
            ? 'bg-documents-blue text-white hover:bg-blue-600'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        {isLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <span>{isUrl(url) ? 'Go' : 'Search'}</span>
        )}
      </button>

      {/* PDF Download Button - only show when there's a current page */}
      {hasCurrentPage && currentPage && (
        <PdfDownloadButton 
          url={currentPage.url}
          title={currentPage.title}
          content={currentPage.content}
        />
      )}

      {/* Assistant Button - only show when there's a current page */}
      {hasCurrentPage && (
        <button
          onClick={onAssistantToggle}
          disabled={incognito}
          className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            incognito
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : showAssistant
              ? 'bg-documents-blue text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={incognito ? 'Assistant disabled in incognito mode' : 'Open Assistant'}
        >
          <span>✨</span>
          <span>Assistant</span>
        </button>
      )}
    </div>
  );
}
