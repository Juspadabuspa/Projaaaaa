// src/components/pages/KnownConditionPage.jsx - Updated with booking integration
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Phone,
  Navigation
} from 'lucide-react';
import { useUserMode } from '../../context/UserModeContext';
import { hospitalRouter } from '../../services/hospitalRoutingService';
import { AppointmentBooking, AppointmentConfirmation } from '../appointments/AppointmentBooking';

export const KnownConditionPage = ({ onNavigate }) => {
  const { userLocation, setUserLocation } = useUserMode();
  const [condition, setCondition] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('routine');
  const [availableHospitals, setAvailableHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  const conditions = [
    'Diabetes Follow-up',
    'Hypertension Check',
    'Heart Disease Management',
    'Asthma Review',
    'Mental Health Consultation',
    'Chronic Pain Management',
    'Cancer Treatment',
    'Kidney Disease Follow-up',
    'Arthritis Treatment',
    'Prescription Refill',
    'Routine Check-up',
    'Specialist Consultation',
    'Other'
  ];

  const urgencyOptions = [
    { value: 'emergency', label: 'Emergency - Need immediate care', color: 'text-red-600' },
    { value: 'urgent', label: 'Urgent - Within 24 hours', color: 'text-orange-600' },
    { value: 'soon', label: 'Soon - Within a week', color: 'text-yellow-600' },
    { value: 'routine', label: 'Routine - Within a month', color: 'text-green-600' }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    if (!userLocation) {
      setIsLocating(true);
      try {
        const location = await hospitalRouter.getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.error('Location error:', error);
        setUserLocation({ lat: -26.2041, lng: 28.0473, isDefault: true });
      } finally {
        setIsLocating(false);
      }
    }
  };

  const handleSearch = async () => {
    if (!condition || !userLocation) return;

    setLoading(true);
    setError(null);
    setAvailableHospitals([]);
    
    const patientData = {
      age: '35',
      condition: condition,
      urgency: urgencyLevel,
      suspected_disease: condition
    };

    try {
      const isEmergency = urgencyLevel === 'emergency';
      const result = await hospitalRouter.routeToOptimalHospitals(
        patientData, 
        userLocation, 
        isEmergency, 
        5
      );
      
      if (result && result.recommendedHospitals && Array.isArray(result.recommendedHospitals)) {
        setAvailableHospitals(result.recommendedHospitals);
        
        if (result.recommendedHospitals.length === 0) {
          setError('No hospitals found for your condition. Please try expanding your search or contact emergency services if urgent.');
        }
      } else {
        setError('Unable to find hospitals. Please check your connection and try again.');
        setAvailableHospitals([]);
      }
    } catch (error) {
      console.error('Hospital search error:', error);
      setError('Error searching for hospitals. Please try again.');
      setAvailableHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (hospital) => {
    setSelectedHospital(hospital);
    setShowBooking(true);
  };

  const handleBookingComplete = (details) => {
    setAppointmentDetails(details);
    setShowBooking(false);
  };

  const handleNewAppointment = () => {
    setAppointmentDetails(null);
    setSelectedHospital(null);
    setAvailableHospitals([]);
    setCondition('');
    setError(null);
  };

  const handleViewAppointmentDetails = () => {
    // In a real app, this would navigate to an appointment details page
    alert('Appointment details view would open here');
  };

  const handleEmergencyRoute = () => {
    onNavigate('emergency');
  };

  const getWaitTime = (hospital) => {
    const capacity = hospital.currentCapacity;
    if (!capacity) return 'N/A';
    
    const relevantDept = capacity.general || capacity.emergency || Object.values(capacity)[0];
    return relevantDept?.waitTime ? `${relevantDept.waitTime} min` : 'N/A';
  };

  const getAvailability = (hospital) => {
    const capacity = hospital.currentCapacity;
    if (!capacity) return 'N/A';
    
    const relevantDept = capacity.general || capacity.emergency || Object.values(capacity)[0];
    return relevantDept?.available !== undefined ? `${relevantDept.available} slots` : 'N/A';
  };

  const getStatus = (hospital) => {
    const capacity = hospital.currentCapacity;
    if (!capacity) return { status: 'Unknown', color: 'text-gray-600' };
    
    const relevantDept = capacity.general || capacity.emergency || Object.values(capacity)[0];
    const status = relevantDept?.status || 'Unknown';
    
    const colorMap = {
      'LOW': 'text-green-600',
      'MODERATE': 'text-yellow-600', 
      'HIGH': 'text-orange-600',
      'CRITICAL': 'text-red-600'
    };
    
    return {
      status,
      color: colorMap[status] || 'text-gray-600'
    };
  };

  // If appointment is confirmed, show confirmation
  if (appointmentDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Confirmed</h1>
            <p className="text-gray-600">Your medical appointment has been successfully booked</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <AppointmentConfirmation 
            appointmentDetails={appointmentDetails}
            onNewAppointment={handleNewAppointment}
            onViewDetails={handleViewAppointmentDetails}
          />
        </div>
      </div>
    );
  }

  // If booking modal is open
  if (showBooking && selectedHospital) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
            <p className="text-gray-600">Schedule your visit to {selectedHospital.name}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <AppointmentBooking
              hospital={selectedHospital}
              condition={condition}
              urgencyLevel={urgencyLevel}
              onBookingComplete={handleBookingComplete}
              onCancel={() => setShowBooking(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Care for Your Condition</h1>
          <p className="text-gray-600">Book appointments directly for known conditions</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Emergency Alert */}
        {urgencyLevel === 'emergency' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800">Emergency Condition Detected</h3>
                <p className="text-red-700 text-sm mt-1">
                  For immediate emergency care, use our emergency routing system.
                </p>
              </div>
              <button
                onClick={handleEmergencyRoute}
                className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Emergency Route
              </button>
            </div>
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Tell us about your condition</h2>
          
          <div className="space-y-6">
            {/* Condition Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What condition do you need care for?
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select your condition</option>
                {conditions.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How urgent is your need for care?
              </label>
              <div className="space-y-2">
                {urgencyOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value={option.value}
                      checked={urgencyLevel === option.value}
                      onChange={(e) => setUrgencyLevel(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`font-medium ${option.color}`}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Status */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>
                {isLocating ? 'Getting your location...' : 
                 userLocation?.isDefault ? 'Using default location (Johannesburg)' : 
                 'Location detected'}
              </span>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!condition || loading || isLocating}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Finding hospitals...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Find Hospitals</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {availableHospitals && availableHospitals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Available Hospitals ({availableHospitals.length} found)
            </h2>
            
            {availableHospitals.map((hospital, index) => (
              <div key={hospital.id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{hospital.name}</h3>
                      {index === 0 && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Best Match
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{hospital.address}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-blue-600">
                        <MapPin className="w-4 h-4" />
                        <span>{hospital.distance.toFixed(1)} km away</span>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{hospital.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {hospital.routingScore ? hospital.routingScore.toFixed(0) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">Match Score</div>
                  </div>
                </div>

                {/* Specialties */}
                {hospital.specialties && hospital.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">Available Specialties:</div>
                    <div className="flex flex-wrap gap-2">
                      {hospital.specialties.map((specialty) => (
                        <span key={specialty} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capacity Info */}
                <div className="grid md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Wait Time</div>
                    <div className="font-semibold">{getWaitTime(hospital)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Availability</div>
                    <div className="font-semibold">{getAvailability(hospital)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className={`font-semibold ${getStatus(hospital).color}`}>
                      {getStatus(hospital).status}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleBookAppointment(hospital)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Appointment</span>
                  </button>
                  <button
                    onClick={() => window.open(`tel:${hospital.phone}`, '_self')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </button>
                  <button
                    onClick={() => window.open(`https://maps.google.com/maps?daddr=${hospital.location.lat},${hospital.location.lng}`, '_blank')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {!loading && availableHospitals && availableHospitals.length === 0 && condition && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">No hospitals found</h3>
            <p className="text-yellow-700">
              Try selecting a different condition or check your location settings.
            </p>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};