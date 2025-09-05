// src/components/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertTriangle,
  CheckCircle,
  Building,
  User
} from 'lucide-react';
import { useUserMode } from '../../context/UserModeContext';

export const AdminLogin = ({ onNavigate }) => {
  const { initializeAdminMode } = useUserMode();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    hospitalId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const hospitals = [
    { id: 'hosp_001', name: 'Metro General Hospital' },
    { id: 'hosp_002', name: 'St. Mary\'s Medical Center' },
    { id: 'hosp_003', name: 'Children\'s Specialized Hospital' },
    { id: 'hosp_004', name: 'University Hospital' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock authentication - in production, this would call your backend
      if (credentials.username && credentials.password && credentials.hospitalId) {
        // Demo credentials for testing
        const validCredentials = [
          { username: 'admin', password: 'admin123' },
          { username: 'doctor', password: 'doctor123' },
          { username: 'nurse', password: 'nurse123' }
        ];

        const isValid = validCredentials.some(cred => 
          cred.username === credentials.username && cred.password === credentials.password
        );

        if (isValid) {
          initializeAdminMode();
          onNavigate('dashboard');
        } else {
          setError('Invalid username or password');
        }
      } else {
        setError('Please fill in all fields');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setCredentials({
      username: 'admin',
      password: 'admin123',
      hospitalId: 'hosp_001'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('entry')}
          className="flex items-center space-x-2 text-blue-200 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Main</span>
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-blue-100 p-3 rounded-full inline-block mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hospital Staff Login</h1>
            <p className="text-gray-600">Access your hospital dashboard</p>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Demo Credentials</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Username:</strong> admin, doctor, or nurse</p>
                  <p><strong>Password:</strong> admin123, doctor123, or nurse123</p>
                </div>
                <button
                  onClick={handleDemoLogin}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Fill demo credentials
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Hospital Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={credentials.hospitalId}
                  onChange={(e) => setCredentials({...credentials, hospitalId: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select your hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Authorized personnel only</p>
            <p className="mt-1">Contact IT support for access issues</p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-800 bg-opacity-50 backdrop-blur rounded-lg p-4 text-blue-100 text-sm">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Security Notice</p>
              <p>This system is for authorized hospital staff only. All activities are logged and monitored.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};