import React from 'react';
import { Link } from 'react-router-dom';

const CategoriesPage: React.FC = () => {
  const categories = [
    {
      id: 'brazilian-utils',
      name: 'Brazilian Utils',
      description: 'Templates for Brazilian-specific operations like CPF, CNPJ, PIX, and government integrations',
      icon: '🇧🇷',
      templateCount: 15,
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Payment processing, financial calculations, and banking integrations',
      icon: '💰',
      templateCount: 8,
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Company data, CRM integrations, and business process automation',
      icon: '🏢',
      templateCount: 12,
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Online store automation, order processing, and inventory management',
      icon: '🛒',
      templateCount: 6,
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Email campaigns, social media automation, and lead generation',
      icon: '📢',
      templateCount: 10,
      color: 'bg-pink-50 border-pink-200 text-pink-800'
    },
    {
      id: 'data-processing',
      name: 'Data Processing',
      description: 'Data transformation, analysis, and reporting workflows',
      icon: '📊',
      templateCount: 7,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    },
    {
      id: 'productivity',
      name: 'Productivity',
      description: 'Task automation, calendar management, and team collaboration',
      icon: '⚡',
      templateCount: 9,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    },
    {
      id: 'integrations',
      name: 'Integrations',
      description: 'Third-party service integrations and API connections',
      icon: '🔗',
      templateCount: 11,
      color: 'bg-gray-50 border-gray-200 text-gray-800'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Categories</h1>
        <p className="text-gray-600">Browse templates by category to find exactly what you need</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/templates?category=${category.name}`}
            className="group block"
          >
            <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{category.icon}</div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                  {category.templateCount} templates
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {category.name}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {category.description}
              </p>
              
              <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700">
                Browse templates
                <svg className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg text-white p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Total Templates Available</h2>
          <div className="text-4xl font-bold mb-2">
            {categories.reduce((sum, cat) => sum + cat.templateCount, 0)}+
          </div>
          <p className="text-primary-100">
            Across {categories.length} categories, with new templates added regularly
          </p>
        </div>
      </div>

      {/* Popular Categories */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Most Popular Categories</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {categories
            .sort((a, b) => b.templateCount - a.templateCount)
            .slice(0, 4)
            .map((category, index) => (
              <div key={category.id} className="flex items-center p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-2xl mr-4">{category.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.templateCount} templates</p>
                </div>
                <div className="text-2xl font-bold text-primary-600">#{index + 1}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
