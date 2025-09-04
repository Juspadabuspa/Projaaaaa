// src/components/ui/CTASection.jsx
import React from 'react';
import { ArrowRight, Stethoscope } from 'lucide-react';

export const CTASection = ({ onNavigate }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-blue-600 opacity-10">
        <div className="absolute top-4 left-4">
          <Stethoscope className="w-24 h-24 opacity-20" />
        </div>
        <div className="absolute bottom-4 right-4">
          <Stethoscope className="w-32 h-32 opacity-10 rotate-12" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-4">
          Stop guessing where to go for medical care
        </h3>
        <p className="text-lg mb-6 opacity-90">
          Let MedRoute's AI-powered triage guide you to the right place at the right time, 
          ensuring faster treatment and better outcomes for everyone.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => onNavigate('triage')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2 group"
          >
            <span>Start Smart Triage</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => onNavigate('dashboard')}
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            View Hospital Status
          </button>
        </div>

        <div className="mt-6 text-sm opacity-75">
          <p>Trusted by 50+ hospitals • 99.9% uptime • HIPAA compliant</p>
        </div>
      </div>
    </div>
  );
};