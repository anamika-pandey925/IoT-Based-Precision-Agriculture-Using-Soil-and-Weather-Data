
import requests
import sys

try:
    print("Checking /api/scan endpoint...")
    response = requests.post('http://localhost:5000/api/scan', timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("SUCCESS: Endpoint is working.")
    else:
        print("FAILURE: Endpoint returned non-200 status.")
        
except Exception as e:
    print(f"FAILURE: Could not connect to server. Error: {e}")
