import { supabase } from '../supabase/supabase';

/**
 * Fetch all certificates
 */
export const fetchCertificates = async () => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { certificates: data, error: null };
  } catch (error) {
    return { certificates: [], error: error.message };
  }
};

/**
 * Upload and save certificate
 */
export const addCertificate = async (certData, file) => {
  try {
    let fileUrl = '';
    let filePath = '';

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      filePath = `certificates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath);
      
      fileUrl = publicUrl;
    }

    const { data, error } = await supabase
      .from('certificates')
      .insert([{
        title: certData.title,
        issuer: certData.issuer,
        file_url: fileUrl,
        file_path: filePath,
        file_name: file.name,
        file_type: file.type // Crucial for preview logic!
      }])
      .select();

    if (error) throw error;
    return { certificate: data[0], error: null };
  } catch (error) {
    return { certificate: null, error: error.message };
  }
};

/**
 * Delete certificate
 */
export const deleteCertificate = async (id, filePath) => {
  try {
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('portfolio-assets')
        .remove([filePath]);
      if (storageError) console.error('Storage error:', storageError);
    }

    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
