"""
Analyze the actual difficulty distribution in the deepmind/code_contests dataset
"""
from datasets import load_dataset
import numpy as np

def analyze_dataset_difficulty():
    """Analyze the real difficulty range and distribution"""
    print("🔍 Loading dataset sample to analyze difficulty distribution...")
    
    try:
        # Load a sample to analyze
        dataset = load_dataset('deepmind/code_contests', split='train', streaming=True)
        
        difficulties = []
        problem_names = []
        sample_count = 0
        max_samples = 1000  # Analyze first 1000 problems
        
        print(f"📊 Analyzing first {max_samples} problems...")
        
        for problem in dataset:
            if sample_count >= max_samples:
                break
                
            difficulty = problem.get('difficulty')
            name = problem.get('name', 'Unknown')
            
            if difficulty is not None:
                difficulties.append(difficulty)
                problem_names.append(name)
            
            sample_count += 1
            
            if sample_count % 100 == 0:
                print(f"   Processed {sample_count} problems...")
        
        if not difficulties:
            print("❌ No difficulty scores found in the sample")
            return
        
        # Statistical analysis
        difficulties = np.array(difficulties)
        
        print(f"\n📈 Difficulty Analysis Results:")
        print(f"   Total problems with difficulty: {len(difficulties)}")
        print(f"   Minimum difficulty: {np.min(difficulties)}")
        print(f"   Maximum difficulty: {np.max(difficulties)}")
        print(f"   Average difficulty: {np.mean(difficulties):.2f}")
        print(f"   Median difficulty: {np.median(difficulties):.2f}")
        print(f"   Standard deviation: {np.std(difficulties):.2f}")
        
        # Percentile analysis
        print(f"\n📊 Percentile Distribution:")
        percentiles = [10, 25, 50, 75, 90, 95, 99]
        for p in percentiles:
            value = np.percentile(difficulties, p)
            print(f"   {p}th percentile: {value:.1f}")
        
        # Current categorization analysis
        print(f"\n🏷️ Current Categorization Results:")
        easy_count = np.sum(difficulties <= 1000)
        medium_count = np.sum((difficulties > 1000) & (difficulties <= 1500))
        hard_count = np.sum((difficulties > 1500) & (difficulties <= 2000))
        expert_count = np.sum(difficulties > 2000)
        
        total = len(difficulties)
        print(f"   Easy (≤1000): {easy_count} ({easy_count/total*100:.1f}%)")
        print(f"   Medium (1001-1500): {medium_count} ({medium_count/total*100:.1f}%)")
        print(f"   Hard (1501-2000): {hard_count} ({hard_count/total*100:.1f}%)")
        print(f"   Expert (>2000): {expert_count} ({expert_count/total*100:.1f}%)")
        
        # Suggest better thresholds
        print(f"\n💡 Suggested Improved Thresholds (for balanced distribution):")
        q25 = np.percentile(difficulties, 25)
        q50 = np.percentile(difficulties, 50)
        q75 = np.percentile(difficulties, 75)
        
        print(f"   Easy: ≤ {q25:.0f} (bottom 25%)")
        print(f"   Medium: {q25:.0f} - {q50:.0f} (25th-50th percentile)")
        print(f"   Hard: {q50:.0f} - {q75:.0f} (50th-75th percentile)")
        print(f"   Expert: > {q75:.0f} (top 25%)")
        
        # Show some sample problems by difficulty
        print(f"\n📝 Sample Problems by Current Difficulty:")
        sorted_indices = np.argsort(difficulties)
        
        print(f"   Easiest problems:")
        for i in range(min(3, len(sorted_indices))):
            idx = sorted_indices[i]
            print(f"     • {problem_names[idx]} (difficulty: {difficulties[idx]})")
        
        print(f"   Hardest problems:")
        for i in range(max(0, len(sorted_indices)-3), len(sorted_indices)):
            idx = sorted_indices[i]
            print(f"     • {problem_names[idx]} (difficulty: {difficulties[idx]})")
            
    except Exception as e:
        print(f"❌ Error analyzing dataset: {e}")
        print("   This might be due to dataset loading issues or network connectivity")

if __name__ == "__main__":
    analyze_dataset_difficulty()