import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Star, Calendar, User, Tag, ExternalLink } from 'lucide-react';

const TemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock data - in real app, this would come from API
  const template = {
    id: id || '1',
    name: 'Brazilian CPF Validator',
    description: 'A comprehensive n8n workflow for validating and formatting Brazilian CPF documents. This template includes error handling, formatting options, and integration with Brazilian government APIs.',
    category: 'Brazilian Utils',
    tags: ['cpf', 'validation', 'brazil', 'document', 'api', 'government'],
    author: 'Arthur',
    version: '1.2.0',
    downloads: 1250,
    rating: 4.8,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    workflow: {
      nodes: 8,
      connections: 12
    },
    requirements: [
      'n8n version 1.0.0 or higher',
      'Internet connection for API calls',
      'Brazilian CPF format knowledge'
    ],
    documentation: 'https://docs.example.com/cpf-validator',
    preview: 'https://via.placeholder.com/800x400'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        to="/templates"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Templates
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                {template.category}
              </span>
              <span className="text-sm text-gray-500">v{template.version}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {template.name}
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              {template.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {template.author}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Updated {new Date(template.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-1" />
                {template.downloads.toLocaleString()} downloads
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                {template.rating} rating
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-4">
              <button className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
                <Download className="h-5 w-5 mr-2" />
                Download Template
              </button>
              <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                <ExternalLink className="h-5 w-5 mr-2" />
                View Documentation
              </button>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={template.preview}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Details */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflow Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Nodes:</span>
              <span className="font-medium">{template.workflow.nodes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Connections:</span>
              <span className="font-medium">{template.workflow.connections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Complexity:</span>
              <span className="font-medium text-green-600">Beginner</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
          <ul className="space-y-2">
            {template.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-gray-600">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Workflow Preview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflow Preview</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="aspect-video bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">Workflow diagram would be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Templates */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Templates</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { id: '2', name: 'PIX Payment Processor', category: 'Finance' },
            { id: '3', name: 'CNPJ Lookup Service', category: 'Business' },
            { id: '4', name: 'Email Marketing Automation', category: 'Marketing' }
          ].map((related) => (
            <Link
              key={related.id}
              to={`/templates/${related.id}`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <h3 className="font-medium text-gray-900 mb-1">{related.name}</h3>
              <p className="text-sm text-gray-600">{related.category}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailPage;
