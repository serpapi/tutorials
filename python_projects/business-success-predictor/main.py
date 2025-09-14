import os
import json
import time
import logging
from datetime import datetime
from dotenv import load_dotenv
from serpapi import GoogleSearch
from openai import OpenAI
import requests

# Setup logger
logger = logging.getLogger("coffee_agent")
logger.setLevel(logging.DEBUG)
file_handler = logging.FileHandler('debug.log')
file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S'))
logger.addHandler(file_handler)
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S'))
logger.addHandler(stream_handler)

BUSINESS_TYPE = "Coffee Shop"

def get_search_params(user_input, api_key):
    if "," in user_input and all(part.replace('.', '', 1).replace('-', '', 1).isdigit() for part in user_input.split(',')):
        logger.info(f"Fetching {BUSINESS_TYPE.lower()} near coordinates: {user_input}")
        return {
            "engine": "google_maps",
            "q": BUSINESS_TYPE,
            "ll": f"@{user_input},14z",
            "api_key": api_key
        }
    else:
        logger.info(f"Fetching {BUSINESS_TYPE.lower()} in location: {user_input}")
        return {
            "engine": "google_maps",
            "q": f"{BUSINESS_TYPE} in {user_input}",
            "api_key": api_key
        }

def fetch_shops_details(search_params):
    logger.info(f"Sending request to SerpApi for {BUSINESS_TYPE.lower()} search...")
    response = requests.get("https://serpapi.com/search", params=search_params)
    data = response.json()
    logger.debug(f"Received response: {json.dumps(data)[:500]}")
    logger.info(f"Received response from SerpAPI.")
    local_results = data.get("local_results", [])
    logger.info(f"Found {len(local_results)} {BUSINESS_TYPE.lower()}s around the area.")
    return local_results

def fetch_reviews(data_id, shop_title):
    logger.info(f"Fetching reviews for: {data_id} ({shop_title})")
    review_params = {
        "api_key": os.getenv("SERPAPI_API_KEY"),
        "engine": "google_maps_reviews",
        "data_id": data_id,
        "hl": "en"
    }
    review_search = GoogleSearch(review_params)
    review_results = review_search.get_dict()
    reviews = review_results.get("reviews", [])
    logger.info(f"Found {len(reviews)} reviews for shop {shop_title}")
    time.sleep(1)
    return [
        {
            "review_text": review.get("snippet"),
            "review_star_rating": review.get("rating"),
            "timestamp": review.get("date")
        }
        for review in reviews
    ]

def build_competitor_data(local_results):
    competitors = []
    for shop in local_results:
        logger.info(f"Processing shop: {shop.get('title')}")
        shop_info = {
            "business_name": shop.get("title"),
            "address": shop.get("address"),
            "GPS_coordinates": shop.get("gps_coordinates", "Not available"),
            "star_rating": shop.get("rating"),
            "review_count": shop.get("reviews"),
            "opening_hours": shop.get("operating_hours", "Not available"),
            "price_level": shop.get("price", "Not available"),
            "customer_reviews": []
        }
        data_id = shop.get("data_id")
        if data_id:
            shop_info["customer_reviews"] = fetch_reviews(data_id, shop.get("title"))
        competitors.append(shop_info)
    return competitors

def format_competitor_data(competitors):
    competitor_data_str = ""
    for shop in competitors:
        competitor_data_str += f"\n- {shop['business_name']}\n  - Address: {shop['address']}\n  - GPS: {shop['GPS_coordinates']}\n  - Star Rating: {shop['star_rating']}\n  - Review Count: {shop['review_count']}\n  - Opening Hours: {shop['opening_hours']}\n  - Price Level: {shop['price_level']}\n  - Customer Reviews:\n"
        for review in shop["customer_reviews"]:
            competitor_data_str += f"    - \"{review['review_text']}\" | {review['review_star_rating']} stars | {review['timestamp']}\n"
    return competitor_data_str

def build_prompt(competitor_data_str):
    return f"""
                You are **{BUSINESS_TYPE} Success Forecaster**, an AI agent that predicts the potential success of a new {BUSINESS_TYPE.lower()} in a given location.

                You will be fed structured data about competitor {BUSINESS_TYPE.lower()}s, including:
                {competitor_data_str}

                Your tasks are:

                1. **Market Landscape Analysis**
                - Summarize competitor density within 1–3 km.
                - Identify star-rating patterns, price tiers, and operating hours.
                - Highlight underserved niches (pricing gaps, late-night, early-morning).
                - Output:
                    - A **2-column table** with | Metric | Observations |.
                    - A short **bullet list of underserved slots/pricing gaps**.

                2. **Sentiment & Customer Insight**
                - Perform sentiment analysis on reviews.
                - Extract recurring positives, negatives, and unmet needs.
                - Output:
                    
                    | Sentiment Category | Positive Highlights | Negative Highlights | Unmet Needs / Opportunities |
                    |--------------------|---------------------|---------------------|-----------------------------|
                    
                - Conclude with exactly **3 key takeaways** in bullet points.

                3. **Success Prediction**
                - Estimate a **success probability score (0–100%)** in bold.
                - Output:
                    - A **2-column table** with | Metric | Value |.
                    - A bullet list of the **Top 3 drivers of success/failure**.

                4. **Recommendations**
                - Output:
                    - A **2-column table** with | Differentiator | Rationale |.
                    - A **2-column Risks & Mitigations table**.
                    - End with an **Action Plan** that:
                        - Is written as **one concise paragraph (1–2 sentences, max 3 lines)**.
                        - Starts with: **Action plan:** (exact text, bolded).
                        - Specifies **location, operating hours, pricing, or promotions** directly tied to the analysis.
                        - Avoids bullet points, timelines (“next 2 weeks”), or generic advice.

                ⚠️ Rules for consistency:
                - Always be clear, data-driven, and practical.
                - Do not give generic answers; tailor insights directly to the provided data.
                - Use tables where defined, and bullets only where instructed.
                - Keep tone business-strategic, concise, and data-driven.
                - Do not mix styles between sections.
            """



def now():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def main():
    load_dotenv()

    api_key = os.getenv("SERPAPI_API_KEY")
    while True:
        user_input = input("Enter your business location name or coordinates (e.g., 'Austin, TX' or '30.2957009,-98.0626221') [type 'q' or 'quit' to exit]: ").strip()
        if user_input.lower() in ["q", "quit"]:
            print("Exiting program.")
            return
        if not user_input:
            print("[ERROR] Input cannot be empty. Please enter a valid location name or coordinates.")
            continue
        if not isinstance(user_input, str):
            print("[ERROR] Input must be a string.")
            continue
        break

    global now
    now = lambda: datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    search_params = get_search_params(user_input, api_key)
    local_results = fetch_shops_details(search_params)
    competitors = build_competitor_data(local_results)
    competitor_data_str = format_competitor_data(competitors)
    prompt = build_prompt(competitor_data_str)

    client = OpenAI(
        base_url="http://localhost:11434/v1",  # Local Ollama API
        api_key="ollama"                       # Dummy key
    )
    response = client.chat.completions.create(
        model="gpt-oss:20b",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    ai_output = response.choices[0].message.content
    logger.debug(f"AI response: {ai_output[:500]}")

    # Save AI output to markdown file with timestamp
    md_filename = f"ai_response_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    with open(md_filename, "w", encoding="utf-8") as md_file:
        md_file.write(ai_output)

    print(ai_output)

if __name__ == "__main__":
    main()