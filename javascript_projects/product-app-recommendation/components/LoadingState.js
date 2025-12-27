import Image from 'next/image';

export default function LoadingState() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-600 mx-auto mb-4"></div>
        </div>
        <p className="text-lg font-semibold text-gray-700">Analyzing your query...</p>
        <p className="text-sm text-gray-500 mt-2">Searching across multiple platforms</p>
        
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>Fetching live data via</span>
            <Image
              src="/logos/serpapi-logo.webp"
              alt="SerpApi"
              width={55}
              height={14}
              className="inline-block opacity-60"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


