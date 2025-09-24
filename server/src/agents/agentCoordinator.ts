import { contentAnalysisAgent, ContentAnalysisResult } from './contentAnalysisAgent.js';
import { strategySelectionAgent, StrategySelectionResult, RAGStrategy } from './strategySelectionAgent.js';
import { DeviceService, DeviceInfo } from '../services/deviceService.js';
import { sharedMemoryService } from '../services/sharedMemoryService.js';

export interface AgentMessage {
  id: string;
  timestamp: Date;
  from: string;
  to: string;
  type: 'request' | 'response' | 'notification' | 'error';
  data: any;
  metadata?: {
    priority: 'low' | 'medium' | 'high';
    timeout?: number;
    retryCount?: number;
  };
}

export interface AgentWorkflowResult {
  contentAnalysis: ContentAnalysisResult;
  strategySelection: StrategySelectionResult;
  finalStrategy: RAGStrategy;
  confidence: number;
  totalProcessingTime: number;
  workflowId: string;
  agentMessages: AgentMessage[];
}

export interface AgentWorkflowConfig {
  enableParallelProcessing: boolean;
  maxRetries: number;
  timeoutMs: number;
  fallbackOnError: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class AgentCoordinator {
  private messageHistory: Map<string, AgentMessage[]> = new Map();
  private activeWorkflows: Map<string, Promise<AgentWorkflowResult>> = new Map();
  private config: AgentWorkflowConfig;

  constructor(config?: Partial<AgentWorkflowConfig>) {
    this.config = {
      enableParallelProcessing: true,
      maxRetries: 2,
      timeoutMs: 30000,
      fallbackOnError: true,
      logLevel: 'info',
      ...config
    };
  }

  async processContentWithAgents(
    content: string,
    question: string,
    deviceInfo: DeviceInfo,
    url?: string,
    metadata?: any,
    userPreferences?: {
      prioritizeSpeed?: boolean;
      prioritizeAccuracy?: boolean;
      maxProcessingTime?: number;
    }
  ): Promise<AgentWorkflowResult> {
    const workflowId = this.generateWorkflowId();
    const startTime = Date.now();
    const messages: AgentMessage[] = [];

    try {
      this.log('info', `Starting agent workflow ${workflowId}`, { contentLength: content.length, question });

      // Step 1: Check shared memory for existing content analysis
      let contentAnalysis: ContentAnalysisResult;
      const cachedAnalysis = await sharedMemoryService.getContentAnalysis(content);
      
      if (cachedAnalysis) {
        this.log('info', `Using cached content analysis from shared memory`, { 
          type: cachedAnalysis.structure.type,
          complexity: cachedAnalysis.structure.complexity 
        });
        contentAnalysis = cachedAnalysis;
        
        const cacheMessage = this.createMessage(
          workflowId,
          'sharedMemory',
          'coordinator',
          'notification',
          { source: 'content_analysis_cache', result: contentAnalysis }
        );
        messages.push(cacheMessage);
      } else {
        // Step 1: Content Analysis Agent
        const analysisMessage = this.createMessage(
          workflowId,
          'coordinator',
          'contentAnalysis',
          'request',
          { content, url, metadata }
        );
        messages.push(analysisMessage);

        contentAnalysis = await this.executeWithTimeout(
          () => contentAnalysisAgent.analyzeContent(content, url, metadata),
          this.config.timeoutMs,
          'Content analysis timeout'
        );

        // Store analysis in shared memory
        await sharedMemoryService.storeContentAnalysis(content, contentAnalysis, url, 'contentAnalysisAgent');
      }

      const analysisResponse = this.createMessage(
        workflowId,
        'contentAnalysis',
        'coordinator',
        'response',
        { result: contentAnalysis }
      );
      messages.push(analysisResponse);

      this.log('info', `Content analysis completed`, { 
        type: contentAnalysis.structure.type,
        complexity: contentAnalysis.structure.complexity,
        confidence: contentAnalysis.confidence
      });

      // Step 2: Strategy Selection Agent (depends on content analysis)
      const strategyMessage = this.createMessage(
        workflowId,
        'coordinator',
        'strategySelection',
        'request',
        { 
          contentAnalysis,
          deviceInfo,
          userPreferences,
          question // Pass question for context-aware strategy selection
        }
      );
      messages.push(strategyMessage);

      // Check for user preferences in shared memory
      const userId = metadata?.userId;
      const sessionId = metadata?.sessionId;
      let enhancedUserPreferences = userPreferences;
      
      if (userId || sessionId) {
        const storedPreferences = await sharedMemoryService.getUserPreferences(userId, sessionId);
        if (storedPreferences) {
          enhancedUserPreferences = {
            ...storedPreferences.preferences,
            ...userPreferences, // User preferences override stored ones
          };
        }
      }

      const strategySelection = await this.executeWithTimeout(
        () => strategySelectionAgent.selectOptimalStrategy(
          contentAnalysis,
          deviceInfo,
          enhancedUserPreferences
        ),
        this.config.timeoutMs,
        'Strategy selection timeout'
      );

      const strategyResponse = this.createMessage(
        workflowId,
        'strategySelection',
        'coordinator',
        'response',
        { result: strategySelection }
      );
      messages.push(strategyResponse);

      this.log('info', `Strategy selection completed`, {
        selectedStrategy: strategySelection.selectedStrategy.name,
        confidence: strategySelection.confidence,
        expectedLatency: strategySelection.performance.expectedLatency
      });

      // Step 3: Validate and finalize strategy
      const finalStrategy = this.validateAndFinalizeStrategy(
        strategySelection.selectedStrategy,
        contentAnalysis,
        deviceInfo,
        messages
      );

      // Calculate overall confidence
      const overallConfidence = this.calculateOverallConfidence(
        contentAnalysis.confidence,
        strategySelection.confidence
      );

      const totalProcessingTime = Date.now() - startTime;

      const result: AgentWorkflowResult = {
        contentAnalysis,
        strategySelection,
        finalStrategy,
        confidence: overallConfidence,
        totalProcessingTime,
        workflowId,
        agentMessages: messages
      };

      this.log('info', `Agent workflow ${workflowId} completed successfully`, {
        totalProcessingTime,
        overallConfidence,
        finalStrategy: finalStrategy.name
      });

      // Store strategy performance in shared memory for learning
      await this.storeStrategyPerformance(
        finalStrategy,
        contentAnalysis,
        deviceInfo,
        totalProcessingTime,
        overallConfidence
      );

      // Store user preferences if provided
      if (enhancedUserPreferences && (userId || sessionId)) {
        await sharedMemoryService.storeUserPreferences(
          enhancedUserPreferences,
          userId,
          sessionId,
          'agentCoordinator'
        );
      }

      return result;

    } catch (error) {
      this.log('error', `Agent workflow ${workflowId} failed`, { error: error instanceof Error ? error.message : 'Unknown error' });
      
      if (this.config.fallbackOnError) {
        return this.handleWorkflowError(workflowId, content, deviceInfo, error, messages, startTime);
      } else {
        throw error;
      }
    } finally {
      this.activeWorkflows.delete(workflowId);
    }
  }

  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    timeoutMessage: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);

