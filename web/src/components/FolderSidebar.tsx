import { useState } from 'react';
import { Folder, Tag, Plus } from 'lucide-react';
import { useAppStore } from '../state/store';
import GlassSurface from './GlassSurface';

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
  const { addFolder, updateFile } = useAppStore();

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
    }
    
    setDragOverFolder(null);
  };

  return (
    <div className="w-80 max-w-sm flex flex-col relative h-screen ml-4">
      <GlassSurface 
        width="100%" 
        height="100%"
        borderRadius={8}
        backgroundOpacity={0.5}
        brightness={98}
        opacity={0.95}
        blur={20}
        className="absolute inset-0"
        style={{ backdropFilter: 'blur(20px) saturate(1.2)' }}
      >
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-4 border-b border-white/20">
            <h2 className="text-lg font-semibold text-white">Library</h2>
          </div>

          {/* Folders */}
          <div className="flex-1 overflow-auto">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white/90">Folders</h3>
                <button
                  onClick={handleAddFolder}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                  title="Add folder"
                >
                  <Plus size={16} className="text-white/70" />
                </button>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={() => onFolderSelect('all')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFolder === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'text-white/80 hover:bg-white/20'
                  }`}
                >
                  <Folder size={16} />
                  <span>All Files</span>
                </button>
                
                {folders.map(folder => (
                  <div
                    key={folder.id}
                    className={`w-full rounded-lg transition-colors ${
                      dragOverFolder === folder.id ? 'bg-blue-500/20 border-2 border-dashed border-blue-300' : ''
                    }`}
                    onDragOver={(e) => handleDragOver(e, folder.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, folder.id)}
                  >
                    <button
                      onClick={() => onFolderSelect(folder.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedFolder === folder.id
                          ? 'bg-blue-600 text-white'
                          : 'text-white/80 hover:bg-white/20'
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
              <div className="px-4 py-4 border-t border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white/90">Tags</h3>
                </div>
                
                <div className="space-y-1">
                  <button
                    onClick={() => onTagSelect(null)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTag === null
                        ? 'bg-blue-600 text-white'
                        : 'text-white/80 hover:bg-white/20'
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
                          ? 'bg-blue-600 text-white'
                          : 'text-white/80 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Tag size={16} />
                        <span>{tag}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedTag === tag
                          ? 'bg-white bg-opacity-20 text-white'
                          : 'bg-white/20 text-white/90'
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
      </GlassSurface>
    </div>
  );
}
