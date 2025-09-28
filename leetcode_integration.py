"""
LeetCode Integration Service - Fetches Real Competitive Programming Problems
Uses LeetCode's GraphQL API to get authentic problem data
"""

import requests
import json
import time
import random
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class LeetCodeProblem:
    title: str
    title_slug: str
    difficulty: str
    description: str
    tags: List[str]
    hints: List[str]
    similar_questions: List[str]
    acceptance_rate: float
    frequency: float

class LeetCodeAPIClient:
    """Client for LeetCode GraphQL API"""
    
    def __init__(self):
        self.base_url = "https://leetcode.com/graphql"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com'
        })
        self.problems_cache = {}
        
    def get_all_problems(self) -> List[Dict]:
        """Get list of all LeetCode problems"""
        query = """
        query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
          ) {
            total: totalNum
            questions: data {
              acRate
              difficulty
              freqBar
              frontendQuestionId: questionFrontendId
              isFavor
              paidOnly: isPaidOnly
              status
              title
              titleSlug
              topicTags {
                name
                id
                slug
              }
              hasSolution
              hasVideoSolution
            }
          }
        }
        """
        
        variables = {
            "categorySlug": "",
            "skip": 0,
            "limit": 2000,
            "filters": {}
        }
        
        try:
            response = self.session.post(
                self.base_url,
                json={'query': query, 'variables': variables}
            )
            response.raise_for_status()
            data = response.json()
            
            if 'data' in data and 'problemsetQuestionList' in data['data']:
                problems = data['data']['problemsetQuestionList']['questions']
                # Filter out paid-only problems
                free_problems = [p for p in problems if not p.get('paidOnly', False)]
                print(f"✅ Found {len(free_problems)} free LeetCode problems")
                return free_problems
            else:
                print("❌ No problems found in response")
                return []
                
        except Exception as e:
            print(f"❌ Error fetching problems: {e}")
            return []
    
    def get_problem_details(self, title_slug: str) -> Optional[Dict]:
        """Get detailed information about a specific problem"""
        if title_slug in self.problems_cache:
            return self.problems_cache[title_slug]
            
        query = """
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            questionFrontendId
            title
            titleSlug
            content
            translatedTitle
            translatedContent
            isPaidOnly
            difficulty
            likes
            dislikes
            isLiked
            similarQuestions
            exampleTestcases
            categoryTitle
            contributors {
              username
              profileUrl
              avatarUrl
              __typename
            }
            topicTags {
              name
              slug
              translatedName
              __typename
            }
            companyTagStats
            codeSnippets {
              lang
              langSlug
              code
              __typename
            }
            stats
            hints
            solution {
              id
              canSeeDetail
              paidOnly
              __typename
            }
            status
            sampleTestCase
            metaData
            judgerAvailable
            judgeType
            mysqlSchemas
            enableRunCode
            enableTestMode
            enableDebugger
            envInfo
            libraryUrl
            adminUrl
            challengeQuestion {
              id
              date
              incompleteChallengeCount
              streakCount
              type
              __typename
            }
            __typename
          }
        }
        """
        
        variables = {"titleSlug": title_slug}
        
        try:
            response = self.session.post(
                self.base_url,
                json={'query': query, 'variables': variables}
            )
            response.raise_for_status()
            data = response.json()
            
            if 'data' in data and 'question' in data['data']:
                problem_data = data['data']['question']
                self.problems_cache[title_slug] = problem_data
                return problem_data
            else:
                print(f"❌ No details found for {title_slug}")
                return None
                
        except Exception as e:
            print(f"❌ Error fetching problem details for {title_slug}: {e}")
            return None
    
    def get_problems_by_difficulty(self, difficulty: str, limit: int = 50) -> List[LeetCodeProblem]:
        """Get problems filtered by difficulty"""
        all_problems = self.get_all_problems()
        
        if not all_problems:
            return []
        
        # Filter by difficulty
        difficulty_map = {
            'Easy': 'Easy',
            'Medium': 'Medium', 
            'Hard': 'Hard'
        }
        
        target_difficulty = difficulty_map.get(difficulty, 'Medium')
        filtered_problems = [p for p in all_problems if p['difficulty'] == target_difficulty]
        
        # Randomly select problems
        selected = random.sample(filtered_problems, min(limit, len(filtered_problems)))
        
        # Convert to LeetCodeProblem objects
        leetcode_problems = []
        for problem in selected:
            # Get detailed description
            details = self.get_problem_details(problem['titleSlug'])
            
            leetcode_prob = LeetCodeProblem(
                title=problem['title'],
                title_slug=problem['titleSlug'],
                difficulty=problem['difficulty'],
                description=details.get('content', '') if details else '',
                tags=[tag['name'] for tag in problem.get('topicTags', [])],
                hints=details.get('hints', []) if details else [],
                similar_questions=details.get('similarQuestions', []) if details else [],
                acceptance_rate=float(problem.get('acRate', 0) or 0),
                frequency=float(problem.get('freqBar') or 0)
            )
            
            leetcode_problems.append(leetcode_prob)
            
            # Add delay to avoid rate limiting
            time.sleep(0.5)
            
        return leetcode_problems

