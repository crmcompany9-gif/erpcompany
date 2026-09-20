import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import ClientLoginForm from '../components/ClientLoginForm';

const SUCCESS_STAGES = [
  { key: 'Accounts & MOU', label: 'Accounts & MOU', owner: 'Riya' },
  { key: 'Certification', label: 'Certification', owner: 'Lovely' },
  { key: 'Content & PPT', label: 'Content & PPT', owner: 'Tanmay Pandey' },
  { key: 'File Submission', label: 'File Submission', owner: 'Vinit' },
  { key: 'Grooming', label: 'Grooming', owner: 'Rohit' },
  { key: 'Interview', label: 'Interview Received 🎉', owner: 'Laxmi' },
  { key: 'Completed', label: '✅ All Journey Closed', owner: '' },
];

const REJECTION_STAGES = [
  { key: 'Accounts & MOU', label: 'Accounts & MOU', owner: 'Riya' },
  { key: 'Certification', label: 'Certification', owner: 'Lovely' },
  { key: 'Content & PPT', label: 'Content & PPT', owner: 'Tanmay Pandey' },
  { key: 'File Submission', label: 'File Submission', owner: 'Vinit' },
  { key: 'Grooming', label: 'Grooming', owner: 'Rohit' },
  { key: 'Rejected - Revision', label: 'Interview Rejected ❌', owner: 'Rohit' },
  { key: 'PPT Revision', label: 'Re PPT & Content', owner: 'Tanmay Pandey' },
  { key: 'Resubmission', label: 'Re Submission', owner: 'Laxmi' },
  { key: 'Re-Grooming', label: 'Re Grooming', owner: 'Ankit' },
  { key: 'Retention', label: '✅ Interview Received', owner: '' },
  { key: 'Final Closure', label: '📁 Final Closure', owner: 'Yash' },
];

const ALL_STAGES = [
  'Accounts & MOU', 'Certification', 'Content & PPT', 'File Submission',
  'Grooming', 'Interview', 'Completed', 'Rejected - Revision', 'PPT Revision',
  'Resubmission', 'Re-Grooming', 'Retention', 'Final Closure',
];

const REJECTION_SET = new Set([
  'Rejected - Revision', 'PPT Revision', 'Resubmission',
  'Re-Grooming', 'Retention', 'Final Closure',
]);

const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
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
  const map = { 'Pending': 'badge-gold', 'In Progress': 'badge-blue', 'Done': 'badge-green', 'Overdue': 'badge-red' };
  return map[s] || 'badge-gray';
};

const getDeptFromRole = (role) => {
  const map = {
    accounts: 'Accounts', kam: 'KAM', certification: 'Certification',
    content: 'Content', poc: 'POC', retention: 'Retention',
    it: 'IT', hod: 'Operations', manager: 'Operations',
  };
  return map[role] || 'KAM';
};

const ALL_DEPT_OPTIONS = [
  { value: 'Accounts', label: 'Accounts — Riya', roles: ['accounts'] },
  { value: 'KAM', label: 'KAM — Vinit', roles: ['kam'] },
  { value: 'Certification', label: 'Certification — Lovely', roles: ['certification'] },
  { value: 'Content', label: 'Content — Tanmay Pandey', roles: ['content'] },
  { value: 'POC', label: 'POC — Rohit & Laxmi', roles: ['poc'] },
  { value: 'Retention', label: 'Retention — Ankit & Yash', roles: ['retention'] },
  { value: 'IT', label: 'IT — JiTech', roles: ['it'] },
  { value: 'Operations', label: 'Operations — Manager', roles: ['hod', 'manager'] },
];

const ROLE_STAGES = {
  accounts: ['Accounts & MOU'],
  certification: ['Certification'],
  content: ['Content & PPT', 'PPT Revision'],
  kam: ['File Submission'],
  poc: ['Grooming', 'Interview', 'Rejected - Revision', 'Re-Grooming', 'Resubmission', 'Retention'],
  retention: ['Re-Grooming', 'Final Closure'],
  it: ALL_STAGES,
  hod: ALL_STAGES,
  manager: ALL_STAGES,
};

