import { FileItem } from '../state/store';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileType(file: File): string {
  const type = file.type;
  
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type === 'application/pdf') return 'pdf';
  if (type.startsWith('text/')) return 'text';
  if (type.includes('word') || type.includes('document')) return 'document';
  if (type.includes('spreadsheet') || type.includes('excel')) return 'spreadsheet';
  if (type.includes('presentation') || type.includes('powerpoint')) return 'presentation';
  
  return 'file';
}

export function suggestFileName(file: File, content?: string): string {
  const originalName = file.name;
  const extension = originalName.split('.').pop() || '';
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  
  // Clean up the base name
  let cleanName = baseName
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w{8,}\b/g, '') // Remove long words (likely IDs/hashes)
    .replace(/\b(copy|copy\s+\d+|\(\d+\))\b/gi, '') // Remove copy indicators
    .replace(/\s+/g, ' ')
    .trim();
  
  // If we have content, try to extract a better name
  if (content && content.length > 50) {
    // Look for title patterns
    const titleMatch = content.match(/^(?:#\s*)?(.+?)(?:\n|$)/m);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      if (title.length > 5 && title.length < 60) {
        cleanName = title;
      }
    }
  }
  
  // Add type prefix based on content or file type
  const fileType = getFileType(file);
  let prefix = '';
  
  if (content) {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('invoice') || lowerContent.includes('bill')) {
      prefix = 'Invoice_';
    } else if (lowerContent.includes('report') || lowerContent.includes('summary')) {
      prefix = 'Report_';
    } else if (lowerContent.includes('contract') || lowerContent.includes('agreement')) {
      prefix = 'Contract_';
    }
  }
  
  if (!prefix) {
    switch (fileType) {
      case 'image': prefix = 'Image_'; break;
      case 'document': prefix = 'Document_'; break;
      case 'pdf': prefix = 'Document_'; break;
      case 'spreadsheet': prefix = 'Spreadsheet_'; break;
      case 'presentation': prefix = 'Presentation_'; break;
    }
  }
  
  // Add date if it looks like a document
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  
  let finalName = prefix + cleanName;
  if (prefix && !finalName.includes(dateStr)) {
    finalName += `_${dateStr}`;
  }
  
  // Limit length
  if (finalName.length > 60) {
    finalName = finalName.substring(0, 57) + '...';
  }
  
  return finalName + (extension ? `.${extension}` : '');
}

export function getFileIcon(type: string): string {
  switch (type) {
    case 'pdf': return '📄';
    case 'image': return '🖼️';
    case 'video': return '🎥';
    case 'audio': return '🎵';
    case 'text': return '📝';
    case 'document': return '📄';
    case 'spreadsheet': return '📊';
    case 'presentation': return '📽️';
    default: return '📁';
  }
}

export function calculateMetrics(files: FileItem[], events: any[]): any {
  const totalFiles = files.length;
  const totalSummaries = files.filter(f => f.type === 'text' && f.name.includes('summary')).length;
  
  const assistantEvents = events.filter(e => 
    e.event.includes('assistant') && e.event !== 'assistant_error'
  );
  const sessionsWithAssistant = new Set(
    assistantEvents.map(e => e.timestamp.toDateString())
  ).size;
  
  const totalSessions = new Set(
    events.map(e => e.timestamp.toDateString())
  ).size;
  
  const renameEvents = events.filter(e => e.event === 'download_rename_suggested');
  const acceptedRenames = renameEvents.filter(e => e.data?.accepted).length;
  const renameAcceptanceRate = renameEvents.length > 0 
    ? (acceptedRenames / renameEvents.length) * 100 
    : 0;
  
  const organizeEvents = events.filter(e => e.event === 'download_action_click' && e.data?.action === 'organize');
  const organizeActionRate = totalFiles > 0 ? (organizeEvents.length / totalFiles) * 100 : 0;
  
  const assistantUsageRate = totalSessions > 0 ? (sessionsWithAssistant / totalSessions) * 100 : 0;
  const assetsCapturedPerSession = totalSessions > 0 ? (totalFiles + totalSummaries) / totalSessions : 0;
  
  return {
    sessionsWithAssistant,
    totalSessions,
    assistantUsageRate: Math.round(assistantUsageRate),
    renameAcceptanceRate: Math.round(renameAcceptanceRate),
    organizeActionRate: Math.round(organizeActionRate),
    assetsCapturedPerSession: Math.round(assetsCapturedPerSession * 10) / 10,
    totalFiles,
    totalSummaries,
  };
}
