import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../state/store';
import { Settings, Library, BarChart3, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { cloudAI, incognito, setCloudAI, setIncognito, logEvent } = useAppStore();

  const handleCloudAIToggle = () => {
    setCloudAI(!cloudAI);
    logEvent('privacy_toggle', { cloudAI: !cloudAI });
  };

  const handleIncognitoToggle = () => {
    setIncognito(!incognito);
    logEvent('incognito_toggle', { incognito: !incognito });
  };

  const navItems = [
    { path: '/', label: 'Browser', icon: Settings },
    { path: '/library', label: 'Library', icon: Library },
    { path: '/metrics', label: 'Metrics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold text-gray-900">
              Documents Browser Demo
            </h1>
            <div className="flex space-x-4">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'bg-documents-blue text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Privacy Toggle */}
            <button
              onClick={handleCloudAIToggle}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                cloudAI
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
              title={cloudAI ? 'Cloud AI enabled' : 'Local processing only'}
            >
              {cloudAI ? <Sun size={16} /> : <Moon size={16} />}
              <span>{cloudAI ? 'Cloud AI' : 'Local'}</span>
            </button>
            
            {/* Incognito Toggle */}
            <button
              onClick={handleIncognitoToggle}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                incognito
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
              title={incognito ? 'Incognito mode - Assistant disabled' : 'Normal mode'}
            >
              <Moon size={16} />
              <span>Incognito</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
