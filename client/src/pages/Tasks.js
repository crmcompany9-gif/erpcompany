import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

const priorityColor = (p) => {
  if (p === 'Urgent') return 'var(--red)';
  if (p === 'High') return 'var(--orange)';
  if (p === 'Medium') return 'var(--blue-mid)';
  return 'var(--light)';
};

const statusBadge = (status) => {
  const map = { 'Pending':'badge-gold', 'In Progress':'badge-blue', 'Done':'badge-green', 'Overdue':'badge-red' };
  return map[status] || 'badge-gray';
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

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isHOD = user.role === 'hod' || user.role === 'manager';

  useEffect(() => {
    const fetchTasks = () => {
      const endpoint = isHOD ? '/tasks' : '/tasks/my';
      API.get(endpoint)
        .then(({ data }) => setTasks(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    };
    fetchTasks();
  }, [isHOD]);
  
const handleDone = async (id) => {
  try {
    await API.put(`/tasks/${id}/done`, {
      completedBy: user.id,
      completedByName: user.name,
    });
    toast.success('✅ Task done!');
    setTasks(prev => prev.map(t =>
      t._id === id
        ? { ...t, status: 'Done', completedAt: new Date(), completedByName: user.name }
        : t
    ));
  } catch (err) {
    if (err.response?.status !== 200) {
      toast.error('Failed to update task');
    }
  }
};

  // Filter logic
  const filtered = tasks.filter(t => {
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchStage = stageFilter === 'All' || t.stage === stageFilter;
    const matchSearch = search === '' ||
      t.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.department?.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchStage && matchSearch;
  });

  const pending = tasks.filter(t => t.status === 'Pending').length;
  const overdue = tasks.filter(t => t.status === 'Overdue').length;
  const done = tasks.filter(t => t.status === 'Done').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div>
      {overdue > 0 && (
        <div className="alert alert-danger">
          <span>🚨</span>
          <div><strong>{overdue} overdue task{overdue > 1 ? 's' : ''}</strong> — complete immediately to avoid SLA breach</div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{tasks.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{color:'var(--gold)'}}>{pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{color:'var(--red)'}}>{overdue}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{color:'var(--green)'}}>{done}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          {isHOD ? 'All Team Tasks' : 'My Tasks'}
          <span style={{fontSize:12,fontWeight:400,color:'var(--muted)'}}>
            Showing {filtered.length} of {tasks.length}
          </span>
        </div>

        {/* Search + Filters */}
        <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
          {/* Search */}
          <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'7px 12px',flex:1,minWidth:200}}>
            <span style={{color:'var(--light)'}}>🔍</span>
            <input
              type="text"
              placeholder={isHOD ? "Search by client, task, employee, department..." : "Search by client or task..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{border:'none',background:'transparent',padding:0,fontSize:13,flex:1,outline:'none'}}
            />
            {search && (
              <span
                onClick={() => setSearch('')}
                style={{cursor:'pointer',color:'var(--muted)',fontSize:16,lineHeight:1}}
              >×</span>
            )}
          </div>

          {/* Stage Filter — HOD only */}
          {isHOD && (
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              style={{padding:'7px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,background:'var(--white)',color:'var(--text)',fontFamily:'inherit',minWidth:160}}
            >
              <option value="All">All Stages</option>
              <option>Onboarding</option>
              <option>Content Collection</option>
              <option>Pitch Deck</option>
              <option>Submitted</option>
              <option>Grooming</option>
              <option>Done</option>
              <option>Rejected</option>
            </select>
          )}

          {/* Status Filter */}
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {['All','Pending','Overdue','In Progress','Done'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-outline'}`}
              >
                {f === 'All' && `All (${tasks.length})`}
                {f === 'Pending' && `Pending (${pending})`}
                {f === 'Overdue' && `⚠ Overdue (${overdue})`}
                {f === 'In Progress' && `In Progress (${inProgress})`}
                {f === 'Done' && `Done (${done})`}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="task-list">
          {filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:40,color:'var(--muted)'}}>
              <div style={{fontSize:32,marginBottom:8}}>
                {search ? '🔍' : '🎉'}
              </div>
              <div style={{fontWeight:600}}>
                {search ? `No tasks found for "${search}"` : 'No tasks here!'}
              </div>
              <div style={{fontSize:13,marginTop:4}}>
                {search
                  ? 'Try a different search term'
                  : 'Tasks are auto-created when clients are added or move stages'}
              </div>
              {search && (
                <button
                  className="btn btn-outline btn-sm"
                  style={{marginTop:12}}
                  onClick={() => setSearch('')}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filtered.map(task => {
              const time = timeLeft(task.dueDate);
              const isOverdue = task.status === 'Overdue';
              const isDone = task.status === 'Done';
              return (
                <div
                  key={task._id}
                  className={`task-card ${isOverdue ? 'urgent' : isDone ? 'done-task' : ''}`}
                >
                  {/* Priority bar */}
                  <div style={{
                    width:4,height:40,borderRadius:2,
                    background:priorityColor(task.priority),
                    flexShrink:0
                  }} />

                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'flex-start',gap:8,flexWrap:'wrap'}}>
                      <span style={{fontWeight:600,fontSize:13}}>{task.title}</span>
                      <span className={`badge ${statusBadge(task.status)}`}>{task.status}</span>
                      <span style={{
                        fontSize:11,background:'var(--surface)',
                        border:'1px solid var(--border)',
                        borderRadius:4,padding:'1px 6px',color:'var(--muted)'
                      }}>{task.priority}</span>
                    </div>

                    <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>
                      {task.description}
                    </div>

                    <div style={{display:'flex',gap:10,marginTop:6,flexWrap:'wrap',alignItems:'center'}}>
                      {/* Client name — clickable */}
                      <span
                        style={{
                          fontSize:12,color:'var(--white)',fontWeight:700,
                          background:'var(--blue)',padding:'2px 8px',
                          borderRadius:4,cursor:'pointer'
                        }}
                        onClick={() => task.client && navigate(`/clients/${task.client._id || task.client}`)}
                      >
                        {task.clientName || task.client?.companyName || '—'}
                      </span>

                      {/* Stage badge */}
                      {task.stage && (
                        <span style={{
                          fontSize:11,background:'var(--surface)',
                          border:'1px solid var(--border)',
                          borderRadius:4,padding:'1px 6px',color:'var(--muted)'
                        }}>
                          📍 {task.stage}
                        </span>
                      )}

                      {/* Department */}
                      <span style={{fontSize:11,color:'var(--muted)'}}>
                        🏢 {task.department}
                      </span>

                      {/* Assigned to — HOD only */}
                      {isHOD && task.assignedTo && (
                        <span style={{fontSize:11,color:'var(--muted)'}}>
                          👤 {task.assignedTo.name || task.assignedTo}
                        </span>
                      )}

                      {/* Timer */}
                      {time && (
                        <span style={{fontSize:11,fontWeight:600,color:time.color}}>
                          ⏱ {time.text}
                        </span>
                      )}
                    </div>
                  </div>

                 {/* Action */}
{isDone ? (
  <span style={{fontSize:11,color:'var(--green)',fontWeight:600,whiteSpace:'nowrap'}}>
    ✓ Done
  </span>
) : isHOD ? (
  <span style={{fontSize:11,color:'var(--muted)',fontWeight:500,whiteSpace:'nowrap'}}>
    👁 View only
  </span>
) : (
  <button
    className="btn btn-sm btn-primary"
    onClick={() => handleDone(task._id)}
  >
    ✓ Done
  </button>
)}
        
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Tasks;