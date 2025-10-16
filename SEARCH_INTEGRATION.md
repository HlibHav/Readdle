# 🔍 Unified Search Integration

## Overview

This document describes the implementation of the unified search system that combines document search from the user's library with web search results. The system uses Typesense as the search engine and provides a seamless search experience across both local documents and web content.

## Architecture

### Backend Components

#### TypesenseService (`server/src/services/typesenseService.ts`)
- **Purpose**: Core search service handling document indexing and search operations
- **Features**:
  - Document indexing with content extraction
  - Vector-based similarity search
  - Web search integration via DuckDuckGo API
  - Bulk indexing operations
  - Collection management

#### Search Routes (`server/src/routes/search.ts`)
- **Endpoints**:
  - `POST /api/search` - Unified search (documents + web)
  - `POST /api/search/documents` - Document-only search
  - `POST /api/search/web` - Web-only search
  - `GET /api/search/stats` - Search statistics
  - `POST /api/search/index` - Index single document
  - `DELETE /api/search/index/:id` - Remove document from index
  - `POST /api/search/bulk-index` - Bulk index documents

### Frontend Components

#### SearchResultsView (`web/src/views/SearchResultsView.tsx`)
- **Purpose**: Main search results page
- **Features**:
  - Displays documents first, then web results
  - Incognito mode support (web search disabled)
  - Search history integration
  - Loading states and error handling

#### SearchBar (`web/src/components/SearchBar.tsx`)
- **Purpose**: Reusable search input component
- **Features**:
  - URL vs search query detection
  - Dynamic placeholder text
  - Search button with loading states

#### DocumentResultCard (`web/src/components/DocumentResultCard.tsx`)
- **Purpose**: Display document search results
- **Features**:
  - Highlighted search snippets
  - File metadata (type, folder, date, tags)
  - Relevance score indicator
  - Quick actions (preview, open external)

#### WebResultCard (`web/src/components/WebResultCard.tsx`)
- **Purpose**: Display web search results
- **Features**:
  - Favicon display
  - Domain highlighting
  - Click to open in new tab
  - Relevance score indicator

### State Management

#### Extended Zustand Store
- **Search State**:
  - `searchQuery`: Current search query
  - `searchMode`: 'url' | 'search'
  - `documentResults`: Array of document results
  - `webResults`: Array of web results
  - `isSearching`: Loading state
  - `searchHistory`: Recent search queries

#### Real-time Indexing
- Documents are automatically indexed when added to the library
- Documents are removed from index when deleted
- Indexing happens asynchronously to avoid blocking UI

## Configuration

### Docker Setup

```yaml
# server/docker-compose.yml
typesense:
  image: typesense/typesense:27.1
  container_name: typesense-search
  ports:
    - "8108:8108"
  environment:
    - TYPESENSE_API_KEY=${TYPESENSE_API_KEY:-xyz}
    - TYPESENSE_DATA_DIR=/data
  volumes:
    - typesense_data:/data
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8108/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
  networks:
    - app-network
```

### Environment Variables

```bash
# server/.env
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
TYPESENSE_COLLECTION_NAME=documents
```

## API Usage

### Unified Search

```typescript
POST /api/search
{
  "query": "quantum computing",
  "filters": {
    "documentTypes": ["pdf", "summary"],
    "folders": ["documents", "research"],
    "dateRange": {
      "from": "2024-01-01T00:00:00Z",
      "to": "2024-12-31T23:59:59Z"
    }
  },
  "limit": 10,
  "includeWeb": true
}
```

