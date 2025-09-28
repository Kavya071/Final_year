"""
Test LeetCode MCQ Service - Verify it generates unique questions
"""

import requests
import json
import time

def test_leetcode_service():
    print("🧪 Testing LeetCode MCQ Service...")
    
    base_url = "http://localhost:5003"
    
    # Test health endpoint
    try:
        health_response = requests.get(f"{base_url}/health")
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"✅ Service is healthy")
            print(f"   Problems available: {health_data.get('problems_available', 'Unknown')}")
        else:
            print(f"❌ Health check failed: {health_response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to service: {e}")
        return
    
    # Test MCQ generation
    session_id = "test_session_123"
    
    print(f"\n🎯 Testing MCQ generation for session: {session_id}")
    
    for i in range(5):
        try:
            mcq_data = {
                "difficulty": "Easy",
                "session_id": session_id
            }
            
            response = requests.post(
                f"{base_url}/generate-mcq",
                json=mcq_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    mcq = result['mcq']
                    print(f"\n📚 Question {i+1}:")
                    print(f"   Problem: {mcq['source_problem']}")
                    print(f"   Question: {mcq['question']}")
                    print(f"   Options: {mcq['options']}")
                    print(f"   Correct: {mcq['options'][mcq['correct']]}")
                    print(f"   Type: {mcq['question_type']}")
                    print(f"   Tags: {', '.join(mcq['source_tags'][:3])}")
                else:
                    print(f"❌ MCQ generation failed: {result.get('error')}")
            else:
                print(f"❌ Request failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error generating MCQ {i+1}: {e}")
        
        time.sleep(0.5)  # Small delay between requests
    
    # Test stats
    try:
        stats_response = requests.get(f"{base_url}/stats")
        if stats_response.status_code == 200:
            stats = stats_response.json()['stats']
            print(f"\n📊 Service Statistics:")
            print(f"   Total problems: {stats['total_problems']}")
            print(f"   Easy: {stats['by_difficulty'].get('Easy', 0)}")
            print(f"   Medium: {stats['by_difficulty'].get('Medium', 0)}")
            print(f"   Hard: {stats['by_difficulty'].get('Hard', 0)}")
            print(f"   Active sessions: {stats['total_sessions']}")
        else:
            print(f"❌ Stats request failed: {stats_response.status_code}")
    except Exception as e:
        print(f"❌ Error getting stats: {e}")

if __name__ == "__main__":
    test_leetcode_service()