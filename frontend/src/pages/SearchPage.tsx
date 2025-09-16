import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Star, Download, Calendar } from 'lucide-react';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    minRating: searchParams.get('minRating') || '0',
    sortBy: searchParams.get('sortBy') || 'relevance'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock search results - in real app, this would come from API
  const allTemplates = [
    {
      id: '1',
      name: 'Brazilian CPF Validator',
      description: 'Validate and format Brazilian CPF documents with comprehensive error handling',
      category: 'Brazilian Utils',
      tags: ['cpf', 'validation', 'brazil', 'document'],
      author: 'Arthur',
      downloads: 1250,
      rating: 4.8,
      createdAt: '2024-01-15',
      preview: 'https://via.placeholder.com/300x200'
    },
    {
      id: '2',
      name: 'PIX Payment Processor',
      description: 'Process PIX payments, generate QR codes, and handle webhooks',
      category: 'Finance',
      tags: ['pix', 'payment', 'qr-code', 'webhook'],
      author: 'Arthur',
      downloads: 890,
      rating: 4.9,
      createdAt: '2024-01-10',
      preview: 'https://via.placeholder.com/300x200'
    },
    {
      id: '3',
      name: 'CNPJ Lookup Service',
      description: 'Look up Brazilian company information by CNPJ with Receita Federal integration',
      category: 'Business',
      tags: ['cnpj', 'company', 'lookup', 'receita-federal'],
      author: 'Arthur',
      downloads: 2100,
      rating: 4.7,
      createdAt: '2024-01-05',
      preview: 'https://via.placeholder.com/300x200'
    },
    {
      id: '4',
      name: 'Email Marketing Automation',
      description: 'Automated email campaigns with segmentation and analytics',
      category: 'Marketing',
      tags: ['email', 'marketing', 'automation', 'segmentation'],
      author: 'Arthur',
      downloads: 750,
      rating: 4.6,
      createdAt: '2024-01-20',
      preview: 'https://via.placeholder.com/300x200'
    },
    {
      id: '5',
      name: 'Data Sync with Google Sheets',
      description: 'Sync data between various sources and Google Sheets with real-time updates',
      category: 'Data Processing',
      tags: ['google-sheets', 'sync', 'data', 'automation'],
      author: 'Arthur',
      downloads: 1500,
      rating: 4.5,
      createdAt: '2024-01-12',
      preview: 'https://via.placeholder.com/300x200'
    },
    {
      id: '6',
      name: 'E-commerce Order Processing',
      description: 'Complete order processing workflow with inventory management',
      category: 'E-commerce',
      tags: ['ecommerce', 'orders', 'inventory', 'processing'],
      author: 'Arthur',
      downloads: 980,
      rating: 4.8,
      createdAt: '2024-01-18',
      preview: 'https://via.placeholder.com/300x200'
    }
  ];

  const categories = ['all', 'Brazilian Utils', 'Finance', 'Business', 'Marketing', 'Data Processing', 'E-commerce'];

  // Filter and search templates
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filters.category === 'all' || template.category === filters.category;
    const matchesRating = template.rating >= parseFloat(filters.minRating);
    
    return matchesSearch && matchesCategory && matchesRating;
  });

  // Sort templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (filters.sortBy) {
      case 'relevance':
        // Simple relevance based on name/description match
        const aRelevance = searchQuery === '' ? 0 : 
          (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 3 : 0) +
          (a.description.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0) +
          (a.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ? 1 : 0);
        const bRelevance = searchQuery === '' ? 0 : 
          (b.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 3 : 0) +
          (b.description.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0) +
          (b.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ? 1 : 0);
        return bRelevance - aRelevance;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams();
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.minRating !== '0') params.set('minRating', filters.minRating);
    if (filters.sortBy !== 'relevance') params.set('sortBy', filters.sortBy);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ category: 'all', minRating: '0', sortBy: 'relevance' });
    setSearchParams({});
  };

  useEffect(() => {
    updateSearchParams();
  }, [filters]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Templates</h1>
        <p className="text-gray-600">Find the perfect n8n template for your workflow</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates, tags, or descriptions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {sortedTemplates.length} template{sortedTemplates.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
          </h2>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-1">
              Showing results for: <span className="font-medium">"{searchQuery}"</span>
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              <img
                src={template.preview}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  {template.category}
                </span>
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm font-medium">{template.rating}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {template.name}
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {template.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{template.tags.length - 3} more
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  {template.downloads.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(template.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link
                  to={`/templates/${template.id}`}
                  className="flex-1 text-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View Details
                </Link>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? `No templates match your search for "${searchQuery}"`
              : 'No templates match your current filters'
            }
          </p>
          <button
            onClick={clearFilters}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