      operation()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private validateAndFinalizeStrategy(
    selectedStrategy: RAGStrategy,
    contentAnalysis: ContentAnalysisResult,
    deviceInfo: DeviceInfo,
    messages: AgentMessage[]
  ): RAGStrategy {
    // Validation checks
    const validationMessage = this.createMessage(
      messages[0].id,
      'coordinator',
      'validation',
      'request',
      { strategy: selectedStrategy, contentAnalysis, deviceInfo }
    );
    messages.push(validationMessage);

    // Check if strategy is compatible with device constraints
    if (deviceInfo.isMobile && !selectedStrategy.deviceOptimized) {
      this.log('warn', 'Selected strategy not optimized for mobile, switching to mobile-optimized');
      const mobileStrategy = strategySelectionAgent.getStrategyByName('mobile-optimized');
      if (mobileStrategy) {
        return mobileStrategy;
      }
    }

    // Check memory constraints
    const estimatedMemory = this.estimateStrategyMemory(selectedStrategy, contentAnalysis);
    if (estimatedMemory > deviceInfo.memoryAvailable * 0.8) {
      this.log('warn', 'Strategy exceeds memory constraints, switching to memory-optimized strategy');
      // Find a more memory-efficient strategy
      const alternatives = strategySelectionAgent.getAvailableStrategies()
        .filter(s => s.vectorStore === 'memory' && s.deviceOptimized);
      
      if (alternatives.length > 0) {
        return alternatives[0];
      }
    }

    const validationResponse = this.createMessage(
      messages[0].id,
      'validation',
      'coordinator',
      'response',
      { validated: true, strategy: selectedStrategy }
    );
    messages.push(validationResponse);

    return selectedStrategy;
  }

  private calculateOverallConfidence(
    analysisConfidence: number,
    strategyConfidence: number
  ): number {
    // Weighted average with slight penalty for complexity
    const analysisWeight = 0.6;
    const strategyWeight = 0.4;
    
    const weightedConfidence = (analysisConfidence * analysisWeight) + (strategyConfidence * strategyWeight);
    
    // Apply complexity penalty
    const complexityPenalty = 0.05; // 5% penalty for agent coordination complexity
    return Math.max(0.1, weightedConfidence - complexityPenalty);
  }

