// src/components/dashboard/QuickActions.jsx
import React, { useState } from 'react';
import { Phone, Users, Stethoscope, Settings, AlertTriangle, MessageSquare } from 'lucide-react';

export const QuickActions = ({ onNavigate }) => {
  const [actionStatus, setActionStatus] = useState({});

  const handleAction = async (actionId, actionFn) => {
    setActionStatus(prev => ({ ...prev, [actionId]: 'loading' }));
    
    try {
      await actionFn();
      setActionStatus(prev => ({ ...prev, [actionId]: 'success' }));
      setTimeout(() => {
        setActionStatus(prev => ({ ...prev, [actionId]: null }));
      }, 2000);
    } catch (error) {
      setActionStatus(prev => ({ ...prev, [actionId]: 'error' }));
      setTimeout(() => {
        setActionStatus(prev => ({ ...prev, [actionId]: null }));
      }, 3000);
    }
  };

  const emergencyAlert = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Emergency alert sent to all departments!');
  };

  const optimizeStaffing = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Staff allocation optimization initiated!');
  };

  const sendNotification = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Notification sent to relevant staff members!');
  };

  const openMaintenanceMode = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('System maintenance mode activated!');
  };

  const actions = [
    {
      id: 'emergency',
      icon: Phone,
      title: 'Emergency Alert',
      description: 'Notify all departments',
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-red-100',
      onClick: () => handleAction('emergency', emergencyAlert),
      urgent: true
    },
    {
      id: 'staffing',
      icon: Users,
      title: 'Staff Allocation',
      description: 'Optimize staff distribution',
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-100',
      onClick: () => handleAction('staffing', optimizeStaffing)
    },
    {
      id: 'triage',
      icon: Stethoscope,
      title: 'New Triage',
      description: 'Start patient assessment',
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-100',
      onClick: () => onNavigate('triage')
    },
    {
      id: 'notification',
      icon: MessageSquare,
      title: 'Send Notification',
      description: 'Alert relevant staff',
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-purple-100',
      onClick: () => handleAction('notification', sendNotification)
    },
    {
      id: 'maintenance',
      icon: Settings,
      title: 'Maintenance Mode',
      description: 'System maintenance',
      color: 'bg-gray-500 hover:bg-gray-600',
      textColor: 'text-gray-100',
      onClick: () => handleAction('maintenance', openMaintenanceMode)
    },
    {
      id: 'capacity',
      icon: AlertTriangle,
      title: 'Capacity Override',
      description: 'Manual capacity adjustment',
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-orange-100',
      onClick: () => alert('Capacity override interface would open here')
    }
  ];

  const getButtonStatus = (actionId) => {
    const status = actionStatus[actionId];
    switch (status) {
      case 'loading':
        return { disabled: true, content: 'Processing...', spinner: true };
      case 'success':
        return { disabled: false, content: 'Success ✓', className: 'bg-green-600' };
      case 'error':
        return { disabled: false, content: 'Error ✗', className: 'bg-red-600' };
      default:
        return { disabled: false, content: null, className: '' };
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Quick Actions</h3>
        <div className="text-sm opacity-75">
          Emergency actions available 24/7
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action) => {
          const IconComponent = action.icon;
          const buttonStatus = getButtonStatus(action.id);
          
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={buttonStatus.disabled}
              className={`
                ${buttonStatus.className || action.color} 
                ${action.textColor}
                p-4 rounded-lg transition-all duration-200 text-left
                hover:scale-105 hover:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                ${action.urgent ? 'ring-2 ring-red-300 ring-opacity-50' : ''}
                group
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <IconComponent className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {action.urgent && (
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-medium">
                    URGENT
                  </span>
                )}
                {buttonStatus.spinner && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              
              <div className="font-medium text-sm mb-1">
                {buttonStatus.content || action.title}
              </div>
              
              <div className="text-xs opacity-90">
                {action.description}
              </div>
              
              {/* Action-specific indicators */}
              {action.id === 'emergency' && (
                <div className="mt-2 text-xs opacity-75 flex items-center">
                  <div className="w-2 h-2 bg-red-300 rounded-full mr-1 animate-pulse"></div>
                  Ready for activation
                </div>
              )}
              
              {action.id === 'staffing' && (
                <div className="mt-2 text-xs opacity-75">
                  Last optimized: 2h ago
                </div>
              )}
              
              {action.id === 'triage' && (
                <div className="mt-2 text-xs opacity-75">
                  Assessment ready
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-blue-400 border-opacity-30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold">24/7</div>
            <div className="text-xs opacity-75">Emergency Response</div>
          </div>
          <div>
            <div className="text-lg font-semibold">&lt;30s</div>
            <div className="text-xs opacity-75">Average Action Time</div>
          </div>
          <div>
            <div className="text-lg font-semibold">99.9%</div>
            <div className="text-xs opacity-75">System Reliability</div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-xs opacity-75 text-center">
        <p>
          💡 <strong>Tip:</strong> Emergency alerts are immediately dispatched to all department heads and on-call staff
        </p>
      </div>

      {/* Emergency Protocols Quick Access */}
      <div className="mt-4">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium opacity-75 hover:opacity-100 transition-opacity">
            Emergency Protocols ▼
          </summary>
          <div className="mt-2 text-xs opacity-75 space-y-1 pl-4">
            <div>• <strong>Code Red:</strong> Fire/Evacuation - Press Emergency Alert</div>
            <div>• <strong>Code Blue:</strong> Medical Emergency - Use Triage + Emergency Alert</div>
            <div>• <strong>Code Gray:</strong> Security - Contact Security via Notification</div>
            <div>• <strong>Mass Casualty:</strong> Emergency Alert + Capacity Override</div>
          </div>
        </details>
      </div>
    </div>
  );
};