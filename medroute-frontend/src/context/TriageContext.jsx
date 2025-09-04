// src/context/TriageContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { performTriageAnalysis } from '../services/triageService';

const TriageContext = createContext();

export const useTriage = () => {
  const context = useContext(TriageContext);
  if (!context) {
    throw new Error('useTriage must be used within a TriageProvider');
  }
  return context;
};

export const TriageProvider = ({ children }) => {
  const [triageResult, setTriageResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [triageHistory, setTriageHistory] = useState([]);

  // Submit triage form for analysis
  const submitTriage = async (triageData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate form data before submission
      const validationError = validateTriageData(triageData);
      if (validationError) {
        throw new Error(validationError);
      }

      const result = await performTriageAnalysis(triageData);
      setTriageResult(result);
      
      // Add to history
      setTriageHistory(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
      
      return result;
    } catch (err) {
      console.error('Triage analysis failed:', err);
      setError(err.message || 'Failed to analyze triage data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear current results and start fresh
  const clearResults = () => {
    setTriageResult(null);
    setError(null);
  };

  // Clear all history
  const clearHistory = () => {
    setTriageHistory([]);
  };

  // Get triage result by patient ID
  const getTriageResultById = (patientId) => {
    return triageHistory.find(result => result.patient_id === patientId);
  };

  // Update triage result (for follow-ups or corrections)
  const updateTriageResult = (patientId, updates) => {
    setTriageHistory(prev => 
      prev.map(result => 
        result.patient_id === patientId 
          ? { ...result, ...updates, updated_at: new Date() }
          : result
      )
    );

    // Update current result if it matches
    if (triageResult && triageResult.patient_id === patientId) {
      setTriageResult(prev => ({ ...prev, ...updates, updated_at: new Date() }));
    }
  };

  const value = {
    // State
    triageResult,
    loading,
    error,
    triageHistory,
    
    // Actions
    submitTriage,
    clearResults,
    clearHistory,
    getTriageResultById,
    updateTriageResult
  };

  return (
    <TriageContext.Provider value={value}>
      {children}
    </TriageContext.Provider>
  );
};

// Helper function to validate triage data
const validateTriageData = (data) => {
  if (!data.age || data.age < 0 || data.age > 150) {
    return 'Please enter a valid age between 0 and 150';
  }
  
  if (!data.gender) {
    return 'Please select a gender';
  }

  // Check if at least one symptom is selected for non-routine visits
  const hasSymptoms = data.fever || data.cough || data.fatigue || data.difficulty_breathing;
  const hasVitalConcerns = data.blood_pressure !== 'Normal' || data.cholesterol_level !== 'Normal';
  const hasAdditionalSymptoms = data.additional_symptoms && data.additional_symptoms.trim().length > 0;

  if (!hasSymptoms && !hasVitalConcerns && !hasAdditionalSymptoms) {
    return 'Please indicate at least one symptom or concern to proceed with triage';
  }

  return null; // No validation errors
};