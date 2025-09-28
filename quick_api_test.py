#!/usr/bin/env python3
"""
Quick test of Dynamic AI API
"""

import requests
import json
import time

def test_api():
    """Test the Dynamic AI API"""
    print("🧪 Testing Dynamic AI API...")
    
    # Wait for service to be ready
    time.sleep(2)
    
    try:
        # Test health endpoint
        print("1. Testing health endpoint...")
        response = requests.get("http://localhost:5002/health", timeout=5)
        print(f"   Health Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.text}")
        
        # Test generate endpoint
        print("\n2. Testing generate-mcq endpoint...")
        response = requests.post("http://localhost:5002/generate-mcq", 
                                json={'difficulty': 'Easy'}, 
                                timeout=10)
        print(f"   Generate Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Question: {data.get('question', 'N/A')}")
            print(f"   Source: {data.get('source', 'N/A')}")
            print(f"   Type: {data.get('question_type', 'N/A')}")
            print(f"   Options: {data.get('options', [])}")
            print(f"   Answer: {data.get('answer', 'N/A')}")
            print("   ✅ API working correctly!")
        else:
            print(f"   Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection error: {e}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    test_api()