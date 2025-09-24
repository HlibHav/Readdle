import { Routes, Route } from 'react-router-dom';
import { useAppStore } from './state/store';
import { BrowserView } from './views/BrowserView';
import { LibraryView } from './views/LibraryView';
import { MetricsView } from './views/MetricsView';
import { Layout } from './components/Layout';
import { useEffect } from 'react';

function App() {
  const { logEvent } = useAppStore();

  useEffect(() => {
    // Log app initialization
    logEvent('app_initialized');
  }, [logEvent]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<BrowserView />} />
        <Route path="/library" element={<LibraryView />} />
        <Route path="/metrics" element={<MetricsView />} />
      </Routes>
    </Layout>
  );
}

export default App;
