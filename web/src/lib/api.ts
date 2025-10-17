import { ExtractedContent, SummaryResponse, QAResponse, SearchRequest, SearchResponse, DocumentSearchResult, WebSearchResult } from './types';
import { API_BASE_URL } from '../config/api';

const API_BASE = API_BASE_URL;

export async function extractPageContent(url: string): Promise<ExtractedContent> {
  const response = await fetch(`${API_BASE}/api/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`Failed to extract content: ${response.statusText}`);
  }

  return response.json();
}

export async function summarizeContent(text: string, cloudAI: boolean): Promise<SummaryResponse> {
  const response = await fetch(`${API_BASE}/api/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, cloudAI }),
  });

  if (!response.ok) {
    throw new Error(`Failed to summarize content: ${response.statusText}`);
  }

  return response.json();
}

export async function answerQuestion(text: string, question: string, cloudAI: boolean): Promise<QAResponse> {
  const response = await fetch(`${API_BASE}/api/qa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, question, cloudAI }),
  });

  if (!response.ok) {
    throw new Error(`Failed to answer question: ${response.statusText}`);
  }

  return response.json();
}

export async function suggestFilename(file: any, content?: string): Promise<{
  suggestedName: string;
  confidence: number;
  reasoning: string;
  success: boolean;
}> {
  const response = await fetch(`${API_BASE}/api/suggest-filename`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file, content }),
  });

  if (!response.ok) {
    throw new Error(`Failed to suggest filename: ${response.statusText}`);
  }

  return response.json();
}

// RAG API functions
export async function getRAGStrategies(): Promise<{ strategies: any[] }> {
  const response = await fetch(`${API_BASE}/api/rag/strategies`);
  if (!response.ok) {
    throw new Error(`Failed to get RAG strategies: ${response.statusText}`);
  }
  return response.json();
}

export async function detectDevice(): Promise<{
  deviceInfo: any;
  optimalStrategy: string;
  shouldUseLocal: boolean;
  recommendations: any;
}> {
  const response = await fetch(`${API_BASE}/api/rag/detect-device`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contentLength: document.body.innerText.length,
      additionalInfo: {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown'
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to detect device: ${response.statusText}`);
  }
  return response.json();
}

export async function processWithRAG(content: string, question: string, strategyName?: string, cloudAI: boolean = true): Promise<{
  answer: string;
  sources: any[];
  strategy: string;
  confidence: number;
  processingTime: number;
  deviceInfo: any;
}> {
  const response = await fetch(`${API_BASE}/api/rag/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, question, strategyName, cloudAI }),
  });

  if (!response.ok) {
    throw new Error(`Failed to process with RAG: ${response.statusText}`);
  }
  return response.json();
}

export async function translateContent(text: string, targetLanguage: string, cloudAI: boolean): Promise<{
  translation: string;
  success: boolean;
  error?: string;
}> {
  const response = await fetch(`${API_BASE}/api/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, targetLanguage, cloudAI }),
  });

  if (!response.ok) {
    throw new Error(`Failed to translate content: ${response.statusText}`);
  }
  return response.json();
}

