import pymongo
from datasets import load_dataset
import time

# --- Configuration ---
# 1. MongoDB Atlas connection string with your credentials
MONGO_CONNECTION_STRING = "mongodb+srv://bhardwajkavya099_db_user:Gfq88i5GvO3WzcRG@cluster0.jx5vysg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# 2. Define your database and collection names
DB_NAME = 'prepai_db'
COLLECTION_NAME = 'dsa_problems'

# 3. How many problems to import (reduced for testing)
NUM_PROBLEMS_TO_IMPORT = 50

# --- Test MongoDB Connection First ---
def test_connection():
    """Test if we can connect to MongoDB Atlas."""
    print("🔍 Testing MongoDB Atlas connection...")
    try:
        client = pymongo.MongoClient(
            MONGO_CONNECTION_STRING,
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=10000,         # 10 second connect timeout
            socketTimeoutMS=10000,          # 10 second socket timeout
            tls=True,                       # Enable TLS
            tlsAllowInvalidCertificates=True # Allow self-signed certificates
        )
        # Simple connection test
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Test database access
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        # Insert a test document
        test_doc = {"test": "connection", "timestamp": time.time()}
        result = collection.insert_one(test_doc)
        print(f"✅ Test document inserted with ID: {result.inserted_id}")
        
        # Remove the test document
        collection.delete_one({"_id": result.inserted_id})
        print("✅ Test document removed. Database is ready!")
        
        client.close()
        return True
        
    except pymongo.errors.ServerSelectionTimeoutError:
        print("❌ Connection timeout. Please check:")
        print("   1. Your internet connection")
        print("   2. MongoDB Atlas cluster is running")
        print("   3. Your IP address is whitelisted")
        return False
    except pymongo.errors.OperationFailure as e:
        print(f"❌ Authentication failed: {e}")
        print("   Please check your username and password")
        return False
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

# --- Helper Function for Difficulty ---
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

# --- Helper Function to Clean Text ---
def clean_text(text):
    """Clean and format text content."""
    if not text:
        return ""
    # Remove excessive whitespace and normalize
    cleaned = ' '.join(text.split())
    return cleaned[:5000]  # Limit length to avoid overly long descriptions

# --- Main Script ---
def main():
    print("🚀 Starting DeepMind Code Contests import to MongoDB...")
    
    # First, test the connection
    if not test_connection():
        print("\n❌ Connection test failed. Please fix the connection issues before importing data.")
        return
    
    print("\n📥 Connection successful! Starting data import...")
    
    # 1. Connect to MongoDB Atlas
    print("Connecting to MongoDB Atlas...")
    try:
        client = pymongo.MongoClient(
            MONGO_CONNECTION_STRING,
            serverSelectionTimeoutMS=30000,  # 30 second timeout
            connectTimeoutMS=10000,          # 10 second connect timeout
            socketTimeoutMS=30000,           # 30 second socket timeout
            tls=True,                        # Enable TLS
            tlsAllowInvalidCertificates=True # Allow self-signed certificates
        )
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        print("✅ MongoDB connected successfully.")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return

    # 2. Load the dataset from Hugging Face
    print("📥 Loading dataset from Hugging Face...")
    print("This may take a few minutes for the first time...")
    try:
        # Use streaming to avoid downloading the entire massive dataset
        dataset = load_dataset('deepmind/code_contests', split='train', streaming=True)
        print("✅ Dataset loaded successfully.")
    except Exception as e:
        print(f"❌ Failed to load dataset: {e}")
        print("Please check your internet connection.")
        return

    # 3. Clear existing collection (optional - comment out if you want to keep existing data)
    print(f"🧹 Clearing existing data in collection '{COLLECTION_NAME}'...")
    collection.delete_many({})

    # 4. Loop through and import data
    print(f"📊 Starting import of {NUM_PROBLEMS_TO_IMPORT} problems...")
    print("Progress updates every 10 problems:")
    
    count = 0
    skipped = 0
    start_time = time.time()
    
    for problem in dataset:
        if count >= NUM_PROBLEMS_TO_IMPORT:
            break

        try:
            # Extract problem data
            name = problem.get('name', '')
            description = problem.get('description', '')
            difficulty = problem.get('difficulty')
            
            # Skip problems without essential data
            if not name and not description:
                skipped += 1
                continue
                
            # Clean and prepare the data
            title = clean_text(name) or f"Problem {count + 1}"
            desc = clean_text(description)
            
            # Map difficulty level
            difficulty_category = map_difficulty(difficulty)
            
            # Prepare the document for MongoDB
            document_to_insert = {
                'title': title,
                'description': desc,
                'difficulty_category': difficulty_category,
                'difficulty_level': difficulty,  # Keep original for reference
                'source': 'DeepMind Code Contests',
                'imported_at': time.time(),
                'problem_id': count + 1
            }

            # Insert the document into the collection
            result = collection.insert_one(document_to_insert)
            
            count += 1
            
            # Progress update
            if count % 10 == 0:
                elapsed = time.time() - start_time
                print(f"   📈 Imported {count}/{NUM_PROBLEMS_TO_IMPORT} problems. "
                      f"Time elapsed: {elapsed:.1f}s. Skipped: {skipped}")

        except Exception as e:
            print(f"⚠️  Error processing problem {count}: {e}")
            skipped += 1
            continue

    # 5. Final summary
    total_time = time.time() - start_time
    print(f"\n🎉 Import completed!")
    print(f"✅ Successfully imported: {count} problems")
    print(f"⚠️  Skipped: {skipped} problems")
    print(f"⏱️  Total time: {total_time:.1f} seconds")
    
    # 6. Show difficulty distribution
    print(f"\n📊 Difficulty distribution:")
    easy_count = collection.count_documents({'difficulty_category': 'Easy'})
    medium_count = collection.count_documents({'difficulty_category': 'Medium'})
    hard_count = collection.count_documents({'difficulty_category': 'Hard'})
    
    print(f"   🟢 Easy: {easy_count}")
    print(f"   🟡 Medium: {medium_count}")
    print(f"   🔴 Hard: {hard_count}")
    
    # 7. Show sample data
    print(f"\n📄 Sample problem:")
    sample = collection.find_one()
    if sample:
        print(f"   Title: {sample['title'][:100]}...")
        print(f"   Difficulty: {sample['difficulty_category']}")
        print(f"   Description length: {len(sample['description'])} characters")
    
    client.close()
    print(f"\n🔐 MongoDB connection closed.")
    print(f"🎯 Your '{COLLECTION_NAME}' collection is ready for use!")

if __name__ == '__main__':
    main()