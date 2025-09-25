/**
 * Phoenix AI Observability - Agent Workflow Tracer
 * 
 * This implementation provides comprehensive tracing for multi-agent RAG systems
 * following Phoenix best practices for agent orchestration observability.
 * 
 * Based on Phoenix tutorials and CrewAI integration patterns.
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, SpanStatusCode, SpanKind, context } from '@opentelemetry/api';
import { 
  SEMRESATTRS_PROJECT_NAME
} from '@arizeai/openinference-semantic-conventions';

export interface AgentWorkflowData {
  workflowId: string;
  agentName: string;
  operation: string;
  input: any;
  output: any;
  latencyMs: number;
  metadata?: Record<string, any>;
}

export interface LLMOperationData {
  modelName: string;
  operation: string;
  prompt: string;
  response: string;
  tokenCounts: { prompt: number; completion: number };
  latencyMs: number;
  metadata?: Record<string, any>;
}

export interface RAGOperationData {
  operation: string;
  query: string;
  retrievedDocumentCount: number;
  strategyName: string;
  confidence: number;
  latencyMs: number;
  metadata?: Record<string, any>;
}

/**
 * Phoenix Tracer - Agent Workflow Compatible Implementation
 */
export class PhoenixTracer {
  private sdk: NodeSDK | null = null;
  private tracer = trace.getTracer('documents-browser-agents', '1.0.0');
  private isInitialized = false;
  private projectName: string;
  private collectorEndpoint: string;
  private activeSpans = new Map<string, any>();
  private workflowContexts = new Map<string, any>();

  constructor() {
    this.projectName = process.env.PHOENIX_PROJECT_NAME || 'documents-browser-app';
    this.collectorEndpoint = process.env.PHOENIX_COLLECTOR_ENDPOINT || 'http://localhost:4317';
  }

