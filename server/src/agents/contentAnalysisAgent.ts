export interface ContentStructure {
  type: 'html' | 'pdf' | 'text' | 'structured' | 'mixed';
  complexity: 'simple' | 'medium' | 'complex';
  sections: string[];
  headings: string[];
  tables: boolean;
  lists: boolean;
  codeBlocks: boolean;
  images: boolean;
  links: number;
  wordCount: number;
  language: string;
  domain: string;
  readabilityScore: number;
}

export interface ContentAnalysisResult {
  structure: ContentStructure;
  confidence: number;
  recommendations: {
    chunkingStrategy: 'sentence' | 'paragraph' | 'section' | 'semantic';
    embeddingModel: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002';
    chunkSize: number;
    chunkOverlap: number;
    reasoning: string;
  };
  processingTime: number;
}

export class ContentAnalysisAgent {
  async analyzeContent(content: string, url?: string, metadata?: any): Promise<ContentAnalysisResult> {
    const startTime = Date.now();
    
    try {
      const structure = await this.analyzeStructure(content, url, metadata);
      const recommendations = await this.generateRecommendations(structure);
      
      return {
        structure,
        confidence: this.calculateConfidence(structure),
        recommendations,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Content analysis error:', error);
      return this.getFallbackAnalysis(content);
    }
  }

  private async analyzeStructure(content: string, url?: string, metadata?: any): Promise<ContentStructure> {
    // Content type detection
    const type = this.detectContentType(content, url, metadata);
    
    // Extract structural elements
    const sections = this.extractSections(content);
    const headings = this.extractHeadings(content);
    const tables = this.hasTables(content);
    const lists = this.hasLists(content);
    const codeBlocks = this.hasCodeBlocks(content);
    const images = this.hasImages(content);
    const links = this.countLinks(content);
    
    // Calculate metrics
    const wordCount = this.countWords(content);
    const language = this.detectLanguage(content);
    const domain = this.extractDomain(url);
    const readabilityScore = this.calculateReadability(content);
    
    // Determine complexity
    const complexity = this.assessComplexity({
      wordCount,
      sections: sections.length,
      headings: headings.length,
      tables,
      codeBlocks,
      readabilityScore
    });

    return {
      type,
      complexity,
      sections,
      headings,
      tables,
      lists,
      codeBlocks,
      images,
      links,
      wordCount,
      language,
      domain,
      readabilityScore
    };
  }

  private detectContentType(content: string, url?: string, metadata?: any): ContentStructure['type'] {
    // Check metadata first
    if (metadata?.type === 'pdf') return 'pdf';
    if (metadata?.type === 'html') return 'html';
    
    // Check URL extension
    if (url) {
      const extension = url.split('.').pop()?.toLowerCase();
      if (extension === 'pdf') return 'pdf';
      if (extension === 'html' || extension === 'htm') return 'html';
    }
    
    // Analyze content patterns
    if (this.isHTML(content)) return 'html';
    if (this.isStructuredData(content)) return 'structured';
    if (this.isMixedContent(content)) return 'mixed';
    
    return 'text';
  }

  private isHTML(content: string): boolean {
    return /<[^>]+>/g.test(content) && content.includes('<');
  }

  private isStructuredData(content: string): boolean {
    // Check for JSON, XML, YAML patterns
    return (
      content.trim().startsWith('{') && content.trim().endsWith('}') ||
      content.trim().startsWith('<') && content.trim().endsWith('>') ||
      content.includes('---') && content.includes(':')
    );
  }

  private isMixedContent(content: string): boolean {
    // Check for mixed content (text + HTML + structured data)
    const hasHTML = /<[^>]+>/g.test(content);
    const hasStructured = this.isStructuredData(content);
    const hasPlainText = content.length > 100 && !hasHTML && !hasStructured;
    
    return (hasHTML && hasStructured) || (hasHTML && hasPlainText) || (hasStructured && hasPlainText);
  }

  private extractSections(content: string): string[] {
    const sections: string[] = [];
    
    // HTML sections
    const htmlSections = content.match(/<(section|article|div)[^>]*>/gi);
    if (htmlSections) sections.push(...htmlSections);
    
    // Markdown-style sections
    const markdownSections = content.match(/^#{2,}\s+.+$/gm);
    if (markdownSections) sections.push(...markdownSections);
    
    // Paragraph-based sections (groups of 3+ paragraphs)
    const paragraphs = content.split(/\n\s*\n/);
    let currentSection = '';
    let paragraphCount = 0;
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim().length > 50) {
        currentSection += paragraph + '\n\n';
        paragraphCount++;
        
        if (paragraphCount >= 3) {
          sections.push(currentSection.trim());
          currentSection = '';
          paragraphCount = 0;
        }
      }
    }
    
    if (currentSection.trim()) {
      sections.push(currentSection.trim());
    }
    
    return sections.filter(s => s.length > 100);
  }

