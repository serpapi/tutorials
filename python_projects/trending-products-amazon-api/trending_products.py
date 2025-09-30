from serpapi import GoogleSearch
import json
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class ProductData:
    """Data class to store product information"""
    position: int
    asin: str
    title: str
    price: Optional[float]
    rating: Optional[float]
    reviews: Optional[int]
    bought_last_month: Optional[str]
    revenue_estimate: Optional[float]
    link: str
    thumbnail: str
    page_found: int  # Track which page the product was found on

class ImprovedSmartHomeTrendingAnalyzer:
    """Improved analyzer for Amazon Smart Home trending products with duplicate handling"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.smart_home_node = "6563140011"  # Smart Home category node ID
        
    def parse_quantity(self, quantity_str: str) -> int:
        """Parse quantity string like '10K+ bought in past month' to integer"""
        if not quantity_str:
            return 0
            
        # Extract number and multiplier
        match = re.search(r'(\d+(?:\.\d+)?)([KMB]?)\+?', quantity_str.upper())
        if not match:
            return 0
            
        number = float(match.group(1))
        multiplier = match.group(2)
        
        if multiplier == 'K':
            return int(number * 1000)
        elif multiplier == 'M':
            return int(number * 1000000)
        elif multiplier == 'B':
            return int(number * 1000000000)
        else:
            return int(number)
    
    def calculate_revenue_estimate(self, price: float, quantity_str: str) -> float:
        """Calculate estimated revenue from price and quantity sold"""
        if not price or not quantity_str:
            return 0.0
            
        quantity = self.parse_quantity(quantity_str)
        return price * quantity
    
    def extract_products_from_results(self, results: Dict[str, Any], page_num: int) -> List[ProductData]:
        """Extract and parse product data from API results"""
        products = []
        
        if "organic_results" not in results:
            return products
            
        for item in results["organic_results"]:
            try:
                # Extract basic information
                position = item.get("position", 0)
                asin = item.get("asin", "")
                title = item.get("title", "")
                link = item.get("link", "")
                thumbnail = item.get("thumbnail", "")
                
                # Extract price
                price = None
                if "extracted_price" in item:
                    price = item["extracted_price"]
                elif "price" in item:
                    # Try to extract price from string like "$19.99"
                    price_match = re.search(r'\$?(\d+(?:\.\d+)?)', str(item["price"]))
                    if price_match:
                        price = float(price_match.group(1))
                
                # Extract rating
                rating = item.get("rating")
                if rating is not None:
                    rating = float(rating)
                
                # Extract review count
                reviews = item.get("reviews")
                if reviews is not None:
                    reviews = int(reviews)
                
                # Extract quantity sold
                bought_last_month = item.get("bought_last_month", "")
                
                # Calculate revenue estimate
                revenue_estimate = self.calculate_revenue_estimate(price, bought_last_month)
                
                product = ProductData(
                    position=position,
                    asin=asin,
                    title=title,
                    price=price,
                    rating=rating,
                    reviews=reviews,
                    bought_last_month=bought_last_month,
                    revenue_estimate=revenue_estimate,
                    link=link,
                    thumbnail=thumbnail,
                    page_found=page_num
                )
                
                products.append(product)
                
            except Exception as e:
                print(f"Error processing product on page {page_num}: {e}")
                continue
                
        return products
    
    def fetch_smart_home_best_sellers(self, pages: int = 3) -> List[ProductData]:
        """Fetch Smart Home best sellers from multiple pages with duplicate handling"""
        all_products = []
        seen_asins = set()
        
        for page in range(1, pages + 1):
            print(f"Fetching page {page}...")
            
            params = {
                "api_key": self.api_key,
                "engine": "amazon",
                "amazon_domain": "amazon.com",
                "language": "en_US",
                "s": "exact-aware-popularity-rank",  # Best Sellers sort
                "node": self.smart_home_node,  # Smart Home category
                "page": page
            }
            
            try:
                search = GoogleSearch(params)
                results = search.get_dict()
                
                if "error" in results:
                    print(f"Error on page {page}: {results['error']}")
                    continue
                
                page_products = self.extract_products_from_results(results, page)
                print(f"Found {len(page_products)} products on page {page}")
                
                # Filter out duplicates and add to main list
                new_products = []
                for product in page_products:
                    if product.asin and product.asin not in seen_asins:
                        seen_asins.add(product.asin)
                        new_products.append(product)
                    elif product.asin in seen_asins:
                        print(f"Duplicate found: {product.asin} on page {page}")
                
                all_products.extend(new_products)
                print(f"Added {len(new_products)} new products from page {page}")
                
            except Exception as e:
                print(f"Error fetching page {page}: {e}")
                continue
        
        return all_products
    
    def rank_by_reviews(self, products: List[ProductData]) -> List[ProductData]:
        """Rank products by number of reviews (descending)"""
        return sorted(products, key=lambda x: x.reviews or 0, reverse=True)
    
    def rank_by_rating(self, products: List[ProductData]) -> List[ProductData]:
        """Rank products by rating (descending)"""
        return sorted(products, key=lambda x: x.rating or 0, reverse=True)
    
    def rank_by_revenue(self, products: List[ProductData]) -> List[ProductData]:
        """Rank products by estimated revenue (descending)"""
        return sorted(products, key=lambda x: x.revenue_estimate or 0, reverse=True)
    
    def rank_by_trending_score(self, products: List[ProductData]) -> List[ProductData]:
        """Rank products by a composite trending score"""
        def calculate_trending_score(product: ProductData) -> float:
            # Normalize and weight different factors
            rating_score = (product.rating or 0) * 20  # 0-100 scale
            review_score = min((product.reviews or 0) / 1000, 100)  # Cap at 100
            revenue_score = min((product.revenue_estimate or 0) / 10000, 100)  # Cap at 100
            
            # Weight the scores (rating 40%, reviews 30%, revenue 30%)
            return (rating_score * 0.4) + (review_score * 0.3) + (revenue_score * 0.3)
        
        return sorted(products, key=calculate_trending_score, reverse=True)
    
    def print_ranking(self, products: List[ProductData], title: str, limit: int = 10):
        """Print a formatted ranking of products"""
        print(f"\n{'='*80}")
        print(f"{title}")
        print(f"{'='*80}")
        
        for i, product in enumerate(products[:limit], 1):
            print(f"\n{i}. {product.title[:60]}...")
            print(f"   ASIN: {product.asin}")
            print(f"   Page: {product.page_found}, Position: {product.position}")
            print(f"   Price: ${product.price:.2f}" if product.price else "   Price: N/A")
            print(f"   Rating: {product.rating:.1f}/5.0" if product.rating else "   Rating: N/A")
            print(f"   Reviews: {product.reviews:,}" if product.reviews else "   Reviews: N/A")
            print(f"   Sold Last Month: {product.bought_last_month}")
            print(f"   Est. Revenue: ${product.revenue_estimate:,.2f}" if product.revenue_estimate else "   Est. Revenue: N/A")
    
    def generate_comprehensive_json(self, products: List[ProductData]) -> Dict[str, Any]:
        """Generate a comprehensive JSON with all product data"""
        
        # Calculate statistics
        total_products = len(products)
        products_with_price = len([p for p in products if p.price])
        products_with_rating = len([p for p in products if p.rating])
        products_with_reviews = len([p for p in products if p.reviews])
        products_with_quantity = len([p for p in products if p.bought_last_month])
        
        avg_price = sum(p.price for p in products if p.price) / products_with_price if products_with_price else 0
        avg_rating = sum(p.rating for p in products if p.rating) / products_with_rating if products_with_rating else 0
        total_revenue = sum(p.revenue_estimate for p in products if p.revenue_estimate)
        
        # Generate rankings
        top_by_reviews = self.rank_by_reviews(products)[:10]
        top_by_rating = self.rank_by_rating(products)[:10]
        top_by_revenue = self.rank_by_revenue(products)[:10]
        top_trending = self.rank_by_trending_score(products)[:10]
        
        # Convert products to dictionaries
        products_data = []
        for product in products:
            product_dict = asdict(product)
            products_data.append(product_dict)
        
        comprehensive_data = {
            "analysis_metadata": {
                "analysis_date": datetime.now().isoformat(),
                "category": "Smart Home Best Sellers",
                "api_parameters": {
                    "engine": "amazon",
                    "amazon_domain": "amazon.com",
                    "language": "en_US",
                    "sort": "exact-aware-popularity-rank",
                    "node": self.smart_home_node,
                    "pages_analyzed": 3
                },
                "total_products_found": total_products,
                "duplicates_removed": True
            },
            "statistics": {
                "products_with_price": products_with_price,
                "products_with_rating": products_with_rating,
                "products_with_reviews": products_with_reviews,
                "products_with_quantity_data": products_with_quantity,
                "average_price": round(avg_price, 2),
                "average_rating": round(avg_rating, 2),
                "total_estimated_revenue": round(total_revenue, 2)
            },
            "rankings": {
                "top_by_reviews": [asdict(p) for p in top_by_reviews],
                "top_by_rating": [asdict(p) for p in top_by_rating],
                "top_by_revenue": [asdict(p) for p in top_by_revenue],
                "top_trending": [asdict(p) for p in top_trending]
            },
            "all_products": products_data
        }
        
        return comprehensive_data
    
    def save_comprehensive_json(self, data: Dict[str, Any], filename: str = None):
        """Save comprehensive analysis to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"smart_home_comprehensive_analysis_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"\nComprehensive analysis saved to: {filename}")
        return filename

