// src/App.js
import React, { useState } from 'react';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { TriagePage } from './components/pages/TriagePage';
import { DashboardPage } from './components/pages/DashboardPage';
import { UserEntryPoint } from './components/pages/UserEntryPoint';
import { EmergencyRouting } from './components/pages/EmergencyRouting';
import { KnownConditionPage } from './components/pages/KnownConditionPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { TriageProvider } from './context/TriageContext';
import { DashboardProvider } from './context/DashboardContext';
import { UserModeProvider, useUserMode } from './context/UserModeContext';

const AppContent = () => {
  const [currentView, setCurrentView] = useState('entry');
  const { userType, isEmergency, resetUserMode } = useUserMode();

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleGoHome = () => {
    if (userType) {
      setCurrentView('home');
    } else {
      resetUserMode();
      setCurrentView('entry');
    }
  };

  const renderCurrentPage = () => {
    // Emergency always takes priority
    if (isEmergency && currentView === 'emergency') {
      return <EmergencyRouting onNavigate={handleNavigate} />;
    }

    switch (currentView) {
      case 'entry':
        return <UserEntryPoint onNavigate={handleNavigate} />;
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'triage':
        return <TriagePage onNavigate={handleNavigate} />;
      case 'known-condition':
        return <KnownConditionPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return userType === 'admin' ? 
          <DashboardPage onNavigate={handleNavigate} /> : 
          <UserEntryPoint onNavigate={handleNavigate} />;
      case 'emergency':
        return <EmergencyRouting onNavigate={handleNavigate} />;
      case 'admin-login':
        return <AdminLogin onNavigate={handleNavigate} />;
      default:
        return <UserEntryPoint onNavigate={handleNavigate} />;
    }
  };

  const shouldShowNavigation = () => {
    // Hide navigation on entry point and emergency pages
    return !['entry', 'emergency', 'admin-login'].includes(currentView);
  };

  const shouldShowFooter = () => {
    // Hide footer on emergency pages
    return !['emergency'].includes(currentView);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowNavigation() && (
        <Navigation 
          currentView={currentView} 
          onNavigate={handleNavigate}
          onHome={handleGoHome}
          userType={userType}
        />
      )}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      {shouldShowFooter() && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <DashboardProvider>
      <TriageProvider>
        <UserModeProvider>
          <AppContent />
        </UserModeProvider>
      </TriageProvider>
    </DashboardProvider>
  );
};

export default App;