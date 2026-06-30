import os

from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider
from pydantic_ai.capabilities import MCP

from dotenv import load_dotenv

load_dotenv()

serpapi_mcp_url = f"https://mcp.serpapi.com/{os.environ['SERPAPI_API_KEY']}/mcp"

model = OpenAIChatModel(
    "qwen/qwen3.6-35b-a3b",
    provider=OpenAIProvider(base_url="http://localhost:1234/v1"),
)

agent = Agent(
    model,
    capabilities=[MCP(url=serpapi_mcp_url)],
    instructions="You are a helpful assistant. Use available MCP search tools for current facts.",
)

app = agent.to_web(models={"Qwen 3.6 35B (LM Studio)": model})

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=7939)
