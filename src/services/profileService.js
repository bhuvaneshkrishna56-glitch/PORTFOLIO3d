import { supabase } from '../supabase/supabase';

/**
 * Helper to get the profile data from LocalStorage merged with default configurations
 */
const getLocalProfile = () => {
  try {
    const cachedProfile = localStorage.getItem('portfolio_profile_data');
    const customStyles = localStorage.getItem('portfolio_custom_styles');
    const activeTheme = localStorage.getItem('portfolio_active_theme');
    
    const parsedStyles = customStyles ? JSON.parse(customStyles) : {};
    const parsedProfile = cachedProfile ? JSON.parse(cachedProfile) : {};

    const defaultProfile = {
  id: 'mock-profile-id',
  full_name: 'Ebinesar',
  role: 'Creative Web Architect',
  hero_badge: 'Build With Satya (2024 - Present)',
  hero_title: 'Crafting immersive 3D R3F scenes, WebGL components, and optimized layout routing.',
  hero_description: "Creative Intern at Software Enterprise (2022 - 2024). Focused on UI design, Framer Motion transitions, and vanilla CSS component structures.",
  email: 'hello@example.com',
  location: 'Remote / Worldwide',
  github_url: 'https://github.com/Ebinesar91',
  linkedin_url: 'https://linkedin.com/in/Ebinesar',
  twitter_url: 'https://twitter.com/Ebinesar',
  active_theme: activeTheme || 'cosmic',
  resume_url: localStorage.getItem('portfolio_resume_url') || null
};
      id: 'mock-profile-id',
      full_name: 'Ebinesar A',
      role: 'Full Stack Developer',
      hero_badge: 'Open for Internships',
      hero_title: 'Building Scalable & Modern Web Applications',
      hero_description: "Hi, I'm Ebinesar A. I specialize in Frontend & Full Stack development with a deep interest in AI integration and interactive 3D graphics.",
      email: 'hello@example.com',
      location: 'Remote / Worldwide',
      github_url: 'https://github.com',
      linkedin_url: 'https://linkedin.com',
      twitter_url: 'https://twitter.com',
      active_theme: activeTheme || 'cosmic',
      resume_url: localStorage.getItem('portfolio_resume_url') || null
    };

    return {
      ...defaultProfile,
      ...parsedProfile,
      ...parsedStyles,
      active_theme: activeTheme || parsedProfile.active_theme || defaultProfile.active_theme
    };
  } catch (e) {
    console.error('Failed to load local profile:', e);
    return null;
  }
};

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
    
    const dbProfile = data?.[0];
    const localProfile = getLocalProfile();

    if (dbProfile) {
      // Merge DB profile over local profile, but preserve localStorage resume_url
      // if Supabase returns null (e.g. before user has set one in the DB)
      const merged = { ...localProfile, ...dbProfile };
      if (!merged.resume_url && localProfile.resume_url) {
        merged.resume_url = localProfile.resume_url;
      }
      return { profile: merged, error: null };
    }
    
    return { profile: localProfile, error: null };
  } catch (error) {
    console.warn('Supabase fetchProfile failed, falling back to LocalStorage:', error.message);
    return { profile: getLocalProfile(), error: null };
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

    localStorage.setItem('portfolio_resume_url', publicUrl);
    const localProfile = getLocalProfile();

    const { data: existing } = await supabase.from('profile').select('id');
    
    if (existing && existing.length > 0) {
        const { data, error } = await supabase
          .from('profile')
          .update({ resume_url: publicUrl, updated_at: new Date().toISOString() })
          .eq('id', existing[0].id)
          .select();
        
        if (error) throw error;
        return { profile: data[0], error: null };
    }
    
    return { profile: localProfile, error: null };
  } catch (error) {
    console.warn('Supabase resume upload failed:', error.message);
    return { profile: getLocalProfile(), error: null };
  }
};

/**
 * Update the active 3D theme
 */
