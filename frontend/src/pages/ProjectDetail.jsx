import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../services/api';
import './ProjectDetail.css';

const TASK_STATUS = ['todo', 'in_progress', 'review', 'done'];
const TASK_PRIORITY = ['low', 'medium', 'high', 'critical'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (project) loadTasks();
  }, [project, statusFilter, priorityFilter]);

  const loadProject = async () => {
    try {
      const res = await projectsAPI.get(id);
      setProject(res.data);
    } catch (err) {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const params = { project_id: id };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await tasksAPI.list(params);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingTaskId) {
        await tasksAPI.update(editingTaskId, taskForm);
      } else {
        await tasksAPI.create({ ...taskForm, project_id: parseInt(id) });
      }
      setShowTaskForm(false);
      setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium' });
      setEditingTaskId(null);
      loadTasks();
      loadProject();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save task');
    }
  };

  const handleEditTask = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
    });
    setEditingTaskId(task.id);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      loadTasks();
      loadProject();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleQuickStatusUpdate = async (task, newStatus) => {
    try {
      await tasksAPI.update(task.id, { status: newStatus });
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const cancelTaskForm = () => {
    setShowTaskForm(false);
    setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium' });
    setEditingTaskId(null);
    setError('');
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return null;

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    review: tasks.filter((t) => t.status === 'review'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  return (
    <div className="project-detail">
      <div className="detail-header">
        <div>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/projects')}>← Back</button>
          <h1>{project.name}</h1>
          <p className="detail-desc">{project.description || 'No description'}</p>
          <div className="detail-meta">
            <span className={`badge badge-${project.status}`}>{project.status.replace('_', ' ')}</span>
            <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="tasks-section">
        <div className="tasks-header">
          <h2>Tasks ({tasks.length})</h2>
          <div className="tasks-controls">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {TASK_STATUS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              {TASK_PRIORITY.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <button className="btn-primary" onClick={() => { cancelTaskForm(); setShowTaskForm(true); }}>
              + Add Task
            </button>
          </div>
        </div>

        {showTaskForm && (
          <div className="card form-card">
            <h3>{editingTaskId ? 'Edit Task' : 'New Task'}</h3>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleTaskSubmit} className="task-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    {TASK_PRIORITY.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  >
                    {TASK_STATUS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">{editingTaskId ? 'Update' : 'Create'}</button>
                <button type="button" className="btn-secondary" onClick={cancelTaskForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {!statusFilter && !priorityFilter ? (
          <div className="kanban-board">
            {TASK_STATUS.map((status) => (
              <div key={status} className="kanban-column">
                <div className={`kanban-header kanban-${status}`}>
                  <span>{status.replace('_', ' ')}</span>
                  <span className="kanban-count">{tasksByStatus[status]?.length || 0}</span>
                </div>
                <div className="kanban-tasks">
                  {(tasksByStatus[status] || []).map((task) => (
                    <div key={task.id} className="task-card card">
                      <div className="task-card-top">
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        <div className="task-card-actions">
                          <button className="btn-sm btn-secondary" onClick={() => handleEditTask(task)}>✏️</button>
                          <button className="btn-sm btn-danger" onClick={() => handleDeleteTask(task.id)}>🗑</button>
                        </div>
                      </div>
                      <h4>{task.title}</h4>
                      {task.description && <p className="task-desc">{task.description}</p>}
                      <div className="task-status-actions">
                        {TASK_STATUS.filter((s) => s !== task.status).map((s) => (
                          <button
                            key={s}
                            className="btn-sm btn-secondary"
                            onClick={() => handleQuickStatusUpdate(task, s)}
                          >
                            → {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="task-list">
            {tasks.length === 0 ? (
              <p className="empty-state card">No tasks match the filters.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="task-list-item card">
                  <div className="task-list-info">
                    <h4>{task.title}</h4>
                    <div className="task-badges">
                      <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    </div>
                  </div>
                  <div className="project-actions">
                    <button className="btn-secondary btn-sm" onClick={() => handleEditTask(task)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
