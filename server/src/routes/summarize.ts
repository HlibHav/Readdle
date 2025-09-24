import { Request, Response } from 'express';
import { langChainService } from '../services/langchainService.js';

export async function summarizeContent(req: Request, res: Response) {
  try {
    const { text, cloudAI } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const result = await langChainService.summarizeContent(text, cloudAI);
    
    res.json({
      summary: result.summary,
      success: result.success,
      error: result.error,
      method: result.success && cloudAI ? 'langchain' : 'local'
    });

  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      success: false,
      summary: 'Sorry, I can\'t summarize this page at the moment.',
      method: 'error'
    });
  }
}
