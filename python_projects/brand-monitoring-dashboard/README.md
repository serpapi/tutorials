# Brand Monitoring Dashboard

A Python app that monitors brand mentions across Google News, YouTube, and Google Perspectives using SerpApi, then displays an interactive dashboard with Streamlit.

You get article counts by source, video views by channel, and a breakdown of discussions by platform (Reddit, LinkedIn, Quora). The app defaults to searching for `serpapi`, but you can enter any brand or keyword from the UI.

Based on the article: [How to Build a Brand Monitoring Dashboard with SerpApi and Python](TBD)

## How It Works

1. Fetch news articles via the Google News engine (`google_news`)
2. Fetch YouTube videos with week and month time filters, deduplicating by link
3. Fetch user-generated content from Reddit, LinkedIn, and Quora via Google Perspectives
4. Parse relative date strings ("2 hours ago", "1 week ago") into datetime objects
5. Render metrics, tables, and charts in a Streamlit dashboard with three tabs

## Requirements

- Python 3.8+
- A [SerpApi API key](https://serpapi.com/manage-api-key)
- [SerpApi Python SDK](https://github.com/serpapi/serpapi-python) (`serpapi`)
- [Streamlit](https://streamlit.io/) (`streamlit`)
- [pandas](https://pandas.pydata.org/) (`pandas`)
- [Altair](https://altair-viz.github.io/) (`altair`)

## Usage

Create a virtual environment and install dependencies:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Export your SerpApi key and run the app:

```bash
export SERPAPI_KEY="your_key_here"
streamlit run app.py
```

The dashboard opens at `http://localhost:8501`. Enter any brand or keyword, then click "Search".

## Notebook

The Jupyter notebook contains the same analysis without Streamlit. It runs each step in individual cells, which makes it easier to inspect the raw API responses and intermediate data.

```bash
pip install notebook
jupyter notebook serpapi_brand_monitor.ipynb
```

## Project Structure

```
.
├── app.py                          # Streamlit dashboard
├── serpapi_brand_monitor.ipynb     # Step-by-step Jupyter notebook
├── requirements.txt                # Dependencies (serpapi, streamlit, pandas, altair)
└── README.md
```

## Limitations

- Google Perspectives results are not available for all queries. Technical or niche brand names may return zero perspectives, while consumer-oriented brands (Apple, Tesla, OpenAI) typically return results.
- SerpApi has per-plan rate limits. The app caches results for 5 minutes to avoid redundant calls during development and testing.
- Relative date parsing approximates months as 30 days and years as 365 days. Dates in absolute formats (e.g., "12/19/2025") are not parsed and default to the current timestamp.

## License

This project is provided as-is for educational purposes. Use at your own discretion and ensure compliance with applicable terms of service and laws. Contact us at contact@serpapi.com for any question.
