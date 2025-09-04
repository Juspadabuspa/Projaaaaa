// src/components/dashboard/DashboardStats.jsx
import { User, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';

const STAT_CONFIGS = {
  consultations_today: { 
    icon: User, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-50',
    label: 'Consultations Today',
    description: 'Total patient consultations completed'
  },
  appointments_scheduled: { 
    icon: Calendar, 
    color: 'text-green-500',
    bgColor: 'bg-green-50', 
    label: 'Appointments Scheduled',
    description: 'Future appointments booked'
  },
  emergency_cases: { 
    icon: AlertTriangle, 
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    label: 'Emergency Cases',
    description: 'Emergency department admissions'
  },
  avg_severity: { 
    icon: TrendingUp, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    label: 'Avg Severity Score',
    description: 'Average patient severity rating'
  }
};

export const DashboardStats = ({ stats }) => {
  const generateTrendData = (key, value) => {
    // Simulate trend data - in a real app this would come from the API
    const trends = {
      consultations_today: { change: 12, isPositive: true },
      appointments_scheduled: { change: -5, isPositive: false },
      emergency_cases: { change: 8, isPositive: false }, // Positive change is bad for emergencies
      avg_severity: { change: -2, isPositive: true } // Lower severity is better
    };
    
    return trends[key] || { change: 0, isPositive: true };
  };

  const formatStatValue = (key, value) => {
    if (key === 'avg_severity') {
      return value.toFixed(1);
    }
    return value.toString();
  };

  const getTrendColor = (key, trend) => {
    // For emergency cases, positive trend is bad
    if (key === 'emergency_cases') {
      return trend.change > 0 ? 'text-red-500' : 'text-green-500';
    }
    // For severity, lower is better
    if (key === 'avg_severity') {
      return trend.change < 0 ? 'text-green-500' : 'text-red-500';
    }
    // For other metrics, positive is good
    return trend.isPositive ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(stats).map(([key, value]) => {
        const config = STAT_CONFIGS[key];
        if (!config) return null;
        
        const IconComponent = config.icon;
        const trend = generateTrendData(key, value);
        const trendColor = getTrendColor(key, trend);
        const displayValue = formatStatValue(key, value);
        
        return (
          <div key={key} className={`${config.bgColor} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`w-8 h-8 ${config.color}`} />
                  <div className={`flex items-center text-sm ${trendColor}`}>
                    {trend.change !== 0 && (
                      <>
                        {trend.change > 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          </svg>
                        )}
                        <span>{Math.abs(trend.change)}%</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className={`text-2xl font-bold mb-1 ${config.color.replace('text-', 'text-').replace('-500', '-600')}`}>
                  {displayValue}
                </div>
                
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {config.label}
                </div>
                
                <div className="text-xs text-gray-500">
                  {config.description}
                </div>
                
                {/* Additional context */}
                {key === 'emergency_cases' && value > 15 && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    Above average volume
                  </div>
                )}
                
                {key === 'avg_severity' && value > 7 && (
                  <div className="mt-2 text-xs text-orange-600 font-medium">
                    High severity cases
                  </div>
                )}
                
                {key === 'consultations_today' && (
                  <div className="mt-2 text-xs text-gray-500">
                    Target: 150/day
                  </div>
                )}
              </div>
            </div>
            
            {/* Mini progress bar for visual interest */}
            <div className="mt-4">
              {key === 'consultations_today' && (
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((value / 150) * 100, 100)}%` }}
                  ></div>
                </div>
              )}
              
              {key === 'appointments_scheduled' && (
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              )}
              
              {key === 'avg_severity' && (
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-1000 ${
                      value > 7 ? 'bg-red-500' : value > 5 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(value / 10) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};