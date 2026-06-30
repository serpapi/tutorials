from datetime import datetime
import os

import httpx
import uvicorn
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

from dotenv import load_dotenv

load_dotenv()

TIME_SENSITIVE_INSTRUCTION = "Always call get_time before answering relative-date or time-sensitive queries."

model = OpenAIChatModel(
    "qwen/qwen3.6-35b-a3b",
    provider=OpenAIProvider(base_url="http://localhost:1234/v1"),
)

agent = Agent(
    model,
    instructions=(
        "You are a helpful assistant. Help the user with their questions and requests. "
        "Always use search_serpapi when the user asks for current information, products, companies, places, or news. "
        f"{TIME_SENSITIVE_INSTRUCTION}"
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


@agent.tool_plain
def search_serpapi(query: str) -> dict:
    """Search Google Light with SerpAPI and return a compact result set."""
    params = {"engine": "google_light", "q": query, "api_key": os.environ["SERPAPI_API_KEY"], "num": 10}
    response = httpx.get("https://serpapi.com/search.json", params=params, timeout=20)
    response.raise_for_status()
    data = response.json()

    return {
        "answer_box": data.get("answer_box"),
        "organic_results": [
            {"title": item.get("title"), "link": item.get("link"), "snippet": item.get("snippet")}
            for item in data.get("organic_results", [])[:10]
        ],
    }


app = agent.to_web(models={"Qwen 35B (LM Studio)": model})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=7937)
