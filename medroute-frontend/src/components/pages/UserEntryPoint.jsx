// src/components/pages/UserEntryPoint.jsx
import React, { useState } from 'react';
import { 
  Heart, 
  User, 
  Settings, 
  AlertTriangle, 
  MapPin, 
  Clock,
  Users,
  Stethoscope,
  HelpCircle,
  CheckCircle,
  Phone
} from 'lucide-react';
import { useUserMode } from '../../context/UserModeContext';
import { hospitalRouter } from '../../services/hospitalRoutingService';

export const UserEntryPoint = ({ onNavigate }) => {
  const { initializePatientMode, initializeAdminMode, triggerEmergency } = useUserMode();
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleEmergencyClick = async () => {
    setIsLocating(true);
    try {
      const location = await hospitalRouter.getCurrentLocation();
      triggerEmergency(location);
      onNavigate('emergency');
    } catch (error) {
      console.error('Location error:', error);
      // Still proceed with emergency routing using default location
      triggerEmergency({ lat: -26.2041, lng: 28.0473 }); // Johannesburg default
      onNavigate('emergency');
    } finally {
      setIsLocating(false);
      setShowEmergencyConfirm(false);
    }
  };

  const handlePatientModeSelect = (mode) => {
    initializePatientMode(mode);
    if (mode === 'unknown') {
      onNavigate('triage');
    } else {
      onNavigate('known-condition');
    }
  };

  const handleAdminAccess = () => {
    initializeAdminMode();
    onNavigate('admin-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to MedRoute
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Smart hospital navigation that gets you to the right care, right away
          </p>
        </div>

        {/* Emergency Button */}
        <div className="mb-12">
          <button
            onClick={() => setShowEmergencyConfirm(true)}
            disabled={isLocating}
            className="w-full bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg font-semibold text-xl transition-colors shadow-lg border-4 border-red-700 hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-3">
              <AlertTriangle className="w-8 h-8" />
              <span>MEDICAL EMERGENCY</span>
              <Phone className="w-8 h-8" />
            </div>
            <div className="text-sm mt-2 opacity-90">
              {isLocating ? 'Getting your location...' : 'Click for immediate hospital routing'}
            </div>
          </button>
        </div>

        {/* User Type Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Patient Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="bg-green-100 p-3 rounded-full inline-block mb-4">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">I Need Medical Care</h2>
              <p className="text-gray-600">Find the right hospital and book appointments</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handlePatientModeSelect('unknown')}
                className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 p-4 rounded-lg text-left transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <HelpCircle className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                      I don't know what I have
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Take our symptom assessment to get diagnosed and routed to the right hospital
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePatientModeSelect('known')}
                className="w-full bg-green-50 hover:bg-green-100 border border-green-200 p-4 rounded-lg text-left transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-green-700">
                      I know my condition
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Book appointments directly for specific conditions or follow-ups
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
                <div>
                  <MapPin className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <div>Find Nearby Hospitals</div>
                </div>
                <div>
                  <Clock className="w-5 h-5 mx-auto mb-1 text-green-500" />
                  <div>Real-time Wait Times</div>
                </div>
                <div>
                  <Stethoscope className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                  <div>AI-Powered Triage</div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full inline-block mb-4">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Hospital Staff</h2>
              <p className="text-gray-600">Manage hospital operations and patient flow</p>
            </div>

            <button
              onClick={handleAdminAccess}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-semibold transition-colors"
            >
              Access Hospital Dashboard
            </button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center text-sm text-gray-600">
                <div>
                  <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <div>Manage Staff</div>
                </div>
                <div>
                  <Settings className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                  <div>System Settings</div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Authorized personnel only
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why Choose MedRoute?
          </h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="bg-red-100 p-2 rounded-full inline-block mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="font-medium">Emergency Routing</div>
              <div className="text-gray-500">Instant hospital directions</div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 p-2 rounded-full inline-block mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="font-medium">Real-time Capacity</div>
              <div className="text-gray-500">Live hospital availability</div>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-2 rounded-full inline-block mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div className="font-medium">Smart Routing</div>
              <div className="text-gray-500">Optimal hospital selection</div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-2 rounded-full inline-block mb-2">
                <Stethoscope className="w-4 h-4 text-purple-600" />
              </div>
              <div className="font-medium">AI Diagnosis</div>
              <div className="text-gray-500">Symptom-based triage</div>
            </div>
          </div>
        </div>

        {/* Emergency Confirmation Modal */}
        {showEmergencyConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Medical Emergency</h3>
                <p className="text-gray-600">
                  We'll find the nearest emergency room and provide directions immediately.
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>For life-threatening emergencies, call 10177 (South Africa Emergency) immediately.</strong>
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEmergencyConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmergencyClick}
                  disabled={isLocating}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isLocating ? 'Locating...' : 'Find Emergency Room'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};