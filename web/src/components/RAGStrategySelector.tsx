import { useState, useEffect } from 'react';
import { Settings, Cpu, Wifi, WifiOff, Smartphone, Monitor, Tablet, Zap } from 'lucide-react';
import { getRAGStrategies, detectDevice, getOpenELMStrategies, getOpenELMStatus } from '../lib/api';
import { useAppStore } from '../state/store';

interface RAGStrategy {
  name: string;
  description: string;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  vectorStore: 'faiss' | 'memory';
  deviceOptimized: boolean;
  maxTokens: number;
  llmProvider?: 'openai' | 'openelm';
  llmModel?: string;
}

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasInternet: boolean;
  processingPower: 'low' | 'medium' | 'high';
  memoryAvailable: number;
  connectionType: string;
  screenSize: {
    width: number;
    height: number;
  };
}

export function RAGStrategySelector() {
  const [strategies, setStrategies] = useState<RAGStrategy[]>([]);
  const [openelmStrategies, setOpenelmStrategies] = useState<RAGStrategy[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [openelmAvailable, setOpenelmAvailable] = useState(false);
  
  const { cloudAI, setCloudAI, selectedRAGStrategy, setSelectedRAGStrategy } = useAppStore();

  useEffect(() => {
    loadData();
  }, []);

  // Sync local state with store when selectedRAGStrategy changes
  useEffect(() => {
    if (selectedRAGStrategy && selectedRAGStrategy !== selectedStrategy) {
      setSelectedStrategy(selectedRAGStrategy);
    }
  }, [selectedRAGStrategy, selectedStrategy]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [strategiesData, deviceData, openelmStatus] = await Promise.all([
        getRAGStrategies(),
        detectDevice(),
        getOpenELMStatus().catch(() => ({ success: false }))
      ]);
      
      setStrategies(strategiesData.strategies);
      setDeviceInfo(deviceData.deviceInfo);
      setOpenelmAvailable(openelmStatus.success && 'data' in openelmStatus && openelmStatus.data?.service?.ready);
      
      // Load OpenELM strategies if available
      if (openelmStatus.success && 'data' in openelmStatus && openelmStatus.data?.service?.ready) {
        try {
          const openelmStrategiesData = await getOpenELMStrategies();
          setOpenelmStrategies(openelmStrategiesData.data.strategies);
        } catch (error) {
          console.warn('Failed to load OpenELM strategies:', error);
        }
      }
      
      // Use stored strategy if available, otherwise use optimal strategy
      const strategyToUse = selectedRAGStrategy || deviceData.optimalStrategy;
      setSelectedStrategy(strategyToUse);
      
      // Update store if no strategy is currently selected
      if (!selectedRAGStrategy) {
        setSelectedRAGStrategy(deviceData.optimalStrategy);
      }
      
    } catch (error) {
      console.error('Error loading RAG data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = () => {
    if (!deviceInfo) return <Monitor size={16} />;
    
    if (deviceInfo.isMobile) return <Smartphone size={16} />;
    if (deviceInfo.isTablet) return <Tablet size={16} />;
    return <Monitor size={16} />;
  };

  const getConnectionIcon = () => {
    if (!deviceInfo) return <Wifi size={16} />;
    
    if (deviceInfo.hasInternet) {
      return deviceInfo.connectionType === 'cellular' ? <Wifi size={16} /> : <Wifi size={16} />;
    }
    return <WifiOff size={16} />;
  };

  const getProcessingIcon = () => {
    if (!deviceInfo) return <Cpu size={16} />;
    
    const color = deviceInfo.processingPower === 'high' ? 'text-green-500' : 
                  deviceInfo.processingPower === 'medium' ? 'text-yellow-500' : 'text-red-500';
    
    return <Cpu size={16} className={color} />;
  };

  const getProviderIcon = (strategy: RAGStrategy) => {
    if (strategy.llmProvider === 'openelm') {
      return <Zap size={14} className="text-orange-500" />;
    }
    return <Cpu size={14} className="text-blue-500" />;
  };

  const getProviderBadge = (strategy: RAGStrategy) => {
    if (strategy.llmProvider === 'openelm') {
      return (
        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
          OpenELM
        </span>
      );
    }
    return null;
  };

  const handleStrategyChange = (strategyName: string) => {
    setSelectedStrategy(strategyName);
    setSelectedRAGStrategy(strategyName);
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Settings size={16} className="animate-spin" />
          <span>Loading RAG strategies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="rag-strategy-selector">
      {/* Device Info */}
      {deviceInfo && (
        <div className="p-4 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm">
          <h3 className="font-medium text-white mb-3 flex items-center space-x-2">
            <Settings size={16} className="text-blue-300" />
            <span>Device & RAG Configuration</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              {getDeviceIcon()}
              <span className="text-gray-200">
                {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {getConnectionIcon()}
              <span className="text-gray-200">
                {deviceInfo.hasInternet ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {getProcessingIcon()}
              <span className="text-gray-200">
                {deviceInfo.processingPower} power
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-200">
                {Math.round(deviceInfo.memoryAvailable / 1024)}GB RAM
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {openelmAvailable ? (
                <>
                  <Zap size={16} className="text-orange-500" />
                  <span className="text-orange-300 text-sm">OpenELM Available</span>
                </>
              ) : (
                <>
                  <Zap size={16} className="text-gray-400" />
                  <span className="text-gray-400 text-sm">OpenELM Unavailable</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Strategy Selection */}
      <div className="space-y-3">
        <h4 className="font-medium text-white">RAG Strategy</h4>
        
        <div className="space-y-2">
          {/* OpenELM Strategies Section */}
          {openelmAvailable && openelmStrategies.length > 0 && (
            <>
              <div className="flex items-center space-x-2 mb-3">
                <Zap size={16} className="text-orange-500" />
                <span className="text-sm font-medium text-orange-300">Apple OpenELM Models</span>
              </div>
              {openelmStrategies.map((strategy) => {
                const isSelected = selectedStrategy === strategy.name;
                const isCurrentlyUsed = selectedRAGStrategy === strategy.name;
                
                return (
                  <label
                    key={strategy.name}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                      isSelected
                        ? 'border-orange-400/50 bg-orange-500/20 shadow-lg ring-2 ring-orange-300/30'
                        : isCurrentlyUsed
                        ? 'border-orange-300/40 bg-orange-500/10 shadow-md'
                        : 'border-white/20 bg-white/5 hover:border-orange-300/40 hover:bg-orange-500/10 hover:shadow-md'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ragStrategy"
                      value={strategy.name}
                      checked={selectedStrategy === strategy.name}
                      onChange={(e) => handleStrategyChange(e.target.value)}
                      className={`mt-1 w-4 h-4 ${
                        isSelected 
                          ? 'text-orange-500 border-orange-500 focus:ring-orange-500' 
                          : 'text-gray-400 border-gray-300 focus:ring-gray-400'
                      }`}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getProviderIcon(strategy)}
                        <span className={`font-medium ${
                          isSelected ? 'text-orange-200' : 'text-white'
                        }`}>
                          {strategy.name}
                        </span>
                        {getProviderBadge(strategy)}
                        {strategy.deviceOptimized && (
                          <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded backdrop-blur-sm">
                            Device Optimized
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-300 mt-1">{strategy.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                        <span>Chunk: {strategy.chunkSize}</span>
                        <span>Model: {strategy.embeddingModel}</span>
                        <span>Store: {strategy.vectorStore}</span>
                        <span>Max: {strategy.maxTokens} tokens</span>
                        {strategy.llmModel && <span>LLM: {strategy.llmModel}</span>}
                      </div>
                    </div>
                  </label>
                );
              })}
              
              {/* Separator */}
              <div className="flex items-center space-x-2 my-3">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="text-xs text-gray-400 px-2">Standard Strategies</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>
            </>
          )}
          
          {/* Standard Strategies */}
          {strategies.map((strategy) => {
            const isSelected = selectedStrategy === strategy.name;
            const isCurrentlyUsed = selectedRAGStrategy === strategy.name;
            
            return (
              <label
                key={strategy.name}
                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                  isSelected
                    ? 'border-blue-400/50 bg-blue-500/20 shadow-lg ring-2 ring-blue-300/30'
                    : isCurrentlyUsed
                    ? 'border-blue-300/40 bg-blue-500/10 shadow-md'
                    : 'border-white/20 bg-white/5 hover:border-blue-300/40 hover:bg-blue-500/10 hover:shadow-md'
                }`}
              >
              <input
                type="radio"
                name="ragStrategy"
                value={strategy.name}
                checked={selectedStrategy === strategy.name}
                onChange={(e) => handleStrategyChange(e.target.value)}
                className={`mt-1 w-4 h-4 ${
                  isSelected 
                    ? 'text-documents-blue border-documents-blue focus:ring-documents-blue' 
                    : 'text-gray-400 border-gray-300 focus:ring-gray-400'
                }`}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  {getProviderIcon(strategy)}
                  <span className={`font-medium ${
                    isSelected ? 'text-blue-200' : 'text-white'
                  }`}>
                    {strategy.name}
                  </span>
                  {getProviderBadge(strategy)}
                  {strategy.deviceOptimized && (
                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded backdrop-blur-sm">
                      Device Optimized
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-300 mt-1">{strategy.description}</p>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                  <span>Chunk: {strategy.chunkSize}</span>
                  <span>Model: {strategy.embeddingModel}</span>
                  <span>Store: {strategy.vectorStore}</span>
                  <span>Max: {strategy.maxTokens} tokens</span>
                  {strategy.llmModel && <span>LLM: {strategy.llmModel}</span>}
                </div>
              </div>
            </label>
            );
          })}
        </div>
      </div>

      {/* Cloud AI Toggle */}
      <div className="flex items-center justify-between p-3 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">Cloud AI</span>
          <span className="text-xs text-gray-300">
            {cloudAI ? 'Enabled' : 'Disabled (Local processing)'}
          </span>
        </div>
        
        <button
          onClick={() => setCloudAI(!cloudAI)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            cloudAI ? 'bg-blue-500' : 'bg-white/20'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              cloudAI ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
