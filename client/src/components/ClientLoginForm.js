import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../api/axios';

function ClientLoginForm({ clientId, clientName }) {
  const [form, setForm] = useState({ name: clientName, email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if client login already exists
   useEffect(() => {
    API.get(`/employees/check-client-login/${clientId}`)
      .then(res => { if (res.data.exists) setCreated(true); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [clientId]);

  if (checking) return <div style={{fontSize:12,color:'var(--muted)'}}>Checking...</div>;

  const handleCreate = async () => {
    if (!form.email || !form.password) return toast.error('Email and password required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await API.post('/employees/create-client-login', {
        name: form.name,
        email: form.email,
        password: form.password,
        clientId,
      });
      toast.success('✅ Client login created!');
      setCreated(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create login');
    } finally {
      setSaving(false);
    }
  };

 if (created) {
  return (
    <div style={{padding:'12px',background:'var(--green-light)',borderRadius:8,fontSize:13}}>
      <div style={{fontWeight:600,color:'#065f46',marginBottom:4}}>✅ Client login active!</div>
      <div style={{color:'var(--muted)'}}>
        Client can login at: <strong>localhost:3000</strong>
      </div>
    </div>
  );
}

  return (
    <div>
      <div style={{marginBottom:10}}>
        <label style={{fontSize:11,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',display:'block',marginBottom:4}}>
          Client Email
        </label>
        <input
          type="email"
          placeholder="client@company.com"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
        />
      </div>
      <div style={{marginBottom:12}}>
        <label style={{fontSize:11,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',display:'block',marginBottom:4}}>
          Set Password
        </label>
        <input
          type="password"
          placeholder="Min 6 characters"
          value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
        />
      </div>
      <button className="btn btn-primary" style={{width:'100%'}} onClick={handleCreate} disabled={saving}>
        {saving ? 'Creating...' : '🔑 Create Client Login'}
      </button>
    </div>
  );
}

export default ClientLoginForm;