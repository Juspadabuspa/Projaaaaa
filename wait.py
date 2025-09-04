"""
Complete MedRoute Intelligent Scheduling System
Integrates with MongoDB, ML models, and symptom analysis
"""

from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Tuple
import heapq
from collections import defaultdict
from cloud_medroute_db import CloudMedRouteDB as MedRouteDB
from ml_models_handler import MLModelsHandler
import json

class UrgencyLevel(Enum):
    EMERGENCY = 1      # Immediate attention
    URGENT = 2         # Within 30 minutes  
    SEMI_URGENT = 3    # Within 2 hours
    STANDARD = 4       # Within 24 hours
    ROUTINE = 5        # Within 1 week

class AppointmentType(Enum):
    EMERGENCY = "emergency"
    CONSULTATION = "consultation"
    FOLLOW_UP = "follow_up"
    PROCEDURE = "procedure"
    ADMISSION = "admission"

@dataclass
class SchedulingRequest:
    patient_id: int
    urgency_level: UrgencyLevel
    required_department_id: int
    appointment_type: AppointmentType
    estimated_duration_minutes: int
    symptoms: List[str]
    required_specialization_id: Optional[int] = None
    preferred_doctor_id: Optional[int] = None
    predicted_stay_length: Optional[int] = None
    requires_admission: bool = False
    preferred_time_slots: List[int] = None
    patient_data: Dict = None

@dataclass
class DoctorAvailability:
    doctor_id: int
    available_slots: List[Tuple[datetime, datetime]]
    max_consecutive_hours: int = 8
    required_rest_minutes: int = 15
    current_workload: int = 0
    specializations: List[int] = None
    department_id: int = None

@dataclass
class ResourceConstraints:
    department_id: int
    available_beds: int
    current_capacity: int
    max_capacity: int
    equipment_available: bool = True
    current_doctors_on_duty: int = 0

