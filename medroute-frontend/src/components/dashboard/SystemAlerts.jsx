// src/components/dashboard/SystemAlerts.jsx
import React, { useState } from 'react';
import { AlertTriangle, X, Bell, Clock } from 'lucide-react';

export const SystemAlerts = ({ alerts }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const dismissAlert = (index) => {
    setDismissedAlerts([...dismissedAlerts, index]);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'CRITICAL_CAPACITY':
        return '🚨';
      case 'HIGH_CAPACITY':
        return '⚠️';
      case 'MAINTENANCE':
        return '🔧';
      case 'SYSTEM_ERROR':
        return '❌';
      default:
        return '📢';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'CRITICAL_CAPACITY':
        return 'bg-red-50 border-red-500 text-red-700';
      case 'HIGH_CAPACITY':
        return 'bg-orange-50 border-orange-500 text-orange-700';
      case 'MAINTENANCE':
        return 'bg-blue-50 border-blue-500 text-blue-700';
      case 'SYSTEM_ERROR':
        return 'bg-red-50 border-red-500 text-red-700';
      default:
        return 'bg-gray-50 border-gray-500 text-gray-700';
    }
  };

  const getAlertPriority = (type) => {
    switch (type) {
      case 'CRITICAL_CAPACITY':
        return 'HIGH';
      case 'SYSTEM_ERROR':
        return 'HIGH';
      case 'HIGH_CAPACITY':
        return 'MEDIUM';
      case 'MAINTENANCE':
        return 'LOW';
      default:
        return 'MEDIUM';
    }
  };

  const activeAlerts = alerts.filter((_, index) => !dismissedAlerts.includes(index));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
          System Alerts
          {activeAlerts.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              {activeAlerts.length}
            </span>
          )}
        </h3>
        
        {activeAlerts.length > 0 && (
          <div className="flex items-center text-sm text-gray-500">
            <Bell className="w-4 h-4 mr-1" />
            <span>Live alerts</span>
          </div>
        )}
      </div>
      
      {activeAlerts.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activeAlerts.map((alert, originalIndex) => {
            const actualIndex = alerts.findIndex(a => a === alert);
            return (
              <div 
                key={actualIndex}
                className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">{getAlertIcon(alert.type)}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{alert.department}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          getAlertPriority(alert.type) === 'HIGH' ? 'bg-red-100 text-red-700' :
                          getAlertPriority(alert.type) === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {getAlertPriority(alert.type)} PRIORITY
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      {alert.message}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>Active for {Math.floor(Math.random() * 30) + 1} minutes</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => dismissAlert(actualIndex)}
                    className="ml-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                
                {/* Action buttons for critical alerts */}
                {alert.type === 'CRITICAL_CAPACITY' && (
                  <div className="mt-3 flex space-x-2">
                    <button className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors">
                      Emergency Protocol
                    </button>
                    <button className="px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors">
                      Notify Staff
                    </button>
                  </div>
                )}
                
                {alert.type === 'HIGH_CAPACITY' && (
                  <div className="mt-3 flex space-x-2">
                    <button className="px-3 py-1 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors">
                      Increase Staff
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">
                      Redirect Patients
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">✅</div>
          <div className="text-gray-500 mb-2">No active alerts</div>
          <div className="text-sm text-gray-400">All systems operating normally</div>
          
          {dismissedAlerts.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setDismissedAlerts([])}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Show dismissed alerts ({dismissedAlerts.length})
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Alert Summary */}
      {activeAlerts.length > 0 && (
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Alert Summary:</span>
            <div className="flex space-x-4">
              <span className="text-red-600">
                Critical: {activeAlerts.filter(a => a.type === 'CRITICAL_CAPACITY').length}
              </span>
              <span className="text-orange-600">
                High: {activeAlerts.filter(a => a.type === 'HIGH_CAPACITY').length}
              </span>
              <span className="text-blue-600">
                Other: {activeAlerts.filter(a => !['CRITICAL_CAPACITY', 'HIGH_CAPACITY'].includes(a.type)).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};