import { PageContent } from '../state/store';

interface PagePreviewProps {
  page: PageContent;
}

export function PagePreview({ page }: PagePreviewProps) {
  return (
    <div className="h-full bg-white">
      {/* Page Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          {page.favicon && (
            <img
              src={page.favicon}
              alt=""
              className="w-6 h-6 mt-1 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
              {page.title}
            </h1>
            {page.byline && (
              <p className="text-sm text-gray-600 mb-2">
                {page.byline}
              </p>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="font-medium">{page.domain}</span>
              <span>•</span>
              <span>Reader Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-6">
        <div 
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
