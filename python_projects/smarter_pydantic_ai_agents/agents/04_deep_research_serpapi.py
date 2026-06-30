import os
from datetime import datetime
from typing import Literal

import httpx
from pydantic_ai import Agent
from pydantic_ai.capabilities import Capability
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

from dotenv import load_dotenv

load_dotenv()

deep_research = Capability(
    id="deep_research",
    description=(
        "Use for research tasks that need multiple live search calls across Google, Bing, "
        "Yahoo, Google news, and DuckDuckGo"
    ),
    instructions=(
        "For deep research, call serpapi_search several times before answering. You can "
        "call different engines as well as call the same engine multiple times with "
        "different queries and search params to get a variety of results. Useful engines "
        "include google, bing, yahoo, duckduckgo, google_news, duckduckgo_news, "
        "bing_news, and google_trends."
    ),
    defer_loading=True,
)

SearchEngine = Literal[
    "google",
    "bing",
    "yahoo",
    "duckduckgo",
    "google_news",
    "duckduckgo_news",
    "bing_news",
    "google_trends",
]


RESULT_COUNT = 5
PAGE_SIZE = 10


def _page_to_zero_based_offset(page: int | None) -> int | None:
    if not page or page <= 1:
        return None
    return (page - 1) * PAGE_SIZE


def _page_to_one_based_offset(page: int | None) -> int | None:
    if not page or page <= 1:
        return None
    return (page - 1) * PAGE_SIZE + 1


def _yahoo_language(hl: str) -> str:
    return hl if hl.startswith("lang_") else f"lang_{hl}"


def _duckduckgo_region(gl: str | None, hl: str | None) -> str | None:
    if not gl or not hl:
        return None
    return f"{gl.lower()}-{hl.lower()}"


def _serpapi_params(
        query: str,
        engine: SearchEngine,
        location: str | None,
        gl: str | None,
        hl: str | None,
        page: int | None,
) -> dict:
    params = {"engine": engine, "api_key": os.environ["SERPAPI_API_KEY"]}

    if engine == "yahoo":
        params["p"] = query
        if gl:
            params["vc"] = gl
        if hl:
            params["vl"] = _yahoo_language(hl)
        if offset := _page_to_one_based_offset(page):
            params["b"] = offset
        return params

    params["q"] = query

    if engine == "google":
        params["num"] = RESULT_COUNT
        if location:
            params["location"] = location
        if gl:
            params["gl"] = gl
        if hl:
            params["hl"] = hl
        if offset := _page_to_zero_based_offset(page):
            params["start"] = offset

    elif engine == "bing":
        if location:
            params["location"] = location
        if gl:
            params["cc"] = gl
        if offset := _page_to_one_based_offset(page):
            params["first"] = offset

    elif engine == "duckduckgo":
        if kl := _duckduckgo_region(gl, hl):
            params["kl"] = kl
        params["m"] = RESULT_COUNT
        if offset := _page_to_zero_based_offset(page):
            params["start"] = offset

    elif engine == "google_news":
        if gl:
            params["gl"] = gl
        if hl:
            params["hl"] = hl

    elif engine == "duckduckgo_news":
        if kl := _duckduckgo_region(gl, hl):
            params["kl"] = kl
        params["m"] = RESULT_COUNT
        if offset := _page_to_zero_based_offset(page):
            params["start"] = offset

    elif engine == "bing_news":
        if gl:
            params["cc"] = gl
        params["count"] = RESULT_COUNT
        if offset := _page_to_one_based_offset(page):
            params["first"] = offset

    elif engine == "google_trends":
        if gl:
            params["geo"] = gl.upper()
        if hl:
            params["hl"] = hl

    return params


def _has_value(value) -> bool:
    return value is not None and value != "" and value != [] and value != {}


def _source_name(source):
    if isinstance(source, dict):
        return source.get("name") or source.get("title")
    return source


def _compact_item(item: dict) -> dict:
    fields = {
        "title": item.get("title") or item.get("name"),
        "price": item.get("price"),
        "link": item.get("link") or item.get("product_link") or item.get("source_link"),
        "snippet": item.get("snippet") or item.get("description"),
        "source": _source_name(item.get("source") or item.get("seller")),
        "date": item.get("date") or item.get("published_date") or item.get("time"),
    }
    return {key: value for key, value in fields.items() if _has_value(value)}


