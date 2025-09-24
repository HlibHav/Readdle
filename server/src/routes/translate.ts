import { Request, Response } from 'express';
import { langChainService } from '../services/langchainService.js';

export async function translateContent(req: Request, res: Response) {
  try {
    const { text, targetLanguage, cloudAI = true } = req.body;
    
    console.log('Translation request:', { text: text.substring(0, 50), targetLanguage, cloudAI });
    console.log('LLM Initialized:', langChainService.isLLMInitialized);
    console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    const result = await langChainService.translateContent(text, targetLanguage, cloudAI);
    
    res.json({
      translation: result.translation,
      success: result.success,
      error: result.error
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      error: 'Failed to translate content',
      translation: 'Translation failed. Please try again.',
      success: false
    });
  }
}
