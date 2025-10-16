import { useState } from 'react';
import { WebSearchResult } from '../lib/types';
import { MoreVertical, Globe } from 'lucide-react';

interface WebResultListItemProps {
  result: WebSearchResult;
  onResultClick?: (result: WebSearchResult) => void;
}

export function WebResultListItem({ result, onResultClick }: WebResultListItemProps) {
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

  const formatUrlPath = (url: string) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname + urlObj.search;
      return path.length > 1 ? path : '';
    } catch {
      return '';
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  return (
    <div
      className={`py-3 px-1 cursor-pointer transition-colors duration-150 ${
        isHovered ? 'bg-gray-50' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Favicon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-4 h-4 flex items-center justify-center">
            {result.favicon && !imageError ? (
              <img
                src={result.favicon}
                alt=""
                className="w-4 h-4"
                onError={() => setImageError(true)}
              />
            ) : (
              <Globe size={14} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg text-blue-600 hover:text-blue-800 hover:underline leading-6 mb-1">
            <span 
              dangerouslySetInnerHTML={{ 
                __html: highlightText(result.title, '') 
              }} 
            />
          </h3>

          {/* URL and Path */}
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-sm text-green-700">
              {formatDomain(result.url)}
            </span>
            {formatUrlPath(result.url) && (
              <>
                <span className="text-gray-400">›</span>
                <span className="text-sm text-gray-600 truncate">
                  {formatUrlPath(result.url)}
                </span>
              </>
            )}
          </div>

          {/* Snippet */}
          <div className="text-sm text-gray-600 leading-5">
            <span 
              dangerouslySetInnerHTML={{ 
                __html: highlightText(result.snippet, '') 
              }} 
            />
          </div>
        </div>

        {/* More options */}
        <div className="flex-shrink-0 mt-1">
          <button
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options
              console.log('More options for:', result.title);
            }}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
