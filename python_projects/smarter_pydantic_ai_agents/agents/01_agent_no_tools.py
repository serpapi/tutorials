from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

model = OpenAIChatModel(
    "qwen/qwen3.6-35b-a3b",
    provider=OpenAIProvider(base_url="http://localhost:1234/v1"),
)

agent = Agent(
    model,
    instructions=(
        "You are a helpful assistant. Help the user with their questions and requests. "
    ),
)

app = agent.to_web(models={"Qwen 3.6 35B (LM Studio)": model})

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=7934)
