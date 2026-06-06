import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const isValidUrl = (url) => {
  if (!url || url === 'YOUR_SUPABASE_URL') return false;
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (e) {
    return false;
  }
};

let supabaseInstance;

if (isValidUrl(supabaseUrl)) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
  }
}

if (!supabaseInstance) {
  console.warn('Supabase is not configured or URL is invalid. Using mock client fallback with offline authentication.');
  
  let currentUser = null;
  const authListeners = new Set();
  
  const triggerAuthChange = (event, session) => {
    authListeners.forEach(callback => {
      try {
        callback(event, session);
      } catch (err) {
        console.error('Error in auth listener:', err);
      }
    });
  };

  supabaseInstance = {
    auth: {
      getSession: async () => ({ 
        data: { 
          session: currentUser ? { user: currentUser } : null 
        } 
      }),
      signInWithPassword: async ({ email, password }) => {
        currentUser = { id: 'mock-admin-id', email: email || 'admin@example.com' };
        // Trigger state change listener asynchronously
        setTimeout(() => triggerAuthChange('SIGNED_IN', { user: currentUser }), 0);
        return { data: { user: currentUser }, error: null };
      },
      signOut: async () => {
        currentUser = null;
        setTimeout(() => triggerAuthChange('SIGNED_OUT', null), 0);
        return { error: null };
      },
      onAuthStateChange: (callback) => {
        authListeners.add(callback);
        // Trigger initial callback
        setTimeout(() => {
          callback(currentUser ? 'SIGNED_IN' : 'SIGNED_OUT', currentUser ? { user: currentUser } : null);
        }, 0);
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => {
                authListeners.delete(callback);
              } 
            } 
          } 
        };
      }
    },
    from: (table) => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
      update: () => ({ eq: () => ({ select: () => Promise.resolve({ data: [], error: null }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) })
    }),
    storage: {
      from: () => ({
        upload: async () => ({ error: new Error('Supabase not configured') }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  };
}

export const supabase = supabaseInstance;