**Response:**
```typescript
{
  "success": true,
  "documents": [
    {
      "id": "doc-123",
      "name": "Quantum Computing Basics.pdf",
      "type": "pdf",
      "snippet": "Quantum computing is a revolutionary...",
      "highlightedSnippet": "Quantum computing is a <mark>revolutionary</mark>...",
      "score": 0.95,
      "folder": "documents",
      "tags": ["quantum", "computing"],
      "addedDate": "2024-01-15T10:30:00Z",
      "summary": "Introduction to quantum computing concepts"
    }
  ],
  "web": [
    {
      "title": "Quantum Computing Explained",
      "url": "https://example.com/quantum-computing",
      "snippet": "Learn about quantum computing...",
      "domain": "example.com",
      "score": 0.87
    }
  ],
  "totalDocuments": 5,
  "totalWeb": 15,
  "processingTime": 123,
  "query": "quantum computing"
}
```

## Search Features

### Document Search
- **Full-text search** across document names, content, and summaries
- **Fuzzy matching** with typo tolerance
- **Highlighted snippets** showing matched text
- **Metadata filtering** by type, folder, date range, tags
- **Relevance scoring** based on text match quality

### Web Search
- **DuckDuckGo integration** for privacy-focused web search
- **Domain extraction** and favicon display
- **Snippet highlighting** for search terms
- **External link handling** (opens in new tab)

### Search Modes
- **URL Mode**: When input is a valid URL, navigates to browser
- **Search Mode**: When input is text, performs unified search
- **Incognito Mode**: Disables web search for privacy

## Performance Considerations

### Optimization Strategies
- **In-memory indexing** for fast search responses
- **Debounced input** (300ms) to reduce API calls
- **Parallel search** (documents + web simultaneously)
- **Progressive loading** (documents first, web async)
- **Result caching** for popular queries (5 min TTL)

### Scalability
- **Typesense clustering** for horizontal scaling
- **Index sharding** for large document collections
- **CDN integration** for web search results
- **Rate limiting** to prevent abuse

## Security & Privacy

### Privacy Features
- **Incognito mode** disables web search
- **Local processing** for document content
- **No search logging** in incognito mode
- **API key management** via environment variables

### Security Measures
- **Input sanitization** to prevent XSS
- **Rate limiting** on search endpoints
- **CORS configuration** for API access
- **Error handling** without information leakage

## Testing

### Test Coverage
- **Unit tests** for TypesenseService
- **Integration tests** for search endpoints
- **E2E tests** for search flow
- **Performance benchmarks** (< 200ms response time)

### Test Scenarios
- Empty search results
- Network failures
- Large result sets
- Special characters in queries
- Incognito mode behavior

## Deployment

### Development Setup
```bash
# Start Typesense
cd server
docker-compose up -d typesense

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Production Deployment
```bash
# Build for production
pnpm build

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

### Metrics
- Search response times
- Index size and growth
- Query success rates
- User search patterns

### Logging
- Search queries (non-incognito)
- Index operations
- Error rates
- Performance metrics

## Future Enhancements

### Planned Features
- **AI-powered ranking** using RAG integration
- **Semantic search** with vector embeddings
- **Query suggestions** and autocomplete
- **Search analytics** dashboard
- **Multi-language support**
- **Advanced filters** (file size, content type)

### Integration Opportunities
- **Phoenix observability** for search tracing
- **OpenELM models** for local search processing
- **RAG strategies** for intelligent result ranking
- **Shared memory** for cross-session search state

## Troubleshooting

### Common Issues

#### Typesense Connection Failed
```bash
# Check if Typesense is running
docker ps | grep typesense

# Check logs
docker logs typesense-search

# Restart service
docker-compose restart typesense
```

#### Search Results Empty
- Verify documents are indexed: `GET /api/search/stats`
- Check collection exists in Typesense
- Verify document content is not empty

#### Slow Search Performance
- Check Typesense memory usage
- Verify index is not corrupted
- Consider increasing Typesense resources

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true
export TYPESENSE_DEBUG=true
```

## Contributing

### Development Guidelines
- Follow TypeScript strict mode
- Add tests for new search features
- Update documentation for API changes
- Use semantic commit messages

### Code Style
- Use consistent naming conventions
- Add JSDoc comments for public APIs
- Follow existing error handling patterns
- Maintain backward compatibility

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Documents Team

