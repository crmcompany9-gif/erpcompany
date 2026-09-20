import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import NoticeBoard from '../components/NoticeBoard';

// SLA status helper
const slaBadge = (status) => {
  if (status === 'Breached') return <span style={{color:'var(--red)',fontWeight:600,fontSize:12}}>⚠ Breached</span>;
  if (status === 'At Risk') return <span style={{color:'var(--orange)',fontWeight:600,fontSize:12}}>⏳ At Risk</span>;
  return <span style={{color:'var(--green)',fontWeight:600,fontSize:12}}>✓ On Track</span>;
};

const stageBadgeClass = (stage) => {
  const map = {
    'Onboarding':'badge-blue','Content Collection':'badge-gold',
    'Pitch Deck':'badge-gold','Submitted':'badge-green',
    'Grooming':'badge-gray','Done':'badge-green','Rejected':'badge-red'
  };
  return map[stage] || 'badge-gray';
};

// Which stages each role is responsible for
const ROLE_STAGES = {
  hod: null,
  manager: null,
  kam: ['File Submission', 'Resubmission'],
  accounts: ['Accounts & MOU'],
  certification: ['Certification'],
  content: ['Content & PPT', 'Interview', 'PPT Revision'],
  retention: ['Rejected - Revision', 'Final Closure', 'Completed'],
  poc: null,
  grooming: ['Re-Grooming', 'Interview'],
  it: null,
  legal: null,
};

// Role-specific welcome message
const ROLE_FOCUS = {
  kam: '👋 Your focus: File Submission & Resubmission',
  accounts: '👋 Your focus: MOU, Invoice, Payment & Signatures',
  certification: '👋 Your focus: Startup India, MSME, FSSAI & Government Certifications',
  content: '👋 Your focus: Content, PPT, Grooming Material & Client Approval',
  retention: '👋 Your focus: Rejection handling, Revision & Final Closure',
  poc: '👋 Your focus: Re-Grooming, Interview Prep & Client Communication',
  grooming: '👋 Your focus: Interview Preparation & Grooming Sessions',
  it: '👋 Your focus: Technical support & System maintenance',
  legal: '👋 Your focus: Contracts, compliance & Legal review',
};

