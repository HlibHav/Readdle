import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentSearchResult } from '../lib/types';
import { Calendar, Folder, Tag, Eye, ExternalLink, Hash, HardDrive } from 'lucide-react';

interface DocumentResultCardProps {
  result: DocumentSearchResult;
  onResultClick?: (result: DocumentSearchResult) => void;
}

export function DocumentResultCard({ result, onResultClick }: DocumentResultCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      case 'md':
        return '📋';
      case 'image':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleClick = () => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      console.warn('⚠️ onResultClick is not provided');
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open file preview modal or navigate to preview
    console.log('Preview file:', result.id);
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (result.url) {
      window.open(result.url, '_blank');
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all duration-200 ${
        isHovered ? 'shadow-md border-blue-300' : 'hover:shadow-sm hover:border-gray-300'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* File Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <span className="text-lg">{getFileIcon(result.type)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {result.name}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {result.type.toUpperCase()}
            </span>
            {result.fileExtension && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded font-mono">
                .{result.fileExtension}
              </span>
            )}
          </div>
          
          {/* Original name if different */}
          {result.originalName && result.originalName !== result.name && (
            <p className="text-xs text-gray-500 mb-1">Original: {result.originalName}</p>
          )}

          {/* Snippet */}
          <div className="text-sm text-gray-600 mb-2">
            {result.highlightedSnippet ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: result.highlightedSnippet.replace(
                    /<mark>/g, '<mark class="bg-yellow-200 px-1 rounded">'
                  ) 
                }} 
              />
            ) : (
              <p className="line-clamp-2">{result.snippet}</p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-xs text-gray-500 flex-wrap">
            <div className="flex items-center space-x-1">
              <Folder size={12} />
              <span>{result.folder}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar size={12} />
              <span>{formatDate(result.addedDate)}</span>
            </div>
            {result.wordCount && result.wordCount > 0 && (
              <div className="flex items-center space-x-1">
                <Hash size={12} />
                <span>{result.wordCount} words</span>
              </div>
            )}
            {result.size && (
              <div className="flex items-center space-x-1">
                <HardDrive size={12} />
                <span>{formatFileSize(result.size)}</span>
              </div>
            )}
            {result.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <Tag size={12} />
                <span>{result.tags.slice(0, 2).join(', ')}</span>
                {result.tags.length > 2 && (
                  <span>+{result.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center space-x-1">
          <button
            onClick={handlePreview}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            title="Preview"
          >
            <Eye size={16} />
          </button>
          {result.url && (
            <button
              onClick={handleOpenExternal}
              className="p-1 text-gray-400 hover:text-green-500 transition-colors"
              title="Open original"
            >
              <ExternalLink size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Score indicator */}
      {result.score > 0 && (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(result.score * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {Math.round(result.score * 100)}% match
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
