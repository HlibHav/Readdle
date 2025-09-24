import { ContentAnalysisResult, ContentStructure } from './contentAnalysisAgent.js';
import { sharedMemoryService } from '../services/sharedMemoryService.js';

export interface RAGStrategy {
  name: string;
  description: string;
  chunkingMethod: 'sentence' | 'paragraph' | 'section' | 'semantic';
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002';
  vectorStore: 'memory' | 'faiss';
  deviceOptimized: boolean;
  maxTokens: number;
  contentTypes: ContentStructure['type'][];
  complexityLevels: ContentStructure['complexity'][];
  performanceProfile: 'fast' | 'balanced' | 'comprehensive';
  reasoning: string;
}

export interface StrategySelectionResult {
  selectedStrategy: RAGStrategy;
  alternatives: RAGStrategy[];
  confidence: number;
  reasoning: string;
  performance: {
    expectedLatency: number;
    memoryUsage: number;
    accuracy: number;
  };
  processingTime: number;
}

export class StrategySelectionAgent {
  private strategies: Map<string, RAGStrategy> = new Map();

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    // Content-type specific strategies
    this.strategies.set('html-fast', {
      name: 'HTML Fast Processing',
      description: 'Optimized for simple HTML content with good structure',
      chunkingMethod: 'paragraph',
      chunkSize: 512,
      chunkOverlap: 100,
      embeddingModel: 'text-embedding-3-small',
      vectorStore: 'memory',
      deviceOptimized: true,
      maxTokens: 300,
      contentTypes: ['html'],
      complexityLevels: ['simple'],
      performanceProfile: 'fast',
      reasoning: 'Fast processing for simple HTML content'
    });

    this.strategies.set('html-comprehensive', {
      name: 'HTML Comprehensive Analysis',
      description: 'Deep analysis for complex HTML with multiple sections',
      chunkingMethod: 'section',
      chunkSize: 1536,
      chunkOverlap: 200,
      embeddingModel: 'text-embedding-3-large',
      vectorStore: 'faiss',
      deviceOptimized: false,
      maxTokens: 600,
      contentTypes: ['html'],
      complexityLevels: ['complex'],
      performanceProfile: 'comprehensive',
      reasoning: 'Comprehensive analysis for complex HTML structures'
    });

    this.strategies.set('pdf-structured', {
      name: 'PDF Structured Processing',
      description: 'Specialized for PDF documents with tables and complex layouts',
      chunkingMethod: 'semantic',
      chunkSize: 2048,
      chunkOverlap: 300,
      embeddingModel: 'text-embedding-3-large',
      vectorStore: 'faiss',
      deviceOptimized: false,
      maxTokens: 800,
      contentTypes: ['pdf'],
      complexityLevels: ['medium', 'complex'],
      performanceProfile: 'comprehensive',
      reasoning: 'Semantic chunking preserves PDF structure and relationships'
    });

    this.strategies.set('pdf-simple', {
      name: 'PDF Simple Processing',
      description: 'Basic processing for simple PDF documents',
      chunkingMethod: 'paragraph',
      chunkSize: 1024,
      chunkOverlap: 150,
      embeddingModel: 'text-embedding-3-small',
      vectorStore: 'memory',
      deviceOptimized: true,
      maxTokens: 400,
      contentTypes: ['pdf'],
      complexityLevels: ['simple'],
      performanceProfile: 'balanced',
      reasoning: 'Balanced approach for simple PDF content'
    });

    this.strategies.set('text-semantic', {
      name: 'Text Semantic Analysis',
      description: 'Semantic chunking for complex text content',
      chunkingMethod: 'semantic',
      chunkSize: 1536,
      chunkOverlap: 200,
      embeddingModel: 'text-embedding-3-large',
      vectorStore: 'faiss',
      deviceOptimized: false,
      maxTokens: 600,
      contentTypes: ['text'],
      complexityLevels: ['complex'],
      performanceProfile: 'comprehensive',
      reasoning: 'Semantic understanding for complex text relationships'
    });

