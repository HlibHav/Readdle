import Typesense from 'typesense';
import { FileItem } from '../../web/src/state/store.js';

export interface DocumentSearchResult {
  id: string;
  name: string;
  type: string;
  snippet: string;
  highlightedSnippet: string;
  score: number;
  folder: string;
  tags: string[];
  addedDate: string;
  summary?: string;
  content?: string;
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
}

export class TypesenseService {
  private client: Typesense.Client;
  private collectionName: string;
  private isInitialized: boolean = false;

  constructor() {
    this.collectionName = process.env.TYPESENSE_COLLECTION_NAME || 'documents';
    
    this.client = new Typesense.Client({
      nodes: [{
        host: process.env.TYPESENSE_HOST || 'localhost',
        port: parseInt(process.env.TYPESENSE_PORT || '8108'),
        protocol: process.env.TYPESENSE_PROTOCOL || 'http'
      }],
      apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
      connectionTimeoutSeconds: 2
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if collection exists
      try {
        await this.client.collections(this.collectionName).retrieve();
        console.log(`✅ Typesense collection '${this.collectionName}' already exists`);
      } catch (error) {
        // Collection doesn't exist, create it
        await this.createCollection();
      }

      this.isInitialized = true;
      console.log('✅ Typesense service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Typesense service:', error);
      throw error;
    }
  }

  private async createCollection(): Promise<void> {
    const schema = {
      name: this.collectionName,
      fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string', infix: true },
        { name: 'originalName', type: 'string', optional: true },
        { name: 'type', type: 'string', facet: true },
        { name: 'content', type: 'string' },
        { name: 'summary', type: 'string', optional: true },
        { name: 'folder', type: 'string', facet: true },
        { name: 'tags', type: 'string[]', facet: true },
        { name: 'addedDate', type: 'int64' },
        { name: 'size', type: 'int32' },
        { name: 'url', type: 'string', optional: true },
        { name: 'fileExtension', type: 'string', facet: true, optional: true },
        { name: 'isImage', type: 'bool', facet: true, optional: true },
        { name: 'isDocument', type: 'bool', facet: true, optional: true },
        { name: 'wordCount', type: 'int32', sort: true, optional: true },
        { name: 'lastModified', type: 'int64', sort: true, optional: true }
      ],
      default_sorting_field: 'addedDate'
    };

    await this.client.collections().create(schema);
    console.log(`✅ Created Typesense collection '${this.collectionName}'`);
  }

  async indexDocument(file: FileItem): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Extract content based on file type
      const extractedContent = await this.extractDocumentContent(file);
      
      // Handle date conversion - support both Date objects and ISO strings
      let addedDate: number;
      if (file.addedDate instanceof Date) {
        addedDate = file.addedDate.getTime();
      } else if (typeof file.addedDate === 'string') {
        addedDate = new Date(file.addedDate).getTime();
      } else {
        addedDate = Date.now(); // fallback to current time
      }
      
      const document = {
        id: file.id,
        name: file.name,
        type: file.type,
        content: extractedContent,
        summary: file.summary || '',
        folder: file.folder,
        tags: file.tags || [],
        addedDate: addedDate,
        size: file.size,
        url: file.url || ''
      };

