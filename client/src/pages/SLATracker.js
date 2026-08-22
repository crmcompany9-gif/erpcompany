import React, { useEffect, useState } from 'react';
import API from '../api/axios';

function SLATracker() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/clients')
      .then(({ data }) => setClients(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const breached = clients.filter(c => c.slaStatus === 'Breached');
  const atRisk = clients.filter(c => c.slaStatus === 'At Risk');
  const onTrack = clients.filter(c => c.slaStatus === 'On Track');

  if (loading) return <div className="loading">Loading SLA data...</div>;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-label">Breached</div>
          <div className="stat-value" style={{color:'var(--red)'}}>{breached.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-label">At Risk</div>
          <div className="stat-value" style={{color:'var(--orange)'}}>{atRisk.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">On Track</div>
          <div className="stat-value" style={{color:'var(--green)'}}>{onTrack.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-label">Total Active</div>
          <div className="stat-value">{clients.length}</div>
        </div>
      </div>

      {breached.length > 0 && (
        <div className="card">
          <div className="card-title" style={{color:'var(--red)'}}>🚨 SLA Breaches</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Client</th><th>Scheme</th><th>Stage</th><th>Status</th></tr></thead>
              <tbody>
                {breached.map(c => (
                  <tr key={c._id}>
                    <td><strong>{c.companyName}</strong><br/><span style={{fontSize:11,color:'var(--muted)'}}>{c.contactPerson}</span></td>
                    <td>{c.scheme}</td>
                    <td>{c.stage}</td>
                    <td><span className="badge badge-red">Breached</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {atRisk.length > 0 && (
        <div className="card">
          <div className="card-title" style={{color:'var(--orange)'}}>⏳ At Risk</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Client</th><th>Scheme</th><th>Stage</th><th>Status</th></tr></thead>
              <tbody>
                {atRisk.map(c => (
                  <tr key={c._id}>
                    <td><strong>{c.companyName}</strong></td>
                    <td>{c.scheme}</td>
                    <td>{c.stage}</td>
                    <td><span className="badge badge-orange">At Risk</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {breached.length === 0 && atRisk.length === 0 && (
        <div className="card">
          <div style={{textAlign:'center',padding:40}}>
            <div style={{fontSize:36,marginBottom:8}}>✅</div>
            <div style={{fontWeight:600,marginBottom:4}}>All SLAs on track!</div>
            <div style={{color:'var(--muted)',fontSize:13}}>No breaches or risks detected right now.</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SLATracker;