# Documents Browser Demo

A Vite + React + TypeScript app that simulates an iOS in-app browser Stage-1 for Documents by Readdle. This demo showcases browser functionality, AI-powered content analysis, smart file management, and comprehensive analytics.

## 🚀 Features

### Browser Panel
- **URL Input & Navigation**: Enter any URL and load page previews with title, hero text, domain, and favicon
- **Reader Mode**: Automatic content extraction using Mozilla Readability via Express proxy
- **Assistant Panel**: Slide-over panel with AI-powered features:
  - **Summarize Page**: Generate 3-5 sentence summaries from extracted text
  - **Ask Questions**: Q&A constrained to page content only
  - **Save Summary**: Export summaries as .txt files to local library
  - **Privacy Toggle**: Switch between Cloud AI and local processing

### Smart Download & Organizer
- **File Upload**: Drag & drop or click to upload multiple files
- **Auto-Rename**: AI-powered filename suggestions with smart heuristics fallback
- **Context Actions**: Toast notifications with Open, Organize, Add Tag, and Play actions
- **Library Management**: Folder organization, tagging, and file previews

### Analytics & Instrumentation
- **Event Logging**: Comprehensive tracking of user interactions
- **Metrics Dashboard**: Real-time KPIs including:
  - Assistant usage rate
  - Auto-rename acceptance rate
  - Organize action rate
  - Assets captured per session
- **Console Logging**: All events visible in browser console

## 🛠️ Tech Stack

### Frontend (Web)
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **IndexedDB** (via idb-keyval) for local storage
- **React Hot Toast** for notifications

### Backend (Server)
- **Express.js** with TypeScript
- **JSDOM** for HTML parsing
- **Mozilla Readability** for content extraction
- **OpenAI API** for AI features (optional)
- **PDF.js** for PDF metadata extraction
- **File-type** for file type detection

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd documents-browser-demo
   pnpm install:all
   ```

2. **Configure environment variables:**
   ```bash
   cp server/env.example server/.env
   # Edit server/.env and add your OpenAI API key (optional)
   ```

3. **Start development servers:**
   ```bash
   pnpm dev
   ```

This will start:
- **Web app**: http://localhost:5173
- **API server**: http://localhost:5174

## 🔧 Configuration

### Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp server/env.example server/.env
   ```

2. **Edit `server/.env` with your settings:**
   ```env
   # Get your API key from: https://platform.openai.com/api-keys
   OPENAI_API_KEY=your_actual_openai_api_key_here  # Optional - enables cloud AI features
   PORT=5174                                       # Server port
   DEBUG=false                                     # Enable debug logging
   ```

3. **Verify security:**
   ```bash
   # Check that .env is properly ignored by git
   git status
   # Should NOT show .env file in changes
   ```

### Privacy Settings

- **Cloud AI ON**: Uses OpenAI API for summarization and Q&A
- **Cloud AI OFF**: Uses local heuristics for processing
- **Incognito Mode**: Disables assistant features entirely

## 🔐 Security

**Important**: This application handles sensitive data. Please review [SECURITY.md](./SECURITY.md) for detailed security guidelines.

### Quick Security Checklist:
- ✅ Never commit API keys to version control
- ✅ Use environment variables for sensitive data
- ✅ Keep your `.env` file private
- ✅ Regularly rotate API keys in production

See [SECURITY.md](./SECURITY.md) for complete security guidelines and incident response procedures.

## 🎯 Demo Script (60 seconds)

### 1. Browser Experience (20s)
1. Open http://localhost:5173
2. Enter a news article URL (e.g., `https://example.com/article`)
3. Click "Go" to load the page preview
4. Notice the extracted title, content, and favicon

### 2. Assistant Features (20s)
1. Click "✨ Assistant" to open the panel
2. Click "Summarize Page" to generate a summary
3. Switch to "Q&A" tab and ask a question about the content
4. Click "Save Summary" to add it to your library

### 3. File Management (20s)
1. Click "📁 Upload Files" and select 2-3 files
2. Notice the auto-rename suggestions with "Undo" option
3. Click "Organize" in the toast to move files to folders
4. Navigate to "Library" to see your organized files

### 4. Analytics (10s)
1. Go to "Metrics" tab
2. View real-time analytics and event logs
3. Check the console for detailed event tracking

## 📁 Project Structure

```
documents-browser-demo/
├── server/                 # Express API server
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   └── index.ts       # Server entry point
│   └── package.json
├── web/                   # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── views/         # Page components
│   │   ├── state/         # Zustand store
│   │   └── lib/           # Utilities and API
│   └── package.json
└── package.json           # Root workspace config
```

## 🔌 API Endpoints

### POST /extract
Extract readable content from a URL
```json
{
  "url": "https://example.com/article"
}
```

### POST /summarize
Generate content summary
```json
{
  "text": "Article content...",
  "cloudAI": true
}
```

### POST /qa
Answer questions about content
```json
{
  "text": "Article content...",
  "question": "What is this about?",
  "cloudAI": true
}
```

## 🎨 UI Components

### Core Components
- **UrlBar**: URL input with Go button
- **PagePreview**: Rendered article content
- **AssistantPanel**: AI features slide-over
- **Uploader**: File upload modal
- **FileCard**: Library file display
- **FolderSidebar**: Navigation and organization

### Views
- **BrowserView**: Main browser interface
- **LibraryView**: File management
- **MetricsView**: Analytics dashboard

## 📊 Analytics Events

The app tracks these events:
- `browser_open` - URL navigation
- `assistant_opened` - Assistant panel usage
- `assistant_summary_req` - Summary generation
- `assistant_qa_req` - Q&A requests
- `assistant_saveSummary` - Summary saving
- `download_start` - File uploads
- `download_rename_suggested` - Auto-rename suggestions
- `download_action_click` - Context actions
- `assistant_error` - Error tracking

## 🔒 Privacy & Security

- **Local Processing**: All file operations happen client-side
- **No Data Storage**: Server doesn't store any user data
- **Optional AI**: Cloud AI can be completely disabled
- **Transparent Logging**: All operations are logged for transparency

## 🚀 Production Deployment

### Build
```bash
pnpm build
```

### Environment Setup
- Set `OPENAI_API_KEY` in production environment
- Configure CORS for your domain
- Set up proper error handling and logging

### Docker (Optional)
```dockerfile
# Add Dockerfile for containerized deployment
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install:all && pnpm build
EXPOSE 5173 5174
CMD ["pnpm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**"Failed to extract page content"**
- Check if the URL is accessible
- Verify CORS settings
- Try a different URL

**"Assistant not working"**
- Check if Cloud AI is enabled
- Verify OpenAI API key is set
- Try local processing mode

**"Files not saving"**
- Check browser storage permissions
- Clear browser data and try again
- Verify IndexedDB is supported

### Debug Mode
Open browser console to see detailed event logs and error messages.

---

**Built with ❤️ for Documents by Readdle**
