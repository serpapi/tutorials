# Jev and SerpApi fact checker

Check a factual statement or yes/no question against Google organic snippets. The official `serpapi` Python package retrieves the evidence, and Jev returns a verdict through OpenRouter's Decisions API.


## Run

Install [uv](https://docs.astral.sh/uv/getting-started/installation/) and use Python 3.10 or newer:

```bash
uv sync --locked
uv run fact_checker.py
```

Enter your question at the prompt, or pass it directly:

```bash
uv run fact_checker.py "Did Marie Curie win two Nobel Prizes?"
uv run fact_checker.py "Was the first iPhone released in 2010?"
uv run fact_checker.py "Can penguins fly?"
```

The script uses your input as the search query without appending anything. It requests only `organic_results` and sends up to five snippets to Jev. You can also enter a statement such as `Marie Curie won two Nobel Prizes.`

The script reads `SERPAPI_API_KEY` and `OPENROUTER_API_KEY` from your environment, or asks for missing keys through hidden terminal prompts. It does not save credentials. Get your keys from the [SerpApi dashboard](https://serpapi.com/dashboard) and [OpenRouter](https://openrouter.ai/settings/keys).

