import { NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/recommendation-engine';

/**
 * POST /api/recommend
 * 
 * Main API endpoint for getting product recommendations.
 * This is where the magic happens - users send their query and get back
 * intelligent product recommendations powered by AI.
 * 
 * Request body:
 * {
 *   "query": "laptop for video editing under $1500"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Found 10 products...",
 *   "analysis": { ... },
 *   "products": [ ... ],
 *   "recommendations": { ... }
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid query',
        },
        { status: 400 }
      );
    }

    const result = await getRecommendations(query.trim());

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error('Error in /api/recommend:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}