function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [risks, setRisks] = useState([]);
const [risksLoading, setRisksLoading] = useState(false);
const [presence, setPresence] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'kam';
  const isHOD = role === 'hod' || role === 'manager' || role === 'poc';

  useEffect(() => {
    const fetchAll = () => {
      API.get('/clients')
        .then(({ data }) => setClients(data))
        .catch(console.error)
        .finally(() => setLoading(false));

      API.get('/clients/risks/latest')
        .then(({ data }) => setRisks(data.risks || []))
        .catch(() => {});

      if (isHOD) {
        API.get('/employees/presence')
          .then(({ data }) => setPresence(data))
          .catch(() => {});
      }
    };

    fetchAll(); // Run on load

    // Auto refresh every 60 seconds
   const interval = setInterval(fetchAll, 2 * 60 * 1000); // 2 mins

    // Refresh when tab gets focus
    const onFocus = () => fetchAll();
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  // Filter clients based on role
  const myStages = ROLE_STAGES[role];
  const myClients = myStages
    ? clients.filter(c => myStages.includes(c.stage))
    : clients;

  // Stats
  const total = myClients.length;
  const active = myClients.filter(c => !['Done','Rejected'].includes(c.stage)).length;
  const done = myClients.filter(c => c.stage === 'Done').length;
  const breached = myClients.filter(c => c.slaStatus === 'Breached').length;

  // Stage counts (for pipeline — HOD sees all, others see their stages)
  const stageCount = (stage) => clients.filter(c => c.stage === stage).length;

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      {/* Notice Board */}
      <NoticeBoard userRole={role} userName={user.name} />

      {/* Role Focus Banner */}
      {ROLE_FOCUS[role] && (
        <div style={{background:'var(--blue-light)',border:'1px solid #93C5FD',borderRadius:8,padding:'10px 16px',marginBottom:16,fontSize:13,color:'var(--blue)',fontWeight:500}}>
          {ROLE_FOCUS[role]}
        </div>
      )}

      {/* SLA Breach Alert */}
      {breached > 0 && (
        <div className="alert alert-danger">
          <span>🚨</span>
          <div>
            <strong>{breached} SLA breach{breached > 1 ? 'es' : ''} in your queue</strong>
            {isHOD ? ' — check SLA Tracker immediately' : ' — please update these clients now'}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">{isHOD ? '👥' : '📋'}</div>
          <div className="stat-label">{isHOD ? 'Total Clients' : 'My Clients'}</div>
          <div className="stat-value">{total}</div>
          <div className="stat-change" style={{color:'var(--muted)'}}>
            {isHOD ? 'All time' : `In ${myStages?.join(', ') || 'all'} stage`}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-label">Active</div>
          <div className="stat-value">{active}</div>
          <div className="stat-change warn">Needs attention</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">{isHOD ? 'Completed' : 'Processed'}</div>
          <div className="stat-value">{done}</div>
          <div className="stat-change up">Done</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-label">SLA Breaches</div>
          <div className="stat-value">{breached}</div>
          <div className={breached > 0 ? 'stat-change down' : 'stat-change up'}>
            {breached > 0 ? 'Act now!' : 'All good ✓'}
          </div>
        </div>
      </div>

      {/* Employee Presence */}
{isHOD && presence.length > 0 && (
  <div className="card" style={{marginBottom:16}}>
    <div className="card-title">
      👥 Team Presence — Live
      <span style={{fontSize:11,color:'var(--muted)',fontWeight:400}}>
        Auto-refreshes every 2 mins
      </span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
      {presence.map((emp, i) => (
        <div key={i} style={{
          display:'flex',alignItems:'center',gap:10,
          padding:'10px 12px',
          background:'var(--surface)',
          borderRadius:8,
          border:'1px solid var(--border)',
        }}>
          {/* Status dot */}
          <div style={{
            width:10,height:10,borderRadius:'50%',
            background:emp.color,flexShrink:0,
            boxShadow: emp.status==='online' ? `0 0 0 3px ${emp.color}33` : 'none',
          }}/>
          {/* Avatar */}
          <div style={{
            width:32,height:32,borderRadius:'50%',
            background: emp.status==='online' ? 'var(--blue)' : 'var(--lighter)',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'#fff',fontWeight:700,fontSize:11,flexShrink:0,
          }}>
            {emp.name?.charAt(0).toUpperCase()}
          </div>
          {/* Info */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {emp.name}
            </div>
            <div style={{fontSize:11,color:emp.color,fontWeight:500}}>
              {emp.statusLabel}
            </div>
            {emp.loginAt && (
              <div style={{fontSize:10,color:'var(--light)'}}>
                Login: {new Date(emp.loginAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}
              </div>
            )}
          </div>
          {/* Department badge */}
          <div style={{
            fontSize:10,fontWeight:600,
            color:'var(--muted)',
            background:'var(--white)',
            padding:'2px 6px',borderRadius:4,
            border:'1px solid var(--border)',
            whiteSpace:'nowrap',
          }}>
            {emp.department}
          </div>
        </div>
      ))}
    </div>
    {/* Summary */}
    <div style={{
      display:'flex',gap:16,marginTop:12,
      paddingTop:12,borderTop:'1px solid var(--border)',
    }}>
      {[
        {label:'🟢 Online', count:presence.filter(p=>p.status==='online').length, color:'var(--green)'},
        {label:'🟡 Away', count:presence.filter(p=>p.status==='away').length, color:'var(--gold)'},
        {label:'🔴 Offline', count:presence.filter(p=>p.status==='offline').length, color:'var(--red)'},
        {label:'⚫ Not logged in', count:presence.filter(p=>p.status==='never').length, color:'var(--light)'},
      ].map(s => (
        <div key={s.label} style={{fontSize:12,color:s.color,fontWeight:600}}>
          {s.label}: {s.count}
        </div>
      ))}
    </div>
  </div>
)}

      {/* AI Risk Alerts */}
{risks.length > 0 && (
  <div className="card" style={{borderLeft:'4px solid var(--red)',marginBottom:16}}>
    <div className="card-title" style={{color:'var(--red)'}}>
      🚨 AI Risk Alerts ({risks.length} clients need attention)
      <button
        className="btn btn-sm btn-outline"
        style={{fontSize:11}}
        onClick={() => {
          setRisksLoading(true);
          API.get('/clients/risks/run')
            .then(({ data }) => setRisks(data.risks || []))
            .finally(() => setRisksLoading(false));
        }}
      >
        {risksLoading ? '⏳' : '🔄 Refresh'}
      </button>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      {risks.map((risk, i) => (
        <div key={i} style={{
          padding:'12px 14px',
          background: risk.risk === 'HIGH' ? 'var(--red-light)' : 'var(--gold-light)',
          border: `1px solid ${risk.risk === 'HIGH' ? '#FECACA' : '#FDE68A'}`,
          borderRadius:8,
        }}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
            <span style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>
              {risk.company}
            </span>
            <span style={{
              fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,
              background: risk.risk === 'HIGH' ? '#FEE2E2' : '#FEF3C7',
              color: risk.risk === 'HIGH' ? '#DC2626' : '#D97706',
            }}>
              {risk.risk === 'HIGH' ? '🔴 HIGH RISK' : '🟡 MEDIUM RISK'}
            </span>
          </div>
          <div style={{fontSize:12,color:'var(--muted)',marginBottom:4}}>
            ⚠️ {risk.reason}
          </div>
          <div style={{fontSize:12,color:'var(--blue)',fontWeight:600}}>
            → {risk.action}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      {/* Pipeline — HOD sees full pipeline, others see their stage highlighted */}
      <div className="card">
        <div className="card-title">
          {isHOD ? 'Full Client Pipeline' : 'Pipeline Overview'}
          {!isHOD && <span style={{fontSize:12,fontWeight:400,color:'var(--muted)'}}>Your stage is highlighted</span>}
        </div>
        <div style={{display:'flex',gap:0,marginBottom:20,overflowX:'auto'}}>
        {['Accounts & MOU','Certification','Content & PPT','File Submission','Interview','Rejected - Revision','Re-Grooming','PPT Revision','Resubmission','Retention','Final Closure','Completed'].map((stage, i) => {
            const isMyStage = myStages ? myStages.includes(stage) : true;
            const isDone = stage === 'Done';
            return (
              <div key={stage} style={{
                flex:1, minWidth:120,
                background: isMyStage && !isDone ? 'var(--blue-light)' : isDone ? 'var(--green-light)' : 'var(--white)',
                border: isMyStage && !isDone ? '2px solid var(--blue-mid)' : '1px solid var(--border)',
                padding:'14px 16px',
                borderRadius: i===0 ? '8px 0 0 8px' : i===5 ? '0 8px 8px 0' : 0,
                position:'relative',
              }}>
                <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',color: isMyStage && !isDone ? 'var(--blue)' : 'var(--muted)'}}>{stage}</div>
                <div style={{fontFamily:'Space Grotesk,sans-serif',fontSize:24,fontWeight:700,margin:'4px 0',color: isMyStage && !isDone ? 'var(--blue)' : 'var(--text)'}}>{stageCount(stage)}</div>
                {isMyStage && !isDone && !isHOD && (
                  <div style={{fontSize:10,color:'var(--blue)',fontWeight:600}}>← YOUR STAGE</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Client Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Scheme</th>
                <th>Stage</th>
                <th>SLA Status</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myClients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{textAlign:'center',padding:40,color:'var(--muted)'}}>
                    {isHOD ? 'No clients yet — add your first client!' : `No clients in your stage yet`}
                  </td>
                </tr>
              ) : (
                myClients.map(client => (
                  <tr key={client._id} style={{cursor:'pointer'}} onClick={() => navigate(`/clients/${client._id}`)}>
                    <td>
                      <strong>{client.companyName}</strong><br/>
                      <span style={{color:'var(--muted)',fontSize:11}}>{client.contactPerson} · {client.phone}</span>
                    </td>
                    <td style={{fontSize:12}}>{client.scheme}</td>
                    <td><span className={`badge ${stageBadgeClass(client.stage)}`}>{client.stage}</span></td>
                    <td>{slaBadge(client.slaStatus)}</td>
                    <td style={{fontSize:11,color:'var(--muted)'}}>
                      {client.updates?.length > 0
                        ? new Date(client.updates[client.updates.length-1].createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})
                        : new Date(client.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})
                      }
                    </td>
                    <td><button className="btn btn-outline btn-sm">View →</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HOD Only — Department SLA Health */}
      {isHOD && (
        <div className="card">
          <div className="card-title">Department SLA Health</div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[
              {name:'Accounts (Riya)', stage:'Onboarding', color:'var(--green)'},
              {name:'KAM (Vinit)', stage:'Content Collection', color:'var(--green)'},
              {name:'Content Team', stage:'Pitch Deck', color:'var(--orange)'},
              {name:'Certification (Lovely)', stage:'Submitted', color:'var(--gold)'},
              {name:'Grooming Team', stage:'Grooming', color:'var(--green)'},
              {name:'Retention (Ankit & Yash)', stage:'Done', color:'var(--green)'},
            ].map(dept => {
              const deptClients = clients.filter(c => c.stage === dept.stage);
              const deptBreached = deptClients.filter(c => c.slaStatus === 'Breached').length;
              const pct = deptClients.length === 0 ? 100 : Math.round(((deptClients.length - deptBreached) / deptClients.length) * 100);
              return (
                <div key={dept.name}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                    <span>{dept.name}</span>
                    <span style={{fontWeight:600,color: pct < 70 ? 'var(--red)' : pct < 90 ? 'var(--orange)' : 'var(--green)'}}>{pct}%</span>
                  </div>
                  <div className="sla-bar">
                    <div className={`sla-fill ${pct < 70 ? 'sla-breach' : pct < 90 ? 'sla-warn' : 'sla-ok'}`} style={{width:`${pct}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;