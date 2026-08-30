import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../api/axios';

const ROLES = ['hod','manager','accounts','kam','certification','retention','poc','content','grooming','it','legal'];
const DEPARTMENTS = ['Operations','Accounts','KAM','Certification','Retention','POC','Content','Grooming','IT','Legal'];

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [clientAccounts, setClientAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'kam', department:'KAM' });

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmployee, setResetEmployee] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [editForm, setEditForm] = useState({ name:'', role:'', department:'' });
  const [editing, setEditing] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchEmployees = () => {
    API.get('/employees')
      .then(({ data }) => {
        setEmployees(data.filter(u => u.role !== 'client'));
        setClientAccounts(data.filter(u => u.role === 'client'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/employees', form);
      toast.success('✅ Employee created!');
      setForm({ name:'', email:'', password:'', role:'kam', department:'KAM' });
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, name, isActive) => {
    if (isActive) {
      if (!window.confirm(`Deactivate ${name}?`)) return;
    }
    try {
      await API.put(`/employees/${id}/toggle`);
      toast.success(`${name} ${isActive ? '🔒 deactivated' : '✅ activated'}`);
      fetchEmployees();
    } catch {
      toast.error('Failed to update');
    }
  };

  const openResetModal = (emp) => {
    setResetEmployee(emp);
    setNewPassword('');
    setShowResetModal(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setResetting(true);
    try {
      await API.put(`/employees/${resetEmployee._id}/reset-password`, { newPassword });
      toast.success(`✅ Password reset for ${resetEmployee.name}`);
      setShowResetModal(false);
      setNewPassword('');
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const openEditModal = (emp) => {
    setEditEmployee(emp);
    setEditForm({ name: emp.name, role: emp.role, department: emp.department || 'Client' });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    setEditing(true);
    try {
      await API.put(`/employees/${editEmployee._id}/edit`, editForm);
      toast.success(`✅ ${editEmployee.name} updated!`);
      setShowEditModal(false);
      fetchEmployees();
    } catch {
      toast.error('Failed to update');
    } finally {
      setEditing(false);
    }
  };

  const roleColor = (role) => {
    const map = { hod:'badge-red', manager:'badge-orange', accounts:'badge-blue', kam:'badge-green', certification:'badge-gold', retention:'badge-blue', poc:'badge-gray', content:'badge-gold', grooming:'badge-gray', it:'badge-blue', legal:'badge-red', client:'badge-green' };
    return map[role] || 'badge-gray';
  };

  if (loading) return <div className="loading">Loading employees...</div>;

  if (user.role !== 'hod' && user.role !== 'manager') {
    return (
      <div className="card">
        <div style={{textAlign:'center',padding:40}}>
          <div style={{fontSize:36,marginBottom:8}}>🔒</div>
          <div style={{fontWeight:600}}>Access Restricted</div>
          <div style={{color:'var(--muted)',fontSize:13,marginTop:4}}>Only HOD can manage employees</div>
        </div>
      </div>
    );
  }

  const ActionButtons = ({ emp }) => (
    emp._id === user.id
      ? <span style={{fontSize:11,color:'var(--muted)'}}>You</span>
      : <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          <button className="btn btn-outline btn-sm" onClick={() => openEditModal(emp)}>✏️ Edit</button>
          <button className="btn btn-outline btn-sm" onClick={() => openResetModal(emp)}>🔑 Password</button>
          <button
            className={`btn btn-sm ${emp.isActive ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => handleToggle(emp._id, emp.name, emp.isActive)}
          >
            {emp.isActive ? '🔒 Deactivate' : '✅ Activate'}
          </button>
        </div>
  );

  const TableHead = () => (
    <thead>
      <tr>
        <th>#</th><th>Name</th><th>Email</th><th>Role</th>
        <th>Department</th><th>Status</th><th>Joined</th><th>Actions</th>
      </tr>
    </thead>
  );

  const EmpRow = ({ emp, i, isClient }) => (
    <tr key={emp._id} style={{opacity: emp.isActive ? 1 : 0.5}}>
      <td style={{color:'var(--muted)'}}>{String(i+1).padStart(2,'0')}</td>
      <td>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{
            width:32,height:32,borderRadius:'50%',
            background: emp.isActive ? (isClient?'var(--green)':'var(--blue)') : 'var(--light)',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'#fff',fontWeight:700,fontSize:11,flexShrink:0,
          }}>
            {emp.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <div>
            <div style={{fontWeight:600}}>{emp.name}</div>
            {!emp.isActive && <div style={{fontSize:10,color:'var(--red)',fontWeight:600}}>INACTIVE</div>}
          </div>
        </div>
      </td>
      <td style={{color:'var(--muted)',fontSize:12}}>{emp.email}</td>
      <td><span className={`badge ${roleColor(emp.role)}`}>{emp.role.toUpperCase()}</span></td>
      <td style={{fontSize:13}}>{isClient ? '🌐 Client Portal' : emp.department}</td>
      <td>
        {emp.isActive
          ? <span className="badge badge-green">Active</span>
          : <span className="badge badge-gray">Inactive</span>}
      </td>
      <td style={{color:'var(--muted)',fontSize:12}}>{new Date(emp.createdAt).toLocaleDateString('en-IN')}</td>
      <td><ActionButtons emp={emp} /></td>
    </tr>
  );

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{employees.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{color:'var(--green)'}}>{employees.filter(e=>e.isActive).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-label">Inactive</div>
          <div className="stat-value" style={{color:'var(--muted)'}}>{employees.filter(e=>!e.isActive).length}</div>
        </div>
      </div>

      {/* Add Employee Form */}
      {showForm && (
        <div className="card">
          <div className="card-title">Create New Employee Account</div>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" placeholder="e.g. Tanmay Pandey" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" placeholder="tanmay@elbowgrease.in" value={form.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  {ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Department *</label>
                <select name="department" value={form.department} onChange={handleChange}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Creating...' : '✅ Create Employee'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── EMPLOYEES TABLE ── */}
      <div className="card">
        <div className="card-title">
          All Employees ({employees.length})
          {!showForm && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Add Employee</button>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <TableHead />
            <tbody>
              {employees.map((emp, i) => <EmpRow key={emp._id} emp={emp} i={i} isClient={false} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CLIENT ACCOUNTS TABLE ── */}
      {clientAccounts.length > 0 && (
        <div className="card" style={{marginTop:24}}>
          <div className="card-title">
            🌐 Client Portal Accounts ({clientAccounts.length})
          </div>
          <div style={{fontSize:12,color:'var(--muted)',marginBottom:12}}>
            Client login accounts for the portal. Created from the client detail page by Manager.
          </div>
          <div className="table-wrap">
            <table>
              <TableHead />
              <tbody>
                {clientAccounts.map((emp, i) => <EmpRow key={emp._id} emp={emp} i={i} isClient={true} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── RESET PASSWORD MODAL ── */}
      {showResetModal && resetEmployee && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'var(--white)',borderRadius:12,padding:28,width:400,boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{fontFamily:'Space Grotesk,sans-serif',fontSize:16,fontWeight:700,marginBottom:6}}>🔑 Reset Password</div>
            <div style={{fontSize:13,color:'var(--muted)',marginBottom:20}}>Setting new password for <strong>{resetEmployee.name}</strong></div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoFocus />
            </div>
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={handleResetPassword} disabled={resetting}>
                {resetting ? 'Resetting...' : '✅ Reset Password'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowResetModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showEditModal && editEmployee && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'var(--white)',borderRadius:12,padding:28,width:440,boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{fontFamily:'Space Grotesk,sans-serif',fontSize:16,fontWeight:700,marginBottom:6}}>
              ✏️ Edit {editEmployee.role === 'client' ? 'Client Account' : 'Employee'}
            </div>
            <div style={{fontSize:13,color:'var(--muted)',marginBottom:20}}>Editing <strong>{editEmployee.name}</strong></div>
            <div className="form-group">
              <label>Full Name</label>
              <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Full name" />
            </div>
            {editEmployee.role !== 'client' && (
              <>
                <div className="form-group">
                  <label>Role</label>
                  <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                    {ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})}>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </>
            )}
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={handleEdit} disabled={editing}>
                {editing ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;