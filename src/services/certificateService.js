import { supabase } from '../supabase/supabase';

/**
 * Fetch all certificates
 */
export const fetchCertificates = async () => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('id, title, issuer, file_url, file_path, file_name, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { certificates: data, error: null };
  } catch (error) {
    return { certificates: [], error: error.message };
  }
};

/**
 * Helper to determine file category
 */
const getFileCategory = (mimeType, fileName) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'other';
};

/**
 * Upload and save certificate
 */
export const uploadCertificate = async (file, metadata = {}, setProgress = () => {}) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `certificates/${fileName}`;

    // Upload file with progress callback (Supabase currently doesn't expose progress, placeholder)
    const { error: uploadError } = await supabase.storage
      .from('portfolio-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-assets')
      .getPublicUrl(filePath);

    // Determine file type category
    const fileType = getFileCategory(file.type, file.name);

    // Insert certificate record with metadata and file_type
    const { data, error } = await supabase
      .from('certificates')
      .insert([{
        title: metadata.title || file.name,
        issuer: metadata.issuer || '',
        date: metadata.date || null,
        description: metadata.description || '',
        file_url: publicUrl,
        file_path: filePath,
        file_name: file.name,
        file_type: fileType
      }])
      .select('id, title, issuer, file_url, file_path, file_name, created_at')

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
