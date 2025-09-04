"""
MedRoute Intelligent Scheduling System
Simplified version for initial testing
"""

from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple
import heapq
from collections import defaultdict

class UrgencyLevel(Enum):
    EMERGENCY = 1
    URGENT = 2
    SEMI_URGENT = 3
    STANDARD = 4
    ROUTINE = 5

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
        try:
            from medroute_db import MedRouteDB
            self.db = MedRouteDB()
        except ImportError:
            print("Warning: medroute_db not available, using mock database")
            self.db = None
        
        self.emergency_queue = []
        self.scheduled_appointments = defaultdict(list)
    
    def schedule_appointment(self, request: SchedulingRequest) -> Dict:
        """Main scheduling method"""
        try:
            analysis = self.analyze_scheduling_request(request)
            
            if request.urgency_level == UrgencyLevel.EMERGENCY:
                return self._handle_emergency_scheduling(request, analysis)
            
            # Get available resources (simplified)
            available_doctors = self._get_mock_doctors(request.required_department_id)
            available_facilities = self._get_mock_facilities(request.required_department_id)
            
            # Find optimal slot
            optimal_slot = self._find_optimal_slot(request, analysis, available_doctors, available_facilities)
            
            if optimal_slot:
                appointment_id = self._create_mock_appointment(request, optimal_slot)
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
                return {
                    'success': False,
                    'reason': 'No available slots found',
                    'alternatives': ['Try different time', 'Different department'],
                    'analysis': analysis
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'reason': 'Scheduling system error'
            }
    
    def analyze_scheduling_request(self, request: SchedulingRequest) -> Dict:
        """Analyze scheduling request"""
        if request.patient_data:
            try:
                from ml_models_handler import MLModelsHandler
                ml_handler = MLModelsHandler()
                ml_results = ml_handler.analyze_patient_triage(request.patient_data)
                
                return {
                    'ml_results': ml_results,
                    'symptom_severity': ml_results['symptom_analysis']['severity_score'],
                    'predicted_stay_length': ml_results['stay_prediction']['predicted_stay_hours'],
                    'priority_score': ml_results['priority_score']
                }
            except Exception as e:
                print(f"ML analysis failed: {e}")
        
        # Fallback analysis
        severity = self._get_symptom_severity(request.symptoms)
        return {
            'symptom_severity': severity,
            'predicted_stay_length': self._estimate_duration(severity),
            'priority_score': self._calculate_priority_score_fallback(request, severity)
        }
    
    def _handle_emergency_scheduling(self, request: SchedulingRequest, analysis: Dict) -> Dict:
        """Handle emergency cases"""
        priority_score = analysis.get('priority_score', 1000)
        heapq.heappush(self.emergency_queue, (-priority_score, datetime.now(), request))
        
        return {
            'success': True,
            'appointment_id': f"emergency_{request.patient_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'scheduled_time': datetime.now(),
            'assigned_doctor_id': 1,  # Emergency doctor
            'department_id': 1,  # Emergency department
            'is_emergency': True,
            'queue_position': 1,
            'analysis': analysis
        }
    
    def _get_mock_doctors(self, dept_id: int) -> List[DoctorAvailability]:
        """Generate mock doctor availability"""
        doctors = []
        for i in range(1, 4):  # 3 doctors
            # Generate available slots for next 7 days
            slots = []
            start_date = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
            
            for day in range(7):
                if (start_date + timedelta(days=day)).weekday() < 5:  # Weekdays only
                    for hour in range(9, 17):  # 9 AM to 5 PM
                        slot_start = start_date + timedelta(days=day, hours=hour-9)
                        if slot_start > datetime.now():
                            slot_end = slot_start + timedelta(hours=1)
                            slots.append((slot_start, slot_end))
            
            doctors.append(DoctorAvailability(
                doctor_id=i,
                available_slots=slots[:10],  # Limit to 10 slots for simplicity
                current_workload=i * 2,
                department_id=dept_id
            ))
        
        return doctors
    
    def _get_mock_facilities(self, dept_id: int) -> List[ResourceConstraints]:
        """Generate mock facility constraints"""
        return [ResourceConstraints(
            department_id=dept_id,
            available_beds=10,
            current_capacity=5,
            max_capacity=15,
            current_doctors_on_duty=3
        )]
    
    def _find_optimal_slot(self, request: SchedulingRequest, analysis: Dict,
                          available_doctors: List[DoctorAvailability],
                          available_facilities: List[ResourceConstraints]) -> Optional[Dict]:
        """Find optimal scheduling slot"""
        if not available_doctors or not available_facilities:
            return None
        
        # Simple: take first available doctor and slot
        doctor = available_doctors[0]
        facility = available_facilities[0]
        
        if doctor.available_slots:
            slot_time = doctor.available_slots[0][0]
            return {
                'datetime': slot_time,
                'doctor_id': doctor.doctor_id,
                'department_id': facility.department_id,
                'score': 100
            }
        
        return None
    
    def _create_mock_appointment(self, request: SchedulingRequest, slot: Dict) -> str:
        """Create mock appointment ID"""
        return f"appt_{request.patient_id}_{slot['doctor_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    def _get_symptom_severity(self, symptoms: List[str]) -> int:
        """Calculate severity from symptoms"""
        severity_map = {
            'chest_pain': 9, 'difficulty_breathing': 8, 'severe_headache': 7,
            'high_fever': 6, 'persistent_cough': 4, 'mild_headache': 2,
            'fever': 5, 'cough': 3, 'fatigue': 3, 'nausea': 2
        }
        
        max_severity = 0
        for symptom in symptoms:
            if symptom in severity_map:
                max_severity = max(max_severity, severity_map[symptom])
        
        return max_severity if max_severity > 0 else 3
    
    def _estimate_duration(self, severity: int) -> int:
        """Estimate stay duration based on severity"""
        duration_map = {
            1: 1, 2: 2, 3: 4, 4: 8, 5: 12, 
            6: 24, 7: 48, 8: 72, 9: 168, 10: 168
        }
        return duration_map.get(severity, 4)
    
    def _calculate_priority_score_fallback(self, request: SchedulingRequest, severity: int) -> int:
        """Calculate priority score without ML"""
        base_priority = {
            UrgencyLevel.EMERGENCY: 1000, UrgencyLevel.URGENT: 800,
            UrgencyLevel.SEMI_URGENT: 600, UrgencyLevel.STANDARD: 400,
            UrgencyLevel.ROUTINE: 200
        }
        return base_priority[request.urgency_level] + (severity * 50)
    
    def get_department_capacity_report(self) -> Dict:
        """Generate mock capacity report"""
        return {
            1: {'name': 'Emergency Department', 'utilization_rate': 75, 'status': 'HIGH'},
            2: {'name': 'Internal Medicine', 'utilization_rate': 60, 'status': 'MODERATE'},
            3: {'name': 'Cardiology', 'utilization_rate': 45, 'status': 'LOW'},
            4: {'name': 'Pulmonology', 'utilization_rate': 55, 'status': 'MODERATE'},
            5: {'name': 'General Medicine', 'utilization_rate': 40, 'status': 'LOW'}
        }

# Helper function for integration
def create_scheduling_request_from_triage(patient_data: Dict, ml_results: Dict) -> SchedulingRequest:
    """Create scheduling request from ML results"""
    urgency_mapping = {
        'EMERGENCY': UrgencyLevel.EMERGENCY,
        'URGENT': UrgencyLevel.URGENT,
        'SEMI_URGENT': UrgencyLevel.SEMI_URGENT,
        'STANDARD': UrgencyLevel.STANDARD,
        'ROUTINE': UrgencyLevel.ROUTINE
    }
    
    urgency = urgency_mapping.get(ml_results['urgency_level'], UrgencyLevel.STANDARD)
    
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