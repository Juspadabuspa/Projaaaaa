"""
MongoDB Atlas Data Uploader
Uploads large production datasets to MongoDB Atlas with progress tracking
"""

import json
import os
from datetime import datetime
from typing import Dict, List
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
import time

load_dotenv()

class AtlasDataUploader:
    def __init__(self):
        self.connection_string = os.getenv('MONGODB_ATLAS_URI')
        if not self.connection_string:
            raise ValueError("MONGODB_ATLAS_URI environment variable not set")
        
        self.database_name = 'medroute_production'
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        """Connect to MongoDB Atlas"""
        try:
            self.client = MongoClient(
                self.connection_string,
                tlsCAFile=certifi.where(),
                retryWrites=True,
                w='majority',
                serverSelectionTimeoutMS=5000,
                maxPoolSize=50,
                minPoolSize=5
            )
            
            self.db = self.client[self.database_name]
            self.client.admin.command('ping')
            print(f"Connected to MongoDB Atlas cluster: {self.database_name}")
            return True
            
        except Exception as e:
            print(f"Error connecting to MongoDB Atlas: {e}")
            return False
    
    def load_json_data(self, filename: str) -> Dict:
        """Load data from JSON file"""
        print(f"Loading data from {filename}...")
        
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            
            total_records = sum(len(collection) for collection in data.values())
            print(f"Loaded {total_records:,} total records from {len(data)} collections")
            return data
            
        except FileNotFoundError:
            print(f"File {filename} not found. Please run the data generator first.")
            return {}
        except Exception as e:
            print(f"Error loading data: {e}")
            return {}
    
    def upload_collection(self, collection_name: str, records: List[Dict], batch_size: int = 1000):
        """Upload a single collection with progress tracking"""
        if not records:
            print(f"No records to upload for {collection_name}")
            return
        
        collection = self.db[collection_name]
        
        # Clear existing data (optional - remove if you want to append)
        if collection.count_documents({}) > 0:
            print(f"Clearing existing data in {collection_name}...")
            collection.delete_many({})
        
        total_records = len(records)
        uploaded = 0
        
        print(f"Uploading {total_records:,} records to {collection_name}...")
        
        start_time = time.time()
        
        # Upload in batches
        for i in range(0, total_records, batch_size):
            batch = records[i:i + batch_size]
            
            try:
                # Convert datetime strings back to datetime objects if needed
                processed_batch = self._process_batch_for_mongo(batch)
                result = collection.insert_many(processed_batch)
                uploaded += len(result.inserted_ids)
                
                # Progress update
                progress = (uploaded / total_records) * 100
                elapsed = time.time() - start_time
                
                if uploaded % (batch_size * 5) == 0 or uploaded == total_records:
                    rate = uploaded / elapsed if elapsed > 0 else 0
                    eta = (total_records - uploaded) / rate if rate > 0 else 0
                    print(f"  Progress: {uploaded:,}/{total_records:,} ({progress:.1f}%) - "
                          f"{rate:.0f} records/sec - ETA: {eta:.0f}s")
                
            except Exception as e:
                print(f"Error uploading batch starting at {i}: {e}")
                continue
        
        elapsed = time.time() - start_time
        print(f"Completed {collection_name}: {uploaded:,} records in {elapsed:.1f}s\n")
    
    def _process_batch_for_mongo(self, batch: List[Dict]) -> List[Dict]:
        """Process batch data for MongoDB compatibility"""
        processed = []
        
        for record in batch:
            processed_record = {}
            
            for key, value in record.items():
                if isinstance(value, str) and self._is_datetime_string(value):
                    # Convert ISO datetime strings back to datetime objects
                    try:
                        processed_record[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    except:
                        processed_record[key] = value
                else:
                    processed_record[key] = value
            
            processed.append(processed_record)
        
        return processed
    
    def _is_datetime_string(self, value: str) -> bool:
        """Check if string looks like an ISO datetime"""
        if not isinstance(value, str):
            return False
        
        # Simple check for ISO format
        return (len(value) > 15 and 
                'T' in value and 
                (':' in value) and
                (value.endswith('Z') or '+' in value[-6:] or value.count('-') >= 2))
    
    def create_production_indexes(self):
        """Create optimized indexes for production workload"""
        print("Creating production indexes...")
        
        indexes_to_create = [
            ('patients', [('Patient_email', 1)], {'unique': True, 'sparse': True}),
            ('patients', [('Patient_phone', 1)]),
            ('patients', [('Patient_district', 1)]),
            ('patients', [('province', 1)]),
            
            ('doctors', [('Doctor_email', 1)], {'unique': True}),
            ('doctors', [('years_experience', -1)]),
            
            ('medical_consultations', [('Consultation_Date', -1)]),
            ('medical_consultations', [('Patient_ID', 1)]),
            ('medical_consultations', [('Doctor_ID', 1)]),
            ('medical_consultations', [('Facility_ID', 1)]),
            ('medical_consultations', [('Admitted', 1)]),
            ('medical_consultations', [('primary_diagnosis', 1)]),
            ('medical_consultations', [('severity_score', -1)]),
            ('medical_consultations', [('ml_triage_result.symptom_analysis.urgency_level', 1)]),
            ('medical_consultations', [('ml_triage_result.priority_score', -1)]),
            
            ('vitals', [('Consultation_ID', 1)], {'unique': True}),
            ('vitals', [('Fever', 1)]),
            ('vitals', [('Difficulty_Breathing', 1)]),
            
            ('appointments', [('Date', 1)]),
            ('appointments', [('Patient_id', 1)]),
            ('appointments', [('Time_ID', 1)]),
            ('appointments', [('Date', 1), ('Time_ID', 1)]),
            
            ('admissions', [('Consultation_ID', 1)], {'unique': True}),
            ('admissions', [('Admitted_at', -1)]),
            ('admissions', [('Discharged_at', -1)]),
            ('admissions', [('Department_ID', 1)]),
            
            ('doctor_assignments', [('Doctor_ID', 1)]),
            ('doctor_assignments', [('Department_ID', 1)]),
            ('doctor_assignments', [('End_date', 1)]),
            
            ('department_capacity', [('Department_ID', 1)], {'unique': True}),
            
            ('diagnoses', [('Consultation_ID', 1)]),
            ('diagnoses', [('Patient_ID', 1)]),
            ('diagnoses', [('Condition_name', 1)]),
            ('diagnoses', [('Chronic', 1)]),
            
            ('prescriptions', [('Consultation_ID', 1)]),
            ('prescriptions', [('drug_name', 1)]),
            
            ('treatments', [('Consultation_ID', 1)]),
            ('treatments', [('Procedure_name', 1)])
        ]
        
        for collection_name, index_spec, *options in indexes_to_create:
            try:
                index_options = options[0] if options else {}
                self.db[collection_name].create_index(index_spec, **index_options)
            except Exception as e:
                # Index might already exist
                pass
        
        print("Production indexes created successfully")
    
    def upload_all_data(self, data: Dict):
        """Upload all collections in the correct order"""
        # Define upload order (dependencies first)
        upload_order = [
            'timeslots',
            'habits', 
            'specializations',
            'patients',
            'doctors',
            'facilities',
            'departments',
            'doctor_specializations',
            'doctor_assignments',
            'department_capacity',
            'consultations',  # Note: 'consultations' maps to 'medical_consultations' collection
            'vitals',
            'diagnoses',
            'treatments',
            'prescriptions',
            'admissions',
            'appointments',
            'patient_habits'
        ]
        
        print(f"Starting upload of {len(data)} collections to MongoDB Atlas...")
        print(f"Total records to upload: {sum(len(records) for records in data.values()):,}")
        
        overall_start = time.time()
        
        for collection_name in upload_order:
            if collection_name in data:
                # Map 'consultations' to 'medical_consultations' collection name
                mongo_collection_name = 'medical_consultations' if collection_name == 'consultations' else collection_name
                
                self.upload_collection(mongo_collection_name, data[collection_name])
            else:
                print(f"Warning: {collection_name} not found in data")
        
        # Create indexes after all data is uploaded
        self.create_production_indexes()
        
        total_time = time.time() - overall_start
        total_records = sum(len(records) for records in data.values())
        
        print(f"\nUpload completed!")
        print(f"Total time: {total_time/60:.1f} minutes")
        print(f"Total records: {total_records:,}")
        print(f"Average rate: {total_records/total_time:.0f} records/second")
    
    def verify_upload(self, expected_data: Dict):
        """Verify that all data was uploaded correctly"""
        print("\nVerifying upload...")
        
        collection_mapping = {
            'consultations': 'medical_consultations'
        }
        
        verification_results = {}
        
        for collection_name, expected_records in expected_data.items():
            mongo_collection_name = collection_mapping.get(collection_name, collection_name)
            
            try:
                actual_count = self.db[mongo_collection_name].count_documents({})
                expected_count = len(expected_records)
                
                verification_results[collection_name] = {
                    'expected': expected_count,
                    'actual': actual_count,
                    'match': actual_count == expected_count
                }
                
                status = "✅" if actual_count == expected_count else "❌"
                print(f"{status} {collection_name}: {actual_count:,}/{expected_count:,}")
                
            except Exception as e:
                print(f"❌ {collection_name}: Error verifying - {e}")
                verification_results[collection_name] = {'error': str(e)}
        
        # Summary
        successful = sum(1 for r in verification_results.values() if r.get('match', False))
        total = len(verification_results)
        
        print(f"\nVerification Summary: {successful}/{total} collections verified successfully")
        
        if successful == total:
            print("🎉 All data uploaded successfully!")
        else:
            print("⚠️ Some collections had upload issues. Check the logs above.")
        
        return verification_results
    
    def close_connection(self):
        if self.client:
            self.client.close()

def upload_production_data(json_filename: str = 'complete_medroute_production_data.json'):
    """Main function to upload production data to Atlas"""
    uploader = AtlasDataUploader()
    
    # Load data from JSON file
    data = uploader.load_json_data(json_filename)
    
    if not data:
        print("No data to upload. Please generate data first.")
        return False
    
    try:
        # Upload all data
        uploader.upload_all_data(data)
        
        # Verify upload
        verification_results = uploader.verify_upload(data)
        
        return all(r.get('match', False) for r in verification_results.values())
        
    except KeyboardInterrupt:
        print("\nUpload interrupted by user")
        return False
    except Exception as e:
        print(f"Upload failed: {e}")
        return False
    finally:
        uploader.close_connection()

if __name__ == "__main__":
    print("MedRoute Production Data Uploader")
    print("=" * 50)
    
    # Check if data file exists
    data_file = 'complete_medroute_production_data.json'
    if not os.path.exists(data_file):
        print(f"Data file {data_file} not found.")
        print("Please run 'python complete_production_data_generator.py' first")
        exit(1)
    
    # Check if Atlas URI is set
    if not os.getenv('MONGODB_ATLAS_URI'):
        print("MONGODB_ATLAS_URI environment variable not set.")
        print("Please set up your .env file with Atlas connection string")
        exit(1)
    
    success = upload_production_data(data_file)
    
    if success:
        print("\n🎉 Production database setup completed successfully!")
        print("Your MedRoute system is now ready for deployment with:")
        print("- 200,000+ realistic medical records")
        print("- Complete ERD structure in MongoDB Atlas")
        print("- Production-optimized indexes")
        print("- ML-ready dataset for training and inference")
    else:
        print("\n❌ Upload completed with some issues. Check logs above.")