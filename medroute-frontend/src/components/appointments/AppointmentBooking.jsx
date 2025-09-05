// src/components/appointments/AppointmentBooking.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, AlertTriangle } from 'lucide-react';

export const AppointmentBooking = ({ hospital, condition, urgencyLevel, onBookingComplete, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [patientInfo, setPatientInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    age: '',
    medicalAid: '',
    medicalAidNumber: '',
    additionalNotes: ''
  });
  const [availableSlots, setAvailableSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const departments = [
    { id: 'general', name: 'General Medicine', waitTime: '30-45 min' },
    { id: 'emergency', name: 'Emergency', waitTime: '5-15 min' },
    { id: 'cardiology', name: 'Cardiology', waitTime: '45-60 min' },
    { id: 'pediatrics', name: 'Pediatrics', waitTime: '20-30 min' },
    { id: 'orthopedics', name: 'Orthopedics', waitTime: '40-55 min' }
  ];

  useEffect(() => {
    generateAvailableSlots();
  }, [selectedDate, selectedDepartment]);

  const generateAvailableSlots = () => {
    if (!selectedDate || !selectedDepartment) return;

    // Generate mock available time slots
    const slots = {};
    const startHour = 8;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isAvailable = Math.random() > 0.3; // 70% chance of being available
        slots[timeString] = {
          available: isAvailable,
          doctor: isAvailable ? `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown'][Math.floor(Math.random() * 4)]}` : null
        };
      }
    }
    
    setAvailableSlots(slots);
  };

  const getNextAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends for non-emergency appointments
      if (urgencyLevel !== 'emergency' && (date.getDay() === 0 || date.getDay() === 6)) {
        continue;
      }
      
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-ZA', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isToday: date.toDateString() === today.toDateString(),
        isTomorrow: date.toDateString() === new Date(today.getTime() + 24*60*60*1000).toDateString()
      });
    }
    
    return dates;
  };

  const handlePatientInfoChange = (field, value) => {
    setPatientInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleBookAppointment = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const appointmentDetails = {
      id: `APT-${Date.now()}`,
      hospital: hospital.name,
      department: departments.find(d => d.id === selectedDepartment)?.name,
      date: selectedDate,
      time: selectedTime,
      doctor: availableSlots[selectedTime]?.doctor,
      patient: patientInfo,
      condition,
      urgencyLevel,
      status: 'confirmed',
      confirmationNumber: `MR${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    };
    
    setLoading(false);
    onBookingComplete(appointmentDetails);
  };

  const isStep1Valid = selectedDate && selectedDepartment && selectedTime;
  const isStep2Valid = patientInfo.fullName && patientInfo.phone && patientInfo.age;

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Appointment Details</h3>
          
          {/* Department Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {departments.filter(dept => 
                hospital.specialties?.includes(dept.id) || dept.id === 'general'
              ).map(dept => (
                <label key={dept.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="department"
                    value={dept.id}
                    checked={selectedDepartment === dept.id}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-3 border rounded-lg ${
                    selectedDepartment === dept.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-medium">{dept.name}</div>
                    <div className="text-sm text-gray-500">Wait: {dept.waitTime}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {getNextAvailableDates().slice(0, 8).map(date => (
                <label key={date.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="date"
                    value={date.value}
                    checked={selectedDate === date.value}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-2 text-center border rounded-lg ${
                    selectedDate === date.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="text-sm font-medium">{date.label}</div>
                    {date.isToday && <div className="text-xs text-blue-600">Today</div>}
                    {date.isTomorrow && <div className="text-xs text-green-600">Tomorrow</div>}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && selectedDepartment && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Times
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                {Object.entries(availableSlots).map(([time, slot]) => (
                  <label key={time} className={`cursor-pointer ${!slot.available ? 'opacity-50' : ''}`}>
                    <input
                      type="radio"
                      name="time"
                      value={time}
                      checked={selectedTime === time}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={!slot.available}
                      className="sr-only"
                    />
                    <div className={`p-2 text-center border rounded-lg text-sm ${
                      selectedTime === time 
                        ? 'border-blue-500 bg-blue-50' 
                        : slot.available 
                        ? 'border-gray-200 hover:border-gray-300' 
                        : 'border-gray-100 bg-gray-50'
                    }`}>
                      <div className="font-medium">{time}</div>
                      {slot.available && slot.doctor && (
                        <div className="text-xs text-gray-500">{slot.doctor}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => setStep(2)}
            disabled={!isStep1Valid}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Next: Patient Details
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={patientInfo.fullName}
                onChange={(e) => handlePatientInfoChange('fullName', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input
                type="number"
                value={patientInfo.age}
                onChange={(e) => handlePatientInfoChange('age', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="25"
                min="1" max="120"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={patientInfo.phone}
                onChange={(e) => handlePatientInfoChange('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+27 82 123 4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={patientInfo.email}
                onChange={(e) => handlePatientInfoChange('email', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Aid
              </label>
              <select
                value={patientInfo.medicalAid}
                onChange={(e) => handlePatientInfoChange('medicalAid', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Medical Aid</option>
                <option value="discovery">Discovery Health</option>
                <option value="momentum">Momentum Health</option>
                <option value="bonitas">Bonitas Medical Fund</option>
                <option value="medshield">Medshield</option>
                <option value="gems">GEMS</option>
                <option value="none">No Medical Aid</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Aid Number
              </label>
              <input
                type="text"
                value={patientInfo.medicalAidNumber}
                onChange={(e) => handlePatientInfoChange('medicalAidNumber', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="MA123456789"
                disabled={!patientInfo.medicalAid || patientInfo.medicalAid === 'none'}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={patientInfo.additionalNotes}
              onChange={(e) => handlePatientInfoChange('additionalNotes', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional information about your condition or special requirements..."
            />
          </div>
        </div>

        {/* Appointment Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Appointment Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Hospital: {hospital.name}</div>
            <div>Department: {departments.find(d => d.id === selectedDepartment)?.name}</div>
            <div>Date: {new Date(selectedDate).toLocaleDateString('en-ZA', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
            <div>Time: {selectedTime}</div>
            {availableSlots[selectedTime]?.doctor && (
              <div>Doctor: {availableSlots[selectedTime].doctor}</div>
            )}
            <div>Condition: {condition}</div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setStep(1)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleBookAppointment}
            disabled={!isStep2Valid || loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Booking...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }
};

// src/components/appointments/AppointmentConfirmation.jsx
export const AppointmentConfirmation = ({ appointmentDetails, onNewAppointment, onViewDetails }) => {
  const handleAddToCalendar = () => {
    const startDate = new Date(`${appointmentDetails.date}T${appointmentDetails.time}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Medical Appointment - ${appointmentDetails.department}`)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`Hospital: ${appointmentDetails.hospital}\nDoctor: ${appointmentDetails.doctor}\nCondition: ${appointmentDetails.condition}`)}&location=${encodeURIComponent(appointmentDetails.hospital)}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h3>
        <p className="text-gray-600">Your appointment has been successfully booked.</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Confirmation Number:</span>
            <span className="font-mono text-lg">{appointmentDetails.confirmationNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Hospital:</span>
            <span>{appointmentDetails.hospital}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Department:</span>
            <span>{appointmentDetails.department}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Date & Time:</span>
            <span>{new Date(`${appointmentDetails.date}T${appointmentDetails.time}`).toLocaleString('en-ZA')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Doctor:</span>
            <span>{appointmentDetails.doctor}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-left text-sm text-blue-800">
            <p className="font-medium">Important Reminders:</p>
            <ul className="mt-1 space-y-1">
              <li>• Arrive 15 minutes early for check-in</li>
              <li>• Bring your ID and medical aid card</li>
              <li>• Bring any current medications or medical records</li>
              <li>• Call the hospital if you need to reschedule</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleAddToCalendar}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Add to Calendar</span>
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={onViewDetails}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            View Details
          </button>
          <button
            onClick={onNewAppointment}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Book Another
          </button>
        </div>
      </div>
    </div>
  );
};