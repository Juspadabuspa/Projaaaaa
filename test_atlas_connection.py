from cloud_medroute_db import CloudMedRouteDB

def test_atlas_connection():
    try:
        db = CloudMedRouteDB()
        
        # Test basic operation
        test_doc = {"test": "connection", "timestamp": "2025-01-15"}
        result = db.get_collection('test').insert_one(test_doc)
        print(f"Test document inserted with ID: {result.inserted_id}")
        
        # Clean up
        db.get_collection('test').delete_one({"_id": result.inserted_id})
        print("✅ Atlas connection test successful!")
        
        db.close_connection()
        return True
        
    except Exception as e:
        print(f"❌ Atlas connection failed: {e}")
        return False

if __name__ == "__main__":
    test_atlas_connection()