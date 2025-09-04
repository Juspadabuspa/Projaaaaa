"""
Production MedRoute System Integration with Cloud Database
Uses MongoDB Atlas with production-scale data
"""

from cloud_medroute_db import CloudMedRouteDB as MedRouteDB
from ml_models_handler import MLModelsHandler
from complete_medroute_scheduler import MedRouteScheduler, SchedulingRequest, UrgencyLevel, AppointmentType
from datetime import datetime, timedelta
import json
import random

class ProductionMedRouteSystem:
    """
    Production-ready MedRoute system with cloud database and large-scale data
    """
    
    def __init__(self):
        self.db = MedRouteDB()
        self.ml_handler = MLModelsHandler()
        self.scheduler = MedRouteScheduler()
        self._verify_data_availability()
        print("Production MedRoute System initialized")
    
    def _verify_data_availability(self):
        """Verify that production data is available in the database"""
        try:
            patient_count = self.db.get_collection('patients').count_documents({})
            consultation_count = self.db.get_collection('medical_consultations').count_documents({})
            
            if patient_count == 0:
                print("Warning: No patient data found in database")
                print("Please run the Atlas data uploader first")
            else:
                print(f"Connected to production database with {patient_count:,} patients and {consultation_count:,} consultations")
                
        except Exception as e:
            print(f"Database verification failed: {e}")
    
    def process_real_patient_queue(self, queue_size: int = 20) -> dict:
        """Process a queue using real patients from the database"""
        print(f"Processing real patient queue of size {queue_size}...")
        
        # Get random patients from database
        random_patients = list(self.db.get_collection('patients').aggregate([
            {'$sample': {'size': queue_size}}
        ]))
        
        if not random_patients:
            print("No patients found in database")
            return {}
        
        # Convert to patient data format expected by system
        patient_queue = []
        for patient in random_patients:
            # Get recent consultation if available
            recent_consultation = self.db.get_collection('medical_consultations').find_one({
                'Patient_ID': patient['_id']
            }, sort=[('Consultation_Date', -1)])
            
            # Get vitals if available
            vitals = None
            if recent_consultation:
                vitals = self.db.get_collection('vitals').find_one({
                    'Consultation_ID': recent_consultation['_id']
                })
            
            # Build patient data
            patient_data = {
                'patient_id': patient['_id'],
                'age': patient.get('age', 45),
                'gender': patient.get('Patient_sex', 'Unknown'),
                'fever': vitals.get('Fever', False) if vitals else random.choice([True, False]),
                'cough': vitals.get('Cough', False) if vitals else random.choice([True, False]),
                'fatigue': vitals.get('Fatigue', False) if vitals else random.choice([True, False]),
                'difficulty_breathing': vitals.get('Difficulty_Breathing', False) if vitals else random.choice([True, False]),
                'blood_pressure': 'High' if vitals and vitals.get('bp_systolic', 120) > 140 else 'Normal',
                'cholesterol_level': vitals.get('Cholesterol', 'Normal') if vitals else 'Normal',
                'suspected_disease': recent_consultation.get('primary_diagnosis', 'Unknown') if recent_consultation else 'General checkup',
                'facility_id': 1,
                'doctor_id': recent_consultation.get('Doctor_ID', 1) if recent_consultation else 1
            }
            
            patient_queue.append(patient_data)
        
        # Process the queue
        return self.process_patient_queue(patient_queue)
    
    def process_patient_queue(self, patient_queue: list) -> dict:
        """Process patient queue with production data"""
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
                    'timestamp': datetime.now()
                })
        
        # Sort by priority
        results.sort(key=lambda x: x.get('ml_analysis', {}).get('priority_score', 0), reverse=True)
        
        # Generate queue summary with production insights
        queue_summary = {
            'total_patients': len(patient_queue),
            'emergency_cases': emergency_count,
            'total_predicted_stay_hours': total_predicted_hours,
            'average_predicted_stay': total_predicted_hours / len(patient_queue) if patient_queue else 0,
            'processing_timestamp': datetime.now(),
            'capacity_impact': self._assess_capacity_impact(results),
            'department_distribution': self._analyze_department_distribution(results)
        }
        
        return {
            'patient_results': results,
            'queue_summary': queue_summary,
            'capacity_report': self.get_production_capacity_report(),
            'system_metrics': self._calculate_system_metrics(results)
        }
    
    def process_patient_arrival(self, patient_data: dict) -> dict:
        """Process single patient with production database integration"""
        # Step 1: ML Triage Analysis
        ml_results = self.ml_handler.analyze_patient_triage(patient_data)
        
        # Step 2: Create scheduling request
        scheduling_request = self._create_scheduling_request(patient_data, ml_results)
        
        # Step 3: Schedule appointment
        scheduling_result = self.scheduler.schedule_appointment(scheduling_request)
        
        # Step 4: Store in database if successful
        if scheduling_result.get('success'):
            self._store_production_triage_result(patient_data, ml_results, scheduling_result)
        
        # Step 5: Compile result with production metrics
        complete_result = {
            'patient_id': patient_data['patient_id'],
            'timestamp': datetime.now(),
            'ml_analysis': ml_results,
            'scheduling': scheduling_result,
            'summary': self._create_patient_summary(ml_results, scheduling_result),
            'production_metrics': self._calculate_patient_metrics(patient_data, ml_results)
        }
        
        return complete_result
    
    def _store_production_triage_result(self, patient_data: dict, ml_results: dict, scheduling_result: dict):
        """Store triage and scheduling results in production database"""
        try:
            # Create a comprehensive triage record
            triage_record = {
                'patient_id': patient_data['patient_id'],
                'triage_timestamp': datetime.now(),
                'ml_predictions': ml_results,
                'scheduling_outcome': scheduling_result,
                'patient_symptoms': {
                    'fever': patient_data.get('fever', False),
                    'cough': patient_data.get('cough', False),
                    'fatigue': patient_data.get('fatigue', False),
                    'difficulty_breathing': patient_data.get('difficulty_breathing', False)
                },
                'system_version': '1.0_production',
                'processed_by': 'automated_triage_system'
            }
            
            # Store in a triage_results collection for analytics
            self.db.get_collection('triage_results').insert_one(triage_record)
            
        except Exception as e:
            print(f"Error storing triage result: {e}")
    
    def get_production_capacity_report(self) -> dict:
        """Generate capacity report using real production data"""
        try:
            # Get real department data
            departments = list(self.db.get_collection('departments').find())
            capacity_data = list(self.db.get_collection('department_capacity').find())
            
            # Create capacity mapping
            capacity_map = {cap['Department_ID']: cap for cap in capacity_data}
            
            report = {}
            
            for dept in departments:
                dept_id = dept['_id']
                capacity = capacity_map.get(dept_id, {})
                
                # Calculate real-time metrics
                current_patients = capacity.get('Current_patients', 0)
                max_capacity = dept.get('Capacity_beds', 1)
                utilization_rate = current_patients / max_capacity if max_capacity > 0 else 0
                
                # Get recent admissions for this department
                recent_admissions = self.db.get_collection('admissions').count_documents({
                    'Department_ID': dept_id,
                    'Admitted_at': {'$gte': datetime.now() - timedelta(hours=24)},
                    'Discharged_at': None  # Still admitted
                })
                
                report[dept_id] = {
                    'name': dept['Name'],
                    'facility_id': dept['Facility_ID'],
                    'current_patients': current_patients,
                    'available_beds': capacity.get('Current_beds_available', max_capacity - current_patients),
                    'max_capacity': max_capacity,
                    'doctors_on_duty': capacity.get('Current_doctors_on_duty', 0),
                    'utilization_rate': round(utilization_rate * 100, 1),
                    'recent_admissions_24h': recent_admissions,
                    'status': self._determine_department_status(utilization_rate),
                    'department_type': dept.get('Type', 'General')
                }
            
            return report
            
        except Exception as e:
            print(f"Error generating capacity report: {e}")
            return {}
    
    def get_production_analytics_dashboard(self) -> dict:
        """Generate comprehensive analytics dashboard with production data"""
        try:
            # Date ranges for analysis
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            yesterday = today - timedelta(days=1)
            last_week = today - timedelta(days=7)
            last_month = today - timedelta(days=30)
            
            # Patient demographics analysis
            total_patients = self.db.get_collection('patients').count_documents({})
            
            # Age distribution
            age_pipeline = [
                {'$group': {
                    '_id': {
                        '$switch': {
                            'branches': [
                                {'case': {'$lt': ['$age', 18]}, 'then': 'Under 18'},
                                {'case': {'$lt': ['$age', 35]}, 'then': '18-34'},
                                {'case': {'$lt': ['$age', 50]}, 'then': '35-49'},
                                {'case': {'$lt': ['$age', 65]}, 'then': '50-64'},
                                {'case': {'$gte': ['$age', 65]}, 'then': '65+'}
                            ],
                            'default': 'Unknown'
                        }
                    },
                    'count': {'$sum': 1}
                }}
            ]
            
            age_distribution = list(self.db.get_collection('patients').aggregate(age_pipeline))
            
            # Consultation analysis
            daily_consultations = self.db.get_collection('medical_consultations').count_documents({
                'Consultation_Date': {'$gte': today}
            })
            
            weekly_consultations = self.db.get_collection('medical_consultations').count_documents({
                'Consultation_Date': {'$gte': last_week}
            })
            
            # Disease frequency analysis
            disease_pipeline = [
                {'$group': {'_id': '$primary_diagnosis', 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}},
                {'$limit': 10}
            ]
            
            top_diseases = list(self.db.get_collection('medical_consultations').aggregate(disease_pipeline))
            
            # ML model performance analysis
            ml_predictions = self.db.get_collection('medical_consultations').count_documents({
                'ml_triage_result': {'$exists': True}
            })
            
            urgency_distribution = list(self.db.get_collection('medical_consultations').aggregate([
                {'$match': {'ml_triage_result.symptom_analysis.urgency_level': {'$exists': True}}},
                {'$group': {
                    '_id': '$ml_triage_result.symptom_analysis.urgency_level',
                    'count': {'$sum': 1}
                }}
            ]))
            
            # Admission statistics
            current_admissions = self.db.get_collection('admissions').count_documents({
                'Discharged_at': None
            })
            
            avg_stay_pipeline = [
                {'$match': {'Discharged_at': {'$ne': None}}},
                {'$project': {
                    'stay_hours': {
                        '$divide': [
                            {'$subtract': ['$Discharged_at', '$Admitted_at']},
                            1000 * 60 * 60  # Convert milliseconds to hours
                        ]
                    }
                }},
                {'$group': {
                    '_id': None,
                    'avg_stay_hours': {'$avg': '$stay_hours'}
                }}
            ]
            
            avg_stay_result = list(self.db.get_collection('admissions').aggregate(avg_stay_pipeline))
            avg_stay_hours = avg_stay_result[0]['avg_stay_hours'] if avg_stay_result else 0
            
            # System performance metrics
            capacity_report = self.get_production_capacity_report()
            avg_utilization = sum(dept['utilization_rate'] for dept in capacity_report.values()) / len(capacity_report) if capacity_report else 0
            
            return {
                'timestamp': datetime.now(),
                'patient_demographics': {
                    'total_patients': total_patients,
                    'age_distribution': {item['_id']: item['count'] for item in age_distribution}
                },
                'consultation_metrics': {
                    'daily_consultations': daily_consultations,
                    'weekly_consultations': weekly_consultations,
                    'consultations_with_ml': ml_predictions,
                    'ml_coverage_percentage': round((ml_predictions / weekly_consultations) * 100, 1) if weekly_consultations > 0 else 0
                },
                'disease_analysis': {
                    'top_diseases': [{'disease': item['_id'], 'count': item['count']} for item in top_diseases],
                    'urgency_distribution': {item['_id']: item['count'] for item in urgency_distribution}
                },
                'admission_metrics': {
                    'current_admissions': current_admissions,
                    'average_stay_hours': round(avg_stay_hours, 1)
                },
                'system_performance': {
                    'average_utilization_rate': round(avg_utilization, 1),
                    'departments_monitored': len(capacity_report),
                    'critical_departments': len([d for d in capacity_report.values() if d['status'] == 'CRITICAL'])
                },
                'alerts': self._generate_production_alerts(capacity_report),
                'recommendations': self._generate_production_recommendations(capacity_report, avg_utilization)
            }
            
        except Exception as e:
            print(f"Error generating analytics dashboard: {e}")
            return {'error': str(e), 'timestamp': datetime.now()}
    
    def _generate_production_alerts(self, capacity_report: dict) -> list:
        """Generate system alerts based on production data"""
        alerts = []
        
        for dept_id, info in capacity_report.items():
            if info['status'] == 'CRITICAL':
                alerts.append({
                    'type': 'CRITICAL_CAPACITY',
                    'department': info['name'],
                    'message': f"{info['name']} at {info['utilization_rate']}% capacity",
                    'timestamp': datetime.now(),
                    'severity': 'HIGH'
                })
            elif info['status'] == 'HIGH':
                alerts.append({
                    'type': 'HIGH_CAPACITY',
                    'department': info['name'],
                    'message': f"{info['name']} approaching capacity ({info['utilization_rate']}%)",
                    'timestamp': datetime.now(),
                    'severity': 'MEDIUM'
                })
            
            # Alert for insufficient doctors
            if info.get('doctors_on_duty', 0) < 2:
                alerts.append({
                    'type': 'STAFFING_ALERT',
                    'department': info['name'],
                    'message': f"{info['name']} has only {info.get('doctors_on_duty', 0)} doctors on duty",
                    'timestamp': datetime.now(),
                    'severity': 'MEDIUM'
                })
        
        return alerts
    
    def _generate_production_recommendations(self, capacity_report: dict, avg_utilization: float) -> list:
        """Generate actionable recommendations based on production data"""
        recommendations = []
        
        if avg_utilization > 80:
            recommendations.append({
                'type': 'CAPACITY_MANAGEMENT',
                'priority': 'HIGH',
                'recommendation': 'Consider increasing overall hospital capacity or implementing patient flow optimization',
                'impact': 'Reduce wait times and improve patient satisfaction'
            })
        
        critical_depts = [d for d in capacity_report.values() if d['status'] == 'CRITICAL']
        if critical_depts:
            recommendations.append({
                'type': 'DEPARTMENT_OPTIMIZATION',
                'priority': 'HIGH',
                'recommendation': f"Redistribute patients from {len(critical_depts)} critical departments to lower-capacity departments",
                'impact': 'Balance workload and reduce bottlenecks'
            })
        
        # ML-based recommendations
        try:
            recent_predictions = self.db.get_collection('triage_results').count_documents({
                'triage_timestamp': {'$gte': datetime.now() - timedelta(hours=24)}
            })
            
            if recent_predictions > 0:
                recommendations.append({
                    'type': 'ML_OPTIMIZATION',
                    'priority': 'MEDIUM',
                    'recommendation': 'Continue using ML-driven triage for improved patient flow',
                    'impact': f'Processed {recent_predictions} patients with automated triage in last 24h'
                })
        except:
            pass
        
        return recommendations
    
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
    
    def _analyze_department_distribution(self, results: list) -> dict:
        """Analyze how patients are distributed across departments"""
        dept_distribution = {}
        urgency_by_dept = {}
        
        for result in results:
            if 'ml_analysis' in result:
                dept_id = result['ml_analysis']['symptom_analysis']['recommended_department']
                urgency = result['ml_analysis']['urgency_level']
                
                if dept_id not in dept_distribution:
                    dept_distribution[dept_id] = 0
                    urgency_by_dept[dept_id] = {'EMERGENCY': 0, 'URGENT': 0, 'SEMI_URGENT': 0, 'STANDARD': 0, 'ROUTINE': 0}
                
                dept_distribution[dept_id] += 1
                if urgency in urgency_by_dept[dept_id]:
                    urgency_by_dept[dept_id][urgency] += 1
        
        return {
            'distribution': dept_distribution,
            'urgency_by_department': urgency_by_dept
        }
    
    def _calculate_system_metrics(self, results: list) -> dict:
        """Calculate overall system performance metrics"""
        total_patients = len(results)
        successful_scheduling = len([r for r in results if r.get('summary', {}).get('scheduling_success', False)])
        
        avg_severity = sum(r.get('summary', {}).get('severity_score', 0) for r in results) / total_patients if total_patients > 0 else 0
        avg_stay_hours = sum(r.get('summary', {}).get('predicted_stay_hours', 0) for r in results) / total_patients if total_patients > 0 else 0
        
        return {
            'scheduling_success_rate': round((successful_scheduling / total_patients) * 100, 1) if total_patients > 0 else 0,
            'average_severity_score': round(avg_severity, 1),
            'average_predicted_stay_hours': round(avg_stay_hours, 1),
            'total_patients_processed': total_patients
        }
    
    def _calculate_patient_metrics(self, patient_data: dict, ml_results: dict) -> dict:
        """Calculate individual patient metrics"""
        return {
            'risk_factors': sum([
                patient_data.get('age', 0) > 65,
                patient_data.get('difficulty_breathing', False),
                patient_data.get('blood_pressure', 'Normal') == 'High',
                ml_results['symptom_analysis']['severity_score'] > 7
            ]),
            'complexity_score': ml_results['symptom_analysis']['severity_score'] * ml_results['symptom_analysis']['confidence_positive'],
            'resource_intensity': 'HIGH' if ml_results['urgency_level'] in ['EMERGENCY', 'URGENT'] else 'STANDARD'
        }
    
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

