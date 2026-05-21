import { useState, useEffect } from 'react';
import { getAllAnnouncements, deleteAnnouncement } from '../../services/api';
import { FiPlus, FiTrash2, FiUpload, FiEdit2 } from 'react-icons/fi';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [type, setType] = useState('image');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState('24');
  const [expiresAt, setExpiresAt] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchAnnouncements = async () => {
    try { const res = await getAllAnnouncements(); setAnnouncements(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setType('image');
    setTitle('');
    setContent('');
    setFontSize('24');
    setExpiresAt('');
    setFile(null);
  };

  const handleEdit = (ann) => {
    if (ann.type === 'text') {
      setEditingId(ann._id);
      setType('text');
      setTitle(ann.title);
      setContent(ann.content);
      setFontSize(ann.fontSize?.toString() || '24');
      setExpiresAt(ann.expires_at ? new Date(ann.expires_at).toISOString().slice(0, 16) : '');
      setShowForm(true);
    } else {
      alert('Only text announcements can be edited');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      if (editingId) {
        // Update text announcement
        await axios.put(`${API_URL}/announcements/${editingId}`, { 
          title, 
          content, 
          fontSize: parseInt(fontSize), 
          expires_at: expiresAt || null 
        }, config);
        resetForm();
        fetchAnnouncements();
        alert('Announcement updated successfully');
      } else if (type === 'text') {
        if (!content) return alert('Please enter content');
        await axios.post(`${API_URL}/announcements/text`, { 
          title, 
          content, 
          fontSize: parseInt(fontSize), 
          expires_at: expiresAt || null 
        }, config);
        resetForm();
        fetchAnnouncements();
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
        resetForm();
        fetchAnnouncements();
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
        resetForm();
        fetchAnnouncements();
      }
    } catch (err) { 
      console.error('Upload error:', err);
      alert(err.response?.data?.message || err.message || 'Operation failed'); 
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
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
              className="input-field"
              disabled={editingId !== null}
            >
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
            <>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font Size (pixels)</label>
                <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="input-field">
                  <option value="16">16px - Small</option>
                  <option value="20">20px - Medium Small</option>
                  <option value="24">24px - Medium (Default)</option>
                  <option value="28">28px - Medium Large</option>
                  <option value="32">32px - Large</option>
                  <option value="36">36px - Extra Large</option>
                  <option value="40">40px - XXL</option>
                  <option value="48">48px - Huge</option>
                </select>
              </div>
            </>
          )}
          {(type === 'image' || type === 'video') && !editingId && (
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
            <button type="submit" disabled={uploading} className="btn-primary disabled:opacity-50">
              {uploading ? 'Processing...' : editingId ? 'Update' : 'Upload'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
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
                  <p style={{ fontSize: `${ann.fontSize || 24}px` }} className="text-gray-700 line-clamp-4">{ann.content}</p>
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
              {ann.type === 'text' && ann.fontSize && (
                <p className="text-xs text-blue-600 mt-1">Font Size: {ann.fontSize}px</p>
              )}
              <div className="flex gap-2 mt-3">
                {ann.type === 'text' && (
                  <button 
                    onClick={() => handleEdit(ann)} 
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"
                  >
                    <FiEdit2 size={14} /> Edit
                  </button>
                )}
                <button onClick={() => handleDelete(ann._id)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm">
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
