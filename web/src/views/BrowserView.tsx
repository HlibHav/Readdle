import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../state/store';
import { PagePreview } from '../components/PagePreview';
import { AssistantPanel } from '../components/AssistantPanel';
import { ToolsSection } from '../components/ToolsSection';
import { InlineSearchResults } from '../components/InlineSearchResults';
import { IframeWithFallback } from '../components/IframeWithFallback';
import { extractPageContent, unifiedSearch } from '../lib/api';
import { isUrl, normalizeUrl } from '../lib/urlUtils';
import { DocumentSearchResult, WebSearchResult } from '../lib/types';
import toast from 'react-hot-toast';

export function BrowserView() {
  const location = useLocation();
  const [showAssistant, setShowAssistant] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<DocumentSearchResult | WebSearchResult | null>(null);
  
  const {
    currentPage, 
    setCurrentPage, 
    isLoading, 
    setLoading, 
    incognito,
    searchQuery,
    documentResults,
    webResults,
    isSearching,
    setSearchQuery,
    setDocumentResults,
    setWebResults,
    setIsSearching,
    addToSearchHistory
  } = useAppStore();

  console.log('BrowserView state:', {
    currentPage: !!currentPage,
    showSearchResults,
    searchQuery,
    documentResults: documentResults.length,
    webResults: webResults.length,
    isSearching,
    willRenderPagePreview: !!currentPage,
    willRenderSearchResults: !currentPage && showSearchResults,
    willRenderTools: !currentPage && !showSearchResults
  });

  console.log('BrowserView render condition:', {
    hasCurrentPage: !!currentPage,
    showSearchResults,
    willShowSearchResults: !currentPage && showSearchResults,
    willShowTools: !currentPage && !showSearchResults
  });

  const handleLoadUrl = async (url: string) => {
    const normalizedUrl = normalizeUrl(url);
    try {
      setLoading(true);
      setShowSearchResults(false);
      setSelectedResult(null);
      
      const content = await extractPageContent(normalizedUrl);
      setCurrentPage({
        ...content,
        url: normalizedUrl,
      });
      
      toast.success('Page loaded successfully');
    } catch (error) {
      console.error('Error loading page:', error);
      toast.error('Failed to load page. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      toast.error('Please enter a search query or URL');
      return;
    }

    // Check if it's a URL or search query
    if (isUrl(query)) {
      // It's a URL, load the page
      await handleLoadUrl(query);
    } else {
      // It's a search query
      console.log('🔍 Starting search for:', query);
      setSearchQuery(query);
      setShowSearchResults(true);
      setSelectedResult(null);
      setCurrentPage(null);
      setIsSearching(true);
      addToSearchHistory(query);

      try {
        console.log('🔍 Calling unifiedSearch API...');
        const results = await unifiedSearch({ query, includeWeb: true });
        console.log('🔍 Search results received:', results);
        setDocumentResults(results.documents);
        setWebResults(results.web);
        toast.success(`Found ${results.totalDocuments} documents and ${results.totalWeb} web results.`);
      } catch (error) {
        console.error('❌ Search failed:', error);
        toast.error('Failed to perform search. Please try again.');
        setDocumentResults([]);
        setWebResults([]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Handle URL or search from navigation bar
  useEffect(() => {
    const urlFromState = location.state?.url;
    const searchFromState = location.state?.search;
    
    if (urlFromState) {
      // Load URL directly
      handleLoadUrl(urlFromState);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    } else if (searchFromState) {
      // Perform search
      handleSearch(searchFromState);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleAssistantToggle = () => {
    if (incognito) {
      toast.error('Assistant is not available in incognito mode to protect your privacy');
      return;
    }
    
    setShowAssistant(!showAssistant);
  };

  const handleResultClick = (result: DocumentSearchResult | WebSearchResult) => {
    // Immediately load content inline without showing search result cards
    setSelectedResult(result);
    // Hide the search results list since we're showing content directly
    setShowSearchResults(false);
  };

  const handleBackToResults = () => {
    setSelectedResult(null);
    // Show search results again when going back
    setShowSearchResults(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Preview, Search Results, Content Display, or Tools */}
      <div className="flex-1 overflow-auto no-scrollbar">
        {currentPage ? (
          (() => {
            console.log('Rendering PagePreview with page:', currentPage);
            return (
              <PagePreview 
                page={currentPage} 
              />
            );
          })()
        ) : selectedResult ? (
          <div className="h-full bg-white flex flex-col">
            {/* Content Display */}
            <div className="flex-1 overflow-hidden">
              {'url' in selectedResult && selectedResult.url ? (
                // Web result content - display full page in iframe
                <div className="h-full bg-white">
                  <IframeWithFallback
                    src={selectedResult.url}
                    className="h-full"
                  />
                </div>
              ) : (
                // Document result content
                <div className="p-6 h-full overflow-auto no-scrollbar">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📄</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {selectedResult.name}
                      </h1>
                      <div className="text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {selectedResult.type.toUpperCase()}
                        </span>
                        <span className="ml-2">{selectedResult.folder}</span>
                        <span className="ml-2">{new Date(selectedResult.addedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedResult.type === 'pdf' && selectedResult.url ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Preview</h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <iframe
                          src={selectedResult.url}
                          className="w-full h-96"
                          title={`Preview of ${selectedResult.name}`}
                          sandbox="allow-same-origin allow-scripts"
                        />
                      </div>
                    </div>
                  ) : selectedResult.type === 'pdf' && selectedResult.content ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Preview</h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <iframe
                          src={`data:application/pdf;base64,${selectedResult.content}`}
                          className="w-full h-96"
                          title={`Preview of ${selectedResult.name}`}
                          sandbox="allow-same-origin allow-scripts"
                        />
                      </div>
                    </div>
                  ) : null}
                  
                  {selectedResult.highlightedSnippet ? (
                    <div className="prose prose-gray max-w-none">
                      <h3 className="text-lg font-semibold mb-2">Content</h3>
                      <div 
                        dangerouslySetInnerHTML={{
                          __html: selectedResult.highlightedSnippet.replace(
                            /<mark>/g, '<mark class="bg-yellow-200 px-1 rounded">'
                          )
                        }}
                      />
                    </div>
                  ) : (
                    <div className="prose prose-gray max-w-none">
                      <h3 className="text-lg font-semibold mb-2">Content</h3>
                      <p>{selectedResult.snippet}</p>
                    </div>
                  )}
                  
                  {selectedResult.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedResult.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : showSearchResults ? (
          <InlineSearchResults
            query={searchQuery}
            documentResults={documentResults}
            webResults={webResults}
            isSearching={isSearching}
            onResultClick={handleResultClick}
          />
        ) : (
          <div className="h-full">
            {/* Tools Section */}
            <ToolsSection />
          </div>
        )}
      </div>

    </div>
  );
}