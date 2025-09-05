// src/App.js - Complete version with all pages
import React, { useState } from 'react';
import { AppointmentProvider } from './context/AppointmentContext';
import { TriageProvider } from './context/TriageContext.jsx';
import { DashboardProvider } from './context/DashboardContext';
import { UserModeProvider } from './context/UserModeContext';

// Import all your pages
import { UserEntryPoint } from './components/pages/UserEntryPoint';
import { HomePage } from './components/pages/HomePage';
import { TriagePage } from './components/pages/TriagePage';
import { EmergencyRouting } from './components/pages/EmergencyRouting';
import { KnownConditionPage } from './components/pages/KnownConditionPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { SchedulingDashboard } from './components/admin/SchedulingDashboard';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const [currentPage, setCurrentPage] = useState('entry'); // Start with entry point

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'entry':
        return <UserEntryPoint onNavigate={handleNavigate} />;
      
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      
      case 'triage':
        return <TriagePage onNavigate={handleNavigate} />;
      
      case 'emergency':
        return <EmergencyRouting onNavigate={handleNavigate} />;
      
      case 'known-condition':
        return <KnownConditionPage onNavigate={handleNavigate} />;
      
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      
      case 'admin-login':
        return <AdminLogin onNavigate={handleNavigate} />;
      
      case 'scheduling':
        return <SchedulingDashboard onNavigate={handleNavigate} />;
      
      default:
        return <UserEntryPoint onNavigate={handleNavigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <UserModeProvider>
        <DashboardProvider>
          <AppointmentProvider>
            <TriageProvider>
              <div className="min-h-screen bg-gray-50">
                {/* Navigation Bar (only show on certain pages) */}
                {['home', 'triage', 'known-condition', 'dashboard'].includes(currentPage) && (
                  <nav className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4">
                      <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                          <button
                            onClick={() => handleNavigate('home')}
                            className="text-xl font-bold text-gray-900 hover:text-blue-600"
                          >
                            MedRoute
                          </button>
                          <div className="flex space-x-4">
                            <button
                              onClick={() => handleNavigate('home')}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === 'home'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Home
                            </button>
                            <button
                              onClick={() => handleNavigate('triage')}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === 'triage'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Triage
                            </button>
                            <button
                              onClick={() => handleNavigate('known-condition')}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === 'known-condition'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Find Care
                            </button>
                            <button
                              onClick={() => handleNavigate('dashboard')}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === 'dashboard'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Dashboard
                            </button>
                          </div>
                        </div>
                        
                        {/* Emergency Button in nav */}
                        <button
                          onClick={() => handleNavigate('emergency')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Emergency
                        </button>
                      </div>
                    </div>
                  </nav>
                )}

                {/* Main Content */}
                <main className="min-h-screen">
                  {renderCurrentPage()}
                </main>
              </div>
            </TriageProvider>
          </AppointmentProvider>
        </DashboardProvider>
      </UserModeProvider>
    </ErrorBoundary>
  );
};

export default App;