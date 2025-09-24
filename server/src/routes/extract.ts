import { Request, Response } from 'express';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export interface ExtractedContent {
  title: string;
  byline: string;
  content: string;
  text: string;
  domain: string;
  favicon?: string;
}

export async function extractPageContent(req: Request, res: Response) {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Prevent processing error messages as URLs
    if (typeof url === 'string' && (url.includes('Failed to load page') || url.includes('Please check the URL'))) {
      return res.status(400).json({ error: 'Invalid URL - please enter a valid web address' });
    }

    // Fetch the page with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Documents Browser Demo)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - the website took too long to respond');
      }
      throw error;
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    // Extract favicon
    const favicon = extractFavicon(document, url);

    // Use Readability to extract article content
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      // Fallback to basic extraction
      const title = document.querySelector('title')?.textContent || 'Untitled';
      const content = document.body?.textContent || '';
      
      return res.json({
        title: title.trim(),
        byline: '',
        content: content.substring(0, 5000), // Limit content
        text: content.substring(0, 5000),
        domain: new URL(url).hostname,
        favicon,
      });
    }

    res.json({
      title: article.title || 'Untitled',
      byline: article.byline || '',
      content: article.content || '',
      text: article.textContent || '',
      domain: new URL(url).hostname,
      favicon,
    });

  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract page content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function extractFavicon(document: Document, url: string): string | undefined {
  // Try to find favicon in various ways
  const faviconSelectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
  ];

  for (const selector of faviconSelectors) {
    const link = document.querySelector(selector) as HTMLLinkElement;
    if (link?.href) {
      try {
        return new URL(link.href, url).href;
      } catch {
        // Invalid URL, continue
      }
    }
  }

  // Fallback to default favicon location
  try {
    return new URL('/favicon.ico', url).href;
  } catch {
    return undefined;
  }
}