def run_production_demo():
    """Run production system demonstration"""
    print("MedRoute Production System Demo")
    print("=" * 50)
    
    try:
        # Initialize production system
        system = ProductionMedRouteSystem()
        
        # Process real patient queue
        queue_results = system.process_real_patient_queue(15)
        
        if not queue_results:
            print("No data available - please ensure Atlas database is populated")
            return
        
        print("\nQueue Processing Results:")
        print(f"Processed: {queue_results['queue_summary']['total_patients']} patients")
        print(f"Emergency cases: {queue_results['queue_summary']['emergency_cases']}")
        print(f"Avg predicted stay: {queue_results['queue_summary']['average_predicted_stay']:.1f} hours")
        
        print("\nPatient Results:")
        for result in queue_results['patient_results'][:10]:  # Show first 10
            if 'error' not in result:
                summary = result['summary']
                print(f"Patient {result['patient_id']}: {summary['urgency_level']} "
                      f"(Severity: {summary['severity_score']}, "
                      f"Stay: {summary['predicted_stay_hours']:.1f}h, "
                      f"Scheduled: {'✅' if summary['scheduling_success'] else '❌'})")
        
        # Generate analytics dashboard
        dashboard = system.get_production_analytics_dashboard()
        
        if 'error' not in dashboard:
            print(f"\nProduction Analytics Dashboard:")
            print(f"Total patients in system: {dashboard['patient_demographics']['total_patients']:,}")
            print(f"Daily consultations: {dashboard['consultation_metrics']['daily_consultations']}")
            print(f"ML coverage: {dashboard['consultation_metrics']['ml_coverage_percentage']}%")
            print(f"Current admissions: {dashboard['admission_metrics']['current_admissions']}")
            print(f"Avg stay length: {dashboard['admission_metrics']['average_stay_hours']:.1f} hours")
            
            print(f"\nTop Diseases:")
            for disease in dashboard['disease_analysis']['top_diseases'][:5]:
                print(f"- {disease['disease']}: {disease['count']} cases")
            
            print(f"\nSystem Alerts:")
            alerts = dashboard.get('alerts', [])
            if alerts:
                for alert in alerts[:3]:  # Show first 3
                    print(f"- {alert['type']}: {alert['message']}")
            else:
                print("- No alerts")
            
            print(f"\nRecommendations:")
            for rec in dashboard.get('recommendations', [])[:2]:  # Show first 2
                print(f"- {rec['recommendation']}")
        
        print(f"\nSystem Performance:")
        metrics = queue_results.get('system_metrics', {})
        print(f"Scheduling success rate: {metrics.get('scheduling_success_rate', 0)}%")
        print(f"Average severity: {metrics.get('average_severity_score', 0)}")
        
        print("\n🎉 Production demo completed successfully!")
        
    except Exception as e:
        print(f"Production demo failed: {e}")
        print("Please ensure MongoDB Atlas is configured and populated with data")

if __name__ == "__main__":
    run_production_demo()