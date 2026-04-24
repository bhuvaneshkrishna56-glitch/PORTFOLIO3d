import { supabase } from '../supabase/supabase';

/**
 * Fetch profile data - robust version
 */
export const fetchProfile = async () => {
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .limit(1);

    if (error) throw error;
    return { profile: data?.[0] || null, error: null };
  } catch (error) {
    return { profile: null, error: error.message };
  }
};

/**
 * Upload resume PDF and update first profile found
 */
export const updateResume = async (file) => {
  try {
    const fileName = `resume_${Date.now()}.pdf`;
    const filePath = `resumes/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-assets')
      .getPublicUrl(filePath);

    const { data: existing } = await supabase.from('profile').select('id');
    
    if (existing && existing.length > 0) {
        const { data, error } = await supabase
          .from('profile')
          .update({ resume_url: publicUrl, updated_at: new Date().toISOString() })
          .eq('id', existing[0].id)
          .select();
        
        if (error) throw error;
        return { profile: data[0], error: null };
    } else {
        const { data, error } = await supabase
          .from('profile')
          .insert([{ full_name: 'Ebinesar A', resume_url: publicUrl, active_theme: 'cosmic' }])
          .select();
          
        if (error) throw error;
        return { profile: data[0], error: null };
    }
  } catch (error) {
    return { profile: null, error: error.message };
  }
};

/**
 * Update the active 3D theme
 */
export const updateProfileTheme = async (themeName) => {
  try {
    const { data: existing } = await supabase.from('profile').select('id');
    if (existing && existing.length > 0) {
        const { data, error } = await supabase
          .from('profile')
          .update({ active_theme: themeName, updated_at: new Date().toISOString() })
          .eq('id', existing[0].id)
          .select();
        if (error) throw error;
        return { profile: data[0], error: null };
    }
    return { profile: null, error: 'No profile found' };
  } catch (error) {
    return { profile: null, error: error.message };
  }
};

/**
 * Delete current resume
 */
export const deleteResume = async () => {
  try {
    const { data: existing } = await supabase.from('profile').select('id');
    if (existing && existing.length > 0) {
        const { data, error } = await supabase
          .from('profile')
          .update({ resume_url: null, updated_at: new Date().toISOString() })
          .eq('id', existing[0].id)
          .select();
        if (error) throw error;
        return { profile: data[0], error: null };
    }
    return { profile: null, error: 'No profile found' };
  } catch (error) {
    return { profile: null, error: error.message };
  }
};

/**
 * Update profile details (name, title, badge, etc)
 */
export const updateProfileDetails = async (details) => {
  try {
    const { data: existing } = await supabase.from('profile').select('id');
    if (existing && existing.length > 0) {
        const { data, error } = await supabase
          .from('profile')
          .update({ 
            ...details, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', existing[0].id)
          .select();
        
        if (error) throw error;
        return { profile: data[0], error: null };
    }
    return { profile: null, error: 'No profile found' };
  } catch (error) {
    return { profile: null, error: error.message };
  }
};
