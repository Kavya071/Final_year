#!/usr/bin/env python3
"""Direct test of the Enhanced AI MCQ Service without HTTP"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

try:
    from enhanced_ai_mcq_service import EnhancedMCQGenerator
    
    def test_ai_generation():
        """Test AI question generation directly"""
        print("🧪 Testing Enhanced AI MCQ Generation...")
        print("=" * 50)
        
        # Initialize the generator
        generator = EnhancedMCQGenerator()
        
        # Test with a bracket problem
        bracket_problem = {
            "title": "Valid Parentheses",
            "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
            "difficulty_category": "Easy",
            "problem_type": "brackets"
        }
        
        print("🔤 Testing with Bracket Problem:")
        print(f"Title: {bracket_problem['title']}")
        print(f"Difficulty: {bracket_problem['difficulty_category']}")
        print()
        
        # Generate multiple questions to test variety
        for i in range(3):
            print(f"🎯 Question {i+1}:")
            mcq = generator.generate_mcq_from_problem(bracket_problem)
            
            print(f"Question: {mcq.get('question', 'No question')}")
            print(f"Options: {mcq.get('options', [])}")
            print(f"Correct Answer: {mcq.get('correct_answer', 'No answer')}")
            print(f"Generator: {mcq.get('generator', 'Unknown')}")
            print(f"Type: {mcq.get('type', 'Unknown')}")
            print("-" * 30)
        
        # Test with an array problem
        array_problem = {
            "title": "Two Sum",
            "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "difficulty_category": "Easy", 
            "problem_type": "array"
        }
        
        print("\n📊 Testing with Array Problem:")
        print(f"Title: {array_problem['title']}")
        print(f"Difficulty: {array_problem['difficulty_category']}")
        print()
        
        mcq = generator.generate_mcq_from_problem(array_problem)
        print(f"Question: {mcq.get('question', 'No question')}")
        print(f"Options: {mcq.get('options', [])}")
        print(f"Correct Answer: {mcq.get('correct_answer', 'No answer')}")
        print(f"Generator: {mcq.get('generator', 'Unknown')}")
        
        return True
        
    if __name__ == "__main__":
        test_ai_generation()
        print("\n✅ Direct AI generation test completed!")
        
except Exception as e:
    print(f"❌ Error testing AI generation: {e}")
    import traceback
    traceback.print_exc()