"""
Minimal Gauteng Hospitals Generator - Free Tier Optimized
Generates essential hospital data that fits within MongoDB Atlas free tier limits
"""

import json
import random
from datetime import datetime, timedelta
from typing import Dict, List

class MinimalGautengHospitalsGenerator:
    def __init__(self):
        # Only major hospitals - reduced from 44 to 10 key facilities
        self.major_hospitals = [
            {
                'name': 'Charlotte Maxeke Johannesburg Academic Hospital',
                'address': '17 Jubilee Rd, Parktown',
                'lat': -26.1867, 'lng': 28.0435,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Tertiary',
                'phone': '+27 11 488 4911', 'specialties': ['Emergency', 'Cardiology', 'Neurology', 'Surgery']
            },
            {
                'name': 'Chris Hani Baragwanath Academic Hospital',
                'address': '26 Chris Hani Rd, Diepkloof, Soweto',
                'lat': -26.2423, 'lng': 27.9089,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Tertiary',
                'phone': '+27 11 933 0000', 'specialties': ['Emergency', 'Trauma Surgery', 'Cardiology', 'Pediatrics']
            },
            {
                'name': 'Steve Biko Academic Hospital',
                'address': 'Cnr Steve Biko & Sophie de Bruyn St, Pretoria',
                'lat': -25.7234, 'lng': 28.1889,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Tertiary',
                'phone': '+27 12 354 1000', 'specialties': ['Emergency', 'Neurology', 'Cardiology', 'Surgery']
            },
            {
                'name': 'The Milpark Hospital',
                'address': '9 Guild Rd, Parktown West',
                'lat': -26.1723, 'lng': 28.0234,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Tertiary',
                'phone': '+27 11 480 7000', 'specialties': ['Emergency', 'Cardiology', 'Neurology', 'Surgery']
            },
            {
                'name': 'Sandton Mediclinic',
                'address': 'Peter Place, Sandton',
                'lat': -26.1076, 'lng': 28.0567,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 11 709 2000', 'specialties': ['Emergency', 'General Medicine', 'Surgery']
            },
            {
                'name': 'Life Eugene Marais Hospital',
                'address': '529 Jochemus St, Erasmuskloof',
                'lat': -25.7889, 'lng': 28.2234,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 12 427 3000', 'specialties': ['Emergency', 'General Medicine', 'Surgery']
            },
            {
                'name': 'Helen Joseph Hospital',
                'address': 'Perth Rd, Westdene',
                'lat': -26.1456, 'lng': 27.9834,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Secondary',
                'phone': '+27 11 276 8000', 'specialties': ['Emergency', 'General Medicine', 'Surgery']
            },
            {
                'name': 'Kalafong Provincial Tertiary Hospital',
                'address': 'Jubilee Rd, Atteridgeville',
                'lat': -25.7645, 'lng': 28.0456,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Tertiary',
                'phone': '+27 12 373 0911', 'specialties': ['Emergency', 'General Medicine', 'Pediatrics']
            },
            {
                'name': 'ER24 Sandton Emergency Centre',
                'address': 'Sandton City, Sandton',
                'lat': -26.1067, 'lng': 28.0567,
                'type': 'Emergency Center', 'ownership': 'Private', 'level': 'Primary',
                'phone': '+27 84 124 911', 'specialties': ['Emergency']
            },
            {
                'name': 'ER24 Pretoria Emergency Centre',
                'address': 'Brooklyn Mall, Pretoria',
                'lat': -25.7634, 'lng': 28.2345,
                'type': 'Emergency Center', 'ownership': 'Private', 'level': 'Primary',
                'phone': '+27 84 124 911', 'specialties': ['Emergency']
            }
        ]
    
    def generate_minimal_facilities(self) -> List[Dict]:
        """Generate minimal hospital facility records"""
        facilities = []
        
        for i, hospital in enumerate(self.major_hospitals, 1):
            city = 'Pretoria' if hospital['lat'] > -25.9 else 'Johannesburg'
            
            facility = {
                '_id': i,
                'Name': hospital['name'],
                'Ownership_type': hospital['ownership'],
                'Facility_type': hospital['type'],
                'Level_of_care': hospital['level'],
                'Address': hospital['address'],
                'City': city,
                'Province': 'Gauteng',
                'Phone': hospital['phone'],
                'latitude': hospital['lat'],
                'longitude': hospital['lng'],
                'specialties': hospital['specialties'],
                'has_emergency': 'Emergency' in hospital['specialties'],
                'rating': round(3.5 + random.random() * 1.5, 1)
            }
            facilities.append(facility)
        
        return facilities
    
    def generate_essential_departments(self, facilities: List[Dict]) -> List[Dict]:
        """Generate only essential departments"""
        departments = []
        dept_id = 1
        
        for facility in facilities:
            facility_id = facility['_id']
            specialties = facility['specialties']
            
            # Only create 2-3 departments per facility to save space
            essential_specialties = specialties[:3]  # Limit to first 3 specialties
            
            for specialty in essential_specialties:
                department = {
                    '_id': dept_id,
                    'Facility_ID': facility_id,
                    'Name': f'{specialty} Department',
                    'Specialty': specialty,
                    'Capacity_beds': random.randint(20, 50),
                    'Head_of_Department': f"Dr. {self._generate_simple_name()}"
                }
                departments.append(department)
                dept_id += 1
        
        return departments
    
    def generate_basic_capacity(self, departments: List[Dict]) -> List[Dict]:
        """Generate basic capacity records"""
        capacity_records = []
        
        for dept in departments:
            max_beds = dept['Capacity_beds']
            utilization_rate = random.uniform(0.4, 0.8)
            
            capacity = {
                '_id': dept['_id'],
                'Department_ID': dept['_id'],
                'Current_patients': int(max_beds * utilization_rate),
                'Current_beds_available': max_beds - int(max_beds * utilization_rate),
                'Status': 'Available' if utilization_rate < 0.7 else 'High',
                'Last_updated': datetime.now()
            }
            capacity_records.append(capacity)
        
        return capacity_records
    
    def _generate_simple_name(self) -> str:
        """Generate simple doctor names"""
        first_names = ['John', 'Sarah', 'Michael', 'Nomsa', 'David', 'Priya']
        last_names = ['Smith', 'Mthembu', 'Patel', 'Johnson', 'Nkomo', 'Botha']
        return f"{random.choice(first_names)} {random.choice(last_names)}"
    
    def generate_minimal_dataset(self) -> Dict:
        """Generate minimal dataset for free tier"""
        print("Generating minimal Gauteng hospitals dataset for free tier...")
        
        facilities = self.generate_minimal_facilities()
        departments = self.generate_essential_departments(facilities)
        capacity_records = self.generate_basic_capacity(departments)
        
        dataset = {
            'facilities': facilities,
            'departments': departments,
            'department_capacity': capacity_records
        }
        
        total_records = sum(len(collection) for collection in dataset.values())
        print(f"Generated {total_records} total records:")
        for name, records in dataset.items():
            print(f"- {name}: {len(records)} records")
        
        return dataset
    
    def save_minimal_data(self, dataset: Dict, filename: str = 'minimal_hospitals_data.json'):
        """Save minimal dataset"""
        # Convert datetime objects to strings
        json_dataset = self._serialize_for_json(dataset)
        
        with open(filename, 'w') as f:
            json.dump(json_dataset, f, indent=2)
        
        print(f"Minimal dataset saved to {filename}")
        return filename
    
    def _serialize_for_json(self, obj):
        """Convert datetime objects to ISO strings"""
        if isinstance(obj, datetime):
            return obj.isoformat()
        elif isinstance(obj, dict):
            return {key: self._serialize_for_json(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._serialize_for_json(item) for item in obj]
        else:
            return obj

def generate_minimal_hospital_data():
    """Generate minimal hospital data for free tier"""
    generator = MinimalGautengHospitalsGenerator()
    dataset = generator.generate_minimal_dataset()
    filename = generator.save_minimal_data(dataset)
    return filename

if __name__ == "__main__":
    print("Minimal Gauteng Hospitals Generator - Free Tier Optimized")
    print("=" * 60)
    filename = generate_minimal_hospital_data()
    print(f"\nUse: python atlas_data_uploader.py")
    print(f"Then upload: {filename}")