#!/usr/bin/env python3
"""Test HTTP API endpoints"""

import requests
import json
import time

def test_http_api():
    """Test the full HTTP API functionality"""
    print("🌐 Testing Enhanced AI MCQ Service HTTP API...")
    print("=" * 60)
    
    base_url = "http://127.0.0.1:5002"
    
    try:
        # Test health endpoint
        print("1. 🏥 Testing Health Endpoint...")
        health_response = requests.get(f"{base_url}/health", timeout=5)
        print(f"   Status: {health_response.status_code}")
        print(f"   Response: {health_response.json()}")
        print()
        
        # Test MCQ generation via HTTP
        print("2. 🧠 Testing AI MCQ Generation via HTTP...")
        
        problem_data = {
            "title": "Binary Tree Level Order Traversal",
            "description": "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
            "difficulty_category": "Medium",
            "problem_type": "tree"
        }
        
        payload = {"problem": problem_data}
        
        print(f"   Problem: {problem_data['title']}")
        print(f"   Difficulty: {problem_data['difficulty_category']}")
        print()
        
        # Generate 3 questions via HTTP to show variety
        for i in range(3):
            response = requests.post(
                f"{base_url}/generate-mcq",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    mcq = result.get('mcq', {})
                    print(f"   HTTP Question {i+1}:")
                    print(f"     Q: {mcq.get('question', 'No question')}")
                    print(f"     Options: {mcq.get('options', [])}")
                    print(f"     Answer: {mcq.get('correct_answer', 'No answer')}")
                    print(f"     Session ID: {result.get('session_id', 'None')}")
                    print()
                else:
                    print(f"     Error: {result.get('error', 'Unknown')}")
            else:
                print(f"     HTTP Error: {response.status_code}")
        
        print("✅ HTTP API testing completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to service. Make sure it's running on port 5002.")
    except Exception as e:
        print(f"❌ Error testing HTTP API: {e}")

if __name__ == "__main__":
    test_http_api()