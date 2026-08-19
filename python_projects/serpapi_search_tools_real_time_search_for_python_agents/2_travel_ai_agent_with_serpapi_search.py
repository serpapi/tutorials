import os

import uvicorn
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIResponsesModel
from pydantic_ai.providers.openai import OpenAIProvider

# pip install serpapi-search-tools / uv add serpapi-search-tools
from serpapi_search_tools import flights_search, hotels_search

from dotenv import load_dotenv

load_dotenv()

model = OpenAIResponsesModel(
    "gpt-5.6-luna",
    provider=OpenAIProvider(api_key=os.environ.get("OPENAI_API_KEY")),
)

agent = Agent(
    instructions=(
        "You are a helpful travel assistant. Do not guess or make-up facts."
    ),
    tools=[
        flights_search(provider="pydantic-ai"),
        hotels_search(provider="pydantic-ai"),
    ],
)

app = agent.to_web(models={"Travel Agent - with SerpApi tools": model})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=7934)
