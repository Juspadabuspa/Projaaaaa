// src/components/layout/Navigation.jsx
import React from 'react';
import { Heart, User, Settings, LogOut, AlertTriangle } from 'lucide-react';
import { useUserMode } from '../../context/UserModeContext';

export const Navigation = ({ currentView, onNavigate, onHome, userType }) => {
  const { resetUserMode, triggerEmergency } = useUserMode();

  const handleEmergency = () => {
    triggerEmergency();
    onNavigate('emergency');
  };

  const handleLogout = () => {
    resetUserMode();
    onNavigate('entry');
  };

  const getNavigationItems = () => {
    if (userType === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'home', label: 'Overview' }
      ];
    } else if (userType === 'patient') {
      return [
        { id: 'home', label: 'Home' },
        { id: 'triage', label: 'Symptom Check' },
        { id: 'known-condition', label: 'Book Appointment' }
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Heart className="w-8 h-8 text-red-400" />
          <button onClick={onHome} className="text-2xl font-bold hover:text-blue-200 transition-colors">
            MedRoute
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Emergency Button - Always visible */}
          <button
            onClick={handleEmergency}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Emergency</span>
          </button>

          {/* Navigation Items */}
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-2 rounded transition-colors ${
                currentView === item.id ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* User Info & Logout */}
          <div className="flex items-center space-x-2 border-l border-blue-500 pl-4">
            <div className="flex items-center space-x-2">
              {userType === 'admin' ? (
                <Settings className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
              <span className="text-sm">
                {userType === 'admin' ? 'Hospital Staff' : 'Patient'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-blue-500 rounded transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};