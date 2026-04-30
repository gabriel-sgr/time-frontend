import { useState, useEffect } from 'react';
import { FiUpload, FiSave } from 'react-icons/fi';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ManageSettings() {
  const [settings, setSettings] = useState(null);
  const [schoolName, setSchoolName] = useState('');
  const [assemblyDay, setAssemblyDay] = useState(1);
  const [assemblyStartTime, setAssemblyStartTime] = useState('07:50');
  const [assemblyEndTime, setAssemblyEndTime] = useState('08:10');
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/settings`);
      setSettings(res.data);
      setSchoolName(res.data.school_name || '');
      setAssemblyDay(res.data.assembly_day || 1);
      setAssemblyStartTime(res.data.assembly_start_time || '07:50');
      setAssemblyEndTime(res.data.assembly_end_time || '08:10');
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) return alert('Please select a logo');
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      await axios.post(`${API_URL}/settings/logo`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      setLogoFile(null);
      fetchSettings();
      alert('Logo updated successfully');
    } catch (err) {
      console.error('Error uploading logo:', err);
      alert(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setSaving(false);
    }
  };

  const handleSchoolNameUpdate = async (e) => {
    e.preventDefault();
    if (!schoolName) return alert('School name is required');
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_URL}/settings/school-name`, { school_name: schoolName }, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });
      
      fetchSettings();
      alert('School name updated successfully');
    } catch (err) {
      console.error('Error updating school name:', err);
      alert(err.response?.data?.message || 'Failed to update school name');
    } finally {
      setSaving(false);
    }
  };

  const handleAssemblyUpdate = async (e) => {
    e.preventDefault();
    if (!assemblyDay || !assemblyStartTime || !assemblyEndTime) {
      return alert('All assembly fields are required');
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_URL}/settings/assembly`, {
        assembly_day: parseInt(assemblyDay),
        assembly_start_time: assemblyStartTime,
        assembly_end_time: assemblyEndTime
      }, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });
      
      fetchSettings();
      alert('Assembly settings updated successfully');
    } catch (err) {
      console.error('Error updating assembly settings:', err);
      alert(err.response?.data?.message || 'Failed to update assembly settings');
    } finally {
      setSaving(false);
    }
  };

  
  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading settings...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">School Logo</h2>
          
          <div className="mb-4">
            {settings?.logo_path ? (
              <img
                src={`${API_BASE}${settings.logo_path}`}
                alt="School Logo"
                className="w-32 h-32 object-contain bg-gray-50 rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
                No logo
              </div>
            )}
          </div>

          <form onSubmit={handleLogoUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-brand-400 transition-colors"
                onClick={() => document.getElementById('logo-input').click()}>
                <FiUpload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-500 text-sm">{logoFile ? logoFile.name : 'Click to select logo'}</p>
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Supported formats: JPEG, PNG, GIF, WebP, SVG (Max 5MB)</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50 flex items-center gap-2">
              <FiSave /> {saving ? 'Uploading...' : 'Update Logo'}
            </button>
          </form>
        </div>

        {/* School Name */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">School Name</h2>
          
          <form onSubmit={handleSchoolNameUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="input-field"
                placeholder="Enter school name"
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50 flex items-center gap-2">
              <FiSave /> {saving ? 'Saving...' : 'Update School Name'}
            </button>
          </form>
        </div>

        {/* Assembly Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Assembly Settings</h2>
          
          <form onSubmit={handleAssemblyUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assembly Day</label>
              <select
                value={assemblyDay}
                onChange={(e) => setAssemblyDay(parseInt(e.target.value))}
                className="select-field"
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
                <option value={7}>Sunday</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={assemblyStartTime}
                  onChange={(e) => setAssemblyStartTime(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={assemblyEndTime}
                  onChange={(e) => setAssemblyEndTime(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50 flex items-center gap-2">
              <FiSave /> {saving ? 'Saving...' : 'Update Assembly Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