class MedRouteScheduler:
    def __init__(self):
        self.db = MedRouteDB()
        self.ml_handler = MLModelsHandler()
        self.emergency_queue = []
        self.scheduled_appointments = defaultdict(list)
        
    def analyze_scheduling_request(self, request: SchedulingRequest) -> Dict:
        """Complete analysis using ML models"""
        # Run ML analysis if patient data provided
        if request.patient_data:
            ml_results = self.ml_handler.analyze_patient_triage(request.patient_data)
            
            # Update request with ML insights
            request.predicted_stay_length = ml_results['stay_prediction']['predicted_stay_hours']
            request.urgency_level = self._map_urgency_string_to_enum(ml_results['urgency_level'])
            
            return {
                'ml_results': ml_results,
                'symptom_severity': ml_results['symptom_analysis']['severity_score'],
                'predicted_stay_length': request.predicted_stay_length,
                'priority_score': ml_results['priority_score'],
                'resource_needs': ml_results['resource_needs']
            }
        else:
            # Fallback analysis without ML
            severity = self._get_symptom_severity(request.symptoms)
            return {
                'symptom_severity': severity,
                'predicted_stay_length': request.predicted_stay_length or self._estimate_duration(severity),
                'priority_score': self._calculate_priority_score_fallback(request, severity),
                'resource_needs': self._calculate_basic_resource_needs(request)
            }
    
    def schedule_appointment(self, request: SchedulingRequest) -> Dict:
        """Main scheduling algorithm"""
        analysis = self.analyze_scheduling_request(request)
        
        if request.urgency_level == UrgencyLevel.EMERGENCY:
            return self._handle_emergency_scheduling(request, analysis)
        
        # Get available resources
        available_doctors = self._get_available_doctors(
            request.required_department_id,
            request.required_specialization_id,
            request.preferred_doctor_id
        )
        
        available_facilities = self._get_available_facilities(
            request.required_department_id
        )
        
        # Find optimal scheduling slot
        optimal_slot = self._find_optimal_slot(
            request, analysis, available_doctors, available_facilities
        )
        
        if optimal_slot:
            # Create appointment record
            appointment_id = self._create_appointment_record(request, optimal_slot)
            
            # Update capacity and availability
            self._update_resource_allocation(optimal_slot, analysis.get('resource_needs', {}))
            
            return {
                'success': True,
                'appointment_id': appointment_id,
                'scheduled_time': optimal_slot['datetime'],
                'assigned_doctor_id': optimal_slot['doctor_id'],
                'department_id': optimal_slot['department_id'],
                'estimated_duration': request.estimated_duration_minutes,
                'predicted_stay_length': request.predicted_stay_length,
                'urgency_level': request.urgency_level.name,
                'analysis': analysis
            }
        else:
            return self._suggest_alternative_options(request, analysis)
    
    def _handle_emergency_scheduling(self, request: SchedulingRequest, analysis: Dict) -> Dict:
        """Immediate scheduling for emergency cases"""
        priority_score = analysis.get('priority_score', 1000)
        heapq.heappush(self.emergency_queue, (-priority_score, datetime.now(), request))
        
        # Find immediately available emergency resources
        emergency_resources = self._get_emergency_resources(request.required_department_id)
        
        if emergency_resources:
            assignment = emergency_resources[0]
            appointment_id = self._create_emergency_appointment(request, assignment)
            
            return {
                'success': True,
                'appointment_id': appointment_id,
                'scheduled_time': datetime.now(),
                'assigned_doctor_id': assignment['doctor_id'],
                'department_id': assignment['department_id'],
                'is_emergency': True,
                'queue_position': 1,
                'analysis': analysis
            }
        else:
            queue_position = len(self.emergency_queue)
            return {
                'success': False,
                'queued': True,
                'queue_position': queue_position,
                'estimated_wait_time': queue_position * 15,
                'analysis': analysis
            }
    
    def _find_optimal_slot(self, request: SchedulingRequest, analysis: Dict,
                          available_doctors: List[DoctorAvailability],
                          available_facilities: List[ResourceConstraints]) -> Optional[Dict]:
        """Find optimal scheduling slot"""
        best_slot = None
        best_score = float('-inf')
        
        # Time windows based on urgency
        time_windows = {
            UrgencyLevel.URGENT: timedelta(minutes=30),
            UrgencyLevel.SEMI_URGENT: timedelta(hours=2),
            UrgencyLevel.STANDARD: timedelta(hours=24),
            UrgencyLevel.ROUTINE: timedelta(days=7)
        }
        
        max_time = datetime.now() + time_windows[request.urgency_level]
        
        for doctor in available_doctors:
            for facility in available_facilities:
                for start_time, end_time in doctor.available_slots:
                    if start_time > max_time:
                        continue
                        
                    # Check duration requirement
                    slot_duration = (end_time - start_time).total_seconds() / 60
                    if slot_duration < request.estimated_duration_minutes:
                        continue
                    
                    # Calculate slot score
                    slot_score = self._calculate_slot_score(
                        request, analysis, doctor, facility, start_time
                    )
                    
                    if slot_score > best_score:
                        best_score = slot_score
                        best_slot = {
                            'datetime': start_time,
                            'doctor_id': doctor.doctor_id,
                            'department_id': facility.department_id,
                            'facility_id': facility.department_id,
                            'score': slot_score
                        }
        
        return best_slot
    
    def _calculate_slot_score(self, request: SchedulingRequest, analysis: Dict,
                            doctor: DoctorAvailability, facility: ResourceConstraints,
                            slot_time: datetime) -> float:
        """Score potential scheduling slot"""
        score = 0
        
        # Urgency factor
        time_diff = (slot_time - datetime.now()).total_seconds() / 3600
        urgency_weights = {
            UrgencyLevel.EMERGENCY: -100,
            UrgencyLevel.URGENT: -50,
            UrgencyLevel.SEMI_URGENT: -20,
            UrgencyLevel.STANDARD: -5,
            UrgencyLevel.ROUTINE: 0
        }
        score += urgency_weights[request.urgency_level] * time_diff
        
        # Doctor preferences
        if request.preferred_doctor_id and doctor.doctor_id == request.preferred_doctor_id:
            score += 50
        
        # Specialization match
        if (request.required_specialization_id and doctor.specializations and 
            request.required_specialization_id in doctor.specializations):
            score += 30
        
        # Workload balance
        score -= doctor.current_workload * 2
        
        # Capacity utilization
        if facility.max_capacity > 0:
            capacity_ratio = facility.current_capacity / facility.max_capacity
            score -= capacity_ratio * 20
        
        # Time preferences
        if request.preferred_time_slots:
            hour = slot_time.hour
            if hour in request.preferred_time_slots:
                score += 20
        
        return score
    
    def _get_available_doctors(self, dept_id: int, spec_id: Optional[int], 
                             preferred_id: Optional[int]) -> List[DoctorAvailability]:
        """Get available doctors from database"""
        try:
            # Query doctor assignments for department
            assignments = list(self.db.get_collection('doctor_assignments').find({
                'Department_ID': dept_id,
                'End_date': None  # Active assignments only
            }))
            
            doctors = []
            for assignment in assignments:
                doctor_id = assignment['Doctor_ID']
                
                # Get doctor details
                doctor = self.db.get_collection('doctors').find_one({'_id': doctor_id})
                if not doctor:
                    continue
                
                # Get specializations
                specializations = list(self.db.get_collection('doctor_specializations').find({
                    'Doctor_ID': doctor_id
                }))
                spec_ids = [spec['Specialization_ID'] for spec in specializations]
                
                # Generate available slots (simplified - in production this would be more complex)
                available_slots = self._generate_available_slots(doctor_id)
                
                doctors.append(DoctorAvailability(
                    doctor_id=doctor_id,
                    available_slots=available_slots,
                    current_workload=self._get_current_workload(doctor_id),
                    specializations=spec_ids,
                    department_id=dept_id
                ))
            
            return doctors
            
        except Exception as e:
            print(f"Error getting available doctors: {e}")
            return []
    
    def _get_available_facilities(self, dept_id: int) -> List[ResourceConstraints]:
        """Get available facilities from database"""
        try:
            # Get department info
            department = self.db.get_collection('departments').find_one({'_id': dept_id})
            if not department:
                return []
            
            # Get capacity info
            capacity = self.db.get_collection('department_capacity').find_one({
                'Department_ID': dept_id
            })
            
            if capacity:
                return [ResourceConstraints(
                    department_id=dept_id,
                    available_beds=capacity['Current_beds_available'],
                    current_capacity=capacity['Current_patients'],
                    max_capacity=department['Capacity_beds'],
                    current_doctors_on_duty=capacity['Current_doctors_on_duty']
                )]
            else:
                return [ResourceConstraints(
                    department_id=dept_id,
                    available_beds=department.get('Capacity_beds', 10),
                    current_capacity=0,
                    max_capacity=department.get('Capacity_beds', 10)
                )]
                
        except Exception as e:
            print(f"Error getting available facilities: {e}")
            return []
    
    def _generate_available_slots(self, doctor_id: int) -> List[Tuple[datetime, datetime]]:
        """Generate available time slots for doctor (simplified)"""
        # In production, this would check actual doctor schedules, existing appointments, etc.
        slots = []
        
        # Generate next 7 days, 9 AM to 5 PM, 1-hour slots
        start_date = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
        
        for day in range(7):
            current_date = start_date + timedelta(days=day)
            
            # Skip weekends for simplicity
            if current_date.weekday() >= 5:
                continue
                
            for hour in range(9, 17):  # 9 AM to 5 PM
                slot_start = current_date.replace(hour=hour)
                slot_end = slot_start + timedelta(hours=1)
                
                # Skip if slot is in the past
                if slot_start <= datetime.now():
                    continue
                    
                slots.append((slot_start, slot_end))
        
        return slots
    
    def _get_current_workload(self, doctor_id: int) -> int:
        """Get current workload for doctor"""
        # Count active appointments for today
        today = datetime.now().date()
        tomorrow = today + timedelta(days=1)
        
        count = self.db.get_collection('medical_consultations').count_documents({
            'Doctor_ID': doctor_id,
            'Consultation_Date': {
                '$gte': datetime.combine(today, datetime.min.time()),
                '$lt': datetime.combine(tomorrow, datetime.min.time())
            }
        })
        
        return count
    
    def _get_emergency_resources(self, dept_id: int) -> List[Dict]:
        """Get immediately available emergency resources"""
        # Get doctors currently on duty in emergency dept
        emergency_assignments = list(self.db.get_collection('doctor_assignments').find({
            'Department_ID': dept_id,
            'End_date': None
        }))
        
        resources = []
        for assignment in emergency_assignments[:2]:  # Limit to 2 emergency doctors
            resources.append({
                'doctor_id': assignment['Doctor_ID'],
                'department_id': dept_id,
                'available_immediately': True
            })
        
        return resources
    
    def _create_appointment_record(self, request: SchedulingRequest, slot: Dict) -> int:
        """Create appointment record in database"""
        try:
            appointment_doc = {
                'Patient_id': request.patient_id,
                'Facility_ID': 1,  # Default facility
                'Department_ID': request.required_department_id,
                'Require_admission': request.requires_admission,
                'Time_ID': self._get_time_slot_id(slot['datetime']),
                'Date': slot['datetime'].strftime('%Y-%m-%d'),
                'Reason': f"{request.appointment_type.value} - {', '.join(request.symptoms)}",
                'scheduled_datetime': slot['datetime'],
                'assigned_doctor_id': slot['doctor_id'],
                'estimated_duration': request.estimated_duration_minutes,
                'predicted_stay_length': request.predicted_stay_length,
                'urgency_level': request.urgency_level.name,
                'created_at': datetime.utcnow()
            }
            
            result = self.db.get_collection('appointments').insert_one(appointment_doc)
            return result.inserted_id
            
        except Exception as e:
            print(f"Error creating appointment record: {e}")
            return None
    
    def _create_emergency_appointment(self, request: SchedulingRequest, assignment: Dict) -> int:
        """Create emergency appointment record"""
        try:
            appointment_doc = {
                'Patient_id': request.patient_id,
                'Facility_ID': 1,
                'Department_ID': request.required_department_id,
                'Require_admission': True,  # Emergency cases require admission
                'Time_ID': 1,  # Emergency slot
                'Date': datetime.now().strftime('%Y-%m-%d'),
                'Reason': f"EMERGENCY - {', '.join(request.symptoms)}",
                'scheduled_datetime': datetime.now(),
                'assigned_doctor_id': assignment['doctor_id'],
                'estimated_duration': request.estimated_duration_minutes,
                'urgency_level': 'EMERGENCY',
                'is_emergency': True,
                'created_at': datetime.utcnow()
            }
            
            result = self.db.get_collection('appointments').insert_one(appointment_doc)
            return result.inserted_id
            
        except Exception as e:
            print(f"Error creating emergency appointment: {e}")
            return None
    
    def _update_resource_allocation(self, slot: Dict, resource_needs: Dict):
        """Update capacity and resource allocation"""
        try:
            # Update department capacity
            self.db.get_collection('department_capacity').update_one(
                {'Department_ID': slot['department_id']},
                {'$inc': {'Current_patients': 1}}
            )
            
            # Could also update doctor workload, bed allocation, etc.
            print(f"Updated resource allocation for department {slot['department_id']}")
            
        except Exception as e:
            print(f"Error updating resource allocation: {e}")
    
    def _suggest_alternative_options(self, request: SchedulingRequest, analysis: Dict) -> Dict:
        """Suggest alternative scheduling options"""
        alternatives = []
        
        # Try different time windows
        if request.urgency_level != UrgencyLevel.ROUTINE:
            request_copy = request
            request_copy.urgency_level = UrgencyLevel.ROUTINE
            alternatives.append("Consider scheduling as routine appointment")
        
        # Try different departments
        alternative_depts = self._get_alternative_departments(request.required_department_id)
        for dept_id in alternative_depts:
            alternatives.append(f"Consider department {dept_id}")
        
        return {
            'success': False,
            'reason': 'No available slots found',
            'alternatives': alternatives,
            'analysis': analysis,
            'suggested_actions': [
                'Try different time preferences',
                'Consider telehealth consultation',
                'Schedule for next available slot'
            ]
        }
    
    def _get_alternative_departments(self, original_dept_id: int) -> List[int]:
        """Get alternative departments that could handle the case"""
        # Simplified mapping - in production this would be more sophisticated
        alternatives_map = {
            1: [2, 5],  # Emergency -> Internal Medicine, General Medicine
            2: [1, 5],  # Internal Medicine -> Emergency, General Medicine
            3: [1, 2],  # Cardiology -> Emergency, Internal Medicine
            4: [1, 2],  # Pulmonology -> Emergency, Internal Medicine
            5: [1, 2],  # General Medicine -> Emergency, Internal Medicine
        }
        
        return alternatives_map.get(original_dept_id, [])
    
    def _get_time_slot_id(self, appointment_time: datetime) -> int:
        """Map appointment time to time slot ID"""
        hour = appointment_time.hour
        # Map hours to time slot IDs (from your database structure)
        hour_to_slot = {
            8: 1, 9: 2, 10: 3, 11: 4, 12: 5, 13: 6, 14: 7, 15: 8, 16: 9, 17: 10
        }
        return hour_to_slot.get(hour, 6)  # Default to slot 6 (1-2 PM)
    
    def _get_symptom_severity(self, symptoms: List[str]) -> int:
        """Calculate severity score from symptoms"""
        severity_map = {
            'chest_pain': 9, 'difficulty_breathing': 8, 'severe_headache': 7,
            'high_fever': 6, 'persistent_cough': 4, 'mild_headache': 2,
            'fever': 5, 'cough': 3, 'fatigue': 3, 'nausea': 2
        }
        
        max_severity = 0
        for symptom in symptoms:
            if symptom in severity_map:
                max_severity = max(max_severity, severity_map[symptom])
        
        return max_severity if max_severity > 0 else 3  # Default mild severity
    
    def _estimate_duration(self, severity: int) -> int:
        """Estimate stay duration based on severity"""
        duration_map = {
            1: 60, 2: 120, 3: 240, 4: 480, 5: 720, 
            6: 1440, 7: 2880, 8: 4320, 9: 10080, 10: 10080
        }
        return duration_map.get(severity, 240)  # Default 4 hours
    
    def _calculate_priority_score_fallback(self, request: SchedulingRequest, severity: int) -> int:
        """Calculate priority score without ML"""
        base_priority = {
            UrgencyLevel.EMERGENCY: 1000, UrgencyLevel.URGENT: 800,
            UrgencyLevel.SEMI_URGENT: 600, UrgencyLevel.STANDARD: 400,
            UrgencyLevel.ROUTINE: 200
        }
        return base_priority[request.urgency_level] + (severity * 50)
    
    def _calculate_basic_resource_needs(self, request: SchedulingRequest) -> Dict:
        """Calculate basic resource needs without ML"""
        return {
            'bed_type': 'monitored' if request.urgency_level.value <= 2 else 'standard',
            'special_equipment': ['oxygen'] if 'difficulty_breathing' in request.symptoms else [],
            'nursing_level': 'intensive' if request.urgency_level == UrgencyLevel.EMERGENCY else 'standard'
        }
    
    def _map_urgency_string_to_enum(self, urgency_string: str) -> UrgencyLevel:
        """Convert urgency string to enum"""
        mapping = {
            'EMERGENCY': UrgencyLevel.EMERGENCY,
            'URGENT': UrgencyLevel.URGENT, 
            'SEMI_URGENT': UrgencyLevel.SEMI_URGENT,
            'STANDARD': UrgencyLevel.STANDARD,
            'ROUTINE': UrgencyLevel.ROUTINE
        }
        return mapping.get(urgency_string, UrgencyLevel.STANDARD)
    
    def get_department_capacity_report(self) -> Dict:
        """Generate real-time capacity report"""
        try:
            departments = list(self.db.get_collection('departments').find())
            report = {}
            
            for dept in departments:
                dept_id = dept['_id']
                
                # Get capacity info
                capacity = self.db.get_collection('department_capacity').find_one({
                    'Department_ID': dept_id
                })
                
                if capacity:
                    utilization_rate = capacity['Current_patients'] / dept['Capacity_beds'] if dept['Capacity_beds'] > 0 else 0
                    
                    report[dept_id] = {
                        'name': dept['Name'],
                        'current_patients': capacity['Current_patients'],
                        'available_beds': capacity['Current_beds_available'],
                        'max_capacity': dept['Capacity_beds'],
                        'doctors_on_duty': capacity['Current_doctors_on_duty'],
                        'utilization_rate': round(utilization_rate * 100, 1),
                        'status': self._determine_department_status(utilization_rate)
                    }
            
            return report
            
        except Exception as e:
            print(f"Error generating capacity report: {e}")
            return {}
    
    def _determine_department_status(self, utilization_rate: float) -> str:
        """Determine department status based on utilization"""
        if utilization_rate >= 0.9:
            return "CRITICAL"
        elif utilization_rate >= 0.75:
            return "HIGH"
        elif utilization_rate >= 0.5:
            return "MODERATE"
        else:
            return "LOW"
    
    def batch_schedule_patients(self, patient_queue: List[Dict]) -> List[Dict]:
        """Process multiple patients for scheduling"""
        results = []
        
        for patient_data in patient_queue:
            try:
                # Create scheduling request
                request = self._create_scheduling_request_from_patient_data(patient_data)
                
                # Schedule appointment
                result = self.schedule_appointment(request)
                result['patient_id'] = patient_data['patient_id']
                results.append(result)
                
            except Exception as e:
                results.append({
                    'patient_id': patient_data.get('patient_id'),
                    'success': False,
                    'error': str(e)
                })
        
        # Sort results by urgency and priority
        results.sort(key=lambda x: (
            x.get('analysis', {}).get('priority_score', 0) if x.get('success') else 0
        ), reverse=True)
        
        return results
    
    def _create_scheduling_request_from_patient_data(self, patient_data: Dict) -> SchedulingRequest:
        """Create scheduling request from patient data"""
        symptoms = []
        if patient_data.get('fever'): symptoms.append('fever')
        if patient_data.get('cough'): symptoms.append('cough')  
        if patient_data.get('fatigue'): symptoms.append('fatigue')
        if patient_data.get('difficulty_breathing'): symptoms.append('difficulty_breathing')
        
        # Determine initial urgency based on symptoms
        urgency = UrgencyLevel.STANDARD
        if patient_data.get('difficulty_breathing') and patient_data.get('fever'):
            urgency = UrgencyLevel.URGENT
        elif patient_data.get('age', 0) >= 75:
            urgency = UrgencyLevel.SEMI_URGENT
            
        return SchedulingRequest(
            patient_id=patient_data['patient_id'],
            urgency_level=urgency,
            required_department_id=patient_data.get('preferred_department', 5),  # Default to General Medicine
            appointment_type=AppointmentType.CONSULTATION,
            estimated_duration_minutes=60,
            symptoms=symptoms,
            patient_data=patient_data
        )

