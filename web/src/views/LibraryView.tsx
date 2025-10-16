import { useState } from 'react';
import { useAppStore } from '../state/store';
import { FileCard } from '../components/FileCard';
import { FolderSidebar } from '../components/FolderSidebar';
import { Search, Filter, Grid, List } from 'lucide-react';

export function LibraryView() {
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const { files, folders, searchQuery } = useAppStore();

  // Filter files based on search, folder, and tag
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
    const matchesTag = !selectedTag || file.tags.includes(selectedTag);
    
    return matchesSearch && matchesFolder && matchesTag;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(files.flatMap(file => file.tags)));

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-black" data-testid="library-view">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <FolderSidebar
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
          allTags={allTags}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
          files={files}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6">
        {/* Header */}
        <div className="h-14 border-b border-white/10 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white/80 border border-white/20 rounded-lg hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm">
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Files Grid/List */}
        <div className="flex-1 p-6 overflow-auto no-scrollbar">
          {filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/60">
              <div className="text-center">
                <div className="text-6xl mb-4">📁</div>
                <h2 className="text-xl font-medium mb-2 text-white">No files found</h2>
                <p className="text-sm text-white/70">
                  {searchQuery || selectedFolder !== 'all' || selectedTag
                    ? 'Try adjusting your search or filters'
                    : 'Upload some files to get started'}
                </p>
              </div>
            </div>
          ) : (
            <div className={`${
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-2'
            }`}>
              {filteredFiles.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="px-0 py-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>
              {filteredFiles.length} of {files.length} files
            </span>
            <span>
              {selectedFolder !== 'all' && `in ${folders.find(f => f.id === selectedFolder)?.name}`}
              {selectedTag && ` • tagged "${selectedTag}"`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
