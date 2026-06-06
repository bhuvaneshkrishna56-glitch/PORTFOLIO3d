import React, { useEffect, useState } from 'react';
import { getTechStack, createTechStack, updateTechStack, deleteTechStack } from '../services/techStackService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminTechStack() {
  const [tech, setTech] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // {id, name, icon_url, level}
  const [form, setForm] = useState({ name: '', icon_url: '', level: '' });

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await getTechStack();
      setTech(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleSave = async () => {
    if (editing) {
      await updateTechStack(editing.id, form);
    } else {
      await createTechStack(form);
    }
    setForm({ name: '', icon_url: '', level: '' });
    setEditing(null);
    fetch();
  };

  const startEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, icon_url: item.icon_url, level: item.level });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this entry?')) {
      await deleteTechStack(id);
      fetch();
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tech Stack Management</h1>
      <table className="w-full table-auto border-collapse mb-6">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Icon URL</th>
            <th className="p-2 border">Level</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tech.map((t) => (
            <tr key={t.id} className="odd:bg-gray-100">
              <td className="p-2 border">{t.name}</td>
              <td className="p-2 border"><a href={t.icon_url} target="_blank" rel="noreferrer">link</a></td>
              <td className="p-2 border">{t.level}</td>
              <td className="p-2 border space-x-2">
                <button onClick={() => startEdit(t)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bg-gray-50 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">{editing ? 'Edit' : 'Add'} Tech Stack Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="p-2 border rounded" />
          <input value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} placeholder="Icon URL" className="p-2 border rounded" />
          <input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Level" className="p-2 border rounded" />
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">
          {editing ? 'Update' : 'Create'}
        </button>
        {editing && (
          <button onClick={() => { setEditing(null); setForm({ name: '', icon_url: '', level: '' }); }} className="ml-2 px-4 py-2 bg-gray-400 text-white rounded">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
