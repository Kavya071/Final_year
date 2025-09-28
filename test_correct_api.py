#!/usr/bin/env python3
"""
Test Dynamic AI with proper API calls
"""

import requests
import json
import time

def test_dynamic_ai_properly():
    """Test Dynamic AI with correct API calls"""
    print("🧪 Testing Dynamic AI with Correct API Format...")
    
    base_url = "http://localhost:5002"
    
    try:
        # First, let's check the stats to see available problems
        print("1. Checking available problems...")
        response = requests.get(f"{base_url}/stats", timeout=5)
        if response.status_code == 200:
            stats = response.json()
            print(f"   Stats: {json.dumps(stats, indent=2)}")
        else:
            print(f"   Stats Error: {response.status_code}")
        
        # Let's use the test_dynamic_ai.py approach since that was working
        print("\n2. Running our existing test script...")
        
    except Exception as e:
        print(f"   Error: {e}")

def generate_with_mock_problem():
    """Generate question with a mock problem"""
    print("\n🔬 Testing with Mock Problem Data...")
    
    mock_problem = {
        "title": "Test Problem",
        "description": "Test problem for dynamic AI generation",
        "difficulty_category": "Easy",
        "source": "Test Suite"
    }
    
    try:
        response = requests.post(
            "http://localhost:5002/generate-mcq",
            json={
                "problem": mock_problem,
                "session_id": "test-session-123"
            },
            timeout=10
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            mcq = data.get('mcq', {})
            print(f"   Question: {mcq.get('question', 'N/A')}")
            print(f"   Source: {mcq.get('source', 'N/A')}")
            print(f"   Generator: {mcq.get('generator', 'N/A')}")
            print("   ✅ Mock test successful!")
        else:
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == "__main__":
    test_dynamic_ai_properly()
    generate_with_mock_problem()