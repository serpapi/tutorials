import os
import json
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

base_url = "https://api.sakana.ai/v1"

client = OpenAI(
    api_key=os.environ.get("FUGU_API_KEY"),
    base_url=base_url,
)

SERPAPI_API_KEY = os.environ.get("SERPAPI_API_KEY")

# Define the Google Shopping Search tool
tools = [
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
]

def google_shopping_search(query):
    """
    Simple Google Shopping search using SerpApi
    """
    print("🔎 Checking SerpApi key...", flush=True)
    if not SERPAPI_API_KEY:
        return {
            "success": False,
            "error": "Missing SERPAPI_API_KEY environment variable",
            "query": query
        }

    print(f"🌐 Requesting Google Shopping results from SerpApi for: {query}", flush=True)
    params = {
        "api_key": SERPAPI_API_KEY,
        "engine": "google_shopping",
        "q": query,
    }
    
    try:
        response = requests.get("https://serpapi.com/search", params=params, timeout=30)
        print(f"🌐 SerpApi responded with HTTP {response.status_code}", flush=True)
        response.raise_for_status()
        print("📦 Parsing SerpApi response JSON...", flush=True)
        data = response.json()
        
        shopping_results = data.get("shopping_results", [])
        
        # Format results
        formatted_results = []
        for item in shopping_results[:5]:
            formatted_item = {
                "title": item.get("title", ""),
                "price": item.get("price", "N/A"),
                "link": item.get("product_link", ""),
                "source": item.get("source", ""),
                "rating": item.get("rating", "N/A"),
                "reviews": item.get("reviews", 0),
            }
            formatted_results.append(formatted_item)
        
        return {
            "success": True,
            "query": query,
            "results": formatted_results,
            "total_results": len(shopping_results)
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": f"API Error: {str(e)}",
            "query": query
        }

def print_shopping_results(result):
    """
    Print SerpApi shopping results in a readable format.
    """
    if result["success"]:
        print(f"📊 Found {result['total_results']} products:\n")
        for i, item in enumerate(result["results"], 1):
            print(f"{i}. {item['title']}")
            print(f"   Price: {item['price']}")
            print(f"   Source: {item['source']}")
            if item["rating"] != "N/A":
                print(f"   Rating: {item['rating']} ⭐ ({item['reviews']} reviews)")
            print(f"   Link: {item['link']}\n")
    else:
        print(f"   Error: {result['error']}\n")

def create_response(input_data):
    """
    Create a non-streaming Fugu response.
    """
    print("🤖 Sending request to Fugu...", flush=True)
    return client.responses.create(
        model="fugu",
        tools=tools,
        input=input_data,
    )

def handle_tool_call(tool_call):
    """
    Execute a Responses API function_call item.
    """
    if tool_call.name != "google_shopping_search":
        result = {
            "success": False,
            "error": f"Unknown tool: {tool_call.name}",
        }
    else:
        try:
            tool_input = json.loads(tool_call.arguments or "{}")
        except json.JSONDecodeError as e:
            tool_input = {}
            result = {
                "success": False,
                "error": f"Invalid tool arguments: {e}",
            }
        else:
            print(f"\n🔧 Calling function: {tool_call.name}")
            print(f"   Query: {tool_input.get('query')}\n")
            result = google_shopping_search(tool_input["query"])
            print_shopping_results(result)

    if not result.get("success"):
        raise RuntimeError(result.get("error", "Tool call failed"))

    return {
        "type": "function_call_output",
        "call_id": tool_call.call_id,
        "output": json.dumps(result),
    }

def run_shopping_assistant(user_query):
    """
    Run the shopping assistant with Sakana AI Fugu
    """
    if not os.environ.get("FUGU_API_KEY"):
        raise RuntimeError("Missing FUGU_API_KEY environment variable")

    print(f"User: {user_query}\n")

    input_messages = [
        {"role": "user", "content": user_query}
    ]

    print("🧠 Asking Fugu whether a tool is needed...", flush=True)
    response = create_response(input_messages)
    print("✅ Fugu response received.", flush=True)

    max_iterations = 5
    for iteration in range(1, max_iterations + 1):
        print(f"🔁 Processing response step {iteration}/{max_iterations}...", flush=True)

        if response.output_text:
            print(response.output_text)
            print()

        input_messages += response.output

        tool_calls = [
            item for item in response.output
            if getattr(item, "type", None) == "function_call"
        ]

        if not tool_calls:
            print("✅ No tool calls requested. Done.", flush=True)
            return response.output_text

        print(f"🛠️ Fugu requested {len(tool_calls)} tool call(s).", flush=True)
        tool_outputs = [handle_tool_call(tool_call) for tool_call in tool_calls]
        input_messages += tool_outputs

        print("🤖 Recommendation:\n")
        print("🧠 Sending tool results back to Fugu...", flush=True)
        response = create_response(input_messages)
        print("✅ Fugu follow-up response received.", flush=True)

    raise RuntimeError("Reached maximum tool-calling iterations")

# Example usage
if __name__ == "__main__":
    try:
        # Example 1
        query = "What's a good gaming laptop under $1000?"
        run_shopping_assistant(query)
    except RuntimeError as e:
        print(f"❌ Error: {e}")
        print("\nMake sure you have a .env file with:")
        print("  FUGU_API_KEY=...")
        print("  SERPAPI_API_KEY=...")