export async function analyzeForInsights(text: string, cloudAI: boolean): Promise<{
  insights: string;
  success: boolean;
  error?: string;
}> {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, cloudAI }),
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze content: ${response.statusText}`);
  }
  return response.json();
}

export async function createTodos(text: string, cloudAI: boolean): Promise<{
  todos: string;
  success: boolean;
  error?: string;
}> {
  const response = await fetch(`${API_BASE}/api/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, cloudAI }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create todos: ${response.statusText}`);
  }
  return response.json();
}

export interface GeneratePdfPayload {
  url?: string;
  html?: string;
  title?: string;
  downloadName?: string;
  cloudAI?: boolean;
  emulateMedia?: 'screen' | 'print';
}

export interface GeneratePdfResponse {
  success: boolean;
  fileId?: string;
  suggestedName?: string;
  originalName?: string;
  summary?: string;
  tags?: string[];
  pdfData?: string;
  size?: number;
  title?: string | null;
  sourceUrl?: string | null;
  error?: string;
}

export async function generatePdf(payload: GeneratePdfPayload): Promise<GeneratePdfResponse> {
  const response = await fetch(`${API_BASE}/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate PDF: ${response.statusText}`);
  }
  return response.json();
}

// OpenELM API functions
export async function getOpenELMStatus(): Promise<{
  success: boolean;
  data: {
    service: any;
    availableModels: number;
    models: any[];
    strategies: number;
    strategyList: any[];
  };
}> {
  const response = await fetch(`${API_BASE}/openelm/status`);
  if (!response.ok) {
    throw new Error(`Failed to get OpenELM status: ${response.statusText}`);
  }
  return response.json();
}

export async function getOpenELMStrategies(profile?: string, deviceOptimized?: boolean): Promise<{
  success: boolean;
  data: {
    strategies: any[];
    total: number;
  };
}> {
  const params = new URLSearchParams();
  if (profile) params.append('profile', profile);
  if (deviceOptimized !== undefined) params.append('deviceOptimized', deviceOptimized.toString());
  
  const response = await fetch(`${API_BASE}/openelm/strategies?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to get OpenELM strategies: ${response.statusText}`);
  }
  return response.json();
}

export async function generateWithOpenELM(modelId: string, prompt: string, options?: any): Promise<{
  success: boolean;
  data: {
    text: string;
    modelId: string;
    usage?: any;
    processingTime: number;
  };
  error?: string;
}> {
  const response = await fetch(`${API_BASE}/openelm/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ modelId, prompt, options }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate with OpenELM: ${response.statusText}`);
  }
  return response.json();
}

// Search API functions
export async function unifiedSearch(request: SearchRequest): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to search: ${response.statusText}`);
  }
  return response.json();
}

export async function searchDocuments(query: string, filters?: SearchRequest['filters'], limit?: number): Promise<{
  success: boolean;
  documents: DocumentSearchResult[];
  totalDocuments: number;
  query: string;
}> {
  const response = await fetch(`${API_BASE}/search/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, filters, limit }),
  });

  if (!response.ok) {
    throw new Error(`Failed to search documents: ${response.statusText}`);
  }
  return response.json();
}

export async function searchWeb(query: string, limit?: number): Promise<{
  success: boolean;
  web: WebSearchResult[];
  totalWeb: number;
  query: string;
}> {
  const response = await fetch(`${API_BASE}/search/web`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, limit }),
  });

  if (!response.ok) {
    throw new Error(`Failed to search web: ${response.statusText}`);
  }
  return response.json();
}

export async function getSearchStats(): Promise<{
  success: boolean;
  stats: any;
}> {
  const response = await fetch(`${API_BASE}/search/stats`);

  if (!response.ok) {
    throw new Error(`Failed to get search stats: ${response.statusText}`);
  }
  return response.json();
}

export async function indexDocument(file: any): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await fetch(`${API_BASE}/search/index`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file }),
  });

  if (!response.ok) {
    throw new Error(`Failed to index document: ${response.statusText}`);
  }
  return response.json();
}

export async function removeDocumentFromIndex(documentId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await fetch(`${API_BASE}/search/index/${documentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to remove document from index: ${response.statusText}`);
  }
  return response.json();
}

export async function getDocumentFilters(): Promise<{
  success: boolean;
  filters: {
    documentTypes: Array<{ value: string; count: number }>;
    folders: Array<{ value: string; count: number }>;
    fileExtensions: Array<{ value: string; count: number }>;
    contentTypes: {
      images: number;
      documents: number;
    };
  };
}> {
  const response = await fetch(`${API_BASE}/search/filters`);

  if (!response.ok) {
    throw new Error(`Failed to get document filters: ${response.statusText}`);
  }
  return response.json();
}

export async function indexLibraryFiles(files: any[]): Promise<{
  success: boolean;
  message: string;
  results: Array<{ id: string; name: string; success: boolean; error?: string }>;
  stats: {
    total: number;
    successful: number;
    failed: number;
  };
}> {
  const response = await fetch(`${API_BASE}/search/index-library`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ files }),
  });

  if (!response.ok) {
    throw new Error(`Failed to index library files: ${response.statusText}`);
  }
  return response.json();
}
