import { useState } from 'react';
import { useAppStore } from '../state/store';
import { FileCard } from '../components/FileCard';
import { FolderSidebar } from '../components/FolderSidebar';
import { Search, Filter, Grid, List } from 'lucide-react';

export function LibraryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const { files, folders } = useAppStore();

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
    <div className="flex h-screen">
      {/* Sidebar */}
      <FolderSidebar
        folders={folders}
        selectedFolder={selectedFolder}
        onFolderSelect={setSelectedFolder}
        allTags={allTags}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        files={files}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Library</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-documents-blue text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-documents-blue text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-documents-blue focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Files Grid/List */}
        <div className="flex-1 p-6 overflow-auto">
          {filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📁</div>
                <h2 className="text-xl font-medium mb-2">No files found</h2>
                <p className="text-sm">
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
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
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
