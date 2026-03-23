import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          📋 ProjectManager
        </Link>

        <div className="navbar-links">
          <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
          <Link to="/projects" className={isActive('/projects')}>Projects</Link>
          {isAdmin && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
        </div>

        <div className="navbar-user">
          <span className="user-info">
            {user?.full_name}
            <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          </span>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </div>
    </nav>
  );
}
