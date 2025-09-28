#!/usr/bin/env python3
"""
Quick check of what's actually in your MongoDB database
"""

import pymongo

# Connect using the working configuration
client = pymongo.MongoClient(
    "mongodb+srv://bhardwajkavya099_db_user:Gfq88i5GvO3WzcRG@cluster0.jx5vysg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
    tls=True,
    tlsAllowInvalidCertificates=True
)

print("🔍 Checking MongoDB database contents...")

# Check prepai_db database
db = client['prepai_db']
collections = db.list_collection_names()
print(f"📁 Collections in prepai_db: {collections}")

if 'dsa_problems' in collections:
    problems = db['dsa_problems']
    total_count = problems.count_documents({})
    print(f"📊 Total problems in collection: {total_count}")
    
    if total_count > 0:
        # Check difficulty distribution
        difficulty_counts = {}
        for difficulty in ['Easy', 'Medium', 'Hard', 'Expert']:
            count = problems.count_documents({'difficulty_category': difficulty})
            difficulty_counts[difficulty] = count
        
        print(f"📈 Difficulty distribution: {difficulty_counts}")
        
        # Show sample problem
        sample = problems.find_one()
        print(f"🔍 Sample problem structure:")
        if sample:
            for key, value in sample.items():
                if isinstance(value, str) and len(value) > 100:
                    print(f"   {key}: {str(value)[:100]}...")
                else:
                    print(f"   {key}: {value}")
        
        # Check for different field names that might be used for difficulty
        all_problems = list(problems.find({}, {'difficulty_category': 1, 'difficulty': 1, 'difficulty_level': 1}).limit(5))
        print(f"\n🔍 Sample difficulty fields:")
        for prob in all_problems:
            print(f"   {prob}")
    else:
        print("❌ No problems found in the collection!")
else:
    print("❌ No 'dsa_problems' collection found!")

# Also check dsa_problems database (in case it exists)
print(f"\n🔍 Checking for dsa_problems database...")
try:
    dsa_db = client['dsa_problems']
    dsa_collections = dsa_db.list_collection_names()
    print(f"📁 Collections in dsa_problems: {dsa_collections}")
    
    if 'problems' in dsa_collections:
        dsa_problems = dsa_db['problems']
        dsa_total = dsa_problems.count_documents({})
        print(f"📊 Total problems in dsa_problems.problems: {dsa_total}")
    
except Exception as e:
    print(f"   No dsa_problems database found")

client.close()
print("\n✅ Database inspection completed!")