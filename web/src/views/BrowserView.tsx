import { useState } from 'react';
import { useAppStore } from '../state/store';
import { UrlBar } from '../components/UrlBar';
import { PagePreview } from '../components/PagePreview';
import { AssistantPanel } from '../components/AssistantPanel';
import { extractPageContent } from '../lib/api';
import toast from 'react-hot-toast';

export function BrowserView() {
  const [url, setUrl] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  
  const { 
    currentPage, 
    setCurrentPage, 
    isLoading, 
    setLoading, 
    incognito, 
    logEvent 
  } = useAppStore();

  console.log('BrowserView currentPage:', currentPage);

  const handleGo = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      toast.error('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    // Prevent using error messages as URLs
    if (url.includes('Failed to load page') || url.includes('Please check the URL')) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      setLoading(true);
      logEvent('browser_open', { url });
      
      const content = await extractPageContent(url);
      setCurrentPage({
        ...content,
        url,
      });
      
      toast.success('Page loaded successfully');
    } catch (error) {
      console.error('Error loading page:', error);
      toast.error('Failed to load page. Please check the URL and try again.');
      // Clear the URL field if it contains an error message
      if (url.includes('Failed to load page') || url.includes('Please check the URL')) {
        setUrl('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssistantToggle = () => {
    if (incognito) {
      toast.error('Assistant is not available in incognito mode to protect your privacy');
      return;
    }
    
    setShowAssistant(!showAssistant);
    logEvent('assistant_opened', { opened: !showAssistant });
  };

  return (
    <div className="flex h-screen">
      {/* Main Browser Area */}
      <div className="flex-1 flex flex-col">
        {/* URL Bar */}
        <div className="p-4 border-b border-gray-200">
            <UrlBar
              url={url}
              setUrl={setUrl}
              onGo={handleGo}
              isLoading={isLoading}
              showAssistant={showAssistant}
              onAssistantToggle={handleAssistantToggle}
              incognito={incognito}
              hasCurrentPage={!!currentPage}
              currentPage={currentPage}
            />
        </div>

        {/* Page Preview */}
        <div className="flex-1 overflow-auto">
          {currentPage ? (
            <PagePreview page={currentPage} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">🌐</div>
                <h2 className="text-xl font-medium mb-2">Enter a URL to get started</h2>
                <p className="text-sm">Try a news article or blog post for the best experience</p>
              </div>
            </div>
          )}
        </div>

        {/* Page Info */}
        {currentPage && (
          <div className="p-4 border-t border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {currentPage.domain}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assistant Panel */}
      {showAssistant && currentPage && (
        <AssistantPanel
          page={currentPage}
          onClose={() => setShowAssistant(false)}
        />
      )}
    </div>
  );
}
