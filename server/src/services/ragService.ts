import { ChatOpenAI } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
// import { FaissStore } from '@langchain/community/vectorstores/faiss.cjs';
// import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import * as fs from 'fs';
import * as path from 'path';
import { agentCoordinator, AgentWorkflowResult } from '../agents/agentCoordinator.js';
import { RAGStrategy as AgentRAGStrategy } from '../agents/strategySelectionAgent.js';
import { phoenixInstrumentation } from '../observability/phoenixInstrumentation.js';

export interface RAGStrategy {
  name: string;
  description: string;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  vectorStore: 'faiss' | 'memory';
  deviceOptimized: boolean;
  maxTokens: number;
}

export interface RAGResult {
  answer: string;
  sources: Document[];
  strategy: string;
  confidence: number;
  processingTime: number;
  agentWorkflow?: AgentWorkflowResult;
  metadata?: {
    chunkingMethod?: string;
    embeddingModel?: string;
    deviceOptimized?: boolean;
    reasoning?: string;
  };
}

export class RAGService {
  private strategies: Map<string, RAGStrategy> = new Map();
  private embeddings: OpenAIEmbeddings | null = null;
  private vectorStores: Map<string, any> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeStrategies();
    this.initializeEmbeddings();
  }

  private initializeStrategies() {
    // Device-optimized strategies for different use cases
    this.strategies.set('fast', {
      name: 'Fast Processing',
      description: 'Quick responses for mobile devices with limited resources',
      chunkSize: 512,
      chunkOverlap: 50,
      embeddingModel: 'text-embedding-3-small',
      vectorStore: 'memory',
      deviceOptimized: true,
      maxTokens: 200
    });

    this.strategies.set('balanced', {
      name: 'Balanced Performance',
      description: 'Good balance between speed and accuracy for most devices',
      chunkSize: 1024,
      chunkOverlap: 100,
      embeddingModel: 'text-embedding-3-small',
      vectorStore: 'faiss',
      deviceOptimized: true,
      maxTokens: 400
    });

    this.strategies.set('comprehensive', {
      name: 'Comprehensive Analysis',
      description: 'Deep analysis for powerful devices with good connectivity',
      chunkSize: 2048,
      chunkOverlap: 200,
      embeddingModel: 'text-embedding-3-large',
      vectorStore: 'faiss',
      deviceOptimized: false,
      maxTokens: 800
    });

    this.strategies.set('offline', {
      name: 'Offline Processing',
      description: 'Local processing without cloud dependencies',
      chunkSize: 1024,
      chunkOverlap: 100,
      embeddingModel: 'local',
      vectorStore: 'memory',
      deviceOptimized: true,
      maxTokens: 300
    });
  }

  private initializeEmbeddings() {
    if (process.env.OPENAI_API_KEY) {
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-3-small',
      });
      this.isInitialized = true;
    }
  }

  async selectStrategy(
    content: string,
    question: string,
    deviceInfo: {
      isMobile: boolean;
      hasInternet: boolean;
      processingPower: 'low' | 'medium' | 'high';
      memoryAvailable: number;
    }
  ): Promise<string> {
    // Agent-driven strategy selection based on content and device capabilities
    const contentLength = content.length;
    const questionComplexity = this.analyzeQuestionComplexity(question);
    
    // Decision logic for strategy selection
    if (!deviceInfo.hasInternet) {
      return 'offline';
    }
    
    if (deviceInfo.isMobile && deviceInfo.processingPower === 'low') {
      return 'fast';
    }
    
    if (contentLength > 10000 || questionComplexity === 'high') {
      return deviceInfo.processingPower === 'high' ? 'comprehensive' : 'balanced';
    }
    
    if (contentLength < 2000 && questionComplexity === 'low') {
      return 'fast';
    }
    
    return 'balanced';
  }

  private analyzeQuestionComplexity(question: string): 'low' | 'medium' | 'high' {
    const complexKeywords = [
      'analyze', 'compare', 'explain', 'describe', 'summarize',
      'why', 'how', 'what if', 'implications', 'consequences'
    ];
    
    const questionLower = question.toLowerCase();
    const complexCount = complexKeywords.filter(keyword => 
      questionLower.includes(keyword)
    ).length;
    
    if (complexCount >= 3) return 'high';
    if (complexCount >= 1) return 'medium';
    return 'low';
  }

  async processWithRAG(
    content: string,
    question: string,
    deviceInfo: any,
    strategyName?: string,
    cloudAI: boolean = true
  ): Promise<RAGResult> {
    // If Cloud AI is disabled, use local processing
    if (!cloudAI) {
      return this.processWithLocalRAG(content, question, deviceInfo, strategyName);
    }
    
    // Check if we should use agent-powered processing
    if (!strategyName && this.shouldUseAgentProcessing(content, deviceInfo)) {
      return this.processWithAgents(content, question, deviceInfo);
    }
    
    return this.processWithLegacyRAG(content, question, deviceInfo, strategyName);
  }

  private async processWithLocalRAG(
    content: string,
    question: string,
    deviceInfo: any,
    strategyName?: string
  ): Promise<RAGResult> {
    // Use local processing without cloud AI
    const startTime = Date.now();
    
    // Simple keyword-based search and response
    const answer = this.generateLocalAnswer(content, question);
    
    return {
      answer,
      sources: [],
      strategy: 'local-processing',
      confidence: 0.7,
      processingTime: Date.now() - startTime
    };
  }

  private generateLocalAnswer(content: string, question: string): string {
    if (!content || !question) {
      return '## Local Answer\n\n*Processed locally without cloud AI*\n\nNot found in page';
    }

    const questionLower = question.toLowerCase();
    
    // Find direct answer using keyword matching
    const directAnswer = this.findDirectAnswer(content, question);
    const contextualInsights = this.generateContextualInsights(content, question);
    const relatedDiscoveries = this.generateRelatedDiscoveries(content, question);
    const implications = this.generateImplications(content, question);
    
    let response = '## Local Answer\n\n*Processed locally without cloud AI*\n\n';
    
    if (directAnswer) {
      response += `## Direct Answer\n${directAnswer}\n\n`;
    }
    
    if (contextualInsights.length > 0) {
      response += `## Contextual Insights\n`;
      contextualInsights.forEach(insight => {
        response += `• ${insight}\n`;
      });
      response += `\n`;
    }
    
    if (implications.length > 0) {
      response += `## Implications\n`;
      implications.forEach(implication => {
        response += `• ${implication}\n`;
      });
      response += `\n`;
    }
    
    if (relatedDiscoveries.length > 0) {
      response += `## Related Discoveries\n`;
      relatedDiscoveries.forEach(discovery => {
        response += `• ${discovery}\n`;
      });
      response += `\n`;
    }
    
    if (!directAnswer && contextualInsights.length === 0 && implications.length === 0 && relatedDiscoveries.length === 0) {
      response += `## Direct Answer\nI found some relevant information in the content, but couldn't find a direct answer to your question. The content appears to be about: ${content.substring(0, 200)}...`;
    }
    
    return response.trim();
  }

  private findDirectAnswer(text: string, question: string): string {
    const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      const matchCount = questionWords.filter(word => sentenceLower.includes(word)).length;
      
      if (matchCount >= Math.ceil(questionWords.length / 2)) {
        return sentence.trim() + (sentence.endsWith('.') ? '' : '.');
      }
    }
    
    return '';
  }

  private generateContextualInsights(text: string, question: string): string[] {
    const insights: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for related concepts and context
    const contextWords = ['context', 'background', 'overview', 'introduction', 'explanation', 'details', 'information'];
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      if (contextWords.some(word => sentenceLower.includes(word)) && sentence.length > 30) {
        insights.push(sentence.trim());
      }
    });
    
    return insights.slice(0, 3);
  }

  private generateRelatedDiscoveries(text: string, question: string): string[] {
    const discoveries: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for interesting facts, statistics, or additional information
    const discoveryWords = ['interesting', 'notable', 'important', 'significant', 'key', 'fact', 'statistic', 'data', 'research', 'study'];
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      if (discoveryWords.some(word => sentenceLower.includes(word)) && sentence.length > 30) {
        discoveries.push(sentence.trim());
      }
    });
    
    return discoveries.slice(0, 3);
  }

  private generateImplications(text: string, question: string): string[] {
    const implications: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for implications, consequences, or meanings
    const implicationWords = ['means', 'implies', 'suggests', 'indicates', 'shows', 'demonstrates', 'reveals', 'consequence', 'impact', 'effect'];
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      if (implicationWords.some(word => sentenceLower.includes(word)) && sentence.length > 30) {
        implications.push(sentence.trim());
      }
    });
    
    return implications.slice(0, 2);
  }

  private getStrategyKeyByName(strategyName: string): string {
    // First check if it's already a key
    if (this.strategies.has(strategyName)) {
      return strategyName;
    }
    
    // Otherwise, find by name
    for (const [key, strategy] of this.strategies.entries()) {
      if (strategy.name === strategyName) {
        return key;
      }
    }
    
    // If not found, return the original name (will cause error)
    return strategyName;
  }

  private shouldUseAgentProcessing(content: string, deviceInfo: any): boolean {
    // Use agents for:
    // 1. Complex content (>1000 words)
    // 2. Non-mobile devices with good processing power
    // 3. Content that appears to be structured (HTML, PDF, etc.)
    
    const wordCount = content.split(/\s+/).length;
    const isComplexContent = wordCount > 1000;
    const isHighPowerDevice = !deviceInfo.isMobile && deviceInfo.processingPower === 'high';
    const isStructuredContent = /<[^>]+>|^\s*\d+\.|\|.*\|/g.test(content);
    
    return isComplexContent || isHighPowerDevice || isStructuredContent;
  }

  async processWithAgents(
    content: string,
    question: string,
    deviceInfo: any,
    url?: string,
    metadata?: any
  ): Promise<RAGResult> {
    const startTime = Date.now();
    const workflowId = `rag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Create Phoenix RAG span
      phoenixInstrumentation.createRAGSpan(
        'agent_powered_rag',
        question,
        0, // Will be updated after retrieval
        'agent_selected',
        Date.now() - startTime,
        0, // Will be updated after processing
        {
          workflow_id: workflowId,
          content_length: content.length,
          device_type: deviceInfo.isMobile ? 'mobile' : 'desktop',
          url: url
        }
      );

      // Use agent coordinator to analyze content and select optimal strategy
      const agentWorkflow = await agentCoordinator.processContentWithAgents(
        content,
        question,
        deviceInfo,
        url,
        metadata,
        {
          prioritizeSpeed: deviceInfo.isMobile,
          prioritizeAccuracy: !deviceInfo.isMobile && deviceInfo.processingPower === 'high'
        }
      );

      // Convert agent strategy to legacy strategy format for processing
      const legacyStrategy = this.convertAgentStrategyToLegacy(agentWorkflow.finalStrategy);
      
      // Process with the agent-selected strategy
      const chunks = await this.chunkContentWithAgentStrategy(content, agentWorkflow.finalStrategy);
      const legacyKey = this.getLegacyStrategyKey(agentWorkflow.finalStrategy.name);
      const vectorStore = await this.getVectorStore(legacyKey, chunks);
      const relevantDocs = await vectorStore.similaritySearch(question, 5);
      const answer = await this.generateAnswerWithAgentStrategy(
        question, 
        relevantDocs, 
        agentWorkflow.finalStrategy
      );
      
      const processingTime = Date.now() - startTime;
      
      // Create Phoenix RAG span for agent-powered RAG processing
      phoenixInstrumentation.createRAGSpan(
        'agent_rag_processing',
        question,
        relevantDocs.length,
        agentWorkflow.finalStrategy.name,
        agentWorkflow.confidence,
        processingTime,
        {
          operation_type: 'agent_rag_processing',
          strategy: agentWorkflow.finalStrategy.name,
          content_length: content.length,
          question_length: question.length,
          chunks_count: chunks.length,
          sources_count: relevantDocs.length,
          device_info: deviceInfo,
          agent_workflow_id: agentWorkflow.workflowId,
          content_analysis_confidence: agentWorkflow.contentAnalysis.confidence,
          strategy_selection_confidence: agentWorkflow.strategySelection.confidence
        }
      );
      
      return {
        answer,
        sources: relevantDocs,
        strategy: agentWorkflow.finalStrategy.name,
        confidence: agentWorkflow.confidence,
        processingTime,
        agentWorkflow,
        metadata: {
          chunkingMethod: agentWorkflow.finalStrategy.chunkingMethod,
          embeddingModel: agentWorkflow.finalStrategy.embeddingModel,
          deviceOptimized: agentWorkflow.finalStrategy.deviceOptimized,
          reasoning: agentWorkflow.strategySelection.reasoning
        }
      };
      
    } catch (error) {
      console.error('Agent-powered RAG processing error:', error);
      
      // Fallback to legacy processing
      return this.processWithLegacyRAG(content, question, deviceInfo);
    }
  }

  async processWithLegacyRAG(
    content: string,
    question: string,
    deviceInfo: any,
    strategyName?: string
  ): Promise<RAGResult> {
    const startTime = Date.now();
    
    try {
      // Select strategy if not provided
      const selectedStrategy = strategyName || 
        await this.selectStrategy(content, question, deviceInfo);
      
      // Map strategy name to key if needed
      const strategyKey = this.getStrategyKeyByName(selectedStrategy);
      const strategy = this.strategies.get(strategyKey);
      if (!strategy) {
        throw new Error(`Unknown strategy: ${selectedStrategy}`);
      }

      // Chunk the content
      const chunks = await this.chunkContent(content, strategy);
      
      // Create or get vector store
      const vectorStore = await this.getVectorStore(strategyKey, chunks);
      
      // Perform similarity search
      const relevantDocs = await vectorStore.similaritySearch(question, 5);
      
      // Generate answer using RAG
      const answer = await this.generateAnswer(question, relevantDocs, strategy);
      
      const processingTime = Date.now() - startTime;
      
      // Create Phoenix RAG span for legacy RAG processing
      phoenixInstrumentation.createRAGSpan(
        'legacy_rag_processing',
        question,
        relevantDocs.length,
        strategy.name,
        this.calculateConfidence(relevantDocs, answer),
        processingTime,
        {
          operation_type: 'legacy_rag_processing',
          strategy: strategy.name,
          content_length: content.length,
          question_length: question.length,
          chunks_count: chunks.length,
          sources_count: relevantDocs.length,
          device_info: deviceInfo
        }
      );
      
      return {
        answer,
        sources: relevantDocs,
        strategy: strategy.name, // Return the user-friendly name
        confidence: this.calculateConfidence(relevantDocs, answer),
        processingTime
      };
      
    } catch (error) {
      console.error('Legacy RAG processing error:', error);
      
      // Fallback to simple text search
      return {
        answer: this.fallbackAnswer(content, question),
        sources: [],
        strategy: 'fallback',
        confidence: 0.3,
        processingTime: Date.now() - startTime
      };
    }
  }

  private getLegacyStrategyKey(agentStrategyName: string): string {
    const strategyKeyMap: Record<string, string> = {
      'HTML Fast Processing': 'fast',
      'HTML Comprehensive Analysis': 'comprehensive',
      'PDF Structured Processing': 'comprehensive',
      'PDF Simple Processing': 'balanced',
      'Text Semantic Analysis': 'comprehensive',
      'Text Paragraph Processing': 'balanced',
      'Text Sentence Processing': 'fast',
      'Structured Data Processing': 'comprehensive',
      'Mixed Content Processing': 'balanced',
      'Mobile Optimized': 'fast',
      'Offline Processing': 'offline'
    };

    return strategyKeyMap[agentStrategyName] || 'balanced';
  }

  private convertAgentStrategyToLegacy(agentStrategy: AgentRAGStrategy): RAGStrategy {
    return {
      name: agentStrategy.name,
      description: agentStrategy.description,
      chunkSize: agentStrategy.chunkSize,
      chunkOverlap: agentStrategy.chunkOverlap,
      embeddingModel: agentStrategy.embeddingModel,
      vectorStore: agentStrategy.vectorStore,
      deviceOptimized: agentStrategy.deviceOptimized,
      maxTokens: agentStrategy.maxTokens
    };
  }

  private async chunkContentWithAgentStrategy(
    content: string, 
    agentStrategy: AgentRAGStrategy
  ): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: agentStrategy.chunkSize,
      chunkOverlap: agentStrategy.chunkOverlap,
      separators: this.getSeparatorsForChunkingMethod(agentStrategy.chunkingMethod),
    });

    const chunks = await splitter.splitDocuments([
      new Document({ pageContent: content })
    ]);

    return chunks;
  }

  private getSeparatorsForChunkingMethod(method: string): string[] {
    switch (method) {
      case 'sentence':
        return ['. ', '! ', '? ', '\n', ' '];
      case 'paragraph':
        return ['\n\n', '\n', '. ', '! ', '? ', ' '];
      case 'section':
        return ['\n\n\n', '\n\n', '\n', '. ', '! ', '? '];
      case 'semantic':
        return ['\n\n\n', '\n\n', '\n', '. ', '! ', '? ', ' ', ''];
      default:
        return ['\n\n', '\n', '. ', '! ', '? ', ' '];
    }
  }

  private async generateAnswerWithAgentStrategy(
    question: string,
    sources: Document[],
    agentStrategy: AgentRAGStrategy
  ): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return this.fallbackAnswer(sources.map(s => s.pageContent).join(' '), question);
    }

    const context = sources.map(doc => doc.pageContent).join('\n\n');
    
    const prompt = `
You are a helpful assistant that answers questions based on the provided context. 
Use only the information from the context to answer the question. Provide a complete, detailed answer.

Context: ${context}

Question: ${question}

Answer the question based on the context. Provide a comprehensive answer that fully addresses the question. If the answer is not in the context, say "I don't have enough information to answer this question."

Answer:
`;

    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.1,
      maxTokens: Math.max(agentStrategy.maxTokens, 500),
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Create Phoenix LLM span for agent-powered RAG answer generation
    const llmStartTime = Date.now();
    const result = await llm.invoke(prompt);
    const llmLatency = Date.now() - llmStartTime;
    const answer = typeof result.content === 'string' ? result.content : '';

    // Instrument with Phoenix
    phoenixInstrumentation.createLLMSpan(
      'gpt-3.5-turbo',
      'agent_rag_answer_generation',
      prompt,
      answer,
      { prompt: prompt.length, completion: answer.length },
      llmLatency,
      {
        operation_type: 'agent_rag_answer_generation',
        strategy: agentStrategy.name,
        context_length: context.length,
        sources_count: sources.length,
        question_length: question.length,
        agent_strategy: agentStrategy.name
      }
    );

    return answer;
  }

  private async chunkContent(content: string, strategy: RAGStrategy): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: strategy.chunkSize,
      chunkOverlap: strategy.chunkOverlap,
      separators: ['\n\n', '\n', '. ', '! ', '? ', ' ', ''],
    });

    const chunks = await splitter.splitDocuments([
      new Document({ pageContent: content })
    ]);

    return chunks;
  }

  private async getVectorStore(strategyName: string, chunks: Document[]): Promise<any> {
    if (this.vectorStores.has(strategyName)) {
      return this.vectorStores.get(strategyName);
    }

    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Unknown strategy: ${strategyName}`);
    }

    // Simplified vector store implementation
    const vectorStore = {
      documents: chunks,
      async similaritySearch(query: string, k: number = 5): Promise<Document[]> {
        // Simple keyword-based similarity search
        const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        
        const scoredDocs = this.documents.map(doc => {
          const content = doc.pageContent.toLowerCase();
          const score = queryWords.reduce((acc, word) => {
            return acc + (content.includes(word) ? 1 : 0);
          }, 0);
          return { doc, score };
        });
        
        return scoredDocs
          .sort((a, b) => b.score - a.score)
          .slice(0, k)
          .map(item => item.doc);
      }
    };

    this.vectorStores.set(strategyName, vectorStore);
    return vectorStore;
  }

  private async generateAnswer(
    question: string, 
    sources: Document[], 
    strategy: RAGStrategy
  ): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return this.fallbackAnswer(sources.map(s => s.pageContent).join(' '), question);
    }

    const context = sources.map(doc => doc.pageContent).join('\n\n');
    
    const prompt = `
You are a helpful assistant that answers questions based on the provided context. 
Use only the information from the context to answer the question. Provide a complete, detailed answer.

Context: ${context}

Question: ${question}

Answer the question based on the context. Provide a comprehensive answer that fully addresses the question. If the answer is not in the context, say "I don't have enough information to answer this question."

Answer:
`;

    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.1,
      maxTokens: Math.max(strategy.maxTokens, 500), // Ensure we have enough tokens for complete answers
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Create Phoenix LLM span for RAG answer generation
    const llmStartTime = Date.now();
    const result = await llm.invoke(prompt);
    const llmLatency = Date.now() - llmStartTime;
    const answer = typeof result.content === 'string' ? result.content : '';

    // Instrument with Phoenix
    phoenixInstrumentation.createLLMSpan(
      'gpt-3.5-turbo',
      'rag_answer_generation',
      prompt,
      answer,
      { prompt: prompt.length, completion: answer.length },
      llmLatency,
      {
        operation_type: 'rag_answer_generation',
        strategy: strategy.name,
        context_length: context.length,
        sources_count: sources.length,
        question_length: question.length
      }
    );

    return answer;
  }

  private calculateConfidence(sources: Document[], answer: string): number {
    if (sources.length === 0) return 0.1;
    
    // Simple confidence calculation based on source relevance
    const avgSourceLength = sources.reduce((sum, doc) => sum + doc.pageContent.length, 0) / sources.length;
    const answerLength = answer.length;
    
    // Higher confidence for longer, more detailed answers with good sources
    let confidence = Math.min(0.9, (sources.length * 0.2) + (answerLength / 1000) * 0.3);
    
    // Boost confidence if answer contains specific details
    if (answer.includes('according to') || answer.includes('based on')) {
      confidence += 0.1;
    }
    
    return Math.min(0.95, confidence);
  }

  private fallbackAnswer(content: string, question: string): string {
    const questionLower = question.toLowerCase();
    
    // Use the improved local QA logic from LangChainService
    if (questionLower.includes('elaborate') || questionLower.includes('tell me more')) {
      return this.generateElaborateResponse(content);
    }
    
    if (questionLower.includes('key takeaways') || questionLower.includes('main points')) {
      return this.generateKeyTakeaways(content);
    }
    
    if (questionLower.includes('what') && questionLower.includes('about')) {
      return this.generateTopicSummary(content);
    }

    // Enhanced keyword-based fallback with better context
    const questionWords = questionLower.split(/\s+/).filter(w => w.length > 2);
    const matchingSentences: string[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      const matchCount = questionWords.filter(word => sentenceLower.includes(word)).length;
      
      if (matchCount >= Math.ceil(questionWords.length / 2)) {
        matchingSentences.push(sentence.trim());
      }
    }
    
    if (matchingSentences.length === 0) {
      // Provide a general summary if no specific matches
      const firstSentence = content.split(/[.!?]+/)[0];
      if (firstSentence && firstSentence.trim().length > 20) {
        return firstSentence.trim() + (firstSentence.endsWith('.') ? '' : '.');
      }
      return "I don't have enough information to answer this question based on the provided content.";
    }
    
    // Return multiple relevant sentences for more complete answers
    const relevantSentences = matchingSentences.slice(0, 3);
    return relevantSentences.join(' ') + (relevantSentences[relevantSentences.length - 1].endsWith('.') ? '' : '.');
  }

  private generateElaborateResponse(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length >= 2) {
      return sentences.slice(0, 2).join(' ') + (sentences[1].endsWith('.') ? '' : '.');
    } else if (sentences.length === 1) {
      return sentences[0].trim() + (sentences[0].endsWith('.') ? '' : '.');
    }
    return content.substring(0, 200) + '...';
  }

  private generateKeyTakeaways(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);
    if (sentences.length >= 3) {
      const keyPoints = sentences.slice(0, 3).map(s => s.trim());
      return keyPoints.join(' ') + (keyPoints[2].endsWith('.') ? '' : '.');
    }
    return this.generateElaborateResponse(content);
  }

  private generateTopicSummary(content: string): string {
    const firstSentence = content.split(/[.!?]+/)[0];
    if (firstSentence && firstSentence.trim().length > 20) {
      return firstSentence.trim() + (firstSentence.endsWith('.') ? '' : '.');
    }
    return content.substring(0, 150) + '...';
  }

  getAvailableStrategies(): RAGStrategy[] {
    return Array.from(this.strategies.values());
  }

  getStrategyInfo(strategyName: string): RAGStrategy | undefined {
    return this.strategies.get(strategyName);
  }
}

export const ragService = new RAGService();
