import { ContentAnalysisResult } from '../agents/contentAnalysisAgent.js';
import { StrategySelectionResult, RAGStrategy } from '../agents/strategySelectionAgent.js';

export interface MemoryEntry<T = any> {
  id: string;
  type: MemoryType;
  key: string;
  data: T;
  metadata: {
    createdAt: Date;
    lastAccessedAt: Date;
    accessCount: number;
    ttl?: number; // Time to live in milliseconds
    tags: string[];
    source: string; // Which agent created this memory
    confidence?: number;
  };
}

export type MemoryType = 
  | 'content_analysis'
  | 'strategy_performance'
  | 'user_preferences'
  | 'content_patterns'
  | 'device_optimization'
  | 'workflow_history'
  | 'error_patterns'
  | 'success_patterns';

export interface MemoryQuery {
  type?: MemoryType;
  tags?: string[];
  source?: string;
  minConfidence?: number;
  maxAge?: number; // Maximum age in milliseconds
  limit?: number;
  sortBy?: 'createdAt' | 'lastAccessedAt' | 'accessCount' | 'confidence';
  sortOrder?: 'asc' | 'desc';
}

export interface MemoryStats {
  totalEntries: number;
  entriesByType: Record<MemoryType, number>;
  memoryUsage: number; // Estimated memory usage in bytes
  oldestEntry: Date | null;
  newestEntry: Date | null;
  mostAccessedEntry: string | null;
  averageConfidence: number;
}

export interface ContentAnalysisMemory {
  contentHash: string;
  url?: string;
  analysis: ContentAnalysisResult;
  processingTime: number;
  success: boolean;
}

export interface StrategyPerformanceMemory {
  strategyName: string;
  contentType: string;
  complexity: string;
  deviceType: string;
  performance: {
    actualLatency: number;
    actualMemoryUsage: number;
    actualAccuracy: number;
    userSatisfaction?: number;
  };
  success: boolean;
  timestamp: Date;
}

export interface UserPreferencesMemory {
  userId?: string;
  sessionId?: string;
  preferences: {
    prioritizeSpeed?: boolean;
    prioritizeAccuracy?: boolean;
    preferredStrategies?: string[];
    deviceOptimizations?: Record<string, any>;
  };
  lastUpdated: Date;
}

export interface ContentPatternMemory {
  pattern: string;
  contentType: string;
  complexity: string;
  optimalStrategy: string;
  confidence: number;
  occurrences: number;
  lastSeen: Date;
}

export class SharedMemoryService {
  private memory: Map<string, MemoryEntry> = new Map();
  private contentHashes: Map<string, string> = new Map(); // content hash -> memory key
  private strategyPerformance: Map<string, StrategyPerformanceMemory[]> = new Map();
  private userPreferences: Map<string, UserPreferencesMemory> = new Map();
  private contentPatterns: Map<string, ContentPatternMemory> = new Map();
  
  private config = {
    maxMemoryEntries: 10000,
    defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
    cleanupInterval: 60 * 60 * 1000, // 1 hour
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  };

  private cleanupTimer?: NodeJS.Timeout;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Store content analysis results in shared memory
   */
  async storeContentAnalysis(
    content: string,
    analysis: ContentAnalysisResult,
    url?: string,
    source: string = 'contentAnalysisAgent'
  ): Promise<string> {
    const contentHash = this.hashContent(content);
    const key = `content_analysis_${contentHash}`;
    
    // Check if we already have this analysis
    const existingKey = this.contentHashes.get(contentHash);
    if (existingKey && this.memory.has(existingKey)) {
      const existing = this.memory.get(existingKey)!;
      existing.metadata.lastAccessedAt = new Date();
      existing.metadata.accessCount++;
      return existingKey;
    }

    const memory: MemoryEntry<ContentAnalysisMemory> = {
      id: this.generateId(),
      type: 'content_analysis',
      key,
      data: {
        contentHash,
        url,
        analysis,
        processingTime: analysis.processingTime,
        success: true,
      },
      metadata: {
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        accessCount: 1,
        ttl: this.config.defaultTTL,
        tags: [analysis.structure.type, analysis.structure.complexity, analysis.structure.domain],
        source,
        confidence: analysis.confidence,
      },
    };

    this.memory.set(key, memory);
    this.contentHashes.set(contentHash, key);
    
    // Store content pattern for learning
    await this.updateContentPattern(analysis, 'content_analysis');
    
    return key;
  }

