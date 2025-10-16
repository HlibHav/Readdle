import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/store';
import { Settings, Library, Moon, Sun, BookOpen, Search, Sparkles } from 'lucide-react';
import { isUrl, normalizeUrl } from '../lib/urlUtils';
import { PdfDownloadButton } from './PdfDownloadButton';
import { AssistantPanel } from './AssistantPanel';
import GlassSurface from './GlassSurface';
import Prism from './Prism';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [isClosingAssistant, setIsClosingAssistant] = useState(false);
  
  const { 
    cloudAI, 
    incognito, 
    setCloudAI, 
    setIncognito, 
    startOnboarding,
    searchQuery,
    setSearchQuery,
    currentPage
  } = useAppStore();

  const handleCloudAIToggle = () => {
    setCloudAI(!cloudAI);
  };

  const handleIncognitoToggle = () => {
    setIncognito(!incognito);
  };

  const handleStartOnboarding = () => {
    startOnboarding();
  };

  const handleAssistantToggle = () => {
    if (incognito) {
      return;
    }
    setShowAssistant(!showAssistant);
  };

  const handleAssistantClose = () => {
    setIsClosingAssistant(true);
    setTimeout(() => {
      setShowAssistant(false);
      setIsClosingAssistant(false);
    }, 400);
  };





  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.trim();
    
    // In Library view - don't submit, just keep the instant search
    if (location.pathname === '/library') {
      // Search query is already being used for filtering in LibraryView
      return;
    }
    
    // In Browser view - check if it's a URL or search query
    if (isUrl(query)) {
      // Navigate to the URL within the app (Browser view)
      const url = normalizeUrl(query);
      navigate('/', { state: { url: url } });
      setSearchQuery(''); // Clear after navigating
    } else {
      // Perform search within the app (Browser view with search results)
      navigate('/', { state: { search: query } });
      setSearchQuery(''); // Clear after navigating
    }
  };

  const navItems = [
    { path: '/', label: 'Browser', icon: Settings },
    { path: '/library', label: 'Library', icon: Library },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
      {/* Animated Prism Background - Hidden on Library view */}
      {location.pathname !== '/library' && (
        <div className="fixed inset-0 pointer-events-none opacity-100 z-0">
          <Prism noise={0} animationType="hover" />
        </div>
      )}

      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 px-4 py-3 z-50">
        {/* Enhanced backdrop with stronger blur and shadow */}
        <div 
          className="absolute inset-0 shadow-2xl"
          style={{ 
            backdropFilter: 'blur(20px) saturate(1.8) brightness(1.1)',
            background: 'rgba(0, 0, 0, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        />
        <GlassSurface 
          width="100%" 
          height={72}
          borderRadius={8}
          backgroundOpacity={0.6}
          brightness={80}
          opacity={0.9}
          blur={20}
          displace={0}
          saturation={1.5}
          distortionScale={-180}
          redOffset={0}
          greenOffset={10}
          blueOffset={20}
          xChannel="R"
          yChannel="G"
          mixBlendMode="normal"
          className="absolute inset-0 border-b border-white/20"
          style={{ backdropFilter: 'blur(20px) saturate(1.5)' }}
        >
          <div className="flex items-center gap-4 w-full h-full px-4 max-w-7xl mx-auto">
            {/* Logo and Nav Items */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white drop-shadow-lg">
                Readdle
              </h1>
              <div className="flex gap-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all drop-shadow-sm ${
                      location.pathname === path
                        ? 'bg-white/25 text-white shadow-lg border border-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/15 backdrop-blur-sm border border-transparent hover:border-white/10'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Incognito Toggle - Left of Search Bar */}
            <button
              onClick={handleIncognitoToggle}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all backdrop-blur-sm border drop-shadow-sm ${
                incognito
                  ? 'bg-purple-500/25 text-purple-100 border-purple-400/30 shadow-lg'
                  : 'bg-white/15 text-white/80 border-white/25 hover:bg-white/20'
              }`}
              title={incognito ? 'Incognito mode - Assistant disabled' : 'Normal mode'}
            >
              <Moon size={16} />
            </button>

            {/* Unified Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">
              <GlassSurface
                width="100%"
                height={48}
                borderRadius={12}
                backgroundOpacity={0.4}
                brightness={70}
                opacity={0.95}
                blur={25}
                displace={0}
                saturation={1.8}
                distortionScale={-150}
                redOffset={5}
                greenOffset={15}
                blueOffset={25}
                xChannel="R"
                yChannel="G"
                mixBlendMode="normal"
                className={`transition-all border border-white/20 shadow-lg ${
                  isFocused 
                    ? 'ring-2 ring-blue-400/60 shadow-xl' 
                    : 'hover:ring-1 hover:ring-white/30 hover:shadow-xl'
                }`}
                style={{ backdropFilter: 'blur(25px) saturate(1.8) brightness(1.1)' }}
              >
                <div className="flex items-center w-full h-full">
                  <div className="pl-3 pr-2 text-white/60">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={
                      location.pathname === '/library'
                        ? 'Search in library...'
                        : 'Enter URL or search query...'
                    }
                    className="flex-1 py-2 px-2 bg-transparent border-0 outline-none text-white placeholder-white/60 text-sm drop-shadow-sm"
                  />
                </div>
              </GlassSurface>
            </form>
            
            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* PDF Download Button - show when there's a current page */}
              {currentPage && (
                <PdfDownloadButton 
                  url={currentPage.url}
                  title={currentPage.title}
                  content={currentPage.content}
                />
              )}

              {/* Assistant Button - show when there's a current page */}
              {currentPage && (
                <button
                  onClick={handleAssistantToggle}
                  disabled={incognito}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm border drop-shadow-sm ${
                    incognito
                      ? 'bg-gray-100/25 text-gray-300 cursor-not-allowed border-gray-400/25'
                      : showAssistant
                      ? 'bg-purple-500/25 text-purple-100 hover:bg-purple-500/35 border-purple-400/30 shadow-lg'
                      : 'bg-blue-500/25 text-blue-100 border-blue-400/30 hover:bg-blue-500/35'
                  }`}
                  title={incognito ? 'Assistant disabled in incognito mode' : 'Open Assistant'}
                >
                  <Sparkles size={14} />
                  <span className="hidden lg:inline">Assistant</span>
                </button>
              )}

              {/* Onboarding Button */}
              <button
                onClick={handleStartOnboarding}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all bg-blue-500/25 text-blue-100 hover:bg-blue-500/35 backdrop-blur-sm border border-blue-400/30 drop-shadow-sm"
                title="Start onboarding tour"
              >
                <BookOpen size={14} />
                <span className="hidden lg:inline">Tour</span>
              </button>
              
              {/* Privacy Toggle */}
              <button
                onClick={handleCloudAIToggle}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm border drop-shadow-sm ${
                  cloudAI
                    ? 'bg-green-500/25 text-green-100 border-green-400/30 hover:bg-green-500/35'
                    : 'bg-white/15 text-white/80 border-white/25 hover:bg-white/20'
                }`}
                title={cloudAI ? 'Cloud AI enabled' : 'Local processing only'}
              >
                {cloudAI ? <Sun size={14} /> : <Moon size={14} />}
                <span className="hidden lg:inline">{cloudAI ? 'Cloud' : 'Local'}</span>
              </button>
            </div>
          </div>
        </GlassSurface>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative z-10 pt-24">
        <div className="flex overflow-hidden">
          <div 
            className="w-full"
            style={{
              width: showAssistant && currentPage ? 'calc(100% - 22rem)' : '100%',
              marginRight: showAssistant && currentPage ? '1rem' : '0',
              transition: 'width var(--assistant-slide-duration) var(--assistant-slide-easing), margin-right var(--assistant-slide-duration) var(--assistant-slide-easing)',
              transitionTimingFunction: 'var(--assistant-slide-easing)'
            }}
          >
            {children}
          </div>
          {showAssistant && currentPage && (
            <div 
              className="w-80 flex-shrink-0 shadow-2xl rounded-lg overflow-hidden"
              style={{
                animation: isClosingAssistant 
                  ? `slideOutToRight var(--assistant-slide-out-duration) var(--assistant-slide-out-easing) forwards` 
                  : `slideInFromRight var(--assistant-slide-duration) var(--assistant-slide-easing) forwards`,
                animationFillMode: 'forwards',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                position: 'fixed',
                top: '6rem',
                right: '1rem',
                height: 'calc(100vh - 7rem)',
                zIndex: 40
              }}
            >
              <AssistantPanel
                page={currentPage}
                onClose={handleAssistantClose}
              />
            </div>
          )}
        </div>
      </main>

      <style>
        {`
          :root {
            --assistant-slide-duration: 0.6s;
            --assistant-slide-easing: cubic-bezier(0.16, 1, 0.3, 1);
            --assistant-slide-out-duration: 0.4s;
            --assistant-slide-out-easing: cubic-bezier(0.4, 0, 1, 1);
          }
          
          @keyframes slideInFromRight {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideOutToRight {
            0% {
              transform: translateX(0);
              opacity: 1;
            }
            100% {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
