"""
Enhanced import script for 1500+ DSA problems with intelligent categorization
"""
import pymongo
import ssl
import time
import random
from datasets import load_dataset

# MongoDB Atlas connection details
MONGO_CONNECTION_STRING = "mongodb+srv://bhardwajkavya099_db_user:Gfq88i5GvO3WzcRG@cluster0.jx5vysg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "prepai_db"
COLLECTION_NAME = "dsa_problems"

def enhanced_difficulty_categorization(problem):
    """Enhanced difficulty categorization using CALIBRATED thresholds + keyword analysis"""
    name = (problem.get('name', '') or '').lower()
    description = (problem.get('description', '') or '').lower()
    difficulty = problem.get('difficulty', 0) or 0
    
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

def import_enhanced_problems():
    """Import 1500+ problems with smart categorization"""
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
        
        # Target distribution for 1500 problems
        target_distribution = {
            'Easy': 500,      # 33% - Good foundation
            'Medium': 600,    # 40% - Main focus  
            'Hard': 300,      # 20% - Challenge
            'Expert': 100     # 7% - Elite level
        }
        
        print(f"🎯 Target distribution: {target_distribution}")
        print(f"📊 Total target: {sum(target_distribution.values())} problems")
        
        # Load dataset
        print("📥 Loading DeepMind Code Contests dataset...")
        dataset = load_dataset('deepmind/code_contests', split='train', streaming=True)
        
        # Counters and storage
        difficulty_counts = {'Easy': 0, 'Medium': 0, 'Hard': 0, 'Expert': 0}
        problems_to_insert = []
        processed_count = 0
        max_processing = 15000  # Process up to 15k to find our 1500
        
        print("🔄 Processing problems...")
        
        for problem in dataset:
            if processed_count >= max_processing:
                break
                
            # Check if we've reached all targets
            if all(difficulty_counts[diff] >= target_distribution[diff] for diff in target_distribution):
                print("✅ All targets reached!")
                break
            
            try:
                # Categorize difficulty
                difficulty_category = enhanced_difficulty_categorization(problem)
                
                # Skip if this category is full
                if difficulty_counts[difficulty_category] >= target_distribution[difficulty_category]:
                    processed_count += 1
                    continue
                
                # Extract problem data
                problem_name = problem.get('name', f'Problem_{processed_count}')
                problem_description = problem.get('description', 'No description available')
                
                # Clean and prepare data
                problem_doc = {
                    "name": str(problem_name)[:200],  # Limit length
                    "title": str(problem_name)[:200],
                    "description": str(problem_description)[:2000],  # Limit description
                    "difficulty": problem.get('difficulty', 0),
                    "difficulty_category": difficulty_category,
                    "source": "DeepMind Code Contests",
                    "imported_at": time.time(),
                    "problem_id": len(problems_to_insert) + 1,
                    # Additional metadata for MCQ generation
                    "tags": [],
                    "complexity_hint": get_complexity_hint(difficulty_category),
                    "algorithm_type": extract_algorithm_type(problem_name, problem_description)
                }
                
                problems_to_insert.append(problem_doc)
                difficulty_counts[difficulty_category] += 1
                
                # Progress update
                if len(problems_to_insert) % 100 == 0:
                    total_collected = sum(difficulty_counts.values())
                    print(f"   Collected {total_collected} problems: Easy({difficulty_counts['Easy']}) Medium({difficulty_counts['Medium']}) Hard({difficulty_counts['Hard']}) Expert({difficulty_counts['Expert']})")
                
            except Exception as e:
                print(f"⚠️  Error processing problem {processed_count}: {e}")
            
            processed_count += 1
        
        # Insert all problems
        if problems_to_insert:
            print(f"\n💾 Inserting {len(problems_to_insert)} problems into database...")
            result = collection.insert_many(problems_to_insert)
            print(f"✅ Successfully inserted {len(result.inserted_ids)} problems!")
            
            # Final distribution
            print(f"\n📈 Final Distribution:")
            for level, count in difficulty_counts.items():
                percentage = (count / len(problems_to_insert)) * 100
                print(f"   {level}: {count} problems ({percentage:.1f}%)")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def get_complexity_hint(difficulty):
    """Get time complexity hint based on difficulty"""
    hints = {
        'Easy': ['O(n)', 'O(1)', 'O(log n)'],
        'Medium': ['O(n log n)', 'O(n)', 'O(n²)'],
        'Hard': ['O(n log n)', 'O(n²)', 'O(n³)'],
        'Expert': ['O(n log n)', 'O(n²)', 'Complex']
    }
    return random.choice(hints.get(difficulty, ['O(n)']))

def extract_algorithm_type(name, description):
    """Extract algorithm type from problem name/description"""
    text = f"{name} {description}".lower()
    
    if any(word in text for word in ['sort', 'order']):
        return 'Sorting'
    elif any(word in text for word in ['graph', 'tree', 'node']):
        return 'Graph/Tree'
    elif any(word in text for word in ['dp', 'dynamic', 'memo']):
        return 'Dynamic Programming'
    elif any(word in text for word in ['string', 'char', 'substring']):
        return 'String Processing'
    elif any(word in text for word in ['array', 'list', 'element']):
        return 'Array/List'
    else:
        return 'General'

if __name__ == "__main__":
    print("🚀 Starting enhanced problem import...")
    success = import_enhanced_problems()
    if success:
        print("✅ Enhanced import completed successfully!")
    else:
        print("❌ Import failed.")