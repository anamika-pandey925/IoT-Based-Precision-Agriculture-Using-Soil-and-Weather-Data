import os
from google import genai
import sys

# mimic app.py logic
api_key = os.environ.get("GEMINI_API_KEY")

print(f"Checking GEMINI_API_KEY...")
if not api_key:
    print("Result: FAIL. The environment variable 'GEMINI_API_KEY' is NOT set.")
    print("Please set it in your system or terminal.")
    sys.exit(1)

print(f"API Key found (length: {len(api_key)}). Testing connection to 'gemini-2.0-flash-exp'...")

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents="Reply with 'OK' if you can hear me."
    )
    print(f"Result: SUCCESS. Model responded: {response.text}")
except Exception as e:
    print(f"Result: FAIL. Error Message: {e}")
