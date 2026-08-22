import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

const STAGES = [
  'Accounts & MOU',
  'Certification',
  'Content & PPT',
  'File Submission',
  'Interview',
  'Rejected - Revision',
  'Re-Grooming',
  'PPT Revision',
  'Resubmission',
  'Retention',
  'Final Closure',
  'Completed',
];

const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const timeLeft = (dueDate) => {
  if (!dueDate) return null;
  const diff = new Date(dueDate) - new Date();
  const hours = Math.round(diff / (1000 * 60 * 60));
  if (hours < 0) return { text: `Overdue by ${Math.abs(hours)}h`, color: 'var(--red)' };
  if (hours < 6) return { text: `${hours}h left`, color: 'var(--red)' };
  if (hours < 24) return { text: `${hours}h left`, color: 'var(--orange)' };
  const days = Math.floor(hours / 24);
  return { text: `${days}d ${hours % 24}h left`, color: 'var(--green)' };
};

const statusBadge = (s) => {
  const map = { 'Pending':'badge-gold','In Progress':'badge-blue','Done':'badge-green','Overdue':'badge-red' };
  return map[s] || 'badge-gray';
};

function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [dept, setDept] = useState('KAM');
  const [newStage, setNewStage] = useState('');
  const [commType, setCommType] = useState('WhatsApp');
  const [commNote, setCommNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('journey');
  const [selectedFile, setSelectedFile] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isHOD = user.role === 'hod' || user.role === 'manager';

  const fetchAll = async () => {
    try {
      const [clientRes, tasksRes] = await Promise.all([
        API.get(`/clients/${id}`),
        API.get(`/tasks/client/${id}`),
      ]);
      setClient(clientRes.data);
      setNewStage(clientRes.data.stage);
      setTasks(tasksRes.data);
    } catch {
      toast.error('Client not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleUpdate = async () => {
    if (!note.trim()) return toast.error('Please add a note');
    setUpdating(true);
    try {
      // Upload file first if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('note', note);
        formData.append('department', dept);
        formData.append('updatedBy', user.id);
        formData.append('updatedByName', user.name);
        await API.post(`/upload/client/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Save stage update
      await API.put(`/clients/${id}/stage`, {
        stage: newStage,
        note,
        department: dept,
        updatedBy: user.id,
        updatedByName: user.name,
      });

      toast.success('✅ Update saved!' + (selectedFile ? ' File uploaded!' : ''));
      setNote('');
      setSelectedFile(null);
      fetchAll();
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const handleCommLog = async () => {
    if (!commNote.trim()) return toast.error('Please add a note');
    try {
      await API.put(`/clients/${id}/communication`, {
        type: commType,
        note: commNote,
        loggedBy: user.id,
        loggedByName: user.name,
      });
      toast.success('✅ Communication logged!');
      setCommNote('');
      fetchAll();
    } catch {
      toast.error('Failed to log');
    }
  };

  const handleTaskDone = async (taskId) => {
    try {
      await API.put(`/tasks/${taskId}/done`, {
        completedBy: user.id,
        completedByName: user.name,
      });
      toast.success('✅ Task marked done!');
      fetchAll();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm(`Are you sure you want to remove ${client.companyName}? All tasks will also be removed.`)) return;
    try {
      await API.delete(`/clients/${id}`);
      toast.success('✅ Client removed successfully');
      navigate('/clients');
    } catch {
      toast.error('Failed to remove client');
    }
  };

  if (loading) return <div className="loading">Loading client...</div>;
  if (!client) return <div className="loading">Client not found</div>;

  const currentStageIndex = STAGES.indexOf(client.stage);
  const pendingTasks = tasks.filter(t => t.status !== 'Done');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/clients')}>← Back</button>
        <h2 style={{fontFamily:'Space Grotesk,sans-serif',fontSize:18,fontWeight:700}}>{client.companyName}</h2>
        <span className={`badge ${client.stage === 'Completed' ? 'badge-green' : client.stage === 'Final Closure' ? 'badge-red' : 'badge-gold'}`}>
          {client.stage}
        </span>
        {isHOD && (
          <span style={{fontSize:11,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:4,padding:'2px 8px',color:'var(--muted)'}}>
            👁 View Only
          </span>
        )}
        <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
          <span style={{fontSize:12,color:'var(--muted)'}}>
            SLA: <strong style={{color: client.slaStatus==='Breached'?'var(--red)':client.slaStatus==='At Risk'?'var(--orange)':'var(--green)'}}>
              {client.slaStatus}
            </strong>
          </span>
          {isHOD && (
            <button className="btn btn-danger btn-sm" onClick={handleDeactivate}>
              🗑 Remove Client
            </button>
          )}
        </div>
      </div>

      {/* SLA Alerts */}
      {client.slaStatus === 'Breached' && (
        <div className="alert alert-danger">
          <span>🚨</span>
          <div><strong>SLA Breach:</strong> This client's current stage is overdue. Update immediately.</div>
        </div>
      )}
      {client.slaStatus === 'At Risk' && (
        <div className="alert alert-warn">
          <span>⚠️</span>
          <div><strong>SLA At Risk:</strong> Deadline approaching. Complete tasks now.</div>
        </div>
      )}

      <div className="grid-7-5" style={{alignItems:'start'}}>

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Client Info */}
          <div className="card">
            <div className="card-title">Client Information</div>
            <div className="grid-2" style={{gap:12}}>
              {[
                ['Company', client.companyName],
                ['Contact', client.contactPerson],
                ['Phone', client.phone],
                ['Email', client.email || '—'],
                ['Scheme', client.scheme],
                ['Lead Source', client.leadSource],
              ].map(([k,v]) => (
                <div key={k}>
                  <div style={{fontSize:11,color:'var(--muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em'}}>{k}</div>
                  <div style={{marginTop:3,fontWeight:500,fontSize:13}}>{v}</div>
                </div>
              ))}
            </div>
            {client.notes && (
              <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)'}}>
                <div style={{fontSize:11,color:'var(--muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>Notes</div>
                <div style={{fontSize:13,color:'var(--muted)'}}>{client.notes}</div>
              </div>
            )}
            {/* Added by timestamp */}
            <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:13}}>🕐</span>
              <span style={{fontSize:12,color:'var(--muted)'}}>
                Added on <strong>{formatDateTime(client.createdAt)}</strong>
                {client.addedByName && <> by <strong>{client.addedByName}</strong></>}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:0,borderBottom:'2px solid var(--border)',marginBottom:16,overflowX:'auto'}}>
            {[
              {id:'journey', label:'🗺 Journey'},
              {id:'tasks', label:`✅ Tasks (${pendingTasks.length} pending)`},
              {id:'updates', label:`📝 Updates (${client.updates?.length || 0})`},
              {id:'comms', label:`💬 Comms (${client.communications?.length || 0})`},
            ].map(tab => (
              <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding:'10px 16px',fontSize:13,fontWeight:500,cursor:'pointer',whiteSpace:'nowrap',
                color: activeTab === tab.id ? 'var(--blue)' : 'var(--muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--blue)' : '2px solid transparent',
                marginBottom:-2,
              }}>
                {tab.label}
              </div>
            ))}
          </div>

          {/* Tab: Journey */}
          {activeTab === 'journey' && (
            <div className="card">
              {STAGES.map((stage, i) => {
                const isDoneStage = i < currentStageIndex;
                const isActive = i === currentStageIndex;
                const stageUpdate = client.updates?.find(u =>
                  u.stageChanged && u.stageChanged.includes(`→ ${stage}`)
                );
                return (
                  <div key={stage} style={{display:'flex',gap:16,padding:'14px 0',borderBottom: i < STAGES.length-1 ? '1px solid var(--border)':'none'}}>
                    <div style={{
                      width:28,height:28,borderRadius:'50%',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:12,fontWeight:700,flexShrink:0,
                      background: isDoneStage?'var(--green)':isActive?'var(--blue)':'var(--border)',
                      color: isDoneStage||isActive?'#fff':'var(--muted)',
                    }}>
                      {isDoneStage ? '✓' : i+1}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{stage}</div>
                      <div style={{fontSize:11,marginTop:4,display:'flex',flexDirection:'column',gap:3}}>
                        {isDoneStage && (
                          <>
                            <span className="badge badge-green" style={{width:'fit-content'}}>✓ Completed</span>
                            {stageUpdate && (
                              <span style={{fontSize:11,color:'var(--muted)',marginTop:2}}>
                                🕐 Moved on <strong>{formatDateTime(stageUpdate.createdAt)}</strong>
                                {stageUpdate.updatedByName && <> by <strong>{stageUpdate.updatedByName}</strong></>}
                              </span>
                            )}
                          </>
                        )}
                        {isActive && (
                          <>
                            <span className="badge badge-blue" style={{width:'fit-content'}}>⚡ In Progress</span>
                            {stageUpdate && (
                              <span style={{fontSize:11,color:'var(--muted)',marginTop:2}}>
                                🕐 Started on <strong>{formatDateTime(stageUpdate.createdAt)}</strong>
                                {stageUpdate.updatedByName && <> by <strong>{stageUpdate.updatedByName}</strong></>}
                              </span>
                            )}
                          </>
                        )}
                        {!isDoneStage && !isActive && (
                          <span style={{color:'var(--light)',fontSize:11}}>⏳ Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab: Tasks */}
          {activeTab === 'tasks' && (
            <div>
              {tasks.length === 0 ? (
                <div className="card" style={{textAlign:'center',padding:40,color:'var(--muted)'}}>
                  <div style={{fontSize:28,marginBottom:8}}>📋</div>
                  <div>No tasks yet for this client</div>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {tasks.map(task => {
                    const time = timeLeft(task.dueDate);
                    const isDoneTask = task.status === 'Done';
                    const isMyTask = task.assignedRole === user.role ||
                      task.department?.toLowerCase() === user.department?.toLowerCase();
                    return (
                      <div key={task._id} style={{
                        background:'var(--white)',
                        border:'1px solid var(--border)',
                        borderLeft:`4px solid ${task.status==='Overdue'?'var(--red)':isDoneTask?'var(--green)':isMyTask?'var(--blue-mid)':'var(--border)'}`,
                        borderRadius:'0 8px 8px 0',
                        padding:'12px 16px',
                        opacity: isDoneTask ? 0.8 : 1,
                      }}>
                        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
                          <div style={{flex:1}}>
                            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                              <span style={{fontWeight:600,fontSize:13}}>{task.title}</span>
                              <span className={`badge ${statusBadge(task.status)}`}>{task.status}</span>
                              <span style={{
                                fontSize:10,fontWeight:600,
                                background: isMyTask?'var(--blue-light)':'var(--surface)',
                                color: isMyTask?'var(--blue)':'var(--muted)',
                                padding:'1px 6px',borderRadius:4,
                                border:`1px solid ${isMyTask?'var(--blue-mid)':'var(--border)'}`
                              }}>
                                {isMyTask ? '👤 My Task' : `🏢 ${task.department}`}
                              </span>
                            </div>
                            <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>{task.description}</div>
                            <div style={{display:'flex',gap:10,marginTop:6,flexWrap:'wrap',alignItems:'center'}}>
                              <span style={{fontSize:11,color:'var(--muted)'}}>🏢 {task.department}</span>
                              {task.assignedTo && <span style={{fontSize:11,color:'var(--muted)'}}>👤 {task.assignedTo.name || task.assignedTo}</span>}
                              {!isDoneTask && time && <span style={{fontSize:11,fontWeight:600,color:time.color}}>⏱ {time.text}</span>}
                              {isDoneTask && task.completedAt && (
                                <span style={{fontSize:11,color:'var(--green)',fontWeight:500}}>
                                  ✓ Completed on <strong>{formatDateTime(task.completedAt)}</strong>
                                  {task.completedByName && <> by <strong>{task.completedByName}</strong></>}
                                </span>
                              )}
                            </div>
                          </div>
                          {isDoneTask ? (
                            <span style={{fontSize:11,color:'var(--green)',fontWeight:600,whiteSpace:'nowrap'}}>✓ Done</span>
                          ) : isHOD ? (
                            <span style={{fontSize:11,color:'var(--muted)',whiteSpace:'nowrap'}}>👁 View</span>
                          ) : isMyTask ? (
                            <button className="btn btn-sm btn-primary" onClick={() => handleTaskDone(task._id)}>✓ Done</button>
                          ) : (
                            <span style={{fontSize:11,color:'var(--muted)',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:6,padding:'3px 8px',whiteSpace:'nowrap'}}>
                              🔒 {task.department}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Updates */}
          {activeTab === 'updates' && (
            <div className="card">
              {!client.updates?.length ? (
                <div style={{textAlign:'center',padding:30,color:'var(--muted)'}}>No updates yet</div>
              ) : (
                [...client.updates].reverse().map((u, i) => (
                  <div key={i} style={{padding:'14px 0',borderBottom:'1px solid var(--border)'}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6,flexWrap:'wrap'}}>
                      <span className="badge badge-blue">{u.department}</span>
                      {u.stageChanged && <span className="badge badge-green">🔄 {u.stageChanged}</span>}
                      <span style={{fontSize:11,color:'var(--light)',marginLeft:'auto'}}>
                        🕐 {formatDateTime(u.createdAt)}
                      </span>
                    </div>
                    {u.updatedByName && (
                      <div style={{fontSize:11,color:'var(--muted)',marginBottom:6}}>
                        👤 By <strong>{u.updatedByName}</strong>
                      </div>
                    )}
                    <div style={{fontSize:13,color:'var(--text)',background:'var(--surface)',padding:'8px 10px',borderRadius:6}}>
                      {u.note}
                    </div>
                    {/* Attached file evidence */}
                    {u.fileUrl && (
                      <div style={{marginTop:8,display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:'var(--blue-light)',borderRadius:6,border:'1px solid #93C5FD'}}>
                        <span style={{fontSize:16}}>
                          {u.fileName?.match(/\.(jpg|jpeg|png)$/i) ? '🖼️' : '📄'}
                        </span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:600,color:'var(--blue)'}}>
                            {u.fileName || 'Attached file'}
                          </div>
                        </div>
                        <a
                          href={u.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline"
                          style={{fontSize:11}}
                        >
                          👁 View
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab: Communications */}
          {activeTab === 'comms' && (
            <div className="card">
              {!client.communications?.length ? (
                <div style={{textAlign:'center',padding:30,color:'var(--muted)'}}>No communications logged yet</div>
              ) : (
                [...client.communications].reverse().map((c, i) => (
                  <div key={i} style={{padding:'12px',background:'var(--surface)',borderRadius:8,marginBottom:8}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                      <span className="badge badge-blue">{c.type}</span>
                      {c.loggedByName && <span style={{fontSize:11,color:'var(--muted)'}}>👤 {c.loggedByName}</span>}
                      <span style={{fontSize:11,color:'var(--light)',marginLeft:'auto'}}>🕐 {formatDateTime(c.createdAt)}</span>
                    </div>
                    <div style={{fontSize:13,color:'var(--muted)'}}>{c.note}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>
          {isHOD ? (
            <>
              <div className="card">
                <div className="card-title">📊 Client Overview</div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {[
                    {label:'Current Stage', value: client.stage, color:'var(--text)'},
                    {label:'SLA Status', value: client.slaStatus, color: client.slaStatus==='Breached'?'var(--red)':client.slaStatus==='At Risk'?'var(--orange)':'var(--green)'},
                    {label:'Total Updates', value: `${client.updates?.length || 0} logged`, color:'var(--text)'},
                    {label:'Communications', value: `${client.communications?.length || 0} logged`, color:'var(--text)'},
                    {label:'Tasks Pending', value: `${pendingTasks.filter(t=>t.status==='Pending').length}`, color:'var(--gold)'},
                    {label:'Tasks Overdue', value: `${tasks.filter(t=>t.status==='Overdue').length}`, color:'var(--red)'},
                    {label:'Tasks Done', value: `${doneTasks.length}`, color:'var(--green)'},
                  ].map(item => (
                    <div key={item.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'var(--surface)',borderRadius:8}}>
                      <span style={{fontSize:12,color:'var(--muted)',fontWeight:500}}>{item.label}</span>
                      <span style={{fontSize:14,fontWeight:700,color:item.color}}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:14,padding:'10px 14px',background:'var(--blue-light)',borderRadius:8,border:'1px solid #93C5FD'}}>
                  <div style={{fontSize:12,color:'var(--blue)',fontWeight:600}}>ℹ️ View Only Mode</div>
                  <div style={{fontSize:11,color:'var(--blue)',marginTop:3}}>Only team members can update clients and log communications</div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Update Client with File Upload */}
              <div className="card">
                <div className="card-title">Update Client</div>
                <div className="form-group">
                  <label>Department</label>
                  <select value={dept} onChange={e => setDept(e.target.value)}>
                    {['KAM','Accounts','Content','Certification','Retention','POC','Grooming','Legal','IT'].map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Move to Stage</label>
                  <select value={newStage} onChange={e => setNewStage(e.target.value)}>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Note *</label>
                  <textarea
                    placeholder="What did you do for this client today?"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>

                {/* File Upload Box */}
                <div className="form-group">
                  <label>Attach Evidence (Photo / PDF / Doc)</label>
                  <div
                    onClick={() => document.getElementById('fileInput').click()}
                    style={{
                      border:'2px dashed var(--border)',
                      borderRadius:8,
                      padding:'16px',
                      textAlign:'center',
                      cursor:'pointer',
                      background: selectedFile ? 'var(--green-light)' : 'var(--surface)',
                      transition:'all 0.15s',
                    }}
                  >
                    {selectedFile ? (
                      <div>
                        <div style={{fontSize:20,marginBottom:4}}>📎</div>
                        <div style={{fontSize:12,fontWeight:600,color:'var(--green)'}}>
                          {selectedFile.name}
                        </div>
                        <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                          style={{marginTop:6,fontSize:11,color:'var(--red)',background:'none',border:'none',cursor:'pointer'}}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{fontSize:24,marginBottom:4}}>📁</div>
                        <div style={{fontSize:12,color:'var(--muted)'}}>
                          Click to attach photo, PDF or document
                        </div>
                        <div style={{fontSize:11,color:'var(--light)',marginTop:2}}>
                          Max 10MB · JPG, PNG, PDF, DOC
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    style={{display:'none'}}
                    onChange={e => setSelectedFile(e.target.files[0])}
                  />
                </div>

                <button className="btn btn-primary" style={{width:'100%'}} onClick={handleUpdate} disabled={updating}>
                  {updating ? 'Uploading & Saving...' : '💾 Save Update'}
                </button>
                {newStage !== client.stage && (
                  <div style={{marginTop:10,padding:'8px 12px',background:'var(--blue-light)',borderRadius:6,fontSize:12,color:'var(--blue)'}}>
                    ℹ️ Moving to <strong>{newStage}</strong> will auto-create tasks for that stage
                  </div>
                )}
              </div>

              {/* Log Communication */}
              <div className="card">
                <div className="card-title">Log Communication</div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={commType} onChange={e => setCommType(e.target.value)}>
                    {['WhatsApp','Call','Email','Meeting'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Note</label>
                  <textarea
                    placeholder="What was discussed?"
                    value={commNote}
                    onChange={e => setCommNote(e.target.value)}
                    style={{minHeight:60}}
                  />
                </div>
                <button className="btn btn-outline" style={{width:'100%'}} onClick={handleCommLog}>
                  💬 Log Communication
                </button>
              </div>

              {/* Task Summary */}
              <div className="card">
                <div className="card-title">Task Summary</div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'var(--gold-light)',borderRadius:8}}>
                    <span style={{fontSize:13,fontWeight:500}}>⏳ Pending</span>
                    <span style={{fontFamily:'Space Grotesk',fontSize:20,fontWeight:700,color:'var(--gold)'}}>{pendingTasks.filter(t=>t.status==='Pending').length}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'var(--red-light)',borderRadius:8}}>
                    <span style={{fontSize:13,fontWeight:500}}>🚨 Overdue</span>
                    <span style={{fontFamily:'Space Grotesk',fontSize:20,fontWeight:700,color:'var(--red)'}}>{tasks.filter(t=>t.status==='Overdue').length}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'var(--green-light)',borderRadius:8}}>
                    <span style={{fontSize:13,fontWeight:500}}>✅ Completed</span>
                    <span style={{fontFamily:'Space Grotesk',fontSize:20,fontWeight:700,color:'var(--green)'}}>{doneTasks.length}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientDetail;