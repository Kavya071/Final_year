import pymongo
import ssl
import sys

# Test connection to MongoDB Atlas
MONGO_CONNECTION_STRING = "mongodb+srv://bhardwajkavya099_db_user:Gfq88i5GvO3WzcRG@cluster0.jx5vysg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

print("🔍 Testing MongoDB Atlas connection...")
print(f"Connection string: {MONGO_CONNECTION_STRING[:50]}...")

try:
    # Create client with SSL certificate handling for Windows
    client = pymongo.MongoClient(
        MONGO_CONNECTION_STRING,
        serverSelectionTimeoutMS=10000,  # 10 second timeout
        connectTimeoutMS=10000,          # 10 second connect timeout
        tls=True,                        # Enable TLS
        tlsAllowInvalidCertificates=True # Allow self-signed certificates (for development)
    )
    
    print("⏳ Attempting to connect...")
    
    # Test the connection
    result = client.admin.command('ping')
    print("✅ MongoDB connection successful!")
    print(f"Ping result: {result}")
    
    # List databases
    dbs = client.list_database_names()
    print(f"Available databases: {dbs}")
    
    # Test creating a document
    db = client.prepai_db
    collection = db.test_collection
    test_doc = {"test": "connection", "timestamp": "now"}
    result = collection.insert_one(test_doc)
    print(f"✅ Test document inserted with ID: {result.inserted_id}")
    
    # Clean up test document
    collection.delete_one({"_id": result.inserted_id})
    print("✅ Test document removed")
    
    client.close()
    print("✅ Test completed successfully! Your MongoDB is ready for data import.")
    
except pymongo.errors.ServerSelectionTimeoutError as e:
    print("❌ Connection timeout. Possible causes:")
    print("   1. Your IP address is not whitelisted in MongoDB Atlas")
    print("   2. Your cluster is paused or not running")
    print("   3. Network/firewall blocking the connection")
    print(f"   Error: {e}")
    
except pymongo.errors.OperationFailure as e:
    print("❌ Authentication failed:")
    print("   1. Check your username and password")
    print("   2. Make sure the database user has proper permissions")
    print(f"   Error: {e}")
    
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    print(f"Error type: {type(e).__name__}")

print("\n" + "="*50)
print("TROUBLESHOOTING STEPS:")
print("1. Check MongoDB Atlas Dashboard:")
print("   - Is your cluster 'Cluster0' running (not paused)?")
print("   - Go to Network Access - is your IP 223.228.51.13 whitelisted?")
print("2. If cluster is paused, click 'Resume' button")
print("3. If IP not whitelisted, click 'Add IP Address' and add your current IP")
print("="*50)