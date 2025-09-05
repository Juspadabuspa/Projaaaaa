"""
Gauteng Hospitals Database Generator - Complete Version
Adds comprehensive real hospital data for Johannesburg and Pretoria to MongoDB
"""

import json
import random
from datetime import datetime, timedelta
from typing import Dict, List
import numpy as np

class GautengHospitalsGenerator:
    def __init__(self):
        # Real hospitals in Johannesburg and Pretoria with actual locations
        self.johannesburg_hospitals = [
            {
                'name': 'Charlotte Maxeke Johannesburg Academic Hospital',
                'address': '17 Jubilee Rd, Parktown',
                'lat': -26.1867, 'lng': 28.0435,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Tertiary',
                'phone': '+27 11 488 4911', 'specialties': ['Emergency', 'Cardiology', 'Neurology', 'Oncology', 'Surgery', 'General Medicine']
            },
            {
                'name': 'Chris Hani Baragwanath Academic Hospital',
                'address': '26 Chris Hani Rd, Diepkloof, Soweto',
                'lat': -26.2423, 'lng': 27.9089,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Tertiary',
                'phone': '+27 11 933 0000', 'specialties': ['Emergency', 'Trauma Surgery', 'Cardiology', 'Pediatrics', 'General Medicine', 'Orthopedics']
            },
            {
                'name': 'Rahima Moosa Mother and Child Hospital',
                'address': '22 Civic Centre, Coronationville',
                'lat': -26.1789, 'lng': 27.9567,
                'type': 'Specialty Center', 'ownership': 'Public', 'level': 'Tertiary',
                'phone': '+27 11 470 9000', 'specialties': ['Pediatrics', 'Neonatal', 'Emergency', 'Obstetrics']
            },
            {
                'name': 'Helen Joseph Hospital',
                'address': 'Perth Rd, Westdene',
                'lat': -26.1456, 'lng': 27.9834,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Secondary',
                'phone': '+27 11 276 8000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Orthopedics']
            },
            {
                'name': 'The Milpark Hospital',
                'address': '9 Guild Rd, Parktown West',
                'lat': -26.1723, 'lng': 28.0234,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Tertiary',
                'phone': '+27 11 480 7000', 'specialties': ['Emergency', 'Cardiology', 'Neurology', 'Oncology', 'Surgery', 'General Medicine']
            },
            {
                'name': 'Sandton Mediclinic',
                'address': 'Peter Place, Sandton',
                'lat': -26.1076, 'lng': 28.0567,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 11 709 2000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Cardiology', 'Orthopedics']
            },
            {
                'name': 'Life Rosebank Hospital',
                'address': '14 Sturdee Ave, Rosebank',
                'lat': -26.1467, 'lng': 28.0423,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 11 328 0500', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics']
            },
            {
                'name': 'Netcare Johannesburg Hospital',
                'address': '8th Floor, 1 Rosebank Mews, Rosebank',
                'lat': -26.1445, 'lng': 28.0401,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 11 328 3200', 'specialties': ['Emergency', 'General Medicine', 'Cardiology', 'Surgery']
            },
            {
                'name': 'Life Groenkloof Hospital',
                'address': '4 George Storrar Dr, Groenkloof',
                'lat': -26.1567, 'lng': 28.0234,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 11 315 0911', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Orthopedics']
            },
            {
                'name': 'Ahmed Kathrada Private Hospital',
                'address': 'Cnr Beyers Naude & 14th Ave, Roodepoort',
                'lat': -26.1623, 'lng': 27.8734,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 11 709 3000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Cardiology']
            },
            {
                'name': 'Leratong Hospital',
                'address': 'Hospital St, Krugersdorp',
                'lat': -26.0923, 'lng': 27.7645,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Secondary',
                'phone': '+27 11 951 7000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics']
            },
            {
                'name': 'Carletonville Hospital',
                'address': 'Annan Rd, Carletonville',
                'lat': -26.3634, 'lng': 27.3967,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Secondary',
                'phone': '+27 18 788 1600', 'specialties': ['Emergency', 'General Medicine', 'Surgery']
            },
            {
                'name': 'Sebokeng Hospital',
                'address': 'Moshoeshoe St, Sebokeng',
                'lat': -26.5789, 'lng': 27.8645,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Secondary',
                'phone': '+27 16 970 9000', 'specialties': ['Emergency', 'General Medicine', 'Pediatrics', 'Surgery']
            },
            {
                'name': 'Tambo Memorial Hospital',
                'address': 'Boksburg North',
                'lat': -26.2234, 'lng': 28.2567,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Secondary',
                'phone': '+27 11 906 1000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Orthopedics']
            },
            {
                'name': 'Edenvale Hospital',
                'address': '1 Valley Rd, Edenvale',
                'lat': -26.1445, 'lng': 28.1523,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Secondary',
                'phone': '+27 11 999 0911', 'specialties': ['Emergency', 'General Medicine', 'Pediatrics']
            },
            {
                'name': 'Germiston Hospital',
                'address': 'Rand Airport Rd, Germiston',
                'lat': -26.2345, 'lng': 28.1234,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Secondary',
                'phone': '+27 11 825 5000', 'specialties': ['Emergency', 'General Medicine', 'Surgery']
            },
            {
                'name': 'Life Bedford Gardens Hospital',
                'address': '48 York Rd, Bedfordview',
                'lat': -26.1723, 'lng': 28.1234,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 11 458 2000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Cardiology']
            },
            {
                'name': 'Mediclinic Morningside',
                'address': 'Corner Hill & Rivonia Rd, Sandton',
                'lat': -26.0789, 'lng': 28.0567,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 11 282 0600', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics']
            },
            {
                'name': 'Life Wilgeheuwel Hospital',
                'address': 'Cnr Hendrik Potgieter & Laser Rd, Roodepoort',
                'lat': -26.0923, 'lng': 27.8234,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 11 875 3000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Orthopedics']
            },
            {
                'name': 'Johannesburg Hospital',
                'address': 'Smit St, Braamfontein',
                'lat': -26.1934, 'lng': 28.0356,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Tertiary',
                'phone': '+27 11 488 3911', 'specialties': ['Emergency', 'Trauma Surgery', 'Neurology', 'Cardiology', 'General Medicine']
            }
        ]
        
        self.pretoria_hospitals = [
            {
                'name': 'Steve Biko Academic Hospital',
                'address': 'Cnr Steve Biko & Sophie de Bruyn St, Pretoria',
                'lat': -25.7234, 'lng': 28.1889,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Tertiary',
                'phone': '+27 12 354 1000', 'specialties': ['Emergency', 'Neurology', 'Cardiology', 'Oncology', 'Surgery', 'General Medicine']
            },
            {
                'name': 'Kalafong Provincial Tertiary Hospital',
                'address': 'Jubilee Rd, Atteridgeville',
                'lat': -25.7645, 'lng': 28.0456,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Tertiary',
                'phone': '+27 12 373 0911', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics']
            },
            {
                'name': 'Pretoria Academic Hospital',
                'address': 'Dr Savage Rd, Pretoria West',
                'lat': -25.7567, 'lng': 28.1723,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Tertiary',
                'phone': '+27 12 354 3000', 'specialties': ['Emergency', 'Trauma Surgery', 'Neurology', 'Cardiology', 'General Medicine']
            },
            {
                'name': 'Tshwane District Hospital',
                'address': '566 Boom St, Pretoria Central',
                'lat': -25.7461, 'lng': 28.1881,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Secondary',
                'phone': '+27 12 354 7000', 'specialties': ['Emergency', 'General Medicine', 'Surgery']
            },
            {
                'name': 'Life Eugene Marais Hospital',
                'address': '529 Jochemus St, Erasmuskloof',
                'lat': -25.7889, 'lng': 28.2234,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 12 427 3000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Cardiology']
            },
            {
                'name': 'Mediclinic Heart Hospital',
                'address': 'Cnr Atterbury & Garsfontein Rd, Faerie Glen',
                'lat': -25.8234, 'lng': 28.3567,
                'type': 'Specialty Center', 'ownership': 'Private', 'level': 'Tertiary',
                'phone': '+27 12 609 2000', 'specialties': ['Emergency', 'Cardiology', 'Cardiac Surgery', 'General Medicine']
            },
            {
                'name': 'Netcare Akasia Hospital',
                'address': 'Cnr Thabo Mbeki & WF Nkomo St, Akasia',
                'lat': -25.6789, 'lng': 28.1456,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 12 549 0000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics']
            },
            {
                'name': 'Life Groenkloof Hospital',
                'address': 'George Storrar Dr, Groenkloof',
                'lat': -25.7723, 'lng': 28.2456,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 12 421 4000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Orthopedics']
            },
            {
                'name': 'Mediclinic Muelmed',
                'address': '555 Nellmapius Dr, Irene',
                'lat': -25.9012, 'lng': 28.2123,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 12 677 9000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics']
            },
            {
                'name': 'Life Wilgers Hospital',
                'address': 'Cnr Rubida & Van Ryneveld Ave, Centurion',
                'lat': -25.8567, 'lng': 28.1890,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 12 677 6000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Orthopedics']
            },
            {
                'name': 'Netcare Jakaranda Hospital',
                'address': '200 Jakaranda St, Muckleneuk',
                'lat': -25.7634, 'lng': 28.2078,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 12 423 6000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Cardiology']
            },
            {
                'name': 'Dr George Mukhari Academic Hospital',
                'address': 'Sefako Makgatho Health Sciences University, Ga-Rankuwa',
                'lat': -25.6234, 'lng': 27.9567,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Tertiary',
                'phone': '+27 12 521 4000', 'specialties': ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics', 'Neurology']
            },
            {
                'name': 'Bronkhorstspruit Hospital',
                'address': 'Hospital St, Bronkhorstspruit',
                'lat': -25.8123, 'lng': 28.7456,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Secondary',
                'phone': '+27 13 932 9600', 'specialties': ['Emergency', 'General Medicine', 'Surgery']
            },
            {
                'name': 'Cullinan Hospital',
                'address': 'Rayton Rd, Cullinan',
                'lat': -25.6789, 'lng': 28.5234,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Primary',
                'phone': '+27 12 734 9000', 'specialties': ['Emergency', 'General Medicine']
            },
            {
                'name': 'Hammanskraal Hospital',
                'address': 'R513, Hammanskraal',
                'lat': -25.4123, 'lng': 28.2678,
                'type': 'Hospital', 'ownership': 'Public', 'level': 'Secondary',
                'phone': '+27 12 711 2000', 'specialties': ['Emergency', 'General Medicine', 'Pediatrics']
            },
            {
                'name': 'Netcare Femina Hospital',
                'address': '460 Belvedere St, Arcadia',
                'lat': -25.7461, 'lng': 28.2234,
                'type': 'Hospital', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 12 440 6111', 'specialties': ['Emergency', 'General Medicine', 'Obstetrics', 'Pediatrics']
            }
        ]
        
        self.clinics_and_centers = [
            # Emergency Centers
            {
                'name': 'ER24 Sandton Emergency Centre',
                'address': 'Sandton City, Sandton',
                'lat': -26.1067, 'lng': 28.0567,
                'type': 'Emergency Center', 'ownership': 'Private', 'level': 'Primary',
                'phone': '+27 84 124 911', 'specialties': ['Emergency']
            },
            {
                'name': 'Netcare 911 Johannesburg Emergency Centre',
                'address': 'Rosebank, Johannesburg',
                'lat': -26.1456, 'lng': 28.0423,
                'type': 'Emergency Center', 'ownership': 'Private', 'level': 'Primary',
                'phone': '+27 82 911 911', 'specialties': ['Emergency']
            },
            {
                'name': 'ER24 Centurion Emergency Centre',
                'address': 'Centurion Mall, Centurion',
                'lat': -25.8567, 'lng': 28.1890,
                'type': 'Emergency Center', 'ownership': 'Private', 'level': 'Primary',
                'phone': '+27 84 124 911', 'specialties': ['Emergency']
            },
            {
                'name': 'ER24 Pretoria Emergency Centre',
                'address': 'Brooklyn Mall, Pretoria',
                'lat': -25.7634, 'lng': 28.2345,
                'type': 'Emergency Center', 'ownership': 'Private', 'level': 'Primary',
                'phone': '+27 84 124 911', 'specialties': ['Emergency']
            },
            # Specialty Clinics
            {
                'name': 'Johannesburg Heart Institute',
                'address': 'Houghton, Johannesburg',
                'lat': -26.1567, 'lng': 28.0678,
                'type': 'Specialty Center', 'ownership': 'Private', 'level': 'Tertiary',
                'phone': '+27 11 484 0911', 'specialties': ['Cardiology', 'Cardiac Surgery', 'Emergency']
            },
            {
                'name': 'Wits Donald Gordon Medical Centre',
                'address': 'Parktown, Johannesburg',
                'lat': -26.1823, 'lng': 28.0456,
                'type': 'Specialty Center', 'ownership': 'Private', 'level': 'Tertiary',
                'phone': '+27 11 356 6000', 'specialties': ['Oncology', 'Neurology', 'Cardiology', 'Emergency']
            },
            {
                'name': 'Pretoria Eye Institute',
                'address': 'Brooklyn, Pretoria',
                'lat': -25.7634, 'lng': 28.2345,
                'type': 'Specialty Center', 'ownership': 'Private', 'level': 'Secondary',
                'phone': '+27 12 460 9000', 'specialties': ['Ophthalmology', 'Emergency']
            },
            {
                'name': 'Johannesburg Cancer Centre',
                'address': 'Saxonwold, Johannesburg',
                'lat': -26.1445, 'lng': 28.0512,
                'type': 'Specialty Center', 'ownership': 'Private', 'level': 'Tertiary',
                'phone': '+27 11 482 3000', 'specialties': ['Oncology', 'Surgery', 'Emergency']
            }
        ]
    
    def generate_hospital_facilities(self) -> List[Dict]:
        """Generate comprehensive hospital facility records"""
        facilities = []
        facility_id = 1
        
        # Combine all hospital data
        all_hospitals = (self.johannesburg_hospitals + 
                        self.pretoria_hospitals + 
                        self.clinics_and_centers)
        
        for hospital in all_hospitals:
            # Determine city and province
            if hospital['lat'] > -25.9:  # Pretoria area
                city = 'Pretoria'
                province = 'Gauteng'
            else:  # Johannesburg area
                city = 'Johannesburg'
                province = 'Gauteng'
            
            # Generate capacity based on hospital type and ownership
            base_capacity = self._get_base_capacity(hospital['type'], hospital['ownership'])
            
            facility = {
                '_id': facility_id,
                'Name': hospital['name'],
                'Ownership_type': hospital['ownership'],
                'Facility_type': hospital['type'],
                'Level_of_care': hospital['level'],
                'Address': hospital['address'],
                'City': city,
                'Province': province,
                'Phone': hospital['phone'],
                'capacity_beds': base_capacity,
                'established_date': self._generate_establishment_date(),
                'latitude': hospital['lat'],
                'longitude': hospital['lng'],
                'specialties': hospital['specialties'],
                'rating': round(3.5 + random.random() * 1.5, 1),  # 3.5-5.0 rating
                'emergency_level': self._determine_emergency_level(hospital['type'], hospital['level']),
                'has_emergency': 'Emergency' in hospital['specialties'],
                'has_trauma_unit': hospital['level'] in ['Tertiary', 'Secondary'] and hospital['type'] == 'Hospital',
                'has_icu': hospital['type'] == 'Hospital' and hospital['level'] in ['Tertiary', 'Secondary'],
                'parking_available': True,
                'wheelchair_accessible': True,
                'accepts_medical_aid': hospital['ownership'] == 'Private',
                'accepts_cash_patients': True
            }
            
            facilities.append(facility)
            facility_id += 1
        
        return facilities
    
    def generate_departments(self, facilities: List[Dict]) -> List[Dict]:
        """Generate department records for each hospital"""
        departments = []
        dept_id = 1
        
        for facility in facilities:
            facility_id = facility['_id']
            specialties = facility['specialties']
            facility_type = facility['Facility_type']
            
            for specialty in specialties:
                dept_name = self._map_specialty_to_department(specialty)
                
                # Determine department capacity
                if facility_type == 'Emergency Center':
                    capacity_beds = random.randint(5, 15)
                    capacity_doctors = random.randint(2, 6)
                elif facility_type == 'Specialty Center':
                    capacity_beds = random.randint(10, 30)
                    capacity_doctors = random.randint(3, 12)
                else:  # Hospital
                    if specialty == 'Emergency':
                        capacity_beds = random.randint(15, 40)
                        capacity_doctors = random.randint(5, 15)
                    elif specialty in ['Cardiology', 'Neurology', 'Oncology']:
                        capacity_beds = random.randint(20, 60)
                        capacity_doctors = random.randint(8, 25)
                    else:
                        capacity_beds = random.randint(25, 80)
                        capacity_doctors = random.randint(10, 30)
                
                department = {
                    '_id': dept_id,
                    'Facility_ID': facility_id,
                    'Name': dept_name,
                    'Type': self._get_department_type(specialty),
                    'Capacity_beds': capacity_beds,
                    'Capacity_doctors': capacity_doctors,
                    'Specialty': specialty,
                    'Head_of_Department': f"Dr. {self._generate_doctor_name()}",
                    'Department_phone': self._generate_department_phone(facility['Phone'])
                }
                
                departments.append(department)
                dept_id += 1
        
        return departments
    
    def generate_department_capacity(self, departments: List[Dict]) -> List[Dict]:
        """Generate current capacity status for each department"""
        capacity_records = []
        
        for dept in departments:
            max_beds = dept['Capacity_beds']
            max_doctors = dept['Capacity_doctors']
            
            # Generate realistic current utilization
            if dept['Specialty'] == 'Emergency':
                # Emergency departments tend to be busier
                utilization_rate = random.uniform(0.6, 0.95)
            elif dept['Type'] == 'ICU':
                # ICU departments are often near capacity
                utilization_rate = random.uniform(0.7, 0.9)
            else:
                # Regular departments
                utilization_rate = random.uniform(0.4, 0.8)
            
            current_patients = int(max_beds * utilization_rate)
            available_beds = max_beds - current_patients
            doctors_on_duty = random.randint(max(1, max_doctors // 3), max_doctors)
            
            capacity = {
                '_id': dept['_id'],
                'Department_ID': dept['_id'],
                'Current_patients': current_patients,
                'Current_beds_available': available_beds,
                'Current_doctors_on_duty': doctors_on_duty,
                'Max_capacity': max_beds,
                'Utilization_rate': round(utilization_rate * 100, 1),
                'Last_updated': datetime.now(),
                'Status': self._get_capacity_status(utilization_rate)
            }
            
            capacity_records.append(capacity)
        
        return capacity_records
    
    def _get_base_capacity(self, facility_type: str, ownership: str) -> int:
        """Determine base bed capacity"""
        if facility_type == 'Emergency Center':
            return random.randint(10, 25)
        elif facility_type == 'Specialty Center':
            return random.randint(30, 100)
        elif facility_type == 'Clinic':
            return random.randint(5, 20)
        else:  # Hospital
            if ownership == 'Public':
                return random.randint(200, 800)  # Large public hospitals
            else:  # Private
                return random.randint(100, 400)  # Private hospitals
    
    def _generate_establishment_date(self) -> datetime:
        """Generate realistic establishment date"""
        start_year = random.choice([1960, 1970, 1980, 1990, 2000, 2010])
        return datetime(start_year + random.randint(0, 20), random.randint(1, 12), random.randint(1, 28))
    
    def _determine_emergency_level(self, facility_type: str, level_of_care: str) -> str:
        """Determine emergency trauma level"""
        if facility_type == 'Emergency Center':
            return 'Level 3 Trauma Center'
        elif level_of_care == 'Tertiary':
            return 'Level 1 Trauma Center'
        elif level_of_care == 'Secondary':
            return 'Level 2 Trauma Center'
        else:
            return 'Basic Emergency Care'
    
    def _map_specialty_to_department(self, specialty: str) -> str:
        """Map specialty to department name"""
        mapping = {
            'Emergency': 'Emergency Department',
            'General Medicine': 'General Medicine Department',
            'Cardiology': 'Cardiology Department',
            'Neurology': 'Neurology Department',
            'Pediatrics': 'Pediatrics Department',
            'Surgery': 'Surgery Department',
            'Orthopedics': 'Orthopedics Department',
            'Oncology': 'Oncology Department',
            'Obstetrics': 'Obstetrics and Gynecology Department',
            'Cardiac Surgery': 'Cardiac Surgery Department',
            'Trauma Surgery': 'Trauma Surgery Department',
            'Neonatal': 'Neonatal Intensive Care Unit',
            'Ophthalmology': 'Ophthalmology Department'
        }
        return mapping.get(specialty, f'{specialty} Department')
    
    def _get_department_type(self, specialty: str) -> str:
        """Get department type"""
        if specialty == 'Emergency':
            return 'Emergency'
        elif specialty in ['Surgery', 'Cardiac Surgery', 'Trauma Surgery']:
            return 'Surgery'
        elif specialty in ['Neonatal']:
            return 'ICU'
        else:
            return 'Inpatient'
    
    def _generate_doctor_name(self) -> str:
        """Generate realistic South African doctor name"""
        first_names = ['John', 'Sarah', 'Michael', 'Nomsa', 'Thabo', 'Priya', 'David', 'Fatima', 'Craig', 'Lerato', 
                      'Ahmed', 'Zanele', 'Rajesh', 'Maria', 'Sipho', 'Aisha', 'Willem', 'Nalini', 'Trevor', 'Mbali']
        last_names = ['Smith', 'Mthembu', 'Van Der Merwe', 'Patel', 'Mohamed', 'Nkomo', 'Johnson', 'Botha', 
                     'Mahlangu', 'Singh', 'Dlamini', 'Pillay', 'Van Zyl', 'Reddy', 'Mbeki', 'Kowalski']
        return f"{random.choice(first_names)} {random.choice(last_names)}"
    
    def _generate_department_phone(self, main_phone: str) -> str:
        """Generate department-specific phone extension"""
        # Extract base number and add extension
        base = main_phone.replace('+27 ', '').replace(' ', '')
        extension = random.randint(1000, 9999)
        return f"{main_phone} ext {extension}"
    
    def _get_capacity_status(self, utilization_rate: float) -> str:
        """Determine capacity status based on utilization rate"""
        if utilization_rate >= 0.9:
            return 'Critical'
        elif utilization_rate >= 0.8:
            return 'High'
        elif utilization_rate >= 0.6:
            return 'Moderate'
        else:
            return 'Available'
    
    def generate_staff_records(self, departments: List[Dict]) -> List[Dict]:
        """Generate staff records for each department"""
        staff_records = []
        staff_id = 1
        
        for dept in departments:
            dept_id = dept['_id']
            specialty = dept['Specialty']
            max_doctors = dept['Capacity_doctors']
            
            # Generate doctors for this department
            num_doctors = random.randint(max(1, max_doctors // 2), max_doctors)
            
            for _ in range(num_doctors):
                staff_record = {
                    '_id': staff_id,
                    'Department_ID': dept_id,
                    'Name': f"Dr. {self._generate_doctor_name()}",
                    'Position': self._get_doctor_position(specialty),
                    'Specialty': specialty,
                    'Years_experience': random.randint(2, 25),
                    'Qualification': self._get_qualification(specialty),
                    'Shift_pattern': random.choice(['Day', 'Night', 'Rotating']),
                    'Contact_number': self._generate_staff_phone(),
                    'Emergency_contact': random.choice([True, False]),
                    'Currently_on_duty': random.choice([True, False]),
                    'Last_updated': datetime.now()
                }
                
                staff_records.append(staff_record)
                staff_id += 1
            
            # Generate nurses (typically 2-4x more nurses than doctors)
            num_nurses = random.randint(num_doctors * 2, num_doctors * 4)
            
            for _ in range(num_nurses):
                staff_record = {
                    '_id': staff_id,
                    'Department_ID': dept_id,
                    'Name': self._generate_nurse_name(),
                    'Position': self._get_nurse_position(),
                    'Specialty': specialty,
                    'Years_experience': random.randint(1, 20),
                    'Qualification': self._get_nurse_qualification(),
                    'Shift_pattern': random.choice(['Day', 'Night', 'Rotating']),
                    'Contact_number': self._generate_staff_phone(),
                    'Emergency_contact': random.choice([True, False]),
                    'Currently_on_duty': random.choice([True, False]),
                    'Last_updated': datetime.now()
                }
                
                staff_records.append(staff_record)
                staff_id += 1
        
        return staff_records
    
    def _get_doctor_position(self, specialty: str) -> str:
        """Get appropriate doctor position based on specialty"""
        positions = {
            'Emergency': ['Emergency Physician', 'Trauma Physician', 'Emergency Medicine Consultant'],
            'Cardiology': ['Cardiologist', 'Interventional Cardiologist', 'Cardiac Surgeon'],
            'Neurology': ['Neurologist', 'Neurosurgeon', 'Neurology Consultant'],
            'Pediatrics': ['Pediatrician', 'Neonatologist', 'Pediatric Specialist'],
            'Surgery': ['General Surgeon', 'Surgical Consultant', 'Chief Surgeon'],
            'Orthopedics': ['Orthopedic Surgeon', 'Orthopedic Consultant', 'Sports Medicine Physician'],
            'Oncology': ['Oncologist', 'Radiation Oncologist', 'Medical Oncologist'],
            'Obstetrics': ['Obstetrician', 'Gynecologist', 'Maternal-Fetal Medicine Specialist'],
            'General Medicine': ['General Practitioner', 'Internal Medicine Physician', 'Hospitalist']
        }
        return random.choice(positions.get(specialty, ['General Practitioner', 'Medical Officer']))
    
    def _get_nurse_position(self) -> str:
        """Get nurse position"""
        positions = ['Registered Nurse', 'Staff Nurse', 'Senior Nurse', 'Nurse Manager', 'Charge Nurse']
        return random.choice(positions)
    
    def _get_qualification(self, specialty: str) -> str:
        """Get doctor qualification based on specialty"""
        base_quals = ['MBChB', 'MBBS', 'MBBCh']
        specialty_quals = {
            'Emergency': ['DipPEC(SA)', 'FCEM', 'FACEM'],
            'Cardiology': ['FCP(SA)', 'PhD Cardiology', 'MMed Cardiology'],
            'Neurology': ['MMed Neurology', 'FCP(SA) Neurology', 'PhD Neurology'],
            'Pediatrics': ['DCH', 'FCPaed(SA)', 'MMed Paediatrics'],
            'Surgery': ['FCS(SA)', 'MMed Surgery', 'FRCS'],
            'Orthopedics': ['FCS(SA) Ortho', 'MMed Orthopaedics'],
            'Oncology': ['MMed Oncology', 'PhD Oncology'],
            'Obstetrics': ['FCOG(SA)', 'MMed O&G'],
            'General Medicine': ['FCP(SA)', 'MMed Internal Medicine']
        }
        
        base = random.choice(base_quals)
        if specialty in specialty_quals:
            specialist = random.choice(specialty_quals[specialty])
            return f"{base}, {specialist}"
        return base
    
    def _get_nurse_qualification(self) -> str:
        """Get nurse qualification"""
        quals = ['RN', 'RN, BCur', 'RN, Honours', 'RN, Masters', 'Enrolled Nurse']
        return random.choice(quals)
    
    def _generate_nurse_name(self) -> str:
        """Generate realistic nurse name"""
        first_names = ['Sister Mary', 'Nurse Patricia', 'Nurse Thandiwe', 'Sister Jennifer', 'Nurse Nomfundo', 
                      'Sister Grace', 'Nurse Precious', 'Sister Helen', 'Nurse Zodwa', 'Sister Anne', 
                      'Nurse Bongi', 'Sister Ruth', 'Nurse Lindiwe', 'Sister Carol', 'Nurse Mmabatho']
        last_names = ['Sithole', 'Williams', 'Mabaso', 'Roberts', 'Khumalo', 'Adams', 'Molefe', 'Davis', 
                     'Ngcobo', 'Thompson', 'Zwane', 'Brown', 'Mokoena', 'Jones', 'Mahlangu']
        return f"{random.choice(first_names)} {random.choice(last_names)}"
    
    def _generate_staff_phone(self) -> str:
        """Generate staff contact phone number"""
        return f"+27 {random.randint(71, 84)} {random.randint(100, 999)} {random.randint(1000, 9999)}"
    
    def generate_equipment_inventory(self, departments: List[Dict]) -> List[Dict]:
        """Generate equipment inventory for departments"""
        equipment_records = []
        equipment_id = 1
        
        # Equipment categories by department type
        equipment_by_specialty = {
            'Emergency': [
                'Defibrillator', 'Ventilator', 'Cardiac Monitor', 'Crash Cart', 'Ultrasound Machine',
                'X-Ray Machine', 'ECG Machine', 'Oxygen Concentrator', 'IV Pump', 'Stretcher'
            ],
            'Cardiology': [
                'ECG Machine', 'Echocardiogram', 'Cardiac Catheterization Equipment', 'Defibrillator',
                'Stress Test Machine', 'Holter Monitor', 'Pacemaker Programmer', 'Cardiac Monitor'
            ],
            'Surgery': [
                'Operating Table', 'Anesthesia Machine', 'Surgical Lights', 'Electrocautery Unit',
                'Surgical Instruments Set', 'Ventilator', 'Sterilizer', 'Suction Unit'
            ],
            'General Medicine': [
                'Hospital Bed', 'Vital Signs Monitor', 'IV Pump', 'Wheelchair', 'Nebulizer',
                'Oxygen Concentrator', 'Blood Pressure Monitor', 'Thermometer'
            ],
            'Pediatrics': [
                'Pediatric Ventilator', 'Incubator', 'Pediatric Monitor', 'Pediatric Bed',
                'Vaccination Refrigerator', 'Pediatric Scale', 'Pulse Oximeter'
            ],
            'Neurology': [
                'EEG Machine', 'EMG Machine', 'CT Scanner', 'MRI Machine', 'Neurological Monitor',
                'Lumbar Puncture Kit', 'Reflex Hammer Set'
            ],
            'Orthopedics': [
                'X-Ray Machine', 'Bone Drill', 'Orthopedic Table', 'Traction Equipment',
                'Bone Saw', 'Cast Materials', 'Rehabilitation Equipment'
            ],
            'Oncology': [
                'Chemotherapy Chair', 'Infusion Pump', 'Radiation Therapy Equipment',
                'Bone Marrow Biopsy Kit', 'Port Access Kit', 'Isolation Equipment'
            ]
        }
        
        for dept in departments:
            specialty = dept['Specialty']
            dept_id = dept['_id']
            
            # Get appropriate equipment for this specialty
            if specialty in equipment_by_specialty:
                equipment_list = equipment_by_specialty[specialty]
            else:
                equipment_list = equipment_by_specialty['General Medicine']
            
            # Generate 5-15 pieces of equipment per department
            num_equipment = random.randint(5, 15)
            selected_equipment = random.sample(equipment_list, min(num_equipment, len(equipment_list)))
            
            for equipment_name in selected_equipment:
                equipment_record = {
                    '_id': equipment_id,
                    'Department_ID': dept_id,
                    'Equipment_name': equipment_name,
                    'Model': self._generate_equipment_model(equipment_name),
                    'Serial_number': self._generate_serial_number(),
                    'Manufacturer': self._get_equipment_manufacturer(equipment_name),
                    'Purchase_date': self._generate_purchase_date(),
                    'Last_maintenance': self._generate_maintenance_date(),
                    'Next_maintenance': self._generate_next_maintenance(),
                    'Status': random.choice(['Operational', 'Under Maintenance', 'Out of Service']),
                    'Location_in_department': self._generate_equipment_location(equipment_name),
                    'Criticality': self._get_equipment_criticality(equipment_name),
                    'Warranty_expiry': self._generate_warranty_date(),
                    'Cost': self._generate_equipment_cost(equipment_name)
                }
                
                equipment_records.append(equipment_record)
                equipment_id += 1
        
        return equipment_records
    
    def _generate_equipment_model(self, equipment_name: str) -> str:
        """Generate equipment model number"""
        prefixes = ['MD-', 'HC-', 'MX-', 'PRO-', 'ELITE-', 'MAX-']
        return f"{random.choice(prefixes)}{random.randint(1000, 9999)}"
    
    def _generate_serial_number(self) -> str:
        """Generate equipment serial number"""
        return f"SN{random.randint(100000, 999999)}"
    
    def _get_equipment_manufacturer(self, equipment_name: str) -> str:
        """Get realistic manufacturer for equipment"""
        manufacturers = {
            'Defibrillator': ['Philips', 'Medtronic', 'Zoll', 'Physio-Control'],
            'Ventilator': ['Philips', 'Medtronic', 'GE Healthcare', 'Draeger'],
            'X-Ray Machine': ['GE Healthcare', 'Siemens', 'Philips', 'Canon Medical'],
            'Ultrasound Machine': ['GE Healthcare', 'Philips', 'Siemens', 'Mindray'],
            'ECG Machine': ['Philips', 'GE Healthcare', 'Schiller', 'Nihon Kohden'],
            'CT Scanner': ['GE Healthcare', 'Siemens', 'Philips', 'Canon Medical'],
            'MRI Machine': ['GE Healthcare', 'Siemens', 'Philips']
        }
        
        if equipment_name in manufacturers:
            return random.choice(manufacturers[equipment_name])
        else:
            return random.choice(['Philips', 'GE Healthcare', 'Siemens', 'Medtronic', 'Mindray'])
    
    def _generate_purchase_date(self) -> datetime:
        """Generate realistic purchase date"""
        years_ago = random.randint(1, 10)
        return datetime.now() - timedelta(days=years_ago * 365 + random.randint(0, 365))
    
    def _generate_maintenance_date(self) -> datetime:
        """Generate last maintenance date"""
        days_ago = random.randint(30, 365)
        return datetime.now() - timedelta(days=days_ago)
    
    def _generate_next_maintenance(self) -> datetime:
        """Generate next maintenance date"""
        days_ahead = random.randint(30, 180)
        return datetime.now() + timedelta(days=days_ahead)
    
    def _generate_equipment_location(self, equipment_name: str) -> str:
        """Generate location within department"""
        locations = [
            'Room 1', 'Room 2', 'Room 3', 'Central Station', 'Storage Area',
            'Procedure Room', 'Main Ward', 'Isolation Room', 'Equipment Bay'
        ]
        return random.choice(locations)
    
    def _get_equipment_criticality(self, equipment_name: str) -> str:
        """Determine equipment criticality"""
        critical_equipment = [
            'Defibrillator', 'Ventilator', 'Anesthesia Machine', 'Operating Table',
            'CT Scanner', 'MRI Machine', 'Incubator'
        ]
        
        if equipment_name in critical_equipment:
            return 'Critical'
        elif 'Monitor' in equipment_name or 'Machine' in equipment_name:
            return 'High'
        else:
            return 'Medium'
    
    def _generate_warranty_date(self) -> datetime:
        """Generate warranty expiry date"""
        months_ahead = random.randint(6, 60)  # 6 months to 5 years
        return datetime.now() + timedelta(days=months_ahead * 30)
    
    def _generate_equipment_cost(self, equipment_name: str) -> float:
        """Generate realistic equipment cost"""
        cost_ranges = {
            'CT Scanner': (1500000, 3000000),
            'MRI Machine': (2000000, 4000000),
            'X-Ray Machine': (150000, 500000),
            'Ultrasound Machine': (80000, 300000),
            'Ventilator': (50000, 150000),
            'Defibrillator': (30000, 80000),
            'ECG Machine': (15000, 50000),
            'Operating Table': (100000, 300000),
            'Anesthesia Machine': (80000, 200000),
            'Incubator': (60000, 150000),
            'Cardiac Monitor': (25000, 75000),
            'IV Pump': (8000, 25000),
            'Hospital Bed': (15000, 40000),
            'Wheelchair': (2000, 8000)
        }
        
        if equipment_name in cost_ranges:
            min_cost, max_cost = cost_ranges[equipment_name]
            return round(random.uniform(min_cost, max_cost), 2)
        else:
            return round(random.uniform(10000, 100000), 2)
    
    def generate_complete_dataset(self) -> Dict:
        """Generate complete hospital dataset matching existing DB structure"""
        print("Generating complete Gauteng hospitals dataset...")
        
        # Generate facilities first (these are your hospitals)
        facilities = self.generate_hospital_facilities()
        print(f"Generated {len(facilities)} hospital facilities")
        
        # Generate departments for each facility
        departments = self.generate_departments(facilities)
        print(f"Generated {len(departments)} departments")
        
        # Generate current capacity status
        capacity_records = self.generate_department_capacity(departments)
        print(f"Generated {len(capacity_records)} capacity records")
        
        # Generate staff records
        staff_records = self.generate_staff_records(departments)
        print(f"Generated {len(staff_records)} staff records")
        
        # Generate equipment inventory
        equipment_records = self.generate_equipment_inventory(departments)
        print(f"Generated {len(equipment_records)} equipment records")
        
        # Prepare complete dataset
        complete_dataset = {
            'facilities': facilities,
            'departments': departments,
            'department_capacity': capacity_records,
            'staff': staff_records,
            'equipment': equipment_records
        }
        
        return complete_dataset
    
    def save_to_json(self, dataset: Dict, filename: str = 'gauteng_hospitals_data.json'):
        """Save dataset to JSON file"""
        # Convert datetime objects to strings for JSON serialization
        json_dataset = self._serialize_for_json(dataset)
        
        with open(filename, 'w') as f:
            json.dump(json_dataset, f, indent=2, ensure_ascii=False)
        
        print(f"Dataset saved to {filename}")
        
        # Print summary
        total_records = sum(len(collection) for collection in dataset.values())
        print(f"\nDataset Summary:")
        print(f"- Total records: {total_records:,}")
        for collection_name, records in dataset.items():
            print(f"- {collection_name}: {len(records):,} records")
    
    def _serialize_for_json(self, obj):
        """Convert datetime objects to ISO strings for JSON serialization"""
        if isinstance(obj, datetime):
            return obj.isoformat()
        elif isinstance(obj, dict):
            return {key: self._serialize_for_json(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._serialize_for_json(item) for item in obj]
        else:
            return obj
    
    def export_for_mongodb(self, dataset: Dict) -> Dict:
        """Export dataset formatted for MongoDB import"""
        # This matches the structure expected by your atlas_data_uploader.py
        mongodb_dataset = {}
        
        for collection_name, records in dataset.items():
            mongodb_dataset[collection_name] = records
        
        return mongodb_dataset
    
    def display_sample_data(self, dataset: Dict, samples_per_collection: int = 3):
        """Display sample records from each collection"""
        print("\nSample Data Preview:")
        print("=" * 50)
        
        for collection_name, records in dataset.items():
            print(f"\n{collection_name.upper()} (Sample {min(samples_per_collection, len(records))} of {len(records)}):")
            print("-" * 30)
            
            for i, record in enumerate(records[:samples_per_collection]):
                print(f"Record {i+1}:")
                for key, value in record.items():
                    if isinstance(value, list) and len(value) > 3:
                        print(f"  {key}: [{', '.join(str(v) for v in value[:3])}, ...] ({len(value)} items)")
                    else:
                        print(f"  {key}: {value}")
                print()


def main():
    """Main function to generate and save Gauteng hospitals data"""
    print("Gauteng Hospitals Database Generator")
    print("=" * 50)
    
    # Initialize generator
    generator = GautengHospitalsGenerator()
    
    # Generate complete dataset
    dataset = generator.generate_complete_dataset()
    
    # Display sample data
    generator.display_sample_data(dataset)
    
    # Save to JSON file
    generator.save_to_json(dataset)
    
    # Export for MongoDB (if you want to upload to your existing DB)
    mongodb_data = generator.export_for_mongodb(dataset)
    
    print("\nData generation completed successfully!")
    print("Files created:")
    print("- gauteng_hospitals_data.json (Complete dataset)")
    print("\nNext steps:")
    print("1. Review the generated data")
    print("2. Use atlas_data_uploader.py to upload to MongoDB Atlas")
    print("3. Or import directly into your local MongoDB instance")
    
    return dataset

if __name__ == "__main__":
    main()