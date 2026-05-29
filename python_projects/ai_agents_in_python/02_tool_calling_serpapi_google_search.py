import json
import os
from dotenv import load_dotenv

load_dotenv()


def google_search(query):
    import serpapi

    client = serpapi.Client(api_key=os.environ["SERPAPI_KEY"])

    results = client.search({
        "engine": "google",
        "q": query,
    })

    return [
        {
            "title": result.get("title"),
            "link": result.get("link"),
            "snippet": result.get("snippet"),
        }
        for result in results.get("organic_results", [])[:5]
    ]


if __name__ == '__main__':
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    tools = [
        {
            "type": "function",
            "name": "google_search",
            "description": "Search Google with SerpApi and return web search results.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The Google search query to run",
                    }
                },
                "required": ["query"],
                "additionalProperties": False,
            },
            "strict": True,
        }
    ]

    input_list = [
        {
            "role": "system",
            "content": "You are Safar, a travel planner. Use Google search when current destination information would improve your answer.",
        },
        {
            "role": "user",
            "content": input("What travel question should I research? "),
        },
    ]

    response = client.responses.create(
        model="gpt-5.4-mini",
        input=input_list,
        tools=tools,
        tool_choice="required",
    )

    print("The model responded with:")
    print(response.output)

    input_list += response.output

    for item in response.output:
        if item.type != "function_call":
            continue

        if item.name == "google_search":
            args = json.loads(item.arguments)
            print(f"The model wants to call google_search with: {args}")

            search_results = google_search(args["query"])
            print(f"Step 7: SerpApi returned {len(search_results)} search results")

            input_list.append({
                "type": "function_call_output",
                "call_id": item.call_id,
                "output": json.dumps(search_results),
            })

    final_response = client.responses.create(
        model="gpt-5.4-mini",
        input=input_list,
        tools=tools,
    )

    print(f"Model response: {final_response.output_text}")
