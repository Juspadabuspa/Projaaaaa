"""
MongoDB Atlas Database Cleanup Script
Helps free up space in your Atlas cluster by removing old or unnecessary data
"""

import os
from datetime import datetime, timedelta
from typing import Dict, List
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv

load_dotenv()

class DatabaseCleanup:
    def __init__(self, database_name: str = 'medroute_production'):
        self.connection_string = os.getenv('MONGODB_ATLAS_URI')
        if not self.connection_string:
            raise ValueError("MONGODB_ATLAS_URI environment variable not set")
        
        self.database_name = database_name
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
                serverSelectionTimeoutMS=5000
            )
            
            self.db = self.client[self.database_name]
            self.client.admin.command('ping')
            print(f"Connected to MongoDB Atlas cluster: {self.database_name}")
            return True
            
        except Exception as e:
            print(f"Error connecting to MongoDB Atlas: {e}")
            return False
    
    def get_database_stats(self):
        """Get current database statistics"""
        print("Current Database Statistics:")
        print("=" * 50)
        
        collections = self.db.list_collection_names()
        total_documents = 0
        collection_stats = []
        
        for collection_name in sorted(collections):
            count = self.db[collection_name].count_documents({})
            
            # Get collection size
            try:
                coll_stats = self.db.command("collStats", collection_name)
                size_mb = coll_stats.get('size', 0) / (1024 * 1024)
            except:
                size_mb = 0
            
            total_documents += count
            collection_stats.append((collection_name, count, size_mb))
            print(f"{collection_name:30} | {count:8,} docs | {size_mb:6.2f} MB")
        
        print("-" * 50)
        print(f"{'Total':30} | {total_documents:8,} docs")
        
        # Database size
        try:
            db_stats = self.db.command("dbStats")
            total_size_mb = db_stats.get('dataSize', 0) / (1024 * 1024)
            storage_size_mb = db_stats.get('storageSize', 0) / (1024 * 1024)
            print(f"\nDatabase data size: {total_size_mb:.2f} MB")
            print(f"Storage size: {storage_size_mb:.2f} MB")
            
            # Show how close to limit
            free_tier_limit = 512  # MB
            usage_percent = (total_size_mb / free_tier_limit) * 100
            print(f"Free tier usage: {usage_percent:.1f}% ({total_size_mb:.1f}/{free_tier_limit} MB)")
            
            if usage_percent > 90:
                print("WARNING: Very close to free tier limit!")
            elif usage_percent > 100:
                print("ERROR: Over free tier limit!")
        except Exception as e:
            print(f"Could not get database size: {e}")
        
        return collection_stats
    
    def find_old_consultations(self, days_old: int = 90) -> int:
        """Find consultations older than specified days"""
        cutoff_date = datetime.now() - timedelta(days=days_old)
        
        if 'medical_consultations' in self.db.list_collection_names():
            count = self.db.medical_consultations.count_documents({
                "Consultation_Date": {"$lt": cutoff_date}
            })
            print(f"Found {count:,} consultations older than {days_old} days")
            return count
        else:
            print("No medical_consultations collection found")
            return 0
    
    def find_test_data(self) -> Dict[str, int]:
        """Find test or sample data that can be removed"""
        test_data_counts = {}
        
        collections_to_check = [
            'medical_consultations', 'patients', 'doctors', 'appointments',
            'vitals', 'diagnoses', 'treatments', 'prescriptions'
        ]
        
        for collection_name in collections_to_check:
            if collection_name in self.db.list_collection_names():
                collection = self.db[collection_name]
                
                # Look for test indicators
                test_count = 0
                
                # Check for test markers
                test_count += collection.count_documents({"test_data": True})
                test_count += collection.count_documents({"is_test": True})
                test_count += collection.count_documents({"test": True})
                
                # Check for test names/emails
                if collection_name == 'patients':
                    test_count += collection.count_documents({
                        "$or": [
                            {"Patient_name": {"$regex": "test", "$options": "i"}},
                            {"Patient_email": {"$regex": "test", "$options": "i"}},
                            {"Patient_name": {"$regex": "sample", "$options": "i"}}
                        ]
                    })
                elif collection_name == 'doctors':
                    test_count += collection.count_documents({
                        "$or": [
                            {"Doctor_name": {"$regex": "test", "$options": "i"}},
                            {"Doctor_email": {"$regex": "test", "$options": "i"}}
                        ]
                    })
                
                if test_count > 0:
                    test_data_counts[collection_name] = test_count
        
        return test_data_counts
    
    def cleanup_old_consultations(self, days_old: int = 90, dry_run: bool = True):
        """Remove consultations older than specified days"""
        cutoff_date = datetime.now() - timedelta(days=days_old)
        
        if 'medical_consultations' not in self.db.list_collection_names():
            print("No medical_consultations collection found")
            return 0
        
        # Find consultations to delete
        old_consultations = list(self.db.medical_consultations.find(
            {"Consultation_Date": {"$lt": cutoff_date}}, 
            {"_id": 1}
        ))
        
        if not old_consultations:
            print(f"No consultations older than {days_old} days found")
            return 0
        
        consultation_ids = [doc['_id'] for doc in old_consultations]
        count_to_delete = len(consultation_ids)
        
        if dry_run:
            print(f"DRY RUN: Would delete {count_to_delete:,} old consultations")
            return count_to_delete
        
        # Delete related records first
        deleted_counts = {}
        
        # Delete vitals
        if 'vitals' in self.db.list_collection_names():
            result = self.db.vitals.delete_many({"Consultation_ID": {"$in": consultation_ids}})
            deleted_counts['vitals'] = result.deleted_count
        
        # Delete diagnoses
        if 'diagnoses' in self.db.list_collection_names():
            result = self.db.diagnoses.delete_many({"Consultation_ID": {"$in": consultation_ids}})
            deleted_counts['diagnoses'] = result.deleted_count
        
        # Delete treatments
        if 'treatments' in self.db.list_collection_names():
            result = self.db.treatments.delete_many({"Consultation_ID": {"$in": consultation_ids}})
            deleted_counts['treatments'] = result.deleted_count
        
        # Delete prescriptions
        if 'prescriptions' in self.db.list_collection_names():
            result = self.db.prescriptions.delete_many({"Consultation_ID": {"$in": consultation_ids}})
            deleted_counts['prescriptions'] = result.deleted_count
        
        # Delete admissions
        if 'admissions' in self.db.list_collection_names():
            result = self.db.admissions.delete_many({"Consultation_ID": {"$in": consultation_ids}})
            deleted_counts['admissions'] = result.deleted_count
        
        # Finally delete consultations
        result = self.db.medical_consultations.delete_many({"_id": {"$in": consultation_ids}})
        deleted_counts['medical_consultations'] = result.deleted_count
        
        print(f"Deleted records:")
        for collection, count in deleted_counts.items():
            if count > 0:
                print(f"  {collection}: {count:,}")
        
        return count_to_delete
    
    def cleanup_test_data(self, dry_run: bool = True):
        """Remove test data from all collections"""
        test_data_counts = self.find_test_data()
        
        if not test_data_counts:
            print("No test data found")
            return 0
        
        total_deleted = 0
        
        if dry_run:
            print("DRY RUN: Would delete test data:")
            for collection, count in test_data_counts.items():
                print(f"  {collection}: {count:,} records")
                total_deleted += count
            return total_deleted
        
        for collection_name, count in test_data_counts.items():
            collection = self.db[collection_name]
            
            # Delete test records
            result = collection.delete_many({
                "$or": [
                    {"test_data": True},
                    {"is_test": True},
                    {"test": True}
                ]
            })
            
            # Delete test names/emails for specific collections
            if collection_name == 'patients':
                result2 = collection.delete_many({
                    "$or": [
                        {"Patient_name": {"$regex": "test", "$options": "i"}},
                        {"Patient_email": {"$regex": "test", "$options": "i"}},
                        {"Patient_name": {"$regex": "sample", "$options": "i"}}
                    ]
                })
                result.deleted_count += result2.deleted_count
            elif collection_name == 'doctors':
                result2 = collection.delete_many({
                    "$or": [
                        {"Doctor_name": {"$regex": "test", "$options": "i"}},
                        {"Doctor_email": {"$regex": "test", "$options": "i"}}
                    ]
                })
                result.deleted_count += result2.deleted_count
            
            print(f"Deleted {result.deleted_count:,} test records from {collection_name}")
            total_deleted += result.deleted_count
        
        return total_deleted
    
    def cleanup_specific_collection(self, collection_name: str, dry_run: bool = True):
        """Remove entire collection"""
        if collection_name not in self.db.list_collection_names():
            print(f"Collection '{collection_name}' not found")
            return 0
        
        count = self.db[collection_name].count_documents({})
        
        if dry_run:
            print(f"DRY RUN: Would delete entire collection '{collection_name}' ({count:,} records)")
            return count
        
        self.db[collection_name].drop()
        print(f"Deleted collection '{collection_name}' ({count:,} records)")
        return count
    
    def interactive_cleanup(self):
        """Interactive cleanup menu"""
        while True:
            print("\n" + "="*60)
            print("MongoDB Atlas Database Cleanup Menu")
            print("="*60)
            
            # Show current stats
            self.get_database_stats()
            
            print("\nCleanup Options:")
            print("1. Remove old consultations (90+ days)")
            print("2. Remove test/sample data")
            print("3. Remove specific collection")
            print("4. Find old consultations (preview)")
            print("5. Find test data (preview)")
            print("6. Refresh statistics")
            print("7. Exit")
            
            choice = input("\nSelect option (1-7): ").strip()
            
            if choice == '1':
                days = input("Remove consultations older than how many days? [90]: ").strip()
                days = int(days) if days else 90
                
                # Preview first
                old_count = self.find_old_consultations(days)
                if old_count == 0:
                    continue
                
                confirm = input(f"Delete {old_count:,} old consultations and related records? (y/N): ").strip().lower()
                if confirm == 'y':
                    self.cleanup_old_consultations(days, dry_run=False)
                    print("Cleanup completed!")
            
            elif choice == '2':
                test_data = self.find_test_data()
                if not test_data:
                    print("No test data found")
                    continue
                
                print("Found test data:")
                for collection, count in test_data.items():
                    print(f"  {collection}: {count:,} records")
                
                confirm = input("Delete all test data? (y/N): ").strip().lower()
                if confirm == 'y':
                    self.cleanup_test_data(dry_run=False)
                    print("Test data cleanup completed!")
            
            elif choice == '3':
                collections = self.db.list_collection_names()
                print("Available collections:")
                for i, coll in enumerate(collections, 1):
                    count = self.db[coll].count_documents({})
                    print(f"  {i}. {coll} ({count:,} records)")
                
                try:
                    coll_choice = int(input("Select collection number to delete: ")) - 1
                    collection_name = collections[coll_choice]
                    
                    confirm = input(f"Delete entire collection '{collection_name}'? (y/N): ").strip().lower()
                    if confirm == 'y':
                        self.cleanup_specific_collection(collection_name, dry_run=False)
                        print("Collection deleted!")
                except (ValueError, IndexError):
                    print("Invalid selection")
            
            elif choice == '4':
                days = input("Find consultations older than how many days? [90]: ").strip()
                days = int(days) if days else 90
                self.find_old_consultations(days)
            
            elif choice == '5':
                test_data = self.find_test_data()
                if test_data:
                    print("Found test data:")
                    for collection, count in test_data.items():
                        print(f"  {collection}: {count:,} records")
                else:
                    print("No test data found")
            
            elif choice == '6':
                continue  # Will refresh stats at top of loop
            
            elif choice == '7':
                break
            
            else:
                print("Invalid option")
    
    def close_connection(self):
        if self.client:
            self.client.close()

def main():
    """Main cleanup function"""
    print("MongoDB Atlas Database Cleanup Tool")
    print("=" * 50)
    
    # Check if Atlas URI is set
    if not os.getenv('MONGODB_ATLAS_URI'):
        print("MONGODB_ATLAS_URI environment variable not set.")
        print("Please set up your .env file with Atlas connection string")
        return
    
    try:
        cleanup = DatabaseCleanup()
        cleanup.interactive_cleanup()
    except KeyboardInterrupt:
        print("\nCleanup interrupted by user")
    except Exception as e:
        print(f"Error during cleanup: {e}")
    finally:
        try:
            cleanup.close_connection()
        except:
            pass

if __name__ == "__main__":
    main()