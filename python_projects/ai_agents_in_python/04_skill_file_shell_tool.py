# Install SerpApi CLI first: https://github.com/serpapi/serpapi-cli
# Then run: serpapi login

import os
import subprocess
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

MODEL = os.getenv("OPENAI_MODEL", "gpt-5.4-mini")
SKILL_PATH = Path(__file__).resolve().parent / "skills" / "serpapi-web-search"


def run_shell_call(shell_call):
    print(f"\nModel requested shell call: {shell_call.call_id}")
    print(f"Commands: {shell_call.action.commands}")

    command_outputs = []
    for command in shell_call.action.commands:
        print(f"\n[script] Running command: {command}")

        result = subprocess.run(
            command,
            shell=True,
            executable="/bin/zsh",
            capture_output=True,
            text=True,
            check=False,
        )

        print(f"[script] Exit code: {result.returncode}")
        if result.stdout:
            print(f"[script] stdout:\n{result.stdout[:1500]}")
        if result.stderr:
            print(f"[script] stderr:\n{result.stderr[:1500]}")

        command_outputs.append({
            "stdout": result.stdout,
            "stderr": result.stderr,
            "outcome": {
                "type": "exit",
                "exit_code": result.returncode,
            },
        })

    output_item = {
        "type": "shell_call_output",
        "call_id": shell_call.call_id,
        "output": command_outputs,
    }

    if shell_call.action.max_output_length is not None:
        output_item["max_output_length"] = shell_call.action.max_output_length

    return output_item


if __name__ == "__main__":
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    input_list = [
        {
            "role": "system",
            "content": "You are Safar, a travel planning assistant.",
        }
    ]

    tools = [
        {
            "type": "shell",
            "environment": {
                "type": "local",
                "skills": [
                    {
                        "name": "serpapi-web-search",
                        "description": "Search current travel information with the SerpApi CLI.",
                        "path": str(SKILL_PATH),
                    }
                ],
            },
        }
    ]

    print("Type 'exit' or 'quit' to stop.\n")

    waiting_for_user = True

    while True:

        if waiting_for_user:
            user_query = input("You: ")

            if user_query.lower() in ["exit", "quit"]:
                break

            input_list.append({
                "role": "user",
                "content": user_query,
            })
            waiting_for_user = False

        print("\n[script] Sending request to the model.")
        response = client.responses.create(
            model=MODEL,
            input=input_list,
            tools=tools,
        )

        input_list += response.output

        shell_calls = [item for item in response.output if item.type == "shell_call"]
        print(f"[script] Shell calls requested: {len(shell_calls)}")

        if not shell_calls:
            print(f"Model response: {response.output_text}\n")
            waiting_for_user = True
            continue

        for shell_call in shell_calls:
            input_list.append(run_shell_call(shell_call))

        print("\n[script] Sending shell output back to the model.")