function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [commType, setCommType] = useState('WhatsApp');
  const [commNote, setCommNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('journey');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStage, setSelectedStage] = useState('Accounts & MOU');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isHOD = user.role === 'hod' || user.role === 'manager';
  const [dept, setDept] = useState(getDeptFromRole(user.role));
  const DEPT_OPTIONS = ALL_DEPT_OPTIONS.filter(d => d.roles.includes(user.role));
  const myAllowedStages = ROLE_STAGES[user.role] || ALL_STAGES;
  const [aiSummary, setAiSummary] = useState('');
const [aiLoading, setAiLoading] = useState(false);
const [aiNoteLoading, setAiNoteLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [clientRes, tasksRes] = await Promise.all([
        API.get(`/clients/${id}`),
        API.get(`/tasks/client/${id}`),
      ]);
      setClient(clientRes.data);
      setSelectedStage(clientRes.data.stage);
      setTasks(tasksRes.data);
    } catch {
      toast.error('Client not found');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAll(); }, [id]);

  const moveToStage = async (targetStage, successMsg) => {
    if (!note.trim()) return toast.error('Please add a note first');
    setUpdating(true);
    try {
      await API.put(`/clients/${id}/stage`, {
        stage: targetStage, note, department: dept,
        updatedBy: user.id, updatedByName: user.name, userRole: user.role,
      });
      toast.success(successMsg);
      setNote(''); fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setUpdating(false); }
  };

  const handleUpdate = async () => {
    if (!note.trim()) return toast.error('Please add a note');
    setUpdating(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('note', note);
        formData.append('department', dept);
        formData.append('updatedBy', user.id);
        formData.append('updatedByName', user.name);
        await API.post(`/upload/client/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      const idx = ALL_STAGES.indexOf(selectedStage);
      const nextStage = idx < ALL_STAGES.length - 1 ? ALL_STAGES[idx + 1] : selectedStage;
      await API.put(`/clients/${id}/stage`, {
        stage: nextStage, note, department: dept,
        updatedBy: user.id, updatedByName: user.name, userRole: user.role,
      });
      toast.success(' Updated!');
      setNote(''); setSelectedFile(null); fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setUpdating(false); }
  };

  const handleCommLog = async () => {
    if (!commNote.trim()) return toast.error('Please add a note');
    try {
      await API.put(`/clients/${id}/communication`, {
        type: commType, note: commNote, loggedBy: user.id, loggedByName: user.name,
      });
      toast.success('✅ Communication logged!');
      setCommNote(''); fetchAll();
    } catch { toast.error('Failed to log'); }
  };

  const handleTaskDone = async (taskId) => {
    try {
      await API.put(`/tasks/${taskId}/done`, { completedBy: user.id, completedByName: user.name });
      toast.success('✅ Task marked done!'); fetchAll();
    } catch { toast.error('Failed to update task'); }
  };

  const handleDeactivate = async () => {
    if (!window.confirm(`Remove ${client.companyName}?`)) return;
    try {
      await API.delete(`/clients/${id}`);
      toast.success(' Client removed'); navigate('/clients');
    } catch { toast.error('Failed to remove client'); }
  };

  if (loading) return <div className="loading">Loading client...</div>;
  if (!client) return <div className="loading">Client not found</div>;

  const isRejectionPath = REJECTION_SET.has(client.stage);
  const STAGES = isRejectionPath ? REJECTION_STAGES : SUCCESS_STAGES;
  const currentStageIndex = STAGES.findIndex(s => s.key === client.stage);
  const pendingTasks = tasks.filter(t => t.status !== 'Done');
  const doneTasks = tasks.filter(t => t.status === 'Done');
  // Only POC role can see interview result buttons
  const canHandleInterview = ['poc', 'hod', 'manager'].includes(user.role);
  const showFirstInterviewButtons = client.stage === 'Interview' && canHandleInterview;
  const showSecondInterviewButtons = client.stage === 'Retention' && canHandleInterview;

  const handleAISummary = async () => {
  setAiLoading(true);
  setAiSummary('');
  try {
    const res = await API.post(`/clients/${id}/ai-summary`);
    setAiSummary(res.data.summary);
  } catch {
    toast.error('AI summary failed — check API key');
  } finally {
    setAiLoading(false);
  }
};

const handleAINote = async () => {
  if (!note.trim()) return toast.error('Type a rough note first!');
  setAiNoteLoading(true);
  try {
    const res = await API.post(`/clients/${id}/ai-note`, {
      roughNote: note,
      stage: client.stage,
      department: dept,
      companyName: client.companyName,
    });
    setNote(res.data.note);
    toast.success('✨ Note improved by AI!');
  } catch {
    toast.error('AI note failed');
  } finally {
    setAiNoteLoading(false);
  }
};

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/clients')}>← Back</button>
        <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 18, fontWeight: 700 }}>{client.companyName}</h2>
        <span className={`badge ${client.stage === 'Completed' || client.stage === 'Retention' ? 'badge-green' : client.stage === 'Final Closure' ? 'badge-red' : 'badge-gold'}`}>
          {client.stage}
        </span>
        {isHOD && <span style={{ fontSize: 11, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', color: 'var(--muted)' }}>👁 View Only</span>}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>SLA: <strong style={{ color: client.slaStatus === 'Breached' ? 'var(--red)' : client.slaStatus === 'At Risk' ? 'var(--orange)' : 'var(--green)' }}>{client.slaStatus}</strong></span>
          {isHOD && <button className="btn btn-danger btn-sm" onClick={handleDeactivate}>🗑 Remove Client</button>}
        </div>
      </div>

      {client.slaStatus === 'Breached' && <div className="alert alert-danger"><span>🚨</span><div><strong>SLA Breach:</strong> Overdue. Update immediately.</div></div>}
      {client.slaStatus === 'At Risk' && <div className="alert alert-warn"><span>⚠️</span><div><strong>SLA At Risk:</strong> Deadline approaching.</div></div>}

      <div className="grid-7-5" style={{ alignItems: 'start' }}>
        <div>
          <div className="card">
            <div className="card-title">Client Information</div>
            {/* AI Summary */}
{isHOD && (
  <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)'}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--muted)'}}>
        🤖 AI Client Summary
      </div>
      <button
        onClick={handleAISummary}
        disabled={aiLoading}
        className="btn btn-sm btn-outline"
        style={{fontSize:11}}
      >
        {aiLoading ? '⏳ Analyzing...' : '✨ Generate Summary'}
      </button>
    </div>
    {aiSummary && (
      <div style={{
        marginTop:10,padding:'12px 14px',
        background:'linear-gradient(135deg,#EFF6FF,#F5F3FF)',
        border:'1px solid #C4B5FD',
        borderRadius:8,fontSize:13,
        color:'var(--text)',lineHeight:1.7,
      }}>
        <div style={{fontSize:10,fontWeight:700,color:'#7C3AED',marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>
          🤖 AI Analysis
        </div>
        {aiSummary}
      </div>
    )}
  </div>
)}
            <div className="grid-2" style={{ gap: 12 }}>
              {[['Company', client.companyName], ['Contact', client.contactPerson], ['Phone', client.phone], ['Email', client.email || '—'], ['Scheme', client.scheme], ['Lead Source', client.leadSource]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{k}</div>
                  <div style={{ marginTop: 3, fontWeight: 500, fontSize: 13 }}>{v}</div>
                </div>
              ))}
            </div>
            {client.notes && <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}><div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Notes</div><div style={{ fontSize: 13, color: 'var(--muted)' }}>{client.notes}</div></div>}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>🕐</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Added on <strong>{formatDateTime(client.createdAt)}</strong>{client.addedByName && <> by <strong>{client.addedByName}</strong></>}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 16, overflowX: 'auto' }}>
            {[{ id: 'journey', label: '🗺 Journey' }, { id: 'tasks', label: `✅ Tasks (${pendingTasks.length} pending)` }, { id: 'updates', label: `📝 Updates (${client.updates?.length || 0})` }, { id: 'comms', label: `💬 Comms (${client.communications?.length || 0})` }].map(tab => (
              <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', color: activeTab === tab.id ? 'var(--blue)' : 'var(--muted)', borderBottom: activeTab === tab.id ? '2px solid var(--blue)' : '2px solid transparent', marginBottom: -2 }}>{tab.label}</div>
            ))}
          </div>

          {activeTab === 'journey' && (
            <div className="card">
              <div style={{ marginBottom: 14, padding: '8px 12px', background: isRejectionPath ? 'var(--red-light)' : 'var(--blue-light)', borderRadius: 8, fontSize: 12, fontWeight: 600, color: isRejectionPath ? 'var(--red)' : 'var(--blue)' }}>
                {isRejectionPath ? '⚠️ Rejection Path — Team is working to resubmit' : '✅ Success Path — On track for interview'}
              </div>
              {STAGES.map((stage, i) => {
                const isDone = i < currentStageIndex;
                const isActive = i === currentStageIndex;
                // Show who completed THIS stage — find update that moved FROM this stage
                const stageUpdate = client.updates?.find(u =>
                  u.stageChanged && u.stageChanged.startsWith(`${stage.key} →`)
                );
                return (
                  <div key={stage.key} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: i < STAGES.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, background: isDone ? 'var(--green)' : isActive ? 'var(--blue)' : 'var(--border)', color: isDone || isActive ? '#fff' : 'var(--muted)' }}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isDone ? 'var(--green)' : isActive ? 'var(--blue)' : 'var(--muted)' }}>{stage.label}</span>
                        {stage.owner && <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--surface)', padding: '1px 7px', borderRadius: 10, border: '1px solid var(--border)' }}>{stage.owner}</span>}
                      </div>
                      <div style={{ fontSize: 11, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {isDone && <React.Fragment><span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Completed</span>{stageUpdate && <span style={{ color: 'var(--muted)' }}>🕐 {formatDateTime(stageUpdate.createdAt)}{stageUpdate.updatedByName && ` by ${stageUpdate.updatedByName}`}</span>}</React.Fragment>}
                        {isActive && <span style={{ color: 'var(--blue)', fontWeight: 600 }}>⚡ In Progress</span>}
                        {!isDone && !isActive && <span style={{ color: 'var(--light)' }}>⏳ Pending</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {client.stage === 'Completed' && <div style={{ marginTop: 14, padding: 16, background: '#D1FAE5', borderRadius: 10, textAlign: 'center' }}><div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div><div style={{ fontWeight: 700, color: '#065f46', fontSize: 15 }}>Congratulations! Journey Complete!</div></div>}
              {client.stage === 'Final Closure' && <div style={{ marginTop: 14, padding: 16, background: 'var(--red-light)', borderRadius: 10, textAlign: 'center' }}><div style={{ fontSize: 28, marginBottom: 6 }}>📁</div><div style={{ fontWeight: 700, color: 'var(--red)', fontSize: 15 }}>File Closed — Yash will contact you</div></div>}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              {tasks.length === 0 ? <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}><div style={{ fontSize: 28, marginBottom: 8 }}>📋</div><div>No tasks yet</div></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tasks.map(task => {
                    const time = timeLeft(task.dueDate);
                    const isDoneTask = task.status === 'Done';
                    const isMyTask =
                      (task.assignedTo?.name && task.assignedTo.name === user.name) ||
                      (!task.assignedTo && task.assignedRole === user.role);
                    return (
                      <div key={task._id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderLeft: `4px solid ${task.status === 'Overdue' ? 'var(--red)' : isDoneTask ? 'var(--green)' : isMyTask ? 'var(--blue-mid)' : 'var(--border)'}`, borderRadius: '0 8px 8px 0', padding: '12px 16px', opacity: isDoneTask ? 0.8 : 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 600, fontSize: 13 }}>{task.title}</span>
                              <span className={`badge ${statusBadge(task.status)}`}>{task.status}</span>
                              <span style={{ fontSize: 10, fontWeight: 600, background: isMyTask ? 'var(--blue-light)' : 'var(--surface)', color: isMyTask ? 'var(--blue)' : 'var(--muted)', padding: '1px 6px', borderRadius: 4, border: `1px solid ${isMyTask ? 'var(--blue-mid)' : 'var(--border)'}` }}>{isMyTask ? '👤 My Task' : `🏢 ${task.department}`}</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{task.description}</div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ fontSize: 11, color: 'var(--muted)' }}>🏢 {task.department}</span>
                              {task.assignedTo && <span style={{ fontSize: 11, color: 'var(--muted)' }}>👤 {task.assignedTo.name || task.assignedTo}</span>}
                              {!isDoneTask && time && <span style={{ fontSize: 11, fontWeight: 600, color: time.color }}>⏱ {time.text}</span>}
                              {isDoneTask && task.completedAt && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 500 }}>✓ {formatDateTime(task.completedAt)}{task.completedByName && ` by ${task.completedByName}`}</span>}
                            </div>
                          </div>
                          {isDoneTask ? <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, whiteSpace: 'nowrap' }}>✓ Done</span> : isHOD ? <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>👁 View</span> : isMyTask ? <button className="btn btn-sm btn-primary" onClick={() => handleTaskDone(task._id)}>✓ Done</button> : <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap' }}>🔒 {task.department}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="card">
              {!client.updates?.length ? <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>No updates yet</div> : (
                [...client.updates].reverse().map((u, i) => (
                  <div key={i} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                      <span className="badge badge-blue">{u.department}</span>
                      {u.stageChanged && <span className="badge badge-green">🔄 {u.stageChanged}</span>}
                      <span style={{ fontSize: 11, color: 'var(--light)', marginLeft: 'auto' }}>🕐 {formatDateTime(u.createdAt)}</span>
                    </div>
                    {u.updatedByName && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>👤 By <strong>{u.updatedByName}</strong></div>}
                    <div style={{ fontSize: 13, color: 'var(--text)', background: 'var(--surface)', padding: '8px 10px', borderRadius: 6 }}>{u.note}</div>
                    {u.fileUrl && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--blue-light)', borderRadius: 6, border: '1px solid #93C5FD' }}>
                        <span>{u.fileName?.match(/\.(jpg|jpeg|png)$/i) ? '🖼️' : '📄'}</span>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)' }}>{u.fileName || 'Attached file'}</div></div>
                        <a href={u.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ fontSize: 11 }}>👁 View</a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'comms' && (
            <div className="card">
              {!client.communications?.length ? <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>No communications logged yet</div> : (
                [...client.communications].reverse().map((c, i) => (
                  <div key={i} style={{ padding: '12px', background: 'var(--surface)', borderRadius: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span className="badge badge-blue">{c.type}</span>
                      {c.loggedByName && <span style={{ fontSize: 11, color: 'var(--muted)' }}>👤 {c.loggedByName}</span>}
                      <span style={{ fontSize: 11, color: 'var(--light)', marginLeft: 'auto' }}>🕐 {formatDateTime(c.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{c.note}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          {isHOD ? (
            <div>
              <div className="card">
                <div className="card-title">📊 Client Overview</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[{ label: 'Current Stage', value: client.stage, color: 'var(--text)' }, { label: 'SLA Status', value: client.slaStatus, color: client.slaStatus === 'Breached' ? 'var(--red)' : client.slaStatus === 'At Risk' ? 'var(--orange)' : 'var(--green)' }, { label: 'Total Updates', value: `${client.updates?.length || 0} logged`, color: 'var(--text)' }, { label: 'Communications', value: `${client.communications?.length || 0} logged`, color: 'var(--text)' }, { label: 'Tasks Pending', value: `${pendingTasks.filter(t => t.status === 'Pending').length}`, color: 'var(--gold)' }, { label: 'Tasks Overdue', value: `${tasks.filter(t => t.status === 'Overdue').length}`, color: 'var(--red)' }, { label: 'Tasks Done', value: `${doneTasks.length}`, color: 'var(--green)' }].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface)', borderRadius: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--blue-light)', borderRadius: 8, border: '1px solid #93C5FD' }}>
                  <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>ℹ️ View Only Mode</div>
                  <div style={{ fontSize: 11, color: 'var(--blue)', marginTop: 3 }}>Only team members can update clients</div>
                </div>
              </div>
              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-title">🔑 Client Portal Access</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Give this client access to view their file journey</div>
                <ClientLoginForm clientId={id} clientName={client.companyName} />
              </div>
            </div>
          ) : (
            <div>
              <div className="card">
                <div className="card-title">Update Client</div>
                <div className="form-group">
                  <label>Your Department</label>
                  <select value={dept} onChange={e => setDept(e.target.value)}>
                    {DEPT_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>

                {showFirstInterviewButtons && (
                  <div style={{ marginBottom: 16, padding: 14, background: 'var(--surface)', borderRadius: 10, border: '2px solid var(--border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>🎯 Interview Result</div>
                    <div className="form-group" style={{ marginBottom: 10 }}>
                      <label>Note * (required)</label>
                      <textarea placeholder="Write interview result details..." value={note} onChange={e => setNote(e.target.value)} style={{ minHeight: 60 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ flex: 1, padding: '10px 8px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => moveToStage('Completed', '🎉 Interview Accepted! Journey Completed!')} disabled={updating}>✅ Interview Accepted</button>
                      <button style={{ flex: 1, padding: '10px 8px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => moveToStage('Rejected - Revision', '⚠️ Interview Rejected — Revision path starts')} disabled={updating}>❌ Interview Rejected</button>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>Accepted → Journey Completed | Rejected → Revision Path</div>
                  </div>
                )}

                {showSecondInterviewButtons && (
                  <div style={{ marginBottom: 16, padding: 14, background: 'var(--surface)', borderRadius: 10, border: '2px solid #F59E0B' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>🎯 2nd Interview Result — Final</div>
                    <div className="form-group" style={{ marginBottom: 10 }}>
                      <label>Note * (required)</label>
                      <textarea placeholder="Write 2nd interview result..." value={note} onChange={e => setNote(e.target.value)} style={{ minHeight: 60 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ flex: 1, padding: '10px 8px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => moveToStage('Completed', '🎉 2nd Interview Accepted! Journey Closed!')} disabled={updating}>✅ Interview Accepted</button>
                      <button style={{ flex: 1, padding: '10px 8px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => moveToStage('Final Closure', '📁 Rejected — Yash handles final closure')} disabled={updating}>❌ Interview Rejected</button>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>Max 2 interviews — final decision</div>
                  </div>
                )}

                {!showFirstInterviewButtons && !showSecondInterviewButtons && (
                  <React.Fragment>
                  <div className="form-group">
  <label>Note *</label>
  <textarea
    placeholder="Type rough notes e.g: mou sent, payment received..."
    value={note}
    onChange={e => setNote(e.target.value)}
  />
  <button
    type="button"
    onClick={handleAINote}
    disabled={aiNoteLoading}
    style={{
      marginTop:6, width:'100%',
      padding:'7px',
      background: aiNoteLoading ? 'var(--surface)' : 'linear-gradient(135deg,#7C3AED,#6D28D9)',
      color: aiNoteLoading ? 'var(--muted)' : '#fff',
      border:'none', borderRadius:6,
      fontSize:12, fontWeight:600,
      cursor: aiNoteLoading ? 'not-allowed' : 'pointer',
      fontFamily:'inherit',
    }}
  >
    {aiNoteLoading ? '⏳ Improving...' : '✨ Improve with AI'}
  </button>
</div>
                  </React.Fragment>
                )}

                <div className="form-group">
                  <label>Attach Evidence (Photo / PDF / Doc)</label>
                  <div onClick={() => document.getElementById('fileInput').click()} style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '16px', textAlign: 'center', cursor: 'pointer', background: selectedFile ? 'var(--green-light)' : 'var(--surface)', transition: 'all 0.15s' }}>
                    {selectedFile ? (
                      <div>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>📎</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>{selectedFile.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{(selectedFile.size / 1024).toFixed(1)} KB</div>
                        <button onClick={e => { e.stopPropagation(); setSelectedFile(null); }} style={{ marginTop: 6, fontSize: 11, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>✕ Remove</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>📁</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Click to attach photo, PDF or document</div>
                        <div style={{ fontSize: 11, color: 'var(--light)', marginTop: 2 }}>Max 10MB · JPG, PNG, PDF, DOC</div>
                      </div>
                    )}
                  </div>
                  <input id="fileInput" type="file" accept="image/*,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setSelectedFile(e.target.files[0])} />
                </div>

                {!showFirstInterviewButtons && !showSecondInterviewButtons && (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleUpdate} disabled={updating}>{updating ? 'Saving...' : '💾 Save Update'}</button>
                )}
              </div>

              <div className="card">
                <div className="card-title">Log Communication</div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={commType} onChange={e => setCommType(e.target.value)}>
                    {['WhatsApp', 'Call', 'Email', 'Meeting'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Note</label>
                  <textarea placeholder="What was discussed?" value={commNote} onChange={e => setCommNote(e.target.value)} style={{ minHeight: 60 }} />
                </div>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleCommLog}>💬 Log Communication</button>
              </div>

              <div className="card">
                <div className="card-title">Task Summary</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[{ label: '⏳ Pending', val: pendingTasks.filter(t => t.status === 'Pending').length, bg: 'var(--gold-light)', color: 'var(--gold)' }, { label: '🚨 Overdue', val: tasks.filter(t => t.status === 'Overdue').length, bg: 'var(--red-light)', color: 'var(--red)' }, { label: '✅ Completed', val: doneTasks.length, bg: 'var(--green-light)', color: 'var(--green)' }].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: item.bg, borderRadius: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: item.color }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientDetail;