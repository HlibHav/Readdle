import { Router } from 'express';
import { sharedMemoryService } from '../services/sharedMemoryService.js';

const router = Router();

/**
 * GET /shared-memory/stats
 * Get memory statistics and usage information
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await sharedMemoryService.getMemoryStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting memory stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get memory statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /shared-memory/query
 * Query memory with flexible criteria
 */
router.get('/query', async (req, res) => {
  try {
    const {
      type,
      tags,
      source,
      minConfidence,
      maxAge,
      limit,
      sortBy,
      sortOrder
    } = req.query;

    const query = {
      type: type as any,
      tags: tags ? (Array.isArray(tags) ? tags.map(t => String(t)) : [String(tags)]) : undefined,
      source: source as string,
      minConfidence: minConfidence ? parseFloat(minConfidence as string) : undefined,
      maxAge: maxAge ? parseInt(maxAge as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const results = await sharedMemoryService.queryMemory(query);
    
    res.json({
      success: true,
      data: {
        results,
        count: results.length,
        query
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error querying memory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to query memory',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /shared-memory/strategy-performance
 * Get strategy performance history
 */
router.get('/strategy-performance', async (req, res) => {
  try {
    const {
      strategyName,
      contentType,
      complexity,
      deviceType
    } = req.query;

    const performance = await sharedMemoryService.getStrategyPerformance(
      strategyName as string,
      contentType as string,
      complexity as string,
      deviceType as string
    );

    res.json({
      success: true,
      data: {
        performance,
        count: performance.length,
        filters: {
          strategyName,
          contentType,
          complexity,
          deviceType
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting strategy performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get strategy performance',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /shared-memory/content-patterns
 * Get content patterns for learning
 */
router.get('/content-patterns', async (req, res) => {
  try {
    const { contentType, complexity } = req.query;

    const patterns = await sharedMemoryService.getContentPatterns(
      contentType as string,
      complexity as string
    );

    res.json({
      success: true,
      data: {
        patterns,
        count: patterns.length,
        filters: { contentType, complexity }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting content patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get content patterns',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /shared-memory/entry/:key
 * Get specific memory entry by key
 */
router.get('/entry/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const entry = await sharedMemoryService.getMemoryEntry(key);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Memory entry not found',
        key
      });
    }

    res.json({
      success: true,
      data: entry,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting memory entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get memory entry',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /shared-memory/cleanup
 * Manually trigger memory cleanup
 */
router.post('/cleanup', async (req, res) => {
  try {
    const cleanedCount = await sharedMemoryService.cleanupExpiredMemory();
    
    res.json({
      success: true,
      data: {
        cleanedCount,
        message: `Cleaned up ${cleanedCount} expired memory entries`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error cleaning up memory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup memory',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /shared-memory/clear
 * Clear all memory (use with caution)
 */
router.delete('/clear', async (req, res) => {
  try {
    await sharedMemoryService.clearAllMemory();
    
    res.json({
      success: true,
      data: {
        message: 'All memory cleared successfully'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing memory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear memory',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /shared-memory/analytics
 * Get analytics and insights from memory data
 */
router.get('/analytics', async (req, res) => {
  try {
    const stats = await sharedMemoryService.getMemoryStats();
    
    // Get recent strategy performance
    const recentPerformance = await sharedMemoryService.getStrategyPerformance();
    
    // Get content patterns
    const contentPatterns = await sharedMemoryService.getContentPatterns();
    
    // Calculate insights
    const insights = {
      mostUsedStrategies: calculateMostUsedStrategies(recentPerformance),
      contentTypeDistribution: calculateContentTypeDistribution(recentPerformance),
      performanceTrends: calculatePerformanceTrends(recentPerformance),
      commonPatterns: calculateCommonPatterns(contentPatterns),
      memoryEfficiency: {
        hitRate: calculateHitRate(stats),
        averageAge: calculateAverageAge(stats),
        utilizationRate: calculateUtilizationRate(stats)
      }
    };

    res.json({
      success: true,
      data: {
        stats,
        insights,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting memory analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get memory analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions for analytics
function calculateMostUsedStrategies(performance: any[]): any[] {
  const strategyCounts = new Map<string, number>();
  
  performance.forEach(perf => {
    const count = strategyCounts.get(perf.strategyName) || 0;
    strategyCounts.set(perf.strategyName, count + 1);
  });

  return Array.from(strategyCounts.entries())
    .map(([strategy, count]) => ({ strategy, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculateContentTypeDistribution(performance: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  performance.forEach(perf => {
    distribution[perf.contentType] = (distribution[perf.contentType] || 0) + 1;
  });

  return distribution;
}

function calculatePerformanceTrends(performance: any[]): any {
  // Group by time periods and calculate trends
  const now = new Date();
  const last24h = performance.filter(p => 
    p.timestamp && new Date(p.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
  );
  const last7d = performance.filter(p => 
    p.timestamp && new Date(p.timestamp) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  );

  return {
    last24h: {
      count: last24h.length,
      avgLatency: last24h.length > 0 ? last24h.reduce((sum, p) => sum + (p.performance?.actualLatency || 0), 0) / last24h.length : 0,
      avgAccuracy: last24h.length > 0 ? last24h.reduce((sum, p) => sum + (p.performance?.actualAccuracy || 0), 0) / last24h.length : 0
    },
    last7d: {
      count: last7d.length,
      avgLatency: last7d.length > 0 ? last7d.reduce((sum, p) => sum + (p.performance?.actualLatency || 0), 0) / last7d.length : 0,
      avgAccuracy: last7d.length > 0 ? last7d.reduce((sum, p) => sum + (p.performance?.actualAccuracy || 0), 0) / last7d.length : 0
    }
  };
}

function calculateCommonPatterns(patterns: any[]): any[] {
  return patterns
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 10)
    .map(pattern => ({
      pattern: pattern.pattern,
      occurrences: pattern.occurrences,
      confidence: pattern.confidence,
      optimalStrategy: pattern.optimalStrategy
    }));
}

function calculateHitRate(stats: any): number {
  // This would need to be tracked separately in a real implementation
  return 0.75; // Placeholder
}

function calculateAverageAge(stats: any): number {
  if (!stats.oldestEntry || !stats.newestEntry) return 0;
  return (stats.newestEntry.getTime() - stats.oldestEntry.getTime()) / (1000 * 60 * 60); // hours
}

function calculateUtilizationRate(stats: any): number {
  return Math.min(1.0, stats.memoryUsage / (100 * 1024 * 1024)); // 100MB max
}

export default router;
