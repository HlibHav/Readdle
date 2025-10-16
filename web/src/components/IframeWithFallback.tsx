import { useState, useRef, useEffect } from 'react';
import { ExternalLink, AlertTriangle } from 'lucide-react';

interface IframeWithFallbackProps {
  src: string;
  title?: string;
  className?: string;
}

export function IframeWithFallback({ src, title, className = '' }: IframeWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<number>();

  // ALWAYS use proxy to bypass X-Frame-Options
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(src)}`;

  useEffect(() => {
    // Set a timeout to detect if iframe fails to load
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
      }
    }, 15000); // 15 second timeout for proxy

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(src, '_blank', 'noopener,noreferrer');
  };

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cannot Display This Page
          </h3>
          <p className="text-gray-600 mb-4">
            This website doesn't allow embedding in frames for security reasons. 
            You can still view the content by opening it in a new tab.
          </p>
          <button
            onClick={handleOpenInNewTab}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </button>
          <p className="text-xs text-gray-500 mt-3">
            URL: {src}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">
              Loading content...
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Extracting page content
            </p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={proxyUrl}
        title={title || 'Embedded content'}
        className={`w-full h-full border-0 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        sandbox="allow-same-origin allow-scripts"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