# Integration functions
def create_scheduling_request_from_triage(patient_data: Dict, ml_results: Dict) -> SchedulingRequest:
    """Create scheduling request from ML triage results"""
    # Map ML urgency to enum
    urgency_mapping = {
        'EMERGENCY': UrgencyLevel.EMERGENCY,
        'URGENT': UrgencyLevel.URGENT,
        'SEMI_URGENT': UrgencyLevel.SEMI_URGENT, 
        'STANDARD': UrgencyLevel.STANDARD,
        'ROUTINE': UrgencyLevel.ROUTINE
    }
    
    urgency = urgency_mapping.get(ml_results['urgency_level'], UrgencyLevel.STANDARD)
    
    # Extract symptoms
    symptoms = []
    for symptom in ['fever', 'cough', 'fatigue', 'difficulty_breathing']:
        if patient_data.get(symptom):
            symptoms.append(symptom)
    
    return SchedulingRequest(
        patient_id=patient_data['patient_id'],
        urgency_level=urgency,
        required_department_id=ml_results['symptom_analysis']['recommended_department'],
        appointment_type=AppointmentType.CONSULTATION,
        estimated_duration_minutes=60 if ml_results['symptom_analysis']['severity_score'] < 7 else 90,
        symptoms=symptoms,
        predicted_stay_length=int(ml_results['stay_prediction']['predicted_stay_hours']),
        requires_admission=ml_results['urgency_level'] in ['EMERGENCY', 'URGENT'],
        patient_data=patient_data
    )

