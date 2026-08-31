import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

const SUCCESS_STAGES = [
  { key: 'Accounts & MOU',  label: 'Accounts & MOU',       owner: 'Riya' },
  { key: 'Certification',   label: 'Certification',         owner: 'Lovely' },
  { key: 'Content & PPT',   label: 'Content & PPT',         owner: 'Tanmay Pandey' },
  { key: 'File Submission', label: 'File Submission',       owner: 'Vinit' },
  { key: 'Interview',       label: 'Interview Received 🎉', owner: 'Laxmi' },
  { key: 'Completed',       label: '✅ All Journey Closed', owner: '' },
];

const REJECTION_STAGES = [
  { key: 'Accounts & MOU',      label: 'Accounts & MOU',         owner: 'Riya' },
  { key: 'Certification',       label: 'Certification',           owner: 'Lovely' },
  { key: 'Content & PPT',       label: 'Content & PPT',          owner: 'Tanmay Pandey' },
  { key: 'File Submission',     label: 'File Submission',         owner: 'Vinit' },
  { key: 'Rejected - Revision', label: 'Interview Rejected ❌',   owner: 'Rohit' },
  { key: 'PPT Revision',        label: 'Re PPT & Content',        owner: 'Tanmay Pandey' },
  { key: 'Resubmission',        label: 'Re Submission',           owner: 'Laxmi' },
  { key: 'Re-Grooming',         label: 'Re Grooming',             owner: 'Ankit' },
  { key: 'Retention',           label: '✅ Interview Received',   owner: '' },
  { key: 'Final Closure',       label: '📁 Final Closure',        owner: 'Yash' },
];

const REJECTION_SET = new Set([
  'Rejected - Revision','PPT Revision','Resubmission',
  'Re-Grooming','Retention','Final Closure',
]);

const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day:'2-digit', month:'short', year:'numeric',
    hour:'2-digit', minute:'2-digit', hour12:true,
  });
};

const TEAM = [
  { icon:'📞', name:'Laxmi',        role:'Client Relations',    phone:'9119222089' },
  { icon:'🔁', name:'Ankit',        role:'Retention & Revision',phone:'9216086715' },
  { icon:'🏁', name:'Yash',         role:'Final Closure',       phone:'9001983480' },
];

