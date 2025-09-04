from cloud_medroute_db import CloudMedRouteDB as MedRouteDB
from datetime import datetime
import json

class MedRouteMLMongoDB:
    def __init__(self):
        self.db = MedRouteDB()
        self.symptom_model = None
        self.stay_length_model = None
        self._load_models()
    
    def _load_models(self):
        """Load your ML models"""
        try:
            import joblib
            self.symptom_model = joblib.load('models/symptom_catboost_model.pkl')
            self.stay_length_model = joblib.load('models/stay_length_model.pkl')
            print("✅ ML models loaded successfully")
        except Exception as e:
            print(f"⚠️ Could not load ML models: {e}")
    
    def analyze_patient_triage(self, patient_data: dict) -> dict:
        """Main triage analysis using MongoDB"""
        # Get patient from MongoDB
        patient = self.db.get_collection('patients').find_one({"_id": patient_data.get('patient_id')})
        
        if not patient:
            raise ValueError(f"Patient {patient_data.get('patient_id')} not found")
        
        # Run ML analysis (same as your original code)
        symptom_analysis = self._analyze_symptoms_catboost(patient_data)
        stay_prediction = self._predict_stay_length(patient_data, symptom_analysis)
        
        # Combine results
        triage_result = self._combine_ml_results(patient_data, symptom_analysis, stay_prediction)
        
        # Insert into MongoDB
        self._insert_triage_data(patient_data, triage_result)
        
        return triage_result
    
    def _insert_triage_data(self, patient_data: dict, triage_result: dict):
        """Insert triage data into MongoDB collections"""
        try:
            # Insert Medical Consultation
            consultation_doc = {
                "Patient_ID": patient_data.get('patient_id'),
                "Consultation_Date": datetime.utcnow(),
                "Consultation_Reason": "AI Triage Assessment",
                "Doctor_ID": patient_data.get('doctor_id'),
                "Facility_ID": patient_data.get('facility_id', 1),
                "Admitted": triage_result['urgency_level'] in ['EMERGENCY', 'URGENT'],
                "ml_triage_result": triage_result
            }
            
            consultation_result = self.db.get_collection('medical_consultations').insert_one(consultation_doc)
            consultation_id = consultation_result.inserted_id
            
            # Insert Vitals
            vitals_doc = {
                "Consultation_ID": consultation_id,
                "bp_systolic": patient_data.get('bp_systolic', 120),
                "bp_diastolic": patient_data.get('bp_diastolic', 80),
                "Cholesterol": patient_data.get('cholesterol_level', 'Normal'),
                "Difficulty_Breathing": patient_data.get('difficulty_breathing', False),
                "Cough": patient_data.get('cough', False),
                "Fatigue": patient_data.get('fatigue', False),
                "Fever": patient_data.get('fever', False),
                "oxygen_saturation": patient_data.get('oxygen_saturation', 98.0),
                "weight": patient_data.get('weight', 70.0),
                "respiratory_rate": patient_data.get('respiratory_rate', 16),
                "temperature": patient_data.get('temperature', 36.5),
                "heart_rate": patient_data.get('heart_rate', 72)
            }
            
            self.db.get_collection('vitals').insert_one(vitals_doc)
            
            # Insert Treatment recommendation
            treatment_doc = {
                "Consultation_ID": consultation_id,
                "Procedure_name": "AI Triage Assessment", 
                "Description": f"ML-based triage: {triage_result['recommended_action']}",
                "Doctor_ID": patient_data.get('doctor_id'),
                "Date": datetime.utcnow()
            }
            
            self.db.get_collection('treatments').insert_one(treatment_doc)
            
            print(f"✅ Triage data inserted for consultation ID: {consultation_id}")
            
        except Exception as e:
            print(f"❌ Error inserting triage data: {e}")
    
    def get_patient_by_id(self, patient_id: int) -> dict:
        """Get patient data from MongoDB"""
        return self.db.get_collection('patients').find_one({"_id": patient_id})
    
    def get_consultations_by_patient(self, patient_id: int) -> list:
        """Get all consultations for a patient"""
        return list(self.db.get_collection('medical_consultations').find({"Patient_ID": patient_id}))
    
    def get_department_capacity(self, department_id: int) -> dict:
        """Get current department capacity"""
        return self.db.get_collection('department_capacity').find_one({"Department_ID": department_id})
    
    def update_department_capacity(self, department_id: int, capacity_updates: dict):
        """Update department capacity"""
        self.db.get_collection('department_capacity').update_one(
            {"Department_ID": department_id},
            {"$set": capacity_updates}
        )