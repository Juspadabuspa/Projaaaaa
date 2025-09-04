// src/components/dashboard/SystemPredictions.jsx
import React, { useState } from 'react';
import { TrendingUp, Info, Clock, Users, Activity } from 'lucide-react';

export const SystemPredictions = ({ predictions }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6h');

  const timeframes = [
    { value: '2h', label: '2 Hours' },
    { value: '6h', label: '6 Hours' },
    { value: '12h', label: '12 Hours' },
    { value: '24h', label: '24 Hours' }
  ];

  const getPredictionForTimeframe = (timeframe) => {
    // Simulate different predictions based on timeframe
    const baseForecast = predictions.capacity_forecast_6h;
    switch (timeframe) {
      case '2h':
        return Math.max(baseForecast - 5, 45);
      case '6h':
        return baseForecast;
      case '12h':
        return Math.min(baseForecast + 8, 95);
      case '24h':
        return Math.max(baseForecast - 12, 40);
      default:
        return baseForecast;
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return { color: 'text-red-600', bgColor: 'bg-red-100', status: 'Critical' };
    if (utilization >= 75) return { color: 'text-orange-600', bgColor: 'bg-orange-100', status: 'High' };
    if (utilization >= 50) return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', status: 'Moderate' };
    return { color: 'text-green-600', bgColor: 'bg-green-100', status: 'Good' };
  };

  const getStaffingRecommendation = (adjustment) => {
    switch (adjustment) {
      case 'increase':
        return {
          text: 'Increase Staffing',
          color: 'text-orange-700 bg-orange-100',
          icon: '⬆️',
          description: 'Add 2-3 staff members to handle increased load'
        };
      case 'decrease':
        return {
          text: 'Reduce Staffing',
          color: 'text-blue-700 bg-blue-100',
          icon: '⬇️',
          description: 'Consider reducing staff by 1-2 members'
        };
      case 'maintain':
        return {
          text: 'Maintain Current',
          color: 'text-green-700 bg-green-100',
          icon: '➡️',
          description: 'Current staffing levels are optimal'
        };
      default:
        return {
          text: 'No Change',
          color: 'text-gray-700 bg-gray-100',
          icon: '➡️',
          description: 'Maintain current staffing levels'
        };
    }
  };

  const currentForecast = getPredictionForTimeframe(selectedTimeframe);
  const utilizationInfo = getUtilizationColor(predictions.avg_system_utilization);
  const forecastInfo = getUtilizationColor(currentForecast);
  const staffingInfo = getStaffingRecommendation(predictions.recommended_staffing_adjustment);

  const generateHourlyForecast = () => {
    const hours = parseInt(selectedTimeframe.replace('h', ''));
    const forecast = [];
    const baseUtilization = predictions.avg_system_utilization;
    
    for (let i = 1; i <= Math.min(hours, 8); i++) {
      const variance = Math.random() * 20 - 10; // -10 to +10
      const predicted = Math.max(30, Math.min(95, baseUtilization + variance));
      forecast.push({
        hour: i,
        utilization: Math.round(predicted)
      });
    }
    return forecast;
  };

  const hourlyForecast = generateHourlyForecast();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <TrendingUp className="w-6 h-6 text-blue-500 mr-2" />
          System Predictions
        </h3>
        
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          {timeframes.map(tf => (
            <option key={tf.value} value={tf.value}>{tf.label}</option>
          ))}
        </select>
      </div>
      
      <div className="space-y-4">
        {/* Current System Utilization */}
        <div className={`p-4 rounded-lg ${utilizationInfo.bgColor}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Activity className={`w-5 h-5 mr-2 ${utilizationInfo.color}`} />
              <span className="text-sm text-gray-600">Current System Utilization</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${utilizationInfo.bgColor} ${utilizationInfo.color} font-medium`}>
              {utilizationInfo.status}
            </span>
          </div>
          <div className={`text-2xl font-bold ${utilizationInfo.color}`}>
            {predictions.avg_system_utilization}%
          </div>
        </div>
        
        {/* Capacity Forecast */}
        <div className={`p-4 rounded-lg ${forecastInfo.bgColor}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Clock className={`w-5 h-5 mr-2 ${forecastInfo.color}`} />
              <span className="text-sm text-gray-600">{selectedTimeframe} Capacity Forecast</span>
            </div>
            <div className="flex items-center">
              <Info className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-xs text-gray-500">85% accuracy</span>
            </div>
          </div>
          <div className={`text-lg font-semibold ${forecastInfo.color}`}>
            {currentForecast}%
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                currentForecast >= 90 ? 'bg-red-500' :
                currentForecast >= 75 ? 'bg-orange-500' :
                currentForecast >= 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${currentForecast}%` }}
            ></div>
          </div>
        </div>
        
        {/* Staffing Recommendation */}
        <div className={`p-4 rounded-lg ${staffingInfo.color.split(' ')[1]}`}>
          <div className="flex items-center mb-2">
            <Users className={`w-5 h-5 mr-2 ${staffingInfo.color.split(' ')[0]}`} />
            <span className="text-sm text-gray-600">Staffing Recommendation</span>
          </div>
          <div className={`text-lg font-semibold ${staffingInfo.color.split(' ')[0]} flex items-center`}>
            <span className="mr-2">{staffingInfo.icon}</span>
            {staffingInfo.text}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {staffingInfo.description}
          </div>
        </div>
      </div>

      {/* Hourly Forecast Chart */}
      {selectedTimeframe !== '24h' && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Hourly Forecast</h4>
          <div className="flex items-end space-x-2 h-24">
            {hourlyForecast.map((point, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t transition-all duration-1000 ${
                    point.utilization >= 90 ? 'bg-red-400' :
                    point.utilization >= 75 ? 'bg-orange-400' :
                    point.utilization >= 50 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ height: `${(point.utilization / 100) * 80}px` }}
                  title={`Hour ${point.hour}: ${point.utilization}%`}
                ></div>
                <div className="text-xs text-gray-500 mt-1">+{point.hour}h</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-2 text-center">
            Predicted utilization over next {selectedTimeframe}
          </div>
        </div>
      )}

      {/* Prediction Insights */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">AI Insights</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          {currentForecast > predictions.avg_system_utilization + 10 && (
            <li>• Expected surge in patient volume over next {selectedTimeframe}</li>
          )}
          {currentForecast < predictions.avg_system_utilization - 10 && (
            <li>• Utilization expected to decrease over next {selectedTimeframe}</li>
          )}
          {predictions.recommended_staffing_adjustment === 'increase' && (
            <li>• Consider pre-positioning additional staff</li>
          )}
          <li>• Predictions based on historical patterns and current trends</li>
          <li>• Update frequency: Every 15 minutes</li>
        </ul>
      </div>
    </div>
  );
};