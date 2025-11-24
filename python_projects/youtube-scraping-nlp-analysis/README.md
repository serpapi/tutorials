# YouTube Scraping & NLP Analysis Using Python
A complete end-to-end data science project for scraping YouTube search results, extracting transcripts, cleaning text, running NLP analysis, and visualizing insights.

## Project Features

- Scrape top YouTube videos using SerpApi  
- Extract full video transcripts  
- Clean & preprocess text with custom stopwords  
- Perform sentiment analysis with VADER  
- Extract keywords using TF-IDF  
- Topic modeling with LDA  
- Generate visualizations:
    - Sentiment bar chart  
    - TF-IDF heatmap  
    - Word cloud  
- Final text-based analytical report  


## Installation

Install the required libraries:

```bash
pip install google-search-results nltk scikit-learn matplotlib seaborn pandas wordcloud python-dotenv
```

Download NLTK resources:

```python
import nltk
nltk.download('vader_lexicon')
nltk.download('stopwords')
```


## Environment Setup

Create a `.env` file:

```
SERPAPI_API_KEY=your_api_key
```

Get a free key (250 monthly searches):
👉 [Register here](https://serpapi.com/users/sign_up?utm_source=github)


## Notebook

The full Jupyter Notebook is included:  
`youtube_scraping_nlp_analysis.ipynb`


## Project Workflow

1. Scrape top YouTube video results  
2. Extract transcripts using SerpApi  
3. Clean and preprocess transcript text  
4. Run NLP tasks  
5. Generate meaningful visualizations  
6. Produce a final analytical report  


## Technologies Used

- Python  
- SerpApi  
- Pandas  
- NLTK  
- Scikit-learn  
- Matplotlib  
- Seaborn  
- WordCloud  
