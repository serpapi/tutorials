from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from serpapi_search_tools import web_search

load_dotenv()

search_results_in = web_search(
    provider="langchain",
    allowed_engines=["google_light"],
    default_params={"gl": "in", "hl": "en"},
    name="search_results_in",
)

search_results_us = web_search(
    provider="langchain",
    allowed_engines=["google_light"],
    default_params={"gl": "us", "hl": "en"},
    name="search_results_us",
)

search_results_de = web_search(
    provider="langchain",
    allowed_engines=["google_light"],
    default_params={"gl": "de", "hl": "en"},
    name="search_results_de",
)

model = ChatOpenAI(
    model="gpt-5.6-luna",
    use_responses_api=True,
    temperature=0,
)

tools = [
    search_results_in,
    search_results_us,
    search_results_de,
]

# LangChain's create_agent returns a compiled LangGraph graph.
# Use `langgraph dev` command to run and test this Agent.
graph = create_agent(
    model=model,
    tools=tools,
    system_prompt=(
        "You are an SEO ranking analyst. Use country specific search tools to gather ranking data. Present comparisons as a concise Markdown table."
    ),
    name="seo_ranking_agent",
)
