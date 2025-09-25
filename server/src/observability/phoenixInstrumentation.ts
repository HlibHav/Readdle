/**
 * Phoenix Instrumentation Service - Agent Workflow Compatible
 * 
 * This service provides a simplified interface to the comprehensive Phoenix tracer
 * while maintaining backward compatibility with existing code.
 * 
 * Follows Phoenix agent workflow best practices for multi-agent RAG systems.
 */
import { 
  phoenixTracer, 
  AgentWorkflowData, 
  LLMOperationData, 
  RAGOperationData 
} from './phoenixTracer.js';

class PhoenixInstrumentation {
  constructor() {
    // Initialize the underlying tracer
    phoenixTracer.initialize();
  }

  /**
   * Check if Phoenix observability is enabled
   */
  isEnabled(): boolean {
    return phoenixTracer.isEnabled();
  }

  /**
   * Initialize Phoenix instrumentation
   */
  initialize(): void {
    phoenixTracer.initialize();
  }

  /**
   * Create agent workflow span (orchestrator level)
   * For AgentCoordinator operations
   */
  createAgentWorkflowSpan(
    agentName: string,
    operationName: string,
    workflowId: string,
    input: any,
    output: any,
    latencyMs: number,
    attributes: Record<string, any> = {}
  ): any {
    const data: AgentWorkflowData = {
      agentName,
      operation: operationName,
      workflowId,
      input,
      output,
      latencyMs,
      metadata: attributes
    };
    return phoenixTracer.createAgentWorkflowSpan(data);
  }

  /**
   * Create agent step span (individual step within workflow)
   * For ContentAnalysisAgent and StrategySelectionAgent operations
   */
  createAgentStepSpan(
    workflowId: string,
    stepName: string,
    agentName: string,
    input: any,
    output: any,
    latencyMs: number,
    attributes: Record<string, any> = {}
  ): any {
    const data: AgentWorkflowData = {
      agentName,
      operation: stepName,
      workflowId,
      input,
      output,
      latencyMs,
      metadata: attributes
    };
    return phoenixTracer.createAgentStepSpan(data);
  }

  /**
   * Create LLM span with Phoenix semantic conventions
   */
  createLLMSpan(
    modelName: string,
    operationName: string,
    prompt: string,
    response: string,
    tokenCounts: { prompt: number; completion: number },
    latencyMs: number,
    attributes: Record<string, any> = {}
  ): any {
    const data: LLMOperationData = {
      modelName,
      operation: operationName,
      prompt,
      response,
      tokenCounts,
      latencyMs,
      metadata: attributes
    };
    return phoenixTracer.createLLMSpan(data);
  }

  /**
   * Create RAG operation span
   */
  createRAGSpan(
    operationName: string,
    query: string,
    retrievedDocumentCount: number,
    strategyName: string,
    latencyMs: number,
    confidence: number,
    attributes: Record<string, any> = {}
  ): any {
    const data: RAGOperationData = {
      operation: operationName,
      query,
      retrievedDocumentCount,
      strategyName,
      confidence,
      latencyMs,
      metadata: attributes
    };
    return phoenixTracer.createRAGSpan(data);
  }

  /**
   * Create workflow context for agent orchestration
   */
  createWorkflowContext(workflowId: string): any {
    return phoenixTracer.createWorkflowContext(workflowId);
  }

  /**
   * End workflow context
   */
  endWorkflowContext(workflowId: string, metadata?: Record<string, any>): void {
    phoenixTracer.endWorkflowContext(workflowId, metadata);
  }

  /**
   * Create system span for utility operations
   */
  createSystemSpan(operation: string, description: string, metadata?: Record<string, any>): any {
    return phoenixTracer.createSystemSpan(operation, description, metadata);
  }

  /**
   * Create error span for exception tracking
   */
  createErrorSpan(operation: string, error: Error, metadata?: Record<string, any>): any {
    return phoenixTracer.createErrorSpan(operation, error, metadata);
  }

  /**
   * Get active workflows (for debugging)
   */
  getActiveWorkflows(): string[] {
    return phoenixTracer.getActiveWorkflows();
  }

  /**
   * Get active spans count (for monitoring)
   */
  getActiveSpansCount(): number {
    return phoenixTracer.getActiveSpansCount();
  }

  /**
   * Shutdown the instrumentation
   */
  async shutdown(): Promise<void> {
    return phoenixTracer.shutdown();
  }
}

// Export singleton instance
export const phoenixInstrumentation = new PhoenixInstrumentation();
