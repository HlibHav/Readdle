import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { extractPageContent } from './routes/extract.js';
import { summarizeContent } from './routes/summarize.js';
import { answerQuestion } from './routes/qa.js';
import { suggestFilename } from './routes/suggestFilename.js';
import { generatePdf } from './routes/generatePdf.js';
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
import sharedMemoryRouter from './routes/sharedMemory.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json({ limit: '100mb' })); // Increase limit for large PDF data

// Routes
app.post('/extract', extractPageContent);
app.post('/summarize', summarizeContent);
app.post('/qa', answerQuestion);
app.post('/suggest-filename', suggestFilename);
app.post('/generate-pdf', generatePdf);

// RAG Routes
app.get('/rag/strategies', getRAGStrategies);
app.get('/rag/strategies/:strategyName', getRAGStrategy);
app.post('/rag/process', processWithRAG);
app.post('/rag/detect-device', detectDevice);

// Agent RAG Routes
app.post('/agent-rag/process', processWithAgentRAG);
app.get('/agent-rag/strategies', getAgentStrategies);
app.post('/agent-rag/analyze-content', analyzeContentStructure);

// New Action Routes
app.post('/translate', translateContent);
app.post('/analyze', analyzeForInsights);
app.post('/todos', createTodos);
app.post('/agent-rag/select-strategy', selectOptimalStrategy);
app.get('/agent-rag/workflow/:workflowId', getAgentWorkflowStatus);
app.get('/agent-rag/metrics', getAgentMetrics);

// Shared Memory Routes
app.use('/shared-memory', sharedMemoryRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
