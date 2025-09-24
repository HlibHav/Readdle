import { useState } from 'react';
import { Folder, Tag, Plus } from 'lucide-react';
import { useAppStore } from '../state/store';

interface FolderSidebarProps {
  folders: any[];
  selectedFolder: string;
  onFolderSelect: (folderId: string) => void;
  allTags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  files: any[];
}

export function FolderSidebar({
  folders,
  selectedFolder,
  onFolderSelect,
  allTags,
  selectedTag,
  onTagSelect,
  files,
}: FolderSidebarProps) {
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const { addFolder, updateFile, logEvent } = useAppStore();

  // Organize tags by count (most used first)
  const tagsWithCount = allTags.map(tag => {
    const count = files.filter(file => file.tags.includes(tag)).length;
    return { tag, count };
  }).sort((a, b) => b.count - a.count);

  const handleAddFolder = () => {
    const name = prompt('Enter folder name:');
    if (name && name.trim()) {
      const newFolder = {
        id: Date.now().toString(),
        name: name.trim(),
        color: '#007AFF',
      };
      addFolder(newFolder);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData('text/plain');
    
    if (fileId && folderId !== 'all') {
      updateFile(fileId, { folder: folderId });
      
      const folder = folders.find(f => f.id === folderId);
      logEvent('file_moved_drag_drop', {
        file_id: fileId,
        folder_id: folderId,
        folder_name: folder?.name || folderId
      });
    }
    
    setDragOverFolder(null);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Library</h2>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Folders</h3>
            <button
              onClick={handleAddFolder}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Add folder"
            >
              <Plus size={16} className="text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-1">
            <button
              onClick={() => onFolderSelect('all')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFolder === 'all'
                  ? 'bg-documents-blue text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Folder size={16} />
              <span>All Files</span>
            </button>
            
            {folders.map(folder => (
              <div
                key={folder.id}
                className={`w-full rounded-lg transition-colors ${
                  dragOverFolder === folder.id ? 'bg-blue-100 border-2 border-dashed border-blue-300' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, folder.id)}
              >
                <button
                  onClick={() => onFolderSelect(folder.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFolder === folder.id
                      ? 'bg-documents-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span>{folder.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Tags</h3>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => onTagSelect(null)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-documents-blue text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Tag size={16} />
                <span>All Tags</span>
              </button>
              
              {tagsWithCount.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => onTagSelect(tag)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-documents-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Tag size={16} />
                    <span>{tag}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedTag === tag
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
