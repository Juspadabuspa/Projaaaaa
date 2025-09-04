"""
Complete MedRoute System Integration
Combines ML models, MongoDB, and scheduling system
"""

from cloud_medroute_db import CloudMedRouteDB as MedRouteDB
from ml_models_handler import MLModelsHandler
from complete_medroute_scheduler import MedRouteScheduler, SchedulingRequest, UrgencyLevel, AppointmentType
from datetime import datetime, timedelta
import json

class MedRouteSystem:
    """
    Complete integrated MedRoute hospital management system
    """
    
    def __init__(self):
        self.db = MedRouteDB()
        self.ml_handler = MLModelsHandler()
        self.scheduler = MedRouteScheduler()
        print("✅ MedRoute System initialized")
    
    def process_patient_arrival(self, patient_data: dict) -> dict:
        """
        Complete patient processing pipeline:
        1. ML triage analysis
        2. Scheduling optimization
        3. Resource allocation
        4. Database updates
        """
        print(f"Processing patient {patient_data.get('patient_id')}...")
        
        # Step 1: ML Triage Analysis
        ml_results = self.ml_handler.analyze_patient_triage(patient_data)
        
        # Step 2: Create scheduling request
        scheduling_request = self._create_scheduling_request(patient_data, ml_results)
        
        # Step 3: Schedule appointment
        scheduling_result = self.scheduler.schedule_appointment(scheduling_request)
        
        # Step 4: Compile complete result
        complete_result = {
            'patient_id': patient_data['patient_id'],
            'timestamp': datetime.utcnow(),
            'ml_analysis': ml_results,
            'scheduling': scheduling_result,
            'summary': self._create_patient_summary(ml_results, scheduling_result)
        }
        
        return complete_result
    
    def _create_scheduling_request(self, patient_data: dict, ml_results: dict) -> SchedulingRequest:
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
    
    def _create_patient_summary(self, ml_results: dict, scheduling_result: dict) -> dict:
        """Create patient summary for quick reference"""
        return {
            'urgency_level': ml_results['urgency_level'],
            'severity_score': ml_results['symptom_analysis']['severity_score'],
            'predicted_stay_hours': ml_results['stay_prediction']['predicted_stay_hours'],
            'recommended_department': ml_results['symptom_analysis']['recommended_department'],
            'scheduling_success': scheduling_result.get('success', False),
            'scheduled_time': scheduling_result.get('scheduled_time'),
            'assigned_doctor': scheduling_result.get('assigned_doctor_id'),
            'priority_score': ml_results['priority_score'],
            'requires_admission': ml_results['urgency_level'] in ['EMERGENCY', 'URGENT']
        }
    
    def process_patient_queue(self, patient_queue: list) -> dict:
        """Process multiple patients and optimize scheduling"""
        print(f"Processing queue of {len(patient_queue)} patients...")
        
        results = []
        emergency_count = 0
        total_predicted_hours = 0
        
        for patient_data in patient_queue:
            try:
                result = self.process_patient_arrival(patient_data)
                results.append(result)
                
                if result['summary']['urgency_level'] == 'EMERGENCY':
                    emergency_count += 1
                
                total_predicted_hours += result['summary']['predicted_stay_hours']
                
            except Exception as e:
                print(f"Error processing patient {patient_data.get('patient_id')}: {e}")
                results.append({
                    'patient_id': patient_data.get('patient_id'),
                    'error': str(e),
                    'timestamp': datetime.utcnow()
                })
        
        # Sort by priority
        results.sort(key=lambda x: x.get('ml_analysis', {}).get('priority_score', 0), reverse=True)
        
        # Generate queue summary
        queue_summary = {
            'total_patients': len(patient_queue),
            'emergency_cases': emergency_count,
            'total_predicted_stay_hours': total_predicted_hours,
            'average_predicted_stay': total_predicted_hours / len(patient_queue) if patient_queue else 0,
            'processing_timestamp': datetime.utcnow(),
            'capacity_impact': self._assess_capacity_impact(results)
        }
        
        return {
            'patient_results': results,
            'queue_summary': queue_summary,
            'capacity_report': self.scheduler.get_department_capacity_report()
        }
    
    def _assess_capacity_impact(self, results: list) -> dict:
        """Assess impact on hospital capacity"""
        department_load = {}
        
        for result in results:
            if 'ml_analysis' in result:
                dept_id = result['ml_analysis']['symptom_analysis']['recommended_department']
                if dept_id not in department_load:
                    department_load[dept_id] = 0
                department_load[dept_id] += 1
        
        return {
            'department_load': department_load,
            'peak_department': max(department_load.items(), key=lambda x: x[1]) if department_load else None,
            'departments_affected': len(department_load)
        }
    
    def get_hospital_dashboard(self) -> dict:
        """Generate comprehensive hospital dashboard"""
        capacity_report = self.scheduler.get_department_capacity_report()
        
        # Get recent activity
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        recent_consultations = list(self.db.get_collection('medical_consultations').find({
            'Consultation_Date': {'$gte': today}
        }))
        
        # Get current appointments
        current_appointments = list(self.db.get_collection('appointments').find({
            'Date': {'$gte': datetime.now().strftime('%Y-%m-%d')}
        }))
        
        return {
            'timestamp': datetime.utcnow(),
            'capacity_report': capacity_report,
            'daily_stats': {
                'consultations_today': len(recent_consultations),
                'appointments_scheduled': len(current_appointments),
                'emergency_cases': len([c for c in recent_consultations if 'EMERGENCY' in str(c.get('Consultation_Reason', ''))]),
                'avg_severity': self._calculate_avg_severity(recent_consultations)
            },
            'alerts': self._generate_alerts(capacity_report),
            'predictions': self._generate_predictions()
        }
    
    def _calculate_avg_severity(self, consultations: list) -> float:
        """Calculate average severity from recent consultations"""
        severities = []
        for consultation in consultations:
            ml_result = consultation.get('ml_triage_result', {})
            if ml_result and 'symptom_analysis' in ml_result:
                severities.append(ml_result['symptom_analysis'].get('severity_score', 5))
        
        return sum(severities) / len(severities) if severities else 5.0
    
    def _generate_alerts(self, capacity_report: dict) -> list:
        """Generate system alerts"""
        alerts = []
        
        for dept_id, info in capacity_report.items():
            if info['status'] == 'CRITICAL':
                alerts.append({
                    'type': 'CRITICAL_CAPACITY',
                    'department': info['name'],
                    'message': f"{info['name']} at {info['utilization_rate']}% capacity",
                    'timestamp': datetime.utcnow()
                })
            elif info['status'] == 'HIGH':
                alerts.append({
                    'type': 'HIGH_CAPACITY',
                    'department': info['name'],
                    'message': f"{info['name']} approaching capacity ({info['utilization_rate']}%)",
                    'timestamp': datetime.utcnow()
                })
        
        return alerts
    
    def _generate_predictions(self) -> dict:
        """Generate predictive insights"""
        # Simple predictions based on current data
        capacity_report = self.scheduler.get_department_capacity_report()
        
        total_utilization = sum(dept['utilization_rate'] for dept in capacity_report.values())
        avg_utilization = total_utilization / len(capacity_report) if capacity_report else 0
        
        return {
            'expected_peak_time': '14:00-16:00',  # Typical hospital peak
            'avg_system_utilization': round(avg_utilization, 1),
            'recommended_staffing_adjustment': 'increase' if avg_utilization > 75 else 'maintain',
            'capacity_forecast_6h': min(avg_utilization + 15, 100)  # Simple forecast
        }

