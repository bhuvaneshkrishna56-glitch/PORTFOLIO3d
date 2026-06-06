import { supabase } from '../supabase/supabase';

/** Get all learning entries */
export const getLearning = async () => {
  const { data, error } = await supabase.from('learning').select('*');
  if (error) throw error;
  return data;
};

/** Create a new learning entry */
export const createLearning = async (entry) => {
  const { data, error } = await supabase.from('learning').insert(entry).select();
  if (error) throw error;
  return data[0];
};

/** Update an existing learning entry */
export const updateLearning = async (id, updates) => {
  const { data, error } = await supabase.from('learning').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

/** Delete a learning entry */
export const deleteLearning = async (id) => {
  const { data, error } = await supabase.from('learning').delete().eq('id', id).select();
  if (error) throw error;
  return data[0];
};
