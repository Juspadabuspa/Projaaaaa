// frontend/src/context/AppointmentContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { appointmentService, systemService } from '../services/api';

const AppointmentContext = createContext();

export const useAppointmentContext = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointmentContext must be used within an AppointmentProvider');
  }
  return context;
};

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load appointments, departments, and doctors in parallel
      const [appointmentsData, departmentsData, doctorsData] = await Promise.all([
        appointmentService.getAppointments(),
        systemService.getDepartments(),
        systemService.getDoctors()
      ]);

      // Process appointments - convert dateTime strings to Date objects
      const processedAppointments = appointmentsData.map(apt => ({
        ...apt,
        dateTime: new Date(apt.dateTime)
      }));

      setAppointments(processedAppointments);
      setDepartments(departmentsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load appointment data. Please try again.');
      
      // Set fallback data if API fails
      setDepartments([
        { id: 'emergency', name: 'Emergency', color: 'red' },
        { id: 'general', name: 'General Medicine', color: 'blue' },
        { id: 'cardiology', name: 'Cardiology', color: 'purple' },
        { id: 'pediatrics', name: 'Pediatrics', color: 'green' },
        { id: 'orthopedics', name: 'Orthopedics', color: 'orange' }
      ]);
      
      setDoctors([
        { id: 'all', name: 'All Doctors', department: 'all' },
        { id: 'dr_smith', name: 'Dr. Smith', department: 'emergency' },
        { id: 'dr_johnson', name: 'Dr. Johnson', department: 'general' },
        { id: 'dr_williams', name: 'Dr. Williams', department: 'cardiology' },
        { id: 'dr_brown', name: 'Dr. Brown', department: 'pediatrics' },
        { id: 'dr_davis', name: 'Dr. Davis', department: 'orthopedics' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const refreshAppointments = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const appointmentsData = await appointmentService.getAppointments(filters);
      const processedAppointments = appointmentsData.map(apt => ({
        ...apt,
        dateTime: new Date(apt.dateTime)
      }));
      setAppointments(processedAppointments);
    } catch (error) {
      console.error('Error refreshing appointments:', error);
      setError('Failed to refresh appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addAppointment = async (appointmentData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare data for API
      const apiData = {
        ...appointmentData,
        dateTime: appointmentData.dateTime.toISOString(),
        doctorId: appointmentData.doctor || appointmentData.doctorId
      };

      const newAppointment = await appointmentService.createAppointment(apiData);
      
      // Process the response and add to local state
      const processedAppointment = {
        ...newAppointment,
        dateTime: new Date(newAppointment.dateTime)
      };

      setAppointments(prev => [...prev, processedAppointment].sort((a, b) => a.dateTime - b.dateTime));
      
      return processedAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError('Failed to create appointment. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (updatedAppointment) => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare data for API
      const apiData = {
        ...updatedAppointment,
        dateTime: updatedAppointment.dateTime instanceof Date 
          ? updatedAppointment.dateTime.toISOString() 
          : updatedAppointment.dateTime
      };

      const updated = await appointmentService.updateAppointment(updatedAppointment.id, apiData);
      
      // Process the response and update local state
      const processedAppointment = {
        ...updated,
        dateTime: new Date(updated.dateTime)
      };

      setAppointments(prev => 
        prev.map(apt => apt.id === updatedAppointment.id ? processedAppointment : apt)
      );
      
      return processedAppointment;
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (appointmentId) => {
    setLoading(true);
    setError(null);
    
    try {
      await appointmentService.deleteAppointment(appointmentId);
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Failed to delete appointment. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    appointments,
    departments,
    doctors,
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    refreshAppointments,
    clearError
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export { AppointmentContext };