  /**
   * Retrieve content analysis from shared memory
   */
  async getContentAnalysis(content: string): Promise<ContentAnalysisResult | null> {
    const contentHash = this.hashContent(content);
    const key = this.contentHashes.get(contentHash);
    
    if (!key || !this.memory.has(key)) {
      return null;
    }

    const memory = this.memory.get(key)!;
    
    // Check TTL
    if (this.isExpired(memory)) {
      this.memory.delete(key);
      this.contentHashes.delete(contentHash);
      return null;
    }

    // Update access statistics
    memory.metadata.lastAccessedAt = new Date();
    memory.metadata.accessCount++;

    return memory.data.analysis;
  }

  /**
   * Store strategy performance data
   */
  async storeStrategyPerformance(
    strategyName: string,
    contentType: string,
    complexity: string,
    deviceType: string,
    performance: StrategyPerformanceMemory['performance'],
    success: boolean,
    source: string = 'strategySelectionAgent'
  ): Promise<string> {
    const key = `strategy_performance_${strategyName}_${contentType}_${complexity}_${deviceType}`;
    
    const memory: MemoryEntry<StrategyPerformanceMemory> = {
      id: this.generateId(),
      type: 'strategy_performance',
      key,
      data: {
        strategyName,
        contentType,
        complexity,
        deviceType,
        performance,
        success,
        timestamp: new Date(),
      },
      metadata: {
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        accessCount: 1,
        ttl: this.config.defaultTTL * 7, // Keep performance data for 7 days
        tags: [strategyName, contentType, complexity, deviceType],
        source,
        confidence: success ? 0.9 : 0.3,
      },
    };

    this.memory.set(key, memory);
    
    // Update strategy performance tracking
    if (!this.strategyPerformance.has(strategyName)) {
      this.strategyPerformance.set(strategyName, []);
    }
    this.strategyPerformance.get(strategyName)!.push(memory.data);
    
    return key;
  }

  /**
   * Get strategy performance history
   */
  async getStrategyPerformance(
    strategyName?: string,
    contentType?: string,
    complexity?: string,
    deviceType?: string
  ): Promise<StrategyPerformanceMemory[]> {
    const results: StrategyPerformanceMemory[] = [];
    
    if (strategyName && this.strategyPerformance.has(strategyName)) {
      const performances = this.strategyPerformance.get(strategyName)!;
      return performances.filter(p => {
        if (contentType && p.contentType !== contentType) return false;
        if (complexity && p.complexity !== complexity) return false;
        if (deviceType && p.deviceType !== deviceType) return false;
        return true;
      });
    }

    // Search all performance data
    for (const memory of this.memory.values()) {
      if (memory.type === 'strategy_performance' && !this.isExpired(memory)) {
        const data = memory.data as StrategyPerformanceMemory;
        if (contentType && data.contentType !== contentType) continue;
        if (complexity && data.complexity !== complexity) continue;
        if (deviceType && data.deviceType !== deviceType) continue;
        results.push(data);
      }
    }

    return results;
  }

