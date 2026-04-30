import { useState, useEffect } from 'react';
import { getClassrooms, createClassroom, updateClassroom, deleteClassroom } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';

export default function ManageClassrooms() {
  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try { const res = await getClassrooms(); setItems(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try { await createClassroom({ name: newName.trim() }); setNewName(''); fetchItems(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try { await updateClassroom(id, { name: editName.trim() }); setEditId(null); fetchItems(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await deleteClassroom(id); fetchItems(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Classrooms</h1>
      <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-3">
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter name..." className="input-field flex-1" />
        <button type="submit" className="btn-primary flex items-center gap-2"><FiPlus /> Add</button>
      </form>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
         items.length === 0 ? <div className="p-8 text-center text-gray-400">No items yet.</div> :
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">#</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item._id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                <td className="px-4 py-3">
                  {editId === item._id ? (
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleUpdate(item._id)} />
                  ) : <span className="text-gray-800 font-medium">{item.name}</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  {editId === item._id ? (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleUpdate(item._id)} className="text-green-600 hover:text-green-700"><FiCheck size={18} /></button>
                      <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setEditId(item._id); setEditName(item.name); }} className="text-blue-600 hover:text-blue-700"><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700"><FiTrash2 size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
