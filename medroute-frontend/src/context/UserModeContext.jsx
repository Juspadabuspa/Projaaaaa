// src/context/UserModeContext.jsx
import React, { createContext, useContext, useState } from 'react';

const UserModeContext = createContext();

export const useUserMode = () => {
  const context = useContext(UserModeContext);
  if (!context) {
    throw new Error('useUserMode must be used within a UserModeProvider');
  }
  return context;
};

export const UserModeProvider = ({ children }) => {
  const [userType, setUserType] = useState(null); // 'patient' or 'admin'
  const [patientMode, setPatientMode] = useState(null); // 'unknown' or 'known'
  const [userLocation, setUserLocation] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const initializePatientMode = (mode) => {
    setUserType('patient');
    setPatientMode(mode);
  };

  const initializeAdminMode = () => {
    setUserType('admin');
    setPatientMode(null);
  };

  const triggerEmergency = (location = null) => {
    setIsEmergency(true);
    if (location) setUserLocation(location);
  };

  const clearEmergency = () => {
    setIsEmergency(false);
  };

  const resetUserMode = () => {
    setUserType(null);
    setPatientMode(null);
    setIsEmergency(false);
    setSelectedHospital(null);
  };

  const value = {
    userType,
    patientMode,
    userLocation,
    isEmergency,
    selectedHospital,
    setUserType,
    setUserLocation,
    setSelectedHospital,
    initializePatientMode,
    initializeAdminMode,
    triggerEmergency,
    clearEmergency,
    resetUserMode
  };

  return (
    <UserModeContext.Provider value={value}>
      {children}
    </UserModeContext.Provider>
  );
};