export const updateProfileTheme = async (themeName) => {
  try {
    localStorage.setItem('portfolio_active_theme', themeName);
    const localProfile = getLocalProfile();

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
    return { profile: localProfile, error: null };
  } catch (error) {
    console.warn('Supabase updateProfileTheme failed, using local theme switcher fallback:', error.message);
    return { profile: getLocalProfile(), error: null };
  }
};

/**
 * Delete current resume
 */
export const deleteResume = async () => {
  try {
    localStorage.removeItem('portfolio_resume_url');
    const localProfile = getLocalProfile();

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
    return { profile: localProfile, error: null };
  } catch (error) {
    console.warn('Supabase deleteResume failed:', error.message);
    return { profile: getLocalProfile(), error: null };
  }
};

/**
 * Update profile details (name, title, badge, etc)
 */
export const updateProfileDetails = async (details) => {
  try {
    localStorage.setItem('portfolio_profile_data', JSON.stringify(details));
    const localProfile = getLocalProfile();

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
    return { profile: localProfile, error: null };
  } catch (error) {
    console.warn('Supabase updateProfileDetails failed, using local profile details cache:', error.message);
    return { profile: getLocalProfile(), error: null };
  }
};

/**
 * Update style customizations (bg_color, text_color, font_family, font_style, font_size)
 */
export const updateProfileStyles = async (styles) => {
  try {
    localStorage.setItem('portfolio_custom_styles', JSON.stringify(styles));
    const localProfile = getLocalProfile();

    const { data: existing } = await supabase.from('profile').select('id');
    if (existing && existing.length > 0) {
      const { data, error } = await supabase
        .from('profile')
        .update({
          bg_color: styles.bg_color,
          text_color: styles.text_color,
          font_family: styles.font_family,
          font_style: styles.font_style,
          font_size: styles.font_size,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing[0].id)
        .select();

      if (error) {
        if (error.code === '42703') {
          console.warn('Supabase columns for style customization not found. Falling back to LocalStorage.', error);
          return { success: true, warning: 'database_columns_missing', error: null, profile: localProfile };
        }
        throw error;
      }
      return { success: true, profile: data[0], error: null };
    }
    return { success: true, warning: 'no_profile_found', error: null, profile: localProfile };
  } catch (error) {
    console.warn('Supabase updateProfileStyles failed, using local styles cache:', error.message);
    return { success: true, profile: getLocalProfile(), error: null };
  }
};
// ------------------------------------------------------------------
// File Upload Helpers (Certificates, Projects)
// ------------------------------------------------------------------

/**
 * Upload a certificate file to Supabase Storage.
 * Stores the public URL in localStorage under 'portfolio_certificate_url'.
 * @param {File} file - Certificate PDF or image.
 * @returns {{ publicUrl: string, error?: any }}
 */
export const uploadCertificate = async (file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `certificate_${Date.now()}.${fileExt}`;
    const filePath = `certificates/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-assets') // bucket name – ensure it exists in Supabase dashboard
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('portfolio-assets')
      .getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    // Persist locally for quick access / fallback when DB is not reachable
    localStorage.setItem('portfolio_certificate_url', publicUrl);
    return { publicUrl };
  } catch (error) {
    console.warn('Supabase certificate upload failed:', error.message);
    return { publicUrl: '', error };
  }
};

/**
 * Upload a generic project asset (image, video, PDF) to Supabase Storage.
 * Returns the public URL; does not automatically persist to profile.
 * @param {File} file - The file to upload.
 * @param {string} folder - Sub‑folder inside the bucket (e.g., 'projects', 'images').
 * @returns {{ publicUrl: string, error?: any }}
 */
export const uploadProjectAsset = async (file, folder = 'projects') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('portfolio-assets')
      .getPublicUrl(filePath);
    return { publicUrl: data.publicUrl };
  } catch (error) {
    console.warn('Supabase project asset upload failed:', error.message);
    return { publicUrl: '', error };
  }
};
