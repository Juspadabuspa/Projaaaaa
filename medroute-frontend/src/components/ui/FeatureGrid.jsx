// src/components/ui/FeatureGrid.jsx
import React from 'react';
import { AlertTriangle, Calendar, Users, Brain } from 'lucide-react';

const FEATURES = [
  {
    icon: AlertTriangle,
    title: 'Instant Emergency Routing',
    description: 'Symptom-based questionnaire determines threat level and directs you to the optimal hospital',
    color: 'text-red-500',
    bgColor: 'hover:bg-red-50'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Seamlessly book appointments across all departments with real-time availability',
    color: 'text-blue-500',
    bgColor: 'hover:bg-blue-50'
  },
  {
    icon: Users,
    title: 'Doctor & Patient Wellness',
    description: 'Our algorithm factors in physician rest periods and patient recovery needs',
    color: 'text-green-500',
    bgColor: 'hover:bg-green-50'
  },
  {
    icon: Brain,
    title: 'Integrated Care',
    description: 'One platform connecting patients directly to hospital systems',
    color: 'text-purple-500',
    bgColor: 'hover:bg-purple-50'
  }
];

export const FeatureGrid = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {FEATURES.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <div 
            key={index} 
            className={`bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${feature.bgColor}`}
          >
            <IconComponent className={`w-10 h-10 ${feature.color} mb-4 transition-transform hover:scale-110`} />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
};