import { useState } from 'react';
import { 
  FileText, 
  Image, 
  FileSpreadsheet, 
  Presentation, 
  Type, 
  Merge, 
  Download, 
  Scissors,
  Volume2,
  Music,
  Edit3,
  Lock,
  Highlighter,
  Eye,
  Shield,
  Wifi,
  Cloud,
  Settings,
  Zap,
  Database
} from 'lucide-react';
import { useAppStore } from '../state/store';
import toast from 'react-hot-toast';
import AnimatedContent from './AnimatedContent';

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'pdf' | 'audio' | 'connection' | 'photo' | 'system';
  action: () => void;
}

export function ToolsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { indexAllLibraryFiles } = useAppStore();

  const tools: Tool[] = [
    // PDF Tools
    {
      id: 'image-to-pdf',
      name: 'Image to PDF',
      icon: <Image className="w-6 h-6 text-blue-500" />,
      description: 'Convert images to PDF',
      category: 'pdf',
      action: () => console.log('Image to PDF')
    },
    {
      id: 'spreadsheet-to-pdf',
      name: 'Spreadsheet to PDF',
      icon: <FileSpreadsheet className="w-6 h-6 text-green-500" />,
      description: 'Convert spreadsheets to PDF',
      category: 'pdf',
      action: () => console.log('Spreadsheet to PDF')
    },
    {
      id: 'document-to-pdf',
      name: 'Document to PDF',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      description: 'Convert documents to PDF',
      category: 'pdf',
      action: () => console.log('Document to PDF')
    },
    {
      id: 'presentation-to-pdf',
      name: 'Presentation to PDF',
      icon: <Presentation className="w-6 h-6 text-orange-500" />,
      description: 'Convert presentations to PDF',
      category: 'pdf',
      action: () => console.log('Presentation to PDF')
    },
    {
      id: 'text-to-pdf',
      name: 'Text to PDF',
      icon: <Type className="w-6 h-6 text-gray-500" />,
      description: 'Convert text to PDF',
      category: 'pdf',
      action: () => console.log('Text to PDF')
    },
    {
      id: 'merge-pdf',
      name: 'Merge PDFs',
      icon: <Merge className="w-6 h-6 text-purple-500" />,
      description: 'Merge multiple PDFs',
      category: 'pdf',
      action: () => console.log('Merge PDFs')
    },
    {
      id: 'pdf-to-image',
      name: 'PDF to Image',
      icon: <Download className="w-6 h-6 text-blue-500" />,
      description: 'Convert PDF to images',
      category: 'pdf',
      action: () => console.log('PDF to Image')
    },
    {
      id: 'pdf-to-excel',
      name: 'PDF to Excel',
      icon: <FileSpreadsheet className="w-6 h-6 text-green-500" />,
      description: 'Convert PDF to Excel',
      category: 'pdf',
      action: () => console.log('PDF to Excel')
    },
    {
      id: 'pdf-to-word',
      name: 'PDF to Word',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      description: 'Convert PDF to Word',
      category: 'pdf',
      action: () => console.log('PDF to Word')
    },
    {
      id: 'pdf-to-powerpoint',
      name: 'PDF to PowerPoint',
      icon: <Presentation className="w-6 h-6 text-orange-500" />,
      description: 'Convert PDF to PowerPoint',
      category: 'pdf',
      action: () => console.log('PDF to PowerPoint')
    },
    {
      id: 'pdf-to-text',
      name: 'PDF to Text',
      icon: <Type className="w-6 h-6 text-gray-500" />,
      description: 'Convert PDF to text',
      category: 'pdf',
      action: () => console.log('PDF to Text')
    },
    {
      id: 'manage-pages',
      name: 'Manage Pages',
      icon: <FileText className="w-6 h-6 text-green-500" />,
      description: 'Manage PDF pages',
      category: 'pdf',
      action: () => console.log('Manage Pages')
    },
    {
      id: 'sign-pdf',
      name: 'Sign PDF',
      icon: <Edit3 className="w-6 h-6 text-purple-500" />,
      description: 'Sign PDF documents',
      category: 'pdf',
      action: () => console.log('Sign PDF')
    },
    {
      id: 'reduce-file-size',
      name: 'Reduce File Size',
      icon: <Download className="w-6 h-6 text-red-500" />,
      description: 'Compress PDF files',
      category: 'pdf',
      action: () => console.log('Reduce File Size')
    },
    {
      id: 'edit-pdf',
      name: 'Edit PDF',
      icon: <Edit3 className="w-6 h-6 text-blue-500" />,
      description: 'Edit PDF content',
      category: 'pdf',
      action: () => console.log('Edit PDF')
    },
    {
      id: 'set-password',
      name: 'Set Password',
      icon: <Lock className="w-6 h-6 text-blue-500" />,
      description: 'Password protect PDF',
      category: 'pdf',
      action: () => console.log('Set Password')
    },
    {
      id: 'annotate',
      name: 'Annotate',
      icon: <Highlighter className="w-6 h-6 text-yellow-500" />,
      description: 'Add annotations to PDF',
      category: 'pdf',
      action: () => console.log('Annotate')
    },
    {
      id: 'redact-pdf',
      name: 'Redact PDF',
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      description: 'Remove sensitive information',
      category: 'pdf',
      action: () => console.log('Redact PDF')
    },
    {
      id: 'fill-form',
      name: 'Fill Form',
      icon: <Edit3 className="w-6 h-6 text-purple-500" />,
      description: 'Fill PDF forms',
      category: 'pdf',
      action: () => console.log('Fill Form')
    },
    // Audio Tools
    {
      id: 'trim-track',
      name: 'Trim Track',
      icon: <Scissors className="w-6 h-6 text-blue-500" />,
      description: 'Trim audio tracks',
      category: 'audio',
      action: () => console.log('Trim Track')
    },
    {
      id: 'cut-track',
      name: 'Cut Track',
      icon: <Scissors className="w-6 h-6 text-blue-500" />,
      description: 'Cut audio segments',
      category: 'audio',
      action: () => console.log('Cut Track')
    },
    {
      id: 'remove-silence',
      name: 'Remove Silence',
      icon: <Volume2 className="w-6 h-6 text-red-500" />,
      description: 'Remove silent parts',
      category: 'audio',
      action: () => console.log('Remove Silence')
    },
    {
      id: 'edit-metadata',
      name: 'Edit Metadata',
      icon: <Music className="w-6 h-6 text-pink-500" />,
      description: 'Edit audio metadata',
      category: 'audio',
      action: () => console.log('Edit Metadata')
    },
    // Photo Tools
    {
      id: 'erase-objects',
      name: 'Erase Objects',
      icon: <Edit3 className="w-6 h-6 text-blue-500" />,
      description: 'Remove objects from photos',
      category: 'photo',
      action: () => console.log('Erase Objects')
    },
    {
      id: 'delete-large-videos',
      name: 'Delete Large Videos',
      icon: <Download className="w-6 h-6 text-purple-500" />,
      description: 'Find and delete large videos',
      category: 'photo',
      action: () => console.log('Delete Large Videos')
    },
    {
      id: 'clean-screenshots',
      name: 'Clean Screenshots',
      icon: <Eye className="w-6 h-6 text-blue-500" />,
      description: 'Clean up screenshots',
      category: 'photo',
      action: () => console.log('Clean Screenshots')
    },
    {
      id: 'scan',
      name: 'Scan',
      icon: <FileText className="w-6 h-6 text-green-500" />,
      description: 'Scan documents',
      category: 'photo',
      action: () => console.log('Scan')
    },
    {
      id: 'markup',
      name: 'Markup',
      icon: <Highlighter className="w-6 h-6 text-red-500" />,
      description: 'Markup images',
      category: 'photo',
      action: () => console.log('Markup')
    },
    // Connection Tools
    {
      id: 'connect-computer',
      name: 'Connect to Computer',
      icon: <Wifi className="w-6 h-6 text-blue-500" />,
      description: 'Connect to your computer',
      category: 'connection',
      action: () => console.log('Connect to Computer')
    },
    {
      id: 'add-connection',
      name: 'Add Connection',
      icon: <Cloud className="w-6 h-6 text-blue-500" />,
      description: 'Add cloud connection',
      category: 'connection',
      action: () => console.log('Add Connection')
    },
    // System Tools
    {
      id: 'index-library',
      name: 'Index Library for Search',
      icon: <Database className="w-6 h-6 text-green-500" />,
      description: 'Index all library files for search',
      category: 'system',
      action: async () => {
        try {
          toast.loading('Indexing library files...', { id: 'indexing' });
          const result = await indexAllLibraryFiles();
          toast.success(`Indexed ${result.stats?.successful || 0} files successfully`, { id: 'indexing' });
        } catch (error) {
          console.error('Indexing failed:', error);
          toast.error('Failed to index library files', { id: 'indexing' });
        }
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Tools', icon: <Settings className="w-4 h-4" /> },
    { id: 'pdf', name: 'PDF Tools', icon: <FileText className="w-4 h-4" /> },
    { id: 'audio', name: 'Audio Tools', icon: <Music className="w-4 h-4" /> },
    { id: 'photo', name: 'Photo Tools', icon: <Image className="w-4 h-4" /> },
    { id: 'connection', name: 'Connections', icon: <Wifi className="w-4 h-4" /> },
    { id: 'system', name: 'System Tools', icon: <Database className="w-4 h-4" /> }
  ];

  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto p-6 overflow-x-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Zap className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Tools</h1>
        </div>
        <p className="text-gray-600">Powerful tools for document processing, audio editing, and more</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.icon}
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool, index) => (
          <AnimatedContent
            key={tool.id}
            distance={60}
            direction="vertical"
            reverse={false}
            duration={0.6}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            scale={0.95}
            delay={index * 0.05}
          >
            <div
            onClick={tool.action}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group h-full"
          >
            <div className="flex items-center mb-3">
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                {tool.icon}
              </div>
              <h3 className="ml-3 font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {tool.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600">{tool.description}</p>
          </div>
          </AnimatedContent>
        ))}
      </div>

      {/* Request Tool Section */}
      <div className="mt-12 text-center">
        <AnimatedContent
          distance={80}
          direction="vertical"
          duration={0.8}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          scale={0.98}
        >
          <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Didn't find the tool you need?
          </h3>
          <p className="text-gray-600 mb-4">
            Tell us more about your case so we could better understand your requirements.
          </p>
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Request a Tool
            </button>
          </div>
        </AnimatedContent>
      </div>
    </div>
  );
}
