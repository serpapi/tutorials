import json
import os
from dotenv import load_dotenv

load_dotenv()


def get_weather(location):
    return {
        "location": location,
        "temperature": "24 C",
        "condition": "Sunny",
        "humidity": "52%",
        "wind": "11 km/h",
    }


if __name__ == '__main__':
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    tools = [
        {
            "type": "function",
            "name": "get_weather",
            "description": "Get the current weather for a destination.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city or destination, e.g. Paris or Tokyo",
                    }
                },
                "required": ["location"],
                "additionalProperties": False,
            },
            "strict": True,
        }
    ]

    input_list = [
        {
            "role": "system",
            "content": "You are Safar, a travel planning AI agent",
        },
        {
            "role": "user",
            "content": input("Ask you travel questions: "),
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

        if item.name == "get_weather":
            args = json.loads(item.arguments)
            print(f"The model wants to call get_weather with: {args}")

            weather = get_weather(args["location"])
            print(f"The local Python function returned: {weather}")

            input_list.append({
                "type": "function_call_output",
                "call_id": item.call_id,
                "output": json.dumps(weather),
            })

    print("Sending the tool result back to the model")
    final_response = client.responses.create(
        model="gpt-5.4-mini",
        input=input_list,
        tools=tools,
    )

    print("Final answer:")
    print(f"Model response: {final_response.output_text}")
