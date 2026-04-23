import { supabase } from '../supabase/supabase';

/**
 * Fetch profile data - robust version
 */
export const fetchProfile = async () => {
  try {
    // Get the first available profile
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
    // 1. Upload to Storage
    const fileName = `resume_${Date.now()}.pdf`;
    const filePath = `resumes/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-assets')
      .getPublicUrl(filePath);

    // 3. Update ANY profile row present
    // First, verify if any row exists
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
        // Create if missing
        const { data, error } = await supabase
          .from('profile')
          .insert([{ full_name: 'Ebinesar A', resume_url: publicUrl }])
          .select();
          
        if (error) throw error;
        return { profile: data[0], error: null };
    }
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
