from openai import OpenAI
import os
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPEN_AI_API")

client = OpenAI(api_key=OPENAI_API_KEY)
conversation = [
    {"role": "system", "content": "You are Jarvis, a helpful AI assistant. Always respond like a personal assistant."}
]

def chat_with_gpt(user_prompt):
    # Add user message
    conversation.append({"role": "user", "content": user_prompt})
    
    # Get response from ChatGPT
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=conversation,
        temperature=0.7,
        max_tokens=300
    )
    
    answer = response.choices[0].message.content
    
    # Append assistant response to conversation
    conversation.append({"role": "assistant", "content": answer})
    
    return answer
