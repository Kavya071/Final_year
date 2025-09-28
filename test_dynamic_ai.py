#!/usr/bin/env python3
"""Test the new Dynamic AI MCQ Service v2.0"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

try:
    from dynamic_ai_mcq_service import EnhancedMCQGenerator
    
    def test_dynamic_ai_variety():
        """Test the new dynamic AI generates unique questions from real problems"""
        print("🧪 Testing Dynamic AI MCQ Service v2.0...")
        print("=" * 60)
        
        # Initialize the generator
        generator = EnhancedMCQGenerator()
        
        # Test with Easy difficulty
        print("🎯 Testing Easy Difficulty - Should use actual Easy problems from MongoDB:")
        test_problem = {"difficulty_category": "Easy"}
        
        questions = []
        for i in range(5):
            mcq = generator.generate_mcq_from_problem(test_problem)
            questions.append(mcq['question'])
            
            print(f"\nQuestion {i+1}:")
            print(f"  Source: {mcq.get('source_problem', 'Unknown')}")
            print(f"  Type: {mcq.get('question_type', 'Unknown')}")
            print(f"  Q: {mcq['question']}")
            print(f"  Options: {mcq['options']}")
            print(f"  Answer: {mcq['correct_answer']}")
            print(f"  Generator: {mcq.get('generator', 'Unknown')}")
        
        # Check for variety
        unique_questions = set(questions)
        print("\n" + "=" * 60)
        print(f"📈 VARIETY ANALYSIS (Easy Level):")
        print(f"  Total questions generated: {len(questions)}")
        print(f"  Unique questions: {len(unique_questions)}")
        print(f"  Variety percentage: {(len(unique_questions)/len(questions))*100:.1f}%")
        
        if len(unique_questions) >= 3:
            print("  ✅ EXCELLENT: High variety achieved!")
        elif len(unique_questions) >= 2:
            print("  ✅ GOOD: Some variety achieved!")
        else:
            print("  ⚠️  WARNING: Limited variety")
        
        # Test Medium difficulty
        print("\n🎯 Testing Medium Difficulty:")
        test_problem = {"difficulty_category": "Medium"}
        
        for i in range(3):
            mcq = generator.generate_mcq_from_problem(test_problem)
            print(f"\nMedium Question {i+1}:")
            print(f"  Source: {mcq.get('source_problem', 'Unknown')}")
            print(f"  Q: {mcq['question']}")
            print(f"  Generator: {mcq.get('generator', 'Unknown')}")
        
        # Test Hard difficulty
        print("\n🎯 Testing Hard Difficulty:")
        test_problem = {"difficulty_category": "Hard"}
        
        for i in range(2):
            mcq = generator.generate_mcq_from_problem(test_problem)
            print(f"\nHard Question {i+1}:")
            print(f"  Source: {mcq.get('source_problem', 'Unknown')}")
            print(f"  Q: {mcq['question']}")
            print(f"  Generator: {mcq.get('generator', 'Unknown')}")
        
        return True
        
    if __name__ == "__main__":
        test_dynamic_ai_variety()
        print("\n✅ Dynamic AI v2.0 testing completed!")
        
except Exception as e:
    print(f"❌ Error testing dynamic AI: {e}")
    import traceback
    traceback.print_exc()