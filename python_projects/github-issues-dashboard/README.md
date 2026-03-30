# GitHub Issues Dashboard

A Python app that fetches issues from any public GitHub repository, transforms the raw API data into structured metrics, and displays an interactive dashboard using Streamlit.

You get open vs closed counts, issue aging, service breakdown, and creation trends over time. The app defaults to the [SerpApi Public Roadmap](https://github.com/serpapi/public-roadmap) repository, but you can point it at any public repo from the UI.

Based on the article: [How to Analyze Issues with the GitHub API in Python](TBD)

## How It Works

1. Fetch open and closed issues separately from the GitHub REST API, handling pagination
2. Filter out pull requests (the `/issues` endpoint returns both mixed together)
3. Extract service names, status, and type from issue titles and labels
4. Calculate issue age and bucket open issues into time ranges
5. Render metrics and charts in a Streamlit dashboard

## Requirements

- Python 3.8+
- A [GitHub personal access token](https://github.com/settings/personal-access-tokens) with read access to public repositories

## Usage

Create a virtual environment and install dependencies:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Export your GitHub token and run the app:

```bash
export GITHUB_TOKEN="your_token_here"
streamlit run app.py
```

The dashboard opens at `http://localhost:8501`. Enter any public repository owner and name, then click "Fetch Issues".

## Notebook

The Jupyter notebook contains the same analysis without Streamlit. It runs each step in individual cells, which makes it easier to inspect the raw API responses and intermediate data.

```bash
pip install notebook
jupyter notebook github_issues_analysis.ipynb
```

## Project Structure

```
.
├── app.py                          # Streamlit dashboard
├── github_issues_analysis.ipynb    # Step-by-step Jupyter notebook
├── requirements.txt                # Dependencies (streamlit, pandas, requests)
└── README.md
```

## Limitations

- GitHub caps pagination at roughly 1,000 results per query. The app splits requests by state (open/closed) to fetch up to 2,000 issues. Repositories with more than 1,000 open or 1,000 closed issues will have incomplete data.
- Without a token, the API allows 60 requests per hour. With a token, 5,000. Large repositories may exhaust the limit.
- The service extraction regex (`[Service Name]` in issue titles) is specific to repositories that follow this naming convention. Other repositories will categorize most issues as "General".

## License

This project is provided as-is for educational purposes. Use at your own discretion and ensure compliance with applicable terms of service and laws. Contact us at contact@serpapi.com for any question.
