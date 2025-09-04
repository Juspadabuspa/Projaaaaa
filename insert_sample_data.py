from cloud_medroute_db import CloudMedRouteDB as MedRouteDB
from datetime import datetime, timedelta

def insert_sample_data():
    db = MedRouteDB()
    
    if not db.connect():
        print("Failed to connect to database")
        return
    
    try:
        # Insert TimeSlots
        timeslots_data = [
            {"_id": 1, "Times": "08:00-09:00"}, {"_id": 2, "Times": "09:00-10:00"},
            {"_id": 3, "Times": "10:00-11:00"}, {"_id": 4, "Times": "11:00-12:00"},
            {"_id": 5, "Times": "12:00-13:00"}, {"_id": 6, "Times": "13:00-14:00"},
            {"_id": 7, "Times": "14:00-15:00"}, {"_id": 8, "Times": "15:00-16:00"},
            {"_id": 9, "Times": "16:00-17:00"}, {"_id": 10, "Times": "17:00-18:00"}
        ]
        db.get_collection('timeslots').insert_many(timeslots_data)
        print("✅ Inserted TimeSlots")
        
        # Insert Habits
        habits_data = [
            {"_id": 1, "Habit_Name": "Smoking"},
            {"_id": 2, "Habit_Name": "Regular Exercise"},
            {"_id": 3, "Habit_Name": "Alcohol Consumption"},
            {"_id": 4, "Habit_Name": "Healthy Diet"},
            {"_id": 5, "Habit_Name": "Sedentary Lifestyle"}
        ]
        db.get_collection('habits').insert_many(habits_data)
        print("✅ Inserted Habits")
        
        # Insert Patients
        patients_data = [
            {"_id": 1, "Patient_fname": "John", "Patient_lname": "Smith", "Patient_sex": "Male", 
             "Patient_phone": "+27123456789", "Patient_email": "john.smith@email.com", 
             "Patient_district": "Johannesburg", "Blood_type": "O+"},
            {"_id": 2, "Patient_fname": "Sarah", "Patient_lname": "Johnson", "Patient_sex": "Female", 
             "Patient_phone": "+27123456790", "Patient_email": "sarah.j@email.com", 
             "Patient_district": "Pretoria", "Blood_type": "A+"},
            {"_id": 3, "Patient_fname": "Michael", "Patient_lname": "Brown", "Patient_sex": "Male", 
             "Patient_phone": "+27123456791", "Patient_email": "michael.b@email.com", 
             "Patient_district": "Cape Town", "Blood_type": "B+"},
            {"_id": 4, "Patient_fname": "Emma", "Patient_lname": "Davis", "Patient_sex": "Female", 
             "Patient_phone": "+27123456792", "Patient_email": "emma.d@email.com", 
             "Patient_district": "Durban", "Blood_type": "AB+"},
            {"_id": 5, "Patient_fname": "James", "Patient_lname": "Wilson", "Patient_sex": "Male", 
             "Patient_phone": "+27123456793", "Patient_email": "james.w@email.com", 
             "Patient_district": "Johannesburg", "Blood_type": "O-"},
            {"_id": 6, "Patient_fname": "Lisa", "Patient_lname": "Miller", "Patient_sex": "Female", 
             "Patient_phone": "+27123456794", "Patient_email": "lisa.m@email.com", 
             "Patient_district": "Pretoria", "Blood_type": "A-"},
            {"_id": 7, "Patient_fname": "David", "Patient_lname": "Garcia", "Patient_sex": "Male", 
             "Patient_phone": "+27123456795", "Patient_email": "david.g@email.com", 
             "Patient_district": "Port Elizabeth", "Blood_type": "B-"},
            {"_id": 8, "Patient_fname": "Jennifer", "Patient_lname": "Martinez", "Patient_sex": "Female", 
             "Patient_phone": "+27123456796", "Patient_email": "jennifer.m@email.com", 
             "Patient_district": "Bloemfontein", "Blood_type": "AB-"},
            {"_id": 9, "Patient_fname": "Robert", "Patient_lname": "Anderson", "Patient_sex": "Male", 
             "Patient_phone": "+27123456797", "Patient_email": "robert.a@email.com", 
             "Patient_district": "Johannesburg", "Blood_type": "O+"},
            {"_id": 10, "Patient_fname": "Mary", "Patient_lname": "Taylor", "Patient_sex": "Female", 
             "Patient_phone": "+27123456798", "Patient_email": "mary.t@email.com", 
             "Patient_district": "Cape Town", "Blood_type": "A+"}
        ]
        db.get_collection('patients').insert_many(patients_data)
        print("✅ Inserted Patients")
        
        # Insert Specializations
        specializations_data = [
            {"_id": 1, "Name": "General Medicine", "Description": "General medical practice"},
            {"_id": 2, "Name": "Emergency Medicine", "Description": "Emergency and critical care"},
            {"_id": 3, "Name": "Cardiology", "Description": "Heart and cardiovascular diseases"},
            {"_id": 4, "Name": "Pulmonology", "Description": "Respiratory system diseases"},
            {"_id": 5, "Name": "Neurology", "Description": "Nervous system disorders"},
            {"_id": 6, "Name": "Orthopedics", "Description": "Bone and joint disorders"},
            {"_id": 7, "Name": "Pediatrics", "Description": "Child healthcare"},
            {"_id": 8, "Name": "Geriatrics", "Description": "Elder care"}
        ]
        db.get_collection('specializations').insert_many(specializations_data)
        print("✅ Inserted Specializations")
        
        # Insert Doctors
        doctors_data = [
            {"_id": 1, "Doctor_fname": "Dr. William", "Doctor_lname": "Thompson", 
             "Doctor_phone": "+27111111111", "Doctor_email": "w.thompson@hospital.com"},
            {"_id": 2, "Doctor_fname": "Dr. Helen", "Doctor_lname": "Clarke", 
             "Doctor_phone": "+27111111112", "Doctor_email": "h.clarke@hospital.com"},
            {"_id": 3, "Doctor_fname": "Dr. Richard", "Doctor_lname": "Lewis", 
             "Doctor_phone": "+27111111113", "Doctor_email": "r.lewis@hospital.com"},
            {"_id": 4, "Doctor_fname": "Dr. Patricia", "Doctor_lname": "Walker", 
             "Doctor_phone": "+27111111114", "Doctor_email": "p.walker@hospital.com"},
            {"_id": 5, "Doctor_fname": "Dr. Daniel", "Doctor_lname": "Hall", 
             "Doctor_phone": "+27111111115", "Doctor_email": "d.hall@hospital.com"},
            {"_id": 6, "Doctor_fname": "Dr. Susan", "Doctor_lname": "Allen", 
             "Doctor_phone": "+27111111116", "Doctor_email": "s.allen@hospital.com"},
            {"_id": 7, "Doctor_fname": "Dr. Mark", "Doctor_lname": "Young", 
             "Doctor_phone": "+27111111117", "Doctor_email": "m.young@hospital.com"},
            {"_id": 8, "Doctor_fname": "Dr. Karen", "Doctor_lname": "King", 
             "Doctor_phone": "+27111111118", "Doctor_email": "k.king@hospital.com"}
        ]
        db.get_collection('doctors').insert_many(doctors_data)
        print("✅ Inserted Doctors")
        
        # Insert Facilities
        facilities_data = [
            {"_id": 1, "Name": "Johannesburg General Hospital", "Ownership_type": "Public", 
             "Facility_type": "Hospital", "Level_of_care": "Tertiary", "Address": "123 Hospital St", 
             "City": "Johannesburg", "Province": "Gauteng", "Phone": "+27110000001"},
            {"_id": 2, "Name": "Cape Town Medical Center", "Ownership_type": "Private", 
             "Facility_type": "Hospital", "Level_of_care": "Secondary", "Address": "456 Medical Ave", 
             "City": "Cape Town", "Province": "Western Cape", "Phone": "+27210000001"},
            {"_id": 3, "Name": "Pretoria Emergency Center", "Ownership_type": "Public", 
             "Facility_type": "Emergency Center", "Level_of_care": "Primary", "Address": "789 Emergency Rd", 
             "City": "Pretoria", "Province": "Gauteng", "Phone": "+27120000001"}
        ]
        db.get_collection('facilities').insert_many(facilities_data)
        print("✅ Inserted Facilities")
        
        # Insert Departments
        departments_data = [
            {"_id": 1, "Facility_ID": 1, "Name": "Emergency Department", "Type": "Emergency", "Capacity_beds": 20, "Capacity_doctors": 8},
            {"_id": 2, "Facility_ID": 1, "Name": "Internal Medicine", "Type": "Inpatient", "Capacity_beds": 40, "Capacity_doctors": 12},
            {"_id": 3, "Facility_ID": 1, "Name": "Cardiology", "Type": "Specialty", "Capacity_beds": 15, "Capacity_doctors": 6},
            {"_id": 4, "Facility_ID": 1, "Name": "Pulmonology", "Type": "Specialty", "Capacity_beds": 12, "Capacity_doctors": 4},
            {"_id": 5, "Facility_ID": 2, "Name": "General Medicine", "Type": "Outpatient", "Capacity_beds": 25, "Capacity_doctors": 10},
            {"_id": 6, "Facility_ID": 2, "Name": "Orthopedics", "Type": "Specialty", "Capacity_beds": 18, "Capacity_doctors": 7},
            {"_id": 7, "Facility_ID": 3, "Name": "Emergency Department", "Type": "Emergency", "Capacity_beds": 15, "Capacity_doctors": 6}
        ]
        db.get_collection('departments').insert_many(departments_data)
        print("✅ Inserted Departments")
        
        # Insert Doctor Specializations
        doctor_specializations_data = [
            {"_id": "doc1_spec2", "Doctor_ID": 1, "Specialization_ID": 2, "Primary_flag": True, "Obtained_Date": "2015-06-15", "Certification_Body": "SA Emergency Medicine Board"},
            {"_id": "doc2_spec1", "Doctor_ID": 2, "Specialization_ID": 1, "Primary_flag": True, "Obtained_Date": "2018-03-20", "Certification_Body": "SA Medical Council"},
            {"_id": "doc3_spec3", "Doctor_ID": 3, "Specialization_ID": 3, "Primary_flag": True, "Obtained_Date": "2012-09-10", "Certification_Body": "SA Cardiology Association"},
            {"_id": "doc4_spec4", "Doctor_ID": 4, "Specialization_ID": 4, "Primary_flag": True, "Obtained_Date": "2016-11-25", "Certification_Body": "SA Pulmonology Society"},
            {"_id": "doc5_spec5", "Doctor_ID": 5, "Specialization_ID": 5, "Primary_flag": True, "Obtained_Date": "2014-02-18", "Certification_Body": "SA Neurology Board"},
            {"_id": "doc6_spec6", "Doctor_ID": 6, "Specialization_ID": 6, "Primary_flag": True, "Obtained_Date": "2017-08-12", "Certification_Body": "SA Orthopedic Association"},
            {"_id": "doc7_spec7", "Doctor_ID": 7, "Specialization_ID": 7, "Primary_flag": True, "Obtained_Date": "2019-04-30", "Certification_Body": "SA Pediatric Society"},
            {"_id": "doc8_spec1", "Doctor_ID": 8, "Specialization_ID": 1, "Primary_flag": True, "Obtained_Date": "2013-07-22", "Certification_Body": "SA Medical Council"}
        ]
        db.get_collection('doctor_specializations').insert_many(doctor_specializations_data)
        print("✅ Inserted Doctor Specializations")
        
        # Insert Doctor Assignments
        doctor_assignments_data = [
            {"_id": 1, "Doctor_ID": 1, "Facility_ID": 1, "Department_ID": 1, "Role_in_dept": "Senior Physician", "Start_date": "2020-01-01", "End_date": None},
            {"_id": 2, "Doctor_ID": 2, "Facility_ID": 1, "Department_ID": 2, "Role_in_dept": "Department Head", "Start_date": "2018-06-01", "End_date": None},
            {"_id": 3, "Doctor_ID": 3, "Facility_ID": 1, "Department_ID": 3, "Role_in_dept": "Consultant", "Start_date": "2015-03-01", "End_date": None},
            {"_id": 4, "Doctor_ID": 4, "Facility_ID": 1, "Department_ID": 4, "Role_in_dept": "Senior Consultant", "Start_date": "2017-09-01", "End_date": None},
            {"_id": 5, "Doctor_ID": 5, "Facility_ID": 2, "Department_ID": 5, "Role_in_dept": "General Practitioner", "Start_date": "2019-02-01", "End_date": None},
            {"_id": 6, "Doctor_ID": 6, "Facility_ID": 2, "Department_ID": 6, "Role_in_dept": "Specialist", "Start_date": "2018-11-01", "End_date": None},
            {"_id": 7, "Doctor_ID": 7, "Facility_ID": 3, "Department_ID": 7, "Role_in_dept": "Emergency Physician", "Start_date": "2020-05-01", "End_date": None},
            {"_id": 8, "Doctor_ID": 8, "Facility_ID": 1, "Department_ID": 2, "Role_in_dept": "Junior Physician", "Start_date": "2021-01-01", "End_date": None}
        ]
        db.get_collection('doctor_assignments').insert_many(doctor_assignments_data)
        print("✅ Inserted Doctor Assignments")
        
        # Insert Department Capacity
        department_capacity_data = [
            {"_id": 1, "Department_ID": 1, "Current_patients": 8, "Current_beds_available": 12, "Current_doctors_on_duty": 3},
            {"_id": 2, "Department_ID": 2, "Current_patients": 25, "Current_beds_available": 15, "Current_doctors_on_duty": 5},
            {"_id": 3, "Department_ID": 3, "Current_patients": 7, "Current_beds_available": 8, "Current_doctors_on_duty": 2},
            {"_id": 4, "Department_ID": 4, "Current_patients": 5, "Current_beds_available": 7, "Current_doctors_on_duty": 2},
            {"_id": 5, "Department_ID": 5, "Current_patients": 12, "Current_beds_available": 13, "Current_doctors_on_duty": 4},
            {"_id": 6, "Department_ID": 6, "Current_patients": 9, "Current_beds_available": 9, "Current_doctors_on_duty": 3},
            {"_id": 7, "Department_ID": 7, "Current_patients": 6, "Current_beds_available": 9, "Current_doctors_on_duty": 2}
        ]
        db.get_collection('department_capacity').insert_many(department_capacity_data)
        print("✅ Inserted Department Capacity")
        
        # Insert Medical Consultations
        medical_consultations_data = [
            {"_id": 1, "Patient_ID": 1, "Consultation_Date": datetime(2024, 9, 4, 8, 30), "Consultation_Reason": "Chest pain and difficulty breathing", "Doctor_ID": 1, "Facility_ID": 1, "Admitted": True},
            {"_id": 2, "Patient_ID": 2, "Consultation_Date": datetime(2024, 9, 4, 9, 15), "Consultation_Reason": "Persistent cough and fatigue", "Doctor_ID": 2, "Facility_ID": 1, "Admitted": False},
            {"_id": 3, "Patient_ID": 3, "Consultation_Date": datetime(2024, 9, 4, 10, 0), "Consultation_Reason": "High fever and body aches", "Doctor_ID": 8, "Facility_ID": 1, "Admitted": False},
            {"_id": 4, "Patient_ID": 4, "Consultation_Date": datetime(2024, 9, 4, 11, 30), "Consultation_Reason": "Shortness of breath", "Doctor_ID": 4, "Facility_ID": 1, "Admitted": True},
            {"_id": 5, "Patient_ID": 5, "Consultation_Date": datetime(2024, 9, 4, 14, 0), "Consultation_Reason": "Routine check-up", "Doctor_ID": 5, "Facility_ID": 2, "Admitted": False},
            {"_id": 6, "Patient_ID": 6, "Consultation_Date": datetime(2024, 9, 4, 15, 45), "Consultation_Reason": "Joint pain and stiffness", "Doctor_ID": 6, "Facility_ID": 2, "Admitted": False},
            {"_id": 7, "Patient_ID": 7, "Consultation_Date": datetime(2024, 9, 4, 16, 30), "Consultation_Reason": "Severe headache", "Doctor_ID": 7, "Facility_ID": 3, "Admitted": False},
            {"_id": 8, "Patient_ID": 8, "Consultation_Date": datetime(2024, 9, 3, 20, 15), "Consultation_Reason": "Emergency - chest pain", "Doctor_ID": 1, "Facility_ID": 1, "Admitted": True},
            {"_id": 9, "Patient_ID": 9, "Consultation_Date": datetime(2024, 9, 3, 14, 20), "Consultation_Reason": "Chronic fatigue assessment", "Doctor_ID": 2, "Facility_ID": 1, "Admitted": False},
            {"_id": 10, "Patient_ID": 10, "Consultation_Date": datetime(2024, 9, 3, 11, 10), "Consultation_Reason": "Respiratory infection symptoms", "Doctor_ID": 4, "Facility_ID": 1, "Admitted": True}
        ]
        db.get_collection('medical_consultations').insert_many(medical_consultations_data)
        print("✅ Inserted Medical Consultations")
        
        # Insert Vitals
        vitals_data = [
            {"_id": 1, "Consultation_ID": 1, "bp_systolic": 145, "bp_diastolic": 95, "Cholesterol": "High", "Difficulty_Breathing": True, "Cough": False, "Fatigue": True, "Fever": True, "oxygen_saturation": 92.5, "weight": 75.5, "respiratory_rate": 22, "temperature": 38.5, "heart_rate": 105},
            {"_id": 2, "Consultation_ID": 2, "bp_systolic": 120, "bp_diastolic": 80, "Cholesterol": "Normal", "Difficulty_Breathing": False, "Cough": True, "Fatigue": True, "Fever": False, "oxygen_saturation": 98.2, "weight": 68.0, "respiratory_rate": 16, "temperature": 36.8, "heart_rate": 78},
            {"_id": 3, "Consultation_ID": 3, "bp_systolic": 110, "bp_diastolic": 70, "Cholesterol": "Normal", "Difficulty_Breathing": False, "Cough": True, "Fatigue": True, "Fever": True, "oxygen_saturation": 97.8, "weight": 82.3, "respiratory_rate": 18, "temperature": 39.2, "heart_rate": 95},
            {"_id": 4, "Consultation_ID": 4, "bp_systolic": 135, "bp_diastolic": 85, "Cholesterol": "High", "Difficulty_Breathing": True, "Cough": True, "Fatigue": False, "Fever": False, "oxygen_saturation": 89.5, "weight": 92.1, "respiratory_rate": 24, "temperature": 37.1, "heart_rate": 88},
            {"_id": 5, "Consultation_ID": 5, "bp_systolic": 125, "bp_diastolic": 78, "Cholesterol": "Normal", "Difficulty_Breathing": False, "Cough": False, "Fatigue": False, "Fever": False, "oxygen_saturation": 99.1, "weight": 65.8, "respiratory_rate": 14, "temperature": 36.6, "heart_rate": 72},
            {"_id": 6, "Consultation_ID": 6, "bp_systolic": 140, "bp_diastolic": 90, "Cholesterol": "High", "Difficulty_Breathing": False, "Cough": False, "Fatigue": True, "Fever": False, "oxygen_saturation": 96.5, "weight": 78.9, "respiratory_rate": 16, "temperature": 36.9, "heart_rate": 85},
            {"_id": 7, "Consultation_ID": 7, "bp_systolic": 100, "bp_diastolic": 65, "Cholesterol": "Low", "Difficulty_Breathing": False, "Cough": False, "Fatigue": True, "Fever": True, "oxygen_saturation": 98.5, "weight": 58.2, "respiratory_rate": 15, "temperature": 37.8, "heart_rate": 82},
            {"_id": 8, "Consultation_ID": 8, "bp_systolic": 160, "bp_diastolic": 100, "Cholesterol": "High", "Difficulty_Breathing": True, "Cough": False, "Fatigue": True, "Fever": True, "oxygen_saturation": 88.2, "weight": 95.4, "respiratory_rate": 26, "temperature": 38.8, "heart_rate": 115},
            {"_id": 9, "Consultation_ID": 9, "bp_systolic": 115, "bp_diastolic": 75, "Cholesterol": "Normal", "Difficulty_Breathing": False, "Cough": False, "Fatigue": True, "Fever": False, "oxygen_saturation": 97.9, "weight": 71.6, "respiratory_rate": 16, "temperature": 36.5, "heart_rate": 76},
            {"_id": 10, "Consultation_ID": 10, "bp_systolic": 130, "bp_diastolic": 82, "Cholesterol": "Normal", "Difficulty_Breathing": True, "Cough": True, "Fatigue": True, "Fever": True, "oxygen_saturation": 94.8, "weight": 89.7, "respiratory_rate": 20, "temperature": 38.9, "heart_rate": 98}
        ]
        db.get_collection('vitals').insert_many(vitals_data)
        print("✅ Inserted Vitals")
        
        # Insert Diagnoses
        diagnosis_data = [
            {"_id": 1, "Consultation_ID": 1, "Condition_name": "Asthma", "Severity": 7, "Notes": "Acute exacerbation requiring immediate treatment", "Date": datetime.utcnow(), "Doctor_ID": 1, "Chronic": True, "Patient_ID": 1},
            {"_id": 2, "Consultation_ID": 2, "Condition_name": "Common Cold", "Severity": 3, "Notes": "Viral upper respiratory infection", "Date": datetime.utcnow(), "Doctor_ID": 2, "Chronic": False, "Patient_ID": 2},
            {"_id": 3, "Consultation_ID": 3, "Condition_name": "Influenza", "Severity": 5, "Notes": "Seasonal flu with systemic symptoms", "Date": datetime.utcnow(), "Doctor_ID": 8, "Chronic": False, "Patient_ID": 3},
            {"_id": 4, "Consultation_ID": 4, "Condition_name": "Pneumonia", "Severity": 8, "Notes": "Bacterial pneumonia requiring hospitalization", "Date": datetime.utcnow(), "Doctor_ID": 4, "Chronic": False, "Patient_ID": 4},
            {"_id": 5, "Consultation_ID": 5, "Condition_name": "Hypertension", "Severity": 4, "Notes": "Mild hypertension - lifestyle modification needed", "Date": datetime.utcnow(), "Doctor_ID": 5, "Chronic": True, "Patient_ID": 5}
        ]
        db.get_collection('diagnosis').insert_many(diagnosis_data)
        print("✅ Inserted Diagnoses")
        
        # Insert Treatments
        treatments_data = [
            {"_id": 1, "Consultation_ID": 1, "Procedure_name": "Nebulizer Treatment", "Description": "Bronchodilator administration via nebulizer", "Doctor_ID": 1, "Date": datetime.utcnow()},
            {"_id": 2, "Consultation_ID": 2, "Procedure_name": "Symptomatic Care", "Description": "Rest, fluids, and monitoring", "Doctor_ID": 2, "Date": datetime.utcnow()},
            {"_id": 3, "Consultation_ID": 3, "Procedure_name": "Antiviral Therapy", "Description": "Oseltamivir prescription and supportive care", "Doctor_ID": 8, "Date": datetime.utcnow()},
            {"_id": 4, "Consultation_ID": 4, "Procedure_name": "Antibiotic Therapy", "Description": "IV antibiotics and oxygen therapy", "Doctor_ID": 4, "Date": datetime.utcnow()},
            {"_id": 5, "Consultation_ID": 5, "Procedure_name": "Lifestyle Counseling", "Description": "Diet and exercise recommendations", "Doctor_ID": 5, "Date": datetime.utcnow()}
        ]
        db.get_collection('treatments').insert_many(treatments_data)
        print("✅ Inserted Treatments")
        
        # Insert Prescriptions
        prescriptions_data = [
            {"_id": 1, "Consultation_ID": 1, "drug_name": "Albuterol", "dosage": "2 puffs every 4 hours", "duration": "7 days", "Doctor_ID": 1, "Notes": "Use as rescue inhaler", "Date": datetime.utcnow()},
            {"_id": 2, "Consultation_ID": 2, "drug_name": "Acetaminophen", "dosage": "500mg every 6 hours", "duration": "5 days", "Doctor_ID": 2, "Notes": "For fever and body aches", "Date": datetime.utcnow()},
            {"_id": 3, "Consultation_ID": 3, "drug_name": "Oseltamivir", "dosage": "75mg twice daily", "duration": "5 days", "Doctor_ID": 8, "Notes": "Start within 48 hours of symptom onset", "Date": datetime.utcnow()},
            {"_id": 4, "Consultation_ID": 4, "drug_name": "Azithromycin", "dosage": "500mg daily", "duration": "7 days", "Doctor_ID": 4, "Notes": "Complete full course", "Date": datetime.utcnow()},
            {"_id": 5, "Consultation_ID": 5, "drug_name": "Lisinopril", "dosage": "10mg daily", "duration": "30 days", "Doctor_ID": 5, "Notes": "Monitor blood pressure", "Date": datetime.utcnow()}
        ]
        db.get_collection('prescriptions').insert_many(prescriptions_data)
        print("✅ Inserted Prescriptions")
        
        # Insert Admissions
        admissions_data = [
            {"_id": 1, "Consultation_ID": 1, "Facility_ID": 1, "Department_ID": 1, "Admitted_at": datetime(2024, 9, 4, 9, 0), "Discharged_at": datetime(2024, 9, 5, 14, 30), "Doctor_ID": 1, "Notes": "Stabilized after 29.5 hours"},
            {"_id": 2, "Consultation_ID": 4, "Facility_ID": 1, "Department_ID": 4, "Admitted_at": datetime(2024, 9, 4, 12, 0), "Discharged_at": None, "Doctor_ID": 4, "Notes": "Currently admitted for pneumonia treatment"},
            {"_id": 3, "Consultation_ID": 8, "Facility_ID": 1, "Department_ID": 3, "Admitted_at": datetime(2024, 9, 3, 20, 30), "Discharged_at": datetime(2024, 9, 6, 10, 15), "Doctor_ID": 1, "Notes": "Post-MI care - 61.75 hours stay"},
            {"_id": 4, "Consultation_ID": 10, "Facility_ID": 1, "Department_ID": 4, "Admitted_at": datetime(2024, 9, 3, 11, 30), "Discharged_at": datetime(2024, 9, 4, 16, 45), "Doctor_ID": 4, "Notes": "Severe bronchitis - 29.25 hours stay"}
        ]
        db.get_collection('admissions').insert_many(admissions_data)
        print("✅ Inserted Admissions")
        
        # Insert Appointments
        appointments_data = [
            {"_id": 1, "Patient_id": 5, "Facility_ID": 2, "Department_ID": 5, "Require_admission": False, "Time_ID": 3, "Date": "2024-09-05", "Reason": "Follow-up for hypertension"},
            {"_id": 2, "Patient_id": 6, "Facility_ID": 2, "Department_ID": 6, "Require_admission": False, "Time_ID": 5, "Date": "2024-09-05", "Reason": "Orthopedic consultation"},
            {"_id": 3, "Patient_id": 7, "Facility_ID": 3, "Department_ID": 7, "Require_admission": False, "Time_ID": 2, "Date": "2024-09-06", "Reason": "Neurological assessment"},
            {"_id": 4, "Patient_id": 9, "Facility_ID": 1, "Department_ID": 2, "Require_admission": False, "Time_ID": 4, "Date": "2024-09-07", "Reason": "Depression follow-up"},
            {"_id": 5, "Patient_id": 2, "Facility_ID": 1, "Department_ID": 4, "Require_admission": False, "Time_ID": 6, "Date": "2024-09-08", "Reason": "Pulmonary function test"}
        ]
        db.get_collection('appointments').insert_many(appointments_data)
        print("✅ Inserted Appointments")
        
        # Insert Patient Habits
        patient_habits_data = [
            {"_id": "patient1_habit1", "Patient_ID": 1, "Habit_ID": 1, "Frequency": "Daily - 1 pack"},
            {"_id": "patient1_habit5", "Patient_ID": 1, "Habit_ID": 5, "Frequency": "Mostly sedentary"},
            {"_id": "patient2_habit2", "Patient_ID": 2, "Habit_ID": 2, "Frequency": "3 times per week"},
            {"_id": "patient2_habit4", "Patient_ID": 2, "Habit_ID": 4, "Frequency": "Healthy diet"},
            {"_id": "patient3_habit3", "Patient_ID": 3, "Habit_ID": 3, "Frequency": "Social drinking - weekends"},
            {"_id": "patient4_habit2", "Patient_ID": 4, "Habit_ID": 2, "Frequency": "Daily exercise"},
            {"_id": "patient5_habit1", "Patient_ID": 5, "Habit_ID": 1, "Frequency": "Former smoker - quit 2 years ago"}
        ]
        db.get_collection('patient_habits').insert_many(patient_habits_data)
        print("✅ Inserted Patient Habits")
        
        print("✅ All sample data inserted successfully!")
        
    except Exception as e:
        print(f"❌ Error inserting sample data: {e}")
    
    finally:
        db.close_connection()

if __name__ == "__main__":
    insert_sample_data()