// src/components/pages/TriagePage.jsx
import React from 'react';
import { Stethoscope, Clock, Users, Shield } from 'lucide-react';
import { TriageForm } from '../triage/TriageForm';
import { TriageResults } from '../triage/TriageResults';
import { useTriage } from '../../context/TriageContext';

export const TriagePage = ({ onNavigate }) => {
  // eslint-disable-next-line no-unused-vars
  const { triageResult, loading, error, clearResults } = useTriage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-center mb-6">
          <Stethoscope className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Smart Triage Assessment</h2>
            <p className="text-gray-600 mt-1">Get personalized medical guidance in minutes</p>
          </div>
        </div>

        {/* Info Cards */}
        {!triageResult && (
          <div className="grid md:grid-cols-3 gap-4 mb-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-semibold text-sm text-gray-900">Quick Assessment</div>
                <div className="text-xs text-gray-600">Takes 2-3 minutes</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-semibold text-sm text-gray-900">AI-Powered</div>
                <div className="text-xs text-gray-600">94% accuracy rate</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-semibold text-sm text-gray-900">HIPAA Compliant</div>
                <div className="text-xs text-gray-600">Your data is secure</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Assessment Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-4">
                  <button
                    onClick={clearResults}
                    className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        {!triageResult ? (
          <TriageForm />
        ) : (
          <TriageResults 
            result={triageResult}
            onNewAssessment={clearResults}
            onNavigate={onNavigate}
          />
        )}
      </div>

      {/* Additional Information */}
      {!triageResult && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">During Assessment</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Answer questions about your current symptoms</li>
                <li>• Provide basic demographic and health information</li>
                <li>• Review any medications or conditions</li>
                <li>• Describe additional concerns if applicable</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">After Assessment</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Receive urgency level and priority score</li>
                <li>• Get department recommendation</li>
                <li>• View estimated wait times</li>
                <li>• Schedule appointment if needed</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> This tool is for guidance only and should not replace professional medical advice. 
                  In case of severe symptoms or life-threatening emergencies, call 911 immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};