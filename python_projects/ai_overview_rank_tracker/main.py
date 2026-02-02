from serpapi import GoogleSearch
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")


def normalize_domain(url):
    """Extract domain for reliable comparison"""
    parsed = urlparse(url)
    return parsed.netloc.replace("www.", "")


def check_ai_overview(query, api_key):
    params = {
        "engine": "google",
        "q": query,
        "hl": "en",
        "gl": "us",
        "api_key": api_key
    }

    search = GoogleSearch(params)
    results = search.get_dict()

    ai_overview = results.get("ai_overview")
    if not ai_overview:
        print("No AI Overview found for this query")
        return None

    page_token = ai_overview.get("page_token")
    if not page_token:
        print("AI Overview found but no page token")
        return None

    return page_token


def get_ai_overview_results(page_token, api_key):
    params = {
        "engine": "google_ai_overview",
        "page_token": page_token,
        "api_key": api_key
    }

    search = GoogleSearch(params)
    return search.get_dict()


def print_references_and_rank(ai_results, user_url):
    references = ai_results.get("ai_overview", {}).get("references", [])

    if not references:
        print("No references found in AI Overview")
        return

    user_domain = normalize_domain(user_url)
    found_rank = None

    print("\nAI Overview References:\n")

    for i, ref in enumerate(references, start=1):
        title = ref.get("title", "N/A")
        link = ref.get("link", "")
        domain = normalize_domain(link)

        print(f"{i}. {title}")
        print(f"   {link}\n")

        if user_domain and user_domain in domain:
            found_rank = i

    print("="*80, "\n") 
    if found_rank:
        print(f"Your site ranks in AI Overview at position #{found_rank} in AI overview references.\n")
    else:
        print("Your site is NOT referenced in the AI Overview")

    print("="*80) 


if __name__ == "__main__":
    query = input("Enter target keyword to track: ").strip()
    user_url = input("Enter your website URL: ").strip()

    page_token = check_ai_overview(query, SERPAPI_API_KEY)

    if page_token:
        ai_results = get_ai_overview_results(page_token, SERPAPI_API_KEY)
        print_references_and_rank(ai_results, user_url)
