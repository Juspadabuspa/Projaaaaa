from cloud_medroute_db import CloudMedRouteDB as MedRouteDB
from datetime import datetime, timedelta

def initialize_database():
    db = MedRouteDB()
    
    if not db.connect():
        print("Failed to connect to database")
        return False
    
    # Drop existing collections for fresh start
    collections_to_drop = [
        'timeslots', 'habits', 'patients', 'doctors', 'specializations',
        'facilities', 'departments', 'doctor_specializations', 'doctor_assignments',
        'medical_consultations', 'diagnosis', 'vitals', 'treatments', 
        'prescriptions', 'admissions', 'department_capacity', 'appointments', 'patient_habits'
    ]
    
    for collection in collections_to_drop:
        db.db[collection].drop()
    
    print("✅ Collections dropped, creating fresh database...")
    
    # Create indexes
    db.create_indexes()
    
    print("✅ Database initialization complete")
    return True

if __name__ == "__main__":
    initialize_database()