/**
 * Phoenix Observability Routes - Agent Workflow Compatible
 * 
 * Provides comprehensive observability endpoints following Phoenix best practices
 * for agent orchestration, LLM operations, and RAG workflows.
 */
import express from 'express';
import { phoenixInstrumentation } from '../observability/phoenixInstrumentation.js';

const router = express.Router();

/**
 * Get Phoenix observability status and configuration
 */
router.get('/status', (req, res) => {
  try {
    const isEnabled = phoenixInstrumentation.isEnabled();
    
    res.json({
      success: true,
      data: {
        configuration: {
          enabled: isEnabled,
          projectName: process.env.PHOENIX_PROJECT_NAME || 'documents-browser-app',
          endpoint: process.env.PHOENIX_COLLECTOR_ENDPOINT || 'http://localhost:4317',
          hasApiKey: !!process.env.PHOENIX_API_KEY,
          environment: process.env.NODE_ENV || 'development'
        },
        capabilities: {
          llmTracing: true,
          agentWorkflowTracing: true,
          ragOperationTracing: true,
          errorTracking: true,
          systemSpanTracking: true,
          workflowContextManagement: true
        },
        metrics: {
          activeWorkflows: phoenixInstrumentation.getActiveWorkflows(),
          activeSpansCount: phoenixInstrumentation.getActiveSpansCount(),
          totalWorkflows: phoenixInstrumentation.getActiveWorkflows().length
        },
        integrations: {
          opentelemetry: true,
          phoenixSemanticConventions: true,
          agentWorkflowCompatible: true
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting Phoenix status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Phoenix status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get detailed Phoenix observability metrics
 */
router.get('/metrics', (req, res) => {
  try {
    if (!phoenixInstrumentation.isEnabled()) {
      return res.status(400).json({
        success: false,
        error: 'Phoenix observability is not enabled',
        message: 'Set PHOENIX_OBSERVABILITY_ENABLED=true to enable observability'
      });
    }

    res.json({
      success: true,
      data: {
        workflows: {
          active: phoenixInstrumentation.getActiveWorkflows(),
          totalActive: phoenixInstrumentation.getActiveWorkflows().length
        },
        spans: {
          activeCount: phoenixInstrumentation.getActiveSpansCount()
        },
        tracing: {
          llmOperations: 'Tracked via Phoenix semantic conventions',
          agentWorkflows: 'Multi-agent orchestration tracing',
          ragOperations: 'Comprehensive retrieval and generation tracking',
          errorHandling: 'Automatic error span creation'
        },
        performance: {
          collectorEndpoint: process.env.PHOENIX_COLLECTOR_ENDPOINT || 'http://localhost:4317',
          tracingOverhead: 'Minimal - async span creation',
          batchingEnabled: true
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting Phoenix metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Phoenix metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create test spans for Phoenix verification
 */
router.post('/test', (req, res) => {
  try {
    if (!phoenixInstrumentation.isEnabled()) {
      return res.status(400).json({
        success: false,
        error: 'Phoenix observability is not enabled',
        message: 'Set PHOENIX_OBSERVABILITY_ENABLED=true to enable observability'
      });
    }

    const testWorkflowId = `test-workflow-${Date.now()}`;
    
    // Create workflow context
    const workflowContext = phoenixInstrumentation.createWorkflowContext(testWorkflowId);
    
    // Create test LLM span
    phoenixInstrumentation.createLLMSpan(
      'test-model-gpt-4o-mini',
      'test_operation',
      'This is a test prompt for Phoenix observability verification',
      'This is a test response demonstrating Phoenix agent workflow tracing',
      { prompt: 15, completion: 12 },
      150,
      {
        'test_type': 'manual_verification',
        'user_agent': req.headers['user-agent'] || 'unknown',
        'ip': req.ip || 'unknown',
        'endpoint': '/api/phoenix/test',
        'workflow_id': testWorkflowId
      }
    );

    // Create test agent step span
    phoenixInstrumentation.createAgentStepSpan(
      testWorkflowId,
      'test_content_analysis',
      'content_analysis_agent',
      { content: 'Test content for analysis', type: 'text' },
      { analysis: { type: 'text', complexity: 'simple', confidence: 0.95 } },
      75,
      {
        'test_type': 'agent_step_verification',
        'step_number': 1
      }
    );

    // Create test RAG span
    phoenixInstrumentation.createRAGSpan(
      'test_rag_operation',
      'What is Phoenix observability?',
      3,
      'test_strategy',
      200,
      0.92,
      {
        'test_type': 'rag_verification',
        'workflow_id': testWorkflowId
      }
    );

    // Create test agent workflow span
    phoenixInstrumentation.createAgentWorkflowSpan(
      'test_agent_coordinator',
      'test_workflow_orchestration',
      testWorkflowId,
      {
        content: 'Test workflow input',
        question: 'Test question',
        deviceInfo: { type: 'desktop', processingPower: 'high' }
      },
      {
        strategy: 'test_strategy',
        confidence: 0.88,
        processingTime: 425
      },
      425,
      {
        'workflow_id': testWorkflowId,
        'test_type': 'workflow_verification',
        'agent_count': 2,
        'steps_completed': ['content_analysis', 'strategy_selection']
      }
    );

    // End workflow context
    phoenixInstrumentation.endWorkflowContext(testWorkflowId, {
      'workflow.success': true,
      'workflow.test_type': 'comprehensive_verification',
      'workflow.spans_created': 4
    });

    res.json({
      success: true,
      message: 'Phoenix test spans created successfully',
      data: {
        workflowId: testWorkflowId,
        spansCreated: [
          'LLM span (test-model-gpt-4o-mini)',
          'Agent step span (content_analysis_agent)',
          'RAG operation span (test_rag_operation)',
          'Agent workflow span (test_agent_coordinator)'
        ],
        phoenixUI: 'http://localhost:6007',
        note: 'Check Phoenix UI to see all traces with proper agent workflow structure'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating Phoenix test spans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create Phoenix test spans',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create test error span for error tracking verification
 */
router.post('/test-error', (req, res) => {
  try {
    if (!phoenixInstrumentation.isEnabled()) {
      return res.status(400).json({
        success: false,
        error: 'Phoenix observability is not enabled',
        message: 'Set PHOENIX_OBSERVABILITY_ENABLED=true to enable observability'
      });
    }

    // Create a test error
    const testError = new Error('This is a test error for Phoenix error tracking verification');
    
    // Create error span
    phoenixInstrumentation.createErrorSpan(
      'test_error_operation',
      testError,
      {
        'test_type': 'error_verification',
        'user_agent': req.headers['user-agent'] || 'unknown',
        'ip': req.ip || 'unknown',
        'endpoint': '/api/phoenix/test-error',
        'error_category': 'intentional_test_error'
      }
    );

    res.json({
      success: true,
      message: 'Phoenix test error span created successfully',
      data: {
        errorMessage: testError.message,
        errorType: testError.name,
        phoenixUI: 'http://localhost:6007',
        note: 'Check Phoenix UI to see error tracking in action'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating Phoenix test error span:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create Phoenix test error span',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get comprehensive Phoenix documentation
 */
router.get('/docs', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        title: 'Phoenix AI Observability - Agent Workflow Compatible',
        description: 'Comprehensive observability for multi-agent RAG systems',
        features: {
          llmTracing: {
            description: 'Traces all LLM operations with Phoenix semantic conventions',
            attributes: [
              'llm.model_name',
              'llm.input_messages',
              'llm.output_messages',
              'llm.token_count.prompt',
              'llm.token_count.completion'
            ],
            supportedModels: ['OpenAI GPT-4o-mini', 'OpenELM (270M-3B)', 'Hugging Face API']
          },
          agentWorkflowTracing: {
            description: 'Multi-agent orchestration tracing similar to CrewAI',
            features: [
              'Workflow context management',
              'Step-level observability',
              'Agent coordination tracking',
              'Multi-agent decision flow'
            ],
            workflowTypes: ['multi_agent_rag', 'content_analysis', 'strategy_selection']
          },
          ragOperationTracing: {
            description: 'Comprehensive RAG pipeline observability',
            attributes: [
              'retrieval.query',
              'retrieval.document_count',
              'rag.strategy_name',
              'rag.confidence'
            ],
            strategies: ['Comprehensive Analysis', 'Fast Processing', 'OpenELM Local']
          },
          errorTracking: {
            description: 'Automatic error span creation and tracking',
            features: [
              'Exception capture',
              'Stack trace logging',
              'Error categorization',
              'Failure recovery tracking'
            ]
          }
        },
        endpoints: {
          'GET /api/phoenix/status': 'Get observability status and configuration',
          'GET /api/phoenix/metrics': 'Get detailed performance metrics',
          'POST /api/phoenix/test': 'Create comprehensive test spans',
          'POST /api/phoenix/test-error': 'Create test error span',
          'GET /api/phoenix/docs': 'Get this documentation'
        },
        configuration: {
          environmentVariables: {
            'PHOENIX_OBSERVABILITY_ENABLED': 'Enable/disable Phoenix observability (true/false)',
            'PHOENIX_COLLECTOR_ENDPOINT': 'Phoenix collector endpoint (default: http://localhost:4317)',
            'PHOENIX_API_KEY': 'Phoenix API key for authentication (optional)',
            'PHOENIX_PROJECT_NAME': 'Project name for Phoenix UI (default: documents-browser-app)'
          },
          phoenixUI: 'http://localhost:6007',
          otlpEndpoint: 'http://localhost:4317/v1/traces'
        },
        bestPractices: {
          agentOrchestration: [
            'Create workflow contexts for multi-agent operations',
            'Use step-level spans for individual agent actions',
            'Include comprehensive metadata for debugging',
            'End workflow contexts properly for cleanup'
          ],
          llmOperations: [
            'Follow Phoenix semantic conventions',
            'Include token counts and latency metrics',
            'Add model-specific metadata',
            'Track both local and cloud AI operations'
          ],
          errorHandling: [
            'Create error spans for all exceptions',
            'Include relevant context in error metadata',
            'Track error recovery and fallback strategies',
            'Monitor error rates and patterns'
          ]
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting Phoenix documentation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Phoenix documentation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  try {
    const isEnabled = phoenixInstrumentation.isEnabled();
    
    res.json({
      success: true,
      status: isEnabled ? 'healthy' : 'disabled',
      data: {
        observabilityEnabled: isEnabled,
        activeWorkflows: phoenixInstrumentation.getActiveWorkflows().length,
        activeSpans: phoenixInstrumentation.getActiveSpansCount(),
        phoenixUI: 'http://localhost:6007',
        collectorEndpoint: process.env.PHOENIX_COLLECTOR_ENDPOINT || 'http://localhost:4317'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking Phoenix health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check Phoenix health',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
