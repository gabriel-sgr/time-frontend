import { useState, useEffect } from 'react';
import { getTimePeriods, getTimePeriodsByDay, createTimePeriod, updateTimePeriod, deleteTimePeriod } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiCalendar } from 'react-icons/fi';

const daysOfWeek = [
  { value: 'mon-fri', label: 'Monday to Friday' },
  { value: 'every', label: 'Every Day' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' }
];

export default function ManageTimePeriods() {
  const [periods, setPeriods] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    start_time: '',
    end_time: '',
    day_of_week: ''
  });

  const fetchPeriods = async () => {
    try {
      const res = await getTimePeriods();
      setPeriods(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPeriods(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateTimePeriod(editId, form);
        setEditId(null);
      } else {
        await createTimePeriod(form);
      }
      setForm({ name: '', start_time: '', end_time: '', day_of_week: '' });
      setShowForm(false);
      fetchPeriods();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (period) => {
    setEditId(period._id);
    setForm({
      name: period.name,
      start_time: period.start_time,
      end_time: period.end_time,
      day_of_week: period.day_of_week
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this time period?')) return;
    try { await deleteTimePeriod(id); fetchPeriods(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const filteredPeriods = selectedDay 
    ? periods.filter(p => p.day_of_week === (selectedDay === 'mon-fri' || selectedDay === 'every' ? selectedDay : parseInt(selectedDay)))
    : periods;

  const getDayName = (dayValue) => {
    const day = daysOfWeek.find(d => d.value === dayValue);
    return day ? day.label : 'Unknown';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Time Periods</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Time Period
        </button>
      </div>

      {/* Filter by day */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Day</label>
        <select 
          value={selectedDay} 
          onChange={(e) => setSelectedDay(e.target.value)} 
          className="select-field w-full md:w-64"
        >
          <option value="">All Days</option>
          {daysOfWeek.map(day => (
            <option key={day.value} value={day.value}>{day.label}</option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editId ? 'Edit Time Period' : 'Add Time Period'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period Name</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})} 
                className="input-field" 
                placeholder="e.g., Morning Assembly"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input 
                type="time" 
                value={form.start_time} 
                onChange={(e) => setForm({...form, start_time: e.target.value})} 
                className="input-field" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input 
                type="time" 
                value={form.end_time} 
                onChange={(e) => setForm({...form, end_time: e.target.value})} 
                className="input-field" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select 
                value={form.day_of_week} 
                onChange={(e) => setForm({...form, day_of_week: e.target.value === 'mon-fri' || e.target.value === 'every' ? e.target.value : parseInt(e.target.value)})} 
                className="select-field" 
                required
              >
                <option value="">Select day</option>
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn-primary">
              {editId ? 'Update' : 'Add'} Period
            </button>
            <button type="button" onClick={() => {
              setShowForm(false);
              setEditId(null);
              setForm({ name: '', start_time: '', end_time: '', day_of_week: '' });
            }} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Periods List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
         filteredPeriods.length === 0 ? <div className="p-8 text-center text-gray-400">No time periods yet.</div> :
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Period Name</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Day</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Start Time</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">End Time</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Duration</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeriods.map((period) => {
                const start = new Date(`2000-01-01T${period.start_time}`);
                const end = new Date(`2000-01-01T${period.end_time}`);
                const duration = Math.round((end - start) / 60000); // minutes
                
                return (
                  <tr key={period._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{period.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-800">
                        <FiCalendar size={14} />
                        {getDayName(period.day_of_week)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <FiClock size={14} />
                        {period.start_time}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600">{period.end_time}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        {duration} min
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleEdit(period)} className="text-blue-600 hover:text-blue-700">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(period._id)} className="text-red-500 hover:text-red-700">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>}
      </div>

      {/* Summary */}
      {filteredPeriods.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Periods: </span>
              <span className="font-medium">{filteredPeriods.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Days Covered: </span>
              <span className="font-medium">
                {[...new Set(filteredPeriods.map(p => p.day_of_week))].length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total Duration: </span>
              <span className="font-medium">
                {filteredPeriods.reduce((sum, period) => {
                  const start = new Date(`2000-01-01T${period.start_time}`);
                  const end = new Date(`2000-01-01T${period.end_time}`);
                  return sum + Math.round((end - start) / 60000);
                }, 0)} minutes
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
