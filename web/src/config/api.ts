/**
 * API Configuration
 * 
 * This file manages the API base URL for different environments.
 * Set VITE_API_URL environment variable to override default behavior.
 */

const getApiBaseUrl = (): string => {
  // Check for environment variable first (production)
  const viteApiUrl = (import.meta as any).env?.VITE_API_URL;
  if (viteApiUrl) {
    return viteApiUrl;
  }

  // Development fallback
  const isDev = (import.meta as any).env?.DEV;
  if (isDev) {
    return 'http://localhost:5174';
  }

  // Production fallback - same origin (Vercel deployment)
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // Content Processing
  extract: `${API_BASE_URL}/api/extract`,
  generatePdf: `${API_BASE_URL}/api/generate-pdf`,
  analyze: `${API_BASE_URL}/api/analyze`,
  
  // AI Services
  summarize: `${API_BASE_URL}/api/summarize`,
  qa: `${API_BASE_URL}/api/qa`,
  translate: `${API_BASE_URL}/api/translate`,
  
  // RAG Services
  ragProcess: `${API_BASE_URL}/rag/process`,
  agentRag: `${API_BASE_URL}/api/agent-rag`,
  
  // File Management
  suggestFilename: `${API_BASE_URL}/api/suggest-filename`,
  
  // Search
  search: `${API_BASE_URL}/api/search`,
  searchDocuments: `${API_BASE_URL}/api/search/documents`,
  searchWeb: `${API_BASE_URL}/api/search/web`,
  searchStats: `${API_BASE_URL}/api/search/stats`,
  searchIndex: `${API_BASE_URL}/api/search/index`,
  
  // OpenELM
  openelmStatus: `${API_BASE_URL}/api/openelm/status`,
  openelmModels: `${API_BASE_URL}/api/openelm/models`,
  openelmStrategies: `${API_BASE_URL}/api/openelm/strategies`,
  openelmGenerate: `${API_BASE_URL}/api/openelm/generate`,
  openelmCompare: `${API_BASE_URL}/api/openelm/compare`,
  openelmRecommend: `${API_BASE_URL}/api/openelm/recommend`,
  
  // Phoenix Observability
  phoenixStatus: `${API_BASE_URL}/phoenix/status`,
  phoenixTest: `${API_BASE_URL}/phoenix/test`,
  
  // Todos
  todos: `${API_BASE_URL}/api/todos`,
} as const;

export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 30000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Helper function for API calls
export const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetchWithTimeout(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};

