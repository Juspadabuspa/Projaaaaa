// src/utils/styleHelpers.js

/**
 * Gets the appropriate color classes for urgency levels
 * @param {string} urgency - The urgency level
 * @returns {string} - Tailwind classes for text and background colors
 */
export const getUrgencyColor = (urgency) => {
  const colors = {
    'EMERGENCY': 'text-red-700 bg-red-100 border-red-300',
    'URGENT': 'text-orange-700 bg-orange-100 border-orange-300',
    'SEMI_URGENT': 'text-yellow-700 bg-yellow-100 border-yellow-300',
    'STANDARD': 'text-blue-700 bg-blue-100 border-blue-300',
    'ROUTINE': 'text-green-700 bg-green-100 border-green-300'
  };
  return colors[urgency] || colors.STANDARD;
};

/**
 * Gets the appropriate color classes for capacity status
 * @param {string} status - The capacity status
 * @returns {string} - Tailwind classes for text, background, and border colors
 */
export const getCapacityColor = (status) => {
  const colors = {
    'CRITICAL': 'text-red-600 bg-red-100 border-red-200',
    'HIGH': 'text-orange-600 bg-orange-100 border-orange-200',
    'MODERATE': 'text-yellow-600 bg-yellow-100 border-yellow-200',
    'LOW': 'text-green-600 bg-green-100 border-green-200'
  };
  return colors[status] || colors.MODERATE;
};

/**
 * Gets severity level based on numeric score
 * @param {number} score - Severity score (1-10)
 * @returns {object} - Object with level and color information
 */
export const getSeverityLevel = (score) => {
  if (score <= 3) {
    return {
      level: 'LOW',
      color: 'text-green-600 bg-green-100',
      description: 'Low severity - routine care'
    };
  } else if (score <= 6) {
    return {
      level: 'MODERATE',
      color: 'text-yellow-600 bg-yellow-100',
      description: 'Moderate severity - prompt attention'
    };
  } else if (score <= 8) {
    return {
      level: 'HIGH',
      color: 'text-orange-600 bg-orange-100',
      description: 'High severity - urgent care needed'
    };
  } else {
    return {
      level: 'CRITICAL',
      color: 'text-red-600 bg-red-100',
      description: 'Critical severity - immediate attention'
    };
  }
};

/**
 * Gets department-specific colors
 * @param {string} department - Department name
 * @returns {string} - Tailwind color classes
 */
export const getDepartmentColor = (department) => {
  const colors = {
    'emergency': 'text-red-600 bg-red-50 border-red-200',
    'cardiology': 'text-purple-600 bg-purple-50 border-purple-200',
    'general': 'text-blue-600 bg-blue-50 border-blue-200',
    'pediatrics': 'text-pink-600 bg-pink-50 border-pink-200',
    'neurology': 'text-indigo-600 bg-indigo-50 border-indigo-200',
    'orthopedics': 'text-cyan-600 bg-cyan-50 border-cyan-200'
  };
  return colors[department] || colors.general;
};

/**
 * Formats urgency level for display
 * @param {string} urgency - Raw urgency level
 * @returns {string} - Formatted urgency level
 */
export const formatUrgencyLevel = (urgency) => {
  const formatted = {
    'EMERGENCY': 'Emergency',
    'URGENT': 'Urgent',
    'SEMI_URGENT': 'Semi-Urgent',
    'STANDARD': 'Standard',
    'ROUTINE': 'Routine'
  };
  return formatted[urgency] || urgency;
};

/**
 * Formats department names for display
 * @param {string} department - Raw department name
 * @returns {string} - Formatted department name
 */
