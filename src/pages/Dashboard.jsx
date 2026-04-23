import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLayout, FiLogOut, FiFolder, FiAward, FiChevronDown, FiChevronUp, FiUser, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { logoutAdmin } from '../services/authService';
import { fetchProjects } from '../services/projectService';
import { fetchCertificates } from '../services/certificateService';
import { updateResume, deleteResume } from '../services/profileService';
import ProjectForm from '../components/ProjectForm';
import CertificateForm from '../components/CertificateForm';
import ProjectList from '../components/ProjectList';
import CertificateList from '../components/CertificateList';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    if (!authLoading && !user) navigate('/system-mgmt-ebinesar');
  }, [user, authLoading, navigate]);

  const loadAllData = useCallback(async () => {
    setLoadingData(true);
    const [projectsResult, certsResult] = await Promise.all([
      fetchProjects(),
      fetchCertificates(),
    ]);
    if (!projectsResult.error) setProjects(projectsResult.projects);
    if (!certsResult.error) setCertificates(certsResult.certificates);
    setLoadingData(false);
  }, []);

  useEffect(() => { if (user) loadAllData(); }, [user, loadAllData]);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/');
  };

  if (authLoading) return <LoadingSpinner message="Authenticating..." fullScreen />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-950 pt-28 pb-20 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white/5 p-8 rounded-3xl border border-glass-border">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 flex items-center justify-center text-accent-primary">
              <FiUser size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome, <span className="gradient-text">Ebinesar A</span></h1>
              <p className="text-text-muted text-sm font-medium">Administrator Panel</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-error/10 text-error border border-error/20 hover:bg-error/20 transition-all font-bold text-sm">
            <FiLogOut /> Logout
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 mb-8">
           {['projects', 'certificates', 'profile'].map(tab => (
             <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab ? 'bg-accent-primary text-white' : 'bg-dark-800 text-text-muted border border-glass-border'
              }`}
             >
               {tab}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Forms / Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-morphism p-6 rounded-3xl">
               <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-6">Quick Actions</h3>
               <button onClick={() => setShowProjectForm(!showProjectForm)} className="w-full mb-3 flex items-center justify-between p-4 bg-accent-primary/10 text-accent-primary rounded-xl font-bold text-xs uppercase tracking-tight hover:bg-accent-primary/20 transition-all">
                  <span>Add Project</span>
                  {showProjectForm ? <FiChevronUp /> : <FiChevronDown />}
               </button>
               <button onClick={() => setShowCertForm(!showCertForm)} className="w-full flex items-center justify-between p-4 bg-accent-secondary/10 text-accent-secondary rounded-xl font-bold text-xs uppercase tracking-tight hover:bg-accent-secondary/20 transition-all">
                  <span>Add Certificate</span>
                  {showCertForm ? <FiChevronUp /> : <FiChevronDown />}
               </button>
            </div>

            <div className="glass-morphism p-6 rounded-3xl">
               <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-6">Stats Overview</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary">Live Projects</span>
                    <span className="text-lg font-bold text-accent-primary">{projects.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary">Certifications</span>
                    <span className="text-lg font-bold text-accent-secondary">{certificates.length}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Column 2-4: Main View */}
          <div className="lg:col-span-3 space-y-8">
             
             {/* Forms Rendering */}
             {showProjectForm && (
               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
                 <ProjectForm onProjectAdded={loadAllData} />
               </motion.div>
             )}

             {showCertForm && (
               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
                 <CertificateForm onCertificateAdded={loadAllData} />
               </motion.div>
             )}

             {/* Tab Content */}
             {loadingData ? <LoadingSpinner /> : (
               <>
                 {activeTab === 'projects' && (
                    <ProjectList projects={projects} onProjectDeleted={loadAllData} />
                 )}
                 {activeTab === 'certificates' && (
                    <CertificateList certificates={certificates} onCertificateDeleted={loadAllData} />
                 )}
                  {activeTab === 'profile' && (
                    <div className="glass-morphism p-10 rounded-[2.5rem] space-y-10">
                       <h2 className="text-2xl font-bold">Profile & Resume</h2>
                       
                       {/* Resume Section */}
                       <div className="p-6 border border-accent-secondary/20 bg-accent-secondary/5 rounded-3xl space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                               <h4 className="font-bold text-accent-secondary flex items-center gap-2">
                                  <FiAward /> Active Resume
                               </h4>
                               <p className="text-xs text-text-muted mt-1">This file is linked to the "Resume" button in your navbar.</p>
                            </div>
                            <div className="flex gap-2">
                               <button 
                                  onClick={async () => {
                                     if(window.confirm('Are you sure you want to delete your resume link?')) {
                                        setUploadingResume(true);
                                        const res = await deleteResume();
                                        if (res.error) alert(res.error);
                                        else alert('Resume link deleted.');
                                        setUploadingResume(false);
                                     }
                                  }}
                                  className="py-2 px-4 text-xs font-bold text-error border border-error/20 hover:bg-error/10 rounded-xl transition-all"
                               >
                                  Delete
                               </button>
                               <label className="btn-secondary py-2 px-4 text-xs cursor-pointer">
                                  {uploadingResume ? 'Uploading...' : 'Update Resume'}
                                  <input 
                                     type="file" 
                                     accept=".pdf" 
                                     className="hidden" 
                                     onChange={async (e) => {
                                       const file = e.target.files[0];
                                       if (file) {
                                          setUploadingResume(true);
                                          const res = await updateResume(file);
                                          if (res.error) alert(res.error);
                                          else alert('Resume updated successfully!');
                                          setUploadingResume(false);
                                       }
                                     }}
                                  />
                               </label>
                            </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-text-muted">Display Name</label>
                            <input disabled value="Ebinesar A" className="w-full bg-dark-700 border border-glass-border px-4 py-3 rounded-xl text-sm" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-text-muted">Role</label>
                             <input disabled value="Web Developer" className="w-full bg-dark-700 border border-glass-border px-4 py-3 rounded-xl text-sm" />
                          </div>
                       </div>
                       <p className="text-xs text-accent-tertiary">Note: Direct profile editing is locked for security. Update via supabase console.</p>
                       <div className="flex gap-4 pt-4">
                          <FiGithub size={20} className="text-text-muted" />
                          <FiLinkedin size={20} className="text-text-muted" />
                          <FiTwitter size={20} className="text-text-muted" />
                       </div>
                    </div>
                 )}
               </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
