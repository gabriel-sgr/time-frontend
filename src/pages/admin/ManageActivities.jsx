import { useState, useEffect } from 'react';
import { getActivities, getClasses, getTeachers, getTimePeriods, createActivity, updateActivity, deleteActivity } from '../../services/api';
import { FiPlus, FiTrash2, FiEdit2, FiFilter, FiX } from 'react-icons/fi';

const DAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ManageActivities() {
  const [activities, setActivities] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timePeriods, setTimePeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterClass, setFilterClass] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    class_id: '',
    class_ids: [],
    all_classes: false,
    is_special: false,
    day_of_week: 1,
    start_time: '16:00',
    end_time: '17:00',
    time_period_id: '',
    location: '',
    responsible_teacher_id: ''
  });

  const fetchAll = async () => {
    try {
      const [a, c, t, tp] = await Promise.all([
        getActivities(),
        getClasses(),
        getTeachers(),
        getTimePeriods()
      ]);
      setActivities(a.data);
      setClasses(c.data);
      setTeachers(t.data);
      setTimePeriods(tp.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...form };
      if (editingId) {
        await updateActivity(editingId, submitData);
        setEditingId(null);
      } else {
        await createActivity(submitData);
      }
      setShowForm(false);
      resetForm();
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      class_id: '',
      class_ids: [],
      all_classes: false,
      is_special: false,
      day_of_week: 1,
      start_time: '16:00',
      end_time: '17:00',
      time_period_id: '',
      location: '',
      responsible_teacher_id: ''
    });
  };

  const handleEdit = (activity) => {
    setForm({
      name: activity.name,
      description: activity.description || '',
      class_id: activity.class_id?._id || '',
      class_ids: activity.class_ids?.map(c => typeof c === 'string' ? c : c._id) || [],
      all_classes: activity.all_classes || false,
      is_special: activity.is_special || false,
      day_of_week: activity.day_of_week,
      start_time: activity.start_time,
      end_time: activity.end_time,
      time_period_id: activity.time_period_id?._id || '',
      location: activity.location || '',
      responsible_teacher_id: activity.responsible_teacher_id?._id || ''
    });
    setEditingId(activity._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this activity?')) return;
    try { await deleteActivity(id); fetchAll(); }
    catch (err) { alert('Error deleting'); }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const toggleClassSelection = (classId) => {
    if (form.class_ids.includes(classId)) {
      setForm({...form, class_ids: form.class_ids.filter(id => id !== classId)});
    } else {
      setForm({...form, class_ids: [...form.class_ids, classId]});
    }
  };

  const getActivityClassDisplay = (activity) => {
    if (activity.all_classes) return 'All Classes';
    if (activity.class_ids && activity.class_ids.length > 0) {
      return activity.class_ids.map(c => typeof c === 'string' ? c : c.name).join(', ');
    }
    return activity.class_id?.name || '-';
  };

  const filtered = activities.filter(a => {
    if (filterClass) {
      return a.class_id?._id === filterClass || 
             a.class_ids?.some(c => (typeof c === 'string' ? c : c._id) === filterClass) ||
             a.all_classes;
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Activities</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <FiPlus /> {editingId ? 'Edit Activity' : 'Add Activity'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="input-field"
              placeholder="e.g., Sports Practice, Music Club"
              required
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="input-field"
              rows="2"
              placeholder="Optional description"
            />
          </div>

          {/* Special Activity Checkbox */}
          <div className="md:col-span-2 lg:col-span-3 flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
            <input
              type="checkbox"
              id="is_special"
              checked={form.is_special}
              onChange={(e) => setForm({
                ...form, 
                is_special: e.target.checked,
                all_classes: false,
                class_ids: [],
                class_id: ''
              })}
              className="w-4 h-4"
            />
            <label htmlFor="is_special" className="text-sm font-medium text-gray-700 cursor-pointer">
              This is a Special Activity (applies to multiple classes or all classes)
            </label>
          </div>

          {/* Class Selection - depends on is_special */}
          {!form.is_special ? (
            // Regular activity - single class
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={form.class_id}
                onChange={(e) => setForm({...form, class_id: e.target.value})}
                className="select-field"
                required
              >
                <option value="">Select class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          ) : (
            // Special activity - multiple classes or all classes
            <div className="md:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="all_classes"
                  checked={form.all_classes}
                  onChange={(e) => setForm({
                    ...form, 
                    all_classes: e.target.checked,
                    class_ids: e.target.checked ? [] : form.class_ids
                  })}
                  className="w-4 h-4"
                />
                <label htmlFor="all_classes" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Apply to All Classes
                </label>
              </div>

              {!form.all_classes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Classes</label>
                  <div className="border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                    {classes.map(c => (
                      <div key={c._id} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id={`class_${c._id}`}
                          checked={form.class_ids.includes(c._id)}
                          onChange={() => toggleClassSelection(c._id)}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`class_${c._id}`} className="text-sm cursor-pointer">{c.name}</label>
                      </div>
                    ))}
                  </div>
                  {form.class_ids.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">Please select at least one class</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={form.day_of_week}
              onChange={(e) => setForm({...form, day_of_week: parseInt(e.target.value)})}
              className="select-field"
              required
            >
              {DAYS.slice(1).map((d, i) => <option key={i+1} value={i+1}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({...form, start_time: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({...form, end_time: e.target.value})}
                className="input-field"
                required
              />
            </div>
          </div>
          
          {/* Time Period - Optional for special activities */}
          {form.is_special && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period (Optional)</label>
              <select
                value={form.time_period_id}
                onChange={(e) => setForm({...form, time_period_id: e.target.value})}
                className="select-field"
              >
                <option value="">Select a time period (auto-display)</option>
                {timePeriods.map(tp => (
                  <option key={tp._id} value={tp._id}>
                    {tp.name} ({tp.start_time} - {tp.end_time})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                If selected, this activity will auto-display during the specified time period
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({...form, location: e.target.value})}
              className="input-field"
              placeholder="e.g., Sports Field, Music Room"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsible Teacher</label>
            <select
              value={form.responsible_teacher_id}
              onChange={(e) => setForm({...form, responsible_teacher_id: e.target.value})}
              className="select-field"
            >
              <option value="">Select teacher (optional)</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-3 flex gap-3">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Activity' : 'Add Activity'}
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-4 items-center">
        <FiFilter className="text-gray-400" />
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="select-field w-auto"
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} activities</span>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No activities found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Activity</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Classes</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Day</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Location</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Teacher</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(activity => (
                <tr key={activity._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{activity.name}</div>
                    {activity.description && (
                      <div className="text-xs text-gray-500">{activity.description}</div>
                    )}
                    {activity.is_special && (
                      <div className="text-xs text-blue-600 font-semibold">★ Special</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{getActivityClassDisplay(activity)}</td>
                  <td className="px-4 py-3 text-gray-600">{DAYS[activity.day_of_week]}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {activity.start_time} - {activity.end_time}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{activity.location || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {activity.responsible_teacher_id?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(activity)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      title="Edit"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(activity._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
