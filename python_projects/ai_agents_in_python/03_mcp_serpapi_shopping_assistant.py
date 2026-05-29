import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == '__main__':
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    serpapi_mcp_url = f"https://mcp.serpapi.com/{os.environ['SERPAPI_KEY']}/mcp"

    response = client.responses.create(
        model="gpt-5.4",
        tools=[
            {
                "type": "mcp",
                "server_label": "serpapi",
                "server_description": "SerpApi MCP server",
                "server_url": serpapi_mcp_url,
                "require_approval": "never",
            }
        ],
        input=[
            {
                "role": "system",
                "content": "You are Cartwise, a shopping assistant. Help users compare products, prices, reviews, and buying options.",
            },
            {
                "role": "user",
                "content": input("What do you want to shop for? "),
            },
        ],
    )

    print("Full model response (includes MCP operations): ")
    print(response.output)

    print(f"Model response: {response.output_text}")
