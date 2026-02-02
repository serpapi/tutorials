# AI Overview Rank Tracker

A simple Python tool that tracks whether a website is cited inside **Google AI Overviews**, and determines its **rank position** within AI-generated answers.

This project is designed for **Generative Engine Optimization (GEO)**, helping developers and SEO teams monitor visibility beyond traditional organic rankings.

Read our [Build an AI Overview Rank Tracker using Python](https://serpapi.com/blog/b-an-ai-overview-rank-tracker-using-python/) blog for details step-by-step explanation

## How It Works

1. Run a Google search using your **target keyword**
2. Detect whether an AI Overview is present
3. Retrieve the AI Overview using a `page_token`
4. Extract and rank cited references
5. Match citations against your website’s domain

All data is retrieved via structured search responses, avoiding fragile HTML scraping.


## Requirements

- Python 3.8+
- A SerpApi API key

## Usage

Run the script:

```
python main.py
```

You will be prompted to enter:
- Target keyword: the search phrase you want to track
- Website URL: the site you want to check for AI Overview citations

### Example
```
Enter target keyword to track: scrape walmart products
Enter your website URL: https://serpapi.com
```

### Example Output
```
AI Overview References:

1. Scrape Walmart Data: A Complete How-To Guide
   https://decodo.com/blog/scrape-walmart-data

2. How to Scrape Walmart Products – SerpApi
   https://serpapi.com/blog/how-to-scrape-walmart-products/

================================================================================

Your site appears in the AI Overview at position #2

================================================================================
```

### Ranking Logic

AI Overview rank is determined by the order of references returned in the AI Overview response:
- Rank #1 = first cited source
- Rank #2 = second cited source
- And so on

If the website does not appear in the references list, it is considered not ranked.

## Project Structure
```
.
├── main.py        # AI Overview Rank Tracker script
├── README.md      # Project documentation
├── .env           # Environment variables (optional)
```

## Limitations
- AI Overviews do not appear for every keyword
- Results vary by language (hl) and region (gl)
- Rankings inside AI Overviews may change frequently
- This tool tracks citations, not traffic or clicks

## License

This project is provided as-is for educational purposes. Use at your own discretion and ensure compliance with applicable terms of service and laws. Contact us at contact@serpapi.com for any question.