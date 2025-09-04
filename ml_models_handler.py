"""
ML Models Handler with Fallback Logic
Handles missing model files gracefully and provides mock predictions for testing
"""

import os
import json
import pickle
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

class MLModelsHandler:
    def __init__(self):
        self.symptom_model = None
        self.stay_length_model = None
        self.symptom_scaler = None
        self.stay_scaler = None
        self.models_loaded = False
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize ML models with fallback to mock predictions"""
        models_dir = "models"
        
        # Create models directory if it doesn't exist
        if not os.path.exists(models_dir):
            os.makedirs(models_dir)
            print(f"Created {models_dir} directory")
        
        # Try to load actual models
        model_files = {
            'symptom_model': 'models/symptom_catboost_model.pkl',
            'symptom_scaler': 'models/symptom_feature_scaler.pkl', 
            'stay_length_model': 'models/stay_length_model.pkl',
            'stay_scaler': 'models/stay_length_scaler.pkl'
        }
        
        missing_models = []
        for model_name, file_path in model_files.items():
            if os.path.exists(file_path):
                try:
                    import joblib
                    setattr(self, model_name, joblib.load(file_path))
                    print(f"Loaded {model_name}")
                except Exception as e:
                    print(f"Error loading {model_name}: {e}")
                    missing_models.append(model_name)
            else:
                missing_models.append(model_name)
        
        if missing_models:
            print(f"Missing models: {missing_models}")
            print("Using fallback mock predictions for testing")
            self._create_mock_models()
        else:
            self.models_loaded = True
            print("All ML models loaded successfully")
    
    def _create_mock_models(self):
        """Create mock models for testing without actual trained models"""
        print("Creating mock ML models for testing...")
        
        # Create mock symptom model
        class MockSymptomModel:
            def predict(self, X):
                predictions = []
                for features in X:
                    # Simple rule-based mock: if fever + difficulty_breathing -> positive
                    fever = features[8] if len(features) > 8 else 0
                    difficulty_breathing = features[11] if len(features) > 11 else 0
                    age = features[0] if len(features) > 0 else 45
                    
                    if fever and difficulty_breathing:
                        predictions.append(1)  # Positive
                    elif age > 65 and (fever or difficulty_breathing):
                        predictions.append(1)  # Positive for elderly with symptoms
                    else:
                        predictions.append(0)  # Negative
                
                return np.array(predictions)
            
            def predict_proba(self, X):
                predictions = self.predict(X)
                probabilities = []
                for pred in predictions:
                    if pred == 1:
                        probabilities.append([0.2, 0.8])  # High confidence positive
                    else:
                        probabilities.append([0.7, 0.3])  # Moderate confidence negative
                return np.array(probabilities)
        
        # Create mock stay length model
        class MockStayLengthModel:
            def predict(self, X):
                predictions = []
                for features in X:
                    age = features[0] if len(features) > 0 else 45
                    severity = features[2] if len(features) > 2 else 5
                    condition_positive = features[3] if len(features) > 3 else 0
                    difficulty_breathing = features[5] if len(features) > 5 else 0
                    
                    # Mock stay length calculation
                    base_hours = 4  # Base 4 hours
                    if condition_positive:
                        base_hours += severity * 3
                    if difficulty_breathing:
                        base_hours += 8
                    if age > 65:
                        base_hours += 6
                    
                    predictions.append(min(base_hours, 168))  # Max 1 week stay
                
                return np.array(predictions)
        
        # Create mock scaler
        class MockScaler:
            def transform(self, X):
                if isinstance(X[0], list):
                    return [[min(max(val/100, 0), 1) for val in row] for row in X]
                else:
                    return [min(max(val/100, 0), 1) for val in X]
        
        self.symptom_model = MockSymptomModel()
        self.stay_length_model = MockStayLengthModel()
        self.symptom_scaler = MockScaler()
        self.stay_scaler = MockScaler()
        
        print("Mock models created successfully")
    
    def analyze_patient_triage(self, patient_data: Dict) -> Dict:
        """Complete triage analysis with fallback logic"""
        try:
            # Step 1: Analyze symptoms
            symptom_analysis = self._analyze_symptoms(patient_data)
            
            # Step 2: Predict stay length
            stay_prediction = self._predict_stay_length(patient_data, symptom_analysis)
            
            # Step 3: Combine results
            triage_result = self._combine_ml_results(
                patient_data, symptom_analysis, stay_prediction
            )
            
            return triage_result
            
        except Exception as e:
            print(f"Error in triage analysis: {e}")
            return self._create_fallback_triage(patient_data)
    
    def _analyze_symptoms(self, patient_data: Dict) -> Dict:
        """Symptom analysis with real or mock model"""
        features = self._prepare_symptom_features(patient_data)
        
        # Normalize continuous features (first 4)
        continuous_features = features[:4]
        if self.symptom_scaler:
            continuous_features = self.symptom_scaler.transform([continuous_features])[0]
        
        # Combine with binary features
        final_features = list(continuous_features) + features[4:]
        
        # Make prediction
        prediction = self.symptom_model.predict([final_features])[0]
        prediction_proba = self.symptom_model.predict_proba([final_features])[0]
        
        return {
            'condition_positive': bool(prediction),
            'confidence_positive': float(prediction_proba[1]),
            'confidence_negative': float(prediction_proba[0]),
            'severity_score': self._calculate_severity_score(prediction_proba, patient_data),
            'primary_factors': self._get_primary_factors(patient_data),
            'recommended_department': self._map_to_department(patient_data),
            'urgency_level': self._determine_urgency(prediction_proba, patient_data),
            'model_type': 'real' if self.models_loaded else 'mock'
        }
    
    def _prepare_symptom_features(self, patient_data: Dict) -> List:
        """Prepare features for symptom model"""
        # Extract symptoms
        fever = 1 if patient_data.get('fever', False) else 0
        cough = 1 if patient_data.get('cough', False) else 0
        fatigue = 1 if patient_data.get('fatigue', False) else 0
        difficulty_breathing = 1 if patient_data.get('difficulty_breathing', False) else 0
        
        # Demographics
        age = patient_data.get('age', 45)
        gender_male = 1 if patient_data.get('gender', 'Female').lower() == 'male' else 0
        
        # Health indicators
        bp = patient_data.get('blood_pressure', 'Normal')
        bp_low = 1 if bp == 'Low' else 0
        bp_normal = 1 if bp == 'Normal' else 0
        
        cl = patient_data.get('cholesterol_level', 'Normal')
        cl_low = 1 if cl == 'Low' else 0
        cl_normal = 1 if cl == 'Normal' else 0
        
        # Engineered features
        fever_and_cough = int(fever and cough)
        fever_and_fatigue = int(fever and fatigue)
        fatigue_and_cough = int(fatigue and cough)
        fever_and_fatigue_and_cough = int(fever and fatigue and cough)
        
        # Disease frequency
        suspected_disease = patient_data.get('suspected_disease', 'Common Cold')
        disease_frequency = self._get_disease_frequency_score(suspected_disease)
        
        # Age groups
        age_group_adult = 1 if 18 <= age < 65 else 0
        age_group_elderly = 1 if age >= 65 else 0
        
        # Risk score
        risk_score = age * 0.1 + (10 if cl == 'High' else 0)
        age_squared = age ** 2
        
        return [
            age, disease_frequency, risk_score, age_squared,  # Continuous
            fever_and_cough, fever_and_fatigue, fatigue_and_cough,
            fever_and_fatigue_and_cough, fever, cough, fatigue,
            difficulty_breathing, bp_low, bp_normal, cl_low, cl_normal,
            gender_male, age_group_adult, age_group_elderly
        ]
    
    def _predict_stay_length(self, patient_data: Dict, symptom_analysis: Dict) -> Dict:
        """Stay length prediction with real or mock model"""
        stay_features = self._prepare_stay_length_features(patient_data, symptom_analysis)
        
        if self.stay_length_model:
            predicted_hours = self.stay_length_model.predict([stay_features])[0]
            
            return {
                'predicted_stay_hours': float(predicted_hours),
                'confidence_lower': float(predicted_hours * 0.8),
                'confidence_upper': float(predicted_hours * 1.2),
                'discharge_estimate': datetime.now() + timedelta(hours=predicted_hours),
                'capacity_impact': self._calculate_capacity_impact(predicted_hours),
                'model_type': 'real' if self.models_loaded else 'mock'
            }
        else:
            # Fallback estimation
            estimated_hours = self._estimate_stay_from_severity(symptom_analysis['severity_score'])
            return {
                'predicted_stay_hours': estimated_hours,
                'confidence_lower': estimated_hours * 0.7,
                'confidence_upper': estimated_hours * 1.3,
                'discharge_estimate': datetime.now() + timedelta(hours=estimated_hours),
                'capacity_impact': self._calculate_capacity_impact(estimated_hours),
                'model_type': 'fallback'
            }
    
    def _prepare_stay_length_features(self, patient_data: Dict, symptom_analysis: Dict) -> List:
        """Prepare features for stay length model"""
        return [
            patient_data.get('age', 45),
            1 if patient_data.get('gender', 'Female').lower() == 'male' else 0,
            symptom_analysis['severity_score'],
            int(symptom_analysis['condition_positive']),
            symptom_analysis['confidence_positive'],
            1 if patient_data.get('difficulty_breathing', False) else 0,
            1 if patient_data.get('fever', False) else 0,
            1 if patient_data.get('blood_pressure') == 'High' else 0,
            1 if patient_data.get('cholesterol_level') == 'High' else 0,
            patient_data.get('previous_admissions', 0)
        ]
    
    def _combine_ml_results(self, patient_data: Dict, symptom_analysis: Dict, 
                           stay_prediction: Dict) -> Dict:
        """Combine ML results for comprehensive triage"""
        priority_score = self._calculate_priority_score(symptom_analysis, stay_prediction)
        urgency_level = self._determine_final_urgency(symptom_analysis, patient_data)
        resource_needs = self._calculate_resource_requirements(
            symptom_analysis, stay_prediction, patient_data
        )
        
        return {
            'patient_id': patient_data.get('patient_id'),
            'triage_timestamp': datetime.now(),
            'symptom_analysis': symptom_analysis,
            'stay_prediction': stay_prediction,
            'priority_score': priority_score,
            'urgency_level': urgency_level,
            'resource_needs': resource_needs,
            'recommended_action': self._recommend_action(
                symptom_analysis, stay_prediction, urgency_level
            )
        }
    
    # Helper methods
    def _get_disease_frequency_score(self, disease: str) -> float:
        frequency_mapping = {
            'Asthma': 23/349, 'Stroke': 16/349, 'Osteoporosis': 14/349,
            'Hypertension': 10/349, 'Diabetes': 10/349, 'Migraine': 10/349,
            'Influenza': 8/349, 'Pneumonia': 8/349, 'Bronchitis': 8/349,
            'Common Cold': 6/349, 'Depression': 6/349
        }
        return frequency_mapping.get(disease, 1/349)
    
    def _calculate_severity_score(self, prediction_proba: List[float], 
                                 patient_data: Dict) -> int:
        base_severity = 5 if prediction_proba[1] > 0.5 else 3
        confidence = max(prediction_proba)
        if confidence > 0.9:
            base_severity += 2
        elif confidence > 0.8:
            base_severity += 1
        
        if patient_data.get('difficulty_breathing'):
            base_severity = min(base_severity + 3, 10)
        if patient_data.get('age', 0) >= 65:
            base_severity = min(base_severity + 1, 10)
        
        return max(1, min(base_severity, 10))
    
    def _determine_urgency(self, prediction_proba: List[float], patient_data: Dict) -> str:
        severity = self._calculate_severity_score(prediction_proba, patient_data)
        
        if severity >= 9:
            return "EMERGENCY"
        elif severity >= 7:
            return "URGENT"
        elif severity >= 5:
            return "SEMI_URGENT"
        elif severity >= 3:
            return "STANDARD"
        else:
            return "ROUTINE"
    
    def _map_to_department(self, patient_data: Dict) -> int:
        if patient_data.get('difficulty_breathing') and patient_data.get('fever'):
            return 1  # Emergency
        elif patient_data.get('age', 0) >= 65:
            return 2  # Internal Medicine
        else:
            return 5  # General Medicine
    
    def _get_primary_factors(self, patient_data: Dict) -> List[str]:
        factors = []
        if patient_data.get('fever'): factors.append('fever')
        if patient_data.get('difficulty_breathing'): factors.append('difficulty_breathing')
        if patient_data.get('age', 0) >= 65: factors.append('elderly_patient')
        return factors[:3]
    
    def _calculate_priority_score(self, symptom_analysis: Dict, stay_prediction: Dict) -> int:
        base_score = symptom_analysis['severity_score'] * 100
        if symptom_analysis['condition_positive']:
            base_score += 200
        base_score += int(symptom_analysis['confidence_positive'] * 100)
        return base_score
    
    def _determine_final_urgency(self, symptom_analysis: Dict, patient_data: Dict) -> str:
        return symptom_analysis['urgency_level']
    
    def _calculate_resource_requirements(self, symptom_analysis: Dict, 
                                       stay_prediction: Dict, patient_data: Dict) -> Dict:
        return {
            'bed_type': 'monitored' if symptom_analysis['severity_score'] >= 7 else 'standard',
            'special_equipment': ['oxygen'] if patient_data.get('difficulty_breathing') else [],
            'nursing_level': 'intensive' if symptom_analysis['severity_score'] >= 8 else 'standard'
        }
    
    def _recommend_action(self, symptom_analysis: Dict, stay_prediction: Dict, 
                         urgency_level: str) -> str:
        if urgency_level == 'EMERGENCY':
            return 'Immediate medical attention required'
        elif urgency_level == 'URGENT':
            return 'Schedule within 30 minutes'
        elif urgency_level == 'SEMI_URGENT':
            return 'Schedule within 2 hours'
        else:
            return 'Standard scheduling appropriate'
    
    def _calculate_capacity_impact(self, hours: float) -> str:
        if hours < 4:
            return 'low'
        elif hours < 24:
            return 'moderate'
        else:
            return 'high'
    
    def _estimate_stay_from_severity(self, severity: int) -> float:
        return severity * 3  # 3 hours per severity point
    
    def _create_fallback_triage(self, patient_data: Dict) -> Dict:
        """Create fallback triage result when everything fails"""
        return {
            'patient_id': patient_data.get('patient_id'),
            'triage_timestamp': datetime.now(),
            'symptom_analysis': {
                'condition_positive': True,
                'confidence_positive': 0.5,
                'severity_score': 5,
                'urgency_level': 'STANDARD',
                'recommended_department': 5,
                'model_type': 'fallback'
            },
            'stay_prediction': {
                'predicted_stay_hours': 12.0,
                'confidence_lower': 8.0,
                'confidence_upper': 16.0,
                'model_type': 'fallback'
            },
            'priority_score': 500,
            'urgency_level': 'STANDARD',
            'resource_needs': {'bed_type': 'standard'},
            'recommended_action': 'Standard care appropriate'
        }