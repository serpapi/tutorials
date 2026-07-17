# pydantic-ai-search-agent

A small collection of Pydantic AI agent examples, including basic chat agents, time tools, and SerpAPI-backed search/research agents.

- Read the companion blog post: [Smarter Pydantic AI Agents with SerpAPI](https://serpapi.com/blog/smarter-pydantic-ai-agents-with-real-time-search/)
- Watch the companion video: [Smarter Pydantic AI Agents with SerpAPI](https://youtu.be/9_Wa58PZ8rA?si=uSDZ57sTkcgB35DL)

## Prerequisites

- Python 3.13 or newer
- `uv`

If `uv` is not installed yet, install it first:

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

On macOS with Homebrew, you can also use:

```sh
brew install uv
```

See the official `uv` installation docs for other platforms: https://docs.astral.sh/uv/getting-started/installation/

## Setup

Install the project dependencies from the lockfile:

```sh
uv sync
```

If you plan to use the SerpAPI examples, set up a local `.env` file based on `sample.env`:

```sh
cp sample.env .env
```

Then add your `SERPAPI_API_KEY` value to `.env`.

## Run an Agent

Run any example with `uv run`:

```sh
uv run python agents/01_agent_no_tools.py
```

Other examples live in the `agents/` directory.

## Agent Examples

- `agents/01_agent_no_tools.py`: A minimal Pydantic AI web chat agent that connects to the local LM Studio OpenAI-compatible endpoint and uses no tools.
- `agents/02_agent_time_tool.py`: Adds a `get_time` tool so the agent can answer relative-date and time-sensitive questions with the current local time.
- `agents/03_personal_assistant_serpapi.py`: Adds a Google Light SerpAPI search tool for current information, products, companies, places, and news.
- `agents/04_deep_research_serpapi.py`: Adds a deferred deep research capability that can search multiple SerpAPI engines and combine compact result summaries.
- `agents/05_pydantic_ai_serpapi_mcp.py`: Connects the agent to SerpAPI through its MCP server so available search tools can be discovered and used via MCP.
