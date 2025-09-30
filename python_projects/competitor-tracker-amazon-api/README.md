# Amazon Competitor Tracker

A Python script that tracks competitor products on Amazon using the SerpApi Amazon Search API. This tool allows you to extract and monitor product information including titles, prices, and review counts for any search term, making it ideal for competitive analysis and market research.

## Features

- **Easy Product Tracking**: Extract competitor product data with a simple search term
- **Comprehensive Data Extraction**: Collects product titles, prices, and review counts
- **JSON Export**: Saves extracted data to JSON format for easy analysis and integration
- **Formatted Console Output**: Displays results in a clean, readable format
- **Summary Statistics**: Provides quick insights into data completeness

## What Gets Extracted

- Product titles
- Product prices
- Review counts
- Total number of products found

## Requirements

- Python 3.6+
- google-search-results (SerpApi Python client)
- json (built-in)
- SerpApi API key ([Get one here](https://serpapi.com/))

## Installation

1. Clone or download this repository
2. Install required dependencies:

```bash
pip install google-search-results
```

3. Get your SerpApi API key from [https://serpapi.com/](https://serpapi.com/)

## Usage

1. Open `competitor_traker.py`
2. Replace `"your-api-key"` with your actual SerpApi API key:
   ```python
   api_key = "your-actual-serpapi-key"
   ```
3. Modify the search term as needed:
   ```python
   search_term = "Bluetooth Speakers"  # Change to any product category
   ```
4. Run the script:
   ```bash
   python competitor_traker.py
   ```

## How It Works

1. **Setup**: Configures SerpApi search parameters with your API key and search term
2. **Data Extraction**: Fetches Amazon search results and extracts product information
3. **Display Results**: Prints formatted product data to the console
4. **Save Data**: Exports all data to `amazon_products.json`
5. **Summary**: Provides statistics on data completeness

## Output Format

The script generates a JSON file (`amazon_products.json`) with the following structure:

```json
[
  {
    "title": "Product Name",
    "price": "$29.99",
    "review_count": 1234
  }
]
```

Console output displays:
- Individual product details (numbered)
- Summary statistics (total products, products with prices, products with reviews)

## Example Output

```
Searching for: Bluetooth Speakers
Extracting product data...

Found 20 products:

--------------------------------------------------------------------------------
Product 1:
  Title: JBL Flip 6 - Portable Bluetooth Speaker
  Price: $129.95
  Review Count: 12345
--------------------------------------------------------------------------------

Summary:
- Total products found: 20
- Products with prices: 18
- Products with review counts: 19
```

## Use Cases

- **Competitive Analysis**: Track competitor products and pricing
- **Market Research**: Analyze product trends and review counts
- **Price Monitoring**: Monitor competitor pricing strategies
- **Product Discovery**: Find top products in specific categories

## Important Notes

- **API Key Required**: You must have a valid SerpApi API key to use this script
- **API Credits**: Each search consumes API credits from your SerpApi account
- **Data Accuracy**: Results reflect current Amazon search results at the time of execution

## Customization

You can modify the `extract_amazon_data()` function to extract additional fields available in the SerpApi response, such as:
- Product ratings
- ASIN numbers
- Product links
- Delivery information
- Product images

## Disclaimer

**Note that this code is provided free of charge as is, and SerpApi does not offer free DIY web scraping support or consultation.**

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this tracker.

## License

This project is provided as-is for educational purposes. Use at your own discretion and ensure compliance with applicable terms of service and laws.
