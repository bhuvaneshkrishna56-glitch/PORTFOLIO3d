import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Hook to access the global Supabase auth state
 * Redirects all calls to the centralized AuthContext
 */
export const useAuth = () => {
  return useAuthContext();
};
