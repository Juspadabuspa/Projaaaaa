// src/components/triage/TriageForm.jsx
import React, { useState } from 'react';
import { Brain, AlertCircle } from 'lucide-react';
import { PatientInfoFields } from './PatientInfoFields';
import { SymptomsCheckbox } from './SymptomsCheckbox';
import { VitalSignsFields } from './VitalSignsFields';
import { useTriage } from '../../context/TriageContext';

export const TriageForm = () => {
  const { submitTriage, loading } = useTriage();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    fever: false,
    cough: false,
    fatigue: false,
    difficulty_breathing: false,
    blood_pressure: 'Normal',
    cholesterol_level: 'Normal',
    additional_symptoms: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleSubmit = async () => {
    const errors = validateForm(formData);
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        await submitTriage(formData);
      } catch (error) {
        console.error('Submission failed:', error);
      }
    } else {
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-300');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.age || data.age < 0 || data.age > 150) {
      errors.age = 'Please enter a valid age between 0 and 150';
    }

    if (!data.gender) {
      errors.gender = 'Please select a gender';
    }

    // Check if user has provided some health information
    const hasSymptoms = data.fever || data.cough || data.fatigue || data.difficulty_breathing;
    const hasVitalConcerns = data.blood_pressure !== 'Normal' || data.cholesterol_level !== 'Normal';
    const hasAdditionalSymptoms = data.additional_symptoms && data.additional_symptoms.trim().length > 0;

    if (!hasSymptoms && !hasVitalConcerns && !hasAdditionalSymptoms) {
      errors.general = 'Please indicate at least one symptom or concern to proceed with triage';
    }

    return errors;
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return formData.age && formData.gender;
      case 2:
        return true; // Symptoms are optional
      case 3:
        return true; // Vital signs have defaults
      case 4:
        return true; // Additional symptoms are optional
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Assessment Progress</span>
        <span className="text-sm text-gray-600">{currentStep} of {totalSteps}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <PatientInfoFields 
                data={formData} 
                onChange={setFormData}
                errors={validationErrors}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <SymptomsCheckbox 
              symptoms={formData}
              onChange={setFormData}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <VitalSignsFields 
              data={formData}
              onChange={setFormData}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Symptoms or Concerns
              </label>
              <textarea
                value={formData.additional_symptoms}
                onChange={(e) => setFormData({...formData, additional_symptoms: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                placeholder="Describe any other symptoms, pain levels, duration, or concerns you may have..."
              />
              <p className="text-xs text-gray-500 mt-2">
                This information helps us provide more accurate recommendations.
              </p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Assessment Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Age:</strong> {formData.age}</p>
                <p><strong>Gender:</strong> {formData.gender}</p>
                {(formData.fever || formData.cough || formData.fatigue || formData.difficulty_breathing) && (
                  <p><strong>Symptoms:</strong> {[
                    formData.fever && 'Fever',
                    formData.cough && 'Cough', 
                    formData.fatigue && 'Fatigue',
                    formData.difficulty_breathing && 'Difficulty Breathing'
                  ].filter(Boolean).join(', ')}</p>
                )}
                {formData.blood_pressure !== 'Normal' && (
                  <p><strong>Blood Pressure:</strong> {formData.blood_pressure}</p>
                )}
                {formData.cholesterol_level !== 'Normal' && (
                  <p><strong>Cholesterol:</strong> {formData.cholesterol_level}</p>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderProgressBar()}

      {/* General validation error */}
      {validationErrors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
            <div className="text-sm text-red-700">{validationErrors.general}</div>
          </div>
        </div>
      )}

      {renderCurrentStep()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={nextStep}
            disabled={!isStepValid(currentStep)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Get AI Triage Results</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};