def _items_for_result_key(data: dict, key: str) -> list[dict]:
    items = data.get(key)
    if not items:
        return []

    if isinstance(items, dict):
        items = items.get("places") or items.get("items") or items.get("results") or []

    if not isinstance(items, list):
        return []

    if key != "news_results":
        return [item for item in items if isinstance(item, dict)]

    news_items = []
    for item in items:
        if not isinstance(item, dict):
            continue
        stories = item.get("stories")
        if isinstance(stories, list) and stories:
            news_items.extend(story for story in stories if isinstance(story, dict))
        else:
            news_items.append(item)
    return news_items


def _compact_items(items: list[dict], limit: int = 3) -> list[dict]:
    compact_results = []
    for item in items:
        compact_item = _compact_item(item)
        if compact_item:
            compact_results.append(compact_item)
        if len(compact_results) >= limit:
            break
    return compact_results


def _compact_trend_value(value: dict) -> dict:
    fields = {
        "query": value.get("query"),
        "value": value.get("value"),
        "extracted_value": value.get("extracted_value"),
    }
    return {key: field_value for key, field_value in fields.items() if _has_value(field_value)}


def _compact_google_trends(data: dict) -> dict:
    results = {}
    interest_over_time = data.get("interest_over_time")
    if not isinstance(interest_over_time, dict):
        return results

    timeline_data = interest_over_time.get("timeline_data")
    if not isinstance(timeline_data, list):
        return results

    timeline = []
    for item in timeline_data[:5]:
        if not isinstance(item, dict):
            continue

        values = []
        for value in item.get("values", [])[:5]:
            if isinstance(value, dict):
                compact_value = _compact_trend_value(value)
                if compact_value:
                    values.append(compact_value)

        compact_item = {
            "date": item.get("date"),
            "values": values,
        }
        compact_item = {key: value for key, value in compact_item.items() if _has_value(value)}
        if compact_item:
            timeline.append(compact_item)

    if timeline:
        results["interest_over_time"] = timeline
    return results


@deep_research.tool_plain
def serpapi_search(
        query: str,
        engine: SearchEngine,
        location: str | None = None,
        gl: str | None = None,
        hl: str | None = None,
        page: int | None = None,
) -> dict:
    """Search one SerpAPI engine with optional search params and return compact results.

    page is a 1-based page number. gl and hl are mapped to each engine's SerpAPI
    locale parameters when supported.
    """
    params = _serpapi_params(query, engine, location, gl, hl, page)

    response = httpx.get("https://serpapi.com/search.json", params=params, timeout=20)
    response.raise_for_status()
    data = response.json()

    result_keys = (
        "organic_results",
        "shopping_results",
        "inline_shopping_results",
        "product_results",
        "news_results",
        "local_results",
    )
    results = {}
    for key in result_keys:
        compact_results = _compact_items(_items_for_result_key(data, key))
        if compact_results:
            results[key] = compact_results

    if engine == "google_trends":
        results.update(_compact_google_trends(data))

    return {
        "engine": engine,
        "query": query,
        "params_used": {key: value for key, value in params.items() if key != "api_key"},
        "results": results,
    }


model = OpenAIChatModel(
    "qwen/qwen3.6-35b-a3b",
    provider=OpenAIProvider(base_url="http://localhost:1234/v1"),
)

TIME_SENSITIVE_INSTRUCTION = "Always call get_time before answering relative-date or time-sensitive queries."

agent = Agent(
    model,
    capabilities=[deep_research],
    instructions=(
        "You are a careful research assistant. For simple questions, answer briefly. "
        "For deep research, call get_time to get current date/time and load the deep_research capability."
        f"f{TIME_SENSITIVE_INSTRUCTION}"
    ),
)


@agent.tool_plain
def get_time() -> dict[str, str]:
    """Return the current local date and time."""
    now = datetime.now().astimezone()
    return {
        "date": now.date().isoformat(),
        "time": now.strftime("%H:%M:%S"),
        "day_of_week": now.strftime("%A"),
        "timezone": now.tzname() or str(now.tzinfo),
        "utc_offset": now.strftime("%z"),
        "iso_datetime": now.isoformat(timespec="seconds"),
    }

app = agent.to_web(models={"Qwen 3.6 35B (LM Studio)": model})

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=7938)
