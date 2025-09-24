import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { PdfDownloadButton } from './PdfDownloadButton';

interface UrlBarProps {
  url: string;
  setUrl: (url: string) => void;
  onGo: () => void;
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
}

export function UrlBar({ 
  url, 
  setUrl, 
  onGo, 
  isLoading, 
  showAssistant, 
  onAssistantToggle, 
  incognito, 
  hasCurrentPage,
  currentPage
}: UrlBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onGo();
    }
  };

  return (
    <div className="flex items-center space-x-3" data-testid="url-bar">
      <div className="flex-1 relative">
        <div className={`flex items-center border-2 rounded-lg transition-colors ${
          isFocused 
            ? 'border-documents-blue shadow-sm' 
            : 'border-gray-300 hover:border-gray-400'
        }`}>
          <div className="pl-3 pr-2 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter URL to browse..."
            className="flex-1 py-3 px-2 border-0 outline-none text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <button
        onClick={onGo}
        disabled={isLoading || !url.trim()}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
          isLoading || !url.trim()
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-documents-blue text-white hover:bg-blue-600'
        }`}
      >
        {isLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <span>Go</span>
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
