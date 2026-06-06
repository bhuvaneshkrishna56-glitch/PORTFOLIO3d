/**
 * Utility helper to apply custom styling configurations globally
 * to the document root and body elements.
 */
export const applyTheme = (profile) => {
  let bg_color = profile?.bg_color;
  let text_color = profile?.text_color;
  let font_family = profile?.font_family;
  let font_style = profile?.font_style;
  let font_size = profile?.font_size;
  let active_theme = profile?.active_theme;

  // Try fetching cached fallback configurations from local storage
  try {
    const localStylesStr = localStorage.getItem('portfolio_custom_styles');
    if (localStylesStr) {
      const localStyles = JSON.parse(localStylesStr);
      if (!bg_color) bg_color = localStyles.bg_color;
      if (!text_color) text_color = localStyles.text_color;
      if (!font_family) font_family = localStyles.font_family;
      if (!font_style) font_style = localStyles.font_style;
      if (!font_size) font_size = localStyles.font_size;
      if (!active_theme) active_theme = localStyles.active_theme;
    }
  } catch (e) {
    console.error('Failed to parse local styles cache:', e);
  }

  const root = document.documentElement;

  // 0. Special Theme Overrides
  if (active_theme === 'pixar_3d') {
    if (!bg_color) bg_color = '#050505';
    if (!text_color) text_color = '#FFFFFF';
    root.style.setProperty('--color-accent-primary', '#8B5CF6');
    root.style.setProperty('--color-accent-secondary', '#3B82F6');
    root.style.setProperty('--color-accent-tertiary', '#A855F7');
  } else if (active_theme === 'prestigelio') {
    if (!bg_color) bg_color = '#000000';
    if (!text_color) text_color = '#FFFFFF';
    root.style.setProperty('--color-accent-primary', '#A855F7');
    root.style.setProperty('--color-accent-secondary', '#c084fc');
    root.style.setProperty('--color-accent-tertiary', '#3B82F6');
  } else if (active_theme === 'vivid_video') {
    if (!bg_color) bg_color = '#030206';
    if (!text_color) text_color = '#FFFFFF';
    root.style.setProperty('--color-accent-primary', '#EC4899');
    root.style.setProperty('--color-accent-secondary', '#8B5CF6');
    root.style.setProperty('--color-accent-tertiary', '#06B6D4');
  } else if (active_theme === 'dev_desk') {
    if (!bg_color) bg_color = '#070b13';
    if (!text_color) text_color = '#FFFFFF';
    root.style.setProperty('--color-accent-primary', '#10B981');
    root.style.setProperty('--color-accent-secondary', '#3B82F6');
    root.style.setProperty('--color-accent-tertiary', '#0EA5E9');
  } else if (active_theme === 'forged_garage') {
    if (!bg_color) bg_color = '#08080a';
    if (!text_color) text_color = '#FFFFFF';
    root.style.setProperty('--color-accent-primary', '#e05a2b');
    root.style.setProperty('--color-accent-secondary', '#7a7a85');
    root.style.setProperty('--color-accent-tertiary', '#d97706');
  } else if (active_theme === 'scrollytelling') {
    if (!bg_color) bg_color = '#121212';
    if (!text_color) text_color = '#FFFFFF';
    root.style.setProperty('--color-accent-primary', '#6c63ff');
    root.style.setProperty('--color-accent-secondary', '#00d4ff');
    root.style.setProperty('--color-accent-tertiary', '#ff6b9d');
  } else if (active_theme === 'akash_studio') {
    if (!bg_color) bg_color = '#0b0c10';
    if (!text_color) text_color = '#f1f5f9';
    root.style.setProperty('--color-accent-primary', '#66fcf1');
    root.style.setProperty('--color-accent-secondary', '#45a29e');
    root.style.setProperty('--color-accent-tertiary', '#c5c6c7');
  } else if (active_theme === 'instagram_harsh') {
    if (!bg_color) bg_color = '#050505';
    if (!text_color) text_color = '#FFFFFF';
    root.style.setProperty('--color-accent-primary', '#a855f7');
    root.style.setProperty('--color-accent-secondary', '#ec4899');
    root.style.setProperty('--color-accent-tertiary', '#eab308');
  } else if (active_theme === 'physics_stack') {
    if (!bg_color) bg_color = '#070b19';
    if (!text_color) text_color = '#FFFFFF';
    root.style.setProperty('--color-accent-primary', '#ec4899');
    root.style.setProperty('--color-accent-secondary', '#06b6d4');
    root.style.setProperty('--color-accent-tertiary', '#10b981');
  } else if (active_theme === 'room_tour') {
    if (!bg_color) bg_color = '#0c0c16';
    if (!text_color) text_color = '#FFFFFF';
    root.style.setProperty('--color-accent-primary', '#fbbf24');
    root.style.setProperty('--color-accent-secondary', '#8b5cf6');
    root.style.setProperty('--color-accent-tertiary', '#f43f5e');
  } else if (active_theme === 'scroll_rider') {
    if (!bg_color) bg_color = '#090e11';
    if (!text_color) text_color = '#FFFFFF';
    root.style.setProperty('--color-accent-primary', '#10b981');
    root.style.setProperty('--color-accent-secondary', '#f59e0b');
    root.style.setProperty('--color-accent-tertiary', '#3b82f6');
  } else if (active_theme === 'avatar_bento') {
    if (!bg_color) bg_color = '#09090b';
    if (!text_color) text_color = '#f4f4f5';
    root.style.setProperty('--color-accent-primary', '#06b6d4');
    root.style.setProperty('--color-accent-secondary', '#6366f1');
    root.style.setProperty('--color-accent-tertiary', '#10b981');
  } else if (active_theme === 'scrub_avatar') {
    if (!bg_color) bg_color = '#05020c';
    if (!text_color) text_color = '#FFFFFF';
    root.style.setProperty('--color-accent-primary', '#8b5cf6');
    root.style.setProperty('--color-accent-secondary', '#ec4899');
    root.style.setProperty('--color-accent-tertiary', '#f59e0b');
  } else {
    root.style.removeProperty('--color-accent-primary');
    root.style.removeProperty('--color-accent-secondary');
    root.style.removeProperty('--color-accent-tertiary');
  }

  // 1. Apply Background Color
  if (bg_color) {
    root.style.setProperty('--color-dark-950', bg_color);
    document.body.style.backgroundColor = bg_color;
  } else {
    root.style.removeProperty('--color-dark-950');
    document.body.style.backgroundColor = '';
  }

  // 2. Apply Text Color
  if (text_color) {
    root.style.setProperty('--color-text-primary', text_color);
    document.body.style.color = text_color;
  } else {
    root.style.removeProperty('--color-text-primary');
    document.body.style.color = '';
  }

  // 3. Apply Font Style
  if (font_style) {
    document.body.style.fontStyle = font_style;
  } else {
    document.body.style.fontStyle = '';
  }

  // 4. Apply Font Size
  if (font_size) {
    document.body.style.fontSize = font_size;
  } else {
    document.body.style.fontSize = '';
  }

  // 5. Apply Font Family
  if (font_family) {
    const googleFonts = [
      'Poppins', 
      'Roboto', 
      'Playfair Display', 
      'Montserrat', 
      'Fira Code', 
      'Merriweather', 
      'Lora', 
      'Outfit'
    ];
    if (googleFonts.includes(font_family)) {
      const fontId = `google-font-${font_family.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font_family.replace(/\s+/g, '+')}:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap`;
        document.head.appendChild(link);
      }
    }
    document.body.style.fontFamily = `"${font_family}", sans-serif`;
  } else {
    document.body.style.fontFamily = '';
  }
};
