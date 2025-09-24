import { Request, Response } from 'express';
import { LangChainService } from '../services/langchainService.js';

const langchainService = new LangChainService();

export async function analyzeForInsights(req: Request, res: Response) {
  try {
    const { text, cloudAI = true } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await langchainService.analyzeForInsights(text, cloudAI);
    
    res.json({
      insights: result.insights,
      success: result.success,
      error: result.error
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze content',
      insights: 'Analysis failed. Please try again.',
      success: false
    });
  }
}