# Example usage and testing
def test_scheduler():
    """Test the complete scheduling system"""
    print("Testing MedRoute Scheduler...")
    
    scheduler = MedRouteScheduler()
    
    # Test patient data
    patient_data = {
        'patient_id': 1,
        'age': 65,
        'gender': 'Male',
        'fever': True,
        'cough': False,
        'fatigue': True,
        'difficulty_breathing': True,
        'blood_pressure': 'High',
        'cholesterol_level': 'Normal',
        'suspected_disease': 'Pneumonia',
        'facility_id': 1,
        'doctor_id': 1,
        'preferred_department': 1
    }
    
    # Create scheduling request
    request = scheduler._create_scheduling_request_from_patient_data(patient_data)
    
    # Schedule appointment
    result = scheduler.schedule_appointment(request)
    
    print("Scheduling Result:")
    print(f"Success: {result.get('success')}")
    if result.get('success'):
        print(f"Appointment ID: {result.get('appointment_id')}")
        print(f"Scheduled Time: {result.get('scheduled_time')}")
        print(f"Doctor ID: {result.get('assigned_doctor_id')}")
        print(f"Urgency: {result.get('urgency_level')}")
    else:
        print(f"Reason: {result.get('reason')}")
        print(f"Alternatives: {result.get('alternatives')}")
    
    # Test capacity report
    print("\nCapacity Report:")
    capacity_report = scheduler.get_department_capacity_report()
    for dept_id, info in capacity_report.items():
        print(f"Department {dept_id} ({info['name']}): {info['utilization_rate']}% - {info['status']}")

if __name__ == "__main__":
    test_scheduler()