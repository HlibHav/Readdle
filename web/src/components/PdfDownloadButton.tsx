import { useState, useEffect, useRef } from 'react';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { generatePdf } from '../lib/api';
import { useAppStore } from '../state/store';
import { FileItem } from '../state/store';
import { FolderPicker } from './FolderPicker';

interface PdfDownloadButtonProps {
  url: string;
  title?: string;
  content?: string;
}

export function PdfDownloadButton({ url, title, content }: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [downloadResult, setDownloadResult] = useState<any>(null);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editableTags, setEditableTags] = useState<string[]>([]);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const { addFile, updateFile, logEvent, cloudAI } = useAppStore();
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle auto-close timeout
  useEffect(() => {
    if (showToast && downloadResult?.showActions && !isEditingName && !isEditingTags) {
      // Clear any existing timeout
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
      
      // Set new timeout for 30 seconds
      autoCloseTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 30000);
    }

    // Clear timeout when editing starts
    if (isEditingName || isEditingTags) {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, [showToast, downloadResult?.showActions, isEditingName, isEditingTags]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePdf(url, title, content, cloudAI);
      
      if (result.success && result.pdfData) {
        // Convert base64 to blob and download
        const byteCharacters = atob(result.pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create download link
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = result.suggestedName || result.originalName || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        // Create file item for library
        const fileItem: FileItem = {
          id: result.fileId || `pdf_${Date.now()}`,
          name: result.suggestedName || result.originalName || 'document.pdf',
          originalName: result.originalName || 'document.pdf',
          type: 'pdf',
          size: byteArray.length,
          tags: result.tags || [],
          folder: 'Downloads',
          addedDate: new Date(),
          aiSuggested: true,
          aiRenameAccepted: true,
          summary: result.summary,
          url: url, // Store the original URL for reference
          content: result.pdfData // Store the PDF data for preview
        };

        // Debug: Check if PDF data is available
        console.log('📄 PDF Data available:', !!result.pdfData);
        console.log('📄 PDF Data length:', result.pdfData?.length || 0);
        console.log('📄 PDF Data preview (first 100 chars):', result.pdfData?.substring(0, 100));
        console.log('📄 File item content length:', fileItem.content?.length || 0);
        
        // Store PDF data in sessionStorage for preview (larger than localStorage)
        if (result.pdfData) {
          try {
            sessionStorage.setItem(`pdf_${fileItem.id}`, result.pdfData);
            console.log('💾 PDF data stored in sessionStorage for preview');
          } catch (error) {
            console.error('Failed to store PDF data in sessionStorage:', error);
            // If sessionStorage fails, we'll still have the data in memory temporarily
          }
        }

        // Add to library
        addFile(fileItem);

        // Log rename event
        logEvent('pdf_download_rename', {
          file_id: fileItem.id,
          original_name: fileItem.originalName,
          ai_name: fileItem.name,
          rename_accepted: true,
          undo_clicked: false
        });

        // Show toast with post-download actions
        setDownloadResult({
          file: fileItem,
          showActions: true,
          originalSuggestedName: result.suggestedName,
          originalTags: result.tags || []
        });
        setEditableName(result.suggestedName || result.originalName || 'document.pdf');
        setEditableTags(result.tags || []);
        setShowToast(true);

      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Show error toast
      setDownloadResult({
        error: error instanceof Error ? error.message : 'Failed to generate PDF'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenFile = () => {
    if (downloadResult?.file) {
      // Try to get PDF data from sessionStorage first, then fallback to file.content
      let pdfData = null;
      
      try {
        pdfData = sessionStorage.getItem(`pdf_${downloadResult.file.id}`);
        console.log('📄 PDF data from sessionStorage for open:', !!pdfData, pdfData?.length || 0);
      } catch (error) {
        console.error('Error accessing sessionStorage:', error);
      }
      
      // Fallback to file.content if sessionStorage doesn't have it
      if (!pdfData && downloadResult.file.content) {
        pdfData = downloadResult.file.content;
        console.log('📄 Using fallback PDF data from file.content for open');
      }
      
      if (pdfData) {
        try {
          // Convert base64 to blob and open PDF in new tab
          const byteCharacters = atob(pdfData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          const newWindow = window.open(url, '_blank');
          if (newWindow) {
            // Clean up the URL after a delay to free memory
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }
          
          // Log action
          logEvent('pdf_post_download_action', {
            file_id: downloadResult.file.id,
            action_chosen: 'open',
            folder_target: null
          });
          
          setShowToast(false);
        } catch (error) {
          console.error('Error opening PDF:', error);
          alert('Unable to open PDF. The file data may be corrupted.');
        }
      } else {
        alert('PDF content not available for preview.');
      }
    }
  };

  const handleOrganize = () => {
    if (downloadResult?.file) {
      setShowFolderPicker(true);
      setShowToast(false);
    }
  };

  const handleFolderSelect = (folderId: string, folderName: string) => {
    if (downloadResult?.file) {
      // Move file to selected folder
      updateFile(downloadResult.file.id, { folder: folderId });
      
      // Log action
      logEvent('pdf_post_download_action', {
        file_id: downloadResult.file.id,
        action_chosen: 'organize',
        folder_target: folderId
      });

      // Show confirmation toast
      setDownloadResult({
        ...downloadResult,
        showConfirmation: true,
        confirmationMessage: `Moved to ${folderName} ✅`,
        confirmationFolderId: folderId,
        confirmationFolderName: folderName
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleUndoMove = () => {
    if (downloadResult?.file && downloadResult.confirmationFolderId) {
      // Move back to Downloads
      updateFile(downloadResult.file.id, { folder: 'default' });
      
      // Log undo action
      logEvent('pdf_post_download_action', {
        file_id: downloadResult.file.id,
        action_chosen: 'undo_move',
        folder_target: 'default'
      });
      
      setShowToast(false);
    }
  };

  const handleUndoRename = () => {
    if (downloadResult?.file) {
      // Revert to original name
      updateFile(downloadResult.file.id, { 
        name: downloadResult.file.originalName,
        aiSuggested: false,
        aiRenameAccepted: false,
        undoClicked: true
      });
      
      // Log undo event
      logEvent('pdf_download_rename', {
        file_id: downloadResult.file.id,
        original_name: downloadResult.file.originalName,
        ai_name: downloadResult.file.name,
        rename_accepted: false,
        undo_clicked: true
      });
      
      setShowToast(false);
    }
  };

  const handleSaveEditedName = () => {
    if (downloadResult?.file && editableName.trim()) {
      const newName = editableName.trim().endsWith('.pdf') ? editableName.trim() : `${editableName.trim()}.pdf`;
      
      updateFile(downloadResult.file.id, { 
        name: newName,
        tags: editableTags, // Save current tags as well
        aiSuggested: false, // User edited, so not AI suggested anymore
        aiRenameAccepted: false
      });
      
      // Log user edit event
      logEvent('pdf_download_rename', {
        file_id: downloadResult.file.id,
        original_name: downloadResult.file.originalName,
        ai_name: downloadResult.originalSuggestedName,
        user_edited_name: newName,
        tags: editableTags,
        rename_accepted: true,
        undo_clicked: false,
        user_edited: true
      });
      
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditableName(downloadResult?.originalSuggestedName || downloadResult?.file?.name || '');
    setIsEditingName(false);
  };

  const handleSaveEditedTags = () => {
    if (downloadResult?.file) {
      updateFile(downloadResult.file.id, { 
        tags: editableTags
      });
      
      // Log tag edit event
      logEvent('pdf_tags_edited', {
        file_id: downloadResult.file.id,
        original_tags: downloadResult.originalTags,
        new_tags: editableTags,
        tags_added: editableTags.length - (downloadResult.originalTags?.length || 0)
      });
      
      setIsEditingTags(false);
    }
  };

  const handleCancelTagEdit = () => {
    setEditableTags(downloadResult?.originalTags || []);
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
    }
  };

  console.log('PdfDownloadButton rendered with URL:', url);

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        style={{ minWidth: '120px', zIndex: 10 }}
      >
        {isGenerating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        <span>{isGenerating ? 'Generating PDF...' : 'Save as PDF'}</span>
      </button>

      {/* Toast Notification */}
      {showToast && downloadResult && (
        <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 max-w-sm z-50 ${
          (isEditingName || isEditingTags) ? 'border-blue-300 shadow-xl' : 'border-gray-200'
        }`}>
          {downloadResult.error ? (
            <div className="text-red-600">
              <p className="font-medium">Error</p>
              <p className="text-sm">{downloadResult.error}</p>
            </div>
          ) : downloadResult.showConfirmation ? (
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">{downloadResult.confirmationMessage}</p>
              <button
                onClick={handleUndoMove}
                className="text-sm text-blue-600 hover:text-blue-800 underline ml-2"
              >
                Undo
              </button>
            </div>
          ) : downloadResult.showActions ? (
            <div className="space-y-3">
              {/* Rename Success */}
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">AI renamed your PDF!</p>
                  {(isEditingName || isEditingTags) && (
                    <p className="text-xs text-blue-600">✏️ Editing mode - toast won't auto-close</p>
                  )}
                  {isEditingName ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="text"
                        value={editableName}
                        onChange={(e) => setEditableName(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEditedName}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        "{downloadResult.file.name}"
                      </p>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleUndoRename}
                  className="text-xs text-gray-600 hover:text-gray-800 underline ml-2"
                >
                  Undo
                </button>
              </div>

              {/* Tags Section */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Tags</p>
                  {!isEditingTags && (
                    <button
                      onClick={() => setIsEditingTags(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
                
                {isEditingTags ? (
                  <div className="space-y-2">
                    {/* Current Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
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
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    
                    {/* Add New Tag */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                        placeholder="Add tag..."
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={addTag}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    
                    {/* Save/Cancel */}
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEditedTags}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save Tags
                      </button>
                      <button
                        onClick={handleCancelTagEdit}
                        className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {editableTags.length > 0 ? (
                      editableTags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No tags</span>
                    )}
                  </div>
                )}
              </div>

              {/* Post-Download Actions */}
              <div className="space-y-2 border-t border-gray-100 pt-3">
                <p className="text-sm text-gray-600">What would you like to do next?</p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleOpenFile}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm font-medium transition-colors"
                  >
                    Open
                  </button>
                  <button
                    onClick={handleOrganize}
                    className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 text-sm font-medium transition-colors"
                  >
                    Organize
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          
          {/* Close button */}
          <button
            onClick={() => setShowToast(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Folder Picker Modal */}
      <FolderPicker
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSelect={handleFolderSelect}
        fileType="pdf"
      />
    </>
  );
}
