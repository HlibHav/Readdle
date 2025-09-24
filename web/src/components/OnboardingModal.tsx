import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, Brain, FileText, BarChart3, Zap, Target, Users } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  highlight?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AI-Powered Document Browser!',
      description: 'Discover intelligent document processing with multi-agent AI',
      icon: <Sparkles className="w-8 h-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Your Intelligent Document Assistant
            </h3>
            <p className="text-gray-600 leading-relaxed">
              This app uses advanced AI agents to analyze, understand, and process documents 
              with unprecedented intelligence. Let's explore the key features together!
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">What makes this special?</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Multi-agent AI system that learns and adapts to provide the best document processing experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'url-processing',
      title: 'Smart URL Processing',
      description: 'Extract and analyze content from any webpage',
      icon: <Target className="w-8 h-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Try it now!</h4>
            <p className="text-green-700 text-sm mb-3">
              Enter any URL in the address bar above to see the AI agents in action.
            </p>
            <div className="bg-white border border-green-300 rounded p-3 text-sm font-mono text-gray-700">
              https://example.com/article
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs font-bold">1</span>
              </div>
              <span className="text-gray-700">AI analyzes the webpage structure</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs font-bold">2</span>
              </div>
              <span className="text-gray-700">Selects optimal processing strategy</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs font-bold">3</span>
              </div>
              <span className="text-gray-700">Extracts and processes content intelligently</span>
            </div>
          </div>
        </div>
      ),
      highlight: '[data-testid="url-bar"]',
      position: 'bottom'
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant Panel',
      description: 'Ask questions and get intelligent answers about your documents',
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Intelligent Q&A</h4>
            <p className="text-purple-700 text-sm mb-3">
              The AI assistant understands your documents and can answer complex questions.
            </p>
            <div className="space-y-2">
              <div className="bg-white border border-purple-300 rounded p-2 text-sm">
                <span className="text-gray-500">You:</span> "What are the main points?"
              </div>
              <div className="bg-white border border-purple-300 rounded p-2 text-sm">
                <span className="text-gray-500">AI:</span> "Based on the document, the main points are..."
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-800 text-sm">Summarize</h5>
              <p className="text-gray-600 text-xs">Get key insights</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-800 text-sm">Translate</h5>
              <p className="text-gray-600 text-xs">Multi-language support</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-800 text-sm">Analyze</h5>
              <p className="text-gray-600 text-xs">Deep content analysis</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-800 text-sm">Generate</h5>
              <p className="text-gray-600 text-xs">Create new content</p>
            </div>
          </div>
        </div>
      ),
      highlight: '[data-testid="assistant-panel"]',
      position: 'left'
    },
    {
      id: 'rag-strategies',
      title: 'Smart RAG Strategies',
      description: 'AI automatically selects the best processing strategy',
      icon: <Zap className="w-8 h-8 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 mb-2">Adaptive Intelligence</h4>
            <p className="text-orange-700 text-sm mb-3">
              The system learns from each interaction to provide better results over time.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">HTML Fast Processing</span>
              </div>
              <span className="text-xs text-gray-500">For simple web pages</span>
            </div>
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">PDF Structured Processing</span>
              </div>
              <span className="text-xs text-gray-500">For complex documents</span>
            </div>
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Mobile Optimized</span>
              </div>
              <span className="text-xs text-gray-500">For mobile devices</span>
            </div>
          </div>
        </div>
      ),
      highlight: '[data-testid="rag-strategy-selector"]',
      position: 'right'
    },
    {
      id: 'library',
      title: 'Smart Document Library',
      description: 'Organize and manage your processed documents',
      icon: <FileText className="w-8 h-8 text-indigo-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-medium text-indigo-900 mb-2">Intelligent Organization</h4>
            <p className="text-indigo-700 text-sm mb-3">
              Documents are automatically categorized and tagged by AI for easy discovery.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h5 className="font-medium text-gray-800 text-sm">Auto-tagging</h5>
              <p className="text-gray-600 text-xs">AI-generated tags</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <h5 className="font-medium text-gray-800 text-sm">Smart folders</h5>
              <p className="text-gray-600 text-xs">Organized by content</p>
            </div>
          </div>
        </div>
      ),
      highlight: '[data-testid="library-view"]',
      position: 'top'
    },
    {
      id: 'analytics',
      title: 'Performance Analytics',
      description: 'Track AI performance and system insights',
      icon: <BarChart3 className="w-8 h-8 text-teal-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <h4 className="font-medium text-teal-900 mb-2">Real-time Insights</h4>
            <p className="text-teal-700 text-sm mb-3">
              Monitor how the AI system learns and improves over time.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
              <span className="text-gray-700 font-medium">Strategy Performance</span>
              <span className="text-sm text-teal-600">85% accuracy</span>
            </div>
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
              <span className="text-gray-700 font-medium">Processing Speed</span>
              <span className="text-sm text-teal-600">1.2s avg</span>
            </div>
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
              <span className="text-gray-700 font-medium">Memory Efficiency</span>
              <span className="text-sm text-teal-600">92% hit rate</span>
            </div>
          </div>
        </div>
      ),
      highlight: '[data-testid="metrics-view"]',
      position: 'top'
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start exploring the intelligent document processing features',
      icon: <Sparkles className="w-8 h-8 text-pink-500" />,
      content: (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Ready to Experience AI-Powered Document Processing!
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            You now know the key features. The AI system will learn from your usage patterns 
            and provide increasingly personalized and efficient document processing.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Pro Tips:</h4>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Try different types of URLs to see various AI strategies</li>
              <li>• Ask the AI assistant complex questions about your documents</li>
              <li>• Check the analytics to see how the system learns</li>
              <li>• The more you use it, the smarter it gets!</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };


  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {currentStepData.icon}
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {currentStepData.title}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {currentStepData.description}
                  </p>
                </div>
              </div>
              <button
                onClick={onComplete}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-blue-100 mb-1">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-blue-300 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div 
              className={`transition-all duration-150 ${
                isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
              }`}
            >
              {currentStepData.content}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-500'
                      : index < currentStep
                      ? 'bg-blue-300'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
