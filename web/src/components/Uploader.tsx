import { useState, useRef } from 'react';
import { X, Upload, FileText, Image, Video, Music, File, Loader2 } from 'lucide-react';
import { useAppStore } from '../state/store';
import { generateId, getFileType, formatFileSize } from '../lib/utils';
import { suggestFilename } from '../lib/api';
import toast from 'react-hot-toast';

interface UploaderProps {
  onClose: () => void;
}

export function Uploader({ onClose }: UploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setProcessedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addFile } = useAppStore();

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const fileArray = Array.from(selectedFiles);
    setFiles(prev => [...prev, ...fileArray]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setIsProcessing(true);
    const processed: any[] = [];

    for (const file of files) {
      try {
        const fileType = getFileType(file);
        
        // Get AI-powered filename suggestion
        const suggestion = await suggestFilename({
          name: file.name,
          type: fileType,
          size: file.size,
        }, ''); // No content for file uploads
        
        const fileObj = {
          id: generateId(),
          name: suggestion.suggestedName,
          originalName: file.name,
          type: fileType,
          size: file.size,
          tags: [],
          folder: 'Downloads',
          addedDate: new Date(),
          url: URL.createObjectURL(file),
          confidence: suggestion.confidence,
          reasoning: suggestion.reasoning,
        };

        addFile(fileObj);
        processed.push(fileObj);
        
        // Show rename suggestion toast
        toast.success(
          `🤖 Renamed to ${suggestion.suggestedName}`,
          {
            duration: 5000
          }
        );

        
        // Show post-download action prompt
        setTimeout(() => {
          const actions = [];
          
          if (fileType === 'video' || fileType === 'audio') {
            actions.push({
              label: 'Play',
              onClick: () => {
                window.open(fileObj.url, '_blank');
              }
            });
          } else {
            actions.push({
              label: 'Open',
              onClick: () => {
                window.open(fileObj.url, '_blank');
              }
            });
          }
          
          actions.push({
            label: 'Organize',
            onClick: () => {
              // TODO: Open organize dialog
              toast.success('Organize feature coming soon!');
            }
          });

          toast.success(
            'File uploaded successfully',
            {
              duration: 4000
            }
          );
        }, 1500);

      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setProcessedFiles(processed);
    setFiles([]);
    setIsProcessing(false);
    
    // Close after a delay to show all toasts
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    const type = getFileType(file);
    switch (type) {
      case 'pdf': return <FileText size={20} className="text-red-500" />;
      case 'image': return <Image size={20} className="text-green-500" />;
      case 'video': return <Video size={20} className="text-purple-500" />;
      case 'audio': return <Music size={20} className="text-blue-500" />;
      default: return <File size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-documents-blue bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF, images, videos, audio, and documents
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isProcessing}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                `Upload ${files.length > 0 ? `(${files.length})` : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
