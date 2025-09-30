# Amazon Trending Products Analyzer

An advanced Python tool that analyzes trending products in Amazon's Smart Home category using the SerpApi Amazon Search API. This analyzer fetches best-selling products, ranks them by multiple metrics, calculates revenue estimates, and generates comprehensive market insights—perfect for market research, product discovery, and competitive analysis.

## Features

- **Multi-Page Data Collection**: Fetches products from multiple Amazon result pages
- **Smart Duplicate Detection**: Automatically filters duplicate products using ASIN tracking
- **Multiple Ranking Systems**: Ranks products by reviews, ratings, revenue, and custom trending scores
- **Revenue Estimation**: Calculates estimated monthly revenue based on price and sales data
- **Comprehensive Analytics**: Generates detailed statistics and market insights
- **Timestamped JSON Reports**: Saves complete analysis with metadata to timestamped JSON files
- **Category-Specific Analysis**: Pre-configured for Smart Home products (customizable to any category)
- **Formatted Console Output**: Displays top products and rankings in an easy-to-read format

## What Gets Analyzed

- Product titles and ASINs
- Product prices
- Customer ratings (out of 5 stars)
- Number of reviews
- Monthly sales figures ("bought last month" data)
- Estimated revenue per product
- Product links and thumbnails
- Page position and ranking

## Ranking Methodologies

1. **By Reviews**: Products with the most customer reviews
2. **By Rating**: Highest-rated products (best customer satisfaction)
3. **By Revenue**: Estimated monthly revenue (price × quantity sold)
4. **By Trending Score**: Composite score weighing rating (40%), reviews (30%), and revenue (30%)

## Requirements

