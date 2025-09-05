// frontend/src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging (optional)
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.error('Resource not found');
    } else if (error.response?.status === 500) {
      console.error('Server error');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    
    return Promise.reject(error);
  }
);

// Appointment API functions
export const appointmentService = {
  // Get all appointments with optional filters
  getAppointments: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.department && filters.department !== 'all') {
        params.append('department', filters.department);
      }
      if (filters.doctor && filters.doctor !== 'all') {
        params.append('doctor', filters.doctor);
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.dateFrom) {
        params.append('date_from', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append('date_to', filters.dateTo);
      }
      
      const response = await api.get(`/appointments?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Create new appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Update existing appointment
  updateAppointment: async (appointmentId, appointmentData) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  // Delete appointment
  deleteAppointment: async (appointmentId) => {
    try {
      const response = await api.delete(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }
};

// Triage API functions
export const triageService = {
  // Submit triage assessment
  submitAssessment: async (assessmentData) => {
    try {
      const response = await api.post('/triage/assess', assessmentData);
      return response.data;
    } catch (error) {
      console.error('Error submitting triage assessment:', error);
      throw error;
    }
  }
};

// System API functions
export const systemService = {
  // Get departments
  getDepartments: async () => {
    try {
      const response = await api.get('/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  // Get doctors
  getDoctors: async () => {
    try {
      const response = await api.get('/doctors');
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  // Get facilities
  getFacilities: async () => {
    try {
      const response = await api.get('/facilities');
      return response.data;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      throw error;
    }
  },

  // Get system health
  getHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking system health:', error);
      throw error;
    }
  },

  // Get system statistics
  getStats: async () => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  }
};

// Emergency API functions
export const emergencyService = {
  // Find emergency hospitals
  findEmergencyHospitals: async (locationData) => {
    try {
      const response = await api.post('/emergency-hospitals', locationData);
      return response.data;
    } catch (error) {
      console.error('Error finding emergency hospitals:', error);
      throw error;
    }
  },

  // Get facility capacity
  getFacilityCapacity: async (facilityId) => {
    try {
      const response = await api.get(`/facilities/${facilityId}/capacity`);
      return response.data;
    } catch (error) {
      console.error('Error fetching facility capacity:', error);
      throw error;
    }
  }
};

export default api;