import { Request, Response } from 'express';
import { langChainService } from '../services/langchainService.js';
import { DeviceService } from '../services/deviceService.js';

export async function answerQuestion(req: Request, res: Response) {
  try {
    const { text, question, cloudAI, deviceInfo } = req.body;
    
    if (!text || !question) {
      return res.status(400).json({ error: 'Text content and question are required' });
    }

    // Detect device if not provided
    const detectedDevice = deviceInfo || DeviceService.detectDevice(
      req.headers['user-agent'] || '',
      req.body.additionalInfo
    );

    const result = await langChainService.answerQuestion(text, question, cloudAI, detectedDevice);
    
    res.json({
      answer: result.answer,
      success: result.success,
      error: result.error,
      method: result.success && cloudAI ? 'rag' : 'local',
      ragResult: result.ragResult,
      deviceInfo: detectedDevice
    });

  } catch (error) {
    console.error('Q&A error:', error);
    res.status(500).json({ 
      error: 'Failed to answer question',
      success: false,
      answer: 'Sorry, I can\'t answer that question at the moment.',
      method: 'error'
    });
  }
}
