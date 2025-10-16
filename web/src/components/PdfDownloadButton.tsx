import { useState, useEffect, useRef } from 'react';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { useAppStore } from '../state/store';
import { FileItem } from '../state/store';
import { FolderPicker } from './FolderPicker';
import jsPDF from 'jspdf';
import { generatePdf, GeneratePdfResponse } from '../lib/api';

interface PdfDownloadButtonProps {
  url: string;
  title?: string;
  content?: string;
}

interface DownloadResultState {
  file?: FileItem;
  showActions?: boolean;
  originalSuggestedName?: string;
  originalTags?: string[];
  previewUrl?: string;
  pdfBase64?: string;
  error?: string;
  showConfirmation?: boolean;
  confirmationMessage?: string;
  confirmationFolderId?: string;
  confirmationFolderName?: string;
}

interface ParsedImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface ParsedHtmlContent {
  headings: string[];
  paragraphs: string[];
  images: ParsedImage[];
  fallbackText: string;
}

const MAX_LOCAL_IMAGES = 4;

function base64ToBlob(base64: string, mimeType = 'application/pdf'): Blob {
  try {
    // Clean the base64 string - remove any whitespace or invalid characters
    const cleanBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');
    
    // Validate base64 format
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
      throw new Error('Invalid base64 format');
    }
    
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    console.error('Base64 string length:', base64.length);
    console.error('Base64 preview:', base64.substring(0, 100) + '...');
    throw new Error(`Failed to convert base64 to blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function triggerFileDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
}

function sanitizeDownloadName(name: string, fallback = 'document.pdf'): string {
  if (!name) return fallback;
  const normalized = name.replace(/\.pdf$/i, '');
  const cleaned = normalized
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return fallback;
  }

  const truncated = cleaned.length > 96 ? cleaned.slice(0, 96) : cleaned;
  return `${truncated}.pdf`;
}

function storePdfInSession(fileId: string, base64: string) {
  try {
    sessionStorage.setItem(`pdf_${fileId}`, base64);
  } catch (error) {
    console.warn('Unable to persist PDF in sessionStorage:', error);
  }
}

function readPdfFromSession(fileId: string): string | null {
  try {
    return sessionStorage.getItem(`pdf_${fileId}`);
  } catch (error) {
    console.warn('Unable to read PDF from sessionStorage:', error);
  }

  return null;
}

function parseHtmlContent(html?: string): ParsedHtmlContent {
  const emptyResult: ParsedHtmlContent = {
    headings: [],
    paragraphs: [],
    images: [],
    fallbackText: 'PDF generated from browser content. No additional text was available.'
  };

  if (!html) {
    return emptyResult;
  }

  try {
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(html, 'text/html');
    const fallbackText =
      parsedDocument.body?.textContent?.replace(/\s+/g, ' ').trim() ||
      emptyResult.fallbackText;

    const headings = Array.from(parsedDocument.querySelectorAll('h1, h2, h3'))
      .map((el) => el.textContent?.trim())
      .filter((text): text is string => Boolean(text));

    const uniqueHeadings = Array.from(new Set(headings)).slice(0, 6);

    const paragraphs = Array.from(parsedDocument.querySelectorAll('p, li'))
      .map((el) => el.textContent?.trim())
      .filter((text): text is string => Boolean(text));

    const uniqueParagraphs = Array.from(new Set(paragraphs)).slice(0, 40);

    const images = Array.from(parsedDocument.querySelectorAll('img'))
      .map((img): ParsedImage | null => {
        const src = img.getAttribute('src') || '';
        if (!src || src.startsWith('data:image/svg')) {
          return null;
        }

        const widthAttr = parseInt(img.getAttribute('width') || '', 10);
        const heightAttr = parseInt(img.getAttribute('height') || '', 10);
        const width = Number.isFinite(widthAttr) && widthAttr > 0 ? widthAttr : 1024;
        const height = Number.isFinite(heightAttr) && heightAttr > 0 ? heightAttr : 768;
        const alt = (img.getAttribute('alt') || '').trim();

        return {
          src,
          alt,
          width,
          height
        };
      })
      .filter((img): img is ParsedImage => Boolean(img));

    return {
      headings: uniqueHeadings,
      paragraphs: uniqueParagraphs,
      images,
      fallbackText
    };
  } catch (error) {
    console.warn('Failed to parse HTML content for local PDF fallback:', error);
    return emptyResult;
  }
}

function buildTextSegments(parsed: ParsedHtmlContent): string[] {
  const segments: string[] = [];

  if (parsed.headings.length > 0) {
    segments.push('Highlights:');
    segments.push(...parsed.headings);
  }

  if (parsed.paragraphs.length > 0) {
    if (segments.length > 0) {
      segments.push('');
    }
    segments.push('Content:');
    segments.push(...parsed.paragraphs);
  }

  if (segments.length === 0) {
    segments.push(parsed.fallbackText);
  }

  return segments;
}

async function appendImagesToDocument(
  doc: jsPDF,
  images: ParsedImage[],
  cursorY: number,
  margin: number,
  usableWidth: number
): Promise<number> {
  if (!images.length) {
    return cursorY;
  }

  const pageHeight = doc.internal.pageSize.getHeight();
  const maxHeight = 110;

  for (const image of images.slice(0, MAX_LOCAL_IMAGES)) {
    const dataUrl = await fetchImageAsDataUrl(image.src);
    if (!dataUrl) {
      continue;
    }

    const aspectRatio = image.width / Math.max(image.height, 1);
    let drawWidth = Math.min(usableWidth, image.width);
    let drawHeight = drawWidth / aspectRatio;

    if (drawHeight > maxHeight) {
      drawHeight = maxHeight;
      drawWidth = drawHeight * aspectRatio;
    }

    if (drawWidth <= 0 || drawHeight <= 0 || !Number.isFinite(drawWidth) || !Number.isFinite(drawHeight)) {
      continue;
    }

    if (cursorY + drawHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }

    const format = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';

    try {
      doc.addImage(dataUrl, format as 'PNG' | 'JPEG', margin, cursorY, drawWidth, drawHeight);
    } catch (addImageError) {
      console.warn('Failed to embed image into local PDF:', addImageError);
      continue;
    }

    cursorY += drawHeight + 4;

    if (image.alt) {
      if (cursorY > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text(image.alt, margin, cursorY);
      cursorY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
    }
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  return cursorY;
}

async function fetchImageAsDataUrl(src: string): Promise<string | null> {
  if (!src) {
    return null;
  }

  // Return data URLs directly
  if (src.startsWith('data:')) {
    return src;
  }

  try {
    const response = await fetch(src, {
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image data'));
      reader.readAsDataURL(blob);
    });

    return dataUrl;
  } catch (error) {
    console.warn('Failed to fetch image for local PDF fallback:', src, error);
    return null;
  }
}

async function generatePdfLocally(params: {
  url: string;
  title?: string;
  content?: string;
}): Promise<GeneratePdfResponse> {
  const parsed = parseHtmlContent(params.content);
  const doc = new jsPDF('p', 'mm', 'a4');
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const heading = params.title || 'Document';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(heading, margin, cursorY);
  cursorY += 10;

  if (params.url) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Source: ${params.url}`, margin, cursorY);
    cursorY += 8;
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);

  const textSegments = buildTextSegments(parsed);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);

  textSegments.forEach((segment, index) => {
    const lineBlock = doc.splitTextToSize(segment || ' ', usableWidth);
    lineBlock.forEach((line: string) => {
      if (cursorY > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += 6;
    });
    if (index !== textSegments.length - 1) {
      cursorY += 2;
    }
  });

  cursorY += 4;
  cursorY = await appendImagesToDocument(doc, parsed.images, cursorY, margin, usableWidth);

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Generated locally | Page ${page} of ${totalPages}`,
      margin,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  const dataUri = doc.output('datauristring');
  const pdfBase64 = dataUri.split(',')[1] ?? '';

  const suggestedName = sanitizeDownloadName(`${heading}.pdf`);
  const summaryText =
    textSegments.filter(Boolean).join(' ').trim().slice(0, 400) ||
    parsed.fallbackText.slice(0, 400);

  return {
    success: true,
    pdfData: pdfBase64,
    fileId: `pdf_${Date.now()}`,
    suggestedName,
    originalName: suggestedName,
    tags: ['document'],
    summary: summaryText
  };
}

export function PdfDownloadButton({ url, title, content }: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [downloadResult, setDownloadResult] = useState<DownloadResultState | null>(null);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editableTags, setEditableTags] = useState<string[]>([]);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const { addFile, updateFile, cloudAI } = useAppStore();
  const autoCloseTimeoutRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (downloadResult?.previewUrl) {
        URL.revokeObjectURL(downloadResult.previewUrl);
      }
    };
  }, [downloadResult?.previewUrl]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      let response: GeneratePdfResponse | null = null;
      let usedFallback = false;

      try {
        response = await generatePdf(
          content
            ? {
                html: content,
                title,
                cloudAI,
                emulateMedia: 'screen',
                downloadName: title
              }
            : {
                url,
                title,
                cloudAI,
                emulateMedia: 'screen'
              }
        );
      } catch (serverError) {
        console.error('Server PDF generation failed, attempting local fallback:', serverError);
        response = await generatePdfLocally({ url, title, content });
        usedFallback = true;
      }

      if (!response || !response.success || !response.pdfData) {
        throw new Error(response?.error || 'Failed to generate PDF');
      }

      const fileId = response.fileId || `pdf_${Date.now()}`;
      const safeFileName = sanitizeDownloadName(
        response.suggestedName || response.originalName || title || 'document.pdf'
      );

      const pdfBlob = base64ToBlob(response.pdfData);
      triggerFileDownload(pdfBlob, safeFileName);

      storePdfInSession(fileId, response.pdfData);

      const fileItem: FileItem = {
        id: fileId,
        name: safeFileName,
        originalName: response.originalName || safeFileName,
        type: 'pdf',
        size: pdfBlob.size,
        tags: response.tags || (usedFallback ? ['document'] : []),
        folder: 'Downloads',
        addedDate: new Date(),
        aiSuggested:
          !usedFallback && Boolean(response.suggestedName && response.suggestedName !== response.originalName),
        aiRenameAccepted: false,
        summary: response.summary || (usedFallback ? 'Locally generated PDF.' : ''),
        url,
        content: response.pdfData,
        blob: pdfBlob
      };

      addFile(fileItem);

      if (downloadResult?.previewUrl) {
        URL.revokeObjectURL(downloadResult.previewUrl);
      }

      const previewUrl = URL.createObjectURL(pdfBlob);

      setDownloadResult({
        file: fileItem,
        showActions: true,
        originalSuggestedName: response.suggestedName || safeFileName,
        originalTags: response.tags || (usedFallback ? ['document'] : []),
        previewUrl,
        pdfBase64: response.pdfData
      });

      setEditableName(fileItem.name);
      setEditableTags(response.tags || (usedFallback ? ['document'] : []));
      setShowToast(true);
    } catch (error) {
      console.error('PDF generation failed:', error);
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
      const base64Data =
        downloadResult.pdfBase64 ||
        readPdfFromSession(downloadResult.file.id) ||
        (typeof downloadResult.file.content === 'string' ? downloadResult.file.content : null);

      if (!base64Data) {
        alert('PDF content not available for preview.');
        return;
      }

      try {
        const blob = base64ToBlob(base64Data);
        const objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
        setShowToast(false);
      } catch (error) {
        console.error('Error opening PDF:', error);
        alert('Unable to open PDF. The file data may be corrupted.');
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
    if (!downloadResult?.file) {
      return;
    }

    updateFile(downloadResult.file.id, { folder: folderId });

    setDownloadResult((prev) =>
      prev
        ? {
            ...prev,
            showConfirmation: true,
            confirmationMessage: `Moved to ${folderName} ✅`,
            confirmationFolderId: folderId,
            confirmationFolderName: folderName
          }
        : prev
    );
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleUndoMove = () => {
    if (downloadResult?.file && downloadResult.confirmationFolderId) {
      // Move back to Downloads
      updateFile(downloadResult.file.id, { folder: 'default' });
      
      
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
                        "{downloadResult.file?.name}"
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
                  {downloadResult?.previewUrl && (
                    <button
                      onClick={() => window.open(downloadResult.previewUrl, '_blank')}
                      className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 text-sm font-medium transition-colors"
                    >
                      Preview
                    </button>
                  )}
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