export const formatDepartmentName = (department) => {
  const formatted = {
    'emergency': 'Emergency Department',
    'cardiology': 'Cardiology',
    'general': 'General Medicine',
    'pediatrics': 'Pediatrics',
    'neurology': 'Neurology',
    'orthopedics': 'Orthopedics'
  };
  return formatted[department] || department.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Gets the appropriate icon color based on severity
 * @param {number} severity - Severity score
 * @returns {string} - Tailwind text color class
 */
export const getSeverityIconColor = (severity) => {
  if (severity <= 3) return 'text-green-500';
  if (severity <= 6) return 'text-yellow-500';
  if (severity <= 8) return 'text-orange-500';
  return 'text-red-500';
};

/**
 * Gets alert type colors
 * @param {string} alertType - Type of alert
 * @returns {string} - Tailwind color classes
 */
export const getAlertTypeColor = (alertType) => {
  const colors = {
    'CRITICAL_CAPACITY': 'text-red-700 bg-red-50 border-red-300',
    'HIGH_CAPACITY': 'text-orange-700 bg-orange-50 border-orange-300',
    'MODERATE_CAPACITY': 'text-yellow-700 bg-yellow-50 border-yellow-300',
    'LOW_CAPACITY': 'text-green-700 bg-green-50 border-green-300',
    'SYSTEM_ERROR': 'text-red-700 bg-red-50 border-red-300',
    'MAINTENANCE': 'text-blue-700 bg-blue-50 border-blue-300',
    'INFO': 'text-gray-700 bg-gray-50 border-gray-300'
  };
  return colors[alertType] || colors.INFO;
};

/**
 * Gets utilization color based on percentage
 * @param {number} utilization - Utilization percentage (0-100)
 * @returns {object} - Object with color classes and status
 */
export const getUtilizationColor = (utilization) => {
  if (utilization >= 90) {
    return {
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      status: 'CRITICAL'
    };
  } else if (utilization >= 75) {
    return {
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      status: 'HIGH'
    };
  } else if (utilization >= 50) {
    return {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
      status: 'MODERATE'
    };
  } else {
    return {
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      status: 'LOW'
    };
  }
};

/**
 * Gets priority badge colors
 * @param {number} priority - Priority score (0-100)
 * @returns {string} - Tailwind color classes
 */
export const getPriorityColor = (priority) => {
  if (priority >= 90) return 'text-red-700 bg-red-100 border-red-300';
  if (priority >= 70) return 'text-orange-700 bg-orange-100 border-orange-300';
  if (priority >= 50) return 'text-yellow-700 bg-yellow-100 border-yellow-300';
  return 'text-green-700 bg-green-100 border-green-300';
};

/**
 * Formats time duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted time string
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  } else {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
};

/**
 * Gets loading spinner classes
 * @param {string} size - Size of spinner (sm, md, lg)
 * @returns {string} - Tailwind classes for spinner
 */
export const getSpinnerClasses = (size = 'md') => {
  const sizes = {
    'sm': 'w-4 h-4',
    'md': 'w-6 h-6',
    'lg': 'w-8 h-8'
  };
  return `${sizes[size]} border-2 border-current border-t-transparent rounded-full animate-spin`;
};

/**
 * Gets button variant classes
 * @param {string} variant - Button variant (primary, secondary, danger, success)
 * @param {string} size - Button size (sm, md, lg)
 * @returns {string} - Tailwind classes for button
 */
export const getButtonClasses = (variant = 'primary', size = 'md') => {
  const variants = {
    'primary': 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    'secondary': 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    'danger': 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    'success': 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    'outline': 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
  };
  
  const sizes = {
    'sm': 'px-3 py-1.5 text-sm',
    'md': 'px-4 py-2 text-base',
    'lg': 'px-6 py-3 text-lg'
  };
  
  return `${variants[variant]} ${sizes[size]} font-medium rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`;
};

/**
 * Gets card classes with hover effects
 * @param {boolean} hover - Whether to include hover effects
 * @param {string} padding - Padding size (sm, md, lg)
 * @returns {string} - Tailwind classes for card
 */
export const getCardClasses = (hover = true, padding = 'md') => {
  const paddings = {
    'sm': 'p-4',
    'md': 'p-6',
    'lg': 'p-8'
  };
  
  const baseClasses = `bg-white rounded-lg shadow-lg border border-gray-200 ${paddings[padding]}`;
  const hoverClasses = hover ? 'hover:shadow-xl transition-shadow cursor-pointer' : '';
  
  return `${baseClasses} ${hoverClasses}`;
};

/**
 * Gets trend indicator classes
 * @param {number} change - Percentage change
 * @param {boolean} inverse - Whether positive change is bad (e.g., for errors)
 * @returns {object} - Object with color and icon information
 */
export const getTrendClasses = (change, inverse = false) => {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;
  
  if (isNeutral) {
    return {
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      icon: 'minus'
    };
  }
  
  const goodChange = inverse ? isNegative : isPositive;
  
  return {
    color: goodChange ? 'text-green-600' : 'text-red-600',
    bgColor: goodChange ? 'bg-green-100' : 'bg-red-100',
    icon: isPositive ? 'trending-up' : 'trending-down'
  };
};

/**
 * Truncates text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Gets responsive classes for grid layouts
 * @param {number} cols - Number of columns on large screens
 * @returns {string} - Responsive grid classes
 */
export const getResponsiveGridClasses = (cols = 3) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid md:grid-cols-2',
    3: 'grid md:grid-cols-2 lg:grid-cols-3',
    4: 'grid md:grid-cols-2 lg:grid-cols-4',
    6: 'grid md:grid-cols-3 lg:grid-cols-6'
  };
  
  return gridClasses[cols] || gridClasses[3];
};