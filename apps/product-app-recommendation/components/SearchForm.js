'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * SearchForm component handles user input and query submission.
 * Features include example queries, loading states, and validation.
 */
export default function SearchForm({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');

  const exampleQueries = [
    'Gaming laptop under $1200',
    'Wireless headphones for running',
    '4K camera for travel vlogging',
    'Standing desk under $500',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      alert('Please enter a search query');
      return;
    }

    onSearch(trimmedQuery);
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          What are you looking for?
        </h2>
        <p className="text-gray-600 mb-6">
          Describe what you need in natural language. Our AI will understand and find the best products for you!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
              placeholder="Example: I need a laptop for video editing under $1500, with good graphics and at least 16GB RAM"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Find Products</span>
              </>
            )}
          </button>
        </form>

        {/* Example query buttons for quick starts */}
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-3">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* SerpApi attribution */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>Real-time product data from</span>
            <Image
              src="/logos/serpapi-logo-combined.png"
              alt="SerpApi"
              width={50}
              height={12}
              className="inline-block opacity-75"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


