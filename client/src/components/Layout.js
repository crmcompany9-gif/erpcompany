import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import API from '../api/axios';

function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isHOD = user.role === 'hod' || user.role === 'manager';
  const [taskCounts, setTaskCounts] = useState({ pending: 0, overdue: 0 });

  useEffect(() => {
    // Fetch task counts for badge
    const fetchCounts = () => {
      API.get('/tasks/counts/pending')
        .then(({ data }) => setTaskCounts(data))
        .catch(() => {});
    };
    fetchCounts();
    // Refresh every 60 seconds
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'EG';

  const totalBadge = taskCounts.pending + taskCounts.overdue;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-name">Elbow Grease</div>
          <div className="logo-sub">Internal Portal</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>

          <NavLink to="/" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span><span>Dashboard</span>
          </NavLink>

          <NavLink to="/clients" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👥</span><span>Clients</span>
          </NavLink>

          <NavLink to="/tasks" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">✅</span><span>My Tasks</span>
            {totalBadge > 0 && (
              <span className="nav-badge" style={{background: taskCounts.overdue > 0 ? 'var(--red)' : 'var(--gold)'}}>
                {totalBadge}
              </span>
            )}
          </NavLink>

          <div className="nav-section-label">Reports</div>

          <NavLink to="/departments" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🏢</span><span>Departments</span>
          </NavLink>

          <NavLink to="/sla" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">⏱️</span><span>SLA Tracker</span>
          </NavLink>

          {isHOD && (
            <>
              <div className="nav-section-label">HOD Only</div>
              <NavLink to="/employees" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">👤</span><span>Employees</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user.name || 'Employee'}</div>
              <div className="user-role">{user.role || 'Staff'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{marginTop:'10px',width:'100%',padding:'7px',background:'rgba(255,255,255,0.08)',border:'none',borderRadius:'6px',color:'rgba(255,255,255,0.6)',cursor:'pointer',fontSize:'12px',fontFamily:'inherit'}}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">
            {user.name ? `Welcome, ${user.name.split(' ')[0]} 👋` : 'Elbow Grease Portal'}
          </div>
          <div className="topbar-right">
            {taskCounts.overdue > 0 && (
              <div onClick={() => navigate('/tasks')} style={{display:'flex',alignItems:'center',gap:6,background:'var(--red-light)',border:'1px solid #FCA5A5',borderRadius:7,padding:'5px 12px',cursor:'pointer',fontSize:12,color:'var(--red)',fontWeight:600}}>
                🚨 {taskCounts.overdue} overdue
              </div>
            )}
            <span style={{fontSize:12,color:'var(--muted)',background:'var(--surface)',padding:'4px 10px',borderRadius:6,border:'1px solid var(--border)'}}>
              {user.department || user.role}
            </span>
          {(user.role === 'kam' || user.role === 'accounts') && (
  <NavLink to="/clients/add" className="btn btn-primary">+ Add Client</NavLink>
)}
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;