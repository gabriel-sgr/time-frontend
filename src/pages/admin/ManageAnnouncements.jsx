import { useState, useEffect } from 'react';
import { getAllAnnouncements, deleteAnnouncement } from '../../services/api';
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('image');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchAnnouncements = async () => {
    try { const res = await getAllAnnouncements(); setAnnouncements(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      if (type === 'text') {
        if (!content) return alert('Please enter content');
        await axios.post(`${API_URL}/announcements/text`, { title, content, expires_at: expiresAt || null }, config);
      } else if (type === 'image') {
        if (!file) return alert('Please select an image');
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title);
        if (expiresAt) formData.append('expires_at', expiresAt);
        await axios.post(`${API_URL}/announcements/image`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });
      } else if (type === 'video') {
        if (!file) return alert('Please select a video');
        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title);
        if (expiresAt) formData.append('expires_at', expiresAt);
        await axios.post(`${API_URL}/announcements/video`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });
      }
      setShowForm(false);
      setType('image');
      setTitle('');
      setContent('');
      setExpiresAt('');
      setFile(null);
      fetchAnnouncements();
    } catch (err) { 
      console.error('Upload error:', err);
      alert(err.response?.data?.message || err.message || 'Upload failed'); 
    }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try { await deleteAnnouncement(id); fetchAnnouncements(); }
    catch (err) { alert('Error deleting'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Announcements</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Upload
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleUpload} className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="text">Text</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Announcement title" />
          </div>
          {type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field"
                rows={4}
                placeholder="Enter announcement text"
              />
            </div>
          )}
          {(type === 'image' || type === 'video') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{type === 'image' ? 'Image' : 'Video'}</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-brand-400 transition-colors"
                onClick={() => document.getElementById('file-input').click()}>
                <FiUpload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-500 text-sm">{file ? file.name : `Click to select ${type}`}</p>
                <input
                  id="file-input"
                  type="file"
                  accept={type === 'image' ? 'image/*' : 'video/*'}
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (optional)</label>
            <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="input-field" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={uploading} className="btn-primary disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-full p-8 text-center text-gray-400">Loading...</div> :
         announcements.length === 0 ? <div className="col-span-full p-8 text-center text-gray-400 bg-white rounded-xl shadow-sm">No announcements yet.</div> :
         announcements.map((ann) => (
          <div key={ann._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {ann.type === 'text' && (
              <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Text Announcement</p>
                  <p className="text-gray-700 text-sm line-clamp-4">{ann.content}</p>
                </div>
              </div>
            )}
            {ann.type === 'image' && (
              <img src={`${API_BASE}${ann.image_path}`} alt={ann.title || 'Announcement'} className="w-full h-48 object-cover" />
            )}
            {ann.type === 'video' && (
              <video src={`${API_BASE}${ann.video_path}`} className="w-full h-48 object-cover" controls />
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">{ann.type}</span>
                {ann.title && <h3 className="font-semibold text-gray-800 truncate">{ann.title}</h3>}
              </div>
              <p className="text-xs text-gray-500">Created: {new Date(ann.createdAt).toLocaleDateString()}</p>
              {ann.expires_at && (
                <p className="text-xs text-orange-600 mt-1">
                  Expires: {new Date(ann.expires_at).toLocaleDateString()}
                  {new Date(ann.expires_at) < new Date() && ' (Expired)'}
                </p>
              )}
              <button onClick={() => handleDelete(ann._id)} className="mt-3 text-red-500 hover:text-red-700 flex items-center gap-1 text-sm">
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
