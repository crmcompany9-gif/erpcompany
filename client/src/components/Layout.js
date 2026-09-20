import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import API from '../api/axios';

function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isHOD = user.role === 'hod' || user.role === 'manager';
  const canAddClient = ['kam', 'accounts', 'hod', 'manager'].includes(user.role);

  const [taskCounts, setTaskCounts] = useState({ pending: 0, overdue: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCounts = () => {
      API.get('/tasks/counts/pending')
        .then(({ data }) => setTaskCounts(data))
        .catch(() => { });
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  // Heartbeat — every 5 minutes
  const sendHeartbeat = () => {
    API.post('/auth/heartbeat').catch(() => {});
  };

  sendHeartbeat(); // Send immediately on load
  const heartbeat = setInterval(sendHeartbeat, 5 * 60 * 1000);
  return () => clearInterval(heartbeat);
}, []);

 const handleLogout = async () => {
  try {
    await API.post('/auth/logout');
  } catch {}
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigate('/login');
};

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'EG';

  const totalBadge = taskCounts.pending + taskCounts.overdue;
  const closeSidebar = () => setSidebarOpen(false);

  const getRoleLabel = (role) => {
    const map = {
      hod: 'Head of Dept', manager: 'Manager', accounts: 'Accounts',
      kam: 'KAM', certification: 'Certification', poc: 'POC',
      retention: 'Retention', content: 'Content', it: 'IT', legal: 'Legal',
    };
    return map[role] || role;
  };

  if (user.role === 'client') return <Navigate to="/my-portal" />;

  return (
    <div className="app">

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 199,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className="sidebar" style={{
        transform: window.innerWidth <= 768
          ? sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
          : 'translateX(0)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">🤝</div>
          <div className="logo-text">
            <div className="logo-name">Elbow Grease</div>
            <div className="logo-sub">Internal Portal</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>

          <NavLink to="/" end
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={closeSidebar}>
            <span className="nav-icon">📊</span><span>Dashboard</span>
          </NavLink>

          <NavLink to="/clients"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={closeSidebar}>
            <span className="nav-icon">🏢</span><span>Clients</span>
          </NavLink>

          <NavLink to="/tasks"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={closeSidebar}>
            <span className="nav-icon">✅</span><span>My Tasks</span>
            {totalBadge > 0 && (
              <span className="nav-badge"
                style={{ background: taskCounts.overdue > 0 ? 'var(--red)' : 'var(--gold)' }}>
                {totalBadge}
              </span>
            )}
          </NavLink>

          <div className="nav-section-label" style={{ marginTop: 8 }}>Reports</div>

          <NavLink to="/departments"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={closeSidebar}>
            <span className="nav-icon">🏛️</span><span>Departments</span>
          </NavLink>

          <NavLink to="/sla"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={closeSidebar}>
            <span className="nav-icon">⏱️</span><span>SLA Tracker</span>
          </NavLink>

          {isHOD && (
            <>
              <div className="nav-section-label" style={{ marginTop: 8 }}>HOD Only</div>
              <NavLink to="/employees"
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                onClick={closeSidebar}>
                <span className="nav-icon">👥</span><span>Employees</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name || 'Employee'}
              </div>
              <div className="user-role">{getRoleLabel(user.role)}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main">

        {/* Topbar */}
        <div className="topbar">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hamburger"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          {/* Welcome */}
          <div className="topbar-title" style={{ fontSize: 15 }}>
            Welcome, {user.name?.split(' ')[0] || 'there'} 👋
          </div>

          <div className="topbar-right">
            {/* Overdue alert */}
            {taskCounts.overdue > 0 && (
              <div
                onClick={() => navigate('/tasks')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'var(--red-light)', border: '1px solid #FECACA',
                  borderRadius: 8, padding: '5px 11px',
                  cursor: 'pointer', fontSize: 12, color: 'var(--red)', fontWeight: 600,
                }}
              >
                🚨 {taskCounts.overdue} overdue
              </div>
            )}

            {/* Role badge */}
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: 'var(--blue-light)', color: 'var(--blue)',
              padding: '4px 10px', borderRadius: 20,
              border: '1px solid #BFDBFE',
              letterSpacing: '.03em', textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              {user.department || getRoleLabel(user.role)}
            </span>

            {/* Add client */}
            {canAddClient && (
              <NavLink to="/clients/add" className="btn btn-primary btn-sm">
                + Add Client
              </NavLink>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;