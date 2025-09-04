// src/components/ui/StatsGrid.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatsGrid = ({ data }) => {
  // Calculate trends (simulated)
  const generateTrend = (value) => {
    const change = Math.floor(Math.random() * 20) - 10; // -10 to +10
    return {
      change,
      isPositive: change > 0,
      isNeutral: change === 0
    };
  };

  const stats = [
    {
      value: data.daily_stats.consultations_today,
      label: 'Consultations Today',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: generateTrend(data.daily_stats.consultations_today)
    },
    {
      value: data.daily_stats.appointments_scheduled,
      label: 'Appointments Scheduled',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: generateTrend(data.daily_stats.appointments_scheduled)
    },
    {
      value: data.daily_stats.emergency_cases,
      label: 'Emergency Cases',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: generateTrend(data.daily_stats.emergency_cases)
    },
    {
      value: `${data.predictions.avg_system_utilization}%`,
      label: 'System Utilization',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: generateTrend(data.predictions.avg_system_utilization)
    }
  ];

  const getTrendIcon = (trend) => {
    if (trend.isNeutral) return <Minus className="w-4 h-4" />;
    return trend.isPositive ? 
      <TrendingUp className="w-4 h-4" /> : 
      <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = (trend, statLabel) => {
    if (trend.isNeutral) return 'text-gray-500';
    
    // For emergency cases, positive trend is bad
    if (statLabel.includes('Emergency')) {
      return trend.isPositive ? 'text-red-500' : 'text-green-500';
    }
    
    // For most other metrics, positive trend is good
    return trend.isPositive ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow`}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-gray-700 text-sm font-medium mb-2">
              {stat.label}
            </div>
            
            {/* Trend indicator */}
            <div className={`flex items-center justify-center space-x-1 text-xs ${getTrendColor(stat.trend, stat.label)}`}>
              {getTrendIcon(stat.trend)}
              <span>
                {stat.trend.isNeutral ? 'No change' : `${Math.abs(stat.trend.change)}% vs yesterday`}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};