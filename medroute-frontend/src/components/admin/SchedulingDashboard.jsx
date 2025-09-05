// src/components/admin/SchedulingDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Filter, 
  Download, 
  Plus, 
  Users, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Edit,
  Save,
  X,
  RotateCcw
} from 'lucide-react';

// Helper functions (defined at top level to avoid recreation)
const getStatusColor = (status) => {
  const colors = {
    'confirmed': 'bg-green-100 text-green-800 border-green-200',
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'completed': 'bg-blue-100 text-blue-800 border-blue-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200',
    'no-show': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[status] || colors.pending;
};

const getPriorityColor = (priority) => {
  const colors = {
    'high': 'border-l-red-500',
    'medium': 'border-l-yellow-500',
    'low': 'border-l-green-500'
  };
  return colors[priority] || '';
};

// Edit Appointment Modal Component
const EditAppointmentModal = ({ appointment, onClose, onSave, departments, doctors }) => {
  const [formData, setFormData] = useState({
    patientName: appointment.patientName,
    patientId: appointment.patientId,
    phone: appointment.phone,
    department: appointment.department,
    doctor: appointment.doctorId,
    dateTime: appointment.dateTime.toISOString().slice(0, 16),
    duration: appointment.duration,
    condition: appointment.condition,
    status: appointment.status,
    priority: appointment.priority,
    notes: appointment.notes,
    insuranceProvider: appointment.insuranceProvider
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.doctor) newErrors.doctor = 'Doctor is required';
    if (!formData.dateTime) newErrors.dateTime = 'Date and time is required';
    if (!formData.condition.trim()) newErrors.condition = 'Condition is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const updatedAppointment = {
        ...appointment,
        ...formData,
        dateTime: new Date(formData.dateTime),
        departmentName: departments.find(d => d.id === formData.department)?.name || '',
        departmentColor: departments.find(d => d.id === formData.department)?.color || 'blue',
        doctor: doctors.find(d => d.id === formData.doctor)?.name || ''
      };
      onSave(updatedAppointment);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    formData.department === 'all' || doc.department === formData.department || doc.id === 'all'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-gray-900">Edit Appointment</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Patient Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Patient Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => handleChange('patientName', e.target.value)}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.patientName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter patient name"
                    />
                    {errors.patientName && (
                      <p className="text-sm text-red-600 mt-1">{errors.patientName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      value={formData.patientId}
                      onChange={(e) => handleChange('patientId', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter patient ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+27 123 456 7890"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurance Provider
                    </label>
                    <select
                      value={formData.insuranceProvider}
                      onChange={(e) => handleChange('insuranceProvider', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="None">None</option>
                      <option value="Discovery">Discovery</option>
                      <option value="Momentum">Momentum</option>
                      <option value="Bonitas">Bonitas</option>
                      <option value="Medscheme">Medscheme</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Appointment Details</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.department ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Department</option>
                      {departments.filter(d => d.id !== 'all').map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-sm text-red-600 mt-1">{errors.department}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor *
                    </label>
                    <select
                      value={formData.doctor}
                      onChange={(e) => handleChange('doctor', e.target.value)}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.doctor ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Doctor</option>
                      {filteredDoctors.filter(d => d.id !== 'all').map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                      ))}
                    </select>
                    {errors.doctor && (
                      <p className="text-sm text-red-600 mt-1">{errors.doctor}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.dateTime}
                      onChange={(e) => handleChange('dateTime', e.target.value)}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.dateTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.dateTime && (
                      <p className="text-sm text-red-600 mt-1">{errors.dateTime}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition/Reason *
                    </label>
                    <input
                      type="text"
                      value={formData.condition}
                      onChange={(e) => handleChange('condition', e.target.value)}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.condition ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Reason for visit"
                    />
                    {errors.condition && (
                      <p className="text-sm text-red-600 mt-1">{errors.condition}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No Show</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleChange('priority', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes or special instructions..."
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reschedule Modal Component
const RescheduleModal = ({ appointment, onClose, onReschedule }) => {
  const [newDateTime, setNewDateTime] = useState(
    appointment.dateTime.toISOString().slice(0, 16)
  );
  const [reason, setReason] = useState('');

  const handleReschedule = (e) => {
    e.preventDefault();
    if (newDateTime) {
      onReschedule({
        ...appointment,
        dateTime: new Date(newDateTime),
        rescheduleReason: reason
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-gray-900">Reschedule Appointment</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
            <p className="text-sm text-gray-600">{appointment.departmentName} - {appointment.doctor}</p>
            <p className="text-sm text-gray-600">
              Current: {appointment.dateTime.toLocaleDateString('en-ZA')} at {appointment.dateTime.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <form onSubmit={handleReschedule}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Date & Time *
              </label>
              <input
                type="datetime-local"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rescheduling
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Optional reason for rescheduling..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reschedule</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Appointment Details Modal Component (Updated)
const AppointmentDetailsModal = ({ appointment, onClose, onEdit, onReschedule, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-gray-900">Appointment Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Patient Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {appointment.patientName}</div>
                <div><span className="font-medium">ID:</span> {appointment.patientId}</div>
                <div><span className="font-medium">Phone:</span> {appointment.phone}</div>
                <div><span className="font-medium">Insurance:</span> {appointment.insuranceProvider}</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Appointment Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Date:</span> {appointment.dateTime.toLocaleDateString('en-ZA')}</div>
                <div><span className="font-medium">Time:</span> {appointment.dateTime.toLocaleTimeString('en-ZA')}</div>
                <div><span className="font-medium">Department:</span> {appointment.departmentName}</div>
                <div><span className="font-medium">Doctor:</span> {appointment.doctor}</div>
                <div><span className="font-medium">Duration:</span> {appointment.duration} minutes</div>
                <div><span className="font-medium">Condition:</span> {appointment.condition}</div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Priority:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded ${
                    appointment.priority === 'high' ? 'bg-red-100 text-red-800' :
                    appointment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {appointment.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
            <p className="text-sm text-gray-600">{appointment.notes}</p>
          </div>

          <div className="flex space-x-3 mt-6 pt-6 border-t">
            <button 
              onClick={onEdit}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button 
              onClick={onReschedule}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reschedule</span>
            </button>
            <button 
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Appointment Card Component (Updated)
const AppointmentCard = ({ appointment, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);

  const departments = [
    { id: 'all', name: 'All Departments', color: 'gray' },
    { id: 'emergency', name: 'Emergency', color: 'red' },
    { id: 'general', name: 'General Medicine', color: 'blue' },
    { id: 'cardiology', name: 'Cardiology', color: 'purple' },
    { id: 'pediatrics', name: 'Pediatrics', color: 'green' },
    { id: 'orthopedics', name: 'Orthopedics', color: 'orange' }
  ];

  const doctors = [
    { id: 'all', name: 'All Doctors', department: 'all' },
    { id: 'dr_smith', name: 'Dr. Smith', department: 'emergency' },
    { id: 'dr_johnson', name: 'Dr. Johnson', department: 'general' },
    { id: 'dr_williams', name: 'Dr. Williams', department: 'cardiology' },
    { id: 'dr_brown', name: 'Dr. Brown', department: 'pediatrics' },
    { id: 'dr_davis', name: 'Dr. Davis', department: 'orthopedics' }
  ];

  const handleEdit = () => {
    setShowDetails(false);
    setShowEdit(true);
  };

  const handleReschedule = () => {
    setShowDetails(false);
    setShowReschedule(true);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      const cancelledAppointment = { ...appointment, status: 'cancelled' };
      onUpdate(cancelledAppointment);
      setShowDetails(false);
    }
  };

  const handleSave = (updatedAppointment) => {
    onUpdate(updatedAppointment);
    setShowEdit(false);
  };

  const handleRescheduleConfirm = (rescheduledAppointment) => {
    onUpdate(rescheduledAppointment);
    setShowReschedule(false);
  };

  return (
    <>
      <div
        className={`p-3 rounded-lg border border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(appointment.priority)} bg-${appointment.departmentColor}-50 border-${appointment.departmentColor}-200`}
        onClick={() => setShowDetails(true)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="font-medium text-sm text-gray-900 truncate">
            {appointment.patientName}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div>{appointment.dateTime.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="flex items-center space-x-2">
            <span>{appointment.departmentName}</span>
            <span>•</span>
            <span>{appointment.doctor}</span>
          </div>
          <div className="truncate">{appointment.condition}</div>
        </div>
      </div>

      {showDetails && (
        <AppointmentDetailsModal 
          appointment={appointment} 
          onClose={() => setShowDetails(false)}
          onEdit={handleEdit}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
        />
      )}

      {showEdit && (
        <EditAppointmentModal
          appointment={appointment}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
          departments={departments}
          doctors={doctors}
        />
      )}

      {showReschedule && (
        <RescheduleModal
          appointment={appointment}
          onClose={() => setShowReschedule(false)}
          onReschedule={handleRescheduleConfirm}
        />
      )}
    </>
  );
};

// Main Scheduling Dashboard Component
export const SchedulingDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const departments = [
    { id: 'all', name: 'All Departments', color: 'gray' },
    { id: 'emergency', name: 'Emergency', color: 'red' },
    { id: 'general', name: 'General Medicine', color: 'blue' },
    { id: 'cardiology', name: 'Cardiology', color: 'purple' },
    { id: 'pediatrics', name: 'Pediatrics', color: 'green' },
    { id: 'orthopedics', name: 'Orthopedics', color: 'orange' }
  ];

  const doctors = [
    { id: 'all', name: 'All Doctors', department: 'all' },
    { id: 'dr_smith', name: 'Dr. Smith', department: 'emergency' },
    { id: 'dr_johnson', name: 'Dr. Johnson', department: 'general' },
    { id: 'dr_williams', name: 'Dr. Williams', department: 'cardiology' },
    { id: 'dr_brown', name: 'Dr. Brown', department: 'pediatrics' },
    { id: 'dr_davis', name: 'Dr. Davis', department: 'orthopedics' }
  ];

  useEffect(() => {
    generateMockAppointments();
  }, [currentDate, selectedDepartment, selectedDoctor, viewMode]);

  const handleAppointmentUpdate = (updatedAppointment) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    );
  };

  const generateMockAppointments = () => {
    setLoading(true);
    
    const mockAppointments = [];
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    
    if (viewMode === 'day') {
      endDate.setDate(startDate.getDate() + 1);
    } else if (viewMode === 'week') {
      startDate.setDate(startDate.getDate() - startDate.getDay());
      endDate.setDate(startDate.getDate() + 7);
    } else {
      startDate.setDate(1);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0);
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const dayAppointments = Math.floor(Math.random() * 12) + 8;
      
      for (let i = 0; i < dayAppointments; i++) {
        const hour = 8 + Math.floor(Math.random() * 9);
        const minute = Math.random() < 0.5 ? 0 : 30;
        const department = departments[Math.floor(Math.random() * (departments.length - 1)) + 1];
        const doctor = doctors.find(doc => doc.department === department.id) || doctors[1];
        
        const appointmentDate = new Date(d);
        appointmentDate.setHours(hour, minute, 0);

        const statuses = ['confirmed', 'pending', 'completed', 'cancelled', 'no-show'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        mockAppointments.push({
          id: `apt_${Date.now()}_${i}`,
          patientName: `Patient ${Math.floor(Math.random() * 1000)}`,
          patientId: `P${Math.floor(Math.random() * 10000)}`,
          phone: `+27 ${Math.floor(Math.random() * 900000000) + 100000000}`,
          department: department.id,
          departmentName: department.name,
          departmentColor: department.color,
          doctor: doctor.name,
          doctorId: doctor.id,
          dateTime: appointmentDate,
          duration: 30 + Math.floor(Math.random() * 30),
          condition: ['Routine Check-up', 'Follow-up', 'New Patient', 'Emergency'][Math.floor(Math.random() * 4)],
          status: status,
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          notes: 'Patient notes and additional information...',
          insuranceProvider: ['Discovery', 'Momentum', 'Bonitas', 'None'][Math.floor(Math.random() * 4)]
        });
      }
    }

    let filteredAppointments = mockAppointments;
    
    if (selectedDepartment !== 'all') {
      filteredAppointments = filteredAppointments.filter(apt => apt.department === selectedDepartment);
    }
    
    if (selectedDoctor !== 'all') {
      filteredAppointments = filteredAppointments.filter(apt => apt.doctorId === selectedDoctor);
    }

    if (searchTerm) {
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.condition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setAppointments(filteredAppointments.sort((a, b) => a.dateTime - b.dateTime));
    setLoading(false);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    
    setCurrentDate(newDate);
  };

  const formatDateRange = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-ZA', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long' });
    }
  };

  const getAppointmentsForTimeSlot = (hour, date = currentDate) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      return aptDate.getHours() === hour && 
             aptDate.toDateString() === date.toDateString();
    });
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 10 }, (_, i) => i + 8);
    
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Schedule for {formatDateRange()}</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {hours.map(hour => {
            const timeSlotAppointments = getAppointmentsForTimeSlot(hour);
            
            return (
              <div key={hour} className="flex">
                <div className="w-20 p-4 bg-gray-50 text-sm font-medium text-gray-500">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                
                <div className="flex-1 p-4">
                  {timeSlotAppointments.length === 0 ? (
                    <div className="text-gray-400 text-sm">No appointments</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {timeSlotAppointments.map(appointment => (
                        <AppointmentCard 
                          key={appointment.id} 
                          appointment={appointment} 
                          onUpdate={handleAppointmentUpdate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const hours = Array.from({ length: 10 }, (_, i) => i + 8);
    
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Week of {formatDateRange()}</h3>
        </div>
        
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-0 min-w-full">
            <div className="p-2 bg-gray-50 border-r text-sm font-medium text-gray-500">
              Time
            </div>
            
            {weekDays.map(day => (
              <div key={day.toISOString()} className="p-2 bg-gray-50 border-r text-center">
                <div className="text-sm font-medium text-gray-900">
                  {day.toLocaleDateString('en-ZA', { weekday: 'short' })}
                </div>
                <div className="text-xs text-gray-500">
                  {day.getDate()}
                </div>
              </div>
            ))}
            
            {hours.map(hour => (
              <React.Fragment key={hour}>
                <div className="p-2 bg-gray-50 border-r border-b text-sm text-gray-500">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                
                {weekDays.map(day => {
                  const dayAppointments = getAppointmentsForTimeSlot(hour, day);
                  
                  return (
                    <div key={`${hour}-${day.toISOString()}`} className="p-1 border-r border-b min-h-[60px]">
                      {dayAppointments.map(appointment => (
                        <div
                          key={appointment.id}
                          className={`text-xs p-1 mb-1 rounded border-l-2 cursor-pointer hover:shadow-sm ${getPriorityColor(appointment.priority)} bg-${appointment.departmentColor}-100 text-${appointment.departmentColor}-800`}
                          onClick={() => {
                            // Handle click for week view appointments
                          }}
                        >
                          <div className="font-medium truncate">{appointment.patientName}</div>
                          <div className="truncate">{appointment.condition}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startOfCalendar = new Date(startOfMonth);
    startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());
    
    const calendarDays = [];
    for (let d = new Date(startOfCalendar); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      calendarDays.push(new Date(d));
    }

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{formatDateRange()}</h3>
        </div>
        
        <div className="grid grid-cols-7 gap-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 bg-gray-50 border-b text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {calendarDays.map(day => {
            const dayAppointments = appointments.filter(apt => 
              apt.dateTime.toDateString() === day.toDateString()
            );
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={day.toISOString()}
                className={`p-2 border-b border-r min-h-[100px] ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${isToday ? 'font-bold text-blue-600' : ''}`}>
                  {day.getDate()}
                </div>
                
                <div className="mt-1 space-y-1">
                  {dayAppointments.slice(0, 3).map(appointment => (
                    <div
                      key={appointment.id}
                      className={`text-xs p-1 rounded bg-${appointment.departmentColor}-100 text-${appointment.departmentColor}-800 truncate cursor-pointer hover:shadow-sm`}
                      onClick={() => {
                        // Handle click for month view appointments
                      }}
                    >
                      {appointment.patientName}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayAppointments.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Scheduling</h1>
          <p className="text-gray-600">Manage hospital appointments and doctor schedules</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-lg font-semibold min-w-[200px] text-center">
              {formatDateRange()}
            </div>
            
            <button
              onClick={() => navigateDate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Today
            </button>
          </div>

          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {['day', 'week', 'month'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewMode === mode 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {doctors
                .filter(doc => selectedDepartment === 'all' || doc.department === selectedDepartment || doc.id === 'all')
                .map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Patient name or ID..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateMockAppointments}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">
                {appointments.length}
              </div>
              <div className="text-sm text-gray-500">Total Appointments</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => apt.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-500">Confirmed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => apt.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => apt.status === 'cancelled' || apt.status === 'no-show').length}
              </div>
              <div className="text-sm text-gray-500">Issues</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading appointments...</p>
        </div>
      ) : (
        <>
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </>
      )}
    </div>
  );
};