# Semantic Image Search over an Instagram Profile

Search a public Instagram profile's photos in plain language, like "a dog wearing sunglasses" instead of hashtags, and get back the pictures that actually look like your query. Ranking comes from the image itself, not the caption, so a matching *video cover* is proof the search is visual.

The same Elasticsearch index powers two entry points: a step-by-step Jupyter notebook that builds the pipeline, and a Streamlit app that turns it into a searchable gallery.

Based on the article: [Semantic Image Search over Instagram with SerpApi, Jina v5 Omni, and Elasticsearch](TBD).

## How It Works

1. **Fetch** a public profile's posts with [SerpApi's Instagram Profile API](https://serpapi.com/instagram-profile-api), paging through `next_page_token` and retrying transient scrape failures.
2. **Download** each post's cover image (photos *and* video thumbnails), so the whole feed is searchable.
3. **Embed** each image with [Jina AI's `jina-embeddings-v5-omni-small`](https://jina.ai/models/jina-embeddings-v5-omni-small/), which maps text and images into one shared vector space.
4. **Index** the 1024-dimension vectors and metadata in an Elasticsearch `dense_vector` field, using exact `flat` kNN (right for hundreds to low thousands of vectors).
5. **Search** by embedding your text query into the same space and running an Elasticsearch kNN query through the Retrievers API.

## Requirements

- Python 3.9+
- A [SerpApi API key](https://serpapi.com/manage-api-key)
- A [Jina AI API key](https://jina.ai/) (free tier available; non-commercial use only)
- Elasticsearch 9.x, local via Docker (`start-local`) or Elastic Cloud Serverless

## Setup

Create a virtual environment and install dependencies:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Start a local Elasticsearch + Kibana (one command; ~1-month trial, then the free Basic license):

```bash
curl -fsSL https://elastic.co/start-local | sh
```

Copy `.env.example` to `.env` and fill in your keys:

```
SERPAPI_API_KEY=...
JINA_API_KEY=...
ES_URL=http://localhost:9200
ES_API_KEY=...        # the ES_LOCAL_API_KEY printed by start-local
```

To use Elastic Cloud Serverless instead of Docker, set `ES_URL` to your project endpoint and `ES_API_KEY` to your key. No code changes.

## Usage

Run the guided notebook (fetch → embed → index → search). Set `PROFILE_USERNAME` and `QUERY` in the config cell, then run the cells top to bottom:

```bash
jupyter notebook semantic_image_search.ipynb
```

Or launch the Streamlit app for an interactive gallery over the same index, with a search box, example queries, and a one-click profile indexer:

```bash
streamlit run app.py
```

## Files

| File | What it does |
|------|--------------|
| `semantic_image_search.ipynb` | The guided tutorial: fetch, embed, index, and search |
| `app.py` | Streamlit UI for searching a profile and indexing new ones |
| `pipeline.py` | Shared building blocks (SerpApi fetch, Jina embed, Elasticsearch index/search) reused by the app |
| `requirements.txt` | Python dependencies |
| `.env.example` | Template for the API keys and Elasticsearch connection |

## Notes and Limitations

- **Instagram CDN URLs expire**, so images are downloaded and embedded immediately rather than stored as a URL to fetch later. Downloaded images live in a local `images/` folder (git-ignored).
- **Post dates** aren't returned by the API, so the app derives them from each post's shortcode.
- **Likes** only come back for the newest posts under `liked_by_count`; the pipeline falls back to `media_preview_likes_count`, which covers the whole feed.
- **Private or embeds-disabled profiles** return no media and are skipped with a clear message.
- Elasticsearch `dense_vector` + kNN run on the free **Basic** license, so a local setup keeps working after the start-local trial ends.
- The `jina-embeddings-v5-omni` model and Jina's free API tokens are **non-commercial** (CC-BY-NC-4.0). Fine for this educational example; commercial use needs a license from Jina.
