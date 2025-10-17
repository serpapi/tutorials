'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import ProductCard from './ProductCard';

/**
 * ResultsSection displays the AI insights, query analysis, and product grid.
 * This is the main results area that shows everything the user gets back.
 */
export default function ResultsSection({ data }) {
  const { analysis, products, recommendations } = data;
  const [sortOrder, setSortOrder] = useState(null); // null, 'asc', 'desc'

  // Parse price string to number for sorting
  const parsePrice = (priceString) => {
    if (!priceString) return 0;
    // Remove currency symbols, commas, and convert to number
    const numericValue = priceString.replace(/[^0-9.]/g, '');
    return parseFloat(numericValue) || 0;
  };

  // Sort products based on current sort order
  const sortedProducts = useMemo(() => {
    if (!sortOrder) return products;

    return [...products].sort((a, b) => {
      const priceA = parsePrice(a.price);
      const priceB = parsePrice(b.price);

      if (sortOrder === 'asc') {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });
  }, [products, sortOrder]);

  // Toggle sort order: null -> asc -> desc -> null
  const handleSortToggle = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-6 h-6 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-yellow-800">No products found</h3>
          </div>
          <p className="text-yellow-700">Try adjusting your search terms or being more specific about what you&apos;re looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
          <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            AI Insights
          </h3>
          
          {recommendations?.insights && (
            <p className="text-gray-700 mb-4">{recommendations.insights}</p>
          )}

          {analysis && (
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                What I understood from your query:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.category && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    🏷️ {analysis.category}
                  </span>
                )}
                {analysis.price_range && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    💵 {analysis.price_range}
                  </span>
                )}
                {analysis.features && Array.isArray(analysis.features) && analysis.features.map((feature, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-6">
          <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Product Recommendations
          </h3>

          {/* Sort Controls - Right Aligned */}
          <div className="flex items-center justify-end gap-3">
            <span className="text-sm font-medium text-gray-600">Sort by price:</span>
            <button
              onClick={handleSortToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                sortOrder
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
              }`}
            >
              <span className="font-medium">
                {sortOrder === 'asc' && 'Low to High'}
                {sortOrder === 'desc' && 'High to Low'}
                {!sortOrder && 'Default'}
              </span>
              <div className="flex flex-col">
                <i className={`fas fa-chevron-up text-xs ${sortOrder === 'asc' ? 'text-purple-600' : 'text-gray-400'}`}></i>
                <i className={`fas fa-chevron-down text-xs ${sortOrder === 'desc' ? 'text-purple-600' : 'text-gray-400'}`}></i>
              </div>
            </button>
            {sortOrder && (
              <button
                onClick={() => setSortOrder(null)}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              index={index}
              recommendations={recommendations}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-8">
            <span>Search results powered by</span>
            <Image
              src="/logos/serpapi-logo.webp"
              alt="SerpApi"
              width={20}
              height={15}
              className="inline-block"
            />
          </div>
      </div>
    </div>
  );
}


