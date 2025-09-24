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
