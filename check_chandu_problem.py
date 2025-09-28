from pymongo import MongoClient
import json

# Connect to MongoDB
client = MongoClient("mongodb+srv://bhardwajkavya099_db_user:Gfq88i5GvO3WzcRG@cluster0.jx5vysg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client['prepai_db']
collection = db['dsa_problems']

# Find the specific problem
problem = collection.find_one({"name": "chandu-and-his-girlfriend-returns"})
if problem:
    print("Found problem:")
    print(f"Name: {problem.get('name', 'N/A')}")
    print(f"Title: {problem.get('title', 'N/A')}")
    print(f"Difficulty: {problem.get('difficulty_category', 'N/A')}")
    print(f"Description: {str(problem.get('description', 'N/A'))[:300]}...")
    print(f"Tags: {problem.get('tags', 'N/A')}")
    print(f"Problem Type: {problem.get('problemType', 'N/A')}")
else:
    print("Problem not found")
    # Let's see what problems we do have
    sample_problems = list(collection.find({}).limit(3))
    print("Sample problems in database:")
    for p in sample_problems:
        print(f"- {p.get('name', 'N/A')} ({p.get('title', 'N/A')})")