  /**
   * Store user preferences
   */
  async storeUserPreferences(
    preferences: UserPreferencesMemory['preferences'],
    userId?: string,
    sessionId?: string,
    source: string = 'agentCoordinator'
  ): Promise<string> {
    const key = userId ? `user_preferences_${userId}` : `session_preferences_${sessionId}`;
    
    const memory: MemoryEntry<UserPreferencesMemory> = {
      id: this.generateId(),
      type: 'user_preferences',
      key,
      data: {
        userId,
        sessionId,
        preferences,
        lastUpdated: new Date(),
      },
      metadata: {
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        accessCount: 1,
        ttl: this.config.defaultTTL * 30, // Keep user preferences for 30 days
        tags: ['user_preferences', userId || sessionId || 'anonymous'],
        source,
        confidence: 0.8,
      },
    };

    this.memory.set(key, memory);
    this.userPreferences.set(key, memory.data);
    
    return key;
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId?: string, sessionId?: string): Promise<UserPreferencesMemory | null> {
    const key = userId ? `user_preferences_${userId}` : `session_preferences_${sessionId}`;
    
    if (this.userPreferences.has(key)) {
      const preferences = this.userPreferences.get(key)!;
      return preferences;
    }

    const memory = this.memory.get(key);
    if (memory && !this.isExpired(memory)) {
      memory.metadata.lastAccessedAt = new Date();
      memory.metadata.accessCount++;
      return memory.data as UserPreferencesMemory;
    }

    return null;
  }

  /**
   * Update content patterns for learning
   */
  private async updateContentPattern(analysis: ContentAnalysisResult, source: string): Promise<void> {
    const patternKey = `${analysis.structure.type}_${analysis.structure.complexity}`;
    
    if (this.contentPatterns.has(patternKey)) {
      const pattern = this.contentPatterns.get(patternKey)!;
      pattern.occurrences++;
      pattern.lastSeen = new Date();
      pattern.confidence = Math.min(1.0, pattern.confidence + 0.01);
    } else {
      const pattern: ContentPatternMemory = {
        pattern: patternKey,
        contentType: analysis.structure.type,
        complexity: analysis.structure.complexity,
        optimalStrategy: analysis.recommendations.chunkingStrategy,
        confidence: 0.5,
        occurrences: 1,
        lastSeen: new Date(),
      };
      this.contentPatterns.set(patternKey, pattern);
    }
  }

