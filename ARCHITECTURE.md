# System Architecture

> **Documents Browser Application** - iOS in-app browser Stage-1 simulation for Documents by Readdle

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Technology Stack](#technology-stack)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Key Features](#key-features)
- [External Dependencies](#external-dependencies)
- [Security & Performance](#security--performance)

---

## System Overview

This is a monorepo application consisting of a React-based web frontend and a Node.js backend server. The application provides intelligent document browsing, AI-powered content processing, semantic search, and document management capabilities.

### High-Level Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React Application (Vite + TypeScript)                    │  │
│  │  - Browser View  - Library View  - Search View  - Tools  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Express Server (Node.js + TypeScript)                    │  │
│  │  - Routes  - Middleware  - Controllers                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICES LAYER                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ LangChain  │  │    RAG     │  │  OpenELM   │  │Typesense │  │
│  │  Service   │  │  Service   │  │  Service   │  │ Service  │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │   Device   │  │Translation │  │   Shared   │                │
│  │  Service   │  │  Service   │  │   Memory   │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                       AGENT LAYER                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Agent Coordinator                                         │ │
│  │  ├─ Content Analysis Agent                                 │ │
│  │  └─ Strategy Selection Agent                               │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │  OpenAI    │  │ HuggingFace│  │  Phoenix   │  │Typesense │  │
│  │    API     │  │    API     │  │Observabilty│  │  Search  │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend (`/web/`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS
- **UI Components**: Custom components
- **Package Manager**: pnpm

### Backend (`/server/`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **AI/ML**: LangChain, OpenAI SDK
- **Observability**: Arize Phoenix
- **Package Manager**: pnpm

### External Services
- **OpenAI API**: GPT-4-mini for AI operations
- **Typesense**: Semantic search engine
- **Hugging Face**: On-device translation models
- **Phoenix**: LLM observability and tracing

---

## Frontend Architecture

### Directory Structure

```
web/
├── src/
│   ├── components/        # Reusable UI components (21 files)
│   ├── views/             # Page-level components
│   ├── lib/               # Utilities and API client
│   ├── state/             # Zustand store
│   ├── App.tsx            # Root component with routing
│   └── main.tsx           # Entry point
├── public/                # Static assets
└── dist/                  # Production build
```

### State Management

**Zustand Store** (`/web/src/state/store.ts`)

The application uses Zustand for centralized state management with localStorage persistence:

```typescript
interface AppState {
  // Settings
  cloudAI: boolean
  incognito: boolean
  
  // Onboarding
  hasSeenOnboarding: boolean
  isOnboardingActive: boolean
  
  // Current page content
  currentPage: PageContent | null
  
  // RAG Strategy
  selectedRAGStrategy: string | null
  
  // Library
  files: FileItem[]
  folders: Folder[]
  
  // Search
  searchQuery: string
  searchMode: 'url' | 'search'
  documentResults: DocumentSearchResult[]
  webResults: WebSearchResult[]
}
```

### Key Components

#### Views
- **BrowserView** (`/web/src/views/BrowserView.tsx`): Main web browsing interface
- **LibraryView** (`/web/src/views/LibraryView.tsx`): Document library management
- **SearchResultsView** (`/web/src/views/SearchResultsView.tsx`): Search results display
- **ToolsView** (`/web/src/views/ToolsView.tsx`): AI tools and utilities

#### Core Components
- **Layout** (`Layout.tsx`): Application shell with navigation
- **UrlBar** (`UrlBar.tsx`): URL input and navigation
- **SearchBar** (`SearchBar.tsx`): Unified search interface
- **AssistantPanel** (`AssistantPanel.tsx`): AI assistant interface
- **FileCard** (`FileCard.tsx`): Document card display
- **PagePreview** (`PagePreview.tsx`): Web page preview
- **PdfViewer** (`PdfViewer.tsx`): PDF document viewer
- **RAGStrategySelector** (`RAGStrategySelector.tsx`): RAG strategy selection

#### Search Components
- **InlineSearchResults** (`InlineSearchResults.tsx`): Inline search display
- **DocumentResultCard** (`DocumentResultCard.tsx`): Document search result
- **WebResultCard** (`WebResultCard.tsx`): Web search result card
- **WebResultListItem** (`WebResultListItem.tsx`): Compact web result

### API Client

**Location**: `/web/src/lib/api.ts`

The API client provides typed methods for all backend endpoints:

```typescript
// Content operations
extractPageContent(url: string)
summarizeContent(text: string, cloudAI: boolean)
answerQuestion(text: string, question: string, cloudAI: boolean)

// File operations
suggestFilename(file: any, content?: string)
generatePdf(payload: GeneratePdfPayload)

// RAG operations
getRAGStrategies()
detectDevice()
processWithRAG(content, question, strategyName, cloudAI)

// AI actions
translateContent(text, targetLanguage, cloudAI)
analyzeForInsights(text, cloudAI)
createTodos(text, cloudAI)

// Search operations
unifiedSearch(request: SearchRequest)
searchDocuments(query, filters, limit)
searchWeb(query, limit)
indexDocument(file)
removeDocumentFromIndex(documentId)
```

---

## Backend Architecture

### Directory Structure

```
server/
├── src/
│   ├── index.ts           # Express app entry point
│   ├── routes/            # API route handlers (15 files)
│   ├── services/          # Business logic (7 services)
│   ├── agents/            # AI agent system (3 agents)
│   └── observability/     # Phoenix instrumentation (2 files)
├── dist/                  # Compiled JavaScript
└── docker-compose.yml     # Docker services
```

### API Routes

**Main Server**: `/server/src/index.ts`

Port: `5174` (configurable via `PORT` env variable)

#### Content Processing Routes

| Endpoint | Method | Purpose | Handler |
|----------|--------|---------|---------|
| `/api/extract` | POST | Extract content from URL | `extract.ts` |
| `/api/summarize` | POST | Summarize text content | `summarize.ts` |
| `/api/qa` | POST | Answer questions about content | `qa.ts` |
| `/api/suggest-filename` | POST | AI-powered filename suggestions | `suggestFilename.ts` |
| `/api/generate-pdf` | POST | Generate PDF from HTML/URL | `generatePdf.ts` |
| `/api/proxy` | GET | Proxy web content | `proxy.ts` |

#### RAG (Retrieval-Augmented Generation) Routes

| Endpoint | Method | Purpose | Handler |
|----------|--------|---------|---------|
| `/api/rag/strategies` | GET | List available RAG strategies | `rag.ts` |
| `/api/rag/strategies/:name` | GET | Get specific strategy details | `rag.ts` |
| `/api/rag/process` | POST | Process content with RAG | `rag.ts` |
| `/api/rag/detect-device` | POST | Detect device capabilities | `rag.ts` |

#### Agent RAG Routes

| Endpoint | Method | Purpose | Handler |
|----------|--------|---------|---------|
| `/api/agent-rag/process` | POST | Process with agent workflow | `agentRag.ts` |
| `/api/agent-rag/strategies` | GET | Get agent strategies | `agentRag.ts` |
| `/api/agent-rag/analyze-content` | POST | Analyze content structure | `agentRag.ts` |
| `/api/agent-rag/select-strategy` | POST | Select optimal strategy | `agentRag.ts` |
| `/api/agent-rag/workflow/:id` | GET | Get workflow status | `agentRag.ts` |
| `/api/agent-rag/metrics` | GET | Get agent metrics | `agentRag.ts` |

#### AI Action Routes

| Endpoint | Method | Purpose | Handler |
|----------|--------|---------|---------|
| `/api/translate` | POST | Translate content | `translate.ts` |
| `/api/analyze` | POST | Analyze for insights | `analyze.ts` |
| `/api/todos` | POST | Generate todo list | `todos.ts` |

#### Search Routes

| Endpoint | Method | Purpose | Handler |
|----------|--------|---------|---------|
| `/api/search` | POST | Unified search (docs + web) | `search.ts` |
| `/api/search/documents` | POST | Search documents only | `search.ts` |
| `/api/search/web` | POST | Search web only | `search.ts` |
| `/api/search/stats` | GET | Get search statistics | `search.ts` |
| `/api/search/filters` | GET | Get available filters | `search.ts` |
| `/api/search/index` | POST | Index a document | `search.ts` |
| `/api/search/index/:id` | DELETE | Remove from index | `search.ts` |
| `/api/search/bulk-index` | POST | Bulk index documents | `search.ts` |
| `/api/search/index-all` | POST | Index all documents | `search.ts` |
| `/api/search/index-library` | POST | Index library files | `search.ts` |

#### Shared Memory Routes

| Endpoint | Method | Purpose | Handler |
|----------|--------|---------|---------|
| `/shared-memory/*` | ALL | Shared memory operations | `sharedMemory.ts` |

#### Phoenix Observability Routes

| Endpoint | Method | Purpose | Handler |
|----------|--------|---------|---------|
| `/api/phoenix/*` | ALL | Observability endpoints | `phoenix.ts` |

#### OpenELM Routes

| Endpoint | Method | Purpose | Handler |
|----------|--------|---------|---------|
| `/api/openelm/*` | ALL | On-device LLM operations | `openelm.ts` |

### Services Layer

#### LangChain Service (`langchainService.ts`)

**Purpose**: Core AI operations using OpenAI and LangChain

**Key Features**:
- OpenAI GPT-4-mini integration
- Content summarization (cloud and local)
- Question answering with RAG
- Filename suggestion with AI
- Content translation
- Insight analysis
- Todo list generation
- OpenELM on-device model integration
- Phoenix observability integration

**Key Methods**:
```typescript
summarizeContent(text, cloudAI): Promise<{summary, success}>
answerQuestion(text, question, cloudAI, deviceInfo): Promise<{answer, ragResult}>
suggestFileName(file, content): Promise<{suggestedName, confidence, reasoning}>
translateContent(text, targetLanguage, cloudAI): Promise<{translation}>
analyzeForInsights(text, cloudAI): Promise<{insights}>
createTodos(text, cloudAI): Promise<{todos}>
generateWithOpenELM(modelId, prompt, options): Promise<{text, usage}>
```

**Fallback Strategy**:
- When Cloud AI is disabled or unavailable, uses local processing
- Heuristic-based algorithms for offline functionality
- On-device translation via Hugging Face models

#### RAG Service (`ragService.ts`)

**Purpose**: Retrieval-Augmented Generation for enhanced Q&A

**Features**:
- Multiple chunking strategies (paragraph, semantic, fixed-size)
- Vector embeddings with OpenAI
- Multiple vector stores (FAISS, Memory)
- Device-optimized strategies
- Context retrieval and ranking

**Strategy Types**:
```typescript
{
  name: string
  embeddingModel: string
  vectorStore: 'faiss' | 'memory'
  chunkSize: number
  chunkOverlap: number
  chunkingStrategy: 'paragraph' | 'semantic' | 'fixed'
  deviceOptimized: boolean
  description: string
}
```

#### Typesense Service (`typesenseService.ts`)

**Purpose**: Semantic search for documents and web content

**Features**:
- Document indexing and search
- Web content search
- Faceted filtering
- Real-time statistics
- Bulk indexing operations

**Search Capabilities**:
- Full-text search
- Semantic search
- Filter by document type, folder, file extension
- Separate image and document collections

#### Device Service (`deviceService.ts`)

**Purpose**: Device capability detection and optimization

**Features**:
- Mobile/desktop detection
- Processing power estimation
- Memory availability assessment
- Network type detection
- Optimal strategy recommendation

**Device Info**:
```typescript
{
  isMobile: boolean
  isTablet: boolean
  processingPower: 'low' | 'medium' | 'high'
  memoryAvailable: number
  networkType: string
  userAgent: string
}
```

#### Shared Memory Service (`sharedMemoryService.ts`)

**Purpose**: Cross-request caching and learning

**Features**:
- Content analysis caching
- User preference storage
- Strategy performance tracking
- Learning from past decisions

#### OpenELM Service (`openelmService.ts`)

**Purpose**: On-device LLM inference

**Features**:
- Local model execution
- Multiple model support
- Device-optimized inference
- Fallback for cloud AI

#### Hugging Face Translation Service (`huggingFaceTranslationService.ts`)

**Purpose**: On-device translation

**Features**:
- Local translation models
- Multiple language support
- No external API dependencies

### Agent System

The agent system provides intelligent content processing and strategy selection through coordinated AI agents.

#### Agent Coordinator (`agentCoordinator.ts`)

**Purpose**: Orchestrates multi-agent workflows

**Workflow**:
1. Content Analysis Agent analyzes structure
2. Strategy Selection Agent chooses optimal RAG strategy
3. Validation and finalization
4. Performance tracking

**Key Features**:
- Message-based agent communication
- Timeout and retry handling
- Fallback strategies
- Phoenix observability integration
- Shared memory integration

**Workflow Result**:
```typescript
{
  contentAnalysis: ContentAnalysisResult
  strategySelection: StrategySelectionResult
  finalStrategy: RAGStrategy
  confidence: number
  totalProcessingTime: number
  workflowId: string
  agentMessages: AgentMessage[]
}
```

#### Content Analysis Agent (`contentAnalysisAgent.ts`)

**Purpose**: Analyzes content structure and characteristics

**Analysis Output**:
```typescript
{
  structure: {
    type: 'text' | 'article' | 'documentation' | 'research' | 'code'
    complexity: 'simple' | 'medium' | 'complex'
    sections: string[]
    headings: string[]
    tables: boolean
    lists: boolean
    codeBlocks: boolean
    images: boolean
    wordCount: number
    language: string
    domain: string
    readabilityScore: number
  }
  confidence: number
  recommendations: {
    chunkingStrategy: string
    embeddingModel: string
    chunkSize: number
    chunkOverlap: number
    reasoning: string
  }
}
```

#### Strategy Selection Agent (`strategySelectionAgent.ts`)

**Purpose**: Selects optimal RAG strategy based on content and device

**Selection Criteria**:
- Content type and complexity
- Device capabilities
- User preferences (speed vs accuracy)
- Historical performance data

**Available Strategies**:
- `text-paragraph`: Paragraph-based chunking
- `semantic`: Semantic chunking
- `technical-docs`: Optimized for documentation
- `research-paper`: Academic content
- `code-analysis`: Code-heavy content
- `mobile-optimized`: Low-resource devices

### Observability

#### Phoenix Instrumentation (`phoenixInstrumentation.ts`)

**Purpose**: LLM observability and tracing

**Features**:
- Workflow tracing
- LLM call tracking
- Agent step monitoring
- Error tracking
- Performance metrics

**Trace Context**:
```typescript
{
  workflowId: string
  spans: Array<{
    name: string
    type: 'llm' | 'agent' | 'workflow'
    startTime: number
    endTime: number
    attributes: Record<string, any>
  }>
}
```

---

## Data Flow

### 1. Web Content Extraction Flow

```
User enters URL in UrlBar
    ↓
Frontend: api.extractPageContent(url)
    ↓
Backend: POST /api/extract
    ↓
Routes: extractPageContent handler
    ↓
Extract content using readability
    ↓
Return: { title, content, text, images, domain }
    ↓
Frontend: Store in currentPage state
    ↓
Display in PagePreview component
```

### 2. AI Question Answering Flow

```
User asks question in AssistantPanel
    ↓
Frontend: api.answerQuestion(text, question, cloudAI)
    ↓
Backend: POST /api/qa
    ↓
Routes: answerQuestion handler
    ↓
Service: langchainService.answerQuestion()
    ↓
If cloudAI enabled:
    ├─ Check device capabilities
    ├─ Use RAG if device info available
    │   ├─ ragService.processWithRAG()
    │   ├─ Chunk content
    │   ├─ Create embeddings
    │   ├─ Vector search for relevant chunks
    │   └─ LLM generates answer with context
    └─ Direct LLM call if no device info
Else:
    └─ Local processing with heuristics
    ↓
Phoenix: Track LLM span
    ↓
Return: { answer, ragResult, followUpQuestions }
    ↓
Frontend: Display in AssistantPanel
```

### 3. Agent RAG Workflow

```
User triggers agent RAG
    ↓
Frontend: processWithRAG request
    ↓
Backend: POST /api/agent-rag/process
    ↓
Routes: processWithAgentRAG handler
    ↓
AgentCoordinator: processContentWithAgents()
    ↓
Step 1: Content Analysis Agent
    ├─ Check shared memory cache
    ├─ If not cached: analyzeContent()
    │   ├─ Detect content type
    │   ├─ Analyze structure
    │   ├─ Calculate complexity
    │   └─ Generate recommendations
    ├─ Store in shared memory
    └─ Return ContentAnalysisResult
    ↓
Step 2: Strategy Selection Agent
    ├─ Check user preferences in shared memory
    ├─ selectOptimalStrategy()
    │   ├─ Evaluate all strategies
    │   ├─ Score based on:
    │   │   ├─ Content characteristics
    │   │   ├─ Device capabilities
    │   │   ├─ User preferences
    │   │   └─ Historical performance
    │   └─ Select best strategy
    └─ Return StrategySelectionResult
    ↓
Step 3: Validation & Finalization
    ├─ Check device constraints
    ├─ Validate memory requirements
    └─ Apply fallback if needed
    ↓
Step 4: Performance Tracking
    ├─ Store strategy performance
    └─ Update shared memory
    ↓
Phoenix: Track complete workflow
    ↓
Return: AgentWorkflowResult
    ↓
Frontend: Display results
```

### 4. Search Flow

```
User enters search query
    ↓
Frontend: api.unifiedSearch(request)
    ↓
Backend: POST /api/search
    ↓
Routes: unifiedSearch handler
    ↓
Service: typesenseService
    ├─ Search documents collection
    │   ├─ Apply filters
    │   ├─ Semantic search
    │   └─ Rank results
    └─ Search web collection (if enabled)
    ↓
Combine and deduplicate results
    ↓
Return: { documents, web, totalResults }
    ↓
Frontend: Store in state
    ↓
Display in SearchResultsView
```

### 5. PDF Generation Flow

```
User clicks download as PDF
    ↓
Frontend: api.generatePdf(payload)
    ↓
Backend: POST /api/generate-pdf
    ↓
Routes: generatePdf handler
    ↓
Use Puppeteer to:
    ├─ Launch headless browser
    ├─ Navigate to URL or load HTML
    ├─ Generate PDF buffer
    └─ Close browser
    ↓
AI Processing (if enabled):
    ├─ Extract text from HTML
    ├─ suggestFilename()
    └─ summarizeContent()
    ↓
Return: {
  success: true,
  fileId: string,
  suggestedName: string,
  summary: string,
  pdfData: base64
}
    ↓
Frontend: Convert base64 to blob
    ↓
Store in library with metadata
    ↓
Auto-index in search
```

### 6. Document Indexing Flow

```
User uploads/saves document
    ↓
Frontend: File stored in Zustand state
    ↓
Store triggers: api.indexDocument(file)
    ↓
Backend: POST /api/search/index
    ↓
Routes: indexDocument handler
    ↓
Service: typesenseService.indexDocument()
    ├─ Extract metadata
    ├─ Generate search-optimized fields
    ├─ Create Typesense document
    └─ Index in collection
    ↓
Return: { success: true, message }
    ↓
Document now searchable
```

---

## Key Features

### 1. **Cloud AI Toggle**

Users can switch between cloud-based AI (OpenAI) and on-device processing:

- **Cloud AI Enabled**: Uses GPT-4-mini via OpenAI API
- **Cloud AI Disabled**: Uses local heuristic algorithms and on-device models
- **Automatic Fallback**: Falls back to local processing if API fails

### 2. **RAG (Retrieval-Augmented Generation)**

Multiple RAG strategies for different content types:

- **Text-Paragraph**: General text with paragraph chunking
- **Semantic**: Intelligent semantic chunking
- **Technical-Docs**: Optimized for documentation
- **Research-Paper**: Academic content processing
- **Code-Analysis**: Code-heavy content
- **Mobile-Optimized**: Low-resource devices

### 3. **Agent System**

Multi-agent workflow for intelligent processing:

- **Content Analysis Agent**: Analyzes content structure
- **Strategy Selection Agent**: Selects optimal RAG strategy
- **Agent Coordinator**: Orchestrates workflow
- **Shared Memory**: Learns from past decisions

### 4. **Semantic Search**

Powered by Typesense:

- Full-text search across documents
- Web content search
- Faceted filtering (type, folder, extension)
- Real-time statistics
- Auto-indexing on document save

### 5. **AI Actions**

- **Summarize**: Generate executive summaries
- **Q&A**: Answer questions about content
- **Translate**: Multi-language translation
- **Analyze**: Extract insights and patterns
- **Todos**: Generate actionable task lists
- **Filename Suggestion**: AI-powered file naming

### 6. **PDF Generation**

- Convert web pages to PDF
- Preserve formatting and layout
- AI-powered filename suggestions
- Automatic summarization
- Tag generation

### 7. **Observability**

Phoenix integration for:
- LLM call tracing
- Agent workflow monitoring
- Performance metrics
- Error tracking
- Debugging tools

### 8. **Onboarding System**

Interactive onboarding for new users:
- Welcome screen
- Feature tour
- Interactive tutorials
- Skip option

---

## External Dependencies

### Required Services

#### OpenAI API
- **Purpose**: Cloud AI operations
- **Configuration**: `OPENAI_API_KEY` in `.env`
- **Models**: GPT-4-mini for text generation
- **Fallback**: Local processing if unavailable

#### Typesense
- **Purpose**: Semantic search engine
- **Configuration**: 
  - `TYPESENSE_HOST`
  - `TYPESENSE_PORT`
  - `TYPESENSE_PROTOCOL`
  - `TYPESENSE_API_KEY`
- **Collections**: 
  - `documents` - Document search
  - `web_content` - Web content search

#### Phoenix (Arize)
- **Purpose**: LLM observability
- **Configuration**: 
  - `PHOENIX_COLLECTOR_ENDPOINT`
  - `PHOENIX_PROJECT_NAME`
- **Features**: Trace collection, visualization

### Optional Services

#### Hugging Face API
- **Purpose**: On-device translation models
- **Configuration**: `HUGGINGFACE_API_KEY`
- **Fallback**: Basic translation patterns

---

## Security & Performance

### Security Measures

1. **API Key Management**
   - Environment variables for sensitive keys
   - No hardcoded credentials
   - `.env.example` templates provided

2. **CORS Configuration**
   - Configured in Express middleware
   - Controls allowed origins

3. **Input Validation**
   - Request payload validation
   - Sanitization of user inputs

4. **Incognito Mode**
   - Optional privacy mode
   - Disables data persistence

### Performance Optimizations

1. **Code Splitting**
   - Route-based code splitting
   - Lazy loading of components

2. **Caching**
   - Shared memory for content analysis
   - User preference caching
   - Strategy performance caching

3. **Device Optimization**
   - Mobile-optimized strategies
   - Memory-efficient processing
   - Adaptive chunk sizes

4. **Search Performance**
   - Indexed search with Typesense
   - Faceted filtering
   - Result pagination

5. **State Management**
   - Zustand with persistence
   - Selective state persistence (excludes large blobs)
   - Efficient re-renders

---

## File Reference Guide

### When Editing Specific Features:

#### **URL/Web Browsing**
- Frontend: `web/src/views/BrowserView.tsx`, `web/src/components/UrlBar.tsx`
- Backend: `server/src/routes/extract.ts`, `server/src/routes/proxy.ts`

#### **Document Library**
- Frontend: `web/src/views/LibraryView.tsx`, `web/src/components/FileCard.tsx`
- State: `web/src/state/store.ts` (files, folders)

#### **AI Assistant**
- Frontend: `web/src/components/AssistantPanel.tsx`, `web/src/components/ChatActions.tsx`
- Backend: `server/src/routes/qa.ts`, `server/src/routes/summarize.ts`
- Service: `server/src/services/langchainService.ts`

#### **Search**
- Frontend: `web/src/views/SearchResultsView.tsx`, `web/src/components/SearchBar.tsx`
- Backend: `server/src/routes/search.ts`
- Service: `server/src/services/typesenseService.ts`

#### **RAG System**
- Frontend: `web/src/components/RAGStrategySelector.tsx`
- Backend: `server/src/routes/rag.ts`, `server/src/routes/agentRag.ts`
- Services: `server/src/services/ragService.ts`
- Agents: `server/src/agents/*`

#### **PDF Generation**
- Frontend: `web/src/components/PdfDownloadButton.tsx`, `web/src/components/PdfViewer.tsx`
- Backend: `server/src/routes/generatePdf.ts`

#### **Settings & Preferences**
- Frontend: `web/src/state/store.ts` (cloudAI, incognito settings)
- Backend: `server/src/services/sharedMemoryService.ts`

#### **Onboarding**
- Frontend: `web/src/components/OnboardingModal.tsx`, `web/src/components/WelcomeScreen.tsx`
- State: `web/src/state/store.ts` (onboarding state)

#### **API Client**
- Frontend: `web/src/lib/api.ts` (all API calls)

#### **Observability**
- Backend: `server/src/observability/phoenixInstrumentation.ts`

---

## Development Workflow

### Running the Application

```bash
# Install dependencies
pnpm install

# Development mode (both frontend and backend)
pnpm dev

# Or run separately:
pnpm -C server dev    # Backend only
pnpm -C web dev       # Frontend only
```

### Environment Setup

1. Copy environment templates:
```bash
cp server/env.example server/.env
```

2. Configure required variables:
```
OPENAI_API_KEY=your_key
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=your_key
```

### Building for Production

```bash
# Build all workspaces
pnpm build

# Build separately:
pnpm -C server build
pnpm -C web build
```

### Docker Deployment

```bash
cd server
docker-compose up -d
```

---

## Design System

This application uses a comprehensive Tailwind CSS design system optimized for non-designers. See **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** for the complete guide.

### Quick Reference

**Colors**: Use `bg-primary`, `text-neutral-600`, `border-neutral-200`  
**Typography**: Use `text-heading`, `text-body`, `text-caption`  
**Spacing**: Use `p-md`, `m-lg`, `gap-md`  
**Components**: Use `btn-primary`, `card`, `input-field`, `badge-success`

For a quick reference while coding, see **[TAILWIND_QUICK_REF.md](./TAILWIND_QUICK_REF.md)**

---

## Conclusion

This architecture provides a solid foundation for an intelligent document browser with:

- **Scalable agent system** for content processing
- **Flexible RAG strategies** for different content types
- **Semantic search** for document discovery
- **Cloud and on-device AI** for offline capability
- **Comprehensive observability** for debugging and optimization
- **Modern tech stack** with TypeScript and React
- **Design system** for consistent, beautiful UIs

The modular design ensures easy maintenance and feature additions while maintaining high performance and user experience.

---

## Additional Resources

- **[README.md](./README.md)**: Project overview and quick start guide
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)**: Complete design system guide
- **[TAILWIND_QUICK_REF.md](./TAILWIND_QUICK_REF.md)**: Quick Tailwind CSS reference
- **[SECURITY.md](./SECURITY.md)**: Security guidelines
- **[SEARCH_INTEGRATION.md](./SEARCH_INTEGRATION.md)**: Search implementation
- **[SHARED_MEMORY.md](./SHARED_MEMORY.md)**: Shared memory service
- **[ONBOARDING_SYSTEM.md](./ONBOARDING_SYSTEM.md)**: User onboarding

