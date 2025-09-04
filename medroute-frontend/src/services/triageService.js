/* eslint-disable default-case */
// src/services/triageService.js

// Simulate API delay for realistic experience
const API_DELAY = 2000;

// Mock ML analysis function
export const performTriageAnalysis = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const analysis = analyzeSymptoms(data);
        const result = {
          patient_id: generatePatientId(),
          timestamp: new Date(),
          ml_analysis: analysis,
          scheduling: generateScheduling(analysis),
          input_data: data
        };
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, API_DELAY);
  });
};

// Core ML analysis algorithm
const analyzeSymptoms = (data) => {
  let severity_score = 5; // Base severity
  let urgency_level = 'STANDARD';
  let recommended_department = 'general';
  let predicted_stay_hours = 2;
  let priority_score = 50;
  let confidence = 0.75;

  // Age-based risk factors
  if (data.age > 65) {
    severity_score += 2;
    confidence += 0.1;
  } else if (data.age > 45) {
    severity_score += 1;
  } else if (data.age < 2) {
    severity_score += 3;
    recommended_department = 'pediatrics';
    confidence += 0.15;
  } else if (data.age < 18) {
    recommended_department = 'pediatrics';
  }

  // Critical symptom analysis
  if (data.difficulty_breathing) {
    severity_score += 4;
    urgency_level = 'EMERGENCY';
    recommended_department = 'emergency';
    priority_score = 95;
    predicted_stay_hours = 6;
    confidence = 0.95;
  }

  // Respiratory symptoms combination
  if (data.fever && data.cough) {
    severity_score += 2;
    if (data.fatigue) {
      severity_score += 1;
      urgency_level = urgency_level === 'STANDARD' ? 'URGENT' : urgency_level;
      priority_score = Math.max(priority_score, 75);
      predicted_stay_hours = 4;
    }
  }

  // Individual symptoms
  if (data.fever) {
    severity_score += 1;
    if (urgency_level === 'STANDARD') {
      urgency_level = 'SEMI_URGENT';
      priority_score = Math.max(priority_score, 65);
    }
  }

  if (data.cough && !data.fever) {
    severity_score += 0.5;
    priority_score = Math.max(priority_score, 55);
  }

  if (data.fatigue) {
    severity_score += 0.5;
  }

  // Cardiovascular risk factors
  if (data.blood_pressure === 'High') {
    severity_score += 2;
    recommended_department = data.age > 40 ? 'cardiology' : 'general';
    if (data.age > 60) {
      urgency_level = urgency_level === 'STANDARD' ? 'URGENT' : urgency_level;
      priority_score = Math.max(priority_score, 70);
    }
  } else if (data.blood_pressure === 'Low') {
    severity_score += 1;
    if (data.fatigue) {
      urgency_level = urgency_level === 'STANDARD' ? 'SEMI_URGENT' : urgency_level;
    }
  }

  if (data.cholesterol_level === 'High') {
    severity_score += 1;
    if (data.age > 50) {
      recommended_department = 'cardiology';
    }
  }

  // Additional symptoms processing
  if (data.additional_symptoms) {
    const additionalSymptoms = data.additional_symptoms.toLowerCase();
    
    // Check for emergency keywords
    const emergencyKeywords = ['chest pain', 'heart attack', 'stroke', 'bleeding', 'unconscious'];
    if (emergencyKeywords.some(keyword => additionalSymptoms.includes(keyword))) {
      severity_score += 5;
      urgency_level = 'EMERGENCY';
      recommended_department = 'emergency';
      priority_score = 98;
      predicted_stay_hours = 8;
      confidence = 0.9;
    }

    // Check for urgent keywords
    const urgentKeywords = ['severe pain', 'vomiting', 'dizziness', 'confusion'];
    if (urgentKeywords.some(keyword => additionalSymptoms.includes(keyword))) {
      severity_score += 2;
      if (urgency_level === 'STANDARD' || urgency_level === 'SEMI_URGENT') {
        urgency_level = 'URGENT';
        priority_score = Math.max(priority_score, 80);
      }
    }
  }

  // Clamp severity score and adjust confidence
  severity_score = Math.min(10, Math.max(1, Math.round(severity_score * 10) / 10));
  confidence = Math.min(0.99, Math.max(0.5, confidence));

  // Generate recommendations based on analysis
  const recommendations = generateRecommendations(urgency_level, severity_score, data);

  return {
    urgency_level,
    priority_score: Math.round(priority_score),
    symptom_analysis: {
      severity_score,
      recommended_department,
      key_symptoms: extractKeySymptoms(data),
      risk_factors: extractRiskFactors(data)
    },
    stay_prediction: {
      predicted_stay_hours,
      confidence: Math.round(confidence * 100) / 100
    },
    recommendations,
    analysis_confidence: confidence
  };
};