  /**
   * Get content patterns for strategy selection
   */
  async getContentPatterns(contentType?: string, complexity?: string): Promise<ContentPatternMemory[]> {
    const results: ContentPatternMemory[] = [];
    
    for (const pattern of this.contentPatterns.values()) {
      if (contentType && pattern.contentType !== contentType) continue;
      if (complexity && pattern.complexity !== complexity) continue;
      results.push(pattern);
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Query memory with flexible criteria
   */
  async queryMemory(query: MemoryQuery): Promise<MemoryEntry[]> {
    const results: MemoryEntry[] = [];
    
    for (const memory of this.memory.values()) {
      if (this.isExpired(memory)) continue;
      
      // Apply filters
      if (query.type && memory.type !== query.type) continue;
      if (query.source && memory.metadata.source !== query.source) continue;
      if (query.minConfidence && (memory.metadata.confidence || 0) < query.minConfidence) continue;
      if (query.maxAge && (Date.now() - memory.metadata.createdAt.getTime()) > query.maxAge) continue;
      if (query.tags && !query.tags.some(tag => memory.metadata.tags.includes(tag))) continue;
      
      results.push(memory);
    }

    // Sort results
    if (query.sortBy) {
      results.sort((a, b) => {
        const aValue = this.getSortValue(a, query.sortBy!);
        const bValue = this.getSortValue(b, query.sortBy!);
        
        if (query.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    // Apply limit
    if (query.limit) {
      return results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Get memory statistics
   */
  async getMemoryStats(): Promise<MemoryStats> {
    const stats: MemoryStats = {
      totalEntries: this.memory.size,
      entriesByType: {} as Record<MemoryType, number>,
      memoryUsage: 0,
      oldestEntry: null,
      newestEntry: null,
      mostAccessedEntry: null,
      averageConfidence: 0,
    };

    let totalConfidence = 0;
    let maxAccessCount = 0;
    let oldestTime = Date.now();
    let newestTime = 0;

    for (const memory of this.memory.values()) {
      if (this.isExpired(memory)) continue;

      // Count by type
      stats.entriesByType[memory.type] = (stats.entriesByType[memory.type] || 0) + 1;

      // Calculate memory usage (rough estimate)
      stats.memoryUsage += JSON.stringify(memory).length * 2; // Rough estimate

      // Track oldest and newest
      const createdTime = memory.metadata.createdAt.getTime();
      if (createdTime < oldestTime) {
        oldestTime = createdTime;
        stats.oldestEntry = memory.metadata.createdAt;
      }
      if (createdTime > newestTime) {
        newestTime = createdTime;
        stats.newestEntry = memory.metadata.createdAt;
      }

      // Track most accessed
      if (memory.metadata.accessCount > maxAccessCount) {
        maxAccessCount = memory.metadata.accessCount;
        stats.mostAccessedEntry = memory.key;
      }

      // Calculate average confidence
      totalConfidence += memory.metadata.confidence || 0;
    }

    stats.averageConfidence = stats.totalEntries > 0 ? totalConfidence / stats.totalEntries : 0;

    return stats;
  }

  /**
   * Clear expired memory entries
   */
  async cleanupExpiredMemory(): Promise<number> {
    let cleanedCount = 0;
    const expiredKeys: string[] = [];

    for (const [key, memory] of this.memory.entries()) {
      if (this.isExpired(memory)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      const memory = this.memory.get(key);
      if (memory) {
        // Clean up related data structures
        if (memory.type === 'content_analysis') {
          const data = memory.data as ContentAnalysisMemory;
          this.contentHashes.delete(data.contentHash);
        }
        
        this.memory.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Clear all memory (for testing or reset)
   */
  async clearAllMemory(): Promise<void> {
    this.memory.clear();
    this.contentHashes.clear();
    this.strategyPerformance.clear();
    this.userPreferences.clear();
    this.contentPatterns.clear();
  }

  /**
   * Get memory entry by key
   */
  async getMemoryEntry(key: string): Promise<MemoryEntry | null> {
    const memory = this.memory.get(key);
    if (memory && !this.isExpired(memory)) {
      memory.metadata.lastAccessedAt = new Date();
      memory.metadata.accessCount++;
      return memory;
    }
    return null;
  }

  /**
   * Update memory entry
   */
  async updateMemoryEntry(key: string, updates: Partial<MemoryEntry>): Promise<boolean> {
    const memory = this.memory.get(key);
    if (!memory || this.isExpired(memory)) {
      return false;
    }

    // Update the memory entry
    Object.assign(memory, updates);
    memory.metadata.lastAccessedAt = new Date();
    
    return true;
  }

  // Private helper methods

  private hashContent(content: string): string {
    // Simple hash function for content
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isExpired(memory: MemoryEntry): boolean {
    if (!memory.metadata.ttl) return false;
    const now = Date.now();
    const created = memory.metadata.createdAt.getTime();
    return (now - created) > memory.metadata.ttl;
  }

  private getSortValue(memory: MemoryEntry, sortBy: string): any {
    switch (sortBy) {
      case 'createdAt':
        return memory.metadata.createdAt.getTime();
      case 'lastAccessedAt':
        return memory.metadata.lastAccessedAt.getTime();
      case 'accessCount':
        return memory.metadata.accessCount;
      case 'confidence':
        return memory.metadata.confidence || 0;
      default:
        return 0;
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      try {
        const cleanedCount = await this.cleanupExpiredMemory();
        if (cleanedCount > 0) {
          console.log(`[SharedMemoryService] Cleaned up ${cleanedCount} expired memory entries`);
        }
      } catch (error) {
        console.error('[SharedMemoryService] Cleanup error:', error);
      }
    }, this.config.cleanupInterval);
  }

  /**
   * Stop the cleanup timer (for testing or shutdown)
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): typeof this.config {
    return { ...this.config };
  }
}

export const sharedMemoryService = new SharedMemoryService();
