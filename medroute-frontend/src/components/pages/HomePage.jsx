// src/components/pages/HomePage.jsx
import React from 'react';
import { Heart } from 'lucide-react';
import { FeatureGrid } from '../ui/FeatureGrid';
import { CTASection } from '../ui/CTASection';
import { StatsGrid } from '../ui/StatsGrid';
import { useDashboard } from '../../context/DashboardContext';

export const HomePage = ({ onNavigate }) => {
  const { dashboardData, loading } = useDashboard();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Heart className="w-16 h-16 text-blue-600 animate-pulse" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          MedRoute: Smart Hospital Navigation & Scheduling
        </h2>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          When every minute counts, MedRoute gets you to the right care, right away. Our intelligent triage system 
          evaluates your symptoms and instantly routes you to the most appropriate hospital department—whether it's 
          an emergency requiring immediate attention or a condition that can be scheduled efficiently.
        </p>
      </section>

      {/* Feature Grid */}
      <section className="mb-12">
        <FeatureGrid />
      </section>

      {/* Call to Action */}
      <section className="mb-12">
        <CTASection onNavigate={onNavigate} />
      </section>

      {/* Statistics */}
      <section>
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Real-Time Hospital Metrics
        </h3>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading statistics...</span>
          </div>
        ) : (
          <StatsGrid data={dashboardData} />
        )}
      </section>

      {/* Additional Info Section */}
      <section className="mt-16 bg-white rounded-lg shadow-lg p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h4>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center mr-3">1</span>
                Complete our quick symptom assessment
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center mr-3">2</span>
                Our AI analyzes your condition and urgency level
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center mr-3">3</span>
                Get directed to the right department with optimal timing
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center mr-3">4</span>
                Receive your appointment confirmation instantly
              </li>
            </ol>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Why Choose MedRoute?</h4>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Reduces wait times by up to 60%
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                AI-powered triage accuracy of 94%
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Real-time hospital capacity monitoring
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Seamless integration with hospital systems
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                24/7 availability and support
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};