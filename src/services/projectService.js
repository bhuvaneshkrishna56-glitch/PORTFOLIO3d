import { supabase } from '../supabase/supabase';

/**
 * Fetch all projects from Supabase
 */
export const fetchProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { projects: data, error: null };
  } catch (error) {
    return { projects: [], error: error.message };
  }
};

/**
 * Upload image and add project to Supabase
 */
export const addProject = async (projectData, imageFile) => {
  try {
    let imageUrl = '';
    let imagePath = '';

    if (imageFile) {
      // 1. Upload to Storage Bucket 'portfolio-assets'
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      imagePath = `projects/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('portfolio-assets')
        .upload(imagePath, imageFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(imagePath);
      
      imageUrl = publicUrl;
    }

    // 3. Insert into Database
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title: projectData.title,
        description: projectData.description,
        tech_stack: projectData.techStack, // Array
        github_link: projectData.githubLink,
        deployed_link: projectData.deployedLink,
        image_url: imageUrl,
        image_path: imagePath
      }])
      .select();

    if (error) throw error;
    return { project: data[0], error: null };
  } catch (error) {
    return { project: null, error: error.message };
  }
};

/**
 * Delete project and its image
 */
export const deleteProject = async (id, imagePath) => {
  try {
    // 1. Delete image from Storage if it exists
    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from('portfolio-assets')
        .remove([imagePath]);
      if (storageError) console.error('Storage delete error:', storageError);
    }

    // 2. Delete from Database
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
