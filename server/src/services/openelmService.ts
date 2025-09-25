import { HfInference } from '@huggingface/inference';
import { phoenixInstrumentation } from '../observability/phoenixInstrumentation.js';

export interface OpenELMModel {
  id: string;
  name: string;
  size: string;
  description: string;
  maxTokens: number;
  isInstruct: boolean;
  huggingfaceModel: string;
  performanceProfile: 'fast' | 'balanced' | 'comprehensive';
  deviceOptimized: boolean;
}

export interface OpenELMResponse {
  text: string;
  usage?: {
    promptTokens: number;
    generatedTokens: number;
    totalTokens: number;
  };
}

export class OpenELMService {
  private hf: HfInference | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  // Available OpenELM models from Apple
  public readonly models: OpenELMModel[] = [
    {
      id: 'openelm-270m',
      name: 'OpenELM 270M',
      size: '270M',
      description: 'Lightweight model for fast inference on resource-constrained devices',
      maxTokens: 200,
      isInstruct: false,
      huggingfaceModel: 'apple/OpenELM-270M',
      performanceProfile: 'fast',
      deviceOptimized: true
    },
    {
      id: 'openelm-270m-instruct',
      name: 'OpenELM 270M Instruct',
      size: '270M',
      description: 'Instruction-tuned lightweight model for better task following',
      maxTokens: 200,
      isInstruct: true,
      huggingfaceModel: 'apple/OpenELM-270M-Instruct',
      performanceProfile: 'fast',
      deviceOptimized: true
    },
    {
      id: 'openelm-450m',
      name: 'OpenELM 450M',
      size: '450M',
      description: 'Balanced model with improved performance over 270M',
      maxTokens: 400,
      isInstruct: false,
      huggingfaceModel: 'apple/OpenELM-450M',
      performanceProfile: 'balanced',
      deviceOptimized: true
    },
    {
      id: 'openelm-450m-instruct',
      name: 'OpenELM 450M Instruct',
      size: '450M',
      description: 'Instruction-tuned model with balanced performance',
      maxTokens: 400,
      isInstruct: true,
      huggingfaceModel: 'apple/OpenELM-450M-Instruct',
      performanceProfile: 'balanced',
      deviceOptimized: true
    },
    {
      id: 'openelm-1b',
      name: 'OpenELM 1.1B',
      size: '1.1B',
      description: 'Larger model with enhanced capabilities for complex tasks',
      maxTokens: 600,
      isInstruct: false,
      huggingfaceModel: 'apple/OpenELM-1_1B',
      performanceProfile: 'balanced',
      deviceOptimized: false
    },
    {
      id: 'openelm-1b-instruct',
      name: 'OpenELM 1.1B Instruct',
      size: '1.1B',
      description: 'Instruction-tuned model with enhanced capabilities',
      maxTokens: 600,
      isInstruct: true,
      huggingfaceModel: 'apple/OpenELM-1_1B-Instruct',
      performanceProfile: 'balanced',
      deviceOptimized: false
    },
    {
      id: 'openelm-3b',
      name: 'OpenELM 3B',
      size: '3B',
      description: 'Largest model with comprehensive understanding capabilities',
      maxTokens: 800,
      isInstruct: false,
      huggingfaceModel: 'apple/OpenELM-3B',
      performanceProfile: 'comprehensive',
      deviceOptimized: false
    },
    {
      id: 'openelm-3b-instruct',
      name: 'OpenELM 3B Instruct',
      size: '3B',
      description: 'Instruction-tuned largest model for complex tasks',
      maxTokens: 800,
      isInstruct: true,
      huggingfaceModel: 'apple/OpenELM-3B-Instruct',
      performanceProfile: 'comprehensive',
      deviceOptimized: false
    }
  ];

  constructor() {
    // Don't initialize immediately - wait for environment variables to be loaded
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing OpenELM service...');
      
      const apiKey = process.env.HUGGINGFACE_API_KEY;
      if (!apiKey || apiKey === 'your_huggingface_api_key_here') {
        console.warn('⚠️  Hugging Face API key not configured. OpenELM models will not be available.');
        this.isInitialized = true; // Mark as initialized but without API key
        return;
      }

      this.hf = new HfInference(apiKey);
      this.isInitialized = true;
      console.log('✅ OpenELM service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OpenELM service:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  async generateText(
    modelId: string,
    prompt: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      repetitionPenalty?: number;
    }
  ): Promise<OpenELMResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.hf) {
      throw new Error('Hugging Face API not initialized. Please check your API key configuration.');
    }

    const model = this.models.find(m => m.id === modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found. Available models: ${this.models.map(m => m.id).join(', ')}`);
    }

    const startTime = Date.now();

    try {
      console.log(`🤖 Generating text with ${model.name}...`);
      
      const response = await this.hf.textGeneration({
        model: model.huggingfaceModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: options?.maxTokens || model.maxTokens,
          temperature: options?.temperature || 0.7,
          top_p: options?.topP || 0.9,
          repetition_penalty: options?.repetitionPenalty || 1.2,
          return_full_text: false,
          do_sample: true
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      const generatedText = (response as any)[0]?.generated_text || '';
      
      return {
        text: generatedText,
        usage: {
          promptTokens: prompt.length / 4, // Rough estimation
          generatedTokens: generatedText.length / 4,
          totalTokens: (prompt.length + generatedText.length) / 4
        }
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error(`❌ Error generating text with ${model.name}:`, error);
      throw error;
    }
  }

  getAvailableModels(): OpenELMModel[] {
    return this.models;
  }

  getModelById(modelId: string): OpenELMModel | undefined {
    return this.models.find(m => m.id === modelId);
  }

  getModelsByPerformanceProfile(profile: 'fast' | 'balanced' | 'comprehensive'): OpenELMModel[] {
    return this.models.filter(m => m.performanceProfile === profile);
  }

  getDeviceOptimizedModels(): OpenELMModel[] {
    return this.models.filter(m => m.deviceOptimized);
  }

  getInstructModels(): OpenELMModel[] {
    return this.models.filter(m => m.isInstruct);
  }

  isReady(): boolean {
    return this.isInitialized && this.hf !== null;
  }

  getServiceStatus(): {
    initialized: boolean;
    hasApiKey: boolean;
    availableModels: number;
    ready: boolean;
  } {
    return {
      initialized: this.isInitialized,
      hasApiKey: !!process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'your_huggingface_api_key_here',
      availableModels: this.models.length,
      ready: this.isReady()
    };
  }
}

// Export singleton instance
export const openelmService = new OpenELMService();
