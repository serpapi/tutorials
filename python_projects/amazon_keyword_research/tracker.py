import os
from serpapi import GoogleSearch
from dotenv import load_dotenv
from analysis import analyze_keywords

load_dotenv()

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")

def fetch_amazon_search_results(query):
    params = {
        "engine": "amazon",
        "k": query,
        "api_key": SERPAPI_API_KEY
    }

    search = GoogleSearch(params)
    results = search.get_dict()
    
    return results.get("organic_results", [])

def extract_titles(results):
    return [
        item.get("title")
        for item in results
        if item.get("title")
    ]


def main():
    query = "wireless headphones"

    results = fetch_amazon_search_results(query)
    titles = extract_titles(results)

    keywords = analyze_keywords(titles)

    print("Top Amazon keywords:")
    for word, count in keywords:
        print(f"{word}: {count}")

if __name__ == "__main__":
    main()
