// src/App.js
import React, { useState } from 'react';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { TriagePage } from './components/pages/TriagePage';
import { DashboardPage } from './components/pages/DashboardPage';
import { TriageProvider } from './context/TriageContext';
import { DashboardProvider } from './context/DashboardContext';

const App = () => {
  const [currentView, setCurrentView] = useState('home');

  const renderCurrentPage = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={setCurrentView} />;
      case 'triage':
        return <TriagePage onNavigate={setCurrentView} />;
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentView} />;
      default:
        return <HomePage onNavigate={setCurrentView} />;
    }
  };

  return (
    <DashboardProvider>
      <TriageProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation currentView={currentView} onNavigate={setCurrentView} />
          <main className="flex-1">
            {renderCurrentPage()}
          </main>
          <Footer />
        </div>
      </TriageProvider>
    </DashboardProvider>
  );
};

export default App;