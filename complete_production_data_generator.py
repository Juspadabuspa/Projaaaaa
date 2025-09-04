"""
Complete Production Data Generator for MedRoute
Generates all ERD components with realistic relationships
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
from faker import Faker
import json
from typing import Dict, List
import uuid

fake = Faker(['en_US'])
Faker.seed(42)
np.random.seed(42)
random.seed(42)

class CompleteProductionDataGenerator:
    def __init__(self):
        self.diseases = [
            'Asthma', 'Stroke', 'Osteoporosis', 'Hypertension', 'Diabetes', 
            'Migraine', 'Influenza', 'Pneumonia', 'Bronchitis', 'Common Cold',
            'Depression', 'COVID-19', 'Tuberculosis', 'Heart Disease', 'Cancer',
            'COPD', 'Kidney Disease', 'Liver Disease', 'Arthritis', 'Alzheimer'
        ]
        
        self.sa_provinces = [
            'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
            'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'
        ]
        
        self.sa_cities = [
            'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
            'Bloemfontein', 'Polokwane', 'Nelspruit', 'Kimberley', 'Rustenburg'
        ]
        
        self.specializations = [
            'General Medicine', 'Emergency Medicine', 'Cardiology', 'Pulmonology',
            'Neurology', 'Orthopedics', 'Pediatrics', 'Geriatrics', 'Psychiatry',
            'Dermatology', 'Oncology', 'Radiology', 'Anesthesiology', 'Surgery'
        ]
        
        self.habits = ['Smoking', 'Regular Exercise', 'Alcohol Consumption', 'Healthy Diet', 'Sedentary Lifestyle']
        
        self.time_slots = [
            '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
            '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
        ]
        
        self.start_date = datetime(2020, 1, 1)
        self.end_date = datetime(2024, 12, 31)
    
    def generate_timeslots(self) -> List[Dict]:
        """Generate time slots"""
        return [{'_id': i+1, 'Times': slot} for i, slot in enumerate(self.time_slots)]
    
    def generate_habits(self) -> List[Dict]:
        """Generate habits"""
        return [{'_id': i+1, 'Habit_Name': habit} for i, habit in enumerate(self.habits)]
    
    def generate_specializations(self) -> List[Dict]:
        """Generate medical specializations"""
        return [
            {'_id': i+1, 'Name': spec, 'Description': f'{spec} medical specialty'} 
            for i, spec in enumerate(self.specializations)
        ]
    
    def generate_patients(self, count: int = 50000) -> List[Dict]:
        """Generate realistic patient data"""
        print(f"Generating {count} patients...")
        patients = []
        
        for i in range(count):
            gender = random.choice(['Male', 'Female'])
            age = int(np.random.beta(2, 5) * 80 + 18)
            
            if gender == 'Male':
                first_name = fake.first_name_male()
            else:
                first_name = fake.first_name_female()
            
            last_name = fake.last_name()
            phone = f"+27{random.randint(10, 99)}{random.randint(1000000, 9999999)}"
            
            patients.append({
                '_id': i + 1,
                'Patient_fname': first_name,
                'Patient_lname': last_name,
                'Patient_sex': gender,
                'Patient_phone': phone,
                'Patient_email': f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}@{fake.free_email_domain()}",
                'Patient_district': random.choice(self.sa_cities),
                'Blood_type': np.random.choice(['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'],
                                             p=[0.37, 0.28, 0.20, 0.05, 0.04, 0.03, 0.02, 0.01]),
                'age': age,
                'province': random.choice(self.sa_provinces),
                'created_at': fake.date_time_between(start_date=self.start_date, end_date=datetime.now())
            })
        
        return patients
    
    def generate_doctors(self, count: int = 500) -> List[Dict]:
        """Generate doctor data"""
        print(f"Generating {count} doctors...")
        doctors = []
        
        for i in range(count):
            gender = random.choice(['Male', 'Female'])
            first_name = fake.first_name_male() if gender == 'Male' else fake.first_name_female()
            
            doctors.append({
                '_id': i + 1,
                'Doctor_fname': f"Dr. {first_name}",
                'Doctor_lname': fake.last_name(),
                'Doctor_phone': f"+27{random.randint(10, 99)}{random.randint(1000000, 9999999)}",
                'Doctor_email': f"dr.{fake.last_name().lower()}{i}@hospital.co.za",
                'years_experience': random.randint(1, 40),
                'gender': gender,
                'license_number': f"MP{random.randint(100000, 999999)}",
                'created_at': fake.date_time_between(start_date=self.start_date, end_date=datetime.now())
            })
        
        return doctors
    
    def generate_facilities(self, count: int = 50) -> List[Dict]:
        """Generate hospital/clinic data"""
        print(f"Generating {count} facilities...")
        facilities = []
        
        facility_types = ['Hospital', 'Clinic', 'Emergency Center', 'Specialty Center']
        ownership_types = ['Public', 'Private', 'Non-Profit']
        care_levels = ['Primary', 'Secondary', 'Tertiary']
        
        for i in range(count):
            city = random.choice(self.sa_cities)
            province = random.choice(self.sa_provinces)
            
            facilities.append({
                '_id': i + 1,
                'Name': f"{city} {random.choice(['General', 'Central', 'Medical', 'Community'])} {random.choice(facility_types)}",
                'Ownership_type': random.choice(ownership_types),
                'Facility_type': random.choice(facility_types),
                'Level_of_care': random.choice(care_levels),
                'Address': fake.street_address(),
                'City': city,
                'Province': province,
                'Phone': f"+27{random.randint(10, 99)}{random.randint(1000000, 9999999)}",
                'capacity_beds': random.randint(20, 500),
                'established_date': fake.date_between(start_date=datetime(1950, 1, 1), end_date=datetime(2020, 1, 1))
            })
        
        return facilities
    
    def generate_departments(self, facility_count: int = 50) -> List[Dict]:
        """Generate department records"""
        print(f"Generating departments for {facility_count} facilities...")
        dept_types = ['Emergency', 'Inpatient', 'Outpatient', 'Specialty', 'ICU']
        departments = []
        dept_id = 1
        
        for facility_id in range(1, facility_count + 1):
            num_depts = random.randint(3, 8)
            selected_specializations = random.sample(self.specializations, min(num_depts, len(self.specializations)))
            
            for spec in selected_specializations:
                departments.append({
                    '_id': dept_id,
                    'Facility_ID': facility_id,
                    'Name': f'{spec} Department',
                    'Type': random.choice(dept_types),
                    'Capacity_beds': random.randint(10, 100),
                    'Capacity_doctors': random.randint(2, 20)
                })
                dept_id += 1
        
        return departments
    
    def generate_doctor_specializations(self, doctor_count: int = 500) -> List[Dict]:
        """Generate doctor-specialization mappings"""
        print("Generating doctor specializations...")
        mappings = []
        
        for doctor_id in range(1, doctor_count + 1):
            num_specs = random.randint(1, 3)
            selected_specs = random.sample(range(1, len(self.specializations) + 1), num_specs)
            
            for i, spec_id in enumerate(selected_specs):
                mappings.append({
                    '_id': f'doc{doctor_id}_spec{spec_id}',
                    'Doctor_ID': doctor_id,
                    'Specialization_ID': spec_id,
                    'Primary_flag': i == 0,
                    'Obtained_Date': fake.date_between(start_date=datetime(2000, 1, 1), end_date=datetime(2020, 1, 1)),
                    'Certification_Body': f'SA {self.specializations[spec_id-1]} Board'
                })
        
        return mappings
    
    def generate_doctor_assignments(self, doctor_count: int = 500, departments: List[Dict] = None) -> List[Dict]:
        """Generate doctor assignments to facilities/departments"""
        print("Generating doctor assignments...")
        if not departments:
            return []
        
        assignments = []
        assignment_id = 1
        
        for doctor_id in range(1, doctor_count + 1):
            # Each doctor assigned to 1-2 departments
            num_assignments = random.randint(1, 2)
            selected_depts = random.sample(departments, num_assignments)
            
            for dept in selected_depts:
                assignments.append({
                    '_id': assignment_id,
                    'Doctor_ID': doctor_id,
                    'Facility_ID': dept['Facility_ID'],
                    'Department_ID': dept['_id'],
                    'Role_in_dept': random.choice(['Senior Physician', 'Junior Physician', 'Consultant', 'Head of Department']),
                    'Start_date': fake.date_between(start_date=datetime(2015, 1, 1), end_date=datetime(2023, 1, 1)),
                    'End_date': None if random.random() > 0.1 else fake.date_between(start_date=datetime(2023, 1, 1), end_date=datetime.now())
                })
                assignment_id += 1
        
        return assignments
    
    def generate_department_capacity(self, departments: List[Dict]) -> List[Dict]:
        """Generate department capacity tracking"""
        print("Generating department capacity records...")
        capacity_records = []
        
        for i, dept in enumerate(departments):
            max_beds = dept['Capacity_beds']
            current_patients = random.randint(0, int(max_beds * 0.9))
            
            capacity_records.append({
                '_id': i + 1,
                'Department_ID': dept['_id'],
                'Current_patients': current_patients,
                'Current_beds_available': max_beds - current_patients,
                'Current_doctors_on_duty': random.randint(1, dept['Capacity_doctors'])
            })
        
        return capacity_records
    
    def generate_consultations(self, patient_count: int = 50000, departments: List[Dict] = None) -> List[Dict]:
        """Generate medical consultations with realistic patterns"""
        total_consultations = int(patient_count * 3.5)
        print(f"Generating {total_consultations} medical consultations...")
        
        consultations = []
        
        for i in range(total_consultations):
            patient_id = random.randint(1, patient_count)
            doctor_id = random.randint(1, 500)
            facility_id = random.randint(1, 50)
            
            consultation_date = fake.date_time_between(start_date=self.start_date, end_date=datetime.now())
            is_winter = consultation_date.month in [6, 7, 8, 9]
            
            if is_winter:
                disease_probs = [0.15, 0.12, 0.10, 0.08, 0.08, 0.08, 0.06, 0.06, 0.05, 0.05, 0.04, 0.03, 0.03, 0.03, 0.02, 0.02]
                disease = np.random.choice(self.diseases[:16], p=disease_probs)
            else:
                disease = random.choice(self.diseases)
            
            symptoms = self._generate_symptoms_for_disease(disease)
            severity = random.randint(1, 10)
            admitted = random.random() < (0.1 + severity * 0.05)
            ml_results = self._generate_ml_triage_results(symptoms, severity)
            
            consultations.append({
                '_id': i + 1,
                'Patient_ID': patient_id,
                'Consultation_Date': consultation_date,
                'Consultation_Reason': f"{disease} - {random.choice(['Routine check', 'Follow-up', 'Emergency', 'Screening'])}",
                'Doctor_ID': doctor_id,
                'Facility_ID': facility_id,
                'Admitted': admitted,
                'primary_diagnosis': disease,
                'severity_score': severity,
                'ml_triage_result': ml_results,
                'symptoms': symptoms
            })
        
        return consultations
    
    def generate_vitals(self, consultations: List[Dict]) -> List[Dict]:
        """Generate vital signs for consultations"""
        print(f"Generating vitals for {len(consultations)} consultations...")
        vitals = []
        
        for i, consultation in enumerate(consultations):
            symptoms = consultation.get('symptoms', {})
            severity = consultation.get('severity_score', 5)
            
            # Base vitals with variations based on symptoms
            bp_systolic = random.randint(90, 180) + (20 if symptoms.get('difficulty_breathing') else 0)
            bp_diastolic = random.randint(60, 100) + (10 if symptoms.get('difficulty_breathing') else 0)
            temperature = 36.5 + (2.5 if symptoms.get('fever') else random.uniform(-0.5, 0.5))
            heart_rate = random.randint(60, 100) + (20 if symptoms.get('fever') else 0)
            
            vitals.append({
                '_id': i + 1,
                'Consultation_ID': consultation['_id'],
                'bp_systolic': min(bp_systolic, 200),
                'bp_diastolic': min(bp_diastolic, 120),
                'Cholesterol': random.choice(['High', 'Normal', 'Low']),
                'Difficulty_Breathing': symptoms.get('difficulty_breathing', False),
                'Cough': symptoms.get('cough', False),
                'Fatigue': symptoms.get('fatigue', False),
                'Fever': symptoms.get('fever', False),
                'oxygen_saturation': round(random.uniform(88, 100) - (5 if symptoms.get('difficulty_breathing') else 0), 1),
                'weight': round(random.uniform(45, 120), 1),
                'respiratory_rate': random.randint(12, 25) + (5 if symptoms.get('difficulty_breathing') else 0),
                'temperature': round(temperature, 1),
                'heart_rate': min(heart_rate, 150)
            })
        
        return vitals
    
    def generate_diagnoses(self, consultations: List[Dict]) -> List[Dict]:
        """Generate formal diagnoses"""
        print(f"Generating diagnoses for {len(consultations)} consultations...")
        diagnoses = []
        
        for i, consultation in enumerate(consultations):
            diagnoses.append({
                '_id': i + 1,
                'Consultation_ID': consultation['_id'],
                'Condition_name': consultation['primary_diagnosis'],
                'Severity': consultation['severity_score'],
                'Notes': f"Patient diagnosed with {consultation['primary_diagnosis']}",
                'Date': consultation['Consultation_Date'],
                'Doctor_ID': consultation['Doctor_ID'],
                'Chronic': consultation['primary_diagnosis'] in ['Diabetes', 'Hypertension', 'Asthma', 'COPD', 'Heart Disease'],
                'Patient_ID': consultation['Patient_ID']
            })
        
        return diagnoses
    
    def generate_treatments(self, consultations: List[Dict]) -> List[Dict]:
        """Generate treatment records"""
        print(f"Generating treatments for {len(consultations)} consultations...")
        treatments = []
        
        treatment_map = {
            'Asthma': 'Nebulizer Treatment', 'Pneumonia': 'Antibiotic Therapy',
            'Influenza': 'Antiviral Therapy', 'Hypertension': 'Blood Pressure Management',
            'Diabetes': 'Glucose Management', 'Heart Disease': 'Cardiac Care'
        }
        
        for i, consultation in enumerate(consultations):
            disease = consultation['primary_diagnosis']
            treatment_name = treatment_map.get(disease, 'Standard Care')
            
            treatments.append({
                '_id': i + 1,
                'Consultation_ID': consultation['_id'],
                'Procedure_name': treatment_name,
                'Description': f"Treatment protocol for {disease}",
                'Doctor_ID': consultation['Doctor_ID'],
                'Date': consultation['Consultation_Date']
            })
        
        return treatments
    
    def generate_prescriptions(self, consultations: List[Dict]) -> List[Dict]:
        """Generate prescription records"""
        print(f"Generating prescriptions for {len(consultations)} consultations...")
        prescriptions = []
        
        medication_map = {
            'Asthma': ('Albuterol', '2 puffs every 4 hours', '7 days'),
            'Pneumonia': ('Azithromycin', '500mg daily', '7 days'),
            'Influenza': ('Oseltamivir', '75mg twice daily', '5 days'),
            'Hypertension': ('Lisinopril', '10mg daily', '30 days'),
            'Diabetes': ('Metformin', '500mg twice daily', '30 days')
        }
        
        for i, consultation in enumerate(consultations):
            if random.random() < 0.8:  # 80% of consultations get prescriptions
                disease = consultation['primary_diagnosis']
                drug_name, dosage, duration = medication_map.get(
                    disease, ('Paracetamol', '500mg as needed', '7 days')
                )
                
                prescriptions.append({
                    '_id': i + 1,
                    'Consultation_ID': consultation['_id'],
                    'drug_name': drug_name,
                    'dosage': dosage,
                    'duration': duration,
                    'Doctor_ID': consultation['Doctor_ID'],
                    'Notes': f"Prescribed for {disease}",
                    'Date': consultation['Consultation_Date']
                })
        
        return prescriptions
    
    def generate_admissions(self, consultations: List[Dict], departments: List[Dict]) -> List[Dict]:
        """Generate hospital admissions"""
        admitted_consultations = [c for c in consultations if c['Admitted']]
        print(f"Generating {len(admitted_consultations)} admission records...")
        
        admissions = []
        
        for i, consultation in enumerate(admitted_consultations):
            # Random department from same facility
            facility_depts = [d for d in departments if d['Facility_ID'] == consultation['Facility_ID']]
            selected_dept = random.choice(facility_depts) if facility_depts else departments[0]
            
            admitted_at = consultation['Consultation_Date']
            
            # Stay length based on severity
            severity = consultation['severity_score']
            base_hours = severity * 4
            actual_hours = max(1, base_hours + np.random.normal(0, 6))
            
            # 70% discharged, 30% still admitted
            if random.random() < 0.7:
                discharged_at = admitted_at + timedelta(hours=actual_hours)
            else:
                discharged_at = None
            
            admissions.append({
                '_id': i + 1,
                'Consultation_ID': consultation['_id'],
                'Facility_ID': consultation['Facility_ID'],
                'Department_ID': selected_dept['_id'],
                'Admitted_at': admitted_at,
                'Discharged_at': discharged_at,
                'Doctor_ID': consultation['Doctor_ID'],
                'Notes': f"Admitted for {consultation['primary_diagnosis']} treatment"
            })
        
        return admissions
    
    def generate_appointments(self, patient_count: int = 50000, departments: List[Dict] = None) -> List[Dict]:
        """Generate scheduled appointments"""
        appointment_count = int(patient_count * 0.3)  # 30% of patients have future appointments
        print(f"Generating {appointment_count} appointments...")
        
        appointments = []
        
        for i in range(appointment_count):
            patient_id = random.randint(1, patient_count)
            facility_id = random.randint(1, 50)
            
            # Select department from same facility if available
            if departments:
                facility_depts = [d for d in departments if d['Facility_ID'] == facility_id]
                selected_dept = random.choice(facility_depts) if facility_depts else departments[0]
                dept_id = selected_dept['_id']
            else:
                dept_id = random.randint(1, 100)
            
            # Future appointment dates
            appointment_date = fake.date_between(start_date=datetime.now(), end_date=datetime.now() + timedelta(days=90))
            
            appointments.append({
                '_id': i + 1,
                'Patient_id': patient_id,
                'Facility_ID': facility_id,
                'Department_ID': dept_id,
                'Require_admission': random.random() < 0.1,
                'Time_ID': random.randint(1, len(self.time_slots)),
                'Date': appointment_date.strftime('%Y-%m-%d'),
                'Reason': random.choice(['Follow-up', 'Check-up', 'Consultation', 'Screening', 'Treatment review'])
            })
        
        return appointments
    
    def generate_patient_habits(self, patient_count: int = 50000) -> List[Dict]:
        """Generate patient-habits mappings with guaranteed unique IDs"""
        print("Generating patient-habit mappings...")
        
        patient_habits = []
        used_combinations = set()  # Track used patient-habit combinations
        
        # Generate habits for each patient (1-3 habits per patient on average)
        for patient_id in range(1, patient_count + 1):
            # Each patient gets 1-3 habits
            num_habits = random.choices([1, 2, 3], weights=[0.4, 0.4, 0.2])[0]
            
            # Select unique habits for this patient
            available_habits = list(range(1, len(self.habits) + 1))
            selected_habits = random.sample(available_habits, min(num_habits, len(available_habits)))
            
            for habit_id in selected_habits:
                combination = (patient_id, habit_id)
                if combination not in used_combinations:
                    used_combinations.add(combination)
                    
                    frequency_options = ['Daily', 'Weekly', 'Monthly', 'Occasionally', 'Former habit', 'Never']
                    frequency = random.choice(frequency_options)
                    
                    patient_habits.append({
                        '_id': f'patient{patient_id}_habit{habit_id}',
                        'Patient_ID': patient_id,
                        'Habit_ID': habit_id,
                        'Frequency': frequency
                    })
        
        print(f"Generated {len(patient_habits)} unique patient-habit mappings")
        return patient_habits
    
    def _generate_symptoms_for_disease(self, disease: str) -> Dict:
        """Generate realistic symptoms based on disease"""
        base_symptoms = {
            'fever': 0.3, 'cough': 0.4, 'fatigue': 0.6, 'difficulty_breathing': 0.2,
            'headache': 0.3, 'nausea': 0.2, 'vomiting': 0.1, 'diarrhea': 0.1,
            'chest_pain': 0.15, 'abdominal_pain': 0.1, 'joint_pain': 0.2
        }
        
        disease_modifiers = {
            'Influenza': {'fever': 0.9, 'cough': 0.8, 'fatigue': 0.9, 'headache': 0.7},
            'Pneumonia': {'cough': 0.9, 'difficulty_breathing': 0.8, 'fever': 0.8, 'chest_pain': 0.6},
            'Asthma': {'difficulty_breathing': 0.9, 'cough': 0.7, 'chest_pain': 0.4},
            'Hypertension': {'headache': 0.5, 'fatigue': 0.4},
            'Heart Disease': {'chest_pain': 0.8, 'difficulty_breathing': 0.6, 'fatigue': 0.7}
        }
        
        symptom_probs = base_symptoms.copy()
        if disease in disease_modifiers:
            symptom_probs.update(disease_modifiers[disease])
        
        symptoms = {}
        for symptom, prob in symptom_probs.items():
            symptoms[symptom] = random.random() < prob
        
        return symptoms
    
    def _generate_ml_triage_results(self, symptoms: Dict, severity: int) -> Dict:
        """Generate realistic ML triage results"""
        if severity >= 9 or (symptoms.get('difficulty_breathing') and symptoms.get('chest_pain')):
            urgency = 'EMERGENCY'
            confidence = random.uniform(0.85, 0.98)
        elif severity >= 7 or symptoms.get('difficulty_breathing'):
            urgency = 'URGENT'
            confidence = random.uniform(0.70, 0.90)
        elif severity >= 5:
            urgency = 'SEMI_URGENT'
            confidence = random.uniform(0.60, 0.85)
        else:
            urgency = 'STANDARD'
            confidence = random.uniform(0.50, 0.80)
        
        base_hours = severity * 3
        if symptoms.get('difficulty_breathing'):
            base_hours += 8
        if urgency == 'EMERGENCY':
            base_hours += 12
        
        stay_hours = max(1, base_hours + np.random.normal(0, 4))
        
        return {
            'symptom_analysis': {
                'severity_score': severity,
                'urgency_level': urgency,
                'condition_positive': severity >= 5,
                'confidence_positive': confidence,
                'recommended_department': self._map_to_department(symptoms, severity)
            },
            'stay_prediction': {
                'predicted_stay_hours': round(stay_hours, 1),
                'confidence_lower': round(stay_hours * 0.8, 1),
                'confidence_upper': round(stay_hours * 1.2, 1)
            },
            'priority_score': severity * 100 + int(confidence * 100),
            'model_version': '1.0',
            'prediction_timestamp': datetime.now()
        }
    
    def _map_to_department(self, symptoms: Dict, severity: int) -> int:
        """Map symptoms to department ID"""
        if symptoms.get('difficulty_breathing') or symptoms.get('chest_pain'):
            return 1
        elif severity >= 7:
            return 2
        elif symptoms.get('headache') and severity >= 5:
            return 5
        else:
            return 6
    
    def generate_all_production_data(self) -> Dict:
        """Generate complete production dataset with all ERD components"""
        print("Generating complete production dataset...")
        print("This may take several minutes...")
        
        data = {}
        
        # Generate lookup tables first
        data['timeslots'] = self.generate_timeslots()
        data['habits'] = self.generate_habits()
        data['specializations'] = self.generate_specializations()
        
        # Generate core entities
        data['patients'] = self.generate_patients(50000)
        data['doctors'] = self.generate_doctors(500)
        data['facilities'] = self.generate_facilities(50)
        
        # Generate departments (depends on facilities)
        data['departments'] = self.generate_departments(50)
        
        # Generate relationships
        data['doctor_specializations'] = self.generate_doctor_specializations(500)
        data['doctor_assignments'] = self.generate_doctor_assignments(500, data['departments'])
        data['department_capacity'] = self.generate_department_capacity(data['departments'])
        
        # Generate consultations and related data
        data['consultations'] = self.generate_consultations(50000, data['departments'])
        data['vitals'] = self.generate_vitals(data['consultations'])
        data['diagnoses'] = self.generate_diagnoses(data['consultations'])
        data['treatments'] = self.generate_treatments(data['consultations'])
        data['prescriptions'] = self.generate_prescriptions(data['consultations'])
        data['admissions'] = self.generate_admissions(data['consultations'], data['departments'])
        
        # Generate appointments and habits
        data['appointments'] = self.generate_appointments(50000, data['departments'])
        data['patient_habits'] = self.generate_patient_habits(50000)
        
        # Calculate totals
        total_records = sum(len(collection) for collection in data.values())
        print(f"\nGenerated {total_records:,} total records:")
        for collection, records in data.items():
            print(f"  {collection}: {len(records):,}")
        
        return data
    
    def save_to_json(self, data: Dict, filename: str = 'complete_production_data.json'):
        """Save generated data to JSON file"""
        print(f"Saving data to {filename}...")
        
        def json_serial(obj):
            """JSON serializer for objects not serializable by default json code"""
            if hasattr(obj, 'isoformat'):  # handles both datetime and date objects
                return obj.isoformat()
            raise TypeError(f"Type {type(obj)} not serializable")
        
        with open(filename, 'w') as f:
            json.dump(data, f, default=json_serial, indent=2)
        
        print(f"Data saved to {filename}")

def generate_complete_production_data():
    """Main function to generate all production data"""
    generator = CompleteProductionDataGenerator()
    data = generator.generate_all_production_data()
    generator.save_to_json(data, 'complete_medroute_production_data.json')
    return data

if __name__ == "__main__":
    try:
        generate_complete_production_data()
        print("\n✅ Complete production data generation completed successfully!")
        print("Generated comprehensive dataset with all ERD components")
        print("Total file size will be approximately 500MB-1GB")
        print("\nNext steps:")
        print("1. Set up MongoDB Atlas account")
        print("2. Run the Atlas uploader to populate cloud database")
        print("3. Update connection strings in your application")
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Please install: pip install faker numpy pandas")