function ClientPortal() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journey');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    API.get('/auth/client-portal')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load your data'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navy = '#0F172A';

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:navy,gap:14}}>
      <div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #2563EB',borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}/>
      <div style={{color:'rgba(255,255,255,0.5)',fontSize:14}}>Loading your portal...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:navy}}>
      <div style={{textAlign:'center',color:'#fff'}}>
        <div style={{fontSize:48,marginBottom:12}}>😕</div>
        <div style={{fontSize:16,fontWeight:600}}>No data found</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginTop:6}}>Contact your consultant</div>
      </div>
    </div>
  );

  const isRejectionPath = REJECTION_SET.has(data.stage);
  const STAGES = isRejectionPath ? REJECTION_STAGES : SUCCESS_STAGES;
  const currentStageIndex = STAGES.findIndex(s => s.key === data.stage);
  const stagePercent = data.stage === 'Completed' || data.stage === 'Retention'
    ? 100 : Math.round(((currentStageIndex + 1) / STAGES.length) * 100);

  const progressColor = data.stage === 'Completed' || data.stage === 'Retention'
    ? '#10B981' : data.stage === 'Final Closure'
    ? '#EF4444' : isRejectionPath ? '#F59E0B' : '#3B82F6';

  const tabs = [
    { id:'journey',        label:'🗺 My Journey' },
    { id:'updates',        label:`📝 Updates (${data.updates?.length||0})` },
    { id:'documents',      label:`📄 Documents (${data.documents?.length||0})` },
    { id:'communications', label:`💬 Messages (${data.communications?.length||0})` },
    { id:'team',           label:'👥 Our Team' },
  ];

  return (
    <div style={{minHeight:'100vh',background:'#F1F5F9',fontFamily:'Inter,sans-serif'}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .portal-tab:hover{background:rgba(37,99,235,0.06)!important}
        .team-card:hover{border-color:#2563EB!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(37,99,235,0.1)!important}
        .update-item:hover{background:#FAFBFF!important}
        @media(max-width:640px){
          .portal-header{padding:14px 16px!important}
          .portal-content{padding:16px!important}
          .welcome-card{padding:18px!important}
          .tabs-row{gap:0!important}
          .tab-item{padding:10px 12px!important;font-size:12px!important}
          .team-grid{grid-template-columns:1fr!important}
          .welcome-title{font-size:18px!important}
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="portal-header" style={{
        background:navy,
        padding:'14px 28px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        boxShadow:'0 2px 20px rgba(0,0,0,0.3)',
        position:'sticky',top:0,zIndex:50,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{
            width:36,height:36,borderRadius:9,
            background:'linear-gradient(135deg,#2563EB,#1D4ED8)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:18,boxShadow:'0 4px 10px rgba(37,99,235,0.4)',flexShrink:0,
          }}>🤝</div>
          <div>
            <div style={{fontFamily:'Space Grotesk,sans-serif',fontSize:15,fontWeight:700,color:'#fff',letterSpacing:'-0.01em'}}>
              Elbow Grease
            </div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.1em'}}>
              Client Portal
            </div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
            <div style={{fontSize:13,color:'#fff',fontWeight:600}}>{user.name}</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Client Account</div>
          </div>
          <button onClick={handleLogout} style={{
            padding:'6px 14px',
            background:'rgba(255,255,255,0.08)',
            border:'1px solid rgba(255,255,255,0.12)',
            borderRadius:8,color:'rgba(255,255,255,0.7)',
            cursor:'pointer',fontSize:12,fontFamily:'inherit',
            transition:'all 0.15s',fontWeight:500,
          }}>
            Logout
          </button>
        </div>
      </div>

      <div className="portal-content" style={{maxWidth:860,margin:'0 auto',padding:'24px 20px',animation:'fadeUp 0.3s ease'}}>

        {/* ── WELCOME CARD ── */}
        <div className="welcome-card" style={{
          background:`linear-gradient(135deg, ${navy} 0%, #1E293B 100%)`,
          borderRadius:16,padding:24,marginBottom:20,color:'#fff',
          boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
          border:'1px solid rgba(255,255,255,0.06)',
          position:'relative',overflow:'hidden',
        }}>
          {/* Background glow */}
          <div style={{position:'absolute',top:-60,right:-60,width:200,height:200,background:'radial-gradient(circle,rgba(37,99,235,0.15) 0%,transparent 70%)',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',marginBottom:4,fontWeight:500,textTransform:'uppercase',letterSpacing:'0.08em'}}>Welcome back,</div>
            <div className="welcome-title" style={{fontFamily:'Space Grotesk,sans-serif',fontSize:22,fontWeight:800,marginBottom:4,letterSpacing:'-0.02em'}}>
              {data.companyName}
            </div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',marginBottom:20}}>
              {data.scheme} · Added on {formatDateTime(data.createdAt)}
            </div>

            {/* Progress */}
            <div style={{marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,color:'rgba(255,255,255,0.5)',fontWeight:500}}>Overall Progress</span>
              <span style={{fontSize:15,fontWeight:800,color:progressColor,fontFamily:'Space Grotesk,sans-serif'}}>{stagePercent}%</span>
            </div>
            <div style={{height:8,background:'rgba(255,255,255,0.08)',borderRadius:99,overflow:'hidden'}}>
              <div style={{
                height:'100%',width:`${stagePercent}%`,
                background:`linear-gradient(90deg, ${progressColor}, ${progressColor}cc)`,
                borderRadius:99,transition:'width 0.6s ease',
              }}/>
            </div>

            {/* Stage badges */}
            <div style={{marginTop:16,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
              <div style={{
                padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:700,
                background: data.stage==='Completed'||data.stage==='Retention' ? 'rgba(16,185,129,0.2)'
                  : data.stage==='Final Closure' ? 'rgba(239,68,68,0.2)'
                  : isRejectionPath ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)',
                color: data.stage==='Completed'||data.stage==='Retention' ? '#34D399'
                  : data.stage==='Final Closure' ? '#F87171'
                  : isRejectionPath ? '#FCD34D' : '#60A5FA',
                border: `1px solid ${data.stage==='Completed'||data.stage==='Retention' ? 'rgba(52,211,153,0.3)'
                  : data.stage==='Final Closure' ? 'rgba(248,113,113,0.3)'
                  : isRejectionPath ? 'rgba(252,211,77,0.3)' : 'rgba(96,165,250,0.3)'}`,
              }}>
                {data.stage==='Completed'||data.stage==='Retention' ? '🎉 Journey Completed!'
                  : data.stage==='Final Closure' ? '📁 File Closed'
                  : `⚡ ${data.stage}`}
              </div>
              <div style={{
                fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:20,
                background:isRejectionPath ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                color:isRejectionPath ? '#FCD34D' : '#93C5FD',
                border:`1px solid ${isRejectionPath ? 'rgba(252,211,77,0.2)' : 'rgba(147,197,253,0.2)'}`,
              }}>
                {isRejectionPath ? '⚠️ Revision Path' : '✅ Success Path'}
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{background:'#fff',borderRadius:12,marginBottom:16,border:'1px solid #E2E8F0',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',overflow:'hidden'}}>
          <div className="tabs-row" style={{display:'flex',overflowX:'auto',borderBottom:'1px solid #E2E8F0'}}>
            {tabs.map(tab => (
              <div key={tab.id} className="tab-item portal-tab" onClick={() => setActiveTab(tab.id)} style={{
                padding:'12px 18px',fontSize:13,fontWeight:activeTab===tab.id?700:500,
                cursor:'pointer',whiteSpace:'nowrap',
                color:activeTab===tab.id?'#2563EB':'#64748B',
                borderBottom:activeTab===tab.id?'2px solid #2563EB':'2px solid transparent',
                background:'transparent',transition:'all 0.15s',
              }}>
                {tab.label}
              </div>
            ))}
          </div>

          <div style={{padding:20}}>

            {/* ── JOURNEY TAB ── */}
            {activeTab==='journey' && (
              <div>
                <div style={{marginBottom:16,padding:'10px 14px',
                  background:isRejectionPath?'#FEF2F2':'#EFF6FF',
                  borderRadius:8,fontSize:12,fontWeight:600,
                  color:isRejectionPath?'#DC2626':'#2563EB',
                  border:`1px solid ${isRejectionPath?'#FECACA':'#BFDBFE'}`,
                }}>
                  {isRejectionPath
                    ? '⚠️ Our team is working to revise and resubmit your file'
                    : '✅ Your file is on track for the interview'}
                </div>

                {STAGES.map((stage, i) => {
                  const isDone = i < currentStageIndex;
                  const isActive = i === currentStageIndex;
                  const stageUpdate = data.updates?.find(u =>
                    u.stageChanged && u.stageChanged.startsWith(`${stage.key} →`)
                  );
                  return (
                    <div key={stage.key} style={{
                      display:'flex',gap:14,padding:'14px 0',
                      borderBottom:i<STAGES.length-1?'1px solid #F1F5F9':'none',
                    }}>
                      <div style={{
                        width:32,height:32,borderRadius:'50%',flexShrink:0,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:12,fontWeight:700,
                        background:isDone?'linear-gradient(135deg,#10B981,#059669)':isActive?'linear-gradient(135deg,#2563EB,#1D4ED8)':'#F1F5F9',
                        color:isDone||isActive?'#fff':'#94A3B8',
                        boxShadow:isDone?'0 2px 8px rgba(16,185,129,0.3)':isActive?'0 2px 8px rgba(37,99,235,0.3)':'none',
                      }}>
                        {isDone?'✓':i+1}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                          <span style={{fontSize:13,fontWeight:600,color:isDone?'#059669':isActive?'#2563EB':'#94A3B8'}}>
                            {stage.label}
                          </span>
                          {stage.owner && (
                            <span style={{fontSize:11,color:'#64748B',background:'#F8FAFC',padding:'1px 8px',borderRadius:20,border:'1px solid #E2E8F0'}}>
                              {stage.owner}
                            </span>
                          )}
                        </div>
                        <div style={{fontSize:11,marginTop:4}}>
                          {isDone && (
                            <div style={{display:'flex',flexDirection:'column',gap:2}}>
                              <span style={{color:'#10B981',fontWeight:600}}>✓ Completed</span>
                              {stageUpdate && <span style={{color:'#94A3B8'}}>🕐 {formatDateTime(stageUpdate.createdAt)}{stageUpdate.updatedByName&&` · by ${stageUpdate.updatedByName}`}</span>}
                            </div>
                          )}
                          {isActive && <span style={{color:'#2563EB',fontWeight:600}}>⚡ In Progress</span>}
                          {!isDone&&!isActive && <span style={{color:'#CBD5E1'}}>⏳ Upcoming</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(data.stage==='Completed'||data.stage==='Retention') && (
                  <div style={{marginTop:16,padding:20,background:'linear-gradient(135deg,#ECFDF5,#D1FAE5)',borderRadius:12,textAlign:'center',border:'1px solid #A7F3D0'}}>
                    <div style={{fontSize:32,marginBottom:8}}>🎉</div>
                    <div style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:800,color:'#065F46',fontSize:16}}>Congratulations!</div>
                    <div style={{fontSize:13,color:'#047857',marginTop:4}}>Your file journey is complete. Interview received!</div>
                  </div>
                )}
                {data.stage==='Final Closure' && (
                  <div style={{marginTop:16,padding:20,background:'#FEF2F2',borderRadius:12,textAlign:'center',border:'1px solid #FECACA'}}>
                    <div style={{fontSize:32,marginBottom:8}}>📁</div>
                    <div style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:800,color:'#991B1B',fontSize:16}}>File Closed</div>
                    <div style={{fontSize:13,color:'#B91C1C',marginTop:4}}>Our team will contact you with the final details.</div>
                  </div>
                )}
              </div>
            )}

            {/* ── UPDATES TAB ── */}
            {activeTab==='updates' && (
              <div>
                {!data.updates?.length ? (
                  <div style={{textAlign:'center',padding:40,color:'#94A3B8'}}>
                    <div style={{fontSize:36,marginBottom:10}}>📝</div>
                    <div style={{fontSize:14,fontWeight:600,color:'#64748B'}}>No updates yet</div>
                    <div style={{fontSize:12,marginTop:4}}>Our team will update you soon!</div>
                  </div>
                ) : (
                  [...data.updates].reverse().map((u,i) => (
                    <div key={i} className="update-item" style={{padding:'14px 0',borderBottom:'1px solid #F1F5F9',transition:'background 0.1s'}}>
                      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,flexWrap:'wrap'}}>
                        <span style={{fontSize:11,background:'#EFF6FF',color:'#2563EB',padding:'3px 10px',borderRadius:20,fontWeight:700,border:'1px solid #BFDBFE'}}>
                          {u.department}
                        </span>
                        {u.stageChanged && (
                          <span style={{fontSize:11,background:'#ECFDF5',color:'#065F46',padding:'3px 10px',borderRadius:20,fontWeight:700,border:'1px solid #A7F3D0'}}>
                            🔄 {u.stageChanged}
                          </span>
                        )}
                        <span style={{fontSize:11,color:'#94A3B8',marginLeft:'auto'}}>
                          🕐 {formatDateTime(u.createdAt)}
                        </span>
                      </div>
                      {u.updatedByName && (
                        <div style={{fontSize:11,color:'#64748B',marginBottom:6}}>
                          By <strong style={{color:'#475569'}}>{u.updatedByName}</strong>
                        </div>
                      )}
                      <div style={{fontSize:13,color:'#1E293B',background:'#F8FAFC',padding:'10px 12px',borderRadius:8,border:'1px solid #F1F5F9',lineHeight:1.6}}>
                        {u.note}
                      </div>
                      {u.fileUrl && (
                        <div style={{marginTop:8,display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'#EFF6FF',borderRadius:8,border:'1px solid #BFDBFE'}}>
                          <span>{u.fileName?.match(/\.(jpg|jpeg|png)$/i)?'🖼️':'📄'}</span>
                          <span style={{flex:1,fontSize:12,color:'#2563EB',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.fileName}</span>
                          <a href={u.fileUrl} target="_blank" rel="noreferrer" style={{fontSize:12,color:'#2563EB',fontWeight:700,textDecoration:'none'}}>👁 View</a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── DOCUMENTS TAB ── */}
            {activeTab==='documents' && (
              <div>
                {!data.documents?.length ? (
                  <div style={{textAlign:'center',padding:40,color:'#94A3B8'}}>
                    <div style={{fontSize:36,marginBottom:10}}>📄</div>
                    <div style={{fontSize:14,fontWeight:600,color:'#64748B'}}>No documents yet</div>
                    <div style={{fontSize:12,marginTop:4}}>Documents will appear here when uploaded</div>
                  </div>
                ) : (
                  data.documents.map((doc,i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px',background:'#F8FAFC',borderRadius:10,marginBottom:8,border:'1px solid #F1F5F9'}}>
                      <span style={{fontSize:24}}>{doc.type==='Image'?'🖼️':'📄'}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:'#1E293B',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.name}</div>
                        <div style={{fontSize:11,color:'#94A3B8',marginTop:2}}>{doc.type} · {formatDateTime(doc.uploadedAt)}{doc.uploadedByName&&` by ${doc.uploadedByName}`}</div>
                      </div>
                      <span style={{
                        fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,
                        background:doc.status==='Signed'?'#ECFDF5':doc.status==='Sent'?'#EFF6FF':'#FFFBEB',
                        color:doc.status==='Signed'?'#065F46':doc.status==='Sent'?'#2563EB':'#92400E',
                        border:`1px solid ${doc.status==='Signed'?'#A7F3D0':doc.status==='Sent'?'#BFDBFE':'#FDE68A'}`,
                      }}>{doc.status}</span>
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noreferrer" style={{fontSize:12,color:'#2563EB',fontWeight:700,textDecoration:'none',padding:'5px 12px',background:'#EFF6FF',borderRadius:6,border:'1px solid #BFDBFE',whiteSpace:'nowrap'}}>
                          👁 View
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── MESSAGES TAB ── */}
            {activeTab==='communications' && (
              <div>
                {!data.communications?.length ? (
                  <div style={{textAlign:'center',padding:40,color:'#94A3B8'}}>
                    <div style={{fontSize:36,marginBottom:10}}>💬</div>
                    <div style={{fontSize:14,fontWeight:600,color:'#64748B'}}>No messages yet</div>
                  </div>
                ) : (
                  [...data.communications].reverse().map((c,i) => {
                    const typeColor = c.type==='WhatsApp'?{bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'}
                      :c.type==='Call'?{bg:'#EFF6FF',color:'#2563EB',border:'#BFDBFE'}
                      :c.type==='Email'?{bg:'#FFFBEB',color:'#92400E',border:'#FDE68A'}
                      :{bg:'#F8FAFC',color:'#64748B',border:'#E2E8F0'};
                    const typeIcon = c.type==='WhatsApp'?'📱':c.type==='Call'?'📞':c.type==='Email'?'📧':'🤝';
                    return (
                      <div key={i} style={{padding:'14px',background:'#F8FAFC',borderRadius:10,marginBottom:8,border:'1px solid #F1F5F9'}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap'}}>
                          <span style={{fontSize:11,fontWeight:700,background:typeColor.bg,color:typeColor.color,padding:'3px 10px',borderRadius:20,border:`1px solid ${typeColor.border}`}}>
                            {typeIcon} {c.type}
                          </span>
                          {c.loggedByName && <span style={{fontSize:11,color:'#64748B'}}>by <strong>{c.loggedByName}</strong></span>}
                          <span style={{fontSize:11,color:'#94A3B8',marginLeft:'auto'}}>🕐 {formatDateTime(c.createdAt)}</span>
                        </div>
                        <div style={{fontSize:13,color:'#1E293B',lineHeight:1.6}}>{c.note}</div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── TEAM TAB ── */}
            {activeTab==='team' && (
              <div>
                <div className="team-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
                  {TEAM.map((member,i) => (
                    <div key={i} className="team-card" style={{
                      padding:16,background:'#F8FAFC',borderRadius:12,
                      border:'1px solid #E2E8F0',transition:'all 0.15s',cursor:'default',
                    }}>
                      <div style={{fontSize:24,marginBottom:8}}>{member.icon}</div>
                      <div style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:14,color:'#0F172A'}}>{member.name}</div>
                      <div style={{fontSize:12,color:'#64748B',marginTop:2,marginBottom:10}}>{member.role}</div>
                      <a href={`tel:${member.phone}`} style={{
                        display:'inline-flex',alignItems:'center',gap:5,
                        fontSize:12,fontWeight:700,color:'#2563EB',
                        textDecoration:'none',background:'#EFF6FF',
                        padding:'5px 12px',borderRadius:20,
                        border:'1px solid #BFDBFE',
                      }}>
                        📞 {member.phone}
                      </a>
                    </div>
                  ))}
                </div>
                <div style={{padding:'12px 14px',background:'#EFF6FF',borderRadius:8,fontSize:12,color:'#2563EB',fontWeight:500,border:'1px solid #BFDBFE'}}>
                  💡 Tap any number to call directly from your phone
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:'center',padding:'16px 0',fontSize:11,color:'#94A3B8'}}>
          Elbow Grease Business Solutions Pvt. Ltd. · For support contact your consultant
        </div>
      </div>
    </div>
  );
}

export default ClientPortal;