  /**
   * Initialize Phoenix tracer with proper OTLP configuration
   */
  initialize(): void {
    if (this.isInitialized) return;

    const isEnabled = process.env.PHOENIX_OBSERVABILITY_ENABLED === 'true';
    if (!isEnabled) {
      console.log('⚠️ Phoenix AI Observability disabled via environment variable.');
      return;
    }

    console.log('🚀 Initializing Phoenix AI Observability for Agent Workflows...');
    
    try {
      const traceExporter = new OTLPTraceExporter({
        url: 'http://localhost:4317',
        headers: process.env.PHOENIX_API_KEY 
          ? { Authorization: `Bearer ${process.env.PHOENIX_API_KEY}` }
          : {},
      });

      const resource = resourceFromAttributes({
        [SemanticResourceAttributes.SERVICE_NAME]: this.projectName,
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
        [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'ai-observability',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
        [SEMRESATTRS_PROJECT_NAME]: this.projectName,
      });

      this.sdk = new NodeSDK({
        resource,
        traceExporter,
      });

      this.sdk.start();
      this.isInitialized = true;
      
      console.log('✅ Phoenix tracer provider registered');
      console.log(`📡 Traces will be sent to Phoenix at http://localhost:4317 (gRPC OTLP)`);
      console.log('🎯 Agent workflow instrumentation ready');

      // Create startup span
      this.createSystemSpan('phoenix_initialization', 'Phoenix agent workflow tracer initialized', {
        'system.component': 'observability',
        'initialization.success': true,
        'agent.workflow.enabled': true
      });

    } catch (error) {
      console.error('❌ Failed to initialize Phoenix AI Observability:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Check if Phoenix observability is enabled and initialized
   */
  isEnabled(): boolean {
    return this.isInitialized && process.env.PHOENIX_OBSERVABILITY_ENABLED === 'true';
  }

  /**
   * Create a workflow context for agent orchestration
   * Following agent workflow patterns similar to CrewAI
   */
  createWorkflowContext(workflowId: string): any {
    if (!this.isEnabled()) return context.active();

    const workflowSpan = this.tracer.startSpan(`workflow.${workflowId}`, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'workflow.id': workflowId,
        'workflow.type': 'agent_orchestration',
        'workflow.framework': 'custom_multi_agent_rag',
        'service.name': this.projectName,
        'agent.orchestrator': 'AgentCoordinator',
      },
    });

    const workflowContext = trace.setSpan(context.active(), workflowSpan);
    this.workflowContexts.set(workflowId, workflowContext);
    this.activeSpans.set(`workflow_${workflowId}`, workflowSpan);
    
    console.log(`🔄 Created agent workflow context: ${workflowId}`);
    return workflowContext;
  }

  /**
   * End a workflow context
   */
  endWorkflowContext(workflowId: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled()) return;

    const span = this.activeSpans.get(`workflow_${workflowId}`);
    if (span) {
      if (metadata) {
        span.setAttributes(metadata);
      }
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      this.activeSpans.delete(`workflow_${workflowId}`);
      this.workflowContexts.delete(workflowId);
      console.log(`✅ Ended agent workflow context: ${workflowId}`);
    }
  }

  /**
   * Create agent workflow span (orchestrator level)
   * Similar to CrewAI agent orchestration patterns
   */
  createAgentWorkflowSpan(data: AgentWorkflowData, parentContext?: any): any {
    if (!this.isEnabled()) return null;

    const activeContext = parentContext || this.workflowContexts.get(data.workflowId) || context.active();
    
    const span = this.tracer.startSpan(`workflow.agent.${data.agentName}`, {
      kind: SpanKind.INTERNAL,
      attributes: {
        // Workflow-level attributes
        'workflow.id': data.workflowId,
        'workflow.type': 'multi_agent_orchestration',
        'workflow.orchestrator': data.agentName,
        
        // Agent attributes
        'agent.name': data.agentName,
        'agent.operation': data.operation,
        'agent.type': 'orchestrator',
        
        // Input/Output (truncated for performance)
        'workflow.input': JSON.stringify(data.input).substring(0, 1000),
        'workflow.output': JSON.stringify(data.output).substring(0, 1000),
        
        // Phoenix-specific attributes for input/output visibility
        'input': JSON.stringify(data.input).substring(0, 500),
        'output': JSON.stringify(data.output).substring(0, 500),
        
        // Performance
        'workflow.latency_ms': data.latencyMs,
        'service.name': this.projectName,
        
        // Custom metadata
        ...data.metadata,
      },
    }, activeContext);

    const spanContext = span.spanContext();
    const contextInfo = {
      spanId: spanContext.spanId,
      traceId: spanContext.traceId,
      workflowId: data.workflowId
    };

    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    
    console.log(`🎯 Agent workflow span created: ${data.agentName} - ${data.operation} (${data.latencyMs}ms)`);
    return contextInfo;
  }

  /**
   * Create agent step span (individual step within workflow)
   * For ContentAnalysisAgent and StrategySelectionAgent operations
   */
  createAgentStepSpan(data: AgentWorkflowData, parentContext?: any): any {
    if (!this.isEnabled()) return null;

    const activeContext = parentContext || this.workflowContexts.get(data.workflowId) || context.active();
    
    const span = this.tracer.startSpan(`agent.${data.agentName}.${data.operation}`, {
      kind: SpanKind.INTERNAL,
      attributes: {
        // OpenInference semantic conventions for Agent
        'agent.name': data.agentName,
        'agent.operation': data.operation,
        'agent.type': 'step_executor',
        
        // Workflow attributes
        'workflow.id': data.workflowId,
        'workflow.step.name': data.operation,
        'workflow.step.input': JSON.stringify(data.input).substring(0, 500),
        'workflow.step.output': JSON.stringify(data.output).substring(0, 500),
        
        // Phoenix-specific attributes for input/output visibility
        'input': JSON.stringify(data.input).substring(0, 500),
        'output': JSON.stringify(data.output).substring(0, 500),
        
        // Performance attributes
        'operation.latency_ms': data.latencyMs,
        'operation.type': 'agent_step',
        'service.name': this.projectName,
        
        // Custom metadata
        ...data.metadata,
      },
    }, activeContext);

    const spanContext = span.spanContext();
    const contextInfo = {
      spanId: spanContext.spanId,
      traceId: spanContext.traceId,
      workflowId: data.workflowId,
      parentSpanId: span.spanContext().spanId
    };

    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    
    console.log(`🔧 Agent step span created: ${data.agentName} - ${data.operation} (${data.latencyMs}ms)`);
    return contextInfo;
  }

  /**
   * Create LLM span following Phoenix semantic conventions
   */
  createLLMSpan(data: LLMOperationData, parentContext?: any): any {
    if (!this.isEnabled()) return null;

    const activeContext = parentContext || context.active();
    
    const span = this.tracer.startSpan(`llm.${data.operation}`, {
      kind: SpanKind.CLIENT,
      attributes: {
        // OpenInference semantic conventions for LLM
        'llm.request.model': data.modelName,
        'llm.request.type': 'chat_completion',
        'llm.provider': 'openai',
        'llm.request.messages': JSON.stringify([{
          role: 'user',
          content: data.prompt.substring(0, 1000) // Truncate for performance
        }]),
        'llm.response.messages': JSON.stringify([{
          role: 'assistant',
          content: data.response.substring(0, 1000)
        }]),
        'llm.usage.total_tokens': data.tokenCounts.prompt + data.tokenCounts.completion,
        'llm.usage.prompt_tokens': data.tokenCounts.prompt,
        'llm.usage.completion_tokens': data.tokenCounts.completion,
        
        // Phoenix-specific attributes for input/output visibility
        'input': JSON.stringify([{
          role: 'user',
          content: data.prompt.substring(0, 500)
        }]),
        'output': JSON.stringify([{
          role: 'assistant',
          content: data.response.substring(0, 500)
        }]),
        
        // Additional metadata
        'llm.operation': data.operation,
        'llm.latency_ms': data.latencyMs,
        'service.name': this.projectName,
        
        // Custom metadata
        ...data.metadata,
      },
    }, activeContext);

    const spanContext = span.spanContext();
    const contextInfo = {
      spanId: spanContext.spanId,
      traceId: spanContext.traceId,
      workflowId: data.metadata?.workflow_id
    };

    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    
    console.log(`📡 LLM span created: ${data.modelName} - ${data.operation} (${data.latencyMs}ms)`);
    return contextInfo;
  }

  /**
   * Create RAG operation span
   */
  createRAGSpan(data: RAGOperationData, parentContext?: any): any {
    if (!this.isEnabled()) return null;

    const activeContext = parentContext || context.active();
    
    const span = this.tracer.startSpan(`rag.${data.operation}`, {
      kind: SpanKind.INTERNAL,
      attributes: {
        // OpenInference semantic conventions for RAG
        'retrieval.query': data.query.substring(0, 500),
        'retrieval.document_count': data.retrievedDocumentCount,
        'rag.strategy_name': data.strategyName,
        'rag.confidence': data.confidence,
        
        // Phoenix-specific attributes for input/output visibility
        'input': JSON.stringify({
          query: data.query.substring(0, 500),
          strategy: data.strategyName
        }),
        'output': JSON.stringify({
          document_count: data.retrievedDocumentCount,
          confidence: data.confidence,
          strategy: data.strategyName
        }),
        
        // Performance
        'operation.latency_ms': data.latencyMs,
        'operation.type': 'rag_operation',
        'service.name': this.projectName,
        
        // Custom metadata
        ...data.metadata,
      },
    }, activeContext);

    const spanContext = span.spanContext();
    const contextInfo = {
      spanId: spanContext.spanId,
      traceId: spanContext.traceId,
      workflowId: data.metadata?.workflow_id
    };

    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    
    console.log(`🔍 RAG span created: ${data.operation} - ${data.strategyName} (${data.latencyMs}ms)`);
    return contextInfo;
  }

  /**
   * Create system/utility span
   */
  createSystemSpan(operation: string, description: string, metadata?: Record<string, any>): any {
    if (!this.isEnabled()) return null;

    const span = this.tracer.startSpan(`system.${operation}`, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'system.operation': operation,
        'system.description': description,
        'operation.type': 'system',
        'service.name': this.projectName,
        ...metadata,
      },
    });

