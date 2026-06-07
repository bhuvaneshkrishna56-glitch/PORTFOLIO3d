import { useState, useEffect, useCallback } from 'react';
import { fetchProjects } from '../services/projectService';
import ProjectForm from '../components/ProjectForm';
import ProjectList from '../components/ProjectList';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const result = await fetchProjects();
    if (!result.error) {
      setProjects(result.projects);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glass-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Manage Projects</h1>
          <p className="text-text-secondary text-sm mt-1">Add, view, and delete your portfolio projects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to add project */}
        <div className="lg:col-span-1">
          <ProjectForm onProjectAdded={fetchList} />
        </div>

        {/* List of existing projects */}
        <div className="lg:col-span-2">
          {loading ? (
            <LoadingSpinner message="Refreshing projects..." />
          ) : (
            <ProjectList projects={projects} onProjectDeleted={fetchList} />
          )}
        </div>
      </div>
    </div>
  );
}
