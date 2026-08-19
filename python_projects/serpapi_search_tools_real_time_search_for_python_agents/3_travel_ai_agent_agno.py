import os

from agno.agent import Agent
from agno.models.openai import OpenAIResponses
from dotenv import load_dotenv

from serpapi_search_tools import flights_search, hotels_search

load_dotenv()

agent = Agent(
    name="Travel Agent - live SerpApi tools",
    model=OpenAIResponses(
        id="gpt-5.6-luna",
        api_key=os.environ.get("OPENAI_API_KEY"),
    ),
    instructions=(
        "You are a helpful travel assistant."
    ),
    tools=[
        flights_search(provider="agno"),
        hotels_search(provider="agno"),
    ],
    markdown=True,
)

if __name__ == "__main__":
    agent.print_response(
        "Find me cheapest flights and hotel combo from Paris to London (any airport), Aug 25 to 30, 2026, for a solo trip",
        stream=True)
