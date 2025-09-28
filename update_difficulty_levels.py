"""
Update existing MongoDB data to include Expert difficulty level
"""
import pymongo
import ssl

# MongoDB Atlas connection details
MONGO_URI = "mongodb+srv://bhardwajkavya099_db_user:Gfq88i5GvO3WzcRG@cluster0.jx5vysg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "prepai_db"
COLLECTION_NAME = "dsa_problems"

def map_difficulty(level):
    """Maps the dataset's numerical difficulty to a category with 4 levels."""
    if level is None or level <= 800:
        return 'Easy'
    elif level <= 1200:
        return 'Medium'
    elif level <= 1900:
        return 'Hard'
    else:
        return 'Expert'

def update_difficulty_levels():
    """Update existing problems with new 4-level difficulty system"""
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
        
        # Get all problems
        problems = list(collection.find({}))
        print(f"📊 Found {len(problems)} problems to update")
        
        updated_count = 0
        difficulty_counts = {'Easy': 0, 'Medium': 0, 'Hard': 0, 'Expert': 0}
        
        for problem in problems:
            original_difficulty = problem.get('difficulty')
            new_difficulty = map_difficulty(original_difficulty)
            
            # Update the document
            result = collection.update_one(
                {'_id': problem['_id']},
                {'$set': {'difficulty_category': new_difficulty}}
            )
            
            if result.modified_count > 0:
                updated_count += 1
                difficulty_counts[new_difficulty] += 1
                
        print(f"\n✅ Updated {updated_count} problems")
        print("\n📈 New Difficulty Distribution:")
        for level, count in difficulty_counts.items():
            print(f"   {level}: {count} problems")
        
        # Verify the update
        total_check = collection.count_documents({})
        print(f"\n🔍 Verification: {total_check} total problems in database")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error updating difficulty levels: {e}")
        return False

if __name__ == "__main__":
    print("🔄 Updating difficulty levels to 4-tier system...")
    success = update_difficulty_levels()
    if success:
        print("✅ Difficulty levels updated successfully!")
    else:
        print("❌ Failed to update difficulty levels.")