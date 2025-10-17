import { getJson } from 'serpapi';

// Wrapper to convert SerpApi callback to Promise for Google Shopping
export async function searchGoogleShopping(query, numResults = 5) {
  try {
    const results = await new Promise((resolve, reject) => {
      getJson(
        {
          engine: 'google_shopping',
          q: query,
          api_key: process.env.SERPAPI_KEY,
          google_domain: 'google.com',
          hl: 'en',
          gl: 'us',
          num: String(numResults),
        },
        (json) => (json.error ? reject(new Error(json.error)) : resolve(json))
      );
    });

    const products = [];

    if (results.shopping_results) {
      for (const item of results.shopping_results.slice(0, numResults)) {
        // Link can be in multiple fields depending on the result
        const link = item.link || item.product_link || item.url || item.source_link || '';

        products.push({
          platform: 'Google Shopping',
          title: item.title || '',
          price: item.price || '',
          rating: item.rating || null,
          reviews: item.reviews || 0,
          link,
          thumbnail: item.thumbnail || '',
          source: item.source || '',
          delivery: item.delivery || '',
        });
      }
    }

    return products;
  } catch (error) {
    console.error('Error searching Google Shopping:', error);
    return [];
  }
}

// Amazon search with SerpApi
export async function searchAmazon(query, numResults = 5) {
  try {
    const results = await new Promise((resolve, reject) => {
      getJson(
        {
          engine: 'amazon',
          k: query,
          api_key: process.env.SERPAPI_KEY,
          amazon_domain: 'amazon.com',
        },
        (json) => (json.error ? reject(new Error(json.error)) : resolve(json))
      );
    });

    const products = [];

    if (results.organic_results) {
      for (const item of results.organic_results.slice(0, numResults)) {
        // Handle both string and object price formats
        let price = '';
        if (item.price) {
          price = typeof item.price === 'object'
            ? (item.price.raw || item.price.extracted || '')
            : String(item.price);
        }

        products.push({
          platform: 'Amazon',
          title: item.title || '',
          price,
          rating: item.rating || null,
          reviews: item.ratings_total || item.reviews || 0,
          link: item.link || '',
          thumbnail: item.thumbnail || '',
          source: 'Amazon',
        });
      }
    }

    return products;
  } catch (error) {
    console.error('Error searching Amazon:', error);
    return [];
  }
}

// Search both platforms in parallel and combine results
export async function searchAllPlatforms(query, resultsPerPlatform = 5) {
  const [googleProducts, amazonProducts] = await Promise.all([
    searchGoogleShopping(query, resultsPerPlatform),
    searchAmazon(query, resultsPerPlatform),
  ]);

  return [...googleProducts, ...amazonProducts];
}


