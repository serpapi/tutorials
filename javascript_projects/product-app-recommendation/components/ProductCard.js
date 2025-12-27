import Image from 'next/image';

/**
 * ProductCard component displays a single product with all its details,
 * badges for recommendations, and a call-to-action button.
 * 
 * This component handles different badge types (recommended, best value, premium, budget)
 * and displays product information in a clean, card-based layout.
 */
export default function ProductCard({ product, index, recommendations }) {
  const topRecs = recommendations?.top_recommendations || [];
  const isRecommended = topRecs.some((rec) => rec.id === index);
  const isBestValue = recommendations?.value_assessment?.best_value_id === index;
  const isPremium = recommendations?.value_assessment?.premium_id === index;
  const isBudget = recommendations?.value_assessment?.budget_id === index;

  const recommendationReason = isRecommended
    ? topRecs.find((rec) => rec.id === index)?.reason
    : null;

  // Platform-specific badge colors
  const platformClass = product.platform.includes('Amazon') 
    ? 'bg-orange-500' 
    : 'bg-blue-500';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-48 bg-gray-200">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <span className={`${platformClass} text-white px-3 py-1 rounded-full text-xs font-bold uppercase`}>
            {product.platform}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3 flex flex-wrap gap-2">
          {isRecommended && (
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              ⭐ AI Recommended
            </span>
          )}
          {isBestValue && (
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              👍 Best Value
            </span>
          )}
          {isPremium && (
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              👑 Premium
            </span>
          )}
          {isBudget && (
            <span className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              🐷 Budget
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
          {product.title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-purple-600">
            {product.price || 'N/A'}
          </span>
          {product.rating && (
            <div className="flex items-center text-sm">
              <span className="text-yellow-400 mr-1">★</span>
              <span className="font-semibold">{product.rating}</span>
              {product.reviews > 0 && (
                <span className="text-gray-500 ml-1">({product.reviews})</span>
              )}
            </div>
          )}
        </div>

        {product.delivery && (
          <p className="text-xs text-gray-600 mb-3">
            🚚 {product.delivery}
          </p>
        )}

        {recommendationReason && (
          <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-2 border-purple-500 mb-3">
            <p className="text-xs text-purple-800">
              <strong>Why we recommend this:</strong> {recommendationReason}
            </p>
          </div>
        )}

        {/* View Product Button - pushed to bottom with flex-grow above */}
        <a
          href={product.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto block w-full text-center bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition duration-300"
          onClick={(e) => {
            if (!product.link) {
              e.preventDefault();
              alert('Product link not available');
            }
          }}
        >
          View Product
          <span className="ml-2">→</span>
        </a>
      </div>
    </div>
  );
}


