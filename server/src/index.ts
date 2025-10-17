import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { phoenixInstrumentation } from './observability/phoenixInstrumentation.js';
import { extractPageContent } from './routes/extract.js';
import { summarizeContent } from './routes/summarize.js';
import { answerQuestion } from './routes/qa.js';
import { suggestFilename } from './routes/suggestFilename.js';
import { generatePdf } from './routes/generatePdf.js';
import { proxyContent } from './routes/proxy.js';
import { getRAGStrategies, getRAGStrategy, processWithRAG, detectDevice } from './routes/rag.js';
import { 
  processWithAgentRAG, 
  getAgentStrategies, 
  analyzeContentStructure, 
  selectOptimalStrategy,
  getAgentWorkflowStatus,
  getAgentMetrics
} from './routes/agentRag.js';
import { translateContent } from './routes/translate.js';
import { analyzeForInsights } from './routes/analyze.js';
import { createTodos } from './routes/todos.js';
import { 
  unifiedSearch, 
  searchDocuments, 
  searchWeb, 
  getSearchStats, 
  indexDocument, 
  removeDocument, 
  bulkIndexDocuments,
  indexAllDocuments,
  indexLibraryFiles,
  getDocumentFilters
} from './routes/search.js';
import sharedMemoryRouter from './routes/sharedMemory.js';
import phoenixRouter from './routes/phoenix.js';
import openelmRouter from './routes/openelm.js';

dotenv.config();

// Initialize Phoenix observability
phoenixInstrumentation.initialize();

const app = express();
const PORT = process.env.PORT || 5174;

// Configure CORS for production deployment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://web-obrqtyqdn-hlibhavs-projects.vercel.app'
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Manual CORS headers as backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === 'https://web-obrqtyqdn-hlibhavs-projects.vercel.app') {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '100mb' })); // Increase limit for large PDF data

// Routes
app.post('/api/extract', extractPageContent);
app.post('/api/summarize', summarizeContent);
app.post('/api/qa', answerQuestion);
app.post('/api/suggest-filename', suggestFilename);
app.post('/api/generate-pdf', generatePdf);
app.get('/api/proxy', proxyContent);

// RAG Routes
app.get('/api/rag/strategies', getRAGStrategies);
app.get('/api/rag/strategies/:strategyName', getRAGStrategy);
app.post('/api/rag/process', processWithRAG);
app.post('/api/rag/detect-device', detectDevice);

// Agent RAG Routes
app.post('/api/agent-rag/process', processWithAgentRAG);
app.get('/api/agent-rag/strategies', getAgentStrategies);
app.post('/api/agent-rag/analyze-content', analyzeContentStructure);

// New Action Routes
app.post('/api/translate', translateContent);
app.post('/api/analyze', analyzeForInsights);
app.post('/api/todos', createTodos);
app.post('/api/agent-rag/select-strategy', selectOptimalStrategy);
app.get('/api/agent-rag/workflow/:workflowId', getAgentWorkflowStatus);
app.get('/api/agent-rag/metrics', getAgentMetrics);

// Search Routes
app.post('/api/search', unifiedSearch);
app.post('/api/search/documents', searchDocuments);
app.post('/api/search/web', searchWeb);
app.get('/api/search/stats', getSearchStats);
app.get('/api/search/filters', getDocumentFilters);
app.post('/api/search/index', indexDocument);
app.delete('/api/search/index/:documentId', removeDocument);
app.post('/api/search/bulk-index', bulkIndexDocuments);
app.post('/api/search/index-all', indexAllDocuments);
app.post('/api/search/index-library', indexLibraryFiles);

// Shared Memory Routes
app.use('/shared-memory', sharedMemoryRouter);

// Phoenix Observability Routes
app.use('/api/phoenix', phoenixRouter);

// OpenELM Routes
app.use('/api/openelm', openelmRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
