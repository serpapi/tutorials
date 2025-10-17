import { analyzeUserQuery, generateRecommendations } from './openai';
import { searchAllPlatforms } from './serpapi';

// Main orchestration: analyze query -> search platforms -> generate AI recommendations
export async function getRecommendations(userQuery) {
  try {
    const analysis = await analyzeUserQuery(userQuery);
    const searchKeywords = analysis.search_keywords || userQuery;

    const allProducts = await searchAllPlatforms(searchKeywords, 5);

    if (allProducts.length === 0) {
      return {
        success: false,
        message: 'No products found for your query. Please try different keywords.',
        analysis,
        products: [],
        recommendations: null,
      };
    }

    const recommendations = await generateRecommendations(userQuery, allProducts);

    return {
      success: true,
      message: `Found ${allProducts.length} products across Google Shopping and Amazon`,
      analysis,
      products: allProducts,
      recommendations,
    };
  } catch (error) {
    console.error('Error in recommendation engine:', error);
    return {
      success: false,
      message: 'An error occurred while processing your request.',
      error: error.message,
      analysis: null,
      products: [],
      recommendations: null,
    };
  }
}