  private handleWorkflowError(
    workflowId: string,
    content: string,
    deviceInfo: DeviceInfo,
    error: any,
    messages: AgentMessage[],
    startTime: number
  ): AgentWorkflowResult {
    this.log('warn', `Using fallback strategy due to workflow error`, { error: error.message });

    // Create fallback analysis
    const fallbackAnalysis: ContentAnalysisResult = {
      structure: {
        type: 'text',
        complexity: 'medium',
        sections: [],
        headings: [],
        tables: false,
        lists: false,
        codeBlocks: false,
        images: false,
        links: 0,
        wordCount: content.split(/\s+/).length,
        language: 'en',
        domain: 'unknown',
        readabilityScore: 50
      },
      confidence: 0.3,
      recommendations: {
        chunkingStrategy: 'paragraph',
        embeddingModel: 'text-embedding-3-small',
        chunkSize: 1024,
        chunkOverlap: 150,
        reasoning: 'Fallback due to agent workflow error'
      },
      processingTime: 0
    };

    // Create fallback strategy
    const fallbackStrategy: RAGStrategy = deviceInfo.isMobile 
      ? strategySelectionAgent.getStrategyByName('mobile-optimized')!
      : strategySelectionAgent.getStrategyByName('text-paragraph')!;

    const fallbackStrategyResult: StrategySelectionResult = {
      selectedStrategy: fallbackStrategy,
      alternatives: [],
      confidence: 0.3,
      reasoning: 'Fallback strategy due to agent workflow failure',
      performance: {
        expectedLatency: 5000,
        memoryUsage: 100,
        accuracy: 0.5
      },
      processingTime: 0
    };

    const errorMessage = this.createMessage(
      workflowId,
      'coordinator',
      'fallback',
      'notification',
      { error: error.message, fallbackStrategy: fallbackStrategy.name }
    );
    messages.push(errorMessage);

    return {
      contentAnalysis: fallbackAnalysis,
      strategySelection: fallbackStrategyResult,
      finalStrategy: fallbackStrategy,
      confidence: 0.3,
      totalProcessingTime: Date.now() - startTime,
      workflowId,
      agentMessages: messages
    };
  }

  private estimateStrategyMemory(strategy: RAGStrategy, contentAnalysis: ContentAnalysisResult): number {
    const baseMemory = 50;
    const chunkMemory = (contentAnalysis.structure.wordCount / strategy.chunkSize) * 0.1;
    const embeddingMemory = strategy.embeddingModel.includes('large') ? 200 : 100;
    const vectorStoreMemory = strategy.vectorStore === 'faiss' ? 150 : 50;
    
    return baseMemory + chunkMemory + embeddingMemory + vectorStoreMemory;
  }

  private createMessage(
    workflowId: string,
    from: string,
    to: string,
    type: AgentMessage['type'],
    data: any,
    metadata?: AgentMessage['metadata']
  ): AgentMessage {
    const message: AgentMessage = {
      id: `${workflowId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      from,
      to,
      type,
      data,
      metadata: {
        priority: 'medium',
        timeout: this.config.timeoutMs,
        retryCount: 0,
        ...metadata
      }
    };

    // Store in message history
    if (!this.messageHistory.has(workflowId)) {
      this.messageHistory.set(workflowId, []);
    }
    this.messageHistory.get(workflowId)!.push(message);

    return message;
  }

  private generateWorkflowId(): string {
    return `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(level: string, message: string, data?: any) {
    if (this.shouldLog(level)) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] [AgentCoordinator] ${message}`, data || '');
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  // Public methods for monitoring and debugging
  getActiveWorkflows(): string[] {
    return Array.from(this.activeWorkflows.keys());
  }

  getWorkflowMessages(workflowId: string): AgentMessage[] {
    return this.messageHistory.get(workflowId) || [];
  }

  getWorkflowHistory(): string[] {
    return Array.from(this.messageHistory.keys());
  }

  updateConfig(newConfig: Partial<AgentWorkflowConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AgentWorkflowConfig {
    return { ...this.config };
  }

  /**
   * Store strategy performance data in shared memory
   */
  private async storeStrategyPerformance(
    strategy: RAGStrategy,
    contentAnalysis: ContentAnalysisResult,
    deviceInfo: DeviceInfo,
    actualProcessingTime: number,
    actualConfidence: number
  ): Promise<void> {
    try {
      const deviceType = deviceInfo.isMobile ? 'mobile' : 'desktop';
      
      await sharedMemoryService.storeStrategyPerformance(
        strategy.name,
        contentAnalysis.structure.type,
        contentAnalysis.structure.complexity,
        deviceType,
        {
          actualLatency: actualProcessingTime,
          actualMemoryUsage: this.estimateStrategyMemory(strategy, contentAnalysis),
          actualAccuracy: actualConfidence,
        },
        true, // success
        'agentCoordinator'
      );
    } catch (error) {
      this.log('warn', 'Failed to store strategy performance in shared memory', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

export const agentCoordinator = new AgentCoordinator();
