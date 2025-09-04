// src/components/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { DashboardStats } from '../dashboard/DashboardStats';
import { CapacityReport } from '../dashboard/CapacityReport';
import { SystemAlerts } from '../dashboard/SystemAlerts';
import { SystemPredictions } from '../dashboard/SystemPredictions';
import { QuickActions } from '../dashboard/QuickActions';
import { useDashboard } from '../../context/DashboardContext';

export const DashboardPage = ({ onNavigate }) => {
  const { dashboardData, loading, refreshDashboard } = useDashboard();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

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

      {/* Daily Statistics */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Today's Statistics</h3>
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

      {/* Quick Actions */}
      <section className="mb-8">
        <QuickActions onNavigate={onNavigate} />
      </section>

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