import { ArrowRight, Download, Star, Users, Zap } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const featuredTemplates = [
    {
      id: '1',
      name: 'Brazilian CPF Validator',
      description: 'Validate and format Brazilian CPF documents with n8n',
      category: 'Brazilian Utils',
      downloads: 1250,
      rating: 4.8,
    },
    {
      id: '2',
      name: 'PIX Payment Processor',
      description: 'Process PIX payments and generate QR codes',
      category: 'Finance',
      downloads: 890,
      rating: 4.9,
    },
    {
      id: '3',
      name: 'CNPJ Lookup Service',
      description: 'Look up Brazilian company information by CNPJ',
      category: 'Business',
      downloads: 2100,
      rating: 4.7,
    },
  ];

  const categories = [
    { name: 'Brazilian Utils', count: 15, icon: '🇧🇷' },
    { name: 'Finance', count: 8, icon: '💰' },
    { name: 'Business', count: 12, icon: '🏢' },
    { name: 'E-commerce', count: 6, icon: '🛒' },
    { name: 'Marketing', count: 10, icon: '📢' },
    { name: 'Data Processing', count: 7, icon: '📊' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          n8n Marketplace
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Discover and share powerful n8n workflow templates. From Brazilian utilities to 
          complex business automations, find the perfect template for your needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/templates"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse Templates
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            to="/categories"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Categories
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white rounded-lg shadow-sm p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
            <div className="text-gray-600">Templates</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
            <div className="text-gray-600">Downloads</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">25+</div>
            <div className="text-gray-600">Contributors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">4.8</div>
            <div className="text-gray-600">Avg Rating</div>
          </div>
        </div>
      </section>

      {/* Featured Templates */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Templates</h2>
          <Link
            to="/templates"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
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
                <p className="text-gray-600 mb-4">{template.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    {template.downloads.toLocaleString()}
                  </div>
                  <Link
                    to={`/templates/${template.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{category.icon}</div>
              <div className="font-medium text-gray-900 mb-1">{category.name}</div>
              <div className="text-sm text-gray-500">{category.count} templates</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 rounded-lg text-white p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Join thousands of developers who are already using n8n templates to 
          automate their workflows and boost productivity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/templates"
            className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Zap className="mr-2 h-5 w-5" />
            Start Browsing
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center px-6 py-3 border border-primary-300 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Users className="mr-2 h-5 w-5" />
            Join Community
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
