// frontend/src/App.js
import React, { useState } from 'react';
import { AppointmentProvider } from './context/AppointmentContext';
import { TriageProvider } from './context/TriageContext';
import SchedulingDashboard from './components/admin/SchedulingDashboard';
import TriagePage from './components/pages/TriagePage';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const [currentPage, setCurrentPage] = useState('scheduling');

  return (
    <ErrorBoundary>
      <AppointmentProvider>
        <TriageProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-8">
                    <h1 className="text-xl font-bold text-gray-900">Hospital Management</h1>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setCurrentPage('scheduling')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentPage === 'scheduling'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Scheduling
                      </button>
                      <button
                        onClick={() => setCurrentPage('triage')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentPage === 'triage'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Triage
                      </button>
                    </div>
                  </div>
                  
                  {/* Connection Status Indicator */}
                  <ConnectionStatus />
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="min-h-screen">
              {currentPage === 'scheduling' && <SchedulingDashboard />}
              {currentPage === 'triage' && <TriagePage />}
            </main>
          </div>
        </TriageProvider>
      </AppointmentProvider>
    </ErrorBoundary>
  );
};

// Connection Status Component
const ConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');

  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/health`);
        if (response.ok) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
        }
      } catch (error) {
        setConnectionStatus('error');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    checking: { color: 'bg-yellow-400', text: 'Checking...' },
    connected: { color: 'bg-green-400', text: 'Connected' },
    error: { color: 'bg-red-400', text: 'Disconnected' }
  };

  const config = statusConfig[connectionStatus];

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
      <span className="text-xs text-gray-500">{config.text}</span>
    </div>
  );
};

export default App;