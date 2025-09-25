import { Request, Response } from 'express';
import { ragService } from '../services/ragService.js';
import { DeviceService } from '../services/deviceService.js';
import { strategySelectionAgent } from '../agents/strategySelectionAgent.js';

export async function processWithAgentRAG(req: Request, res: Response) {
  try {
    const { content, question, deviceInfo, url, metadata, userPreferences } = req.body;
    
    if (!content || !question) {
      return res.status(400).json({ error: 'Content and question are required' });
    }

    // Detect device if not provided
    const detectedDevice = deviceInfo || DeviceService.detectDevice(
      req.headers['user-agent'] || '',
      req.body.additionalInfo
    );

    // Use agent-powered RAG processing
    const result = await ragService.processWithAgents(
      content,
      question,
      detectedDevice,
      url,
      metadata
    );
    
    res.json({
      answer: result.answer,
      sources: result.sources,
      strategy: result.strategy,
      confidence: result.confidence,
      processingTime: result.processingTime,
      metadata: result.metadata,
      agentWorkflow: {
        workflowId: result.agentWorkflow?.workflowId,
        totalProcessingTime: result.agentWorkflow?.totalProcessingTime,
        contentAnalysis: {
          type: result.agentWorkflow?.contentAnalysis.structure.type,
          complexity: result.agentWorkflow?.contentAnalysis.structure.complexity,
          confidence: result.agentWorkflow?.contentAnalysis.confidence
        },
        strategySelection: {
          selectedStrategy: result.agentWorkflow?.strategySelection.selectedStrategy.name,
          confidence: result.agentWorkflow?.strategySelection.confidence,
          reasoning: result.agentWorkflow?.strategySelection.reasoning,
          performance: result.agentWorkflow?.strategySelection.performance
        },
        overallConfidence: result.agentWorkflow?.confidence
      },
      deviceInfo: detectedDevice
    });

  } catch (error) {
    console.error('Agent RAG processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process with Agent RAG',
      answer: 'Sorry, I can\'t process this request at the moment.',
      strategy: 'error'
    });
  }
}

export async function getAgentStrategies(req: Request, res: Response) {
  try {
    // Get all available strategies from the strategy selection agent
    // This includes both standard RAG strategies and OpenELM strategies
    const allStrategies = strategySelectionAgent.getAvailableStrategies();
    res.json({ strategies: allStrategies });
  } catch (error) {
    console.error('Error getting agent strategies:', error);
    res.status(500).json({ error: 'Failed to get agent strategies' });
  }
}

export async function analyzeContentStructure(req: Request, res: Response) {
  try {
    const { content, url, metadata } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Import the content analysis agent
    const { contentAnalysisAgent } = await import('../agents/contentAnalysisAgent.js');
    
    const analysis = await contentAnalysisAgent.analyzeContent(content, url, metadata);
    
    res.json({
      structure: analysis.structure,
      confidence: analysis.confidence,
      recommendations: analysis.recommendations,
      processingTime: analysis.processingTime
    });

  } catch (error) {
    console.error('Content structure analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze content structure',
      structure: null
    });
  }
}

export async function selectOptimalStrategy(req: Request, res: Response) {
  try {
    const { contentAnalysis, deviceInfo, userPreferences, question } = req.body;
    
    if (!contentAnalysis || !deviceInfo) {
      return res.status(400).json({ error: 'Content analysis and device info are required' });
    }

    // Import the strategy selection agent
    const { strategySelectionAgent } = await import('../agents/strategySelectionAgent.js');
    
    const strategyResult = await strategySelectionAgent.selectOptimalStrategy(
      contentAnalysis,
      deviceInfo,
      userPreferences
    );
    
    res.json({
      selectedStrategy: strategyResult.selectedStrategy,
      alternatives: strategyResult.alternatives,
      confidence: strategyResult.confidence,
      reasoning: strategyResult.reasoning,
      performance: strategyResult.performance,
      processingTime: strategyResult.processingTime
    });

  } catch (error) {
    console.error('Strategy selection error:', error);
    res.status(500).json({ 
      error: 'Failed to select optimal strategy',
      selectedStrategy: null
    });
  }
}

export async function getAgentWorkflowStatus(req: Request, res: Response) {
  try {
    const { workflowId } = req.params;
    
    // Import the agent coordinator
    const { agentCoordinator } = await import('../agents/agentCoordinator.js');
    
    const messages = agentCoordinator.getWorkflowMessages(workflowId);
    const isActive = agentCoordinator.getActiveWorkflows().includes(workflowId);
    
    res.json({
      workflowId,
      isActive,
      messageCount: messages.length,
      messages: messages.map(msg => ({
        id: msg.id,
        timestamp: msg.timestamp,
        from: msg.from,
        to: msg.to,
        type: msg.type,
        dataKeys: Object.keys(msg.data || {}),
        metadata: msg.metadata
      }))
    });

  } catch (error) {
    console.error('Agent workflow status error:', error);
    res.status(500).json({ 
      error: 'Failed to get agent workflow status',
      workflowId: req.params.workflowId
    });
  }
}

export async function getAgentMetrics(req: Request, res: Response) {
  try {
    // Import the agent coordinator
    const { agentCoordinator } = await import('../agents/agentCoordinator.js');
    
    const activeWorkflows = agentCoordinator.getActiveWorkflows();
    const workflowHistory = agentCoordinator.getWorkflowHistory();
    const config = agentCoordinator.getConfig();
    
    res.json({
      activeWorkflows: activeWorkflows.length,
      totalWorkflows: workflowHistory.length,
      configuration: config,
      systemHealth: {
        coordinatorStatus: 'healthy',
        agentStatus: {
          contentAnalysis: 'available',
          strategySelection: 'available'
        },
        lastUpdate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Agent metrics error:', error);
    res.status(500).json({ 
      error: 'Failed to get agent metrics',
      metrics: null
    });
  }
}
