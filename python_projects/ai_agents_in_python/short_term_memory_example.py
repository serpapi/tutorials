import os
from dotenv import load_dotenv
load_dotenv()

if __name__ == '__main__':
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    conversation_history = []

    while True:
        user_query = input("You: ")

        if user_query.lower() in ["exit", "quit"]:
            break

        conversation_history.append({
            "role": "user",
            "content": user_query,
        })

        response = client.responses.create(
            model="gpt-5.4-mini",
            input=conversation_history,
        )

        assistant_reply = response.output_text
        print(f"Model: {assistant_reply}")

        conversation_history.append({
            "role": "assistant",
            "content": assistant_reply,
        })
