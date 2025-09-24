import { Request, Response } from 'express';
import { ragService } from '../services/ragService.js';
import { DeviceService } from '../services/deviceService.js';

export async function getRAGStrategies(req: Request, res: Response) {
  try {
    const strategies = ragService.getAvailableStrategies();
    res.json({ strategies });
  } catch (error) {
    console.error('Error getting RAG strategies:', error);
    res.status(500).json({ error: 'Failed to get RAG strategies' });
  }
}

export async function getRAGStrategy(req: Request, res: Response) {
  try {
    const { strategyName } = req.params;
    const strategy = ragService.getStrategyInfo(strategyName);
    
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    
    res.json({ strategy });
  } catch (error) {
    console.error('Error getting RAG strategy:', error);
    res.status(500).json({ error: 'Failed to get RAG strategy' });
  }
}

export async function processWithRAG(req: Request, res: Response) {
  try {
    const { content, question, deviceInfo, strategyName, cloudAI = true } = req.body;
    
    console.log('RAG request received:', { 
      questionLength: question?.length, 
      contentLength: content?.length, 
      cloudAI, 
      strategyName 
    });
    
    if (!content || !question) {
      return res.status(400).json({ error: 'Content and question are required' });
    }

    // Detect device if not provided
    const detectedDevice = deviceInfo || DeviceService.detectDevice(
      req.headers['user-agent'] || '',
      req.body.additionalInfo
    );

    const result = await ragService.processWithRAG(
      content, 
      question, 
      detectedDevice, 
      strategyName,
      cloudAI
    );
    
    console.log('RAG processing successful:', { 
      strategy: result.strategy, 
      confidence: result.confidence,
      answerLength: result.answer?.length 
    });
    
    res.json({
      answer: result.answer,
      sources: result.sources,
      strategy: result.strategy,
      confidence: result.confidence,
      processingTime: result.processingTime,
      deviceInfo: detectedDevice
    });

  } catch (error) {
    console.error('RAG processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process with RAG',
      answer: 'Sorry, I can\'t process this request at the moment.',
      strategy: 'error'
    });
  }
}

export async function detectDevice(req: Request, res: Response) {
  try {
    const deviceInfo = DeviceService.detectDevice(
      req.headers['user-agent'] || '',
      req.body.additionalInfo
    );
    
    const optimalStrategy = DeviceService.getOptimalRAGStrategy(
      deviceInfo, 
      req.body.contentLength || 0
    );
    
    const shouldUseLocal = DeviceService.shouldUseLocalProcessing(deviceInfo);
    
    res.json({
      deviceInfo,
      optimalStrategy,
      shouldUseLocal,
      recommendations: {
        useRAG: !shouldUseLocal && deviceInfo.hasInternet,
        preferredStrategy: optimalStrategy,
        maxContentLength: deviceInfo.isMobile ? 5000 : 10000
      }
    });
  } catch (error) {
    console.error('Device detection error:', error);
    res.status(500).json({ error: 'Failed to detect device' });
  }
}
