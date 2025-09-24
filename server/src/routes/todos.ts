import { Request, Response } from 'express';
import { LangChainService } from '../services/langchainService.js';

const langchainService = new LangChainService();

export async function createTodos(req: Request, res: Response) {
  try {
    const { text, cloudAI = true } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await langchainService.createTodos(text, cloudAI);
    
    res.json({
      todos: result.todos,
      success: result.success,
      error: result.error
    });

  } catch (error) {
    console.error('Todo creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create todos',
      todos: 'Todo creation failed. Please try again.',
      success: false
    });
  }
}
