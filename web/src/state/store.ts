import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { seedDemoFiles } from '../lib/seedData';
import { DocumentSearchResult, WebSearchResult, SearchState } from '../lib/types';
import { indexDocument, indexLibraryFiles } from '../lib/api';

export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  tags: string[];
  folder: string;
  addedDate: Date;
  url?: string;
  content?: string;
  blob?: Blob; // For PDF preview
  // AI-related fields
  aiSuggested?: boolean;
  aiRenameAccepted?: boolean;
  summary?: string;
  undoClicked?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
}


export interface PageContent {
  title: string;
  byline: string;
  content: string;
  text: string;
  domain: string;
  favicon?: string;
  url: string;
  images?: Array<{src: string; alt: string; width: number; height: number}>;
}

interface AppState extends SearchState {
  // Settings
  cloudAI: boolean;
  incognito: boolean;
  firstTimeAssistant: boolean;
  
  // Onboarding
  hasSeenOnboarding: boolean;
  isOnboardingActive: boolean;
  currentOnboardingStep: number;
  
  // Current page
  currentPage: PageContent | null;
  isLoading: boolean;
  
  // Search result content display
  
  // RAG Strategy
  selectedRAGStrategy: string | null;
  
  // Library
  files: FileItem[];
  folders: Folder[];
  
  // Actions
  setCloudAI: (enabled: boolean) => void;
  setIncognito: (enabled: boolean) => void;
  setFirstTimeAssistant: (firstTime: boolean) => void;
  setCurrentPage: (page: PageContent | null) => void;
  setLoading: (loading: boolean) => void;
  setSelectedRAGStrategy: (strategy: string | null) => void;
  
  // Onboarding actions
  setHasSeenOnboarding: (seen: boolean) => void;
  setIsOnboardingActive: (active: boolean) => void;
  setCurrentOnboardingStep: (step: number) => void;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  addFile: (file: FileItem) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  deleteFile: (id: string) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  
  // Search actions
  setSearchQuery: (query: string) => void;
  setSearchMode: (mode: 'url' | 'search') => void;
  setDocumentResults: (results: DocumentSearchResult[]) => void;
  setWebResults: (results: WebSearchResult[]) => void;
  setIsSearching: (searching: boolean) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchResults: () => void;
  indexAllLibraryFiles: () => Promise<any>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      cloudAI: true,
      incognito: false,
      firstTimeAssistant: true,
      
      // Onboarding state
      hasSeenOnboarding: false,
      isOnboardingActive: false,
      currentOnboardingStep: 0,
      
      currentPage: null,
      isLoading: false,
      selectedRAGStrategy: null,
      files: seedDemoFiles(),
      folders: [
        { id: 'default', name: 'Downloads', color: '#007AFF' },
        { id: 'documents', name: 'Documents', color: '#34C759' },
        { id: 'images', name: 'Images', color: '#FF9500' },
        { id: 'summaries', name: 'Summaries', color: '#9C27B0' },
      ],
      
      // Search state
      searchQuery: '',
      searchMode: 'url',
      documentResults: [],
      webResults: [],
      isSearching: false,
      searchHistory: [],
      lastSearchTime: 0,

      // Actions
      setCloudAI: (enabled) => set({ cloudAI: enabled }),
      setIncognito: (enabled) => set({ incognito: enabled }),
      setFirstTimeAssistant: (firstTime) => set({ firstTimeAssistant: firstTime }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setLoading: (loading) => set({ isLoading: loading }),
      setSelectedRAGStrategy: (strategy) => set({ selectedRAGStrategy: strategy }),
      
      // Onboarding actions
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
      setIsOnboardingActive: (active) => set({ isOnboardingActive: active }),
      setCurrentOnboardingStep: (step) => set({ currentOnboardingStep: step }),
      startOnboarding: () => set({ isOnboardingActive: true, currentOnboardingStep: 0 }),
      completeOnboarding: () => set({ 
        hasSeenOnboarding: true, 
        isOnboardingActive: false, 
        currentOnboardingStep: 0 
      }),
      resetOnboarding: () => set({ 
        hasSeenOnboarding: false, 
        isOnboardingActive: false, 
        currentOnboardingStep: 0 
      }),
      
      addFile: (file) => set((state) => {
        console.log('📁 Adding file to store:', {
          id: file.id,
          name: file.name,
          type: file.type,
          hasContent: !!file.content,
          contentLength: file.content?.length || 0,
          size: file.size
        });
        
        // Index document for search
        indexDocument(file).catch(error => {
          console.error('Failed to index document:', error);
        });
        
        return { 
          files: [...state.files, file] 
        };
      }),
      
      updateFile: (id, updates) => set((state) => ({
        files: state.files.map(file => 
          file.id === id ? { ...file, ...updates } : file
        )
      })),
      
      deleteFile: (id) => set((state) => {
        // Remove from search index
        import('../lib/api').then(({ removeDocumentFromIndex }) => {
          removeDocumentFromIndex(id).catch(error => {
            console.error('Failed to remove document from search index:', error);
          });
        });
        
        return {
          files: state.files.filter(file => file.id !== id)
        };
      }),
      
      addFolder: (folder) => set((state) => ({
        folders: [...state.folders, folder]
      })),
      
      updateFolder: (id, updates) => set((state) => ({
        folders: state.folders.map(folder =>
          folder.id === id ? { ...folder, ...updates } : folder
        )
      })),
      
      deleteFolder: (id) => set((state) => ({
        folders: state.folders.filter(folder => folder.id !== id)
      })),
      
      // Search actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchMode: (mode) => set({ searchMode: mode }),
      setDocumentResults: (results) => set({ documentResults: results }),
      setWebResults: (results) => set({ webResults: results }),
      setIsSearching: (searching) => set({ isSearching: searching }),
      addToSearchHistory: (query) => set((state) => ({
        searchHistory: [query, ...state.searchHistory.filter(h => h !== query)].slice(0, 10)
      })),
          clearSearchResults: () => set({
            documentResults: [],
            webResults: [],
            isSearching: false
          }),

          // Index all library files for search
          indexAllLibraryFiles: async () => {
            const state = useAppStore.getState();
            try {
              console.log('📚 Indexing all library files for search...');
              const result = await indexLibraryFiles(state.files);
              console.log('✅ Library indexing result:', result);
              return result;
            } catch (error) {
              console.error('❌ Failed to index library files:', error);
              throw error;
            }
          },
    }),
    {
      name: 'documents-browser-storage',
      partialize: (state) => ({
        cloudAI: state.cloudAI,
        incognito: state.incognito,
        firstTimeAssistant: state.firstTimeAssistant,
        selectedRAGStrategy: state.selectedRAGStrategy,
        hasSeenOnboarding: state.hasSeenOnboarding,
        // Exclude PDF content from persistence to avoid localStorage overflow
        files: state.files.map(file => ({
          ...file,
          content: undefined // Remove PDF content from persisted data
        })),
        folders: state.folders,
        // Persist search state
        searchQuery: state.searchQuery,
        searchMode: state.searchMode,
        searchHistory: state.searchHistory,
      }),
    }
  )
);
