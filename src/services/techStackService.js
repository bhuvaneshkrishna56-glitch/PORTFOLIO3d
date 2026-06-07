import { supabase } from '../lib/supabaseClient';

export const techStackService = {
  async getAll() {
    const { data, error } = await supabase.from('skills').select('*');
    if (error) throw error;
    return data;
  },
  async getById(id) {
    const { data, error } = await supabase.from('skills').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  async create(item) {
    const { data, error } = await supabase.from('skills').insert(item);
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const { data, error } = await supabase.from('skills').update(updates).eq('id', id);
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { data, error } = await supabase.from('skills').delete().eq('id', id);
    if (error) throw error;
    return data;
  }
};

export const getTechStack = async () => {
  return techStackService.getAll();
};

export const createTechStack = async (item) => {
  return techStackService.create(item);
};

export const updateTechStack = async (id, updates) => {
  return techStackService.update(id, updates);
};

export const deleteTechStack = async (id) => {
  return techStackService.delete(id);
};
