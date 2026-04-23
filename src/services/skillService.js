import { supabase } from '../supabase/supabase';

/**
 * Fetch all skills from the database
 */
export const fetchSkills = async () => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return { skills: data, error: null };
  } catch (error) {
    return { skills: [], error: error.message };
  }
};

/**
 * Add a new skill
 */
export const addSkill = async (skillData) => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .insert([skillData])
      .select();

    if (error) throw error;
    return { skill: data[0], error: null };
  } catch (error) {
    return { skill: null, error: error.message };
  }
};

/**
 * Delete a skill
 */
export const deleteSkill = async (id) => {
  try {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
