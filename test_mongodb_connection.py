from cloud_medroute_db import CloudMedRouteDB as MedRouteDB
from ml_mongodb_adapter import MedRouteMLMongoDB

def test_database():
    print("Testing MongoDB connection and data retrieval...")
    
    # Test basic connection
    db = MedRouteDB()
    if not db.connect():
        print("❌ Failed to connect to database")
        return False
    
    # Test data retrieval
    try:
        # Get patients count
        patients_count = db.get_collection('patients').count_documents({})
        print(f"✅ Found {patients_count} patients in database")
        
        # Get a sample patient
        sample_patient = db.get_collection('patients').find_one()
        if sample_patient:
            print(f"✅ Sample patient: {sample_patient['Patient_fname']} {sample_patient['Patient_lname']}")
        
        # Get consultations count
        consultations_count = db.get_collection('medical_consultations').count_documents({})
        print(f"✅ Found {consultations_count} consultations in database")
        
        # Test ML adapter
        ml_adapter = MedRouteMLMongoDB()
        
        # Test patient retrieval
        patient = ml_adapter.get_patient_by_id(1)
        if patient:
            print(f"✅ Retrieved patient via ML adapter: {patient['Patient_fname']}")
        
        # Test department capacity
        capacity = ml_adapter.get_department_capacity(1)
        if capacity:
            print(f"✅ Emergency Department capacity: {capacity['Current_patients']}/{capacity['Current_beds_available']} patients")
        
        print("✅ All tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    
    finally:
        db.close_connection()

if __name__ == "__main__":
    test_database()