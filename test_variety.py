#!/usr/bin/env python3
"""Test AI generation variety - showing different questions each time"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from enhanced_ai_mcq_service import EnhancedMCQGenerator

def test_generation_variety():
    """Test that AI generates different questions for the same problem"""
    print("🧪 Testing AI Question Generation Variety...")
    print("=" * 60)
    
    # Initialize the generator
    generator = EnhancedMCQGenerator()
    
    # Test with the same bracket problem multiple times
    bracket_problem = {
        "title": "Valid Parentheses",
        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
        "difficulty_category": "Easy",
        "problem_type": "brackets"
    }
    
    print(f"🔤 Testing with: {bracket_problem['title']}")
    print(f"📊 Difficulty: {bracket_problem['difficulty_category']}")
    print("\n🎯 Generating 5 questions from the SAME problem to test variety:\n")
    
    questions = []
    for i in range(5):
        mcq = generator.generate_mcq_from_problem(bracket_problem)
        questions.append(mcq['question'])
        
        print(f"Question {i+1}:")
        print(f"  Q: {mcq['question']}")
        print(f"  Options: {mcq['options']}")
        print(f"  Answer: {mcq['correct_answer']}")
        print(f"  Generator: {mcq.get('generator', 'Unknown')}")
        print()
    
    # Check for variety
    unique_questions = set(questions)
    print("=" * 60)
    print(f"📈 VARIETY ANALYSIS:")
    print(f"  Total questions generated: {len(questions)}")
    print(f"  Unique questions: {len(unique_questions)}")
    print(f"  Variety percentage: {(len(unique_questions)/len(questions))*100:.1f}%")
    
    if len(unique_questions) > 1:
        print("  ✅ SUCCESS: AI generates different questions each time!")
    else:
        print("  ⚠️  WARNING: All questions were identical")
    
    print("\n🔍 All generated questions:")
    for i, q in enumerate(unique_questions, 1):
        print(f"  {i}. {q}")

if __name__ == "__main__":
    test_generation_variety()