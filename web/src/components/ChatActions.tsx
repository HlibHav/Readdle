import { useState } from 'react';
import { FileText, Languages, Lightbulb, CheckSquare, ChevronDown } from 'lucide-react';

interface ChatActionsProps {
  onSummarize: () => void;
  onTranslate: (language: string) => void;
  onAnalyze: () => void;
  onCreateTodos: () => void;
  isLoading: boolean;
}

const languages = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'cs', name: 'Czech' },
];

export function ChatActions({ onSummarize, onTranslate, onAnalyze, onCreateTodos, isLoading }: ChatActionsProps) {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const handleLanguageSelect = (languageCode: string) => {
    onTranslate(languageCode);
    setShowLanguageDropdown(false);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Summarize Action */}
      <button
        onClick={onSummarize}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        <FileText size={16} />
        <span>Summarize this page</span>
      </button>

      {/* Translate Action */}
      <div className="relative">
        <button
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <Languages size={16} />
          <span>Translate this page</span>
          <ChevronDown size={14} />
        </button>
        
        {showLanguageDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
              >
                {language.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Analyze Action */}
      <button
        onClick={onAnalyze}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        <Lightbulb size={16} />
        <span>Analyze for insights</span>
      </button>

      {/* Create Todos Action */}
      <button
        onClick={onCreateTodos}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        <CheckSquare size={16} />
        <span>Create todos</span>
      </button>
    </div>
  );
}
