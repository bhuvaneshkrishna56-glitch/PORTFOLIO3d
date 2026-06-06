// src/pages/AdminDashboard.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { fetchProfile } from '../services/profileService';
import { useEffect, useState } from 'react';

// Lazy load admin sections
const AdminProjects = lazy(() => import('./AdminProjects'));
const AdminCertificates = lazy(() => import('./AdminCertificates'));
const AdminTechStack = lazy(() => import('./AdminTechStack'));
const AdminLearning = lazy(() => import('./AdminLearning'));
const AdminProfile = lazy(() => import('./AdminProfile'));

const ProtectedAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    const getProfile = async () => {
      const { profile } = await fetchProfile();
      setIsAdmin(profile?.is_admin ?? false);
      setChecking(false);
    };
    getProfile();
  }, [user]);

  if (loading || checking) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/system-mgmt-ebinesar" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default function AdminDashboard() {
  return (
    <ProtectedAdmin>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          <Route path="/admin/projects" element={<AdminProjects />} />
          <Route path="/admin/certificates" element={<AdminCertificates />} />
          <Route path="/admin/tech" element={<AdminTechStack />} />
          <Route path="/admin/learning" element={<AdminLearning />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          {/* default to projects */}
          <Route path="/admin" element={<Navigate to="/admin/projects" replace />} />
        </Routes>
      </Suspense>
    </ProtectedAdmin>
  );
}
