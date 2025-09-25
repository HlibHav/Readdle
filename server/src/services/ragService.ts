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
    
    // Check if it's an agent strategy name that needs mapping
    const legacyKey = this.getLegacyStrategyKey(strategyName);
    if (this.strategies.has(legacyKey)) {
      return legacyKey;
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

  private getStrategySpecificPromptEnhancement(strategy: AgentRAGStrategy): string {
    const enhancements: Record<string, string> = {
      'HTML Comprehensive Analysis': `
## Specialized Approach for HTML Content:
- Focus on structural elements, semantic meaning, and content hierarchy
- Extract key information from headings, lists, and data tables
- Identify important links, navigation elements, and interactive components
- Analyze content organization and user experience implications`,

      'PDF Document Processing': `
## Specialized Approach for PDF Documents:
- Extract and analyze text content while preserving document structure
- Identify sections, subsections, and document flow
- Focus on key findings, conclusions, and actionable insights
- Pay attention to formatting cues that indicate importance`,

      'Mobile Optimized': `
## Specialized Approach for Mobile Content:
- Prioritize concise, scannable information delivery
- Focus on key points and essential details
- Optimize for quick comprehension and mobile reading patterns
- Emphasize actionable insights and practical takeaways`,

      'Fast Processing': `
## Specialized Approach for Quick Analysis:
- Provide immediate, high-level insights and key findings
- Focus on the most important and relevant information
- Deliver concise summaries with essential details
- Prioritize speed without sacrificing accuracy`,

      'Balanced Analysis': `
## Specialized Approach for Balanced Processing:
- Provide comprehensive coverage with appropriate detail level
- Balance thoroughness with readability
- Include both high-level insights and supporting details
- Ensure complete coverage of the question while maintaining clarity`,

      'Comprehensive Analysis': `
## Specialized Approach for Deep Analysis:
- Provide exhaustive coverage of all relevant aspects
- Include detailed explanations, examples, and context
- Analyze implications, connections, and broader significance
- Deliver thorough insights with comprehensive supporting evidence`
    };

    // Check for OpenELM strategies
    if (strategy.llmProvider === 'openelm') {
      return `
## Specialized OpenELM Approach:
- Leverage Apple's efficient language model for ${strategy.performanceProfile} performance
- Optimize for ${strategy.llmModel} model capabilities and constraints
- Focus on local processing advantages and device optimization
- Provide efficient, high-quality responses tailored to the model's strengths`;
    }

    // Return enhancement based on strategy name or fallback
    return enhancements[strategy.name] || `
## Specialized Approach:
- Apply ${strategy.name} methodology for optimal results
- Focus on ${strategy.contentTypes.join(', ')} content types
- Optimize for ${strategy.performanceProfile} performance requirements
- Tailor analysis to ${strategy.complexityLevels.join(', ')} complexity levels`;
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
    const sourceCount = sources.length;
    
    // Create strategy-specific prompt enhancements
    const strategyEnhancement = this.getStrategySpecificPromptEnhancement(agentStrategy);
    
    const prompt = `
You are an expert AI assistant specialized in ${agentStrategy.name}. You excel at ${agentStrategy.description}.

## Your Expertise:
- **Strategy**: ${agentStrategy.name}
- **Focus**: ${agentStrategy.description}
- **Performance Profile**: ${agentStrategy.performanceProfile}
- **Content Types**: ${agentStrategy.contentTypes.join(', ')}
- **Complexity Levels**: ${agentStrategy.complexityLevels.join(', ')}

${strategyEnhancement}

## Instructions:
1. **Analyze thoroughly**: Examine all provided context with your specialized expertise
2. **Apply strategy**: Use your ${agentStrategy.name} approach to provide the most relevant answer
3. **Be comprehensive**: Address all aspects of the question using your specialized knowledge
4. **Structure clearly**: Organize your response with clear sections and formatting
5. **Cite sources**: Reference specific parts of the context that support your answer
6. **Optimize for profile**: Tailor your response for ${agentStrategy.performanceProfile} performance
7. **Acknowledge limitations**: State clearly if information is missing or incomplete

## Context (${sourceCount} source${sourceCount !== 1 ? 's' : ''}):
${context}

## Question:
${question}

## Response Format:
Provide a specialized answer that includes:
- **Direct Answer**: A clear response tailored to your ${agentStrategy.name} expertise
- **Supporting Details**: Relevant facts and examples from the context
- **Strategic Insights**: Analysis based on your specialized approach
- **Confidence Assessment**: Your evaluation of answer completeness and reliability

## Answer:
`;

    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini', // Use better model for improved quality
      temperature: 0.1,
      maxTokens: Math.max(agentStrategy.maxTokens, 800), // Increase token limit for better responses
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Create Phoenix LLM span for agent-powered RAG answer generation
    const llmStartTime = Date.now();
    const result = await llm.invoke(prompt);
    const llmLatency = Date.now() - llmStartTime;
    const answer = typeof result.content === 'string' ? result.content : '';

    // Check if this is a complex query that needs multi-pass reasoning
    const isComplex = this.isComplexQuery(question);
    
    let finalAnswer = answer;
    if (isComplex) {
      // Use multi-pass reasoning for complex queries
      finalAnswer = await this.performMultiPassReasoning(question, sources, agentStrategy);
    } else {
      // Use single-pass with validation for simple queries
      finalAnswer = await this.enhanceAnswerWithValidation(answer, question, sources);
    }

    // Instrument with Phoenix
    phoenixInstrumentation.createLLMSpan(
      'gpt-4o-mini',
      'agent_rag_answer_generation',
      prompt,
      finalAnswer,
      { prompt: prompt.length, completion: finalAnswer.length },
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

    // Add source citations and confidence indicators
    const answerWithCitations = this.addSourceCitations(finalAnswer, sources);
    
    return answerWithCitations;
  }

  private async chunkContent(content: string, strategy: RAGStrategy): Promise<Document[]> {
    // Enhanced chunking with better context preservation
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: strategy.chunkSize,
      chunkOverlap: Math.max(strategy.chunkOverlap, strategy.chunkSize * 0.2), // Ensure at least 20% overlap
      separators: this.getEnhancedSeparators(content),
      keepSeparator: true, // Preserve separators for better context
    });

    const chunks = await splitter.splitDocuments([
      new Document({ pageContent: content })
    ]);

    // Post-process chunks to enhance context
    return this.enhanceChunksWithContext(chunks, content);
  }

  private getEnhancedSeparators(content: string): string[] {
    // Detect content type and adjust separators accordingly
    const isHTML = /<[^>]+>/.test(content);
    const isStructured = /\n\s*\d+\.|\n\s*[-*+]|\|\s*\w+/.test(content);
    const hasSections = /#{1,6}\s+\w+|Chapter|Section|Part/i.test(content);
    
    if (isHTML) {
      return [
        '</div>', '</section>', '</article>', '</main>', '</header>', '</footer>',
        '</p>', '</h1>', '</h2>', '</h3>', '</h4>', '</h5>', '</h6>',
        '</ul>', '</ol>', '</li>', '</table>', '</tr>', '</td>', '</th>',
        '\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ', ''
      ];
    } else if (hasSections) {
      return [
        '\n\n\n', '\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ', ''
      ];
    } else if (isStructured) {
      return [
        '\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ', ''
      ];
    } else {
      return [
        '\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ', ''
      ];
    }
  }

  private enhanceChunksWithContext(chunks: Document[], originalContent: string): Document[] {
    return chunks.map((chunk, index) => {
      const enhancedContent = this.addContextualInformation(chunk.pageContent, originalContent, index, chunks.length);
      return new Document({ 
        pageContent: enhancedContent,
        metadata: {
          ...chunk.metadata,
          chunkIndex: index,
          totalChunks: chunks.length,
          hasContext: true
        }
      });
    });
  }

  private addContextualInformation(chunkContent: string, originalContent: string, chunkIndex: number, totalChunks: number): string {
    let enhanced = chunkContent;
    
    // Add section context if available
    const sectionMatch = chunkContent.match(/(?:#{1,6}|Chapter|Section|Part)\s+([^\n]+)/i);
    if (sectionMatch) {
      enhanced = `[Section: ${sectionMatch[1]}]\n${enhanced}`;
    }
    
    // Add position context
    const position = chunkIndex === 0 ? 'beginning' : 
                    chunkIndex === totalChunks - 1 ? 'end' : 
                    'middle';
    enhanced = `[Position: ${position} of document]\n${enhanced}`;
    
    // Add content type hints
    if (/<[^>]+>/.test(chunkContent)) {
      enhanced = `[Content Type: HTML]\n${enhanced}`;
    } else if (/\n\s*\d+\.|\n\s*[-*+]/.test(chunkContent)) {
      enhanced = `[Content Type: Structured List]\n${enhanced}`;
    } else if (/\|\s*\w+/.test(chunkContent)) {
      enhanced = `[Content Type: Table/Grid]\n${enhanced}`;
    }
    
    return enhanced;
  }

  private async validateResponseQuality(answer: string, question: string, sources: Document[]): Promise<{
    score: number;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 1.0;

    // Check for basic quality indicators
    if (answer.length < 50) {
      issues.push('Answer is too short');
      suggestions.push('Provide more detailed explanation');
      score -= 0.3;
    }

    if (answer.includes("I don't have enough information") || answer.includes("I cannot answer")) {
      issues.push('Answer indicates insufficient information');
      suggestions.push('Check if more context is needed');
      score -= 0.4;
    }

    // Check for question addressing
    const questionWords = question.toLowerCase().split(/\s+/);
    const answerWords = answer.toLowerCase();
    const addressedWords = questionWords.filter(word => 
      word.length > 3 && answerWords.includes(word)
    );
    const addressRatio = addressedWords.length / questionWords.length;
    
    if (addressRatio < 0.3) {
      issues.push('Answer may not fully address the question');
      suggestions.push('Ensure all aspects of the question are covered');
      score -= 0.2;
    }

    // Check for source utilization
    const sourceText = sources.map(s => s.pageContent).join(' ').toLowerCase();
    const answerText = answer.toLowerCase();
    const sourceWords = sourceText.split(/\s+/).filter(word => word.length > 4);
    const utilizedWords = sourceWords.filter(word => answerText.includes(word));
    const utilizationRatio = utilizedWords.length / Math.min(sourceWords.length, 100); // Cap at 100 words
    
    if (utilizationRatio < 0.1) {
      issues.push('Answer may not be based on provided sources');
      suggestions.push('Better utilize information from the context');
      score -= 0.3;
    }

    // Check for structure and clarity
    const hasStructure = /^#{1,6}\s+|^[\*\-\+]\s+|^\d+\.\s+|\*\*.*\*\*|##|###/.test(answer);
    if (!hasStructure && answer.length > 200) {
      suggestions.push('Consider adding structure with headers, bullets, or formatting');
    }

    // Check for confidence indicators
    const hasConfidence = /confidence|certain|definite|clear|obvious/i.test(answer);
    const hasUncertainty = /might|could|possibly|perhaps|maybe|unclear/i.test(answer);
    
    if (hasUncertainty && !hasConfidence) {
      suggestions.push('Consider providing confidence indicators');
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      issues,
      suggestions
    };
  }

  private async enhanceAnswerWithValidation(
    originalAnswer: string, 
    question: string, 
    sources: Document[]
  ): Promise<string> {
    const validation = await this.validateResponseQuality(originalAnswer, question, sources);
    
    if (validation.score >= 0.8) {
      return originalAnswer;
    }

    // If quality is low, add enhancement
    let enhancedAnswer = originalAnswer;
    
    if (validation.issues.length > 0) {
      enhancedAnswer += `\n\n---\n**Quality Assessment:**\n`;
      enhancedAnswer += `- **Confidence Score**: ${(validation.score * 100).toFixed(0)}%\n`;
      
      if (validation.issues.length > 0) {
        enhancedAnswer += `- **Areas for Improvement**: ${validation.issues.join(', ')}\n`;
      }
      
      if (validation.suggestions.length > 0) {
        enhancedAnswer += `- **Suggestions**: ${validation.suggestions.join(', ')}\n`;
      }
    }

    return enhancedAnswer;
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
    const sourceCount = sources.length;
    
    const prompt = `
You are an expert research assistant with deep analytical capabilities. Your task is to provide comprehensive, accurate, and well-structured answers based on the provided context.

## Instructions:
1. **Analyze thoroughly**: Carefully examine all provided context to understand the full scope of information
2. **Be comprehensive**: Address all aspects of the question, including relevant details, implications, and context
3. **Be accurate**: Only use information explicitly stated in the context - do not infer or assume additional facts
4. **Structure clearly**: Organize your response with clear sections, bullet points, or numbered lists when appropriate
5. **Cite sources**: When possible, reference which part of the context supports your answer
6. **Be confident**: If the information is clearly present, provide a definitive answer
7. **Acknowledge limitations**: If the context is incomplete or unclear, explicitly state what information is missing

## Context (${sourceCount} source${sourceCount !== 1 ? 's' : ''}):
${context}

## Question:
${question}

## Response Format:
Provide a well-structured answer that includes:
- **Direct Answer**: A clear, concise response to the main question
- **Supporting Details**: Relevant facts, examples, or explanations from the context
- **Additional Context**: Any related information that helps understand the answer
- **Confidence Level**: Your assessment of how complete and reliable the answer is

## Answer:
`;

    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini', // Use better model for improved quality
      temperature: 0.1,
      maxTokens: Math.max(strategy.maxTokens, 800), // Increase token limit for better responses
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Create Phoenix LLM span for RAG answer generation
    const llmStartTime = Date.now();
    const result = await llm.invoke(prompt);
    const llmLatency = Date.now() - llmStartTime;
    const answer = typeof result.content === 'string' ? result.content : '';

    // Check if this is a complex query that needs multi-pass reasoning
    const isComplex = this.isComplexQuery(question);
    
    let finalAnswer = answer;
    if (isComplex) {
      // Use multi-pass reasoning for complex queries
      finalAnswer = await this.performMultiPassReasoning(question, sources, strategy);
    } else {
      // Use single-pass with validation for simple queries
      finalAnswer = await this.enhanceAnswerWithValidation(answer, question, sources);
    }

    // Instrument with Phoenix
    phoenixInstrumentation.createLLMSpan(
      'gpt-4o-mini',
      'rag_answer_generation',
      prompt,
      finalAnswer,
      { prompt: prompt.length, completion: finalAnswer.length },
      llmLatency,
      {
        operation_type: 'rag_answer_generation',
        strategy: strategy.name,
        context_length: context.length,
        sources_count: sources.length,
        question_length: question.length
      }
    );

    // Add source citations and confidence indicators
    const answerWithCitations = this.addSourceCitations(finalAnswer, sources);
    
    return answerWithCitations;
  }

  private addSourceCitations(answer: string, sources: Document[]): string {
    if (sources.length === 0) {
      return answer;
    }

    // Calculate confidence score
    const confidenceScore = this.calculateConfidence(sources, answer);
    
    // Add confidence indicator
    let enhancedAnswer = answer;
    
    // Add source citations section
    enhancedAnswer += `\n\n---\n**Sources & Confidence**\n`;
    enhancedAnswer += `**Confidence Level**: ${(confidenceScore * 100).toFixed(0)}%\n\n`;
    
    if (sources.length > 0) {
      enhancedAnswer += `**Sources Used** (${sources.length} reference${sources.length !== 1 ? 's' : ''}):\n`;
      
      sources.forEach((source, index) => {
        const snippet = this.extractRelevantSnippet(source.pageContent, answer);
        enhancedAnswer += `\n**Source ${index + 1}**: ${snippet}\n`;
      });
    }

    return enhancedAnswer;
  }

  private extractRelevantSnippet(sourceContent: string, answer: string): string {
    // Find the most relevant sentence or phrase from the source
    const sentences = sourceContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) {
      return sourceContent.substring(0, 100) + '...';
    }

    // Find sentence with most word overlap with answer
    let bestSentence = sentences[0];
    let maxOverlap = 0;

    const answerWords = answer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    sentences.forEach(sentence => {
      const sentenceWords = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const overlap = answerWords.filter(word => sentenceWords.includes(word)).length;
      
      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        bestSentence = sentence;
      }
    });

    // Truncate if too long
    if (bestSentence.length > 150) {
      bestSentence = bestSentence.substring(0, 147) + '...';
    }

    return bestSentence.trim();
  }

  private async performMultiPassReasoning(
    question: string,
    sources: Document[],
    strategy: RAGStrategy
  ): Promise<string> {
    // Detect if this is a complex query that would benefit from multi-pass reasoning
    const isComplexQuery = this.isComplexQuery(question);
    
    if (!isComplexQuery) {
      // Use single-pass for simple queries
      return this.generateAnswer(question, sources, strategy);
    }

    console.log('🤔 Performing multi-pass reasoning for complex query...');

    // Pass 1: Initial analysis and breakdown
    const analysisPrompt = `
You are an expert analyst. Break down this complex question into its key components and identify what information is needed to provide a comprehensive answer.

Question: ${question}

Provide:
1. **Key Components**: What are the main parts of this question?
2. **Information Needs**: What specific information is required?
3. **Analysis Approach**: How should this be approached systematically?
4. **Sub-questions**: What specific sub-questions should be addressed?

Be concise but thorough.
`;

    const analysisLLM = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.1,
      maxTokens: 400,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const analysisResult = await analysisLLM.invoke(analysisPrompt);
    const analysis = analysisResult.content as string;

    // Pass 2: Detailed answer generation with analysis context
    const context = sources.map(doc => doc.pageContent).join('\n\n');
    
    const detailedPrompt = `
Based on the analysis below, provide a comprehensive answer to the complex question.

## Analysis:
${analysis}

## Context:
${context}

## Question:
${question}

## Instructions:
1. Use the analysis to structure your response systematically
2. Address each component identified in the analysis
3. Provide detailed explanations with supporting evidence
4. Include connections and relationships between different aspects
5. Conclude with a synthesized summary

Provide a thorough, well-structured response:
`;

    const detailedLLM = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.1,
      maxTokens: 1200, // More tokens for complex responses
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const detailedResult = await detailedLLM.invoke(detailedPrompt);
    const detailedAnswer = detailedResult.content as string;

    // Pass 3: Quality review and refinement
    const reviewPrompt = `
Review this answer for a complex question and suggest improvements if needed.

## Original Question:
${question}

## Generated Answer:
${detailedAnswer}

## Analysis Used:
${analysis}

Review the answer for:
1. **Completeness**: Does it address all aspects of the question?
2. **Accuracy**: Is the information correct and well-supported?
3. **Clarity**: Is it well-structured and easy to understand?
4. **Depth**: Does it provide sufficient detail and insight?

If the answer is already high quality, provide a brief confirmation. If improvements are needed, suggest specific enhancements.

Response:
`;

    const reviewLLM = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.1,
      maxTokens: 300,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const reviewResult = await reviewLLM.invoke(reviewPrompt);
    const review = reviewResult.content as string;

    // Combine results
    let finalAnswer = detailedAnswer;
    
    if (review.toLowerCase().includes('improvement') || review.toLowerCase().includes('suggest')) {
      finalAnswer += `\n\n---\n**Quality Review**: ${review}`;
    }

    return finalAnswer;
  }

  private isComplexQuery(question: string): boolean {
    const complexIndicators = [
      // Multi-part questions
      /\?.*\?/,
      /and|or|but|however|although|while|whereas/i,
      // Comparison questions
      /compare|contrast|difference|similarity|versus|vs/i,
      // Analysis questions
      /analyze|explain|discuss|evaluate|assess|examine/i,
      // Complex temporal or conditional
      /if.*then|when.*then|depending on|based on/i,
      // Multiple topics
      /\b(?:what|how|why|when|where).*\b(?:what|how|why|when|where)/i,
      // Long questions (>50 words)
      question.split(/\s+/).length > 50
    ];

    return complexIndicators.some(indicator => {
      if (typeof indicator === 'boolean') return indicator;
      return indicator.test(question);
    });
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
