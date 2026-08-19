import os

import uvicorn
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIResponsesModel
from pydantic_ai.providers.openai import OpenAIProvider

from dotenv import load_dotenv

load_dotenv()

model = OpenAIResponsesModel(
    "gpt-5.6-luna",
    provider=OpenAIProvider(api_key=os.environ.get("OPENAI_API_KEY")),
)

agent = Agent(
    instructions=(
        "You are a helpful travel assistant. Do not guess or make-up facts."
    ),
    tools=[],
)

app = agent.to_web(models={"Travel Agent - no live tools": model})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=7933)
