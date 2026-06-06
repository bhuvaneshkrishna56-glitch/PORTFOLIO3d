import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './hooks/useAuth';
import { applyTheme } from './utils/themeHelper';
import { fetchProfile } from './services/profileService';


// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const Certificates = lazy(() => import('./pages/Certificates'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  
  if (!user) {
    return <Navigate to="/system-mgmt-ebinesar" replace />;
  }
  
  return children;
};

// Direct Entry Guard (blocks typing /projects etc. manually)
const EntryGuard = ({ children }) => {
  const location = useLocation();
  const [isAllowed, setIsAllowed] = useState(true);

  useEffect(() => {
    // This only runs on the very first mount of the app (Full Page Load)
    const allowedPaths = ['/', '/system-mgmt-ebinesar', '/secure-dashboard-access'];
    const currentPath = window.location.pathname;
    
    if (!allowedPaths.includes(currentPath)) {
      setIsAllowed(false);
    }
  }, []); // Empty dependency array means it ONLY runs on hard reload

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  useEffect(() => {
    try {
      const localStylesStr = localStorage.getItem('portfolio_custom_styles');
      if (localStylesStr) {
        applyTheme(JSON.parse(localStylesStr));
      }
    } catch (e) {
      console.error('Failed to apply local styles:', e);
    }

    const initTheme = async () => {
      try {
        const { profile } = await fetchProfile();
        if (profile) {
          applyTheme(profile);
          localStorage.setItem('portfolio_custom_styles', JSON.stringify({
            bg_color: profile.bg_color || '',
            text_color: profile.text_color || '',
            font_family: profile.font_family || '',
            font_style: profile.font_style || '',
            font_size: profile.font_size || '',
            active_theme: profile.active_theme || ''
          }));
        }
      } catch (e) {
        console.error('Failed to load profile styles:', e);
      }
    };
    initTheme();
  }, []);


  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <EntryGuard>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/system-mgmt-ebinesar" element={<AdminLogin />} />
              <Route 
                path="/secure-dashboard-access" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </EntryGuard>
        </Suspense>
      </main>

      <Footer />
      
      {/* Advanced Global Features */}
      <AIChatbot />
      <Toaster 
        position="bottom-left"
        toastOptions={{
          style: {
            background: '#151525',
            color: '#f8f9fa',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            fontSize: '14px'
          }
        }}
      />
    </div>
  );
}

export default App;
