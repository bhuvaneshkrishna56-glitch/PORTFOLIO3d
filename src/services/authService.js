import { supabase } from '../supabase/supabase';

/**
 * Logs in the admin user using Supabase Auth
 */
export const loginAdmin = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Logs out the current admin
 */
export const logoutAdmin = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Subscribes to authentication state changes
 */
export const subscribeToAuth = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
};
