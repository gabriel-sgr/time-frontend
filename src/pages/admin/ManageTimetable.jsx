import { useState, useEffect } from 'react';
import { getTimetable, createTimetableEntry, updateTimetableEntry, deleteTimetableEntry, getClasses, getTeachers, getClassrooms, getSubjects, generateTimetable, validateTimetable } from '../../services/api';
import axios from 'axios';
import { FiPlus, FiTrash2, FiFilter, FiAlertCircle, FiGrid, FiCpu, FiEdit } from 'react-icons/fi';

const DAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ManageTimetable() {
  const [entries, setEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filterClass, setFilterClass] = useState('');

  const [form, setForm] = useState({
    class_id: '', subject_id: '', teacher_id: '', classroom_id: '',
    day_of_week: 1, start_time: '08:00', end_time: '08:50',
    is_temporary: false, temporary_date: ''
  });

  const fetchAll = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const [e, c, t, r, s, settingsRes] = await Promise.all([
        getTimetable(), getClasses(), getTeachers(), getClassrooms(), getSubjects(),
        axios.get(`${API_URL}/settings`)
      ]);
      setEntries(e.data);
      setClasses(c.data);
      setTeachers(t.data);
      setClassrooms(r.data);
      setSubjects(s.data);
      setSettings(settingsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (!data.is_temporary) { delete data.temporary_date; }
      
      if (editingEntry) {
        await updateTimetableEntry(editingEntry._id, data);
        setEditingEntry(null);
      } else {
        await createTimetableEntry(data);
      }
      
      setShowForm(false);
      setForm({ class_id: '', subject_id: '', teacher_id: '', classroom_id: '', day_of_week: 1, start_time: '08:00', end_time: '08:50', is_temporary: false, temporary_date: '' });
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try { await deleteTimetableEntry(id); fetchAll(); }
    catch (err) { alert('Error deleting'); }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setForm({
      class_id: entry.class_id?._id || '',
      subject_id: entry.subject_id?._id || '',
      teacher_id: entry.teacher_id?._id || '',
      classroom_id: entry.classroom_id?._id || '',
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      is_temporary: entry.is_temporary || false,
      temporary_date: entry.temporary_date || ''
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setShowForm(false);
    setForm({ class_id: '', subject_id: '', teacher_id: '', classroom_id: '', day_of_week: 1, start_time: '08:00', end_time: '08:50', is_temporary: false, temporary_date: '' });
  };

  const handleValidateTimetable = async () => {
    try {
      const response = await validateTimetable();
      const conflicts = response.data.conflicts;
      
      if (conflicts.length === 0) {
        alert('No conflicts found in the timetable!');
      } else {
        const conflictList = conflicts.map(c => 
          `${c.classroom} on ${DAYS[c.day]} ${c.time} (${c.class1} vs ${c.class2})`
        ).join('\n');
        
        alert(`Found ${conflicts.length} conflicts:\n\n${conflictList}`);
      }
    } catch (error) {
      alert(`Error validating timetable: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleGenerateTimetable = async () => {
    try {
      setLoading(true);
      const response = await generateTimetable();
      
      alert(`✅ ${response.data.message}`);
      
      if (response.data.conflicts && response.data.conflicts.length > 0) {
        console.warn('Conflicts found:', response.data.conflicts);
        alert(`⚠️ ${response.data.conflicts.length} conflict(s) detected. Review the logs for details.`);
      }
      
      fetchAll();
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = `❌ Error: ${errorData?.message || error.message}`;
      
      if (errorData?.possibleCauses && errorData.possibleCauses.length > 0) {
        errorMessage += `\n\nPossible causes:\n${errorData.possibleCauses.map(c => `• ${c}`).join('\n')}`;
      }
      
      if (errorData?.hint) {
        errorMessage += `\n\nHint: ${errorData.hint}`;
      }
      
      console.error('Generation error details:', errorData);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filtered = entries.filter(e => {
    if (filterClass && e.class_id?._id !== filterClass) return false;
    return true;
  });

  // Generate dynamic periods based on settings
  const getPeriods = () => {
    const assemblyDay = settings?.assembly_day || 1;
    const assemblyStart = settings?.assembly_start_time || '07:50';
    const assemblyEnd = settings?.assembly_end_time || '08:10';
    
    const periods = [
      { time: `${assemblyStart}-${assemblyEnd}`, label: 'Assembly', isAssembly: true },
      { time: '08:10-08:50', label: 'Period 1' },
      { time: '08:50-09:30', label: 'Period 2' },
      { time: '09:30-10:10', label: 'Period 3' },
      { time: '10:10-10:25', label: 'Break' },
      { time: '10:25-11:05', label: 'Period 4' },
      { time: '11:05-11:55', label: 'Period 5' },
      { time: '11:55-12:25', label: 'Period 6' },
      { time: '12:25-13:30', label: 'Lunch' },
      { time: '13:30-14:10', label: 'Period 7' },
      { time: '14:10-14:50', label: 'Period 8' },
      { time: '14:50-15:30', label: 'Period 9' },
      { time: '15:30-15:40', label: 'Break' },
      { time: '15:40-16:20', label: 'Period 10' },
      { time: '16:20-17:00', label: 'Period 11' }
    ];
    
    return { periods, assemblyDay };
  };

  const { periods, assemblyDay } = getPeriods();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Timetable</h1>
        <div className="flex gap-2">
          <button onClick={handleGenerateTimetable} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <FiCpu /> Auto Generate
          </button>
          <button onClick={handleValidateTimetable} className="btn-secondary flex items-center gap-2">
            <FiAlertCircle /> Check Conflicts
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Entry
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {editingEntry ? 'Edit Timetable Entry' : 'Add New Timetable Entry'}
            </h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select value={form.class_id} onChange={(e) => setForm({...form, class_id: e.target.value})} className="select-field" required>
              <option value="">Select class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select value={form.subject_id} onChange={(e) => setForm({...form, subject_id: e.target.value})} className="select-field" required>
              <option value="">Select subject</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
            <select value={form.teacher_id} onChange={(e) => setForm({...form, teacher_id: e.target.value})} className="select-field" required>
              <option value="">Select teacher</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classroom</label>
            <select value={form.classroom_id} onChange={(e) => setForm({...form, classroom_id: e.target.value})} className="select-field" required>
              <option value="">Select classroom</option>
              {classrooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select value={form.day_of_week} onChange={(e) => setForm({...form, day_of_week: parseInt(e.target.value)})} className="select-field" required>
              {DAYS.slice(1).map((d, i) => <option key={i+1} value={i+1}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <input type="time" value={form.start_time} onChange={(e) => setForm({...form, start_time: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
              <input type="time" value={form.end_time} onChange={(e) => setForm({...form, end_time: e.target.value})} className="input-field" required />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_temporary} onChange={(e) => setForm({...form, is_temporary: e.target.checked})} className="rounded" />
              <span className="text-sm text-gray-700">Temporary override</span>
            </label>
          </div>
          {form.is_temporary && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.temporary_date} onChange={(e) => setForm({...form, temporary_date: e.target.value})} className="input-field" required />
            </div>
          )}
          <div className="md:col-span-2 lg:col-span-3 flex gap-3">
            <button type="submit" className="btn-primary">{editingEntry ? 'Update Entry' : 'Save Entry'}</button>
            <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-4 items-center">
        <FiFilter className="text-gray-400" />
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="select-field w-auto">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} entries</span>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-3 py-3 font-semibold text-gray-600">Time</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">Monday</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">Tuesday</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">Wednesday</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">Thursday</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">Friday</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((period, idx) => (
              <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-3 py-2.5 font-mono text-xs text-gray-600 whitespace-nowrap">
                  {period.time}
                  <div className="text-gray-400">{period.label}</div>
                </td>
                {[1, 2, 3, 4, 5].map(day => {
                  // Skip Wednesday Period 11 (gap)
                  if (day === 3 && period.label === 'Period 11') {
                    return <td key={day} className="px-3 py-2.5 text-center bg-gray-100 text-gray-400">Gap</td>;
                  }
                  
                  // Skip assembly on non-assembly days
                  if (period.isAssembly && day !== assemblyDay) {
                    return <td key={day} className="px-3 py-2.5 text-center bg-gray-100">-</td>;
                  }
                  
                  // Find entry for this time slot and day
                  const [start, end] = period.time.split('-');
                  const entry = filtered.find(e => e.day_of_week === day && e.start_time === start && e.end_time === end);
                  
                  // Handle break and lunch
                  if (period.label === 'Break' || period.label === 'Lunch') {
                    return <td key={day} className="px-3 py-2.5 text-center bg-yellow-50 text-yellow-700">{period.label}</td>;
                  }
                  
                  // Handle assembly
                  if (period.label === 'Assembly') {
                    return <td key={day} className="px-3 py-2.5 text-center bg-purple-50 text-purple-700">Assembly</td>;
                  }
                  
                  // Show subject or empty
                  return (
                    <td key={day} className="px-3 py-2.5 text-center">
                      {entry ? (
                        <div className="space-y-1">
                          <div className="font-semibold text-blue-700">{entry.subject_id?.name}</div>
                          <div className="text-xs text-gray-500">{entry.teacher_id?.name}</div>
                          <div className="text-xs text-gray-400">{entry.classroom_id?.name}</div>
                          <div className="flex justify-center gap-1 mt-1">
                            <button 
                              onClick={() => handleEdit(entry)}
                              className="text-blue-500 hover:text-blue-700 p-1"
                              title="Edit entry"
                            >
                              <FiEdit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(entry._id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete entry"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
