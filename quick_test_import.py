"""
Quick import script with synthetic problems for testing the 4-tier difficulty system
"""
import pymongo
import ssl
import time

# MongoDB Atlas connection details
MONGO_CONNECTION_STRING = "mongodb+srv://bhardwajkavya099_db_user:Gfq88i5GvO3WzcRG@cluster0.jx5vysg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "prepai_db"
COLLECTION_NAME = "dsa_problems"

def create_test_problems():
    """Create test problems for each difficulty level"""
    
    easy_problems = [
        {
            "name": "Two Sum",
            "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "difficulty": 800,
            "difficulty_category": "Easy"
        },
        {
            "name": "Palindrome Check",
            "description": "Write a function to check if a given string is a palindrome.",
            "difficulty": 600,
            "difficulty_category": "Easy"
        },
        {
            "name": "Find Maximum",
            "description": "Find the maximum element in an array using linear search.",
            "difficulty": 500,
            "difficulty_category": "Easy"
        },
        {
            "name": "Count Characters",
            "description": "Count frequency of each character in a string using basic counting.",
            "difficulty": 700,
            "difficulty_category": "Easy"
        },
        {
            "name": "Simple Sorting",
            "description": "Sort an array using bubble sort algorithm.",
            "difficulty": 750,
            "difficulty_category": "Easy"
        }
    ]
    
    medium_problems = [
        {
            "name": "Binary Search Implementation",
            "description": "Implement binary search on a sorted array to find target element.",
            "difficulty": 1200,
            "difficulty_category": "Medium"
        },
        {
            "name": "Valid Parentheses",
            "description": "Check if parentheses are balanced using stack data structure.",
            "difficulty": 1100,
            "difficulty_category": "Medium"
        },
        {
            "name": "Merge Sorted Arrays",
            "description": "Merge two sorted arrays into one sorted array using two pointers.",
            "difficulty": 1300,
            "difficulty_category": "Medium"
        },
        {
            "name": "Sliding Window Maximum",
            "description": "Find maximum in every sliding window of size k using sliding window technique.",
            "difficulty": 1400,
            "difficulty_category": "Medium"
        },
        {
            "name": "Tree Level Order",
            "description": "Perform level order traversal of binary tree using queue.",
            "difficulty": 1250,
            "difficulty_category": "Medium"
        }
    ]
    
    hard_problems = [
        {
            "name": "Longest Common Subsequence",
            "description": "Find longest common subsequence using dynamic programming approach.",
            "difficulty": 1700,
            "difficulty_category": "Hard"
        },
        {
            "name": "Dijkstra's Shortest Path",
            "description": "Find shortest path in weighted graph using Dijkstra's algorithm.",
            "difficulty": 1800,
            "difficulty_category": "Hard"
        },
        {
            "name": "Union Find Operations",
            "description": "Implement disjoint set union with path compression and union by rank.",
            "difficulty": 1650,
            "difficulty_category": "Hard"
        },
        {
            "name": "Topological Sort",
            "description": "Perform topological sorting on directed acyclic graph using DFS.",
            "difficulty": 1750,
            "difficulty_category": "Hard"
        },
        {
            "name": "Binary Search Tree Validation",
            "description": "Validate if a binary tree is a valid binary search tree.",
            "difficulty": 1600,
            "difficulty_category": "Hard"
        }
    ]
    
    expert_problems = [
        {
            "name": "Segment Tree Range Updates",
            "description": "Implement segment tree with lazy propagation for range updates and queries.",
            "difficulty": 2200,
            "difficulty_category": "Expert"
        },
        {
            "name": "Maximum Flow Network",
            "description": "Find maximum flow in flow network using Ford-Fulkerson with Edmonds-Karp.",
            "difficulty": 2300,
            "difficulty_category": "Expert"
        },
        {
            "name": "Suffix Array Construction",
            "description": "Build suffix array using efficient O(n log n) algorithm.",
            "difficulty": 2400,
            "difficulty_category": "Expert"
        },
        {
            "name": "Heavy Light Decomposition",
            "description": "Decompose tree using heavy light decomposition for efficient path queries.",
            "difficulty": 2500,
            "difficulty_category": "Expert"
        },
        {
            "name": "Convex Hull Algorithm",
            "description": "Find convex hull of points using Graham scan algorithm.",
            "difficulty": 2100,
            "difficulty_category": "Expert"
        }
    ]
    
    return easy_problems, medium_problems, hard_problems, expert_problems

def import_test_problems():
    """Import balanced test problems for demonstration"""
    try:
        # Connect to MongoDB
        client = pymongo.MongoClient(
            MONGO_CONNECTION_STRING,
            tls=True,
            tlsAllowInvalidCertificates=True
        )
        
        client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas")
        
        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        
        # Clear existing problems
        collection.delete_many({})
        print("🗑️  Cleared existing problems")
        
        # Get test problems
        easy, medium, hard, expert = create_test_problems()
        
        # Add metadata to all problems
        all_problems = []
        problem_id = 1
        
        for difficulty_level, problems in [("Easy", easy), ("Medium", medium), ("Hard", hard), ("Expert", expert)]:
            for problem in problems:
                problem_doc = {
                    **problem,
                    "source": "Test Problems for 4-Tier System",
                    "imported_at": time.time(),
                    "problem_id": problem_id
                }
                all_problems.append(problem_doc)
                problem_id += 1
                print(f"   Added {difficulty_level} problem: {problem['name']}")
        
        # Insert all problems
        result = collection.insert_many(all_problems)
        print(f"\n✅ Successfully imported {len(result.inserted_ids)} problems!")
        
        # Show distribution
        difficulty_counts = {'Easy': 0, 'Medium': 0, 'Hard': 0, 'Expert': 0}
        for problem in all_problems:
            difficulty_counts[problem['difficulty_category']] += 1
        
        print("\n📈 Final Difficulty Distribution:")
        for level, count in difficulty_counts.items():
            percentage = (count / len(all_problems)) * 100
            print(f"   {level}: {count} problems ({percentage:.1f}%)")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error importing problems: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Importing balanced test problems for 4-tier difficulty system...")
    success = import_test_problems()
    if success:
        print("✅ Test problems imported successfully!")
        print("\n🎯 Now you can test the adaptive difficulty system:")
        print("   1. Start with Easy problems")
        print("   2. Get 3 correct → Move to Medium")
        print("   3. Get 3 correct → Move to Hard") 
        print("   4. Get 3 correct → Move to Expert")
    else:
        print("❌ Failed to import test problems.")