import { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import { langChainService } from '../services/langchainService.js';

interface GeneratePdfRequest {
  url: string;
  title?: string;
  content?: string;
  cloudAI?: boolean;
}

export async function generatePdf(req: Request, res: Response) {
  try {
    const { url, title, content, cloudAI = true }: GeneratePdfRequest = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        success: false 
      });
    }

    console.log(`🔄 Generating PDF for URL: ${url}`);

    // Generate PDF using Puppeteer with enhanced configuration
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-http2', // Disable HTTP/2 to avoid protocol errors
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate to the page with better error handling
    try {
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
    } catch (navigationError) {
      console.error('Navigation error:', navigationError);
      
      // Try alternative navigation strategies
      try {
        console.log('🔄 Trying alternative navigation...');
        await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 20000 
        });
        
        // Wait a bit for content to load
        await page.waitForTimeout(3000);
      } catch (fallbackError) {
        console.error('Fallback navigation failed:', fallbackError);
        
        // Try with minimal wait strategy
        try {
          console.log('🔄 Trying minimal wait strategy...');
          await page.goto(url, { 
            waitUntil: 'load',
            timeout: 15000 
          });
          await page.waitForTimeout(2000);
        } catch (finalError) {
          console.error('All navigation strategies failed:', finalError);
          throw new Error(`Unable to access the website: ${finalError.message}. The website may have restrictions or be temporarily unavailable.`);
        }
      }
    }

    // Generate PDF buffer with error handling
    let pdfBuffer;
    try {
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      await browser.close();
      throw new Error(`Failed to generate PDF: ${pdfError.message}. The page may be too large or have rendering issues.`);
    }

    await browser.close();

    // Extract page content if not provided
    let pageContent = content;
    let pageTitle = title;
    
    if (!pageContent || !pageTitle) {
      const browser2 = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-http2', // Disable HTTP/2 to avoid protocol errors
          '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });
      
      const page2 = await browser2.newPage();
      
      try {
        await page2.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      } catch (contentError) {
        console.error('Content extraction navigation error:', contentError);
        try {
          await page2.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await page2.waitForTimeout(3000);
        } catch (fallbackError) {
          console.error('Content extraction fallback failed:', fallbackError);
          await browser2.close();
          // Use fallback content if extraction fails
          pageTitle = pageTitle || 'Untitled Document';
          pageContent = pageContent || 'Content extraction failed. The PDF was generated but content analysis is unavailable.';
        }
      }
      
      if (!pageTitle) {
        pageTitle = await page2.title();
      }
      
      if (!pageContent) {
        pageContent = await page2.evaluate(() => {
          // Remove script and style elements
          const scripts = document.querySelectorAll('script, style, nav, header, footer, aside');
          scripts.forEach(el => el.remove());
          
          // Get main content
          const main = document.querySelector('main') || document.querySelector('article') || document.body;
          return main ? main.innerText : document.body.innerText;
        });
      }
      
      await browser2.close();
    }

    // Generate AI suggestions
    const fileInfo = {
      name: `${pageTitle || 'untitled'}.pdf`,
      type: 'pdf',
      size: pdfBuffer.length
    };

    // Get AI suggestions for filename, summary, and tags
    console.log('🔄 Generating AI suggestions...');
    const [filenameResult, summaryResult, tagResult] = await Promise.all([
      langChainService.suggestFileName(fileInfo, pageContent),
      langChainService.summarizeContent(pageContent, cloudAI),
      generateTags(pageContent, pageTitle, cloudAI)
    ]);

    console.log('📝 Filename result:', filenameResult);
    console.log('🏷️ Tags result:', tagResult);

    // Create unique file ID
    const fileId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Clean up suggested filename
    const suggestedName = filenameResult.suggestedName
      .replace(/[<>:"/\\|?*]/g, '_') // Remove invalid characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 100); // Limit length

    console.log('✨ Final suggested name:', suggestedName);

    // Convert PDF to base64
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
    console.log('📄 PDF Buffer size:', pdfBuffer.length, 'bytes');
    console.log('📄 Base64 string length:', pdfBase64.length);
    console.log('📄 Base64 preview (first 100 chars):', pdfBase64.substring(0, 100));

    // Send JSON response with metadata
    res.json({
      success: true,
      fileId,
      suggestedName,
      originalName: `${pageTitle || 'untitled'}.pdf`,
      summary: summaryResult.summary,
      tags: tagResult.tags,
      // Send PDF as base64 for frontend to handle
      pdfData: pdfBase64
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      error: 'Failed to generate PDF',
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function generateTags(content: string, title: string, cloudAI: boolean): Promise<{ tags: string[] }> {
  try {
    if (!cloudAI || !langChainService.isLLMInitialized) {
      // Fallback to simple tag generation
      return generateSimpleTags(content, title);
    }

    const prompt = `
Analyze the following content and suggest 3-5 relevant tags for organizing this document.

Title: ${title}
Content: ${content.substring(0, 2000)}

Rules:
1. Generate 3-5 short, descriptive tags
2. Use lowercase, single words or short phrases
3. Focus on main topics, document type, and key themes
4. Avoid generic terms like "document" or "content"
5. Return as comma-separated list

Tags:`;

    // For now, use the existing LLM service
    const result = await (langChainService as any).llm?.invoke(prompt);
    const tagResponse = typeof result?.content === 'string' ? result.content : '';
    
    // Parse tags from response
    const tags = tagResponse
      .toLowerCase()
      .split(/[,\n]/)
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0 && tag.length < 20)
      .slice(0, 5);

    return { tags: tags.length > 0 ? tags : generateSimpleTags(content, title).tags };

  } catch (error) {
    console.error('Tag generation error:', error);
    return generateSimpleTags(content, title);
  }
}

function generateSimpleTags(content: string, title: string): { tags: string[] } {
  const text = `${title} ${content}`.toLowerCase();
  const tags: string[] = [];

  // Document type detection
  if (text.includes('invoice') || text.includes('bill')) tags.push('invoice');
  if (text.includes('report') || text.includes('summary')) tags.push('report');
  if (text.includes('contract') || text.includes('agreement')) tags.push('contract');
  if (text.includes('receipt')) tags.push('receipt');
  if (text.includes('manual') || text.includes('guide')) tags.push('manual');

  // Topic detection
  if (text.includes('financial') || text.includes('money') || text.includes('budget')) tags.push('finance');
  if (text.includes('technical') || text.includes('code') || text.includes('software')) tags.push('technical');
  if (text.includes('business') || text.includes('company') || text.includes('corporate')) tags.push('business');
  if (text.includes('health') || text.includes('medical')) tags.push('health');
  if (text.includes('legal') || text.includes('law') || text.includes('court')) tags.push('legal');

  // Ensure we have at least some tags
  if (tags.length === 0) {
    tags.push('document', 'webpage');
  }

  return { tags: tags.slice(0, 5) };
}
