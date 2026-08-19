# Real-time search for Python agents

This repository demonstrates how to add real-time search to Python agents with [`serpapi-search-tools`](https://pypi.org/project/serpapi-search-tools/). The four examples compare an agent without live tools with travel and SEO agents that can search current SerpApi data.

## Setup

This project requires Python 3.13 or later, an OpenAI API key, and a SerpApi API key.

```bash
uv sync
cp sample.env .env
```

Add your keys to `.env`:

```dotenv
SERPAPI_KEY=your_serpapi_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Run the demos

Run each command from the repository root.

### 1. Travel agent without real-time search

This Pydantic AI agent has no search tools. It provides a baseline for comparison with the next example.

```bash
uv run python 1_travel_ai_agent.py
```

Open [http://127.0.0.1:7933](http://127.0.0.1:7933) in your browser.

### 2. Travel agent with SerpApi search

This Pydantic AI agent uses SerpApi flight and hotel search tools to answer with current travel data.

```bash
uv run python 2_travel_ai_agent_with_serpapi_search.py
```

Open [http://127.0.0.1:7934](http://127.0.0.1:7934) in your browser.

### 3. Agno travel agent

This Agno agent searches live flight and hotel results, then streams its answer in the terminal.

```bash
uv run python 3_travel_ai_agent_agno.py
```

### 4. LangChain SEO agent with LangGraph

This LangChain agent compares live Google search results from India, the United States, and Germany. Run it with the LangGraph development server:

```bash
uv run langgraph dev
```

Open the LangGraph Studio URL printed by the command and select the `seo_agent` graph.
