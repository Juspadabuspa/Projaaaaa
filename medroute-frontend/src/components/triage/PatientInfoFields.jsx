// src/components/triage/PatientInfoFields.jsx
import React from 'react';
import { User, Calendar } from 'lucide-react';

export const PatientInfoFields = ({ data, onChange, errors = {} }) => {
  const handleAgeChange = (e) => {
    const age = e.target.value;
    // Only allow numbers and ensure reasonable range
    if (age === '' || (Number(age) >= 0 && Number(age) <= 150)) {
      onChange({...data, age});
    }
  };

  const handleGenderChange = (e) => {
    onChange({...data, gender: e.target.value});
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Age Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          Age *
        </label>
        <input
          type="number"
          value={data.age}
          onChange={handleAgeChange}
          min="0"
          max="150"
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.age 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500'
          }`}
          placeholder="Enter your age"
        />
        {errors.age && (
          <p className="mt-1 text-sm text-red-600">{errors.age}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Age helps us provide more accurate recommendations
        </p>
      </div>
      
      {/* Gender Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <User className="w-4 h-4 mr-1" />
          Gender *
        </label>
        <select
          value={data.gender}
          onChange={handleGenderChange}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.gender 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500'
          }`}
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        {errors.gender && (
          <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Gender information helps with risk assessment
        </p>
      </div>
    </div>
  );
};