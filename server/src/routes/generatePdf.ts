import type { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GeneratePdfRequest {
  url?: string;
  html?: string;
  title?: string;
  downloadName?: string;
  emulateMedia?: 'screen' | 'print';
  cloudAI?: boolean;
}

interface GeneratePdfResponse {
  success: boolean;
  pdfData?: string;
  fileId?: string;
  suggestedName?: string;
  originalName?: string;
  summary?: string;
  tags?: string[];
  size?: number;
  title?: string | null;
  sourceUrl?: string | null;
  error?: string;
}

/**
 * Generate PDF from URL or HTML using Puppeteer
 * Best practices implementation with proper error handling and cleanup
 */
export async function generatePdf(req: Request, res: Response): Promise<void> {
  let browser: puppeteer.Browser | null = null;
  let tempHtmlPath: string | null = null;

  try {
    const {
      url,
      html,
      title,
      downloadName,
      emulateMedia = 'screen',
      cloudAI = true
    } = req.body as GeneratePdfRequest;

    // Validate input
    if (!url && !html) {
      res.status(400).json({
        success: false,
        error: 'Either url or html must be provided'
      } as GeneratePdfResponse);
      return;
    }

    console.log('📄 Starting PDF generation:', {
      hasUrl: !!url,
      hasHtml: !!html,
      title,
      emulateMedia
    });

    // Launch Puppeteer with optimized settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security', // Allow loading images from different origins
        '--disable-features=IsolateOrigins,site-per-process'
      ],
      timeout: 30000
    });

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });

    // Emulate media type
    await page.emulateMediaType(emulateMedia);

    // Set user agent to avoid bot detection
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );

    // Navigate to URL or set HTML content
    if (url) {
      console.log('📄 Loading URL:', url);
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
    } else if (html) {
      console.log('📄 Loading HTML content');
      
      // Create temporary HTML file to preserve relative paths and resources
      const tempDir = path.join(__dirname, '../../temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      tempHtmlPath = path.join(tempDir, `temp-${Date.now()}.html`);
      await fs.writeFile(tempHtmlPath, html, 'utf-8');
      
      await page.goto(`file://${tempHtmlPath}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
    }

    // Wait a bit more for dynamic content and images
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract page title if not provided
    const pageTitle = title || await page.title() || 'document';

    // Generate PDF with high quality settings
    console.log('📄 Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #999; padding: 5px;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
      preferCSSPageSize: false
    });

    console.log('📄 PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Convert to base64
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    // Generate filename
    const sanitizedTitle = pageTitle
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 96);
    
    const suggestedName = downloadName || `${sanitizedTitle}.pdf`;
    const originalName = `${sanitizedTitle}.pdf`;

    // Extract summary from page content
    const summary = await page.evaluate(() => {
      const text = document.body.innerText || '';
      return text.replace(/\s+/g, ' ').trim().slice(0, 200);
    });

    // Generate response
    const response: GeneratePdfResponse = {
      success: true,
      pdfData: pdfBase64,
      fileId: `pdf_${Date.now()}`,
      suggestedName,
      originalName,
      summary: summary || 'PDF generated from webpage',
      tags: ['document', 'pdf'],
      size: pdfBuffer.length,
      title: pageTitle,
      sourceUrl: url || null
    };

    res.json(response);

  } catch (error) {
    console.error('📄 PDF generation failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: `Failed to generate PDF: ${errorMessage}`
    } as GeneratePdfResponse);

  } finally {
    // Cleanup
    try {
      if (browser) {
        await browser.close();
        console.log('📄 Browser closed');
      }
      
      if (tempHtmlPath) {
        await fs.unlink(tempHtmlPath);
        console.log('📄 Temp file cleaned up');
      }
    } catch (cleanupError) {
      console.error('📄 Cleanup error:', cleanupError);
    }
  }
}
