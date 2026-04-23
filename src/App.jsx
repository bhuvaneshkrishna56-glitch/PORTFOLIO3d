import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './hooks/useAuth';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const Certificates = lazy(() => import('./pages/Certificates'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/system-mgmt-ebinesar" element={<AdminLogin />} />
            <Route path="/secure-dashboard-access" element={<Dashboard />} />
          </Routes>
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