def run_complete_demo():
    """Run complete system demonstration"""
    print("🏥 MedRoute Complete System Demo")
    print("=" * 50)
    
    # Initialize system
    system = MedRouteSystem()
    
    # Sample patient queue
    patient_queue = [
        {
            'patient_id': 1,
            'age': 75,
            'gender': 'Female',
            'fever': True,
            'cough': False,
            'fatigue': True,
            'difficulty_breathing': True,
            'blood_pressure': 'High',
            'cholesterol_level': 'Normal',
            'suspected_disease': 'Pneumonia',
            'facility_id': 1,
            'doctor_id': 1
        },
        {
            'patient_id': 2,
            'age': 35,
            'gender': 'Male',
            'fever': False,
            'cough': True,
            'fatigue': True,
            'difficulty_breathing': False,
            'blood_pressure': 'Normal',
            'cholesterol_level': 'Normal',
            'suspected_disease': 'Common Cold',
            'facility_id': 1,
            'doctor_id': 2
        },
        {
            'patient_id': 3,
            'age': 45,
            'gender': 'Female',
            'fever': True,
            'cough': True,
            'fatigue': True,
            'difficulty_breathing': False,
            'blood_pressure': 'Normal',
            'cholesterol_level': 'High',
            'suspected_disease': 'Influenza',
            'facility_id': 1,
            'doctor_id': 1
        }
    ]
    
    # Process patient queue
    queue_results = system.process_patient_queue(patient_queue)
    
    print("\n📊 Queue Processing Results:")
    print(f"Processed: {queue_results['queue_summary']['total_patients']} patients")
    print(f"Emergency cases: {queue_results['queue_summary']['emergency_cases']}")
    print(f"Avg predicted stay: {queue_results['queue_summary']['average_predicted_stay']:.1f} hours")
    
    print("\n🏥 Patient Results:")
    for result in queue_results['patient_results']:
        if 'error' not in result:
            summary = result['summary']
            print(f"Patient {result['patient_id']}: {summary['urgency_level']} "
                  f"(Severity: {summary['severity_score']}, "
                  f"Stay: {summary['predicted_stay_hours']:.1f}h, "
                  f"Scheduled: {'✅' if summary['scheduling_success'] else '❌'})")
    
    # Generate dashboard
    dashboard = system.get_hospital_dashboard()
    
    print("\n📈 Hospital Dashboard:")
    print(f"Consultations today: {dashboard['daily_stats']['consultations_today']}")
    print(f"Appointments scheduled: {dashboard['daily_stats']['appointments_scheduled']}")
    print(f"Emergency cases: {dashboard['daily_stats']['emergency_cases']}")
    print(f"Average severity: {dashboard['daily_stats']['avg_severity']:.1f}")
    
    print("\n🚨 System Alerts:")
    if dashboard['alerts']:
        for alert in dashboard['alerts']:
            print(f"- {alert['type']}: {alert['message']}")
    else:
        print("- No alerts")
    
    print("\n🔮 Predictions:")
    predictions = dashboard['predictions']
    print(f"System utilization: {predictions['avg_system_utilization']}%")
    print(f"Staffing recommendation: {predictions['recommended_staffing_adjustment']}")
    print(f"6-hour capacity forecast: {predictions['capacity_forecast_6h']}%")
    
    print("\n✅ Demo completed successfully!")

if __name__ == "__main__":
    run_complete_demo()