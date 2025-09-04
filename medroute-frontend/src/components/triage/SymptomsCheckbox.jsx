// src/components/triage/SymptomsCheckbox.jsx
import React from 'react';
import { Thermometer, Volume2, Battery, Wind } from 'lucide-react';

const SYMPTOMS = [
  { 
    key: 'fever', 
    label: 'Fever', 
    description: 'Body temperature above normal',
    icon: Thermometer,
    severity: 'moderate'
  },
  { 
    key: 'cough', 
    label: 'Cough', 
    description: 'Dry or wet cough',
    icon: Volume2,
    severity: 'mild'
  },
  { 
    key: 'fatigue', 
    label: 'Fatigue', 
    description: 'Unusual tiredness or weakness',
    icon: Battery,
    severity: 'mild'
  },
  { 
    key: 'difficulty_breathing', 
    label: 'Difficulty Breathing', 
    description: 'Shortness of breath or labored breathing',
    icon: Wind,
    severity: 'high'
  }
];

export const SymptomsCheckbox = ({ symptoms, onChange }) => {
  const handleSymptomChange = (symptomKey, checked) => {
    onChange({
      ...symptoms,
      [symptomKey]: checked
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'moderate':
        return 'border-orange-200 bg-orange-50 hover:bg-orange-100';
      case 'mild':
        return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getSelectedColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-100';
      case 'moderate':
        return 'border-orange-500 bg-orange-100';
      case 'mild':
        return 'border-yellow-500 bg-yellow-100';
      default:
        return 'border-blue-500 bg-blue-100';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Symptoms</h3>
      <p className="text-sm text-gray-600 mb-6">
        Select all symptoms you are currently experiencing. This helps us determine the urgency of your condition.
      </p>
      
      <div className="grid md:grid-cols-2 gap-4">
        {SYMPTOMS.map(({ key, label, description, icon: IconComponent, severity }) => {
          const isSelected = symptoms[key];
          return (
            <label 
              key={key} 
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? getSelectedColor(severity)
                  : getSeverityColor(severity)
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleSymptomChange(key, e.target.checked)}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center mb-1">
                  <IconComponent className={`w-5 h-5 mr-2 ${
                    severity === 'high' ? 'text-red-600' :
                    severity === 'moderate' ? 'text-orange-600' :
                    severity === 'mild' ? 'text-yellow-600' : 'text-gray-600'
                  }`} />
                  <span className="font-medium text-gray-900">{label}</span>
                  {severity === 'high' && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Help text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 text-sm text-blue-700">
            <p className="font-medium">Helpful Tips:</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Select all symptoms, even if mild</li>
              <li>Consider symptoms from the last 24-48 hours</li>
              <li>Don't worry if you're unsure - our AI will help assess</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selected symptoms summary */}
      {Object.values(symptoms).some(Boolean) && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-1">Selected Symptoms:</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.filter(symptom => symptoms[symptom.key]).map(symptom => (
              <span key={symptom.key} className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {symptom.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};