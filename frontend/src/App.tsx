import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import TemplatesPage from './pages/TemplatesPage';
import TemplateDetailPage from './pages/TemplateDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import SearchPage from './pages/SearchPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/templates/:id" element={<TemplateDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/search" element={<SearchPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;