    this.strategies.set('text-paragraph', {
      name: 'Text Paragraph Processing',
      description: 'Paragraph-based chunking for medium complexity text',
      chunkingMethod: 'paragraph',
      chunkSize: 1024,
      chunkOverlap: 150,
      embeddingModel: 'text-embedding-3-small',
      vectorStore: 'memory',
      deviceOptimized: true,
      maxTokens: 400,
      contentTypes: ['text'],
      complexityLevels: ['medium'],
      performanceProfile: 'balanced',
      reasoning: 'Efficient paragraph-based processing for medium complexity'
    });

    this.strategies.set('text-sentence', {
      name: 'Text Sentence Processing',
      description: 'Sentence-based chunking for simple text content',
      chunkingMethod: 'sentence',
      chunkSize: 512,
      chunkOverlap: 100,
      embeddingModel: 'text-embedding-3-small',
      vectorStore: 'memory',
      deviceOptimized: true,
      maxTokens: 200,
      contentTypes: ['text'],
      complexityLevels: ['simple'],
      performanceProfile: 'fast',
      reasoning: 'Fast sentence-based processing for simple content'
    });

    this.strategies.set('structured-data', {
      name: 'Structured Data Processing',
      description: 'Specialized for JSON, XML, and structured data formats',
      chunkingMethod: 'semantic',
      chunkSize: 2048,
      chunkOverlap: 400,
      embeddingModel: 'text-embedding-3-large',
      vectorStore: 'faiss',
      deviceOptimized: false,
      maxTokens: 800,
      contentTypes: ['structured'],
      complexityLevels: ['medium', 'complex'],
      performanceProfile: 'comprehensive',
      reasoning: 'Preserves data structure and relationships in structured content'
    });

    this.strategies.set('mixed-content', {
      name: 'Mixed Content Processing',
      description: 'Adaptive processing for content with multiple formats',
      chunkingMethod: 'semantic',
      chunkSize: 1536,
      chunkOverlap: 200,
      embeddingModel: 'text-embedding-3-large',
      vectorStore: 'faiss',
      deviceOptimized: false,
      maxTokens: 600,
      contentTypes: ['mixed'],
      complexityLevels: ['medium', 'complex'],
      performanceProfile: 'comprehensive',
      reasoning: 'Adaptive processing for diverse content types'
    });

    // Device-optimized fallback strategies
    this.strategies.set('mobile-optimized', {
      name: 'Mobile Optimized',
      description: 'Optimized for mobile devices with limited resources',
      chunkingMethod: 'sentence',
      chunkSize: 256,
      chunkOverlap: 50,
      embeddingModel: 'text-embedding-3-small',
      vectorStore: 'memory',
      deviceOptimized: true,
      maxTokens: 150,
      contentTypes: ['html', 'text', 'pdf'],
      complexityLevels: ['simple', 'medium'],
      performanceProfile: 'fast',
      reasoning: 'Mobile-optimized for limited processing power and memory'
    });

