# Amazon Product Scraper

A Python-based web scraper that extracts product information from Amazon search results. This project demonstrates how to scrape product data including names, ratings, review counts, and prices from Amazon's search pages.

## Features

- **Product Information Extraction**: Scrapes product names, star ratings, number of reviews, and prices
- **CSV Export**: Saves scraped data to CSV format for easy analysis
- **Error Handling**: Robust error handling for missing data elements
- **Step-by-Step Guide**: Well-documented Jupyter notebook with detailed explanations

## What Gets Scraped

- Product names
- Star ratings (out of 5 stars)
- Number of customer ratings
- Product prices

## Requirements

- Python 3.6+
- requests
- beautifulsoup4
- csv (built-in)
- re (built-in)
- json (built-in)

## Installation

1. Clone or download this repository
2. Install required dependencies:

```bash
pip install requests beautifulsoup4
```

## Usage

1. Open the `amazon_scraper.ipynb` Jupyter notebook
2. Run the cells step by step to understand the scraping process
3. Modify the search URL in the notebook to scrape different products
4. The script will automatically save results to `amazon_products.csv`

## Important Notes

- **Headers Required**: The script includes a placeholder for HTTP headers. You'll need to add proper browser headers to avoid being blocked by Amazon
- **Rate Limiting**: Be respectful with your scraping frequency to avoid overwhelming Amazon's servers
- **Terms of Service**: Ensure your scraping activities comply with Amazon's Terms of Service
- **Data Accuracy**: Web scraping results may vary as websites change their structure

## Output Format

The scraper generates a CSV file with the following columns:
- `product_name`: Full product title
- `star_rating`: Average star rating (e.g., "4.8")
- `num_rating`: Number of customer reviews (e.g., "2,020")
- `price`: Product price (e.g., "77.84")

## Disclaimer

**Note that this code is provided free of charge as is, and SerpApi does not offer free DIY web scraping support or consultation.**

## Legal Notice

This tool is for educational purposes only. Users are responsible for ensuring their use of this scraper complies with:
- Amazon's Terms of Service
- Local laws and regulations
- Respectful scraping practices

The authors are not responsible for any misuse of this tool or any consequences arising from its use.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this scraper.

## License

This project is provided as-is for educational purposes. Use at your own discretion and ensure compliance with applicable terms of service and laws.
