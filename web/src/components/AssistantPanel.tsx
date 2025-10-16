import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, MessageSquare, Loader2, Settings } from 'lucide-react';
import { PageContent } from '../state/store';
import { summarizeContent, processWithRAG, detectDevice, translateContent, analyzeForInsights, createTodos } from '../lib/api';
import { useAppStore } from '../state/store';
import { RAGStrategySelector } from './RAGStrategySelector';
import { ChatActions } from './ChatActions';
import toast from 'react-hot-toast';
import GlassSurface from './GlassSurface';

interface AssistantPanelProps {
  page: PageContent;
  onClose: () => void;
}

export function AssistantPanel({ page, onClose }: AssistantPanelProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ragResult, setRagResult] = useState<any>(null);
  const [, setDeviceInfo] = useState<any>(null);
  const [showRAGSettings, setShowRAGSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [strategyChangeNotification, setStrategyChangeNotification] = useState<string | null>(null);
  const [actionsUsed, setActionsUsed] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  
  const { cloudAI, firstTimeAssistant, setFirstTimeAssistant, selectedRAGStrategy } = useAppStore();

  useEffect(() => {
    if (firstTimeAssistant) {
      setFirstTimeAssistant(false);
      // Show consent modal
      const consent = confirm(
        'Sends page text to AI only if Cloud AI is ON; otherwise processed locally. No data stored server-side in this demo. Continue?'
      );
      if (!consent) {
        onClose();
        return;
      }
    }
  }, [firstTimeAssistant, setFirstTimeAssistant, onClose]);

  // Clear chat and reset state when page changes
  useEffect(() => {
    console.log('Page changed, clearing chat for:', page.url);
    setChatMessages([]);
    setQuestion('');
    setRagResult(null);
    setActionsUsed(false);
    setStrategyChangeNotification(null);
  }, [page.url]); // Clear when URL changes



  const handleRAGQuestion = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    // Prevent double submission
    if (isLoading) {
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: question,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await processWithRAG(page.text, question, selectedRAGStrategy || undefined, cloudAI);
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: response.answer,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      setRagResult(response);
      setDeviceInfo(response.deviceInfo);
      
    } catch (error) {
      console.error('RAG processing error:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: 'Sorry, I can\'t process this question at the moment.',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizeAction = async () => {
    if (!page.text) {
      toast.error('No text content available to summarize');
      return;
    }

    setIsLoading(true);
    setActionsUsed(true);

    try {
      const response = await summarizeContent(page.text, cloudAI);
      
      if (response.success) {
        // Add summary to chat messages
        const assistantMessage = {
          id: Date.now().toString(),
          type: 'assistant' as const,
          content: `## Executive Summary\n\n${response.summary}`,
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, assistantMessage]);
        
        toast.success('Summary generated successfully');
      } else {
        throw new Error(response.error || 'Summary generation failed');
      }
    } catch (error) {
      console.error('Summary generation error:', error);
      toast.error('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslateAction = async (language: string) => {
    setIsLoading(true);
    setActionsUsed(true);
    
    try {
      const response = await translateContent(page.text, language, cloudAI);
      
      if (response.success) {
        const assistantMessage = {
          id: Date.now().toString(),
          type: 'assistant' as const,
          content: `## Translation to ${language.toUpperCase()}\n\n${response.translation}`,
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, assistantMessage]);
        
        toast.success('Translation completed successfully');
      } else {
        throw new Error(response.error || 'Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      
      const errorMessage = {
        id: Date.now().toString(),
        type: 'assistant' as const,
        content: 'Sorry, I can\'t translate this content at the moment.',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
      toast.error('Translation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeAction = async () => {
    setIsLoading(true);
    setActionsUsed(true);
    
    try {
      const response = await analyzeForInsights(page.text, cloudAI);
      
      const assistantMessage = {
        id: Date.now().toString(),
        type: 'assistant' as const,
        content: response.insights,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      
      toast.success('Analysis completed');
    } catch (error) {
      console.error('Analysis error:', error);
      
      const errorMessage = {
        id: Date.now().toString(),
        type: 'assistant' as const,
        content: 'Sorry, I can\'t analyze this content at the moment.',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
      toast.error('Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTodosAction = async () => {
    setIsLoading(true);
    setActionsUsed(true);
    
    try {
      const response = await createTodos(page.text, cloudAI);
      
      const assistantMessage = {
        id: Date.now().toString(),
        type: 'assistant' as const,
        content: response.todos,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      
      toast.success('Todo list created');
    } catch (error) {
      console.error('Todo creation error:', error);
      
      const errorMessage = {
        id: Date.now().toString(),
        type: 'assistant' as const,
        content: 'Sorry, I can\'t create todos from this content at the moment.',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
      toast.error('Todo creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeviceInfo = async () => {
    try {
      const device = await detectDevice();
      setDeviceInfo(device.deviceInfo);
    } catch (error) {
      console.error('Device detection error:', error);
    }
  };

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  // Show notification when strategy changes
  useEffect(() => {
    if (selectedRAGStrategy) {
      setStrategyChangeNotification(`Switched to ${selectedRAGStrategy} strategy`);
      const timer = setTimeout(() => {
        setStrategyChangeNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedRAGStrategy]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, isLoading]);

  return (
    <div className="h-full flex flex-col" data-testid="assistant-panel">
      <GlassSurface 
        width="100%" 
        height="100%"
        borderRadius={0}
        backgroundOpacity={0.8}
        brightness={70}
        opacity={0.95}
        blur={15}
        displace={0}
        saturation={1.2}
        distortionScale={-180}
        redOffset={0}
        greenOffset={10}
        blueOffset={20}
        xChannel="R"
        yChannel="G"
        mixBlendMode="difference"
        className="absolute inset-0 border-l border-white/30"
        style={{ backdropFilter: 'blur(15px) saturate(1.2)' }}
      >
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Sparkles size={20} className="text-blue-300" />
                <span>Assistant</span>
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-2 text-sm text-gray-200">
              {cloudAI ? 'Using Cloud AI' : 'Using Local Processing'}
            </div>
          </div>


          {/* Content */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="flex flex-col h-full">
                {/* Chat Settings */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-white">Chat with AI</h3>
                    {selectedRAGStrategy && (
                      <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-200 rounded font-medium backdrop-blur-sm">
                        {selectedRAGStrategy}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowRAGSettings(!showRAGSettings)}
                    className="p-1 hover:bg-white/50 rounded transition-colors"
                    title="Chat Settings"
                  >
                    <Settings size={16} className="text-gray-300" />
                  </button>
                </div>

                {showRAGSettings && (
                  <div className="mb-4 flex-1 overflow-y-auto">
                    <RAGStrategySelector />
                  </div>
                )}

                {/* Chat Actions */}
                {!showRAGSettings && !actionsUsed && (
                  <ChatActions
                    onSummarize={handleSummarizeAction}
                    onTranslate={handleTranslateAction}
                    onAnalyze={handleAnalyzeAction}
                    onCreateTodos={handleCreateTodosAction}
                    isLoading={isLoading}
                  />
                )}

                {/* Chat Messages */}
                {!showRAGSettings && (
                  <div ref={chatMessagesRef} className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
                  {strategyChangeNotification && (
                    <div className="flex justify-center">
                      <div className="px-3 py-2 bg-blue-500/20 text-blue-700 rounded-lg text-sm font-medium backdrop-blur-sm">
                        {strategyChangeNotification}
                      </div>
                    </div>
                  )}
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-300 text-sm py-8">
                      Start a conversation about this page
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-lg text-sm backdrop-blur-sm ${
                            message.type === 'user'
                              ? 'bg-documents-blue text-white'
                              : 'bg-white/80 text-gray-900 border border-white/60'
                          }`}
                        >
                      <div className={`whitespace-pre-wrap ${
                        message.type === 'assistant' ? 'prose prose-sm max-w-none' : ''
                      }`}>
                        {message.type === 'assistant' ? (
                          message.content.split('\n').map((line, index) => {
                            if (line.startsWith('## ')) {
                              return <h2 key={index} className="text-sm font-semibold text-gray-900 mt-2 mb-1">{line.substring(3)}</h2>;
                            } else if (line.startsWith('• ')) {
                              return <div key={index} className="ml-2 mb-1">• {line.substring(2)}</div>;
                            } else if (line.trim() === '') {
                              return <br key={index} />;
                            } else {
                              return <div key={index} className="mb-1">{line}</div>;
                            }
                          })
                        ) : (
                          message.content
                        )}
                      </div>
                        <div className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/80 border border-white/60 px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
                        <div className="flex items-center space-x-2">
                          <Loader2 size={16} className="animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                )}

                {/* Chat Input */}
                {!showRAGSettings && (
                  <div className="flex space-x-2 flex-shrink-0">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleRAGQuestion()}
                    placeholder="Ask anything about this page for comprehensive insights..."
                    className="flex-1 px-3 py-2 bg-white/80 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-documents-blue focus:border-transparent text-sm backdrop-blur-sm text-gray-900 placeholder-gray-600"
                  />
                  <button
                    onClick={handleRAGQuestion}
                    disabled={isLoading || !question.trim()}
                    className="px-4 py-2 bg-documents-blue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageSquare size={16} />
                  </button>
                  </div>
                )}

                {/* RAG Results Info */}
                {!showRAGSettings && ragResult && (
                  <div className="mt-2 p-2 bg-white/60 border border-white/50 rounded-lg flex-shrink-0 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Strategy:</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-800 rounded font-medium">
                          {ragResult.strategy}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <span>Confidence: {Math.round(ragResult.confidence * 100)}%</span>
                        <span>Time: {ragResult.processingTime}ms</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>
      </GlassSurface>
    </div>
  );
}
