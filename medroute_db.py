import pymongo
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

class MedRouteDB:
    def __init__(self):
        self.connection_string = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        self.database_name = 'medroute_hospital'
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        try:
            self.client = MongoClient(self.connection_string)
            self.db = self.client[self.database_name]
            self.client.admin.command('ismaster')
            print("✅ Connected to MongoDB successfully")
            return True
        except Exception as e:
            print(f"❌ Error connecting to MongoDB: {e}")
            return False
    
    def get_collection(self, collection_name):
        return self.db[collection_name]
    
    def create_indexes(self):
        """Create indexes matching your ERD relationships"""
        try:
            # Patients collection indexes
            self.db.patients.create_index([("Patient_email", 1)], unique=True, sparse=True)
            self.db.patients.create_index([("Patient_phone", 1)])
            
            # Doctors collection indexes  
            self.db.doctors.create_index([("Doctor_email", 1)], unique=True)
            
            # Medical_Consultation indexes
            self.db.medical_consultations.create_index([("Patient_ID", 1)])
            self.db.medical_consultations.create_index([("Doctor_ID", 1)])
            self.db.medical_consultations.create_index([("Consultation_Date", -1)])
            self.db.medical_consultations.create_index([("Facility_ID", 1)])
            
            # Vitals indexes
            self.db.vitals.create_index([("Consultation_ID", 1)])
            
            # Diagnosis indexes
            self.db.diagnosis.create_index([("Consultation_ID", 1)])
            self.db.diagnosis.create_index([("Patient_ID", 1)])
            self.db.diagnosis.create_index([("Condition_name", 1)])
            
            # Treatment indexes
            self.db.treatments.create_index([("Consultation_ID", 1)])
            
            # Prescription indexes
            self.db.prescriptions.create_index([("Consultation_ID", 1)])
            
            # Appointments indexes
            self.db.appointments.create_index([("Patient_id", 1)])
            self.db.appointments.create_index([("Date", 1)])
            self.db.appointments.create_index([("Time_ID", 1)])
            
            # Admissions indexes
            self.db.admissions.create_index([("Consultation_ID", 1)])
            self.db.admissions.create_index([("Admitted_at", 1)])
            
            # DoctorAssignment indexes
            self.db.doctor_assignments.create_index([("Doctor_ID", 1)])
            self.db.doctor_assignments.create_index([("Department_ID", 1)])
            
            print("✅ All indexes created successfully")
            return True
        except Exception as e:
            print(f"❌ Error creating indexes: {e}")
            return False
    
    def close_connection(self):
        if self.client:
            self.client.close()