def main():
    """Main function to run the improved Smart Home trending analysis"""
    # Your API key
    api_key = "your-api-key"
    
    print("Improved Smart Home Trending Products Analyzer")
    print("=" * 60)
    
    # Initialize analyzer
    analyzer = ImprovedSmartHomeTrendingAnalyzer(api_key)
    
    try:
        # Fetch products from multiple pages with duplicate handling
        print("Fetching Smart Home best sellers with duplicate detection...")
        products = analyzer.fetch_smart_home_best_sellers(pages=3)
        
        if not products:
            print("No products found. Please check your API key and try again.")
            return
        
        print(f"\n Successfully fetched {len(products)} unique products")
        
        # Generate comprehensive JSON
        print("\n Generating comprehensive JSON analysis...")
        comprehensive_data = analyzer.generate_comprehensive_json(products)
        
        # Save comprehensive JSON
        json_file = analyzer.save_comprehensive_json(comprehensive_data)
        
        # Print summary
        print(f"\n ANALYSIS SUMMARY")
        print(f"{'='*50}")
        print(f"Total Unique Products: {comprehensive_data['analysis_metadata']['total_products_found']}")
        print(f"Average Price: ${comprehensive_data['statistics']['average_price']}")
        print(f"Average Rating: {comprehensive_data['statistics']['average_rating']}/5.0")
        print(f"Total Estimated Revenue: ${comprehensive_data['statistics']['total_estimated_revenue']:,.2f}")
        print(f"Comprehensive JSON saved to: {json_file}")
        
        # Show top 5 from each ranking
        print(f"\n🔥 TOP 5 BY REVIEWS:")
        top_reviews = analyzer.rank_by_reviews(products)
        for i, p in enumerate(top_reviews[:5], 1):
            print(f"{i}. {p.title[:50]}... - {p.reviews:,} reviews")
        
        print(f"\n💰 TOP 5 BY REVENUE:")
        top_revenue = analyzer.rank_by_revenue(products)
        for i, p in enumerate(top_revenue[:5], 1):
            print(f"{i}. {p.title[:50]}... - ${p.revenue_estimate:,.2f}")
        
    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")
        print("Please check your API key and internet connection.")

if __name__ == "__main__":
    main()