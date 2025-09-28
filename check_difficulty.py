"""
Check current difficulty distribution in MongoDB
"""
import pymongo
import ssl

# MongoDB Atlas connection details
MONGO_URI = "mongodb+srv://bhardwajkavya099_db_user:Gfq88i5GvO3WzcRG@cluster0.jx5vysg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "prepai_db"
COLLECTION_NAME = "dsa_problems"

def check_difficulty_distribution():
    """Check current difficulty distribution"""
    try:
        # Connect to MongoDB with SSL configuration
        client = pymongo.MongoClient(
            MONGO_URI,
            tls=True,
            tlsAllowInvalidCertificates=True
        )
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas")
        
        # Access database and collection
        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        
        # Check total count
        total_count = collection.count_documents({})
        print(f"📊 Total problems: {total_count}")
        
        # Check difficulty distribution
        pipeline = [
            {"$group": {"_id": "$difficulty_category", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        
        difficulty_dist = list(collection.aggregate(pipeline))
        print("\n📈 Current Difficulty Distribution:")
        for item in difficulty_dist:
            level = item['_id'] or 'Unknown'
            count = item['count']
            print(f"   {level}: {count} problems")
        
        # Sample a few problems to see their structure
        print("\n🔍 Sample problems:")
        samples = list(collection.find({}).limit(3))
        for i, problem in enumerate(samples, 1):
            print(f"\n   Problem {i}:")
            print(f"     Name: {problem.get('name', 'N/A')}")
            print(f"     Difficulty (raw): {problem.get('difficulty', 'N/A')}")
            print(f"     Difficulty Category: {problem.get('difficulty_category', 'N/A')}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Checking current difficulty distribution...")
    check_difficulty_distribution()