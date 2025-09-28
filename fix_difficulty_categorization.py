#!/usr/bin/env python3
"""
Fix Difficulty Categorization Issues
Comprehensive analysis and correction of difficulty mappings
"""

import pymongo
from collections import defaultdict
import re

class DifficultyAnalyzer:
    """Analyze and fix difficulty categorization issues"""
    
    def __init__(self):
        self.client = pymongo.MongoClient(
            "mongodb+srv://bhardwajkavya099_db_user:Gfq88i5GvO3WzcRG@cluster0.jx5vysg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            tls=True,
            tlsAllowInvalidCertificates=True
        )
        self.db = self.client['prepai_db']
        self.collection = self.db['dsa_problems']
        
        # Define keyword patterns for each difficulty level
        self.expert_patterns = [
            r'segment tree', r'fenwick tree', r'suffix array', r'suffix tree',
            r'fft', r'ntt', r'convex hull', r'heavy light', r'centroid',
            r'persistent', r'flow network', r'max flow', r'min cost',
            r'strongly connected', r'articulation', r'bridges',
            r'matrix exponentiation', r'chinese remainder', r'mobius',
            r'inclusion exclusion', r'lucas theorem'
        ]
        
        self.hard_patterns = [
            r'dynamic programming', r'\bdp\b', r'memoization',
            r'dijkstra', r'bellman ford', r'floyd warshall',
            r'topological sort', r'binary lifting', r'\blca\b',
            r'lowest common ancestor', r'union find', r'\bdsu\b',
            r'disjoint set', r'trie', r'game theory', r'nim',
            r'sprague grundy', r'minimax', r'kruskal', r'prim',
            r'\bmst\b', r'minimum spanning'
        ]
        
        self.medium_patterns = [
            r'binary search', r'two pointer', r'sliding window',
            r'greedy', r'heap', r'priority queue', r'stack', r'queue',
            r'\bdfs\b', r'\bbfs\b', r'backtracking', r'recursion',
            r'sorting', r'merge sort', r'quick sort'
        ]
    
    def analyze_current_distribution(self):
        """Analyze current difficulty distribution"""
        print("🔍 Analyzing Current Difficulty Distribution...")
        print("=" * 60)
        
        # Get distribution
        pipeline = [
            {"$group": {
                "_id": "$difficulty_category",
                "count": {"$sum": 1},
                "avg_level": {"$avg": "$difficulty_level"},
                "min_level": {"$min": "$difficulty_level"},
                "max_level": {"$max": "$difficulty_level"}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        results = list(self.collection.aggregate(pipeline))
        
        print("📊 Current Distribution:")
        total_problems = 0
        for result in results:
            category = result['_id'] or 'Unknown'
            count = result['count']
            avg_level = result.get('avg_level', 0) or 0
            min_level = result.get('min_level', 0) or 0
            max_level = result.get('max_level', 0) or 0
            
            print(f"   {category:>7}: {count:>3} problems (avg: {avg_level:.1f}, range: {min_level}-{max_level})")
            total_problems += count
        
        print(f"\n📈 Total: {total_problems} problems")
        return results
    
    def find_misclassified_problems(self):
        """Find problems that might be misclassified"""
        print("\n🔍 Identifying Misclassified Problems...")
        
        all_problems = list(self.collection.find({}, {
            'title': 1, 
            'description': 1,
            'difficulty_category': 1,
            'difficulty_level': 1,
            'source': 1
        }))
        
        misclassified = []
        
        for problem in all_problems:
            title = problem.get('title', '').lower()
            description = problem.get('description', '').lower()
            text = f"{title} {description}"
            current_category = problem.get('difficulty_category', 'Unknown')
            difficulty_level = problem.get('difficulty_level', 0)
            
            suggested_category = self._suggest_difficulty(text, difficulty_level)
            
            if suggested_category != current_category:
                confidence = self._calculate_confidence(text, suggested_category)
                
                if confidence >= 0.7:  # High confidence threshold
                    misclassified.append({
                        'title': problem.get('title', ''),
                        'current': current_category,
                        'suggested': suggested_category,
                        'confidence': confidence,
                        'difficulty_level': difficulty_level,
                        'source': problem.get('source', ''),
                        '_id': problem['_id']
                    })
        
        # Sort by confidence (highest first)
        misclassified.sort(key=lambda x: x['confidence'], reverse=True)
        
        print(f"⚠️  Found {len(misclassified)} potentially misclassified problems")
        
        if misclassified:
            print("\n🔍 Top 10 Misclassification Issues:")
            for i, issue in enumerate(misclassified[:10], 1):
                print(f"   {i}. '{issue['title'][:40]}...'")
                print(f"      {issue['current']} → {issue['suggested']} (confidence: {issue['confidence']:.2f})")
                print(f"      Level: {issue['difficulty_level']}, Source: {issue['source']}")
                print()
        
        return misclassified
    
    def _suggest_difficulty(self, text, difficulty_level):
        """Suggest difficulty category based on text analysis and level"""
        
        # Count pattern matches
        expert_matches = sum(1 for pattern in self.expert_patterns if re.search(pattern, text, re.IGNORECASE))
        hard_matches = sum(1 for pattern in self.hard_patterns if re.search(pattern, text, re.IGNORECASE))
        medium_matches = sum(1 for pattern in self.medium_patterns if re.search(pattern, text, re.IGNORECASE))
        
        # Weight by difficulty level (0-21 range observed)
        level_weight = 0
        if difficulty_level > 15:
            level_weight = 3  # Expert
        elif difficulty_level > 10:
            level_weight = 2  # Hard
        elif difficulty_level > 5:
            level_weight = 1  # Medium
        else:
            level_weight = 0  # Easy
        
        # Calculate scores
        expert_score = expert_matches * 3 + (1 if level_weight == 3 else 0)
        hard_score = hard_matches * 2 + (1 if level_weight == 2 else 0)
        medium_score = medium_matches * 1 + (1 if level_weight == 1 else 0)
        
        # Determine suggested category
        if expert_score >= 3:
            return 'Expert'
        elif hard_score >= 2:
            return 'Hard'
        elif medium_score >= 1:
            return 'Medium'
        else:
            return 'Easy'
    
    def _calculate_confidence(self, text, suggested_category):
        """Calculate confidence in the suggestion"""
        expert_matches = sum(1 for pattern in self.expert_patterns if re.search(pattern, text, re.IGNORECASE))
        hard_matches = sum(1 for pattern in self.hard_patterns if re.search(pattern, text, re.IGNORECASE))
        medium_matches = sum(1 for pattern in self.medium_patterns if re.search(pattern, text, re.IGNORECASE))
        
        total_matches = expert_matches + hard_matches + medium_matches
        
        if suggested_category == 'Expert' and expert_matches >= 2:
            return min(0.9, 0.5 + expert_matches * 0.2)
        elif suggested_category == 'Hard' and hard_matches >= 2:
            return min(0.9, 0.5 + hard_matches * 0.15)
        elif suggested_category == 'Medium' and medium_matches >= 1:
            return min(0.8, 0.4 + medium_matches * 0.2)
        elif suggested_category == 'Easy' and total_matches == 0:
            return 0.7
        else:
            return 0.3
    
    def fix_categorization(self, misclassified_problems, auto_fix=True):
        """Fix difficulty categorization"""
        
        if not misclassified_problems:
            print("✅ No fixes needed!")
            return
        
        if not auto_fix:
            print(f"\n❓ Found {len(misclassified_problems)} issues. Manual review recommended.")
            return
        
        print(f"\n🔧 Fixing {len(misclassified_problems)} categorization issues...")
        
        # Only fix high-confidence issues
        high_confidence = [p for p in misclassified_problems if p['confidence'] >= 0.8]
        
        fixed_count = 0
        for problem in high_confidence:
            try:
                result = self.collection.update_one(
                    {'_id': problem['_id']},
                    {'$set': {'difficulty_category': problem['suggested']}}
                )
                
                if result.modified_count > 0:
                    fixed_count += 1
                    print(f"   ✅ '{problem['title'][:30]}...' → {problem['suggested']}")
                
            except Exception as e:
                print(f"   ❌ Error fixing '{problem['title'][:30]}...': {e}")
        
        print(f"\n🎯 Fixed {fixed_count} high-confidence issues!")
        
        # Show updated distribution
        print("\n📊 Updated Distribution:")
        self.analyze_current_distribution()
    
    def balance_distribution(self):
        """Balance the difficulty distribution to target ratios"""
        print("\n⚖️  Balancing Difficulty Distribution...")
        
        # Target distribution (total 1000 problems)
        targets = {
            'Easy': 300,    # 30%
            'Medium': 400,  # 40%
            'Hard': 200,    # 20%
            'Expert': 100   # 10%
        }
        
        current = {}
        for category in targets.keys():
            count = self.collection.count_documents({'difficulty_category': category})
            current[category] = count
        
        print("🎯 Target vs Current:")
        total_current = sum(current.values())
        
        for category in ['Easy', 'Medium', 'Hard', 'Expert']:
            target = targets[category]
            curr = current[category]
            diff = curr - target
            status = "✅" if abs(diff) <= 10 else "⚠️" if abs(diff) <= 50 else "❌"
            
            print(f"   {category:>6}: {curr:>3}/{target:>3} ({diff:+3}) {status}")
        
        print(f"\n📈 Total: {total_current}/1000")
        
        # Suggest rebalancing if needed
        major_imbalances = [cat for cat, diff in 
                          [(cat, current[cat] - targets[cat]) for cat in targets.keys()]
                          if abs(diff) > 50]
        
        if major_imbalances:
            print(f"\n⚠️  Major imbalances detected in: {', '.join(major_imbalances)}")
            print("   Consider running import script with adjusted targets")
        else:
            print("\n✅ Distribution is reasonably balanced!")
    
    def close(self):
        """Close database connection"""
        self.client.close()

def main():
    print("🚀 Difficulty Categorization Fix Tool")
    print("=" * 60)
    
    analyzer = DifficultyAnalyzer()
    
    try:
        # Analyze current state
        analyzer.analyze_current_distribution()
        
        # Find misclassified problems
        misclassified = analyzer.find_misclassified_problems()
        
        # Fix high-confidence issues automatically
        analyzer.fix_categorization(misclassified, auto_fix=True)
        
        # Check distribution balance
        analyzer.balance_distribution()
        
        print("\n✅ Difficulty categorization analysis and fixes completed!")
        
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        analyzer.close()

if __name__ == "__main__":
    main()