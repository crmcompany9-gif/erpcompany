import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/clients')
      .then(({ data }) => setClients(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stageBadge = (stage) => {
    const map = { 'Onboarding':'badge-blue','Content Collection':'badge-gold','Pitch Deck':'badge-gold','Submitted':'badge-green','Grooming':'badge-gray','Done':'badge-green','Rejected':'badge-red' };
    return map[stage] || 'badge-gray';
  };

  const filtered = clients.filter(c => {
    const matchSearch = c.companyName.toLowerCase().includes(search.toLowerCase()) || c.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.stage === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="loading">Loading clients...</div>;

  return (
    <div>
      <div className="search-bar">
        <span>🔍</span>
        <input placeholder="Search by company or contact name..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <div className="card-title">
          All Clients ({filtered.length})
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{width:'auto',fontSize:12,padding:'5px 8px'}}>
            <option>All</option>
            <option>Onboarding</option>
            <option>Content Collection</option>
            <option>Pitch Deck</option>
            <option>Submitted</option>
            <option>Grooming</option>
            <option>Done</option>
            <option>Rejected</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Client</th><th>Phone</th><th>Scheme</th><th>Stage</th><th>SLA</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'var(--muted)'}}>No clients found</td></tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c._id} style={{cursor:'pointer'}} onClick={() => navigate(`/clients/${c._id}`)}>
                    <td style={{color:'var(--muted)'}}>{String(i+1).padStart(3,'0')}</td>
                    <td><strong>{c.companyName}</strong><br/><span style={{fontSize:11,color:'var(--muted)'}}>{c.contactPerson}</span></td>
                    <td>{c.phone}</td>
                    <td>{c.scheme}</td>
                    <td><span className={`badge ${stageBadge(c.stage)}`}>{c.stage}</span></td>
                    <td>
                      {c.slaStatus === 'Breached' && <span style={{color:'var(--red)',fontWeight:600,fontSize:12}}>⚠ Breached</span>}
                      {c.slaStatus === 'At Risk' && <span style={{color:'var(--orange)',fontWeight:600,fontSize:12}}>⏳ At Risk</span>}
                      {c.slaStatus === 'On Track' && <span style={{color:'var(--green)',fontWeight:600,fontSize:12}}>✓ On Track</span>}
                    </td>
                    <td><button className="btn btn-outline btn-sm">View</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Clients;