- Python 3.7+
- google-search-results (SerpApi Python client)
- SerpApi API key ([Get one here](https://serpapi.com/))

## Installation

1. Clone or download this repository
2. Install required dependencies:

```bash
pip install google-search-results
```

3. Get your SerpApi API key from [https://serpapi.com/](https://serpapi.com/)

## Usage

1. Open `trending_products.py`
2. Replace `"your-api-key"` with your actual SerpApi API key:
   ```python
   api_key = "your-actual-serpapi-key"
   ```
3. (Optional) Customize the number of pages to analyze in the `main()` function:
   ```python
   products = analyzer.fetch_smart_home_best_sellers(pages=3)  # Change pages as needed
   ```
4. Run the script:
   ```bash
   python trending_products.py
   ```

## How It Works

1. **Initialization**: Sets up the analyzer with your API key and Smart Home category node ID
2. **Multi-Page Fetching**: Retrieves best-seller data from 3 pages (configurable) of Amazon results
3. **Duplicate Filtering**: Tracks ASINs to ensure each product is counted only once
4. **Data Extraction**: Parses product information including prices, ratings, reviews, and sales data
5. **Revenue Calculation**: Estimates monthly revenue by multiplying price by quantity sold
6. **Ranking Generation**: Creates four different ranking systems for comprehensive analysis
7. **Statistics Compilation**: Calculates averages, totals, and data completeness metrics
8. **JSON Export**: Saves comprehensive analysis to a timestamped JSON file
9. **Console Summary**: Displays key findings and top products in the terminal

## Output Format

The script generates a comprehensive JSON file (`smart_home_comprehensive_analysis_YYYYMMDD_HHMMSS.json`) with the following structure:

```json
{
  "analysis_metadata": {
    "analysis_date": "2025-09-30T10:30:00",
    "category": "Smart Home Best Sellers",
    "api_parameters": { ... },
    "total_products_found": 60,
    "duplicates_removed": true
  },
  "statistics": {
    "products_with_price": 58,
    "average_price": 45.99,
    "average_rating": 4.3,
    "total_estimated_revenue": 2500000.00
  },
  "rankings": {
    "top_by_reviews": [ ... ],
    "top_by_rating": [ ... ],
    "top_by_revenue": [ ... ],
    "top_trending": [ ... ]
  },
  "all_products": [ ... ]
}
```

Each product entry includes:
```json
{
  "position": 1,
  "asin": "B08KRV7S1T",
  "title": "Product Name",
  "price": 29.99,
  "rating": 4.7,
  "reviews": 12345,
  "bought_last_month": "50K+",
  "revenue_estimate": 1499500.00,
  "link": "https://amazon.com/...",
  "thumbnail": "https://...",
  "page_found": 1
}
```

## Example Output

```
Improved Smart Home Trending Products Analyzer
============================================================
Fetching page 1...
Found 20 products on page 1
Added 20 new products from page 1
Fetching page 2...
Found 20 products on page 2
Added 20 new products from page 2
Fetching page 3...
Found 20 products on page 3
Added 20 new products from page 3

✓ Successfully fetched 60 unique products

✓ Generating comprehensive JSON analysis...

Comprehensive analysis saved to: smart_home_comprehensive_analysis_20250930_103045.json

📊 ANALYSIS SUMMARY
==================================================
Total Unique Products: 60
Average Price: $45.99
Average Rating: 4.3/5.0
Total Estimated Revenue: $2,500,000.00
Comprehensive JSON saved to: smart_home_comprehensive_analysis_20250930_103045.json

🔥 TOP 5 BY REVIEWS:
1. Echo Dot (5th Gen) Smart Speaker... - 125,340 reviews
2. Ring Video Doorbell – 1080p HD video... - 98,250 reviews
3. Wyze Cam v3 Security Camera... - 87,123 reviews
4. TP-Link Kasa Smart Plug... - 76,890 reviews
5. Philips Hue White LED Smart Bulb... - 65,432 reviews

💰 TOP 5 BY REVENUE:
1. Ring Video Doorbell Pro... - $8,995,000.00
2. Nest Learning Thermostat... - $7,450,000.00
3. Echo Show 10... - $6,890,000.00
4. Arlo Pro 4 Security Camera System... - $5,670,000.00
5. August Smart Lock Pro... - $4,230,000.00
```

## Use Cases

- **Market Research**: Identify trending products and market opportunities in Smart Home category
- **Competitive Analysis**: Track best-selling products and their performance metrics
- **Product Discovery**: Find high-performing products for resale or inspiration
- **Revenue Analysis**: Estimate market size and revenue potential for different products
- **Trend Identification**: Discover emerging products with high growth potential
- **Investment Research**: Analyze market trends for business or investment decisions

## Customization

### Change Product Category

Modify the `smart_home_node` in the `__init__` method to analyze different categories:

```python
def __init__(self, api_key: str):
    self.api_key = api_key
    self.smart_home_node = "6563140011"  # Change this to any category node ID
```

Common Amazon category node IDs:
- Electronics: 172282
- Computers & Accessories: 541966
- Home & Kitchen: 1055398
- Sports & Outdoors: 3375251

### Adjust Trending Score Weights

Customize the trending score calculation in `rank_by_trending_score()`:

```python
# Default weights: rating 40%, reviews 30%, revenue 30%
return (rating_score * 0.4) + (review_score * 0.3) + (revenue_score * 0.3)

# Example: Prioritize revenue (50%), rating 30%, reviews 20%
return (rating_score * 0.3) + (review_score * 0.2) + (revenue_score * 0.5)
```

### Fetch More Pages

Change the number of pages in the `main()` function:

```python
products = analyzer.fetch_smart_home_best_sellers(pages=5)  # Analyze 5 pages instead of 3
```

## Important Notes

- **API Key Required**: You must have a valid SerpApi API key to use this script
- **API Credits**: Each page search consumes API credits from your SerpApi account (3 pages = 3 credits by default)
- **Data Accuracy**: Revenue estimates are approximations based on available "bought last month" data
- **Category Nodes**: Different categories use different node IDs; find them by inspecting Amazon URLs
- **Processing Time**: Multi-page analysis may take 10-30 seconds depending on the number of pages

## Advanced Features

### ProductData Class

The script uses a dataclass structure for clean data management:
- Type hints for all fields
- Optional fields for missing data
- Easy conversion to dictionaries for JSON export

### Duplicate Detection

The analyzer tracks ASINs across all pages to ensure:
- No duplicate products in the final dataset
- Accurate product counts
- Clean, deduplicated rankings

### Smart Parsing

Handles various quantity formats:
- "10K+ bought in past month" → 10,000
- "2.5M bought" → 2,500,000
- Graceful handling of missing data

## Disclaimer

**Note that this code is provided free of charge as is, and SerpApi does not offer free DIY web scraping support or consultation.**

Revenue estimates are approximations based on available data and should not be considered exact figures. Amazon's "bought last month" data may not always be available or accurate.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this analyzer.

## License

This project is provided as-is for educational purposes. Use at your own discretion and ensure compliance with applicable terms of service and laws.
