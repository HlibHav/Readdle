import { Request, Response } from 'express';
import { langChainService } from '../services/langchainService.js';

export async function suggestFilename(req: Request, res: Response) {
  try {
    const { file, content } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'File information is required' });
    }

    const result = await langChainService.suggestFileName(file, content);
    
    res.json({
      suggestedName: result.suggestedName,
      confidence: result.confidence,
      reasoning: result.reasoning,
      success: true
    });

  } catch (error) {
    console.error('Filename suggestion error:', error);
    res.status(500).json({ 
      error: 'Failed to suggest filename',
      success: false,
      suggestedName: req.body.file?.name || 'untitled',
      confidence: 0,
      reasoning: 'Error occurred during suggestion'
    });
  }
}
