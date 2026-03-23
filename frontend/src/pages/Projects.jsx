import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import './Projects.css';

const STATUS_OPTIONS = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'planning' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [search, statusFilter]);

  const loadProjects = async () => {
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await projectsAPI.list(params);
      setProjects(res.data.projects);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await projectsAPI.update(editingId, formData);
      } else {
        await projectsAPI.create(formData);
      }
      setShowForm(false);
      setFormData({ name: '', description: '', status: 'planning' });
      setEditingId(null);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setFormData({ name: project.name, description: project.description || '', status: project.status });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectsAPI.delete(id);
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ name: '', description: '', status: 'planning' });
    setEditingId(null);
    setError('');
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects ({total})</h1>
        <button className="btn-primary" onClick={() => { handleCancel(); setShowForm(true); }}>
          + New Project
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="card form-card">
          <h2>{editingId ? 'Edit Project' : 'New Project'}</h2>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit} className="project-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                minLength={1}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state card">
          <p>No projects found. Create one to get started!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-item card">
              <div className="project-item-header">
                <Link to={`/projects/${project.id}`}>
                  <h3>{project.name}</h3>
                </Link>
                <span className={`badge badge-${project.status}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <p className="project-item-desc">{project.description || 'No description'}</p>
              <div className="project-item-footer">
                <span className="task-count">📋 {project.task_count} tasks</span>
                <div className="project-actions">
                  <button className="btn-secondary btn-sm" onClick={() => handleEdit(project)}>Edit</button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(project.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
