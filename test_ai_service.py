#!/usr/bin/env python3
"""Test the Enhanced AI MCQ Service"""

import requests
import json
import time

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get('http://127.0.0.1:5002/health', timeout=5)
        print(f"Health Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_ai_generation():
    """Test AI question generation with a bracket problem"""
    try:
        # Sample bracket problem data
        problem_data = {
            "title": "Valid Parentheses",
            "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
            "difficulty_category": "Easy",
            "problem_type": "brackets"
        }
        
        payload = {
            "problem": problem_data
        }
        
        response = requests.post(
            'http://127.0.0.1:5002/generate-mcq',
            json=payload,
            timeout=10
        )
        
        print(f"Generation Status: {response.status_code}")
        result = response.json()
        print(f"Success: {result.get('success', False)}")
        
        if result.get('success'):
            mcq = result.get('mcq', {})
            print(f"Question: {mcq.get('question', 'No question')}")
            print(f"Options: {mcq.get('options', [])}")
            print(f"Correct Answer: {mcq.get('correct_answer', 'No answer')}")
            print(f"Generator Type: {mcq.get('generator', 'Unknown')}")
        else:
            print(f"Error: {result.get('error', 'Unknown error')}")
        
        return result.get('success', False)
        
    except Exception as e:
        print(f"AI generation test failed: {e}")
        return False

def main():
    print("🧪 Testing Enhanced AI MCQ Service...")
    print("=" * 50)
    
    # Wait a moment for service to be ready
    time.sleep(2)
    
    print("1. Testing Health Endpoint...")
    health_ok = test_health()
    print()
    
    if health_ok:
        print("2. Testing AI Question Generation...")
        ai_ok = test_ai_generation()
        print()
        
        if ai_ok:
            print("✅ All tests passed! AI service is working correctly.")
        else:
            print("❌ AI generation test failed.")
    else:
        print("❌ Health check failed. Service may not be running.")

if __name__ == "__main__":
    main()