import os
from dotenv import load_dotenv
load_dotenv()

if __name__ == '__main__':
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    response = client.responses.create(
        model="gpt-5.4-mini",
        input=[
            {
                "role": "system",
                "content": "You are a friendly Python tutor. Refuse all requests unrelated to Python coding",
            },
            {
                "role": "user",
                "content": input("Enter your Python question: "),
            },
        ],
    )
    print(f"Model response: {response.output_text}")
