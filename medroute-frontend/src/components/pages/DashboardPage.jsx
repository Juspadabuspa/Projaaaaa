// src/components/pages/DashboardPage.jsx - Updated with scheduling integration
import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { DashboardStats } from '../dashboard/DashboardStats';
import { CapacityReport } from '../dashboard/CapacityReport';
import { SystemAlerts } from '../dashboard/SystemAlerts';
import { SystemPredictions } from '../dashboard/SystemPredictions';
import { QuickActions } from '../dashboard/QuickActions';
import { SchedulingDashboard } from '../admin/SchedulingDashboard';
import { useDashboard } from '../../context/DashboardContext';

export const DashboardPage = ({ onNavigate }) => {
  const { dashboardData, loading, refreshDashboard } = useDashboard();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, scheduling, reports

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
      // In a real app, this would trigger a data refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleManualRefresh = async () => {
    setLastUpdated(new Date());
    await refreshDashboard();
  };

  const formatLastUpdated = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  const getSystemHealthStatus = () => {
    const avgUtilization = dashboardData.predictions.avg_system_utilization;
    const criticalAlerts = dashboardData.alerts.filter(alert => alert.type === 'CRITICAL_CAPACITY').length;
    
    if (criticalAlerts > 0 || avgUtilization > 90) {
      return { status: 'Critical', color: 'text-red-600 bg-red-100', icon: '🚨' };
    } else if (avgUtilization > 75) {
      return { status: 'Warning', color: 'text-orange-600 bg-orange-100', icon: '⚠️' };
    } else {
      return { status: 'Healthy', color: 'text-green-600 bg-green-100', icon: '✅' };
    }
  };

  const systemHealth = getSystemHealthStatus();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'scheduling', name: 'Appointments', icon: Calendar },
    { id: 'reports', name: 'Reports', icon: Users }
  ];

  if (activeTab === 'scheduling') {
    return <SchedulingDashboard />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center mb-4 sm:mb-0">
          <Activity className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Hospital Dashboard</h2>
            <p className="text-gray-600">Real-time system monitoring and management</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* System Health Indicator */}
          <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${systemHealth.color}`}>
            <span className="mr-1">{systemHealth.icon}</span>
            {systemHealth.status}
          </div>
          
          {/* Auto-refresh Toggle */}
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-600">Auto-refresh</span>
          </label>
          
          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="mb-6 text-sm text-gray-500">
        Last updated: {formatLastUpdated(lastUpdated)} • 
        Next auto-refresh: {autoRefresh ? '30s' : 'Disabled'}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Updating dashboard...</span>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          {/* Today's Appointment Overview */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Today's Appointments</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-gray-900">147</div>
                    <div className="text-sm text-gray-500">Total Scheduled</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-gray-900">89</div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-gray-900">34</div>
                    <div className="text-sm text-gray-500">Pending</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-gray-900">8</div>
                    <div className="text-sm text-gray-500">No-shows</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions with Scheduling */}
          <section className="mb-8">
            <QuickActions onNavigate={onNavigate} />
          </section>

          {/* Daily Statistics */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">System Statistics</h3>
            <DashboardStats stats={dashboardData.daily_stats} />
          </section>

          {/* Department Capacity */}
          <section className="mb-8">
            <CapacityReport capacityData={dashboardData.capacity_report} />
          </section>
          
          {/* Alerts and Predictions Grid */}
          <section className="mb-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <SystemAlerts alerts={dashboardData.alerts} />
              <SystemPredictions predictions={dashboardData.predictions} />
            </div>
          </section>

          {/* Recent Appointments Summary */}
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Booking Activity</h3>
                <button
                  onClick={() => setActiveTab('scheduling')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All Appointments →
                </button>
              </div>
              
              <div className="space-y-3">
                {[
                  { time: '14:30', patient: 'Sarah Johnson', department: 'Cardiology', status: 'confirmed' },
                  { time: '15:00', patient: 'Michael Brown', department: 'General Medicine', status: 'pending' },
                  { time: '15:30', patient: 'Emma Davis', department: 'Pediatrics', status: 'confirmed' },
                  { time: '16:00', patient: 'David Wilson', department: 'Orthopedics', status: 'confirmed' },
                  { time: '16:30', patient: 'Lisa Anderson', department: 'Emergency', status: 'completed' }
                ].map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900">{appointment.time}</div>
                      <div className="text-sm text-gray-600">{appointment.patient}</div>
                      <div className="text-xs text-gray-500">• {appointment.department}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'reports' && (
        <section>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Reports</h3>
            <p className="text-gray-600 mb-6">
              Detailed analytics and reporting features will be available here.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Patient Flow Report</h4>
                <p className="text-sm text-gray-600">Track patient movement and wait times</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Department Efficiency</h4>
                <p className="text-sm text-gray-600">Analyze department performance metrics</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Financial Analytics</h4>
                <p className="text-sm text-gray-600">Revenue and cost analysis</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Additional Metrics */}
      <section>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Object.keys(dashboardData.capacity_report).length}
              </div>
              <div className="text-sm text-gray-600">Active Departments</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {dashboardData.alerts.length}
              </div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(dashboardData.predictions.avg_system_utilization)}%
              </div>
              <div className="text-sm text-gray-600">Overall Efficiency</div>
            </div>
          </div>
          
          {/* System Status Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">System Load</span>
              <span className="text-sm text-gray-600">
                {dashboardData.predictions.avg_system_utilization}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  dashboardData.predictions.avg_system_utilization > 90 ? 'bg-red-500' :
                  dashboardData.predictions.avg_system_utilization > 75 ? 'bg-orange-500' :
                  dashboardData.predictions.avg_system_utilization > 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${dashboardData.predictions.avg_system_utilization}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>Dashboard refreshes automatically every 30 seconds when enabled</p>
        <p className="mt-1">For urgent issues, use the Emergency Alert quick action above</p>
      </div>
    </div>
  );
};