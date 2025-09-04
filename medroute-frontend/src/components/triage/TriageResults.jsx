// src/components/triage/TriageResults.jsx
import React, { useState } from 'react';
import { 
  CheckCircle, 
  MapPin, 
  Calendar, 
  Shield, 
  Clock, 
  User, 
  AlertTriangle,
  Info,
  Download,
  Share
} from 'lucide-react';
import { getUrgencyColor } from '../../utils/styleHelpers';

export const TriageResults = ({ result, onNewAssessment, onNavigate }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getSeverityBarColor = (score) => {
    if (score <= 3) return 'bg-green-500';
    if (score <= 6) return 'bg-yellow-500';
    if (score <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getUrgencyDescription = (level) => {
    switch (level) {
      case 'EMERGENCY':
        return 'Immediate medical attention required';
      case 'URGENT':
        return 'Prompt medical attention needed';
      case 'SEMI_URGENT':
        return 'Medical attention needed soon';
      case 'STANDARD':
        return 'Standard medical consultation';
      case 'ROUTINE':
        return 'Routine medical check-up';
      default:
        return 'Medical assessment completed';
    }
  };

  const downloadResults = () => {
    const resultsData = {
      patient_id: result.patient_id,
      timestamp: result.timestamp,
      urgency_level: result.ml_analysis.urgency_level,
      severity_score: result.ml_analysis.symptom_analysis.severity_score,
      recommended_department: result.ml_analysis.symptom_analysis.recommended_department,
      scheduled_time: result.scheduling.scheduled_time,
      recommendations: result.ml_analysis.recommendations
    };
    
    const dataStr = JSON.stringify(resultsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `triage_results_${result.patient_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareResults = () => {
    const shareText = `MedRoute Triage Results
Patient ID: ${result.patient_id}
Urgency: ${result.ml_analysis.urgency_level}
Department: ${result.ml_analysis.symptom_analysis.recommended_department}
Scheduled: ${formatTime(result.scheduling.scheduled_time)}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'MedRoute Triage Results',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Patient ID and Timestamp */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Triage Analysis Complete</h3>
              <p className="text-sm text-gray-600">
                Patient ID: <span className="font-mono font-medium">{result.patient_id}</span> • 
                Assessed at {formatTime(result.timestamp)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={downloadResults}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Download Results"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={shareResults}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Share Results"
            >
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Priority Assessment */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
            Priority Assessment
          </h4>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-3 ${getUrgencyColor(result.ml_analysis.urgency_level)}`}>
            {result.ml_analysis.urgency_level}
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {getUrgencyDescription(result.ml_analysis.urgency_level)}
          </p>
          
          <div className="text-sm text-gray-600">
            Priority Score: <span className="font-semibold">{result.ml_analysis.priority_score}/100</span>
          </div>
          
          {result.ml_analysis.analysis_confidence && (
            <div className="text-xs text-gray-500 mt-2">
              Analysis Confidence: {Math.round(result.ml_analysis.analysis_confidence * 100)}%
            </div>
          )}
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            Severity Analysis
          </h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Severity Score</span>
                <span className="text-sm font-medium">
                  {result.ml_analysis.symptom_analysis.severity_score}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${getSeverityBarColor(result.ml_analysis.symptom_analysis.severity_score)}`}
                  style={{ width: `${(result.ml_analysis.symptom_analysis.severity_score / 10) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {result.ml_analysis.symptom_analysis.key_symptoms.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700">Key Symptoms:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.ml_analysis.symptom_analysis.key_symptoms.map((symptom, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {symptom.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Department */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <MapPin className="w-6 h-6 text-green-600 mr-2" />
          <h4 className="text-lg font-semibold text-green-800">Recommended Department</h4>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xl font-bold text-green-800 capitalize mb-2">
              {result.ml_analysis.symptom_analysis.recommended_department.replace('_', ' ')} Medicine
            </div>
            <div className="text-sm text-green-700">
              Best suited for your condition based on symptom analysis
            </div>
          </div>
          <div>
            <div className="text-sm text-green-700">
              <div className="flex items-center mb-1">
                <Clock className="w-4 h-4 mr-1" />
                Estimated stay: {result.ml_analysis.stay_prediction.predicted_stay_hours} hours
              </div>
              <div className="text-xs text-green-600">
                Prediction confidence: {Math.round(result.ml_analysis.stay_prediction.confidence * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduling Information */}
      {result.scheduling.success && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-6 h-6 text-blue-600 mr-2" />
            <h4 className="text-lg font-semibold text-blue-800">Appointment Scheduled</h4>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-blue-700 font-medium">Scheduled Time</div>
              <div className="text-lg font-semibold text-blue-900">
                {formatTime(result.scheduling.scheduled_time)}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-700 font-medium">Estimated Wait</div>
              <div className="text-lg font-semibold text-blue-900">
                {result.scheduling.estimated_wait_time} minutes
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-700 font-medium">Assigned Doctor</div>
              <div className="text-lg font-semibold text-blue-900 flex items-center">
                <User className="w-4 h-4 mr-1" />
                {result.scheduling.assigned_doctor_id}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center text-yellow-800">
          <Shield className="w-6 h-6 mr-2" />
          Medical Recommendations
        </h4>
        <ul className="space-y-3">
          {result.ml_analysis.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Additional Details Toggle */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900">Additional Details</span>
          <svg 
            className={`w-5 h-5 text-gray-500 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 text-sm text-gray-600">
            <div>
              <strong>Analysis Timestamp:</strong> {result.timestamp.toISOString()}
            </div>
            {result.ml_analysis.symptom_analysis.risk_factors && (
              <div>
                <strong>Risk Factors:</strong> {result.ml_analysis.symptom_analysis.risk_factors.join(', ')}
              </div>
            )}
            <div>
              <strong>Department:</strong> {result.ml_analysis.symptom_analysis.recommended_department}
            </div>
            <div>
              <strong>Priority Score Details:</strong> Based on age, symptoms, and vital signs
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          onClick={onNewAssessment}
          className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          New Assessment
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          View Hospital Status
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Return Home
        </button>
      </div>

      {/* Emergency Notice */}
      {result.ml_analysis.urgency_level === 'EMERGENCY' && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h5 className="font-semibold text-red-800">Emergency Care Required</h5>
              <p className="text-sm text-red-700 mt-1">
                Please proceed to the emergency department immediately or call 911 if you are unable to travel safely.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};