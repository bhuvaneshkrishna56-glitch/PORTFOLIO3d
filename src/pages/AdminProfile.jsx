import React, { useEffect, useState } from 'react';
import { fetchProfile, updateProfileDetails, updateProfileStyles, updateProfileTheme } from '../services/profileService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    role: '',
    hero_badge: '',
    hero_title: '',
    hero_description: '',
    email: '',
    location: '',
    github_url: '',
    linkedin_url: '',
    twitter_url: ''
  });
  const [styleForm, setStyleForm] = useState({
    bg_color: '',
    text_color: '',
    font_family: '',
    font_style: '',
    font_size: ''
  });
  const [theme, setTheme] = useState('');

  const load = async () => {
    setLoading(true);
    const { profile: data } = await fetchProfile();
    setProfile(data);
    setForm({
      full_name: data.full_name || '',
      role: data.role || '',
      hero_badge: data.hero_badge || '',
      hero_title: data.hero_title || '',
      hero_description: data.hero_description || '',
      email: data.email || '',
      location: data.location || '',
      github_url: data.github_url || '',
      linkedin_url: data.linkedin_url || '',
      twitter_url: data.twitter_url || ''
    });
    setStyleForm({
      bg_color: data.bg_color || '',
      text_color: data.text_color || '',
      font_family: data.font_family || '',
      font_style: data.font_style || '',
      font_size: data.font_size || ''
    });
    setTheme(data.active_theme || '');
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleProfileSave = async () => {
    await updateProfileDetails(form);
    await load();
  };

  const handleStyleSave = async () => {
    await updateProfileStyles(styleForm);
    await load();
  };

  const handleThemeSave = async () => {
    await updateProfileTheme(theme);
    await load();
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>

      {/* Basic Details */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Basic Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(form).map((key) => (
            <input
              key={key}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={key.replace('_', ' ')}
              className="p-2 border rounded"
            />
          ))}
        </div>
        <button onClick={handleProfileSave} className="mt-4 px-4 py-2 bg-green-600 text-white rounded">
          Save Profile
        </button>
      </section>

      {/* Styles */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Custom Styles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(styleForm).map((key) => (
            <input
              key={key}
              value={styleForm[key]}
              onChange={(e) => setStyleForm({ ...styleForm, [key]: e.target.value })}
              placeholder={key.replace('_', ' ')}
              className="p-2 border rounded"
            />
          ))}
        </div>
        <button onClick={handleStyleSave} className="mt-4 px-4 py-2 bg-green-600 text-white rounded">
          Save Styles
        </button>
      </section>

      {/* Theme */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Active Theme</h2>
        <input
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Theme name"
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleThemeSave} className="px-4 py-2 bg-green-600 text-white rounded">
          Save Theme
        </button>
      </section>
    </div>
  );
}
