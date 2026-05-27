import { useState, useEffect } from 'react';
import { FiSave, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function AdminProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        fullName: user.fullName || ''
      }));
    }
  }, [user]);

  const validateForm = () => {
    if (!formData.username.trim()) {
      setErrorMessage('Username is required');
      return false;
    }
    if (!formData.fullName.trim()) {
      setErrorMessage('Full name is required');
      return false;
    }
    if (showPasswordFields) {
      if (!formData.currentPassword) {
        setErrorMessage('Current password is required to change password');
        return false;
      }
      if (!formData.newPassword) {
        setErrorMessage('New password is required');
        return false;
      }
      if (formData.newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters');
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMessage('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        username: formData.username,
        fullName: formData.fullName
      };

      if (showPasswordFields && formData.newPassword) {
        // First verify current password
        try {
          await axios.post(`${API_URL}/auth/login`, {
            username: user.username,
            password: formData.currentPassword
          });
        } catch (err) {
          setErrorMessage('Current password is incorrect');
          setLoading(false);
          return;
        }
        updateData.password = formData.newPassword;
      }

      const response = await api.put(`/auth/update-profile`, updateData);
      
      setSuccessMessage('Profile updated successfully!');
      
      // Clear password fields after success
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowPasswordFields(false);

      // Refresh token if password was changed
      if (showPasswordFields && formData.newPassword) {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
          username: formData.username,
          password: formData.newPassword
        });
        localStorage.setItem('token', loginRes.data.token);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Profile Settings</h1>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded-lg flex items-center gap-2 text-green-700">
            <FiCheck size={20} />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg flex items-center gap-2 text-red-700">
            <FiAlertCircle size={20} />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Your unique login username
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Your display name throughout the system
            </p>
          </div>

          {/* Password Section */}
          <div className="border-t pt-6">
            <button
              type="button"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4"
            >
              {showPasswordFields ? '✕ Hide Password Options' : '+ Change Password'}
            </button>

            {showPasswordFields && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  <p className="font-medium mb-1">⚠️ Security Notice</p>
                  <p>You will need to verify your current password to change it.</p>
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your current password"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password (minimum 6 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Re-enter your new password"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              <FiSave size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All changes are saved immediately. If you change your password, you will remain logged in with your new credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