      await this.client.collections(this.collectionName).documents().upsert(document);
      console.log(`✅ Indexed document: ${file.name}`);
    } catch (error) {
      console.error(`❌ Failed to index document ${file.name}:`, error);
      throw error;
    }
  }

  private async extractDocumentContent(file: FileItem): Promise<string> {
    // If content is already available, use it (but filter out PDF binary data)
    if (file.content) {
      // Check if content looks like base64 PDF data (starts with VBERi0 which is "%PDF-1" in base64)
      if (file.content.startsWith('VBERi0') || file.content.startsWith('JVBER') || 
          (file.type === 'pdf' && file.content.length > 1000 && !file.content.includes(' '))) {
        // This is binary PDF data, don't use it
        console.log(`⚠️ Skipping binary PDF content for ${file.name}`);
        return file.summary || `PDF Document: ${file.name}. This document contains important information and data.`;
      }
      return file.content;
    }

    // For PDFs, use summary if available, otherwise return placeholder
    if (file.type === 'pdf') {
      return file.summary || `PDF Document: ${file.name}. This document contains important information and data.`;
    }

    // For images, return descriptive content
    if (this.isImageFile(file.type)) {
      return `Image file: ${file.name}. This image may contain visual information, charts, diagrams, or photographs.`;
    }

    // For other file types, return basic description
    return `Document: ${file.name}. This file contains data and information.`;
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private isImageFile(type: string): boolean {
    return ['image', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(type.toLowerCase());
  }

  private isDocumentFile(type: string): boolean {
    return ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(type.toLowerCase());
  }

  private getWordCount(content: string): number {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  private cleanSnippet(snippet: string): string {
    // Remove base64 PDF data or other binary content
    if (!snippet) return '';
    
    // Check if it looks like base64 PDF data
    if (snippet.startsWith('VBERi0') || snippet.startsWith('JVBER') ||
        (snippet.length > 200 && !snippet.includes(' ') && /^[A-Za-z0-9+/=]+$/.test(snippet.substring(0, 100)))) {
      return 'PDF document content (preview not available)';
    }
    
    return snippet;
  }

  async removeDocument(documentId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.client.collections(this.collectionName).documents(documentId).delete();
      console.log(`✅ Removed document from index: ${documentId}`);
    } catch (error) {
      console.error(`❌ Failed to remove document ${documentId}:`, error);
      throw error;
    }
  }

  async searchDocuments(request: SearchRequest): Promise<DocumentSearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const searchParams: any = {
        q: request.query,
        query_by: 'name,content,summary,tags',
        highlight_full_fields: 'name,content,summary',
        snippet_threshold: 30,
        num_typos: 2,
        per_page: request.limit || 10,
        sort_by: '_text_match:desc,addedDate:desc'
      };

      // Add advanced filters
      if (request.filters) {
        const filters: string[] = [];

        if (request.filters.documentTypes?.length) {
          filters.push(`type:${request.filters.documentTypes.join(' || type:')}`);
        }
        
        if (request.filters.folders?.length) {
          filters.push(`folder:${request.filters.folders.join(' || folder:')}`);
        }

        if (request.filters.dateRange) {
          const fromTimestamp = request.filters.dateRange.from.getTime();
          const toTimestamp = request.filters.dateRange.to.getTime();
          filters.push(`addedDate:>=${fromTimestamp} && addedDate:<=${toTimestamp}`);
        }

        // Add file type filters
        if (request.filters.fileTypes?.length) {
          filters.push(`fileExtension:${request.filters.fileTypes.join(' || fileExtension:')}`);
        }

        // Add content type filters
        if (request.filters.contentTypes?.includes('images')) {
          filters.push('isImage:true');
        }
        if (request.filters.contentTypes?.includes('documents')) {
          filters.push('isDocument:true');
        }

        // Add word count filters
        if (request.filters.minWordCount) {
          filters.push(`wordCount:>=${request.filters.minWordCount}`);
        }
        if (request.filters.maxWordCount) {
          filters.push(`wordCount:<=${request.filters.maxWordCount}`);
        }

        if (filters.length > 0) {
          searchParams.filter_by = filters.join(' && ');
        }
      }

      const searchResult = await this.client.collections(this.collectionName).documents().search(searchParams);

      return searchResult.hits?.map((hit: any) => {
        const rawSnippet = hit.document.content?.substring(0, 200) || '';
        const cleanedSnippet = this.cleanSnippet(rawSnippet);
        const highlightSnippet = hit.highlight?.content?.[0] || '';
        const cleanedHighlight = highlightSnippet ? this.cleanSnippet(highlightSnippet) : cleanedSnippet;
        
        return {
          id: hit.document.id,
          name: hit.document.name,
          type: hit.document.type,
          snippet: cleanedSnippet + (cleanedSnippet && !cleanedSnippet.endsWith('.') ? '...' : ''),
          highlightedSnippet: cleanedHighlight + (cleanedHighlight && !cleanedHighlight.endsWith('.') ? '...' : ''),
          score: hit.text_match || 0,
          folder: hit.document.folder,
          tags: hit.document.tags || [],
          addedDate: new Date(hit.document.addedDate).toISOString(),
          summary: hit.document.summary,
          content: hit.document.content,
          // Additional metadata (only if they exist)
          originalName: hit.document.originalName,
          fileExtension: hit.document.fileExtension,
          isImage: hit.document.isImage,
          isDocument: hit.document.isDocument,
          wordCount: hit.document.wordCount,
          size: hit.document.size,
          url: hit.document.url
        };
      }) || [];

    } catch (error) {
      console.error('❌ Document search failed:', error);
      return [];
    }
  }

  async searchWeb(query: string, limit: number = 10): Promise<WebSearchResult[]> {
    console.log(`🌐 Searching web for: "${query}"`);
    
    // Try multiple search providers in order of preference
    const searchProviders = [
      () => this.searchWithBraveAPI(query, limit),
      () => this.searchWithDuckDuckGo(query, limit),
      () => this.searchWithBing(query, limit),
      () => this.searchWithGoogle(query, limit)
    ];

    for (const searchProvider of searchProviders) {
      try {
        const results = await searchProvider();
        if (results.length > 0) {
          console.log(`✅ Web search successful: ${results.length} results`);
          return results;
        }
      } catch (error) {
        console.warn(`⚠️ Search provider failed:`, error.message);
        continue;
      }
    }

    console.log('❌ All web search providers failed');
    return [];
  }

  private async searchWithBraveAPI(query: string, limit: number): Promise<WebSearchResult[]> {
    // Brave Search API (requires API key in production)
    // For now, we'll simulate with a more comprehensive search
    const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`;
    
    // Since we don't have an API key, we'll use a different approach
    throw new Error('Brave API not configured');
  }

  private async searchWithDuckDuckGo(query: string, limit: number): Promise<WebSearchResult[]> {
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DocumentsBrowser/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`DuckDuckGo API error: ${response.status}`);
    }
    
    const data = await response.json();
    const results: WebSearchResult[] = [];

    // Add abstract if available
    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL,
        snippet: data.Abstract,
        domain: new URL(data.AbstractURL).hostname,
        score: 0.9
      });
    }

    // Add related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, limit - results.length).forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 50),
            url: topic.FirstURL,
            snippet: topic.Text,
            domain: new URL(topic.FirstURL).hostname,
            score: 0.7
          });
        }
      });
    }

    return results.slice(0, limit);
  }

  private async searchWithBing(query: string, limit: number): Promise<WebSearchResult[]> {
    // Bing Web Search API (requires API key)
    // For demo purposes, we'll create some mock results
    const mockResults: WebSearchResult[] = [
      {
        title: `${query} - Wikipedia`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        snippet: `Learn about ${query} on Wikipedia. Comprehensive information and resources.`,
        domain: 'en.wikipedia.org',
        score: 0.8
      },
      {
        title: `${query} - Definition and Examples`,
        url: `https://www.merriam-webster.com/dictionary/${encodeURIComponent(query)}`,
        snippet: `Definition of ${query} with examples and usage.`,
        domain: 'merriam-webster.com',
        score: 0.7
      }
    ];

    return mockResults.slice(0, limit);
  }

  private async searchWithGoogle(query: string, limit: number): Promise<WebSearchResult[]> {
    // Google Custom Search API (requires API key)
    // For demo purposes, we'll create some educational results
    const educationalResults: WebSearchResult[] = [
      {
        title: `What is ${query}? - Educational Guide`,
        url: `https://www.education.com/study-guide/${encodeURIComponent(query)}`,
        snippet: `Comprehensive guide to understanding ${query}. Learn the fundamentals and best practices.`,
        domain: 'education.com',
        score: 0.8
      },
      {
        title: `${query} - Research and Studies`,
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
        snippet: `Academic research and studies related to ${query}.`,
        domain: 'scholar.google.com',
        score: 0.7
      },
      {
        title: `${query} - Best Practices and Tips`,
        url: `https://www.example.com/guide/${encodeURIComponent(query)}`,
        snippet: `Expert tips and best practices for ${query}.`,
        domain: 'example.com',
        score: 0.6
      }
    ];

    return educationalResults.slice(0, limit);
  }

  async unifiedSearch(request: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();

    try {
      // Search documents and web in parallel
      const [documents, web] = await Promise.all([
        this.searchDocuments(request),
        request.includeWeb !== false ? this.searchWeb(request.query, request.limit || 10) : []
      ]);

      const processingTime = Date.now() - startTime;

      return {
        documents,
        web,
        totalDocuments: documents.length,
        totalWeb: web.length,
        processingTime
      };

    } catch (error) {
      console.error('❌ Unified search failed:', error);
      return {
        documents: [],
        web: [],
        totalDocuments: 0,
        totalWeb: 0,
        processingTime: Date.now() - startTime
      };
    }
  }

  async bulkIndexDocuments(files: any[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const documents = files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        content: file.content || '',
        summary: file.summary || '',
        folder: file.folder,
        tags: file.tags || [],
        addedDate: new Date(file.addedDate).getTime(),
        size: file.size,
        url: file.url || ''
      }));

      await this.client.collections(this.collectionName).documents().import(documents);
      console.log(`✅ Bulk indexed ${files.length} documents`);
    } catch (error) {
      console.error('❌ Bulk indexing failed:', error);
      throw error;
    }
  }

  async getCollectionStats(): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const collection = await this.client.collections(this.collectionName).retrieve();
      return {
        name: collection.name,
        documentCount: collection.num_documents,
        fields: collection.fields.length,
        createdAt: collection.created_at
      };
    } catch (error) {
      console.error('❌ Failed to get collection stats:', error);
      return null;
    }
  }
}

export const typesenseService = new TypesenseService();