    const spanContext = span.spanContext();
    const contextInfo = {
      spanId: spanContext.spanId,
      traceId: spanContext.traceId
    };

    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    
    console.log(`⚙️ System span created: ${operation}`);
    return contextInfo;
  }

  /**
   * Create error span for exception tracking
   */
  createErrorSpan(operation: string, error: Error, metadata?: Record<string, any>): any {
    if (!this.isEnabled()) return null;

    const span = this.tracer.startSpan(`error.${operation}`, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'error.type': error.name,
        'error.message': error.message,
        'error.stack': error.stack?.substring(0, 1000),
        'operation.type': 'error',
        'service.name': this.projectName,
        ...metadata,
      },
    });

    const spanContext = span.spanContext();
    const contextInfo = {
      spanId: spanContext.spanId,
      traceId: spanContext.traceId
    };

    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });
    span.end();
    
    console.log(`❌ Error span created: ${operation} - ${error.message}`);
    return contextInfo;
  }

  /**
   * Shutdown the tracer
   */
  async shutdown(): Promise<void> {
    if (this.sdk) {
      console.log('🛑 Shutting down Phoenix tracer...');
      
      // End any remaining active spans
      for (const [key, span] of this.activeSpans) {
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
        console.log(`🧹 Cleaned up active span: ${key}`);
      }
      
      this.activeSpans.clear();
      this.workflowContexts.clear();
      
      await this.sdk.shutdown();
      console.log('✅ Phoenix tracer shutdown complete');
    }
  }

  /**
   * Get active workflow contexts (for debugging)
   */
  getActiveWorkflows(): string[] {
    return Array.from(this.workflowContexts.keys());
  }

  /**
   * Get active spans count (for monitoring)
   */
  getActiveSpansCount(): number {
    return this.activeSpans.size;
  }
}

// Export singleton instance
export const phoenixTracer = new PhoenixTracer();
