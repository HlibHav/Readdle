import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/store';
import { unifiedSearch } from '../lib/api';
import { DocumentResultCard } from '../components/DocumentResultCard';
import { WebResultListItem } from '../components/WebResultListItem';
import { IframeWithFallback } from '../components/IframeWithFallback';
import { SearchBar } from '../components/SearchBar';
import { Loader2, Search, FileText, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { DocumentSearchResult, WebSearchResult } from '../lib/types';

export function SearchResultsView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const {
    documentResults,
    webResults,
    isSearching,
    setDocumentResults,
    setWebResults,
    setIsSearching,
    addToSearchHistory,
    incognito
  } = useAppStore();

  const [hasSearched, setHasSearched] = useState(false);
  const [selectedResult, setSelectedResult] = useState<DocumentSearchResult | WebSearchResult | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (query && query.trim()) {
      performSearch(query.trim());
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setSelectedResult(null); // Clear any selected result when searching

    try {
      const results = await unifiedSearch({
        query: searchQuery,
        includeWeb: !incognito,
        limit: 20
      });

      setDocumentResults(results.documents);
      setWebResults(results.web);
      addToSearchHistory(searchQuery);

      console.log(`🔍 Search completed: ${results.totalDocuments} documents, ${results.totalWeb} web results`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      setDocumentResults([]);
      setWebResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBackToBrowser = () => {
    navigate('/');
  };

  const handleResultClick = (result: DocumentSearchResult | WebSearchResult) => {
    console.log('🔍 Result clicked:', result);
    setSelectedResult(result);
  };

  const handleBackToResults = () => {
    setSelectedResult(null);
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }
  };

  // Helper function to get PDF blob URL from sessionStorage or content
  const getPdfBlobUrl = (fileId: string, content?: string): string | null => {
    try {
      // Clean up previous blob URL
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }

      let pdfData = null;
      
      // First try to get from content prop
      if (content) {
        pdfData = content;
      } else {
        // Fallback to sessionStorage
        pdfData = sessionStorage.getItem(`pdf_${fileId}`);
      }
      
      if (pdfData) {
        const byteCharacters = atob(pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        currentBlobUrlRef.current = blobUrl;
        return blobUrl;
      }
    } catch (error) {
      console.error('Error creating PDF blob URL:', error);
    }
    return null;
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToBrowser}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Browser
            </button>
            <div className="flex-1">
              <SearchBar
                initialQuery={query}
                onSearch={performSearch}
                placeholder="Search documents and web..."
                showSearchButton={true}
                hasSelectedResult={!!selectedResult}
                onBackToResults={handleBackToResults}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {selectedResult ? (
          // Show selected result content inline
          <div className="h-full flex flex-col">
            {/* Content Display */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
                {'title' in selectedResult ? (
                  // Web result content - Load page inline
                  <div className="h-full bg-white">
                    <IframeWithFallback
                      src={selectedResult.url}
                      title={selectedResult.title}
                      className="h-full"
                    />
                  </div>
                ) : (
                  // Document result content - Handle different file types
                  <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                      <h1 className="text-xl font-bold text-gray-900 mb-2">
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
                    
                    <div className="flex-1 overflow-auto p-6">
                      {selectedResult.type.toLowerCase() === 'pdf' ? (
                        // PDF content - Embed blob if available
                        <div className="h-full relative">
                          {(() => {
                            const pdfBlobUrl = getPdfBlobUrl(selectedResult.id, selectedResult.content);
                            const pdfUrl = pdfBlobUrl || selectedResult.url;
                            
                            if (pdfUrl) {
                              return (
                                <>
                                  <iframe
                                    src={pdfUrl}
                                    className="w-full h-full border-0"
                                    title={selectedResult.name}
                                    onLoad={() => {
                                      console.log('PDF loaded successfully');
                                    }}
                                    onError={() => {
                                      console.error('Failed to load PDF');
                                    }}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      border: 'none',
                                      backgroundColor: '#ffffff'
                                    }}
                                  />
                                  {/* Fallback button for PDF */}
                                  <div className="absolute top-4 right-4">
                                    <button
                                      onClick={() => {
                                        if (pdfUrl) {
                                          window.open(pdfUrl, '_blank', 'noopener,noreferrer');
                                        }
                                      }}
                                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                                    >
                                      Open PDF
                                    </button>
                                  </div>
                                </>
                              );
                            } else {
                              return (
                                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                  <div className="text-center">
                                    <div className="text-6xl mb-4">📄</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Preview</h3>
                                    <p className="text-gray-600 mb-4">PDF content will be displayed here</p>
                                    <div className="prose max-w-none text-left">
                                      <div className="text-gray-700 leading-relaxed">
                                        {selectedResult.highlightedSnippet ? (
                                          <div 
                                            dangerouslySetInnerHTML={{ 
                                              __html: selectedResult.highlightedSnippet.replace(
                                                /<mark>/g, '<mark class="bg-yellow-200 px-1 rounded">'
                                              ) 
                                            }} 
                                          />
                                        ) : (
                                          <p>{selectedResult.snippet}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      ) : selectedResult.type.toLowerCase().includes('image') ? (
                        // Image content
                        <div className="h-full flex items-center justify-center">
                          {selectedResult.url ? (
                            <img
                              src={selectedResult.url}
                              alt={selectedResult.name}
                              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            />
                          ) : (
                            <div className="text-center">
                              <div className="text-6xl mb-4">🖼️</div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Image Preview</h3>
                              <p className="text-gray-600">Image content will be displayed here</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Text content
                        <div className="prose max-w-none">
                          <div className="text-gray-700 leading-relaxed">
                            {selectedResult.highlightedSnippet ? (
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: selectedResult.highlightedSnippet.replace(
                                    /<mark>/g, '<mark class="bg-yellow-200 px-1 rounded">'
                                  ) 
                                }} 
                              />
                            ) : (
                              <p>{selectedResult.snippet}</p>
                            )}
                          </div>
                          {selectedResult.tags.length > 0 && (
                            <div className="mt-6">
                              <h3 className="text-sm font-medium text-gray-900 mb-2">Tags:</h3>
                              <div className="flex flex-wrap gap-2">
                                {selectedResult.tags.map((tag, index) => (
                                  <span 
                                    key={index}
                                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                  >
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
                )}
              </div>
            </div>
          </div>
        ) : (
          // Show search results list
          <div className="max-w-4xl mx-auto p-6">
            {!hasSearched && !query ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">Search Documents & Web</h2>
                <p className="text-gray-500">Enter a search query to find relevant documents and web results</p>
              </div>
            ) : isSearching ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-8 w-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500">Searching...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Search Query Display */}
                <div className="text-sm text-gray-600">
                  Results for: <span className="font-medium">"{query}"</span>
                </div>

                {/* Documents Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Documents ({documentResults.length})
                    </h2>
                  </div>
                  
                  {documentResults.length > 0 ? (
                    <div className="space-y-3">
                      {documentResults.map((result) => (
                        <DocumentResultCard 
                          key={result.id} 
                          result={result} 
                          onResultClick={handleResultClick}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p>No documents found matching your search</p>
                    </div>
                  )}
                </div>

                {/* Web Results Section */}
                {!incognito && (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Globe className="h-5 w-5 text-green-500" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Web Results ({webResults.length})
                      </h2>
                    </div>
                    
                    {webResults.length > 0 ? (
                      <div className="bg-white rounded-lg border border-gray-200">
                        {webResults.map((result, index) => (
                          <div key={`${result.url}-${index}`}>
                            <WebResultListItem 
                              result={result} 
                              onResultClick={handleResultClick}
                            />
                            {index < webResults.length - 1 && (
                              <div className="border-b border-gray-100 mx-4"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Globe className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p>No web results found</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Incognito Notice */}
                {incognito && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                      <p className="text-sm text-yellow-800">
                        Web search is disabled in incognito mode to protect your privacy
                      </p>
                    </div>
                  </div>
                )}

                {/* No Results */}
                {hasSearched && documentResults.length === 0 && (incognito || webResults.length === 0) && (
                  <div className="text-center py-12">
                    <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500 mb-4">
                      Try different keywords or check your spelling
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Go back to browser
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}