import { ChatOpenAI } from '@langchain/openai';
import { ragService, RAGResult } from './ragService.js';
import { DeviceService, DeviceInfo } from './deviceService.js';
import { huggingFaceTranslationService } from './huggingFaceTranslationService.js';
import { openelmService, OpenELMModel } from './openelmService.js';
import { phoenixInstrumentation } from '../observability/phoenixInstrumentation.js';

export class LangChainService {
  private llm: ChatOpenAI | null = null;
  private isInitialized = false;

  constructor() {
    // Don't initialize immediately - wait for environment variables to be loaded
  }

  private initialize() {
    if (this.isInitialized) return; // Already initialized
    
    console.log('🔧 Initializing LLM...');
    console.log('🔧 API Key available:', !!process.env.OPENAI_API_KEY);
    console.log('🔧 API Key length:', process.env.OPENAI_API_KEY?.length || 0);
    
    if (process.env.OPENAI_API_KEY && 
        process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
        process.env.OPENAI_API_KEY.length > 20) {
      try {
        this.llm = new ChatOpenAI({
          modelName: 'gpt-4o-mini',
          temperature: 0.3,
          maxTokens: 1000,
          openAIApiKey: process.env.OPENAI_API_KEY,
        });
        this.isInitialized = true;
        console.log('✅ LangChain LLM initialized successfully');
      } catch (error) {
        console.error('❌ LLM initialization failed:', error);
        this.isInitialized = false;
      }
    } else {
      console.log('⚠️ LangChain LLM not initialized - API key not available or invalid');
    }
  }

  get isLLMInitialized(): boolean {
    return this.isInitialized;
  }

  async initializeOpenELM(): Promise<void> {
    try {
      await openelmService.initialize();
      console.log('✅ OpenELM service initialized');
    } catch (error) {
      console.error('❌ OpenELM initialization failed:', error);
    }
  }

  getOpenELMStatus(): {
    initialized: boolean;
    hasApiKey: boolean;
    availableModels: number;
    ready: boolean;
  } {
    return openelmService.getServiceStatus();
  }

  getAvailableOpenELMModels(): OpenELMModel[] {
    return openelmService.getAvailableModels();
  }