// Generate scheduling information
const generateScheduling = (analysis) => {
  const now = new Date();
  let scheduledTime = new Date(now);
  let estimatedWait = 45; // default wait time in minutes

  switch (analysis.urgency_level) {
    case 'EMERGENCY':
      scheduledTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
      estimatedWait = 5;
      break;
    case 'URGENT':
      scheduledTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
      estimatedWait = 30;
      break;
    case 'SEMI_URGENT':
      scheduledTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      estimatedWait = 60;
      break;
    case 'STANDARD':
      scheduledTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
      estimatedWait = 120;
      break;
    case 'ROUTINE':
      scheduledTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next day
      estimatedWait = 1440;
      break;
  }

  return {
    success: true,
    scheduled_time: scheduledTime,
    assigned_doctor_id: `DR${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
    estimated_wait_time: estimatedWait,
    department: analysis.symptom_analysis.recommended_department
  };
};

// Generate patient ID
const generatePatientId = () => {
  return `P${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
};

// Extract key symptoms from form data
const extractKeySymptoms = (data) => {
  const symptoms = [];
  if (data.fever) symptoms.push('fever');
  if (data.cough) symptoms.push('cough');
  if (data.fatigue) symptoms.push('fatigue');
  if (data.difficulty_breathing) symptoms.push('difficulty_breathing');
  if (data.blood_pressure !== 'Normal') symptoms.push(`${data.blood_pressure.toLowerCase()}_blood_pressure`);
  if (data.cholesterol_level !== 'Normal') symptoms.push(`${data.cholesterol_level.toLowerCase()}_cholesterol`);
  
  return symptoms;
};

// Extract risk factors
const extractRiskFactors = (data) => {
  const riskFactors = [];
  
  if (data.age > 65) riskFactors.push('elderly');
  if (data.age < 2) riskFactors.push('infant');
  if (data.blood_pressure === 'High') riskFactors.push('hypertension');
  if (data.cholesterol_level === 'High') riskFactors.push('high_cholesterol');
  
  return riskFactors;
};

// Generate contextual recommendations
const generateRecommendations = (urgencyLevel, severityScore, data) => {
  const recommendations = [];
  
  switch (urgencyLevel) {
    case 'EMERGENCY':
      recommendations.push('Proceed to Emergency Department immediately');
      recommendations.push('Do not drive yourself - call 911 or have someone drive you');
      break;
    case 'URGENT':
      recommendations.push('Schedule appointment within 24 hours');
      recommendations.push('Monitor symptoms closely and return if they worsen');
      break;
    case 'SEMI_URGENT':
      recommendations.push('Schedule appointment within 2-3 days');
      recommendations.push('Continue current medications as prescribed');
      break;
    case 'STANDARD':
      recommendations.push('Schedule routine appointment within 3-7 days');
      recommendations.push('Rest and stay hydrated');
      break;
    case 'ROUTINE':
      recommendations.push('Schedule routine check-up within 1-2 weeks');
      break;
  }

  // Add specific recommendations based on symptoms
  if (data.fever) {
    recommendations.push('Monitor temperature regularly and stay hydrated');
  }
  
  if (data.cough) {
    recommendations.push('Avoid close contact with others to prevent spread');
  }
  
  if (data.difficulty_breathing) {
    recommendations.push('Sit upright and try to remain calm');
  }
  
  if (data.blood_pressure === 'High') {
    recommendations.push('Limit sodium intake and monitor blood pressure daily');
  }

  return recommendations;
};