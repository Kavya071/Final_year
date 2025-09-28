import requests
import json

# Test the enhanced AI MCQ service
def test_enhanced_mcq_service():
    print("🧪 Testing Enhanced AI MCQ Service...")
    
    # Test data
    test_problem = {
        "name": "Two Sum",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "difficulty_category": "Easy"
    }
    
    try:
        # Test health check
        health_response = requests.get('http://localhost:5001/health')
        print(f"Health Check: {health_response.status_code}")
        if health_response.status_code == 200:
            print(f"Service Status: {health_response.json()}")
        
        # Test MCQ generation
        mcq_response = requests.post(
            'http://localhost:5001/generate-mcq',
            json={'problem': test_problem},
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"MCQ Generation: {mcq_response.status_code}")
        
        if mcq_response.status_code == 200:
            result = mcq_response.json()
            print("✅ SUCCESS!")
            print(f"Generated MCQ:")
            print(f"Question: {result['mcq']['question']}")
            print(f"Options: {result['mcq']['options']}")
            print(f"Correct Answer: {result['mcq']['correct']} ({result['mcq']['options'][result['mcq']['correct']]})")
            print(f"Explanation: {result['mcq']['explanation']}")
            if 'source_concepts' in result['mcq']:
                print(f"Concepts: {result['mcq']['source_concepts']}")
            print(f"Difficulty: {result['mcq']['difficulty']}")
        else:
            print(f"❌ FAILED: {mcq_response.text}")
    
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - Enhanced AI service not running")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_enhanced_mcq_service()