class LeetCodeQuestionGenerator:
    """Generate MCQ questions from real LeetCode problems"""
    
    def __init__(self):
        self.api_client = LeetCodeAPIClient()
        self.question_templates = {
            'algorithm_identification': [
                "What algorithm would be most suitable for solving '{title}'?",
                "Which approach would you choose to solve '{title}' efficiently?",
                "What is the optimal algorithm for '{title}'?"
            ],
            'time_complexity': [
                "What is the time complexity of the optimal solution for '{title}'?",
                "What is the expected time complexity for solving '{title}'?",
                "Which time complexity represents the best solution for '{title}'?"
            ],
            'data_structure': [
                "Which data structure would be most helpful in solving '{title}'?",
                "What is the key data structure needed for '{title}'?",
                "Which data structure provides the best performance for '{title}'?"
            ],
            'pattern_recognition': [
                "What pattern does '{title}' represent?",
                "Which algorithmic pattern is demonstrated in '{title}'?",
                "What type of problem is '{title}'?"
            ],
            'optimization': [
                "How can you optimize the solution for '{title}'?",
                "What optimization technique applies to '{title}'?",
                "Which approach reduces complexity in '{title}'?"
            ]
        }
        
    def analyze_problem_content(self, problem: LeetCodeProblem) -> Dict[str, any]:
        """Analyze problem to determine question type and content"""
        content_lower = problem.description.lower()
        tags_lower = [tag.lower() for tag in problem.tags]
        
        analysis = {
            'question_type': 'algorithm_identification',
            'focus_area': 'general',
            'suggested_algorithms': [],
            'key_concepts': []
        }
        
        # Determine question type based on content
        if any(word in content_lower for word in ['tree', 'binary', 'node', 'leaf']):
            analysis['question_type'] = 'data_structure'
            analysis['focus_area'] = 'trees'
            analysis['suggested_algorithms'] = ['DFS', 'BFS', 'Tree Traversal', 'Binary Search']
            
        elif any(word in content_lower for word in ['graph', 'connected', 'path', 'edge']):
            analysis['question_type'] = 'algorithm_identification'
            analysis['focus_area'] = 'graphs'
            analysis['suggested_algorithms'] = ['BFS', 'DFS', 'Dijkstra', 'Union Find']
            
        elif any(word in content_lower for word in ['sort', 'order', 'arrange']):
            analysis['question_type'] = 'algorithm_identification'
            analysis['focus_area'] = 'sorting'
            analysis['suggested_algorithms'] = ['Merge Sort', 'Quick Sort', 'Heap Sort', 'Counting Sort']
            
        elif any(word in content_lower for word in ['dynamic', 'optimal', 'minimum', 'maximum']):
            analysis['question_type'] = 'optimization'
            analysis['focus_area'] = 'dynamic_programming'
            analysis['suggested_algorithms'] = ['Dynamic Programming', 'Memoization', 'Greedy', 'Backtracking']
            
        elif any(word in content_lower for word in ['hash', 'map', 'dictionary', 'lookup']):
            analysis['question_type'] = 'data_structure'
            analysis['focus_area'] = 'hashing'
            analysis['suggested_algorithms'] = ['Hash Map', 'Hash Set', 'Two Pointers', 'Sliding Window']
            
        # Determine time complexity based on difficulty and content
        if problem.difficulty == 'Easy':
            analysis['expected_complexity'] = ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)']
        elif problem.difficulty == 'Medium':
            analysis['expected_complexity'] = ['O(n log n)', 'O(n²)', 'O(n)', 'O(n³)']
        else:  # Hard
            analysis['expected_complexity'] = ['O(n²)', 'O(n³)', 'O(2^n)', 'O(n log n)']
            
        return analysis
    
    def generate_mcq_from_leetcode_problem(self, problem: LeetCodeProblem, session_id: str = None) -> Dict:
        """Generate contextual MCQ from LeetCode problem"""
        analysis = self.analyze_problem_content(problem)
        question_type = analysis['question_type']
        
        # Select question template
        template = random.choice(self.question_templates[question_type])
        question = template.format(title=problem.title)
        
        # Generate options based on question type
        if question_type == 'algorithm_identification':
            options = analysis['suggested_algorithms'] + [
                'Brute Force', 'Linear Search', 'Binary Search', 'Recursive Approach'
            ]
            correct_answer = analysis['suggested_algorithms'][0] if analysis['suggested_algorithms'] else 'Brute Force'
            
        elif question_type == 'time_complexity':
            options = analysis['expected_complexity']
            correct_answer = options[0]
            
        elif question_type == 'data_structure':
            if analysis['focus_area'] == 'trees':
                options = ['Binary Tree', 'Hash Map', 'Array', 'Linked List']
                correct_answer = 'Binary Tree'
            elif analysis['focus_area'] == 'hashing':
                options = ['Hash Map', 'Array', 'Binary Tree', 'Stack']
                correct_answer = 'Hash Map'
            else:
                options = ['Array', 'Hash Map', 'Binary Tree', 'Graph']
                correct_answer = 'Array'
                
        elif question_type == 'optimization':
            options = ['Dynamic Programming', 'Greedy Algorithm', 'Divide and Conquer', 'Brute Force']
            correct_answer = 'Dynamic Programming'
            
        else:
            options = ['Pattern Matching', 'Two Pointers', 'Sliding Window', 'Binary Search']
            correct_answer = 'Pattern Matching'
        
        # Ensure exactly 4 options
        while len(options) < 4:
            options.append('None of the above')
        options = options[:4]
        
        # Find correct answer index
        try:
            correct_index = options.index(correct_answer)
        except ValueError:
            correct_index = 0
            
        # Shuffle options
        shuffled_options = options.copy()
        random.shuffle(shuffled_options)
        new_correct_index = shuffled_options.index(correct_answer)
        
        return {
            'question': question,
            'options': shuffled_options,
            'correct': new_correct_index,
            'explanation': f"For {problem.title}, {correct_answer} is the most suitable approach based on the problem requirements and constraints.",
            'metadata': {
                'source': 'LeetCode',
                'problem_title': problem.title,
                'problem_slug': problem.title_slug,
                'difficulty': problem.difficulty,
                'tags': problem.tags,
                'question_type': question_type,
                'focus_area': analysis['focus_area'],
                'acceptance_rate': problem.acceptance_rate,
                'session_id': session_id,
                'generated_at': time.time()
            }
        }

def test_leetcode_integration():
    """Test the LeetCode integration"""
    print("🚀 Testing LeetCode Integration...")
    
    client = LeetCodeAPIClient()
    generator = LeetCodeQuestionGenerator()
    
    # Test getting problems
    print("\n📚 Fetching Easy problems...")
    easy_problems = client.get_problems_by_difficulty('Easy', limit=5)
    
    if easy_problems:
        print(f"✅ Got {len(easy_problems)} Easy problems")
        
        # Generate MCQs from real problems
        for i, problem in enumerate(easy_problems[:3]):
            print(f"\n🎯 Problem {i+1}: {problem.title}")
            print(f"   Difficulty: {problem.difficulty}")
            print(f"   Tags: {', '.join(problem.tags[:3])}")
            
            mcq = generator.generate_mcq_from_leetcode_problem(problem)
            print(f"\n   Generated Question: {mcq['question']}")
            print(f"   Options: {mcq['options']}")
            print(f"   Correct: {mcq['options'][mcq['correct']]}")
            print(f"   Explanation: {mcq['explanation']}")
    else:
        print("❌ Failed to fetch problems")

if __name__ == "__main__":
    test_leetcode_integration()