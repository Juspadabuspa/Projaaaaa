"""
MongoDB Atlas Cloud Configuration for Production Deployment
"""

import pymongo
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

class CloudMedRouteDB:
    def __init__(self):
        # Cloud connection string from environment variable
        self.connection_string = os.getenv('MONGODB_ATLAS_URI')
        
        if not self.connection_string:
            raise ValueError("MONGODB_ATLAS_URI environment variable not set")
        
        self.database_name = 'medroute_production'
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        try:
            # Connect with SSL certificate verification
            self.client = MongoClient(
                self.connection_string,
                tlsCAFile=certifi.where(),  # SSL certificate bundle
                retryWrites=True,
                w='majority',
                serverSelectionTimeoutMS=5000,  # 5 second timeout
                maxPoolSize=50,  # Connection pool size
                minPoolSize=5
            )
            
            self.db = self.client[self.database_name]
            
            # Test connection
            self.client.admin.command('ping')
            print(f"✅ Connected to MongoDB Atlas cluster: {self.database_name}")
            
            # Create indexes for production
            self._create_production_indexes()
            
            return True
        except Exception as e:
            print(f"❌ Error connecting to MongoDB Atlas: {e}")
            return False
    
    def _create_production_indexes(self):
        """Create optimized indexes for production workload"""
        try:
            # Patient indexes for fast lookups
            self.db.patients.create_index([("Patient_email", 1)], unique=True, sparse=True)
            self.db.patients.create_index([("Patient_phone", 1)])
            self.db.patients.create_index([("Patient_district", 1)])
            
            # Medical consultation indexes for analytics
            self.db.medical_consultations.create_index([
                ("Consultation_Date", -1),
                ("Patient_ID", 1)
            ])
            self.db.medical_consultations.create_index([("Doctor_ID", 1)])
            self.db.medical_consultations.create_index([("Facility_ID", 1)])
            self.db.medical_consultations.create_index([("Admitted", 1)])
            
            # Appointment scheduling indexes
            self.db.appointments.create_index([
                ("Date", 1),
                ("Time_ID", 1)
            ])
            self.db.appointments.create_index([("Patient_id", 1)])
            self.db.appointments.create_index([("assigned_doctor_id", 1)])
            self.db.appointments.create_index([("urgency_level", 1)])
            
            # ML predictions indexes for analysis
            self.db.medical_consultations.create_index([
                ("ml_triage_result.symptom_analysis.severity_score", -1)
            ])
            self.db.medical_consultations.create_index([
                ("ml_triage_result.urgency_level", 1)
            ])
            
            # Doctor availability indexes
            self.db.doctor_assignments.create_index([
                ("Department_ID", 1),
                ("End_date", 1)
            ])
            
            # Capacity monitoring indexes
            self.db.department_capacity.create_index([("Department_ID", 1)], unique=True)
            
            print("✅ Production indexes created successfully")
            
        except Exception as e:
            print(f"⚠️ Warning: Some indexes may already exist: {e}")
    
    def get_collection(self, collection_name):
        return self.db[collection_name]
    
    def close_connection(self):
        if self.client:
            self.client.close()

# Environment configuration template
def create_env_template():
    """Create .env template for Atlas configuration"""
    env_template = """# MongoDB Atlas Configuration
MONGODB_ATLAS_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/medroute_production?retryWrites=true&w=majority

# Application Settings
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=info

# Security Keys (generate new ones for production)
JWT_SECRET_KEY=your-super-secret-jwt-key-here
ENCRYPTION_KEY=your-encryption-key-here

# External APIs (if needed)
EXTERNAL_API_KEY=your-external-api-key
"""
    
    with open('.env.template', 'w') as f:
        f.write(env_template)
    
    print("Created .env.template - copy to .env and fill in your Atlas credentials")

if __name__ == "__main__":
    create_env_template()