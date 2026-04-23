import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLayout, FiLogOut, FiFolder, FiAward, FiChevronDown, FiChevronUp, FiUser, FiGithub, FiLinkedin, FiTwitter, FiGrid, FiCpu } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { logoutAdmin } from '../services/authService';
import { fetchProjects } from '../services/projectService';
import { fetchCertificates } from '../services/certificateService';
import { updateResume, deleteResume, updateProfileTheme, fetchProfile } from '../services/profileService';
import { fetchSkills, addSkill, deleteSkill } from '../services/skillService';
import { 
  fetchExperiences, addExperience, deleteExperience,
  fetchLearnings, addLearning, deleteLearning,
  fetchServices, addService, deleteService 
} from '../services/cmsService';
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
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [learnings, setLearnings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState('cosmic');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    if (!authLoading && !user) navigate('/system-mgmt-ebinesar');
  }, [user, authLoading, navigate]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    const [projRes, certRes, skillRes, expRes, learnRes, servRes] = await Promise.all([
      fetchProjects(),
      fetchCertificates(),
      fetchSkills(),
      fetchExperiences(),
      fetchLearnings(),
      fetchServices()
    ]);
    
    setProjects(projRes.projects || []);
    setCertificates(certRes.certificates || []);
    setSkills(skillRes.skills || []);
    setExperiences(expRes.experiences || []);
    setLearnings(learnRes.learnings || []);
    setServices(servRes.services || []);
    
    const profRes = await fetchProfile();
    if (profRes.profile?.active_theme) setActiveTheme(profRes.profile.active_theme);
    
    setLoading(false);
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
        <div className="flex flex-wrap gap-2 mb-8 bg-dark-600/30 p-2 rounded-2xl border border-glass-border">
          {[
            { id: 'projects', label: 'Projects', icon: <FiGrid /> },
            { id: 'certificates', label: 'Certificates', icon: <FiAward /> },
            { id: 'skills', label: 'Tech Stack', icon: <FiCpu /> },
            { id: 'themes', label: '3D Themes', icon: <FiLayout /> },
            { id: 'journey', label: 'Journey', icon: <FiAward /> },
            { id: 'cms', label: 'Learnings & Services', icon: <FiLayout /> },
            { id: 'profile', label: 'Profile', icon: <FiUser /> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab.id ? 'bg-accent-primary text-white' : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon} {tab.label}
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
             {loading ? <LoadingSpinner /> : (
               <>
                 {activeTab === 'projects' && (
                    <ProjectList projects={projects} onProjectDeleted={loadAllData} />
                 )}
                 {activeTab === 'certificates' && (
                    <CertificateList certificates={certificates} onCertificateDeleted={loadAllData} />
                 )}
                  {activeTab === 'themes' && (
                     <div className="space-y-8">
                        <div className="text-center space-y-2 mb-10">
                           <h3 className="text-2xl font-bold">Design Studio</h3>
                           <p className="text-text-muted text-sm">Choose the 3D soul of your portfolio</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                           {[
                              { id: 'cyber_grid', name: 'Cyberpunk', desc: 'Neon city', bg: 'bg-black border border-cyan-500' },
                              { id: 'glass_universe', name: 'Glass', desc: 'Floating glass', bg: 'bg-indigo-900' },
                              { id: 'neural_net', name: 'Neural', desc: 'AI nodes', bg: 'bg-slate-900' },
                              { id: 'space_orbit', name: 'Orbit', desc: 'Planets', bg: 'bg-black' },
                              { id: 'block_stack', name: 'Blocks', desc: '3D blocks', bg: 'bg-orange-600' },
                              { id: 'hologram', name: 'Hologram', desc: 'Sci-fi UI', bg: 'bg-black' },
                              { id: 'tunnel', name: 'Tunnel', desc: 'Infinite', bg: 'bg-blue-950' },
                              { id: 'liquid_metal', name: 'Liquid', desc: 'Reflections', bg: 'bg-slate-300' },
                              { id: 'electric', name: 'Electric', desc: 'Energy', bg: 'bg-violet-900' },
                              { id: 'helix', name: 'DNA', desc: 'Genetic', bg: 'bg-green-900' },
                              
                              // Space
                              { id: 'galaxy_core', name: 'Galaxy', desc: 'Spiral', bg: 'bg-blue-900' },
                              { id: 'warp_speed', name: 'Warp', desc: 'Hyper', bg: 'bg-zinc-900' },
                              { id: 'black_hole', name: 'B-Hole', desc: 'L-Bending', bg: 'bg-black' },
                              { id: 'nebula', name: 'Nebula', desc: 'Fog', bg: 'bg-indigo-900' },
                              { id: 'solar_system', name: 'Solar', desc: 'System', bg: 'bg-black' },
                              { id: 'planet_surface', name: 'Planet', desc: 'Surface', bg: 'bg-orange-900' },
                              { id: 'space_station', name: 'Station', desc: 'Hub', bg: 'bg-slate-800' },
                              { id: 'constellation', name: 'Constell', desc: 'Lines', bg: 'bg-black' },
                              { id: 'telescope', name: 'Lens', desc: 'Scope', bg: 'bg-zinc-950' },
                              { id: 'portal', name: 'Portal', desc: 'Gate', bg: 'bg-cyan-900' },

                              // Nature
                              { id: 'spring_blossom', name: 'Blossom', desc: 'Sakura', bg: 'bg-green-900' },
                              { id: 'flower_field', name: 'Field', desc: 'Blooms', bg: 'bg-pink-900' },
                              { id: 'breeze_leaves', name: 'Breeze', desc: 'Leaves', bg: 'bg-emerald-900' },
                              { id: 'bloom_interact', name: 'Bloom', desc: 'Growth', bg: 'bg-black' },
                              { id: 'glass_forest', name: 'Forest', desc: 'Nature', bg: 'bg-green-950' },
                              { id: 'butterfly', name: 'Fly', desc: 'Motion', bg: 'bg-indigo-950' },
                              { id: 'spring_sky', name: 'Sky', desc: 'Islands', bg: 'bg-sky-900' },
                              { id: 'growing_ui', name: 'Grow', desc: 'Organic', bg: 'bg-green-800' },
                              { id: 'water_garden', name: 'Water', desc: 'Mirror', bg: 'bg-cyan-950' },
                              { id: 'sakura_exp', name: 'Sakura', desc: 'Burst', bg: 'bg-pink-600' },

                              // Tech & UI (New)
                              { id: 'data_stream', name: 'Data', desc: 'Streams', bg: 'bg-blue-600' },
                              { id: 'layered_depth', name: 'Layers', desc: 'Z-Axis', bg: 'bg-slate-700' },
                              { id: 'code_matrix', name: 'Matrix', desc: 'Hacker', bg: 'bg-black border border-green-500' },
                              { id: 'grid_cards', name: 'Cards', desc: '3D Grid', bg: 'bg-orange-500' },
                              { id: 'game_world', name: 'Game', desc: 'RPG Hub', bg: 'bg-indigo-600' },
                              { id: 'tech_lab', name: 'Lab', desc: 'Exp UI', bg: 'bg-zinc-800' },
                              { id: 'luxury_dark', name: 'Luxury', desc: 'Gold/Dark', bg: 'bg-black ring-1 ring-yellow-600' },
                              { id: 'bento_3d', name: 'Bento', desc: 'Depth', bg: 'bg-slate-200' },
                              { id: 'fluid_wave', name: 'Wave', desc: 'Organic', bg: 'bg-blue-400' },
                              { id: 'cube_nav', name: 'Cube', desc: 'Interact', bg: 'bg-violet-600' }
                           ].map(t => (
                              <motion.div 
                                key={t.id}
                                whileHover={{ scale: 1.1, zIndex: 10 }}
                                className={`glass-morphism p-3 rounded-[1.5rem] border-2 transition-all cursor-pointer ${
                                   activeTheme === t.id ? 'border-accent-primary shadow-lg shadow-accent-primary/20' : 'border-white/5 opacity-70 hover:opacity-100'
                                }`}
                                onClick={async () => {
                                   setActiveTheme(t.id);
                                   const res = await updateProfileTheme(t.id);
                                   if (res.error) alert(res.error);
                                   else alert(`${t.name} Activated!`);
                                }}
                              >
                                 <div className={`w-full h-12 rounded-lg mb-2 ${t.bg} flex items-center justify-center text-[6px] font-black uppercase text-white overflow-hidden`}>
                                    {t.id.replace('_', ' ')}
                                 </div>
                                 <h4 className="font-bold text-[9px] mb-0.5 truncate">{t.name}</h4>
                                 <p className="text-[8px] text-text-muted truncate leading-tight">{t.desc}</p>
                              </motion.div>
                           ))}
                        </div>
                     </div>
                  )}

                  {activeTab === 'journey' && (
                     <div className="space-y-8">
                        <div className="glass-morphism p-8 rounded-[2.5rem] border-accent-primary/20">
                           <h3 className="text-xl font-bold mb-6">Add New Experience / Achievement</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input id="exp-duration" placeholder="Duration (e.g., Jan 2024 - Present)" className="bg-dark-700 border border-glass-border p-3 rounded-xl text-sm" />
                              <input id="exp-company" placeholder="Company/Organization" className="bg-dark-700 border border-glass-border p-3 rounded-xl text-sm" />
                              <input id="exp-role" placeholder="Role (e.g., Full Stack Intern)" className="bg-dark-700 border border-glass-border p-3 rounded-xl text-sm col-span-2" />
                              <textarea id="exp-desc" placeholder="Brief Description" className="bg-dark-700 border border-glass-border p-3 rounded-xl text-sm col-span-2 h-24" />
                              <input id="exp-achievements" placeholder="Achievements (comma separated)" className="bg-dark-700 border border-glass-border p-3 rounded-xl text-sm col-span-2" />
                           </div>
                           <button 
                             onClick={async () => {
                                const duration = document.getElementById('exp-duration').value;
                                const company = document.getElementById('exp-company').value;
                                const role = document.getElementById('exp-role').value;
                                const description = document.getElementById('exp-desc').value;
                                const achievements = document.getElementById('exp-achievements').value.split(',').map(s => s.trim());
                                
                                if (company && role) {
                                   await addExperience({ duration, company, role, description, achievements });
                                   loadAllData();
                                   alert('Journey entry added!');
                                }
                             }}
                             className="btn-primary mt-6 py-3 px-8"
                           >
                              Save Journey Entry
                           </button>
                        </div>
                        <div className="space-y-4">
                           {experiences.map(exp => (
                              <div key={exp.id} className="glass-morphism p-6 rounded-3xl flex items-center justify-between">
                                 <div>
                                    <h4 className="font-bold">{exp.role} @ {exp.company}</h4>
                                    <p className="text-xs text-text-muted">{exp.duration}</p>
                                 </div>
                                 <button onClick={() => { if(window.confirm('Delete?')) deleteExperience(exp.id).then(loadAllData) }} className="text-error">Delete</button>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {activeTab === 'cms' && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Learnings */}
                        <div className="glass-morphism p-8 rounded-[2.5rem]">
                           <h3 className="text-xl font-bold mb-6">Manage Learnings</h3>
                           <div className="flex gap-2 mb-6">
                              <input id="learn-name" placeholder="New Learning (e.g., AI)" className="flex-grow bg-dark-700 border border-glass-border p-3 rounded-xl text-sm" />
                              <button onClick={async () => {
                                 const name = document.getElementById('learn-name').value;
                                 if (name) { await addLearning(name); loadAllData(); }
                              }} className="btn-primary px-4 text-xs">Add</button>
                           </div>
                           <div className="space-y-2">
                              {learnings.map(l => (
                                 <div key={l.id} className="flex justify-between p-3 bg-white/5 rounded-xl text-sm">
                                    {l.name}
                                    <button onClick={() => deleteLearning(l.id).then(loadAllData)} className="text-error">×</button>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Services */}
                        <div className="glass-morphism p-8 rounded-[2.5rem]">
                           <h3 className="text-xl font-bold mb-6">Manage Services</h3>
                           <div className="space-y-4 mb-6">
                              <input id="serv-title" placeholder="Service Title" className="w-full bg-dark-700 border border-glass-border p-3 rounded-xl text-sm" />
                              <textarea id="serv-desc" placeholder="Service Description" className="w-full bg-dark-700 border border-glass-border p-3 rounded-xl text-sm h-20" />
                              <button onClick={async () => {
                                 const title = document.getElementById('serv-title').value;
                                 const description = document.getElementById('serv-desc').value;
                                 if (title) { await addService({ title, description }); loadAllData(); }
                              }} className="btn-primary w-full py-3">Add Service</button>
                           </div>
                           <div className="space-y-4">
                              {services.map(s => (
                                 <div key={s.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex justify-between font-bold mb-2">
                                       {s.title}
                                       <button onClick={() => deleteService(s.id).then(loadAllData)} className="text-error">Delete</button>
                                    </div>
                                    <p className="text-xs text-text-muted">{s.description}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  {activeTab === 'skills' && (
                     <div className="space-y-8">
                        {/* Add Skill Form */}
                        <div className="glass-morphism p-8 rounded-[2.5rem] border-accent-primary/20">
                           <h3 className="text-xl font-bold mb-6">Add New Technology</h3>
                           <div className="flex flex-col md:flex-row gap-4">
                              <select 
                                id="skill-category"
                                className="bg-dark-700 border border-glass-border p-3 rounded-xl text-sm"
                              >
                                 <option value="Frontend">Frontend</option>
                                 <option value="Backend">Backend</option>
                                 <option value="Programming">Programming</option>
                                 <option value="Tools">Tools</option>
                              </select>
                              <input 
                                id="skill-name"
                                type="text" 
                                placeholder="Technology Name (e.g., Docker)" 
                                className="flex-grow bg-dark-700 border border-glass-border p-3 rounded-xl text-sm"
                              />
                              <button 
                                onClick={async () => {
                                   const name = document.getElementById('skill-name').value;
                                   const category = document.getElementById('skill-category').value;
                                   if (name) {
                                      const res = await addSkill({ name, category });
                                      if (res.error) alert(res.error);
                                      else {
                                         alert('Skill added!');
                                         document.getElementById('skill-name').value = '';
                                         loadAllData();
                                      }
                                   }
                                }}
                                className="btn-primary py-3 px-8"
                              >
                                 Add Skill
                              </button>
                           </div>
                        </div>

                        {/* Skills List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           {['Frontend', 'Backend', 'Programming', 'Tools'].map(cat => (
                              <div key={cat} className="glass-morphism p-6 rounded-3xl">
                                 <h4 className="text-xs font-black uppercase tracking-tighter text-text-muted mb-4">{cat}</h4>
                                 <div className="space-y-2">
                                    {skills.filter(s => s.category === cat).map(skill => (
                                       <div key={skill.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                          <span className="text-sm font-medium">{skill.name}</span>
                                          <button 
                                            onClick={async () => {
                                               if(window.confirm('Delete this skill?')) {
                                                  await deleteSkill(skill.id);
                                                  loadAllData();
                                               }
                                            }}
                                            className="text-error/60 hover:text-error"
                                          >
                                            ×
                                          </button>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
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
