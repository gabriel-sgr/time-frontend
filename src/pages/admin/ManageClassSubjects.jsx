import { useState, useEffect } from 'react';
import { getClassSubjects, getClasses, getSubjects, createClassSubject, createBulkClassSubjects, updateClassSubject, deleteClassSubject } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen, FiClock, FiX } from 'react-icons/fi';

export default function ManageClassSubjects() {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);

  const [form, setForm] = useState({
    class_id: '',
    subject_id: '',
    subject_ids: [],
    hours_per_week: 1
  });

  const fetchAssignments = async () => {
    try {
      const [assignmentsRes, classesRes, subjectsRes] = await Promise.all([
        getClassSubjects(),
        getClasses(),
        getSubjects()
      ]);
      setAssignments(assignmentsRes.data);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert(`Error loading data: ${err.response?.data?.message || err.message}`);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Single edit mode
        await updateClassSubject(editId, {
          class_id: form.class_id,
          subject_id: form.subject_id,
          hours_per_week: form.hours_per_week
        });
        setEditId(null);
      } else if (bulkMode) {
        // Bulk mode
        if (!form.class_id || form.subject_ids.length === 0) {
          alert('Please select a class and at least one subject');
          return;
        }
        await createBulkClassSubjects({
          class_id: form.class_id,
          subject_ids: form.subject_ids,
          hours_per_week: form.hours_per_week
        });
      } else {
        // Single mode
        await createClassSubject({
          class_id: form.class_id,
          subject_id: form.subject_id,
          hours_per_week: form.hours_per_week
        });
      }
      resetForm();
      setShowForm(false);
      setBulkMode(false);
      fetchAssignments();
    } catch (err) { 
      alert(err.response?.data?.message || 'Error'); 
    }
  };

  const resetForm = () => {
    setForm({ class_id: '', subject_id: '', subject_ids: [], hours_per_week: 1 });
    setEditId(null);
  };

  const handleEdit = (assignment) => {
    if (!assignment) return;
    setEditId(assignment._id);
    setForm({
      class_id: assignment.class_id?._id || '',
      subject_id: assignment.subject_id?._id || '',
      subject_ids: [],
      hours_per_week: assignment.hours_per_week || 1
    });
    setBulkMode(false);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try { await deleteClassSubject(id); fetchAssignments(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const toggleSubjectSelection = (subjectId) => {
    if (form.subject_ids.includes(subjectId)) {
      setForm({...form, subject_ids: form.subject_ids.filter(id => id !== subjectId)});
    } else {
      setForm({...form, subject_ids: [...form.subject_ids, subjectId]});
    }
  };

  const filteredAssignments = selectedClass 
    ? assignments.filter(a => a.class_id._id === selectedClass)
    : assignments;

  const totalHours = filteredAssignments.reduce((sum, a) => sum + a.hours_per_week, 0);
  const totalPeriods = Math.ceil(totalHours / 40);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Class Subjects</h1>
        <button onClick={() => {
          setShowForm(!showForm);
          setBulkMode(false);
          resetForm();
        }} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Subject to Class
        </button>
      </div>

      {/* Filter by class */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)} 
          className="select-field w-full md:w-64"
        >
          <option value="">All Classes</option>
          {classes.map(cls => (
            <option key={cls._id} value={cls._id}>{cls.name}</option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editId ? 'Edit Assignment' : 'Add Subject to Class'}
          </h3>

          {/* Mode toggle - only show when not editing */}
          {!editId && (
            <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={!bulkMode} 
                  onChange={() => {
                    setBulkMode(false);
                    setForm({...form, subject_id: '', subject_ids: []});
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Add Single Subject</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={bulkMode} 
                  onChange={() => {
                    setBulkMode(true);
                    setForm({...form, subject_id: '', subject_ids: []});
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Add Multiple Subjects</span>
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select 
                value={form.class_id} 
                onChange={(e) => setForm({...form, class_id: e.target.value})} 
                className="select-field" 
                required
              >
                <option value="">Select class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>

            {/* Single Subject Mode */}
            {!bulkMode && !editId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select 
                  value={form.subject_id} 
                  onChange={(e) => setForm({...form, subject_id: e.target.value})} 
                  className="select-field" 
                  required
                >
                  <option value="">Select subject</option>
                  {subjects.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Edit Mode */}
            {editId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select 
                  value={form.subject_id} 
                  onChange={(e) => setForm({...form, subject_id: e.target.value})} 
                  className="select-field" 
                  required
                >
                  <option value="">Select subject</option>
                  {subjects.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours per Week</label>
              <input 
                type="number" 
                min="1" 
                value={form.hours_per_week} 
                onChange={(e) => setForm({...form, hours_per_week: parseInt(e.target.value) || 1})} 
                className="input-field" 
                required
              />
            </div>
          </div>

          {/* Multiple Subjects Mode */}
          {bulkMode && !editId && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Subjects</label>
              <div className="border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                {subjects.map(sub => (
                  <div key={sub._id} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id={`subject_${sub._id}`}
                      checked={form.subject_ids.includes(sub._id)}
                      onChange={() => toggleSubjectSelection(sub._id)}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`subject_${sub._id}`} className="text-sm cursor-pointer">{sub.name}</label>
                  </div>
                ))}
              </div>
              {form.subject_ids.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Please select at least one subject</p>
              )}
              {form.subject_ids.length > 0 && (
                <p className="text-sm text-blue-600 mt-1">
                  {form.subject_ids.length} subject(s) selected
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn-primary">
              {editId ? 'Update' : bulkMode ? 'Add' : 'Add'} Assignment
            </button>
            <button type="button" onClick={() => {
              setShowForm(false);
              setBulkMode(false);
              resetForm();
            }} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Summary */}
      {filteredAssignments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Assignments: </span>
              <span className="font-medium">{filteredAssignments.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Hours/Week: </span>
              <span className="font-medium">{totalHours}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Periods (40min): </span>
              <span className="font-medium">{totalPeriods}</span>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
         filteredAssignments.length === 0 ? <div className="p-8 text-center text-gray-400">No assignments yet.</div> :
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Class</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Subject</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Hours/Week</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment) => (
                <tr key={assignment._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">{assignment.class_id?.name || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-gray-800">
                      <FiBookOpen size={14} />
                      {assignment.subject_id?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      <FiClock size={14} />
                      {assignment.hours_per_week || 0} hrs
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(assignment)} className="text-blue-600 hover:text-blue-700">
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(assignment._id)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </div>
    </div>
  );
}
