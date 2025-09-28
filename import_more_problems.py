"""
Import more DSA problems with better difficulty distribution
"""
import pymongo
import ssl
from datasets import load_dataset
import time
import random

# MongoDB Atlas connection details
MONGO_CONNECTION_STRING = "mongodb+srv://bhardwajkavya099_db_user:Gfq88i5GvO3WzcRG@cluster0.jx5vysg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "prepai_db"
COLLECTION_NAME = "dsa_problems"

def enhanced_difficulty_categorization(problem):
    """Enhanced difficulty categorization using CALIBRATED thresholds + keyword analysis"""
    name = (problem.get('name', '') or '').lower()
    description = (problem.get('description', '') or '').lower()
    difficulty = problem.get('difficulty', 0) or 0  # Use 'difficulty' field from dataset analysis
    
    # Combine name and description for analysis
    text = f"{name} {description}"
    
    # Expert level keywords and patterns
    expert_keywords = [
        'segment tree', 'fenwick tree', 'binary indexed tree', 'lazy propagation',
        'heavy light decomposition', 'centroid decomposition', 'sqrt decomposition',
        'mo algorithm', 'persistent', 'convex hull', 'computational geometry',
        'suffix array', 'suffix tree', 'z algorithm', 'kmp', 'manacher',
        'flow network', 'max flow', 'min cost max flow', 'bipartite matching',
        'strongly connected components', 'tarjan', 'bridges', 'articulation',
        'fft', 'ntt', 'matrix exponentiation', 'chinese remainder',
        'lucas theorem', 'inclusion exclusion', 'mobius'
    ]
    
    # Hard level keywords
    hard_keywords = [
        'dynamic programming', 'dp', 'memoization', 'knapsack', 'lcs', 'lis',
        'dijkstra', 'bellman ford', 'floyd warshall', 'shortest path', 'mst',
        'kruskal', 'prim', 'union find', 'disjoint set', 'dsu',
        'trie', 'binary search tree', 'balanced tree', 'avl',
        'topological sort', 'dfs', 'bfs', 'cycle detection',
        'binary lifting', 'lca', 'lowest common ancestor', 'euler tour',
        'game theory', 'nim', 'sprague grundy', 'minimax'
    ]
    
    # Medium level keywords
    medium_keywords = [
        'binary search', 'two pointer', 'sliding window', 'prefix sum',
        'greedy', 'sorting', 'merge sort', 'quick sort', 'heap sort',
        'heap', 'priority queue', 'stack', 'queue', 'deque',
        'hash', 'hashmap', 'hashtable', 'recursion', 'backtracking',
        'string matching', 'palindrome', 'subsequence', 'subarray',
        'tree traversal', 'graph', 'connected components'
    ]
    
    # Count keyword matches for each difficulty
    expert_count = sum(1 for keyword in expert_keywords if keyword in text)
    hard_count = sum(1 for keyword in hard_keywords if keyword in text)
    medium_count = sum(1 for keyword in medium_keywords if keyword in text)
    
    # CALIBRATED thresholds based on actual dataset analysis (0-21 range)
    # Using quartile distribution for balanced categorization
    if difficulty > 10:  # Top 25% -> Expert
        difficulty_category = 'Expert'
    elif difficulty > 8:  # 50th-75th percentile -> Hard  
        difficulty_category = 'Hard'
    elif difficulty > 0:  # 25th-50th percentile -> Medium
        difficulty_category = 'Medium'
    else:  # Bottom 25% -> Easy
        difficulty_category = 'Easy'
    
    # Keyword-based enhancement (can override difficulty score)
    if expert_count >= 1:
        keyword_category = 'Expert'
    elif hard_count >= 1:
        keyword_category = 'Hard'
    elif medium_count >= 1:
        keyword_category = 'Medium'
    else:
        keyword_category = 'Easy'
    
    # Final decision: prefer higher difficulty from either method
    categories = ['Easy', 'Medium', 'Hard', 'Expert']
    diff_idx = categories.index(difficulty_category)
    keyword_idx = categories.index(keyword_category)
    
    return categories[max(diff_idx, keyword_idx)]

def map_difficulty(level):
    """Legacy function - keeping for compatibility"""
    if level is None or level <= 800:
        return 'Easy'
    elif level <= 1200:
        return 'Medium'
    elif level <= 1900:
        return 'Hard'
    else:
        return 'Expert'

def clean_text(text):
    """Clean and format text content."""
    if not text:
        return ""
    cleaned = ' '.join(text.split())
    return cleaned[:5000]

def import_more_problems():
    """Import more problems with better difficulty distribution"""
    try:
        # Connect to MongoDB with SSL configuration
        client = pymongo.MongoClient(
            MONGO_CONNECTION_STRING,
            tls=True,
            tlsAllowInvalidCertificates=True
        )
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas")
        
        # Access database and collection
        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        
        # Clear existing collection for fresh start
        collection.delete_many({})
        print("🗑️  Cleared existing problems")
        
        # Load the dataset
        print("📥 Loading DeepMind Code Contests dataset...")
        dataset = load_dataset("deepmind/code_contests", split="train", streaming=True)
        
        # Collect problems with varying difficulties
        problems_to_insert = []
        difficulty_targets = {
            'Easy': 300,      # 300 easy problems
            'Medium': 400,    # 400 medium problems  
            'Hard': 200,      # 200 hard problems
            'Expert': 100     # 100 expert problems
        }
        
        difficulty_counts = {'Easy': 0, 'Medium': 0, 'Hard': 0, 'Expert': 0}
        processed = 0
        total_target = sum(difficulty_targets.values())
        
        print(f"🎯 Target distribution: {difficulty_targets}")
        print("📊 Processing problems...")
        
        for problem in dataset:
            processed += 1
            if processed % 50 == 0:
                print(f"   Processed {processed} problems...")
            
            # Use enhanced difficulty categorization instead of rating-only approach
            difficulty_category = enhanced_difficulty_categorization(problem)
            
            # Check if we need more problems of this difficulty
            if difficulty_counts[difficulty_category] >= difficulty_targets[difficulty_category]:
                continue
            
            # Prepare the document
            problem_doc = {
                'title': clean_text(problem.get('name', '')),
                'description': clean_text(problem.get('description', '')),
                'difficulty_level': problem.get('rating', 0),
                'difficulty_category': difficulty_category,
                'source': 'DeepMind Code Contests',
                'imported_at': time.time(),
                'problem_id': problem.get('id', f"problem_{processed}"),
                'tags': problem.get('tags', []),
                'time_limit': problem.get('time_limit'),
                'memory_limit': problem.get('memory_limit_bytes')
            }
            
            problems_to_insert.append(problem_doc)
            difficulty_counts[difficulty_category] += 1
            
            print(f"   Added {difficulty_category} problem: {problem_doc['title'][:50]}...")
            
            # Check if we have enough problems
            if len(problems_to_insert) >= total_target:
                break
                
            # Stop if we've processed too many problems
            if processed > 30000:  # Process more problems to find variety
                print("   Reached processing limit")
                break
        
        # Insert all problems
        if problems_to_insert:
            result = collection.insert_many(problems_to_insert)
            print(f"\n✅ Successfully imported {len(result.inserted_ids)} problems!")
            
            # Show final distribution
            print("\n📈 Final Difficulty Distribution:")
            for level, count in difficulty_counts.items():
                print(f"   {level}: {count} problems")
        else:
            print("❌ No problems were imported")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error importing problems: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Importing more DSA problems with 4-tier difficulty system...")
    success = import_more_problems()
    if success:
        print("✅ Import completed successfully!")
    else:
        print("❌ Import failed.")