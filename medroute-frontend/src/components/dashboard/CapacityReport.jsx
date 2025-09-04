// src/components/dashboard/CapacityReport.jsx
import React from 'react';
import { getCapacityColor } from '../../utils/styleHelpers';

export const CapacityReport = ({ capacityData }) => {
  const getCapacityIcon = (status) => {
    switch (status) {
      case 'CRITICAL':
        return '🚨';
      case 'HIGH':
        return '⚠️';
      case 'MODERATE':
        return '🟡';
      case 'LOW':
        return '✅';
      default:
        return '⭕';
    }
  };

  const getUtilizationBarColor = (rate) => {
    if (rate >= 90) return 'bg-red-500';
    if (rate >= 75) return 'bg-orange-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSlotsColor = (slots) => {
    if (slots <= 2) return 'text-red-600';
    if (slots <= 5) return 'text-orange-600';
    if (slots <= 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Department Capacity</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(capacityData).map(([deptId, info]) => (
          <div 
            key={deptId} 
            className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getCapacityColor(info.status)}`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <span className="text-lg mr-2">{getCapacityIcon(info.status)}</span>
                <h4 className="font-semibold text-gray-900">{info.name}</h4>
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                info.status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                info.status === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                info.status === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {info.status}
              </span>
            </div>
            
            {/* Utilization Bar */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Utilization</span>
                <span className="text-sm font-medium">{info.utilization_rate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${getUtilizationBarColor(info.utilization_rate)}`}
                  style={{ width: `${info.utilization_rate}%` }}
                ></div>
              </div>
            </div>
            
            {/* Available Slots */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Available slots</span>
              <span className={`font-semibold ${getSlotsColor(info.available_slots)}`}>
                {info.available_slots}
              </span>
            </div>
            
            {/* Additional Info */}
            <div className="mt-3 text-xs text-gray-500">
              {info.utilization_rate >= 90 && (
                <div className="text-red-600 font-medium">⚠️ Near capacity - consider overflow protocols</div>
              )}
              {info.utilization_rate < 30 && (
                <div className="text-blue-600">💡 Low utilization - capacity available</div>
              )}
              {info.available_slots <= 2 && info.status !== 'CRITICAL' && (
                <div className="text-orange-600 font-medium">Limited slots remaining</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Capacity Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-red-600">
              {Object.values(capacityData).filter(dept => dept.status === 'CRITICAL').length}
            </div>
            <div className="text-gray-600">Critical</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-600">
              {Object.values(capacityData).filter(dept => dept.status === 'HIGH').length}
            </div>
            <div className="text-gray-600">High</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-yellow-600">
              {Object.values(capacityData).filter(dept => dept.status === 'MODERATE').length}
            </div>
            <div className="text-gray-600">Moderate</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {Object.values(capacityData).filter(dept => dept.status === 'LOW').length}
            </div>
            <div className="text-gray-600">Low</div>
          </div>
        </div>
      </div>
    </div>
  );
};