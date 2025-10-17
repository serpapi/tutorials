import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes a user's natural language query to extract structured product search criteria.
 */
export async function analyzeUserQuery(userQuery) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a product search assistant. Analyze the user's query and extract structured information.

Return ONLY a valid JSON object (no markdown, no explanation) with these exact keys:
{
  "category": "main product type",
  "features": ["key feature 1", "key feature 2"],
  "price_range": "price constraint if mentioned or null",
  "use_case": "purpose or use case",
  "search_keywords": "optimized keywords for search"
}

Example for "standing desk under $500":
{"category":"standing desk","features":["adjustable","office furniture"],"price_range":"under $500","use_case":"office work","search_keywords":"standing desk adjustable under 500"}`,
        },
        {
          role: 'user',
          content: userQuery,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content.trim();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    } else {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
    }
    
    const result = JSON.parse(jsonStr);
    
    // Ensure all required fields exist
    return {
      category: result.category || 'product',
      features: Array.isArray(result.features) ? result.features : [],
      price_range: result.price_range || null,
      use_case: result.use_case || userQuery,
      search_keywords: result.search_keywords || userQuery,
    };
  } catch (error) {
    console.error('Error analyzing user query:', error.message);
    
    // Smarter fallback - extract basic info from query
    const words = userQuery.toLowerCase().split(/\s+/);
    const priceMatch = userQuery.match(/\$\s*\d+|under\s+\$?\s*\d+|\d+\s+dollars?/i);
    
    // Try to identify product category (first meaningful noun)
    const stopWords = ['i', 'need', 'want', 'looking', 'for', 'a', 'an', 'the', 'under'];
    const category = words.find(w => w.length > 3 && !stopWords.includes(w)) || 'product';
    
    return {
      category,
      features: words.filter(w => w.length > 4 && !stopWords.includes(w)).slice(0, 3),
      price_range: priceMatch ? priceMatch[0] : null,
      use_case: userQuery,
      search_keywords: userQuery,
    };
  }
}

/**
 * Uses AI to rank products and provide intelligent recommendations.
 */
export async function generateRecommendations(userQuery, products) {
  try {
    const productsSummary = products.map((product, index) => ({
      id: index,
      platform: product.platform,
      title: product.title,
      price: product.price,
      rating: product.rating,
      reviews: product.reviews,
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a product recommendation expert. Analyze products and provide helpful insights.

Return ONLY a valid JSON object (no markdown, no explanation) with:
{
  "top_recommendations": [{"id": 0, "reason": "why this product is good"}, ...],
  "insights": "2-3 sentence summary about the products",
  "value_assessment": {"best_value_id": 0, "premium_id": 1, "budget_id": 2}
}

Focus on matching the user's needs and being specific about why products are recommended.`,
        },
        {
          role: 'user',
          content: `User query: "${userQuery}"

Products available:
${JSON.stringify(productsSummary, null, 2)}

Provide top 3 recommendations with reasons, overall insights, and value assessment.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content.trim();
    
    // Extract JSON from response
    let jsonStr = content;
    const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    } else {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating recommendations:', error.message);
    
    // Enhanced fallback with actual analysis
    const sortedByRating = [...products]
      .map((p, i) => ({ ...p, originalIndex: i }))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    const avgPrice = products.reduce((sum, p) => {
      const price = parseFloat(p.price?.replace(/[^0-9.]/g, '') || 0);
      return sum + price;
    }, 0) / products.length;
    
    return {
      top_recommendations: sortedByRating.slice(0, 3).map((p) => ({
        id: p.originalIndex,
        reason: p.rating 
          ? `Highly rated (${p.rating}⭐) ${p.platform} option with ${p.reviews || 'many'} reviews` 
          : `Popular choice from ${p.platform}`,
      })),
      insights: `Found ${products.length} options across Google Shopping and Amazon. ${sortedByRating[0]?.rating ? `Top-rated products have ${sortedByRating[0].rating}⭐ ratings.` : 'Products vary in price and features.'} Average price is around $${avgPrice.toFixed(0)}.`,
      value_assessment: {
        best_value_id: Math.floor(products.length / 2),
        premium_id: sortedByRating[0]?.originalIndex || 0,
        budget_id: sortedByRating[sortedByRating.length - 1]?.originalIndex || products.length - 1,
      },
    };
  }
}
