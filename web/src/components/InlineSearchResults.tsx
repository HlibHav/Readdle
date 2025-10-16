import { useState } from 'react';
import { DocumentSearchResult, WebSearchResult } from '../lib/types';
import { DocumentResultCard } from './DocumentResultCard';
import { WebResultListItem } from './WebResultListItem';
import { Loader2 } from 'lucide-react';

interface InlineSearchResultsProps {
  query: string;
  documentResults: DocumentSearchResult[];
  webResults: WebSearchResult[];
  isSearching: boolean;
  onResultClick?: (result: DocumentSearchResult | WebSearchResult) => void;
}

export function InlineSearchResults({
  query,
  documentResults,
  webResults,
  isSearching,
  onResultClick
}: InlineSearchResultsProps) {
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  
  // Sort documents by date (newest first) and limit to 2 initially
  const sortedDocuments = [...documentResults].sort((a, b) => 
    new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
  );
  
  const displayedDocuments = showAllDocuments ? sortedDocuments : sortedDocuments.slice(0, 2);
  const hasMoreDocuments = documentResults.length > 2;
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Loader2 className="h-12 w-12 animate-spin text-documents-blue" />
        <p className="mt-4 text-lg">Searching for "{query}"...</p>
      </div>
    );
  }

  console.log('InlineSearchResults render:', {
    query,
    documentResults: documentResults.length,
    webResults: webResults.length,
    isSearching
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Search Results for "{query}"</h1>
        <p className="text-gray-600 mt-1">
          Found <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{documentResults.length}</span> documents and <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">{webResults.length}</span> web results
        </p>
      </div>

      {/* Document Results */}
      {documentResults.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
              <span className="mr-2">📄</span>
              Your Documents ({documentResults.length})
            </h2>
            {hasMoreDocuments && (
              <span className="text-sm text-gray-500">
                Showing {displayedDocuments.length} of {documentResults.length}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedDocuments.map((doc) => (
              <DocumentResultCard key={doc.id} result={doc} onResultClick={onResultClick} />
            ))}
          </div>
          {hasMoreDocuments && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllDocuments(!showAllDocuments)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                {showAllDocuments ? 'Show Less' : `Show More (${documentResults.length - 2} more)`}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Web Results */}
      {webResults.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="mr-2">🌐</span>
            Web Results ({webResults.length})
          </h2>
          <div className="bg-white rounded-lg border border-gray-200">
            {webResults.map((web, index) => (
              <div key={web.url}>
                <WebResultListItem result={web} onResultClick={onResultClick} />
                {index < webResults.length - 1 && (
                  <div className="border-b border-gray-100 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* No Results */}
      {documentResults.length === 0 && webResults.length === 0 && !isSearching && (
        <div className="text-center text-gray-500 py-10">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg">No results found for "{query}".</p>
          <p className="text-md mt-2">Try a different query or check your spelling.</p>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
        <p>Debug: Query="{query}", Documents={documentResults.length}, Web={webResults.length}, Searching={isSearching.toString()}</p>
      </div>
    </div>
  );
}
