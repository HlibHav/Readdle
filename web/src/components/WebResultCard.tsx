import { useState } from 'react';
import { WebSearchResult } from '../lib/types';
import { ExternalLink, Globe } from 'lucide-react';

interface WebResultCardProps {
  result: WebSearchResult;
  onResultClick?: (result: WebSearchResult) => void;
}

export function WebResultCard({ result, onResultClick }: WebResultCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      console.warn('⚠️ onResultClick is not provided, opening in new tab');
      // Fallback: Open in new tab
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  };


  const formatDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all duration-200 ${
        isHovered ? 'shadow-md border-green-300' : 'hover:shadow-sm hover:border-gray-300'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Favicon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
            {result.favicon && !imageError ? (
              <img
                src={result.favicon}
                alt=""
                className="w-4 h-4"
                onError={() => setImageError(true)}
              />
            ) : (
              <Globe size={16} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
            <span 
              dangerouslySetInnerHTML={{ 
                __html: highlightText(result.title, '') 
              }} 
            />
          </h3>

          {/* URL */}
          <div className="flex items-center space-x-1 mb-2">
            <span className="text-xs text-green-600 truncate">
              {formatDomain(result.url)}
            </span>
            <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
          </div>

          {/* Snippet */}
          <div className="text-sm text-gray-600 line-clamp-2">
            <span 
              dangerouslySetInnerHTML={{ 
                __html: highlightText(result.snippet, '') 
              }} 
            />
          </div>
        </div>

        {/* Score indicator */}
        {result.score > 0 && (
          <div className="flex-shrink-0">
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {Math.round(result.score * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* Hover effect indicator */}
      {isHovered && (
        <div className="mt-2 flex items-center justify-end">
          <span className="text-xs text-green-600 font-medium">
            Click to open in new tab
          </span>
        </div>
      )}
    </div>
  );
}
