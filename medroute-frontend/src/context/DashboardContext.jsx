// src/context/DashboardContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState({
    daily_stats: {
      consultations_today: 147,
      appointments_scheduled: 89,
      emergency_cases: 12,
      avg_severity: 6.2
    },
    capacity_report: {
      'emergency': { 
        name: 'Emergency', 
        utilization_rate: 85, 
        status: 'HIGH', 
        available_slots: 3 
      },
      'cardiology': { 
        name: 'Cardiology', 
        utilization_rate: 72, 
        status: 'MODERATE', 
        available_slots: 8 
      },
      'general': { 
        name: 'General Medicine', 
        utilization_rate: 91, 
        status: 'CRITICAL', 
        available_slots: 2 
      },
      'pediatrics': { 
        name: 'Pediatrics', 
        utilization_rate: 45, 
        status: 'LOW', 
        available_slots: 12 
      }
    },
    alerts: [
      { 
        type: 'CRITICAL_CAPACITY', 
        department: 'General Medicine', 
        message: 'General Medicine at 91% capacity' 
      },
      { 
        type: 'HIGH_CAPACITY', 
        department: 'Emergency', 
        message: 'Emergency approaching capacity (85%)' 
      }
    ],
    predictions: {
      avg_system_utilization: 73.2,
      recommended_staffing_adjustment: 'increase',
      capacity_forecast_6h: 88
    }
  });

  const [loading, setLoading] = useState(false);

  // Function to refresh dashboard data (simulate real-time updates)
  const refreshDashboard = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate some data changes
      setDashboardData(prevData => ({
        ...prevData,
        daily_stats: {
          ...prevData.daily_stats,
          consultations_today: prevData.daily_stats.consultations_today + Math.floor(Math.random() * 5),
          emergency_cases: prevData.daily_stats.emergency_cases + Math.floor(Math.random() * 2)
        }
      }));
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to update capacity for a specific department
  const updateDepartmentCapacity = (departmentId, newData) => {
    setDashboardData(prevData => ({
      ...prevData,
      capacity_report: {
        ...prevData.capacity_report,
        [departmentId]: {
          ...prevData.capacity_report[departmentId],
          ...newData
        }
      }
    }));
  };

  // Auto-refresh every 5 minutes (simulated)
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, you might want to refresh data periodically
      // refreshDashboard();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const value = {
    dashboardData,
    loading,
    refreshDashboard,
    updateDepartmentCapacity
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};