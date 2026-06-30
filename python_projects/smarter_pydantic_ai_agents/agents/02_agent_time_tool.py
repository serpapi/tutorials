from datetime import datetime

from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

TIME_SENSITIVE_INSTRUCTION = "Always call get_time before answering relative-date or time-sensitive queries."

model = OpenAIChatModel(
    "qwen/qwen3.6-35b-a3b",
    provider=OpenAIProvider(base_url="http://localhost:1234/v1"),
)

agent = Agent(
    model,
    instructions=(
        "You are a helpful assistant. Help the user with their questions and requests. "
        f"{TIME_SENSITIVE_INSTRUCTION}"
    ),
)


@agent.tool_plain
def get_time() -> dict[str, str]:
    """Return the current local date and time."""
    now = datetime.now().astimezone()
    return {
        "date": now.date().isoformat(),
        "time": now.strftime("%H:%M:%S"),
        "day_of_week": now.strftime("%A"),
        "timezone": now.tzname() or str(now.tzinfo),
        "utc_offset": now.strftime("%z"),
        "iso_datetime": now.isoformat(timespec="seconds"),
    }


app = agent.to_web(models={"Qwen 3.6 35B (LM Studio)": model})

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=7935)
