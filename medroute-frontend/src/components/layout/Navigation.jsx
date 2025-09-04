// src/components/layout/Navigation.jsx
import React from 'react';
import { Heart } from 'lucide-react';

export const Navigation = ({ currentView, onNavigate }) => {
  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'triage', label: 'Smart Triage' },
    { id: 'dashboard', label: 'Dashboard' }
  ];

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Heart className="w-8 h-8 text-red-400" />
          <h1 className="text-2xl font-bold">MedRoute</h1>
        </div>
        <div className="flex space-x-4">
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
        </div>
      </div>
    </nav>
  );
};