  private extractHeadings(content: string): string[] {
    const headings: string[] = [];
    
    // HTML headings
    const htmlHeadings = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi);
    if (htmlHeadings) {
      headings.push(...htmlHeadings.map(h => h.replace(/<[^>]*>/g, '').trim()));
    }
    
    // Markdown headings
    const markdownHeadings = content.match(/^#{1,6}\s+(.+)$/gm);
    if (markdownHeadings) {
      headings.push(...markdownHeadings.map(h => h.replace(/^#+\s*/, '').trim()));
    }
    
    // Title-like patterns
    const titlePatterns = content.match(/^[A-Z][A-Z\s]{10,}$/gm);
    if (titlePatterns) {
      headings.push(...titlePatterns.map(t => t.trim()));
    }
    
    return headings.filter(h => h.length > 5 && h.length < 100);
  }

  private hasTables(content: string): boolean {
    return /<table|<tr|<td|\|.*\|/g.test(content);
  }

  private hasLists(content: string): boolean {
    return /<ul|<ol|<li|^\s*[-*+]\s|^\s*\d+\.\s/gm.test(content);
  }

  private hasCodeBlocks(content: string): boolean {
    return /<code|<pre|```|`[^`]+`/g.test(content);
  }

  private hasImages(content: string): boolean {
    return /<img|!\[.*\]\(|\.jpg|\.png|\.gif|\.svg/gi.test(content);
  }

  private countLinks(content: string): number {
    const htmlLinks = (content.match(/<a[^>]*>/gi) || []).length;
    const markdownLinks = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
    return htmlLinks + markdownLinks;
  }

  private countWords(content: string): number {
    return content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
  }

  private detectLanguage(content: string): string {
    // Simple language detection based on common words
    const cleanContent = content.replace(/<[^>]*>/g, '').toLowerCase();
    
    const languages = {
      'en': ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
      'es': ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te'],
      'fr': ['le', 'la', 'de', 'et', 'à', 'un', 'il', 'que', 'ne', 'se', 'ce', 'pas'],
      'de': ['der', 'die', 'das', 'und', 'in', 'den', 'von', 'zu', 'dem', 'mit', 'sich', 'des']
    };
    
    for (const [lang, words] of Object.entries(languages)) {
      const matches = words.filter(word => cleanContent.includes(word)).length;
      if (matches >= 3) return lang;
    }
    
    return 'en'; // Default to English
  }

  private extractDomain(url?: string): string {
    if (!url) return 'unknown';
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  private calculateReadability(content: string): number {
    // Simple Flesch Reading Ease approximation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.countWords(content);
    const syllables = this.estimateSyllables(content);
    
    if (sentences.length === 0 || words === 0) return 50;
    
    const avgSentenceLength = words / sentences.length;
    const avgSyllablesPerWord = syllables / words;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, score));
  }

  private estimateSyllables(text: string): number {
    // Simple syllable estimation
    const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    let syllables = 0;
    
    for (const word of words) {
      if (word.length <= 3) {
        syllables += 1;
      } else {
        const vowels = word.match(/[aeiouy]+/g);
        syllables += vowels ? vowels.length : 1;
      }
    }
    
    return syllables;
  }

  private assessComplexity(metrics: {
    wordCount: number;
    sections: number;
    headings: number;
    tables: boolean;
    codeBlocks: boolean;
    readabilityScore: number;
  }): 'simple' | 'medium' | 'complex' {
    let complexityScore = 0;
    
    // Word count factor
    if (metrics.wordCount > 5000) complexityScore += 3;
    else if (metrics.wordCount > 2000) complexityScore += 2;
    else if (metrics.wordCount > 500) complexityScore += 1;
    
    // Structural complexity
    if (metrics.sections > 10) complexityScore += 2;
    else if (metrics.sections > 5) complexityScore += 1;
    
    if (metrics.headings > 15) complexityScore += 2;
    else if (metrics.headings > 8) complexityScore += 1;
    
    // Content type complexity
    if (metrics.tables) complexityScore += 1;
    if (metrics.codeBlocks) complexityScore += 2;
    
    // Readability factor (lower score = more complex)
    if (metrics.readabilityScore < 30) complexityScore += 3;
    else if (metrics.readabilityScore < 50) complexityScore += 2;
    else if (metrics.readabilityScore < 70) complexityScore += 1;
    
    if (complexityScore >= 6) return 'complex';
    if (complexityScore >= 3) return 'medium';
    return 'simple';
  }

  private async generateRecommendations(structure: ContentStructure) {
    // Agent decision logic for optimal strategy selection
    let chunkingStrategy: ContentAnalysisResult['recommendations']['chunkingStrategy'];
    let embeddingModel: ContentAnalysisResult['recommendations']['embeddingModel'];
    let chunkSize: number;
    let chunkOverlap: number;
    let reasoning: string;

    // Content type-based strategy selection
    switch (structure.type) {
      case 'html':
        if (structure.sections.length > 5) {
          chunkingStrategy = 'section';
          chunkSize = 1024;
          chunkOverlap = 150;
          reasoning = 'HTML with multiple sections - use section-based chunking';
        } else {
          chunkingStrategy = 'paragraph';
          chunkSize = 512;
          chunkOverlap = 100;
          reasoning = 'Simple HTML content - use paragraph-based chunking';
        }
        embeddingModel = 'text-embedding-3-small';
        break;

      case 'pdf':
        if (structure.tables) {
          chunkingStrategy = 'semantic';
          chunkSize = 2048;
          chunkOverlap = 200;
          reasoning = 'PDF with tables - use semantic chunking to preserve table structure';
        } else {
          chunkingStrategy = 'paragraph';
          chunkSize = 1024;
          chunkOverlap = 150;
          reasoning = 'PDF content - use paragraph-based chunking';
        }
        embeddingModel = 'text-embedding-3-large';
        break;

      case 'structured':
        chunkingStrategy = 'semantic';
        chunkSize = 2048;
        chunkOverlap = 300;
        reasoning = 'Structured data - use semantic chunking to preserve data relationships';
        embeddingModel = 'text-embedding-3-large';
        break;

      default:
        // Text or mixed content
        if (structure.complexity === 'complex') {
          chunkingStrategy = 'semantic';
          chunkSize = 1536;
          chunkOverlap = 200;
          reasoning = 'Complex text content - use semantic chunking for better context';
        } else if (structure.complexity === 'medium') {
          chunkingStrategy = 'paragraph';
          chunkSize = 1024;
          chunkOverlap = 150;
          reasoning = 'Medium complexity text - use paragraph-based chunking';
        } else {
          chunkingStrategy = 'sentence';
          chunkSize = 512;
          chunkOverlap = 100;
          reasoning = 'Simple text content - use sentence-based chunking';
        }
        embeddingModel = 'text-embedding-3-small';
    }

    // Adjust based on readability
    if (structure.readabilityScore < 40) {
      chunkSize = Math.min(chunkSize * 0.8, chunkSize);
      reasoning += ' (reduced chunk size due to low readability)';
    }

    return {
      chunkingStrategy,
      embeddingModel,
      chunkSize,
      chunkOverlap,
      reasoning
    };
  }

  private calculateConfidence(structure: ContentStructure): number {
    let confidence = 0.8; // Base confidence
    
    // Reduce confidence for mixed content
    if (structure.type === 'mixed') confidence -= 0.2;
    
    // Reduce confidence for very complex content
    if (structure.complexity === 'complex') confidence -= 0.1;
    
    // Increase confidence for well-structured content
    if (structure.sections.length > 3 && structure.headings.length > 2) {
      confidence += 0.1;
    }
    
    return Math.max(0.3, Math.min(1.0, confidence));
  }

  private getFallbackAnalysis(content: string): ContentAnalysisResult {
    return {
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
        wordCount: this.countWords(content),
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
        reasoning: 'Fallback strategy due to analysis error'
      },
      processingTime: 0
    };
  }
}

export const contentAnalysisAgent = new ContentAnalysisAgent();