    this.strategies.set('offline-processing', {
      name: 'Offline Processing',
      description: 'Local processing without cloud dependencies',
      chunkingMethod: 'paragraph',
      chunkSize: 512,
      chunkOverlap: 100,
      embeddingModel: 'text-embedding-3-small',
      vectorStore: 'memory',
      deviceOptimized: true,
      maxTokens: 200,
      contentTypes: ['html', 'text', 'pdf'],
      complexityLevels: ['simple', 'medium'],
      performanceProfile: 'fast',
      reasoning: 'Offline processing for privacy and connectivity constraints'
    });
  }

  async selectOptimalStrategy(
    contentAnalysis: ContentAnalysisResult,
    deviceInfo: {
      isMobile: boolean;
      hasInternet: boolean;
      processingPower: 'low' | 'medium' | 'high';
      memoryAvailable: number;
    },
    userPreferences?: {
      prioritizeSpeed?: boolean;
      prioritizeAccuracy?: boolean;
      maxProcessingTime?: number;
    }
  ): Promise<StrategySelectionResult> {
    const startTime = Date.now();

    try {
      // Get historical performance data from shared memory
      const historicalPerformance = await this.getHistoricalPerformance(
        contentAnalysis.structure,
        deviceInfo
      );

      // Filter strategies based on content type and complexity
      const candidateStrategies = this.filterStrategies(
        contentAnalysis.structure,
        deviceInfo
      );

      if (candidateStrategies.length === 0) {
        return this.getFallbackStrategy(contentAnalysis, deviceInfo);
      }

      // Score and rank strategies (enhanced with historical data)
      const scoredStrategies = await this.scoreStrategies(
        candidateStrategies,
        contentAnalysis,
        deviceInfo,
        userPreferences,
        historicalPerformance
      );

      // Select best strategy
      const selectedStrategy = scoredStrategies[0].strategy;
      const alternatives = scoredStrategies.slice(1, 4).map(s => s.strategy);

      // Calculate performance metrics
      const performance = this.estimatePerformance(selectedStrategy, contentAnalysis, deviceInfo);

      // Generate reasoning
      const reasoning = this.generateReasoning(
        selectedStrategy,
        contentAnalysis,
        deviceInfo,
        scoredStrategies[0].score
      );

      return {
        selectedStrategy,
        alternatives,
        confidence: scoredStrategies[0].score,
        reasoning,
        performance,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Strategy selection error:', error);
      return this.getFallbackStrategy(contentAnalysis, deviceInfo);
    }
  }

  private filterStrategies(
    structure: ContentStructure,
    deviceInfo: any
  ): RAGStrategy[] {
    const strategies: RAGStrategy[] = [];

    for (const strategy of this.strategies.values()) {
      // Check content type compatibility
      if (!strategy.contentTypes.includes(structure.type)) continue;

      // Check complexity compatibility
      if (!strategy.complexityLevels.includes(structure.complexity)) continue;

      // Check device compatibility
      if (deviceInfo.isMobile && !strategy.deviceOptimized) continue;
      if (!deviceInfo.hasInternet && strategy.embeddingModel !== 'text-embedding-3-small') continue;

      // Check memory constraints
      const estimatedMemory = this.estimateMemoryUsage(strategy, structure);
      if (estimatedMemory > deviceInfo.memoryAvailable * 0.5) continue; // Use max 50% of available memory

      strategies.push(strategy);
    }

    return strategies;
  }

  private async scoreStrategies(
    strategies: RAGStrategy[],
    contentAnalysis: ContentAnalysisResult,
    deviceInfo: any,
    userPreferences?: any,
    historicalPerformance?: any[]
  ): Promise<{ strategy: RAGStrategy; score: number }[]> {
    const scoredStrategies: { strategy: RAGStrategy; score: number }[] = [];

    for (const strategy of strategies) {
      let score = 0;

      // Content compatibility score (0-0.3)
      score += this.calculateContentCompatibilityScore(strategy, contentAnalysis.structure) * 0.3;

      // Device compatibility score (0-0.25)
      score += this.calculateDeviceCompatibilityScore(strategy, deviceInfo) * 0.25;

      // Performance score (0-0.2)
      score += this.calculatePerformanceScore(strategy, deviceInfo, userPreferences) * 0.2;

      // Accuracy score (0-0.1)
      score += this.calculateAccuracyScore(strategy, contentAnalysis) * 0.1;

      // Historical performance score (0-0.15) - NEW!
      score += this.calculateHistoricalPerformanceScore(strategy, historicalPerformance) * 0.15;

      scoredStrategies.push({ strategy, score });
    }

    return scoredStrategies.sort((a, b) => b.score - a.score);
  }

  private calculateContentCompatibilityScore(strategy: RAGStrategy, structure: ContentStructure): number {
    let score = 0.5; // Base score

    // Content type match
    if (strategy.contentTypes.includes(structure.type)) {
      score += 0.3;
    }

    // Complexity match
    if (strategy.complexityLevels.includes(structure.complexity)) {
      score += 0.2;
    }

    // Special handling for content features
    if (structure.tables && strategy.chunkingMethod === 'semantic') {
      score += 0.1; // Semantic chunking is better for tables
    }

    if (structure.codeBlocks && strategy.chunkingMethod === 'section') {
      score += 0.1; // Section chunking preserves code structure
    }

    if (structure.sections.length > 5 && strategy.chunkingMethod === 'section') {
      score += 0.1; // Section chunking for multi-section content
    }

    return Math.min(1.0, score);
  }

  private calculateDeviceCompatibilityScore(strategy: RAGStrategy, deviceInfo: any): number {
    let score = 0.5; // Base score

    // Device optimization
    if (deviceInfo.isMobile && strategy.deviceOptimized) {
      score += 0.3;
    } else if (!deviceInfo.isMobile && !strategy.deviceOptimized) {
      score += 0.2;
    }

    // Processing power compatibility
    if (deviceInfo.processingPower === 'low' && strategy.performanceProfile === 'fast') {
      score += 0.2;
    } else if (deviceInfo.processingPower === 'high' && strategy.performanceProfile === 'comprehensive') {
      score += 0.2;
    } else if (deviceInfo.processingPower === 'medium' && strategy.performanceProfile === 'balanced') {
      score += 0.2;
    }

    return Math.min(1.0, score);
  }

  private calculatePerformanceScore(strategy: RAGStrategy, deviceInfo: any, userPreferences?: any): number {
    let score = 0.5; // Base score

    // User preferences
    if (userPreferences?.prioritizeSpeed && strategy.performanceProfile === 'fast') {
      score += 0.3;
    } else if (userPreferences?.prioritizeAccuracy && strategy.performanceProfile === 'comprehensive') {
      score += 0.3;
    }

    // Memory efficiency
    if (strategy.vectorStore === 'memory' && deviceInfo.memoryAvailable < 2048) {
      score += 0.2;
    }

    // Network efficiency
    if (strategy.embeddingModel === 'text-embedding-3-small' && deviceInfo.hasInternet) {
      score += 0.1; // Smaller model = faster network requests
    }

    return Math.min(1.0, score);
  }

  private calculateAccuracyScore(strategy: RAGStrategy, contentAnalysis: ContentAnalysisResult): number {
    let score = 0.5; // Base score

    // Embedding model quality
    if (strategy.embeddingModel === 'text-embedding-3-large') {
      score += 0.3;
    } else if (strategy.embeddingModel === 'text-embedding-3-small') {
      score += 0.2;
    }

    // Chunking method appropriateness
    if (contentAnalysis.structure.complexity === 'complex' && strategy.chunkingMethod === 'semantic') {
      score += 0.2;
    } else if (contentAnalysis.structure.complexity === 'simple' && strategy.chunkingMethod === 'sentence') {
      score += 0.2;
    }

    return Math.min(1.0, score);
  }

  private estimateMemoryUsage(strategy: RAGStrategy, structure: ContentStructure): number {
    // Rough memory estimation in MB
    const baseMemory = 50; // Base memory for the service
    const chunkMemory = (structure.wordCount / strategy.chunkSize) * 0.1; // Memory per chunk
    const embeddingMemory = strategy.embeddingModel.includes('large') ? 200 : 100; // Embedding model memory
    const vectorStoreMemory = strategy.vectorStore === 'faiss' ? 150 : 50; // Vector store memory

    return baseMemory + chunkMemory + embeddingMemory + vectorStoreMemory;
  }

  private estimatePerformance(
    strategy: RAGStrategy,
    contentAnalysis: ContentAnalysisResult,
    deviceInfo: any
  ): StrategySelectionResult['performance'] {
    const baseLatency = 1000; // Base latency in ms
    const chunkingLatency = (contentAnalysis.structure.wordCount / strategy.chunkSize) * 100;
    const embeddingLatency = strategy.embeddingModel.includes('large') ? 2000 : 1000;
    const deviceMultiplier = deviceInfo.isMobile ? 1.5 : 1.0;

    const expectedLatency = (baseLatency + chunkingLatency + embeddingLatency) * deviceMultiplier;

    const memoryUsage = this.estimateMemoryUsage(strategy, contentAnalysis.structure);

    let accuracy = 0.7; // Base accuracy
    if (strategy.embeddingModel === 'text-embedding-3-large') accuracy += 0.2;
    if (strategy.chunkingMethod === 'semantic') accuracy += 0.1;

    return {
      expectedLatency,
      memoryUsage,
      accuracy: Math.min(1.0, accuracy)
    };
  }

  private generateReasoning(
    strategy: RAGStrategy,
    contentAnalysis: ContentAnalysisResult,
    deviceInfo: any,
    confidence: number
  ): string {
    const reasons: string[] = [];

    reasons.push(`Selected ${strategy.name} for ${contentAnalysis.structure.type} content`);

    if (contentAnalysis.structure.complexity === 'complex') {
      reasons.push('Complex content requires comprehensive processing');
    } else if (contentAnalysis.structure.complexity === 'simple') {
      reasons.push('Simple content allows for faster processing');
    }

    if (deviceInfo.isMobile) {
      reasons.push('Mobile device optimization applied');
    }

    if (strategy.chunkingMethod === 'semantic') {
      reasons.push('Semantic chunking preserves content relationships');
    } else if (strategy.chunkingMethod === 'section') {
      reasons.push('Section-based chunking maintains document structure');
    }

    if (confidence > 0.8) {
      reasons.push('High confidence in strategy selection');
    } else if (confidence < 0.6) {
      reasons.push('Moderate confidence - consider alternatives');
    }

    return reasons.join('. ') + '.';
  }

  private getFallbackStrategy(
    contentAnalysis: ContentAnalysisResult,
    deviceInfo: any
  ): StrategySelectionResult {
    const fallbackStrategy = deviceInfo.isMobile 
      ? this.strategies.get('mobile-optimized')!
      : this.strategies.get('text-paragraph')!;

    return {
      selectedStrategy: fallbackStrategy,
      alternatives: [],
      confidence: 0.3,
      reasoning: 'Fallback strategy due to no suitable candidates found',
      performance: {
        expectedLatency: 5000,
        memoryUsage: 100,
        accuracy: 0.5
      },
      processingTime: 0
    };
  }

  getAvailableStrategies(): RAGStrategy[] {
    return Array.from(this.strategies.values());
  }

  getStrategyByName(name: string): RAGStrategy | undefined {
    return this.strategies.get(name);
  }

  /**
   * Get historical performance data from shared memory
   */
  private async getHistoricalPerformance(
    structure: ContentStructure,
    deviceInfo: any
  ): Promise<any[]> {
    try {
      const deviceType = deviceInfo.isMobile ? 'mobile' : 'desktop';
      
      return await sharedMemoryService.getStrategyPerformance(
        undefined, // all strategies
        structure.type,
        structure.complexity,
        deviceType
      );
    } catch (error) {
      console.warn('Failed to get historical performance data:', error);
      return [];
    }
  }

  /**
   * Calculate historical performance score for a strategy
   */
  private calculateHistoricalPerformanceScore(
    strategy: RAGStrategy,
    historicalPerformance?: any[]
  ): number {
    if (!historicalPerformance || historicalPerformance.length === 0) {
      return 0.5; // Neutral score when no historical data
    }

    // Filter performance data for this strategy
    const strategyPerformance = historicalPerformance.filter(
      perf => perf.strategyName === strategy.name
    );

    if (strategyPerformance.length === 0) {
      return 0.5; // Neutral score for new strategies
    }

    // Calculate average performance metrics
    const avgLatency = strategyPerformance.reduce((sum, perf) => sum + perf.performance.actualLatency, 0) / strategyPerformance.length;
    const avgAccuracy = strategyPerformance.reduce((sum, perf) => sum + perf.performance.actualAccuracy, 0) / strategyPerformance.length;
    const successRate = strategyPerformance.filter(perf => perf.success).length / strategyPerformance.length;

    // Normalize and score (lower latency = higher score, higher accuracy = higher score)
    const latencyScore = Math.max(0, 1 - (avgLatency / 10000)); // Normalize to 10s max
    const accuracyScore = avgAccuracy;
    const successScore = successRate;

    // Weighted average
    return (latencyScore * 0.3 + accuracyScore * 0.4 + successScore * 0.3);
  }
}

export const strategySelectionAgent = new StrategySelectionAgent();
