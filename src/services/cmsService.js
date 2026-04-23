import { supabase } from '../supabase/supabase';

/* --- Experiences --- */
export const fetchExperiences = async () => {
  const { data, error } = await supabase.from('experiences').select('*').order('created_at', { ascending: false });
  return { experiences: data || [], error: error?.message };
};

export const addExperience = async (exp) => {
  const { data, error } = await supabase.from('experiences').insert([exp]).select();
  return { experience: data?.[0], error: error?.message };
};

export const deleteExperience = async (id) => {
  const { error } = await supabase.from('experiences').delete().eq('id', id);
  return { success: !error, error: error?.message };
};

/* --- Current Learnings --- */
export const fetchLearnings = async () => {
  const { data, error } = await supabase.from('learnings').select('*').order('created_at', { ascending: true });
  return { learnings: data || [], error: error?.message };
};

export const addLearning = async (name) => {
  const { data, error } = await supabase.from('learnings').insert([{ name }]).select();
  return { learning: data?.[0], error: error?.message };
};

export const deleteLearning = async (id) => {
  const { error } = await supabase.from('learnings').delete().eq('id', id);
  return { success: !error, error: error?.message };
};

/* --- Services --- */
export const fetchServices = async () => {
  const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
  return { services: data || [], error: error?.message };
};

export const addService = async (service) => {
  const { data, error } = await supabase.from('services').insert([service]).select();
  return { service: data?.[0], error: error?.message };
};

export const deleteService = async (id) => {
  const { error } = await supabase.from('services').delete().eq('id', id);
  return { success: !error, error: error?.message };
};
