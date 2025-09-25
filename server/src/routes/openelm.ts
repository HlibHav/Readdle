import express from 'express';
import { langChainService } from '../services/langchainService.js';
import { openelmService } from '../services/openelmService.js';
import { strategySelectionAgent } from '../agents/strategySelectionAgent.js';
import { phoenixInstrumentation } from '../observability/phoenixInstrumentation.js';

const router = express.Router();

// Get OpenELM service status
router.get('/status', async (req, res) => {
  try {
    const status = openelmService.getServiceStatus();
    const availableModels = openelmService.getAvailableModels();
    const openelmStrategies = strategySelectionAgent.getOpenELMStrategies();

    res.json({
      success: true,
      data: {
        service: status,
        availableModels: availableModels.length,
        models: availableModels,
        strategies: openelmStrategies.length,
        strategyList: openelmStrategies
      }
    });
  } catch (error) {
    console.error('Error getting OpenELM status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get OpenELM status'
    });
  }
});

// Get available OpenELM models
router.get('/models', async (req, res) => {
  try {
    const models = openelmService.getAvailableModels();
    const { profile } = req.query;

    let filteredModels = models;
    if (profile && ['fast', 'balanced', 'comprehensive'].includes(profile as string)) {
      filteredModels = models.filter(m => m.performanceProfile === profile);
    }

    res.json({
      success: true,
      data: {
        models: filteredModels,
        total: filteredModels.length
      }
    });
  } catch (error) {
    console.error('Error getting OpenELM models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get OpenELM models'
    });
  }
});

// Get OpenELM strategies
router.get('/strategies', async (req, res) => {
  try {
    const { profile, deviceOptimized } = req.query;
    
    let strategies = strategySelectionAgent.getOpenELMStrategies();
    
    if (profile && ['fast', 'balanced', 'comprehensive'].includes(profile as string)) {
      strategies = strategies.filter(s => s.performanceProfile === profile);
    }
    
    if (deviceOptimized === 'true') {
      strategies = strategies.filter(s => s.deviceOptimized);
    }

    res.json({
      success: true,
      data: {
        strategies,
        total: strategies.length
      }
    });
  } catch (error) {
    console.error('Error getting OpenELM strategies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get OpenELM strategies'
    });
  }
});

// Generate text with OpenELM
router.post('/generate', async (req, res) => {
  try {
    const { modelId, prompt, options } = req.body;

    if (!modelId || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'modelId and prompt are required'
      });
    }

    const startTime = Date.now();
    
    const result = await langChainService.generateWithOpenELM(modelId, prompt, options);
    
    const duration = Date.now() - startTime;

    if (result.success) {
      res.json({
        success: true,
        data: {
          text: result.text,
          modelId,
          usage: result.usage,
          processingTime: duration
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Generation failed'
      });
    }
  } catch (error) {
    console.error('Error generating with OpenELM:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate text with OpenELM'
    });
  }
});

// Compare providers (OpenELM vs OpenAI)
router.post('/compare', async (req, res) => {
  try {
    const { prompt, openelmModelId, options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'prompt is required'
      });
    }

    const startTime = Date.now();
    const results: any = {};

    // Generate with OpenELM
    try {
      const openelmResult = await langChainService.generateWithOpenELM(
        openelmModelId || 'openelm-450m-instruct',
        prompt,
        options
      );
      results.openelm = {
        success: openelmResult.success,
        text: openelmResult.text,
        usage: openelmResult.usage,
        error: openelmResult.error
      };
    } catch (error) {
      results.openelm = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Generate with OpenAI (if available)
    try {
      if (langChainService.isLLMInitialized) {
        // Use existing summarizeContent method as a proxy for generation
        const openaiResult = await langChainService.summarizeContent(prompt, true);
        results.openai = {
          success: openaiResult.success,
          text: openaiResult.summary,
          error: openaiResult.error
        };
      } else {
        results.openai = {
          success: false,
          error: 'OpenAI not initialized'
        };
      }
    } catch (error) {
      results.openai = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    const duration = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        results,
        processingTime: duration,
        prompt
      }
    });
  } catch (error) {
    console.error('Error comparing providers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare providers'
    });
  }
});

// Get model recommendations based on device and requirements
router.post('/recommend', async (req, res) => {
  try {
    const { 
      deviceInfo, 
      contentType, 
      complexity, 
      userPreferences 
    } = req.body;

    const recommendations = {
      fast: strategySelectionAgent.getOpenELMStrategiesByProfile('fast'),
      balanced: strategySelectionAgent.getOpenELMStrategiesByProfile('balanced'),
      comprehensive: strategySelectionAgent.getOpenELMStrategiesByProfile('comprehensive'),
      deviceOptimized: strategySelectionAgent.getOpenELMStrategies().filter(s => s.deviceOptimized)
    };

    // Filter based on device info
    let filteredRecommendations = recommendations;
    let recommended: any[] = [];
    
    if (deviceInfo?.isMobile) {
      recommended = recommendations.deviceOptimized.filter(s => 
        s.contentTypes.includes(contentType || 'text') &&
        s.complexityLevels.includes(complexity || 'simple')
      );
    } else {
      recommended = recommendations.comprehensive.filter(s => 
        s.contentTypes.includes(contentType || 'text') &&
        s.complexityLevels.includes(complexity || 'medium')
      );
    }

    res.json({
      success: true,
      data: {
        recommendations: {
          ...filteredRecommendations,
          recommended
        },
        deviceInfo,
        contentType,
        complexity
      }
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get model recommendations'
    });
  }
});

export default router;
