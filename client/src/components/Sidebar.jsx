import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard', roles: ['admin', 'content_creator', 'reviewer'] },
    { to: '/content', icon: '📝', label: 'Content', roles: ['admin', 'content_creator', 'reviewer'] },
    { to: '/content/create', icon: '➕', label: 'Create Content', roles: ['admin', 'content_creator'] },
    { to: '/reviews', icon: '✅', label: 'Reviews', roles: ['admin', 'reviewer'] },
    { to: '/users', icon: '👥', label: 'User Management', roles: ['admin'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>📱 Content Platform</h2>
        <p>Social Media Management</p>
      </div>

      <nav className="sidebar-nav">
        {filteredNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <div className="user-details">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-block btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
