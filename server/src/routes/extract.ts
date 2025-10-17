import { Request, Response } from 'express';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import puppeteer, { type Browser, type Page } from 'puppeteer';

export interface ExtractedContent {
  title: string;
  byline: string;
  content: string;
  text: string;
  domain: string;
  favicon?: string;
  images?: Array<{src: string; alt: string; width: number; height: number}>;
}

function normalizeImageSource(src: string | null | undefined, baseUrl: string): string | null {
  if (!src) return null;
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith('data:')) {
    return null;
  }

  try {
    return new URL(trimmed, baseUrl).href;
  } catch {
    return null;
  }
}

function extractImagesFromDocument(document: Document, baseUrl: string): Array<{src: string; alt: string; width: number; height: number}> {
  const seen = new Set<string>();
  const placeholders = /(data:image\/svg|placeholder|blank|spacer|transparent|pixel|1x1)/i;

  return Array.from(document.querySelectorAll('img'))
    .map((img) => {
      let candidateSrc =
        img.getAttribute('src') ||
        img.getAttribute('data-src') ||
        img.getAttribute('data-lazy-src') ||
        img.getAttribute('data-original') ||
        img.getAttribute('data-url') ||
        '';

      if (!candidateSrc) {
        const srcset = img.getAttribute('srcset');
        if (srcset) {
          const parts = srcset.split(',').map((entry) => entry.trim().split(' ')[0]).filter(Boolean);
          if (parts.length > 0) {
            candidateSrc = parts[parts.length - 1];
          }
        }
      }

      const src = normalizeImageSource(candidateSrc, baseUrl);
      if (!src || placeholders.test(src)) {
        return null;
      }

      if (seen.has(src)) {
        return null;
      }
      seen.add(src);

      const widthAttr = parseInt(img.getAttribute('width') || '', 10);
      const heightAttr = parseInt(img.getAttribute('height') || '', 10);
      let width = Number.isFinite(widthAttr) && widthAttr > 0 ? widthAttr : (img as HTMLImageElement).width || (img as any).naturalWidth || 0;
      let height = Number.isFinite(heightAttr) && heightAttr > 0 ? heightAttr : (img as HTMLImageElement).height || (img as any).naturalHeight || 0;

      if (width <= 0) {
        width = 800;
      }

      if (height <= 0) {
        height = 600;
      }

      if (width < 60 || height < 60) {
        return null;
      }

      return {
        src,
        alt: img.getAttribute('alt') || '',
        width,
        height,
      };
    })
    .filter((img): img is {src: string; alt: string; width: number; height: number} => !!img)
    .slice(0, 10);
}

async function extractWithPuppeteer(url: string): Promise<ExtractedContent> {
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-http2',
      '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
  });
  
  try {
    const page: Page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    
    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const content = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style, nav, header, footer, aside');
      scripts.forEach(el => el.remove());
      
      // Get main content
      const mainSelectors = [
        'main',
        'article', 
        '[role="main"]',
        '.content',
        '.main-content',
        '#content',
        '#main',
        '.post-content',
        '.entry-content'
      ];
      
      let contentElement = null;
      for (const selector of mainSelectors) {
        contentElement = document.querySelector(selector);
        if (contentElement && contentElement.textContent?.trim().length > 100) {
          break;
        }
      }
      
      const main = contentElement || document.body;
      
      // Extract images with full URLs
      const images = Array.from(document.querySelectorAll('img'))
        .map(img => ({
          src: img.src, // Full URL
          alt: img.alt || '',
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height
        }))
        .filter(img => 
          img.src && 
          !img.src.includes('data:image') && 
          !img.src.includes('placeholder') &&
          !img.src.includes('blank') &&
          !img.src.includes('1x1') &&
          !img.src.includes('pixel') &&
          img.width > 50 && 
          img.height > 50
        )
        .slice(0, 10); // Get up to 10 images
      
      return {
        title: document.title || 'Untitled',
        content: main ? main.textContent : document.body.textContent,
        images: images,
        domain: window.location.hostname
      };
    });
    
    await browser.close();
    
    return {
      title: content.title,
      byline: '',
      content: content.content.substring(0, 10000),
      text: content.content.substring(0, 10000),
      domain: content.domain,
      favicon: undefined,
      images: content.images
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

export async function extractPageContent(req: Request, res: Response) {
  // Set CORS headers directly
  const origin = req.headers.origin;
  if (origin === 'https://web-obrqtyqdn-hlibhavs-projects.vercel.app') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  console.log('🔍 extractPageContent called with URL:', req.body.url);
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
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - the website took too long to respond');
      }
      throw error;
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;
    const images = extractImagesFromDocument(document, url);

    // Extract favicon
    const favicon = extractFavicon(document, url);

    // Use Readability to extract article content
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      // Fallback to basic extraction
      const title = document.querySelector('title')?.textContent || 'Untitled';
      
      // Try to get content from main content areas
      const mainSelectors = [
        'main',
        'article', 
        '[role="main"]',
        '.content',
        '.main-content',
        '#content',
        '#main',
        '.post-content',
        '.entry-content'
      ];
      
      let content = '';
      let contentElement = null;
      
      for (const selector of mainSelectors) {
        contentElement = document.querySelector(selector);
        if (contentElement) {
          content = contentElement.textContent || '';
          if (content.trim().length > 100) break; // Found substantial content
        }
      }
      
      // If no main content found, use body
      if (!content.trim()) {
        content = document.body?.textContent || document.body?.innerText || '';
      }
      
      // Clean up content
      content = content.replace(/\s+/g, ' ').trim();
      
      // If content is still empty or very short, try Puppeteer
      if (content.length < 100) {
        console.log('Basic extraction failed, trying Puppeteer for:', url);
        try {
          const puppeteerResult = await extractWithPuppeteer(url);
          return res.json(puppeteerResult);
        } catch (puppeteerError) {
          console.error('Puppeteer extraction also failed:', puppeteerError);
          // Return the basic result even if it's short
        }
      }
      
      return res.json({
        title: title.trim(),
        byline: '',
        content: content.substring(0, 10000), // Increased limit
        text: content.substring(0, 10000),
        domain: new URL(url).hostname,
        favicon,
        images,
      });
    }

    // Check if Readability result has meaningful content
    const readabilityContent = article.textContent || '';
    if (readabilityContent.trim().length < 100) {
      console.log('Readability result is too short, trying Puppeteer for:', url);
      try {
        const puppeteerResult = await extractWithPuppeteer(url);
        return res.json(puppeteerResult);
      } catch (puppeteerError) {
        console.error('Puppeteer extraction also failed:', puppeteerError);
        // Return the Readability result even if it's short
      }
    }

    res.json({
      title: article.title || 'Untitled',
      byline: article.byline || '',
      content: article.content || '',
      text: article.textContent || '',
      domain: new URL(url).hostname,
      favicon,
      images,
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
