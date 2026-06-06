import React, { useEffect, useState } from 'react';
import { getLearning, createLearning, updateLearning, deleteLearning } from '../services/learningService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminLearning() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', url: '' });

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await getLearning();
      setItems(data);
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
      await updateLearning(editing.id, form);
    } else {
      await createLearning(form);
    }
    setForm({ title: '', description: '', url: '' });
    setEditing(null);
    fetch();
  };

  const startEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description, url: item.url });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this learning entry?')) {
      await deleteLearning(id);
      fetch();
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Learning Resources Management</h1>
      <table className="w-full table-auto border-collapse mb-6">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">URL</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="odd:bg-gray-100">
              <td className="p-2 border">{it.title}</td>
              <td className="p-2 border">{it.description}</td>
              <td className="p-2 border"><a href={it.url} target="_blank" rel="noreferrer">link</a></td>
              <td className="p-2 border space-x-2">
                <button onClick={() => startEdit(it)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                <button onClick={() => handleDelete(it.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bg-gray-50 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">{editing ? 'Edit' : 'Add'} Learning Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="p-2 border rounded" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="p-2 border rounded" />
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="URL" className="p-2 border rounded" />
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">
          {editing ? 'Update' : 'Create'}
        </button>
        {editing && (
          <button onClick={() => { setEditing(null); setForm({ title: '', description: '', url: '' }); }} className="ml-2 px-4 py-2 bg-gray-400 text-white rounded">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