  async generateWithOpenELM(
    modelId: string,
    prompt: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      repetitionPenalty?: number;
    }
  ): Promise<{
    text: string;
    success: boolean;
    error?: string;
    usage?: {
      promptTokens: number;
      generatedTokens: number;
      totalTokens: number;
    };
  }> {
    try {
      await this.initializeOpenELM();
      
      const response = await openelmService.generateText(modelId, prompt, options);
      
      return {
        text: response.text,
        success: true,
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenELM generation error:', error);
      return {
        text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async summarizeContent(text: string, cloudAI: boolean = true): Promise<{
    summary: string;
    success: boolean;
    error?: string;
  }> {
    try {
      // Initialize LLM if not already done
      this.initialize();
      
      // Use LLM only when Cloud AI is enabled and initialized
      if (cloudAI && this.isInitialized) {

      const prompt = `
You are an expert content analyst creating comprehensive executive summaries. Analyze the provided text and create a detailed, structured summary that would be valuable for decision-makers and stakeholders.

Create an executive summary that includes:

1. **Overview**: Main topic, purpose, and context
2. **Key Points**: 3-5 most important insights or findings
3. **Implications**: What this means or why it matters
4. **Action Items**: Any recommendations or next steps mentioned
5. **Conclusion**: Overall assessment or main takeaway

Format the summary with clear sections and bullet points where appropriate. Be comprehensive but concise. Use only information from the provided text.

Text: ${text.substring(0, 6000)}
`;

      const llmStartTime = Date.now();
      const result = await this.llm!.invoke(prompt);
      const llmLatency = Date.now() - llmStartTime;
      const summary = typeof result.content === 'string' ? result.content : '';

      // Create Phoenix LLM span for summarization
      phoenixInstrumentation.createLLMSpan(
        'gpt-4o-mini',
        'summarize_content',
        prompt,
        summary,
        { prompt: prompt.length, completion: summary.length },
        llmLatency,
        {
          operation_type: 'summarization',
          content_length: text.length,
          cloud_ai_enabled: cloudAI
        }
      );
      
      return {
        summary: summary.trim(),
        success: true,
      };
      } else if (cloudAI && !this.isInitialized) {
        // Cloud AI is enabled but not available - show error message
        return {
          summary: this.generateCloudAIUnavailableResponse('content summarization'),
          success: false,
          error: 'Cloud AI is enabled but not available. Please check your API key configuration.'
        };
      } else {
        // Use local on-device summarization when Cloud AI is disabled
        return {
          summary: this.localComprehensiveSummarize(text),
          success: true,
        };
      }
    } catch (error) {
      console.error('Summarization error:', error);
      return {
        summary: this.localComprehensiveSummarize(text),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async answerQuestion(
    text: string, 
    question: string, 
    cloudAI: boolean = true,
    deviceInfo?: DeviceInfo,
    includeFollowUps: boolean = true
  ): Promise<{
    answer: string;
    success: boolean;
    error?: string;
    ragResult?: RAGResult;
    followUpQuestions?: string[];
  }> {
    try {
      // Initialize LLM if not already done
      this.initialize();
      
      // Use RAG if device info is provided and cloud AI is enabled
      if (cloudAI && this.isInitialized && deviceInfo) {
        const ragResult = await ragService.processWithRAG(text, question, deviceInfo);
        
        return {
          answer: ragResult.answer,
          success: true,
          ragResult,
          followUpQuestions: includeFollowUps ? this.generateFollowUpQuestions(question, text) : undefined
        };
      }
      
      // Fallback to simple Q&A
      if (!cloudAI || !this.isInitialized) {
        if (cloudAI && !this.isInitialized) {
          // Cloud AI is enabled but not available - show error message
          return {
            answer: this.generateCloudAIUnavailableResponse(question),
            success: false,
            error: 'Cloud AI is enabled but not available. Please check your API key configuration.'
          };
        }
        return {
          answer: this.localQA(text, question),
          success: true,
          followUpQuestions: includeFollowUps ? this.generateFollowUpQuestions(question, text) : undefined
        };
      }

      const prompt = `
You are an expert research assistant specializing in comprehensive document analysis and contextual information discovery. Your role is to provide thorough, well-structured responses that help users understand not just what they asked, but the broader context and implications.

## Response Structure
Provide responses in the following format:

### Direct Answer
[Answer the specific question clearly and concisely]

### Context & Background
[Provide relevant context that helps understand the answer better]

### Key Insights
[Highlight 2-3 most important insights related to the question]

### Implications & Significance
[Explain what this information means and why it matters]

### Related Discoveries
[Share additional valuable information from the text that's relevant or interesting]

### Connections
[Explain how different pieces of information relate to each other, if applicable]

## Guidelines:
- Be comprehensive but concise (aim for 300-500 words total)
- Use clear, professional language
- Include specific details, numbers, or examples when available
- Maintain objectivity and accuracy
- If information is not available in the text, clearly state this
- Focus on actionable insights and practical implications

## Question Analysis:
- Question type: ${this.analyzeQuestionType(question)}
- Question complexity: ${this.analyzeQuestionComplexity(question)}
- Expected response depth: ${this.getExpectedDepth(question)}

Page text: ${text.substring(0, 6000)}
Question: ${question}
`;

      const llmStartTime = Date.now();
      const result = await this.llm!.invoke(prompt);
      const llmLatency = Date.now() - llmStartTime;
      const answer = typeof result.content === 'string' ? result.content : '';

      // Create Phoenix LLM span for Q&A
      phoenixInstrumentation.createLLMSpan(
        'gpt-4o-mini',
        'answer_question',
        prompt,
        answer,
        { prompt: prompt.length, completion: answer.length },
        llmLatency,
        {
          operation_type: 'question_answering',
          question_type: this.analyzeQuestionType(question),
          question_complexity: this.analyzeQuestionComplexity(question),
          content_length: text.length,
          cloud_ai_enabled: cloudAI,
          device_info: deviceInfo ? JSON.stringify(deviceInfo) : undefined
        }
      );
      
      return {
        answer: answer.trim(),
        success: true,
        followUpQuestions: includeFollowUps ? this.generateFollowUpQuestions(question, text) : undefined
      };
    } catch (error) {
      console.error('LangChain Q&A error:', error);
      return {
        answer: this.localQA(text, question),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        followUpQuestions: includeFollowUps ? this.generateFollowUpQuestions(question, text) : undefined
      };
    }
  }

  async suggestFileName(file: any, content?: string): Promise<{
    suggestedName: string;
    confidence: number;
    reasoning: string;
  }> {
    try {
      // Initialize LLM if not already done
      this.initialize();
      
      // Always try LLM first if initialized, regardless of content
      console.log('🔍 LLM initialization status:', this.isInitialized);
      console.log('🔍 Content available:', !!content);
      console.log('🔍 Content length:', content?.length || 0);
      
      if (!this.isInitialized) {
        console.log('⚠️ LLM not initialized, using local fallback');
        return this.localFileNameSuggestion(file, content);
      }

      const prompt = `
You are an expert file naming assistant specializing in creating meaningful, descriptive filenames for PDF documents. Analyze the content and create a professional filename that clearly describes the document.

Document Information:
- Type: ${file.type || 'PDF'}
- Original name: ${file.name || 'untitled'}
- Size: ${file.size || 0} bytes
- Content preview: ${content ? content.substring(0, 1500) : 'No content available'}

Filename Guidelines:
1. Create a descriptive, professional filename that reflects the main topic
2. Use title case (capitalize important words)
3. Include relevant date in YYYY-MM-DD format if the content is time-sensitive
4. Add appropriate prefix based on content type:
   - "Article_" for news articles, blog posts
   - "Report_" for research, analysis, or data reports
   - "Guide_" for tutorials, how-to content
   - "Invoice_" for billing documents
   - "Contract_" for legal agreements
   - "Manual_" for technical documentation
5. Keep filename under 80 characters total
6. Use underscores instead of spaces
7. Always end with .pdf extension
8. Remove generic terms like "document", "file", "page"

Examples of good filenames:
- "Article_Best_Web_Browsers_2025_2024-09-24.pdf"
- "Report_Quarterly_Financial_Analysis_2024-Q3.pdf"
- "Guide_Getting_Started_with_React_Development.pdf"

Respond with JSON: {"suggestedName": "filename.pdf", "confidence": 0.9, "reasoning": "detailed explanation of why this name was chosen"}
`;

      const llmStartTime = Date.now();
      const result = await this.llm!.invoke(prompt);
      const llmLatency = Date.now() - llmStartTime;
      const response = typeof result.content === 'string' ? result.content : '';

      // Create Phoenix LLM span for filename suggestion
      phoenixInstrumentation.createLLMSpan(
        'gpt-4o-mini',
        'suggest_filename',
        prompt,
        response,
        { prompt: prompt.length, completion: response.length },
        llmLatency,
        {
          operation_type: 'filename_suggestion',
          file_type: file.type,
          file_size: file.size,
          content_available: !!content,
          content_length: content?.length || 0
        }
      );
      
      console.log('🤖 LLM Filename Response:', response);

      try {
        // Clean the response by removing markdown code blocks
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const parsed = JSON.parse(cleanResponse);
        console.log('✅ Parsed LLM response:', parsed);
        return {
          suggestedName: parsed.suggestedName || file.name,
          confidence: parsed.confidence || 0.5,
          reasoning: parsed.reasoning || 'AI-generated suggestion',
        };
      } catch (parseError) {
        console.log('❌ JSON parsing failed, using fallback:', parseError);
        console.log('❌ Raw response:', response);
        // Fallback if JSON parsing fails
        return this.localFileNameSuggestion(file, content);
      }
    } catch (error) {
      console.error('LangChain filename suggestion error:', error);
      return this.localFileNameSuggestion(file, content);
    }
  }

  private localSummarize(text: string): string {
    if (!text || text.length < 100) {
      return 'Insufficient content to generate a meaningful summary.';
    }

    const cleaned = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();

    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length === 0) {
      return 'No meaningful content found to summarize.';
    }

    const summarySentences = sentences.slice(0, Math.min(5, sentences.length));
    const lastSentence = summarySentences[summarySentences.length - 1];
    
    if (lastSentence && !/[.!?]$/.test(lastSentence.trim())) {
      summarySentences[summarySentences.length - 1] = lastSentence.trim() + '.';
    }

    return `## Local Summary\n\n*Generated using on-device processing*\n\n${summarySentences.join(' ').trim()}`;
  }

  private localComprehensiveSummarize(text: string): string {
    if (!text || text.length < 100) {
      return 'Insufficient content to generate a meaningful summary.';
    }

    const cleaned = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();

    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length === 0) {
      return 'No meaningful content found to summarize.';
    }

    // Extract key information for executive summary
    const title = this.extractTitle(text);
    const keyPoints = this.extractKeyPoints(sentences);
    const implications = this.extractImplications(sentences);
    const actionItems = this.extractActionItems(sentences);

    let summary = `## Local Executive Summary\n\n*Generated using on-device processing*\n\n# Executive Summary\n\n`;
    
    if (title) {
      summary += `## Overview\n${title}\n\n`;
    }
    
    if (keyPoints.length > 0) {
      summary += `## Key Points\n`;
      keyPoints.forEach((point, index) => {
        summary += `${index + 1}. ${point}\n`;
      });
      summary += `\n`;
    }
    
    if (implications.length > 0) {
      summary += `## Implications\n`;
      implications.forEach((implication, index) => {
        summary += `• ${implication}\n`;
      });
      summary += `\n`;
    }
    
    if (actionItems.length > 0) {
      summary += `## Action Items\n`;
      actionItems.forEach((item, index) => {
        summary += `• ${item}\n`;
      });
      summary += `\n`;
    }
    
    summary += `## Conclusion\n${this.generateConclusion(sentences)}\n`;

    return summary.trim();
  }

  private extractTitle(text: string): string {
    // Look for common title patterns
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const firstLine = lines[0]?.trim();
    
    if (firstLine && firstLine.length < 100 && !firstLine.includes('.')) {
      return firstLine;
    }
    
    return '';
  }

  private extractKeyPoints(sentences: string[]): string[] {
    const keyWords = ['important', 'key', 'main', 'primary', 'essential', 'critical', 'significant', 'major'];
    const keyPoints: string[] = [];
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      if (keyWords.some(word => lowerSentence.includes(word)) && sentence.length > 30) {
        keyPoints.push(sentence.trim());
      }
    });
    
    return keyPoints.slice(0, 5);
  }

  private extractImplications(sentences: string[]): string[] {
    const implicationWords = ['means', 'implies', 'suggests', 'indicates', 'shows', 'demonstrates', 'reveals'];
    const implications: string[] = [];
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      if (implicationWords.some(word => lowerSentence.includes(word)) && sentence.length > 30) {
        implications.push(sentence.trim());
      }
    });
    
    return implications.slice(0, 3);
  }

  private extractActionItems(sentences: string[]): string[] {
    const actionWords = ['should', 'must', 'need to', 'recommend', 'suggest', 'action', 'next step', 'follow'];
    const actionItems: string[] = [];
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      if (actionWords.some(word => lowerSentence.includes(word)) && sentence.length > 30) {
        actionItems.push(sentence.trim());
      }
    });
    
    return actionItems.slice(0, 3);
  }

  private generateConclusion(sentences: string[]): string {
    // Use the last few sentences as conclusion
    const conclusionSentences = sentences.slice(-2);
    return conclusionSentences.join(' ').trim() + '.';
  }

  private findDirectAnswer(text: string, question: string): string {
    const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      const matchCount = questionWords.filter(word => sentenceLower.includes(word)).length;
      
      if (matchCount >= Math.ceil(questionWords.length / 2)) {
        return sentence.trim() + (sentence.endsWith('.') ? '' : '.');
      }
    }
    
    return '';
  }

  private generateContextualInsights(text: string, question: string): string[] {
    const insights: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for related concepts and context
    const contextWords = ['context', 'background', 'overview', 'introduction', 'explanation', 'details', 'information'];
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      if (contextWords.some(word => sentenceLower.includes(word)) && sentence.length > 30) {
        insights.push(sentence.trim());
      }
    });
    
    return insights.slice(0, 3);
  }

  private generateRelatedDiscoveries(text: string, question: string): string[] {
    const discoveries: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for interesting facts, statistics, or additional information
    const discoveryWords = ['interesting', 'notable', 'important', 'significant', 'key', 'fact', 'statistic', 'data', 'research', 'study'];
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      if (discoveryWords.some(word => sentenceLower.includes(word)) && sentence.length > 30) {
        discoveries.push(sentence.trim());
      }
    });
    
    return discoveries.slice(0, 3);
  }

  private generateImplications(text: string, question: string): string[] {
    const implications: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for implications, consequences, or meanings
    const implicationWords = ['means', 'implies', 'suggests', 'indicates', 'shows', 'demonstrates', 'reveals', 'consequence', 'impact', 'effect'];
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      if (implicationWords.some(word => sentenceLower.includes(word)) && sentence.length > 30) {
        implications.push(sentence.trim());
      }
    });
    
    return implications.slice(0, 2);
  }

  async translateContent(text: string, targetLanguage: string, cloudAI: boolean = true): Promise<{
    translation: string;
    success: boolean;
    error?: string;
  }> {
    try {
      // Initialize LLM if not already done
      this.initialize();
      
      // Use LLM only when Cloud AI is enabled and initialized
      if (cloudAI && this.isInitialized) {

        const languageNames: { [key: string]: string } = {
          'es': 'Spanish',
          'fr': 'French',
          'de': 'German',
          'it': 'Italian',
          'pt': 'Portuguese',
          'ru': 'Russian',
          'ja': 'Japanese',
          'ko': 'Korean',
          'zh': 'Chinese',
          'ar': 'Arabic',
          'hi': 'Hindi',
          'nl': 'Dutch',
          'sv': 'Swedish',
          'no': 'Norwegian',
          'da': 'Danish',
          'fi': 'Finnish',
          'pl': 'Polish',
          'tr': 'Turkish',
          'uk': 'Ukrainian',
          'cs': 'Czech',
        };

        const languageName = languageNames[targetLanguage] || targetLanguage;

        const prompt = `
You are a professional translator. Translate the following text to ${languageName}. 
Maintain the original formatting, structure, and tone. If the text contains technical terms, 
provide accurate translations that preserve the meaning.

Text to translate: ${text.substring(0, 4000)}
`;

        const result = await this.llm!.invoke(prompt);
        const translation = typeof result.content === 'string' ? result.content : '';
        
        return {
          translation: translation.trim(),
          success: true,
        };
      } else {
        // Use local on-device translation when Cloud AI is disabled
        const translation = await this.localTranslate(text, targetLanguage);
        return {
          translation,
          success: true,
        };
      }
    } catch (error) {
      console.error('Translation error:', error);
      const fallbackTranslation = await this.localTranslate(text, targetLanguage);
      return {
        translation: fallbackTranslation,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async analyzeForInsights(text: string, cloudAI: boolean = true): Promise<{
    insights: string;
    success: boolean;
    error?: string;
  }> {
    try {
      // Initialize LLM if not already done
      this.initialize();
      
      // Use LLM only when Cloud AI is enabled and initialized
      if (cloudAI && this.isInitialized) {

        const prompt = `
You are an expert analyst. Analyze the following text and provide key insights, patterns, and observations.

Create a comprehensive analysis that includes:

1. **Key Insights**: 3-5 most important insights from the content
2. **Patterns & Trends**: Notable patterns or trends identified
3. **Implications**: What these insights mean or suggest
4. **Recommendations**: Actionable recommendations based on the analysis
5. **Questions for Further Exploration**: Important questions that arise from the analysis

Format your response with clear sections and bullet points. Be analytical and insightful.

Text to analyze: ${text.substring(0, 6000)}
`;

        const result = await this.llm!.invoke(prompt);
        const insights = typeof result.content === 'string' ? result.content : '';
        
        return {
          insights: insights.trim(),
          success: true,
        };
      } else if (cloudAI && !this.isInitialized) {
        // Cloud AI is enabled but not available - show error message
        return {
          insights: this.generateCloudAIUnavailableResponse('content analysis and insights'),
          success: false,
          error: 'Cloud AI is enabled but not available. Please check your API key configuration.'
        };
      } else {
        // Use local on-device analysis when Cloud AI is disabled
        return {
          insights: this.localAnalyzeInsights(text),
          success: true,
        };
      }
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        insights: this.localAnalyzeInsights(text),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createTodos(text: string, cloudAI: boolean = true): Promise<{
    todos: string;
    success: boolean;
    error?: string;
  }> {
    try {
      // Initialize LLM if not already done
      this.initialize();
      
      // Use LLM only when Cloud AI is enabled and initialized
      if (cloudAI && this.isInitialized) {

        const prompt = `
You are a productivity expert. Analyze the following text and create a comprehensive, actionable todo list.

Create todos that are:
- Specific and actionable
- Organized by priority or category
- Realistic and achievable
- Include deadlines where appropriate

Format your response as a structured todo list with categories and priorities.

Text to analyze: ${text.substring(0, 6000)}
`;

        const result = await this.llm!.invoke(prompt);
        const todos = typeof result.content === 'string' ? result.content : '';
        
        return {
          todos: todos.trim(),
          success: true,
        };
      } else if (cloudAI && !this.isInitialized) {
        // Cloud AI is enabled but not available - show error message
        return {
          todos: this.generateCloudAIUnavailableResponse('todo list generation'),
          success: false,
          error: 'Cloud AI is enabled but not available. Please check your API key configuration.'
        };
      } else {
        // Use local on-device todo creation when Cloud AI is disabled
        return {
          todos: this.localCreateTodos(text),
          success: true,
        };
      }
    } catch (error) {
      console.error('Todo creation error:', error);
      return {
        todos: this.localCreateTodos(text),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async localTranslate(text: string, targetLanguage: string): Promise<string> {
    const languageNames: { [key: string]: string } = {
      'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian', 'pt': 'Portuguese',
      'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese', 'ar': 'Arabic',
      'hi': 'Hindi', 'nl': 'Dutch', 'sv': 'Swedish', 'no': 'Norwegian', 'da': 'Danish',
      'fi': 'Finnish', 'pl': 'Polish', 'tr': 'Turkish', 'uk': 'Ukrainian', 'cs': 'Czech',
    };

    const languageName = languageNames[targetLanguage] || targetLanguage;
    
    try {
      // Try to use Hugging Face translation service
      const translation = await huggingFaceTranslationService.translate(text, targetLanguage);
      return `## Local Translation to ${languageName}\n\n*Translated using on-device AI model*\n\n${translation}`;
    } catch (error) {
      console.error('Hugging Face translation failed, falling back to basic translation:', error);
      
      // Fallback to basic translation patterns
      const translations: { [key: string]: { [key: string]: string } } = {
        'fr': {
          'hello': 'bonjour', 'goodbye': 'au revoir', 'thank you': 'merci', 'yes': 'oui', 'no': 'non',
          'please': 's\'il vous plaît', 'sorry': 'désolé', 'help': 'aide', 'information': 'information',
          'document': 'document', 'page': 'page', 'content': 'contenu', 'summary': 'résumé'
        },
        'es': {
          'hello': 'hola', 'goodbye': 'adiós', 'thank you': 'gracias', 'yes': 'sí', 'no': 'no',
          'please': 'por favor', 'sorry': 'lo siento', 'help': 'ayuda', 'information': 'información',
          'document': 'documento', 'page': 'página', 'content': 'contenido', 'summary': 'resumen'
        },
        'de': {
          'hello': 'hallo', 'goodbye': 'auf wiedersehen', 'thank you': 'danke', 'yes': 'ja', 'no': 'nein',
          'please': 'bitte', 'sorry': 'entschuldigung', 'help': 'hilfe', 'information': 'information',
          'document': 'dokument', 'page': 'seite', 'content': 'inhalt', 'summary': 'zusammenfassung'
        }
      };

      let translatedText = text;
      
      // Apply basic translations if available for the target language
      if (translations[targetLanguage]) {
        const langTranslations = translations[targetLanguage];
        Object.entries(langTranslations).forEach(([english, translated]) => {
          const regex = new RegExp(`\\b${english}\\b`, 'gi');
          translatedText = translatedText.replace(regex, translated);
        });
      }

      return `## Local Translation to ${languageName}\n\n*Note: This is a basic local translation. For more accurate results, enable Cloud AI.*\n\n${translatedText}`;
    }
  }

  private localAnalyzeInsights(text: string): string {
    if (!text || text.length < 100) {
      return 'Insufficient content to generate meaningful insights.';
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length === 0) {
      return 'No meaningful content found to analyze.';
    }

    // Extract key insights using keyword analysis
    const insights: string[] = [];
    const keyWords = ['important', 'key', 'critical', 'significant', 'notable', 'interesting', 'reveals', 'shows', 'indicates'];
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      if (keyWords.some(word => sentenceLower.includes(word)) && sentence.length > 30) {
        insights.push(sentence.trim());
      }
    });

    let analysis = `## Local Analysis\n\n*Analyzed using on-device processing*\n\n# Key Insights\n\n`;
    
    if (insights.length > 0) {
      insights.slice(0, 5).forEach((insight, index) => {
        analysis += `${index + 1}. ${insight}\n`;
      });
    } else {
      analysis += `• Content analysis requires AI processing for detailed insights\n`;
      analysis += `• Key themes: ${sentences.slice(0, 3).join(' ').substring(0, 200)}...\n`;
    }
    
    analysis += `\n## Recommendations\n`;
    analysis += `• Enable Cloud AI for comprehensive analysis\n`;
    analysis += `• Review content for specific patterns or themes\n`;
    analysis += `• Consider additional context or related materials\n`;

    return analysis.trim();
  }

  private localCreateTodos(text: string): string {
    if (!text || text.length < 100) {
      return 'Insufficient content to create meaningful todos.';
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length === 0) {
      return 'No meaningful content found to create todos from.';
    }

    // Look for action-oriented content
    const actionWords = ['should', 'must', 'need to', 'recommend', 'suggest', 'action', 'next step', 'follow', 'implement', 'create', 'develop'];
    const todos: string[] = [];
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      if (actionWords.some(word => sentenceLower.includes(word)) && sentence.length > 30) {
        todos.push(sentence.trim());
      }
    });

    let todoList = `## Local Todo List\n\n*Generated using on-device processing*\n\n# Action Items\n\n`;
    
    if (todos.length > 0) {
      todos.slice(0, 5).forEach((todo, index) => {
        todoList += `- [ ] ${todo}\n`;
      });
    } else {
      todoList += `- [ ] Review content for actionable items\n`;
      todoList += `- [ ] Enable Cloud AI for detailed todo generation\n`;
      todoList += `- [ ] Extract key points for follow-up\n`;
    }
    
    todoList += `\n## Additional Tasks\n`;
    todoList += `- [ ] Enable Cloud AI for comprehensive todo creation\n`;
    todoList += `- [ ] Review and prioritize identified actions\n`;

    return todoList.trim();
  }

  private localQA(text: string, question: string): string {
    if (!text || !question) {
      return '### Direct Answer\nInformation not found in the provided content.';
    }

    const questionLower = question.toLowerCase();
    
    // Generate comprehensive response with passive information acquisition
    const directAnswer = this.findDirectAnswer(text, question);
    const contextualInsights = this.generateContextualInsights(text, question);
    const relatedDiscoveries = this.generateRelatedDiscoveries(text, question);
    const implications = this.generateImplications(text, question);
    
    let response = '';
    
    // Add question analysis context
    response += `*Local analysis - Question type: ${this.analyzeQuestionType(question)}, Complexity: ${this.analyzeQuestionComplexity(question)}*\n\n`;
    
    if (directAnswer) {
      response += `### Direct Answer\n${directAnswer}\n\n`;
    } else {
      response += `### Direct Answer\nNo direct answer found for this specific question in the provided content.\n\n`;
    }
    
    if (contextualInsights.length > 0) {
      response += `### Context & Background\n`;
      contextualInsights.forEach(insight => {
        response += `• ${insight}\n`;
      });
      response += `\n`;
    }
    
    if (implications.length > 0) {
      response += `### Implications & Significance\n`;
      implications.forEach(implication => {
        response += `• ${implication}\n`;
      });
      response += `\n`;
    }
    
    if (relatedDiscoveries.length > 0) {
      response += `### Related Discoveries\n`;
      relatedDiscoveries.forEach(discovery => {
        response += `• ${discovery}\n`;
      });
      response += `\n`;
    }
    
    // Add connections section
    if (directAnswer && (contextualInsights.length > 0 || implications.length > 0)) {
      response += `### Connections\n`;
      response += `The information above provides a comprehensive view of the topic, connecting direct answers with broader context and implications.\n\n`;
    }
    
    if (!response.trim() || response.length < 100) {
      return `### Direct Answer\nNo relevant information found for "${question}" in the provided content.\n\n### Recommendation\nEnable Cloud AI for more comprehensive analysis, or try rephrasing your question with different keywords.`;
    }
    
    return response.trim();
  }

  private generateElaborateResponse(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length >= 2) {
      return sentences.slice(0, 2).join(' ') + (sentences[1].endsWith('.') ? '' : '.');
    } else if (sentences.length === 1) {
      return sentences[0].trim() + (sentences[0].endsWith('.') ? '' : '.');
    }
    return text.substring(0, 200) + '...';
  }

  private generateKeyTakeaways(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
    if (sentences.length >= 3) {
      const keyPoints = sentences.slice(0, 3).map(s => s.trim());
      return keyPoints.join(' ') + (keyPoints[2].endsWith('.') ? '' : '.');
    }
    return this.generateElaborateResponse(text);
  }

  private generateTopicSummary(text: string): string {
    const firstSentence = text.split(/[.!?]+/)[0];
    if (firstSentence && firstSentence.trim().length > 20) {
      return firstSentence.trim() + (firstSentence.endsWith('.') ? '' : '.');
    }
    return text.substring(0, 150) + '...';
  }

  private analyzeQuestionType(question: string): string {
    const q = question.toLowerCase();
    if (q.startsWith('what')) return 'definition/information';
    if (q.startsWith('how')) return 'process/method';
    if (q.startsWith('why')) return 'explanation/reasoning';
    if (q.startsWith('when')) return 'temporal';
    if (q.startsWith('where')) return 'location/context';
    if (q.startsWith('who')) return 'people/entities';
    if (q.includes('compare') || q.includes('difference')) return 'comparison';
    if (q.includes('benefit') || q.includes('advantage')) return 'analysis';
    if (q.includes('problem') || q.includes('issue')) return 'problem-solving';
    return 'general inquiry';
  }

  private analyzeQuestionComplexity(question: string): string {
    const wordCount = question.split(' ').length;
    const hasMultipleParts = question.includes(' and ') || question.includes(' or ') || question.includes(' but ');
    const hasSubQuestions = question.includes('?') && question.split('?').length > 2;
    
    if (wordCount > 15 || hasMultipleParts || hasSubQuestions) return 'complex';
    if (wordCount > 8) return 'moderate';
    return 'simple';
  }

  private getExpectedDepth(question: string): string {
    const q = question.toLowerCase();
    const depthKeywords = {
      'brief': ['brief', 'short', 'quick', 'summary'],
      'detailed': ['detailed', 'comprehensive', 'thorough', 'explain', 'describe'],
      'specific': ['specific', 'exact', 'precise', 'particular']
    };
    
    for (const [depth, keywords] of Object.entries(depthKeywords)) {
      if (keywords.some(keyword => q.includes(keyword))) {
        return depth;
      }
    }
    
    return 'moderate';
  }

  private generateFollowUpQuestions(originalQuestion: string, text: string): string[] {
    const questionType = this.analyzeQuestionType(originalQuestion);
    const followUps: string[] = [];
    
    // Extract key topics and concepts from the text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keyTopics = this.extractKeyTopics(sentences);
    
    // Generate contextual follow-up questions based on question type
    switch (questionType) {
      case 'definition/information':
        followUps.push(`What are the main benefits of ${this.extractMainTopic(originalQuestion)}?`);
        followUps.push(`How does ${this.extractMainTopic(originalQuestion)} work in practice?`);
        followUps.push(`What are the key challenges related to ${this.extractMainTopic(originalQuestion)}?`);
        break;
      case 'process/method':
        followUps.push(`What are the prerequisites for this process?`);
        followUps.push(`What are common problems with this method?`);
        followUps.push(`How long does this process typically take?`);
        break;
      case 'explanation/reasoning':
        followUps.push(`What are the underlying causes?`);
        followUps.push(`How can this be prevented or improved?`);
        followUps.push(`What are the long-term implications?`);
        break;
      case 'comparison':
        followUps.push(`What are the key differences in implementation?`);
        followUps.push(`Which option is better for specific use cases?`);
        followUps.push(`What are the cost implications?`);
        break;
      default:
        if (keyTopics.length > 0) {
          followUps.push(`What are the main challenges with ${keyTopics[0]}?`);
          followUps.push(`How does ${keyTopics[0]} compare to alternatives?`);
          followUps.push(`What are the next steps for ${keyTopics[0]}?`);
        }
    }
    
    // Add topic-specific questions based on content
    keyTopics.slice(0, 2).forEach(topic => {
      if (topic.length > 3 && !followUps.some(q => q.toLowerCase().includes(topic.toLowerCase()))) {
        followUps.push(`What are the key considerations for ${topic}?`);
      }
    });
    
    return followUps.slice(0, 3); // Limit to 3 follow-up questions
  }

  private extractKeyTopics(sentences: string[]): string[] {
    const topics: string[] = [];
    const topicWords = ['technology', 'system', 'process', 'method', 'approach', 'solution', 'platform', 'framework', 'tool', 'service'];
    
    sentences.forEach(sentence => {
      const words = sentence.toLowerCase().split(' ');
      words.forEach(word => {
        if (topicWords.some(topic => word.includes(topic)) && word.length > 4) {
          if (!topics.includes(word)) {
            topics.push(word);
          }
        }
      });
    });
    
    return topics;
  }

  private extractMainTopic(question: string): string {
    // Extract the main noun or topic from the question
    const words = question.toLowerCase().split(' ');
    const stopWords = ['what', 'how', 'why', 'when', 'where', 'who', 'is', 'are', 'does', 'do', 'can', 'could', 'should', 'would'];
    const mainWords = words.filter(word => !stopWords.includes(word) && word.length > 3);
    
    return mainWords[0] || 'this topic';
  }

  private generateCloudAIUnavailableResponse(question: string): string {
    const currentTime = new Date().toLocaleTimeString();
    
    return `### Direct Answer
I understand you're asking about "${question}", but I'm currently unable to provide a comprehensive AI-powered response due to a configuration issue.

### Current Situation
🔄 **Status**: Cloud AI service is temporarily unavailable  
⏰ **Time**: ${currentTime}  
🔧 **Issue**: OpenAI API key not configured or invalid

### What This Means
• Cloud AI features are disabled for enhanced responses
• You're currently receiving local processing results
• Advanced analysis and contextual insights are limited

### Quick Setup Guide
To enable Cloud AI for better responses:

1. **Get an API Key**:
   • Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   • Create a new API key (requires OpenAI account)

2. **Configure the Server**:
   • Open \`server/.env\` file
   • Add: \`OPENAI_API_KEY=your_actual_api_key_here\`
   • Save the file

3. **Restart the Application**:
   • Stop the current server (Ctrl+C)
   • Run \`./scripts/dev.sh\` again

### Alternative Options
• **Continue with Local Processing**: Current responses use on-device analysis
• **Try Different Questions**: Some topics work better with local processing
• **Check Documentation**: Review setup guides for detailed instructions

### Support Resources
• 📚 Setup Guide: Check the project README
• 🔍 Troubleshooting: Look for "API key" in server logs
• 💬 Community: Join the project discussions for help

*Note: This is a one-time setup. Once configured, Cloud AI will provide enhanced, contextual responses to your questions.*`;
  }

  private localFileNameSuggestion(file: any, content?: string): {
    suggestedName: string;
    confidence: number;
    reasoning: string;
  } {
    const originalName = file.name || 'untitled';
    const extension = originalName.split('.').pop() || '';
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    
    let cleanName = baseName
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w{8,}\b/g, '')
      .replace(/\b(copy|copy\s+\d+|\(\d+\))\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    let prefix = '';
    if (content) {
      const lowerContent = content.toLowerCase();
      // More specific detection to avoid false positives
      if ((lowerContent.includes('invoice') || lowerContent.includes('bill')) && 
          (lowerContent.includes('payment') || lowerContent.includes('amount') || lowerContent.includes('$'))) {
        prefix = 'Invoice_';
      } else if (lowerContent.includes('report') && lowerContent.includes('data')) {
        prefix = 'Report_';
      } else if (lowerContent.includes('contract') || lowerContent.includes('agreement')) {
        prefix = 'Contract_';
      } else if (lowerContent.includes('article') || lowerContent.includes('blog') || lowerContent.includes('news') || lowerContent.includes('browser')) {
        prefix = 'Article_';
      }
    }

    // Remove generic prefixes for cleaner names
    // if (!prefix) {
    //   switch (file.type) {
    //     case 'image': prefix = 'Image_'; break;
    //     case 'document': prefix = 'Document_'; break;
    //     case 'pdf': prefix = 'Document_'; break;
    //     case 'spreadsheet': prefix = 'Spreadsheet_'; break;
    //     case 'presentation': prefix = 'Presentation_'; break;
    //   }
    // }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    
    let finalName = prefix + cleanName;
    if (prefix && !finalName.includes(dateStr)) {
      finalName += `_${dateStr}`;
    }
    
    if (finalName.length > 60) {
      finalName = finalName.substring(0, 57) + '...';
    }
    
    return {
      suggestedName: finalName + (extension ? `.${extension}` : ''),
      confidence: 0.6,
      reasoning: 'Heuristic-based suggestion using filename patterns and content analysis',
    };
  }
}

export const langChainService = new LangChainService();
