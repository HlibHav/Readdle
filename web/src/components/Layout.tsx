import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/store';
import { Settings, Library, Moon, Sun, BookOpen, Search } from 'lucide-react';
import GlassSurface from './GlassSurface';
import Prism from './Prism';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  
  const { 
    cloudAI, 
    incognito, 
    setCloudAI, 
    setIncognito, 
    startOnboarding,
    searchQuery,
    setSearchQuery
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

  // Live document search when typing (only in Library view)
  useEffect(() => {
    if (location.pathname === '/library' && searchQuery) {
      // The search is already handled by the store and LibraryView will react to it
      // This effect ensures the search query is updated in real-time
    }
  }, [searchQuery, location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.trim();
    
    // Check if it's a URL
    const isUrl = /^https?:\/\/.+/.test(query) || /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(query);
    
    if (isUrl) {
      // Navigate to the URL within the app (Browser view)
      const url = query.startsWith('http') ? query : `https://${query}`;
      navigate('/', { state: { url: url } });
    } else {
      // Perform search within the app (Browser view with search results)
      navigate('/', { state: { search: query } });
    }
    
    setSearchQuery(''); // Clear the search input
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
      <nav className="relative px-4 py-3 z-10">
        <GlassSurface 
          width="100%" 
          height={72}
          borderRadius={8}
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
          className="absolute inset-0 border-b border-white/30"
          style={{ backdropFilter: 'blur(15px) saturate(1.2)' }}
        >
          <div className="flex items-center gap-4 w-full h-full px-4 max-w-7xl mx-auto">
            {/* Logo and Nav Items */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white">
                Readdle
              </h1>
              <div className="flex gap-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      location.pathname === path
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Unified Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">
              <GlassSurface
                width="100%"
                height={48}
                borderRadius={12}
                backgroundOpacity={0.3}
                brightness={60}
                opacity={0.9}
                blur={20}
                displace={0}
                saturation={1.5}
                distortionScale={-150}
                redOffset={5}
                greenOffset={15}
                blueOffset={25}
                xChannel="R"
                yChannel="G"
                mixBlendMode="screen"
                className={`transition-all ${
                  isFocused 
                    ? 'ring-2 ring-blue-400/50' 
                    : 'hover:ring-1 hover:ring-white/20'
                }`}
                style={{ backdropFilter: 'blur(20px) saturate(1.5)' }}
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
                    placeholder="Search documents or enter URL..."
                    className="flex-1 py-2 px-2 bg-transparent border-0 outline-none text-white placeholder-white/50 text-sm"
                  />
                </div>
              </GlassSurface>
            </form>
            
            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Onboarding Button */}
              <button
                onClick={handleStartOnboarding}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 backdrop-blur-sm border border-blue-400/20"
                title="Start onboarding tour"
              >
                <BookOpen size={14} />
                <span className="hidden lg:inline">Tour</span>
              </button>
              
              {/* Privacy Toggle */}
              <button
                onClick={handleCloudAIToggle}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm border ${
                  cloudAI
                    ? 'bg-green-500/20 text-green-200 border-green-400/20 hover:bg-green-500/30'
                    : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/15'
                }`}
                title={cloudAI ? 'Cloud AI enabled' : 'Local processing only'}
              >
                {cloudAI ? <Sun size={14} /> : <Moon size={14} />}
                <span className="hidden lg:inline">{cloudAI ? 'Cloud' : 'Local'}</span>
              </button>
              
              {/* Incognito Toggle */}
              <button
                onClick={handleIncognitoToggle}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm border ${
                  incognito
                    ? 'bg-purple-500/20 text-purple-200 border-purple-400/20 shadow-lg'
                    : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/15'
                }`}
                title={incognito ? 'Incognito mode - Assistant disabled' : 'Normal mode'}
              >
                <Moon size={14} />
                <span className="hidden lg:inline">Incognito</span>
              </button>
            </div>
          </div>
        </GlassSurface>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}
