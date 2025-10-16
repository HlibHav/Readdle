import { useState, useRef, useEffect } from 'react';
import { FileItem, useAppStore } from '../state/store';
import { getFileIcon, formatFileSize } from '../lib/utils';
import { MoreVertical, Eye, Tag, Folder, Calendar, Sparkles, Edit3, Check, X, Plus, Trash2 } from 'lucide-react';
import { FolderPicker } from './FolderPicker';

interface FileCardProps {
  file: FileItem;
  viewMode: 'grid' | 'list';
}

export function FileCard({ file, viewMode }: FileCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editableName, setEditableName] = useState(file.name);
  const [editableTags, setEditableTags] = useState<string[]>(file.tags);
  const [newTag, setNewTag] = useState('');
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  
  const { updateFile, deleteFile, folders } = useAppStore();

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingTags && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isEditingTags]);

  const handlePreview = () => {
    // Debug: Check file object structure
    console.log('🔍 File object for preview:', {
      id: file.id,
      name: file.name,
      type: file.type,
      hasContent: !!file.content,
      contentLength: file.content?.length || 0,
      hasUrl: !!file.url,
      url: file.url
    });

    if (file.type === 'pdf') {
      // Try to get PDF data from sessionStorage first, then fallback to file.content
      let pdfData = null;
      
      try {
        pdfData = sessionStorage.getItem(`pdf_${file.id}`);
        console.log('📄 PDF data from sessionStorage:', !!pdfData, pdfData?.length || 0);
      } catch (error) {
        console.error('Error accessing sessionStorage:', error);
      }
      
      // Fallback to file.content if sessionStorage doesn't have it
      if (!pdfData && file.content) {
        pdfData = file.content;
        console.log('📄 Using fallback PDF data from file.content');
      }
      
      if (pdfData) {
        // For PDF files with stored content, create a blob URL for preview
        try {
          const byteCharacters = atob(pdfData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(blob);
          
          // Open PDF in new tab
          const newWindow = window.open(pdfUrl, '_blank');
          if (newWindow) {
            // Clean up the URL after a delay to free memory
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
          }
        } catch (error) {
          console.error('Error creating PDF preview:', error);
          alert(`Unable to preview "${file.name}". The PDF data may be corrupted.`);
        }
      } else if (file.url) {
        // For PDF files without stored data, try to open the original URL
        window.open(file.url, '_blank');
      } else {
        // For PDF files without content or URL, show a message
        alert(`Preview for "${file.name}" is not available. The PDF data was not saved.`);
      }
    } else if (file.url) {
      // For non-PDF files with URLs (like web pages), open the URL
      window.open(file.url, '_blank');
    } else {
      // For other file types, show appropriate message
      alert(`Preview for "${file.name}" is not available for ${file.type} files.`);
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setEditableName(file.name);
    setShowActions(false);
  };

  const handleNameSave = () => {
    if (editableName.trim() && editableName !== file.name) {
      updateFile(file.id, { 
        name: editableName.trim(),
        aiSuggested: false // User edited, so not AI suggested anymore
      });
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditableName(file.name);
    setIsEditingName(false);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  const handleTagsEdit = () => {
    setIsEditingTags(true);
    setEditableTags([...file.tags]);
    setShowActions(false);
  };

  const handleTagsSave = () => {
    updateFile(file.id, { tags: editableTags });
    setIsEditingTags(false);
  };

  const handleTagsCancel = () => {
    setEditableTags([...file.tags]);
    setIsEditingTags(false);
  };

  const addTag = () => {
    if (newTag.trim() && !editableTags.includes(newTag.trim())) {
      setEditableTags([...editableTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditableTags(editableTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Escape') {
      handleTagsCancel();
    }
  };

  const handleMoveToFolder = (folderId: string, _folderName: string) => {
    updateFile(file.id, { folder: folderId });
    setShowActions(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      deleteFile(file.id);
    }
    setShowActions(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', file.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (viewMode === 'list') {
    return (
      <>
        <div 
          className={`flex items-center space-x-4 p-5 bg-blue-500/30 backdrop-blur-sm rounded-2xl border border-white/40 hover:border-white/60 hover:shadow-xl transition-all duration-300 ease-out cursor-move ${
            isDragging ? 'opacity-10 scale-95' : ''
          }`}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/60 group-hover:bg-white/60 transition-all duration-300">
              <span className="text-2xl">{getFileIcon(file.type)}</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* File Name - Editable */}
            <div className="flex items-center space-x-2">
              {isEditingName ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    onKeyDown={handleNameKeyPress}
                    className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleNameSave}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={handleNameCancel}
                    className="p-1 text-gray-500 hover:bg-gray-50 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <h3 
                    className="text-sm font-medium text-white truncate cursor-pointer hover:text-blue-300 transition-colors flex-1"
                    onClick={handleNameEdit}
                    title="Click to edit name"
                  >
                    {file.name}
                  </h3>
                  {file.aiSuggested && (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full flex-shrink-0 border border-blue-400/30">
                      <Sparkles size={10} />
                      <span>AI</span>
                    </span>
                  )}
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-white/70 mt-1">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span 
                className="flex items-center space-x-1 cursor-pointer hover:text-blue-300 transition-colors"
                onClick={() => setShowFolderPicker(true)}
                title="Click to change folder"
              >
                <Folder size={12} className="text-white/60" />
                <span className="text-white/70">{folders.find(f => f.id === file.folder)?.name || file.folder}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar size={12} className="text-white/60" />
                <span className="text-white/70">{formatDate(file.addedDate)}</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Tags - Editable */}
            {isEditingTags ? (
              <div className="flex items-center space-x-2">
                <div className="flex flex-wrap gap-1 max-w-32">
                  {editableTags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={8} />
                      </button>
                    </span>
                  ))}
                  {editableTags.length > 2 && (
                    <span className="text-xs text-gray-500">+{editableTags.length - 2}</span>
                  )}
                </div>
                <input
                  ref={tagInputRef}
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagKeyPress}
                  placeholder="Add..."
                  className="px-2 py-1 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent w-20"
                />
                <button
                  onClick={handleTagsSave}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={handleTagsCancel}
                  className="p-1 text-gray-500 hover:bg-gray-50 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div 
                className="flex items-center space-x-1 cursor-pointer hover:text-blue-300 transition-colors"
                onClick={handleTagsEdit}
                title="Click to edit tags"
              >
                <Tag size={12} className="text-white/60" />
                <span className="text-xs text-white/70">
                  {file.tags.length > 0 ? (
                    <>
                      {file.tags.slice(0, 2).join(', ')}
                      {file.tags.length > 2 && ` +${file.tags.length - 2}`}
                    </>
                  ) : (
                    <span className="text-white/50 italic">No tags</span>
                  )}
                </span>
              </div>
            )}
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-white/40 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <MoreVertical size={16} className="text-white/70" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-10 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 py-2 z-10">
                  <button
                    onClick={handlePreview}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/50 flex items-center space-x-2 transition-colors"
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={handleNameEdit}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/50 flex items-center space-x-2 transition-colors"
                  >
                    <Edit3 size={14} />
                    <span>Edit Name</span>
                  </button>
                  <button
                    onClick={handleTagsEdit}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/50 flex items-center space-x-2 transition-colors"
                  >
                    <Tag size={14} />
                    <span>Edit Tags</span>
                  </button>
                  <button
                    onClick={() => setShowFolderPicker(true)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/50 flex items-center space-x-2 transition-colors"
                  >
                    <Folder size={14} />
                    <span>Move to Folder</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Folder Picker Modal */}
        <FolderPicker
          isOpen={showFolderPicker}
          onClose={() => setShowFolderPicker(false)}
          onSelect={handleMoveToFolder}
          fileType={file.type}
        />
      </>
    );
  }

  return (
    <>
      <div 
        className={`group relative bg-blue-500/30 backdrop-blur-sm rounded-2xl border border-white/40 hover:border-white/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out cursor-move ${
          isDragging ? 'opacity-10 scale-95' : ''
        }`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/60 group-hover:bg-white/60 transition-all duration-300">
              <span className="text-2xl">{getFileIcon(file.type)}</span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-white/40 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                <MoreVertical size={16} className="text-white/70" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-10 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 py-2 z-10">
                  <button
                    onClick={handlePreview}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/50 flex items-center space-x-2 transition-colors"
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={handleNameEdit}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/50 flex items-center space-x-2 transition-colors"
                  >
                    <Edit3 size={14} />
                    <span>Edit Name</span>
                  </button>
                  <button
                    onClick={handleTagsEdit}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/50 flex items-center space-x-2 transition-colors"
                  >
                    <Tag size={14} />
                    <span>Edit Tags</span>
                  </button>
                  <button
                    onClick={() => setShowFolderPicker(true)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/50 flex items-center space-x-2 transition-colors"
                  >
                    <Folder size={14} />
                    <span>Move to Folder</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-2">
            {/* File Name - Editable */}
            <div className="flex items-center space-x-2 mb-1">
              {isEditingName ? (
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    onKeyDown={handleNameKeyPress}
                    className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleNameSave}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={handleNameCancel}
                    className="p-1 text-gray-500 hover:bg-gray-50 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <h3 
                    className="text-sm font-medium text-white line-clamp-2 flex-1 cursor-pointer hover:text-blue-300 transition-colors"
                    onClick={handleNameEdit}
                    title="Click to edit name"
                  >
                    {file.name}
                  </h3>
                  {file.aiSuggested && (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full flex-shrink-0 border border-blue-400/30">
                      <Sparkles size={10} />
                      <span>AI</span>
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-2 text-xs text-white/70">
            <div className="flex items-center justify-between">
              <span className="text-white/80">{formatFileSize(file.size)}</span>
              <span className="text-white/60">{formatDate(file.addedDate)}</span>
            </div>
            
            {/* Folder - Clickable to change */}
            <div 
              className="flex items-center space-x-1 cursor-pointer hover:text-blue-300 transition-colors"
              onClick={() => setShowFolderPicker(true)}
              title="Click to change folder"
            >
              <Folder size={12} className="text-white/60" />
              <span className="truncate text-white/70">{folders.find(f => f.id === file.folder)?.name || file.folder}</span>
            </div>
            
            {/* Tags - Editable */}
            {isEditingTags ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {editableTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyPress}
                    placeholder="Add tag..."
                    className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addTag}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus size={10} />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleTagsSave}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleTagsCancel}
                    className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center space-x-1 cursor-pointer hover:text-blue-300 transition-colors"
                onClick={handleTagsEdit}
                title="Click to edit tags"
              >
                <Tag size={12} className="text-white/60" />
                <span className="truncate text-white/70">
                  {file.tags.length > 0 ? (
                    <>
                      {file.tags.slice(0, 2).join(', ')}
                      {file.tags.length > 2 && ` +${file.tags.length - 2}`}
                    </>
                  ) : (
                    <span className="text-white/50 italic">No tags - click to add</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Folder Picker Modal */}
      <FolderPicker
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSelect={handleMoveToFolder}
        fileType={file.type}
      />
    </>
  );
}
