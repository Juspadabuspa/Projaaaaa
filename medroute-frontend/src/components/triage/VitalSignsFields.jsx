// src/components/triage/VitalSignsFields.jsx
import React from 'react';
import { Heart, TrendingUp, Info } from 'lucide-react';

export const VitalSignsFields = ({ data, onChange }) => {
  const handleBloodPressureChange = (e) => {
    onChange({...data, blood_pressure: e.target.value});
  };

  const handleCholesterolChange = (e) => {
    onChange({...data, cholesterol_level: e.target.value});
  };

  const getBloodPressureInfo = (value) => {
    switch (value) {
      case 'High':
        return { color: 'text-red-600', info: 'Above 130/80 mmHg' };
      case 'Low':
        return { color: 'text-blue-600', info: 'Below 90/60 mmHg' };
      default:
        return { color: 'text-green-600', info: '90/60 - 130/80 mmHg' };
    }
  };

  const getCholesterolInfo = (value) => {
    switch (value) {
      case 'High':
        return { color: 'text-red-600', info: 'Above 240 mg/dL' };
      case 'Low':
        return { color: 'text-blue-600', info: 'Below 200 mg/dL' };
      default:
        return { color: 'text-green-600', info: '200-240 mg/dL' };
    }
  };

  const bpInfo = getBloodPressureInfo(data.blood_pressure);
  const cholInfo = getCholesterolInfo(data.cholesterol_level);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs & Health Indicators</h3>
        <p className="text-sm text-gray-600 mb-6">
          These measurements help us assess your cardiovascular health and overall condition.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Blood Pressure */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            Blood Pressure
          </label>
          
          <div className="space-y-3">
            {['Normal', 'High', 'Low'].map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="blood_pressure"
                  value={option}
                  checked={data.blood_pressure === option}
                  onChange={handleBloodPressureChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className={`font-medium ${
                  data.blood_pressure === option ? bpInfo.color : 'text-gray-700'
                } group-hover:text-blue-600 transition-colors`}>
                  {option}
                </span>
              </label>
            ))}
          </div>

          {/* Info panel */}
          <div className={`mt-4 p-3 rounded-lg border ${
            data.blood_pressure === 'High' ? 'bg-red-50 border-red-200' :
            data.blood_pressure === 'Low' ? 'bg-blue-50 border-blue-200' :
            'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center">
              <Info className={`w-4 h-4 mr-2 ${bpInfo.color}`} />
              <div className="text-sm">
                <span className={`font-medium ${bpInfo.color}`}>
                  {data.blood_pressure} Range:
                </span>
                <span className="ml-1 text-gray-600">{bpInfo.info}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cholesterol Level */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
            Cholesterol Level
          </label>
          
          <div className="space-y-3">
            {['Normal', 'High', 'Low'].map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="cholesterol_level"
                  value={option}
                  checked={data.cholesterol_level === option}
                  onChange={handleCholesterolChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className={`font-medium ${
                  data.cholesterol_level === option ? cholInfo.color : 'text-gray-700'
                } group-hover:text-blue-600 transition-colors`}>
                  {option}
                </span>
              </label>
            ))}
          </div>

          {/* Info panel */}
          <div className={`mt-4 p-3 rounded-lg border ${
            data.cholesterol_level === 'High' ? 'bg-red-50 border-red-200' :
            data.cholesterol_level === 'Low' ? 'bg-blue-50 border-blue-200' :
            'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center">
              <Info className={`w-4 h-4 mr-2 ${cholInfo.color}`} />
              <div className="text-sm">
                <span className={`font-medium ${cholInfo.color}`}>
                  {data.cholesterol_level} Range:
                </span>
                <span className="ml-1 text-gray-600">{cholInfo.info}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional guidance */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Not sure about your levels?</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• <strong>Blood Pressure:</strong> If you don't know, select "Normal" unless you've been told you have high or low blood pressure</p>
          <p>• <strong>Cholesterol:</strong> Based on your most recent blood test results, or select "Normal" if unknown</p>
          <p>• These measurements help us provide more accurate recommendations and determine appropriate care level</p>
        </div>
      </div>

      {/* Risk indicators */}
      {(data.blood_pressure === 'High' || data.cholesterol_level === 'High') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Cardiovascular Risk Factor Noted</p>
              <p className="text-yellow-700">
                {data.blood_pressure === 'High' && data.cholesterol_level === 'High' 
                  ? 'Both high blood pressure and high cholesterol increase your cardiovascular risk. We may recommend cardiology consultation.'
                  : data.blood_pressure === 'High'
                  ? 'High blood pressure noted. This may influence your treatment plan and department assignment.'
                  : 'High cholesterol noted. This may be considered in your overall health assessment.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};