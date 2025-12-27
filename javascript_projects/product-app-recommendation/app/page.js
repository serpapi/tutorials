'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import LoadingState from '@/components/LoadingState';
import ResultsSection from '@/components/ResultsSection';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
        
        setTimeout(() => {
          const resultsSection = document.getElementById('results');
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        setError(data.error || data.message || 'An error occurred');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch recommendations. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <SearchForm onSearch={handleSearch} isLoading={isLoading} />

      {isLoading && <LoadingState />}

      {error && !isLoading && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {results && !isLoading && (
        <div id="results" className="animate-fade-in">
          <ResultsSection data={results} />
        </div>
      )}
    </div>
  );
}


