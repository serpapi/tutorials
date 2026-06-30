# Sakana Fugu SerpApi Shopping Assistant

A small Python example that connects Sakana AI Fugu with SerpApi Google Shopping using the OpenAI-compatible Responses API function-calling flow.

The script asks Fugu to decide whether a shopping search is needed, calls SerpApi when Fugu requests the `google_shopping_search` function, prints the product results, then sends those results back to Fugu for a final recommendation.

Blog post tutorial: [Connect Sakana AI with real-time data](https://serpapi.com/blog/connect-sakana-fugu-ai-with-web-search-api)

## Features

- Uses Sakana AI Fugu through an OpenAI-compatible client
- Uses the non-streaming `client.responses.create(...)` API
- Implements Responses API function calling with `function_call` and `function_call_output`
- Searches Google Shopping through SerpApi
- Prints status messages at each step so you can see where the program is waiting
- Stops immediately when SerpApi returns an API error, such as `401 Unauthorized`

## Requirements

- Python 3.10+
- A Sakana AI Fugu API key
- A SerpApi API key

Install the Python dependencies:

```bash
pip install openai requests python-dotenv
```

## Environment Variables

Create a `.env` file in the same directory:

```bash
FUGU_API_KEY=your_fugu_api_key
SERPAPI_API_KEY=your_serpapi_api_key
```

## Run

```bash
python sakana-fugu-serpapi-shopping.py
```

By default, the script asks:

```text
What's a good gaming laptop under $1000?
```

To change the prompt, edit the `query` value at the bottom of `sakana-fugu-serpapi-shopping.py`:

```python
query = "What's a good gaming laptop under $1000?"
run_shopping_assistant(query)
```

## How It Works

1. The user query is sent to Fugu with the `google_shopping_search` function definition.
2. If Fugu returns a `function_call`, the script parses the JSON arguments.
3. The script calls SerpApi with `engine=google_shopping`.
4. The first five shopping results are formatted as JSON.
5. The function result is sent back to Fugu as a `function_call_output`.
6. Fugu returns a final shopping recommendation.

## Function Calling Shape

The tool is defined with the Responses API function schema:

```python
{
    "type": "function",
    "name": "google_shopping_search",
    "description": "Search for products on Google Shopping using SerpApi",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The product search query"
            },
        },
        "required": ["query"],
        "additionalProperties": False,
    },
    "strict": True,
}
```

Tool results are returned to the model like this:

```python
{
    "type": "function_call_output",
    "call_id": tool_call.call_id,
    "output": json.dumps(result),
}
```

## Troubleshooting

### Missing `FUGU_API_KEY`

If you see:

```text
Error: Missing FUGU_API_KEY environment variable
```

Make sure your `.env` file contains `FUGU_API_KEY`.

### SerpApi `401 Unauthorized`

If you see:

```text
API Error: 401 Client Error: Unauthorized
```

Check that `SERPAPI_API_KEY` is correct, active, and has access to SerpApi requests. The script stops on this error instead of asking Fugu to generate a recommendation from failed search data.

### Program Appears Stuck

The script prints status messages before and after each major step:

- Sending request to Fugu
- Receiving Fugu response
- Calling SerpApi
- Receiving SerpApi HTTP status
- Parsing SerpApi JSON
- Sending tool results back to Fugu

If the program pauses, the last printed status line shows which external request is still waiting.

## Notes

- This example uses `https://api.sakana.ai/v1` as the OpenAI-compatible base URL.
- SerpApi requests use a 30-second timeout.
- The script returns only the first five Google Shopping results to Fugu.
