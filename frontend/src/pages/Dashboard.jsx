import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, planning: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await projectsAPI.list({ limit: 5 });
      setProjects(res.data.projects);

      const allRes = await projectsAPI.list({ limit: 100 });
      const all = allRes.data.projects;
      setStats({
        total: allRes.data.total,
        active: all.filter((p) => p.status === 'active').length,
        completed: all.filter((p) => p.status === 'completed').length,
        planning: all.filter((p) => p.status === 'planning').length,
      });
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.full_name}!</h1>
        <Link to="/projects">
          <button className="btn-primary">View All Projects</button>
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card stat-planning">
          <div className="stat-number">{stats.planning}</div>
          <div className="stat-label">Planning</div>
        </div>
      </div>

      <div className="recent-section">
        <h2>Recent Projects</h2>
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet.</p>
            <Link to="/projects">
              <button className="btn-primary">Create your first project</button>
            </Link>
          </div>
        ) : (
          <div className="project-list">
            {projects.map((project) => (
              <Link to={`/projects/${project.id}`} key={project.id} className="project-card-link">
                <div className="project-card">
                  <div className="project-card-header">
                    <h3>{project.name}</h3>
                    <span className={`badge badge-${project.status}`}>{project.status.replace('_', ' ')}</span>
                  </div>
                  <p className="project-card-desc">{project.description || 'No description'}</p>
                  <div className="project-card-meta">
                    <span>📋 {project.task_count} tasks</span>
                    <span>📅 {new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
