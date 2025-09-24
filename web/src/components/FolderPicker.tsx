import { useState, useEffect } from 'react';
import { Search, Folder, Clock, X } from 'lucide-react';
import { useAppStore } from '../state/store';

interface FolderPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folderId: string, folderName: string) => void;
  fileType?: string;
}

export function FolderPicker({ isOpen, onClose, onSelect, fileType }: FolderPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentFolders, setRecentFolders] = useState<Array<{ id: string; name: string; lastUsed: Date }>>([]);
  const { folders, files } = useAppStore();

  // Get recent folders based on file type
  useEffect(() => {
    if (isOpen && fileType) {
      // Get folders that were recently used for this file type
      const recentFileTypes = files
        .filter(file => file.type === fileType)
        .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
        .slice(0, 10);

      const folderUsage = recentFileTypes.reduce((acc, file) => {
        if (!acc[file.folder]) {
          acc[file.folder] = file.addedDate;
        }
        return acc;
      }, {} as Record<string, Date>);

      const recent = Object.entries(folderUsage)
        .map(([folderId, lastUsed]) => {
          const folder = folders.find(f => f.id === folderId);
          return folder ? { id: folder.id, name: folder.name, lastUsed } : null;
        })
        .filter(Boolean)
        .slice(0, 3) as Array<{ id: string; name: string; lastUsed: Date }>;

      setRecentFolders(recent);
    }
  }, [isOpen, fileType, files, folders]);

  // Filter folders based on search
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get default folder (last used for this file type)
  const defaultFolderId = recentFolders[0]?.id || 'default';

  const handleFolderSelect = (folderId: string, folderName: string) => {
    onSelect(folderId, folderName);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50" onKeyDown={handleKeyDown}>
      <div className="bg-white rounded-t-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Organize File</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Recent Folders */}
          {recentFolders.length > 0 && !searchQuery && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Clock size={14} className="mr-2" />
                Recent folders
              </h4>
              <div className="space-y-2">
                {recentFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleFolderSelect(folder.id, folder.name)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left ${
                      folder.id === defaultFolderId ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: folders.find(f => f.id === folder.id)?.color || '#6B7280' }}
                    >
                      <Folder size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{folder.name}</p>
                      <p className="text-xs text-gray-500">
                        {folder.id === defaultFolderId ? 'Last used for this type' : 'Recently used'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Folders */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Folder size={14} className="mr-2" />
              {searchQuery ? 'Search results' : 'Browse all folders'}
            </h4>
            <div className="space-y-2">
              {filteredFolders.length > 0 ? (
                filteredFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleFolderSelect(folder.id, folder.name)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left ${
                      folder.id === defaultFolderId ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: folder.color }}
                    >
                      <Folder size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{folder.name}</p>
                      <p className="text-xs text-gray-500">
                        {folder.id === defaultFolderId ? 'Suggested' : `${files.filter(f => f.folder === folder.id).length} files`}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Folder size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No folders found</p>
                  {searchQuery && (
                    <p className="text-sm">Try a different search term</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
