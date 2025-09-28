import requests
import json

# Simple test of LeetCode service
try:
    response = requests.post(
        'http://localhost:5003/generate-mcq',
        json={'difficulty': 'Easy', 'session_id': 'test123'},
        timeout=5
    )
    if response.status_code == 200:
        data = response.json()
        print('✅ LeetCode service working!')
        print(f'Question: {data["mcq"]["question"]}')
        print(f'Problem: {data["mcq"]["source_problem"]}')
        print(f'Type: {data["mcq"]["question_type"]}')
    else:
        print(f'❌ Service error: {response.status_code}')
except Exception as e:
    print(f'❌ Connection failed: {e}')