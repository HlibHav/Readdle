import { PageContent } from '../state/store';

interface PagePreviewProps {
  page: PageContent;
}

export function PagePreview({ page }: PagePreviewProps) {
  return (
    <div className="h-full bg-white">
      {/* Page Content */}
      <div className="p-6">
        {page.content && page.content.trim() ? (
          <div 
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content Not Available</h3>
              <p className="text-gray-600 mb-4">
                This page's content couldn't be extracted automatically. This might be due to:
              </p>
              <ul className="text-sm text-gray-500 text-left space-y-1 mb-6">
                <li>• JavaScript-heavy content that requires browser rendering</li>
                <li>• Anti-bot protection</li>
                <li>• Dynamic content loading</li>
              </ul>
              <div className="space-y-3">
                <a 
                  href={page.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </a>
                <div className="text-xs text-gray-400">
                  You can still use the Assistant and PDF features with the page title and URL.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
