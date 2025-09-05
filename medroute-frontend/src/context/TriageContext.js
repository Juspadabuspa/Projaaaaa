// frontend/src/context/TriageContext.js
import React, { createContext, useContext, useState } from 'react';
import { triageService } from '../services/api';

const TriageContext = createContext();

export const useTriageContext = () => {
  const context = useContext(TriageContext);
  if (!context) {
    throw new Error('useTriageContext must be used within a TriageProvider');
  }
  return context;
};

export const TriageProvider = ({ children }) => {
  const [triageResult, setTriageResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitTriage = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields before sending to API
      const requiredFields = ['symptoms', 'severity', 'age', 'gender'];
      for (const field of requiredFields) {
        if (!formData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Submit to API
      const result = await triageService.submitAssessment(formData);
      
      setTriageResult(result);
      return result;
    } catch (error) {
      console.error('Error submitting triage assessment:', error);
      
      // Set user-friendly error message
      if (error.response?.status === 400) {
        setError(error.response.data.error || 'Please check your input and try again.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (error.message.includes('required')) {
        setError(error.message);
      } else {
        setError('Failed to complete triage assessment. Please try again.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTriageResult(null);
    setError(null);
  };

  const clearError = () => setError(null);

  const value = {
    triageResult,
    loading,
    error,
    submitTriage,
    clearResults,
    clearError
  };

  return (
    <TriageContext.Provider value={value}>
      {children}
    </TriageContext.Provider>
  );
};

export { TriageContext };