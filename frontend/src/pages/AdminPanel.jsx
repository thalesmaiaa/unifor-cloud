import { useState, useEffect } from 'react';
import { usersAPI, logsAPI } from '../services/api';
import './AdminPanel.css';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await usersAPI.list();
        setUsers(res.data);
      } else {
        const res = await logsAPI.list({ limit: 100 });
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${user.full_name}'s role to ${newRole}?`)) return;
    try {
      await usersAPI.update(user.id, { role: newRole });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update role');
    }
  };

  const handleToggleActive = async (user) => {
    const action = user.is_active ? 'deactivate' : 'activate';
    if (!confirm(`${action} ${user.full_name}?`)) return;
    try {
      await usersAPI.update(user.id, { is_active: !user.is_active });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Delete user ${user.full_name}? This cannot be undone.`)) return;
    try {
      await usersAPI.delete(user.id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Activity Logs
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : activeTab === 'users' ? (
        <div className="admin-table-container card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge role-${user.role}`}>{user.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${user.is_active ? 'badge-active' : 'badge-cancelled'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="action-cell">
                    <button className="btn-secondary btn-sm" onClick={() => handleToggleRole(user)}>
                      {user.role === 'admin' ? '→ User' : '→ Admin'}
                    </button>
                    <button className="btn-secondary btn-sm" onClick={() => handleToggleActive(user)}>
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => handleDeleteUser(user)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-table-container card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User ID</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.user_id}</td>
                  <td><span className="badge badge-medium">{log.action}</span></td>
                  <td>{log.resource_type} #{log.resource_id}</td>
                  <td className="details-cell">{log.details}</td>
                  <td>{log.ip_address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
