export interface ExtractedContent {
  title: string;
  byline: string;
  content: string;
  text: string;
  domain: string;
  favicon?: string;
}

export interface SummaryResponse {
  summary: string;
  success: boolean;
  error?: string;
  method?: string;
}

export interface QAResponse {
  answer: string;
  success: boolean;
  error?: string;
  method?: string;
}

export interface FileUpload {
  file: File;
  id: string;
  originalName: string;
  suggestedName: string;
  accepted: boolean;
}

export interface Metrics {
  sessionsWithAssistant: number;
  totalSessions: number;
  assistantUsageRate: number;
  renameAcceptanceRate: number;
  organizeActionRate: number;
  assetsCapturedPerSession: number;
  totalFiles: number;
  totalSummaries: number;
}

// Search Types
export interface DocumentSearchResult {
  id: string;
  name: string;
  originalName?: string;
  type: string;
  snippet: string;
  highlightedSnippet: string;
  score: number;
  folder: string;
  tags: string[];
  addedDate: string;
  summary?: string;
  content?: string;
  // Additional metadata
  fileExtension?: string;
  isImage?: boolean;
  isDocument?: boolean;
  wordCount?: number;
  size?: number;
  url?: string;
  blob?: Blob; // For PDF preview
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  favicon?: string;
  score: number;
}

export interface SearchRequest {
  query: string;
  filters?: {
    documentTypes?: string[];
    dateRange?: { from: Date; to: Date };
    folders?: string[];
    fileTypes?: string[];
    contentTypes?: ('images' | 'documents')[];
    minWordCount?: number;
    maxWordCount?: number;
  };
  limit?: number;
  includeWeb?: boolean;
}

export interface SearchResponse {
  documents: DocumentSearchResult[];
  web: WebSearchResult[];
  totalDocuments: number;
  totalWeb: number;
  processingTime: number;
  query: string;
  success: boolean;
}

export interface SearchState {
  searchQuery: string;
  searchMode: 'url' | 'search';
  documentResults: DocumentSearchResult[];
  webResults: WebSearchResult[];
  isSearching: boolean;
  searchHistory: string[];
  lastSearchTime: number;
}
