// src/components/pages/EmergencyRouting.jsx
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  AlertTriangle, 
  Car,
  Ambulance,
  Heart,
  CheckCircle,
  Shield,
  Activity,
  Users,
  RefreshCw
} from 'lucide-react';
import { useUserMode } from '../../context/UserModeContext';
import { hospitalRouter } from '../../services/hospitalRoutingService';

export const EmergencyRouting = ({ onNavigate }) => {
  const { userLocation, clearEmergency } = useUserMode();
  const [emergencyHospitals, setEmergencyHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callingEmergency, setCallingEmergency] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userLocation) {
      loadEmergencyHospitals();
    }
  }, [userLocation]);

  const loadEmergencyHospitals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const hospitals = await hospitalRouter.getEmergencyRoute(userLocation);
      
      if (hospitals.length === 0) {
        setError('No emergency hospitals found in your area. Please call 10177 for ambulance dispatch.');
      } else {
        setEmergencyHospitals(hospitals);
      }
    } catch (err) {
      console.error('Error loading emergency hospitals:', err);
      setError('Unable to load hospital data. Please call 10177 for immediate assistance.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEmergencyHospitals();
    setRefreshing(false);
  };

  const handleCall911 = () => {
    setCallingEmergency(true);
    // South Africa emergency numbers
    const emergencyNumbers = [
      { number: '10177', service: 'Ambulance' },
      { number: '10111', service: 'Police' },
      { number: '112', service: 'Emergency (Mobile)' }
    ];
    
    // Primary ambulance number
    window.open('tel:10177', '_self');
    
    // Show confirmation
    setTimeout(() => {
      setCallingEmergency(false);
    }, 3000);
  };

  const handleGetDirections = (hospital) => {
    // Open in Google Maps with directions
    const url = `https://maps.google.com/maps?saddr=${userLocation.lat},${userLocation.lng}&daddr=${hospital.location.lat},${hospital.location.lng}&dirflg=d`;
    window.open(url, '_blank');
  };

  const handleCallHospital = (hospital) => {
    window.open(`tel:${hospital.phone}`, '_self');
  };

  const handleGoBack = () => {
    clearEmergency();
    onNavigate('home');
  };

  const getCapacityStatus = (hospital) => {
    const emergencyCapacity = hospital.currentCapacity?.emergency;
    if (!emergencyCapacity) return { status: 'Unknown', color: 'gray' };
    
    const available = emergencyCapacity.available || 0;
    const total = emergencyCapacity.total || 1;
    const utilizationRate = ((total - available) / total) * 100;
    
    if (utilizationRate >= 95) return { status: 'Critical', color: 'red' };
    if (utilizationRate >= 85) return { status: 'High', color: 'orange' };
    if (utilizationRate >= 65) return { status: 'Moderate', color: 'yellow' };
    return { status: 'Available', color: 'green' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Finding nearest emergency rooms...</h2>
          <p className="text-red-600">Connecting to hospital database</p>
          <div className="mt-4 p-4 bg-red-100 rounded-lg">
            <p className="text-sm text-red-700">
              For immediate life-threatening emergencies, call <strong>10177</strong> now
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Emergency Service Alert</h2>
            <p className="text-red-600">{error}</p>
          </div>
          
          <div className="space-y-3 mb-6">
            <button
              onClick={handleCall911}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Call 10177 - Emergency Services</span>
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Retrying...' : 'Retry Hospital Search'}</span>
            </button>
          </div>
          
          <button
            onClick={handleGoBack}
            className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50">
      {/* Emergency Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Medical Emergency</h1>
                <p className="text-red-100">
                  {emergencyHospitals.length} emergency facilities found within {Math.max(...emergencyHospitals.map(h => h.distance)).toFixed(1)}km
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Emergency Call Button */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-red-800 mb-2 flex items-center">
                <Ambulance className="w-6 h-6 mr-2" />
                Life-Threatening Emergency?
              </h2>
              <p className="text-gray-600">For immediate ambulance dispatch in South Africa</p>
              <div className="mt-2 text-sm text-gray-500">
                Available 24/7 • Multilingual support • GPS tracking
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={handleCall911}
                disabled={callingEmergency}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors mb-2"
              >
                <Phone className="w-5 h-5" />
                <span>Call 10177</span>
              </button>
              <div className="text-xs text-gray-500">Primary ambulance</div>
            </div>
          </div>
        </div>

        {/* Emergency Hospitals */}
        <div className="space-y-4 mb-6">
          {emergencyHospitals.map((hospital, index) => {
            const capacityStatus = getCapacityStatus(hospital);
            return (
              <div key={hospital.id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${index === 0 ? 'bg-green-100' : 'bg-blue-100'}`}>
                      <Heart className={`w-6 h-6 ${index === 0 ? 'text-green-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{hospital.name}</h3>
                        {index === 0 && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Nearest
                          </span>
                        )}
                        {hospital.isLevel1Trauma && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            Level 1 Trauma
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{hospital.address}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1 text-green-600">
                          <MapPin className="w-4 h-4" />
                          <span>{hospital.distance.toFixed(1)} km away</span>
                        </div>
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Clock className="w-4 h-4" />
                          <span>~{hospital.estimatedArrival} min drive</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className={`w-4 h-4 text-${capacityStatus.color}-600`} />
                          <span className={`text-${capacityStatus.color}-600 font-medium`}>
                            {capacityStatus.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hospital Info Grid */}
                <div className="grid md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Emergency Level</div>
                    <div className="font-semibold">{hospital.emergencyLevel}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Current Wait</div>
                    <div className="font-semibold">
                      {hospital.currentCapacity?.emergency?.waitTime || 'Unknown'} minutes
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Available Beds</div>
                    <div className="font-semibold flex items-center space-x-1">
                      <span>{hospital.currentCapacity?.emergency?.available || 0}</span>
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Ambulance Service</div>
                    <div className="font-semibold flex items-center space-x-1">
                      {hospital.hasAmbulance ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Available</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-orange-600">Limited</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                {hospital.specialties && hospital.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Emergency Specialties Available:</div>
                    <div className="flex flex-wrap gap-2">
                      {hospital.specialties.filter(s => s !== 'general').map((specialty) => (
                        <span key={specialty} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleGetDirections(hospital)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Navigation className="w-5 h-5" />
                    <span>Get Directions</span>
                  </button>
                  <button
                    onClick={() => handleCallHospital(hospital)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Hospital</span>
                  </button>
                </div>

                {/* Additional Emergency Info */}
                {index === 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800 text-sm">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Recommended:</span>
                      <span>Closest emergency facility with immediate availability</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Transportation Options */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Transportation Options</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Ambulance className="w-6 h-6 text-red-500" />
                <h4 className="font-semibold">Emergency Ambulance</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Professional medical support en route. GPS tracking and direct hospital communication.
              </p>
              <div className="text-xs text-gray-500 mb-3">
                • Advanced life support equipment
                • Trained paramedics
                • Direct hospital radio contact
                • Insurance billing available
              </div>
              <button
                onClick={handleCall911}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Call 10177 for Ambulance
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Car className="w-6 h-6 text-blue-500" />
                <h4 className="font-semibold">Private Transport</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Drive yourself or have someone drive you. Only if condition allows and you can travel safely.
              </p>
              <div className="text-xs text-gray-500 mb-3">
                • Faster arrival for non-critical cases
                • No waiting for ambulance
                • Must be stable to travel
                • Have someone else drive if possible
              </div>
              <button
                onClick={() => handleGetDirections(emergencyHospitals[0])}
                disabled={emergencyHospitals.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-gray-400"
              >
                Get Directions to Nearest
              </button>
            </div>
          </div>
        </div>

        {/* Important Emergency Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Important Emergency Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 text-sm text-yellow-700">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                <span>Bring ID, medical aid card, and current medications list</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                <span>Emergency rooms prioritize by severity, not arrival time</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                <span>Call ahead to notify hospital of your arrival</span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-yellow-700">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                <span>Have emergency contact information ready</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                <span>If driving, designate someone else as driver if possible</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                <span>Stay calm and follow hospital staff instructions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Numbers Reference */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-red-800 mb-3">South Africa Emergency Numbers</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-red-700">Ambulance/Medical:</span>
              <button 
                onClick={() => window.open('tel:10177', '_self')}
                className="font-bold text-red-800 hover:underline"
              >
                10177
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-700">Police:</span>
              <button 
                onClick={() => window.open('tel:10111', '_self')}
                className="font-bold text-red-800 hover:underline"
              >
                10111
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-700">Emergency (Mobile):</span>
              <button 
                onClick={() => window.open('tel:112', '_self')}
                className="font-bold text-red-800 hover:underline"
              >
                112
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
          
          <div className="text-sm text-gray-500">
            Data updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};