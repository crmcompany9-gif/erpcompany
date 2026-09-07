import { useEffect, useState } from 'react';
import API from '../api/axios';

const TYPE_CONFIG = {
  general: { label: 'General', color: '#2563EB', bg: '#EEF4FF', emoji: '📢' },
  holiday: { label: 'Holiday', color: '#DC2626', bg: '#FEF2F2', emoji: '🎉' },
  target:  { label: 'Target',  color: '#D97706', bg: '#FFFBEB', emoji: '🎯' },
  urgent:  { label: 'Urgent',  color: '#DC2626', bg: '#FEF2F2', emoji: '🔴' },
};

const blank = { title: '', message: '', type: 'general' };

export default function NoticeBoard({ userRole, userName }) {
  const [notices, setNotices]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(blank);
  const [saving, setSaving]     = useState(false);
  const canPost = ['manager', 'hod'].includes(userRole);

  const load = () => API.get('/notices').then(r => setNotices(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/notices', { ...form, postedByName: userName, userRole });
      setForm(blank);
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    await API.delete(`/notices/${id}`);
    load();
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E6ED',
      borderRadius: 12, overflow: 'hidden', marginBottom: 20
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', borderBottom: '1px solid #E2E6ED'
      }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>📋 Notice Board</div>
        {canPost && (
          <button onClick={() => setShowForm(s => !s)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 8, border: '1px solid #2563EB',
            background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer'
          }}>
            {showForm ? 'Cancel' : '+ Post notice'}
          </button>
        )}
      </div>

      {/* Post form */}
      {showForm && canPost && (
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E6ED', background: '#F7F8FA' }}>
          <form onSubmit={handlePost}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#5A6479', textTransform: 'uppercase', letterSpacing: '.04em' }}>Title</label>
                <input type="text" placeholder="e.g. Office closed on Diwali"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                  style={{ fontSize: 13, padding: '8px 11px', border: '1px solid #CDD3DC', borderRadius: 8, background: '#fff', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#5A6479', textTransform: 'uppercase', letterSpacing: '.04em' }}>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ fontSize: 13, padding: '8px 11px', border: '1px solid #CDD3DC', borderRadius: 8, background: '#fff', fontFamily: 'inherit' }}>
                  <option value="general">📢 General</option>
                  <option value="holiday">🎉 Holiday</option>
                  <option value="target">🎯 Target</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#5A6479', textTransform: 'uppercase', letterSpacing: '.04em' }}>Message</label>
                <textarea placeholder="Write your notice here…"
                  value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required
                  style={{ fontSize: 13, padding: '8px 11px', border: '1px solid #CDD3DC', borderRadius: 8, background: '#fff', fontFamily: 'inherit', minHeight: 70, resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={saving} style={{
                padding: '7px 16px', borderRadius: 8, border: 'none',
                background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
              }}>
                {saving ? 'Posting…' : 'Post notice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notices list */}
      <div style={{ padding: notices.length === 0 ? '24px 18px' : '8px 18px' }}>
        {notices.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9AA3B4', fontSize: 13 }}>No notices posted yet</div>
        )}
        {notices.map(n => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
          return (
            <div key={n._id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 0', borderBottom: '1px solid #E2E6ED'
            }}>
              <div style={{ width: 4, borderRadius: 4, alignSelf: 'stretch', background: cfg.color, flexShrink: 0, minHeight: 40 }} />
              <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{cfg.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                </div>
                <div style={{ fontSize: 13, color: '#5A6479', lineHeight: 1.5, marginBottom: 4 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: '#9AA3B4' }}>
                  Posted by {n.postedByName} · {fmtDate(n.createdAt)}
                </div>
              </div>
              {canPost && (
                <button onClick={() => handleDelete(n._id)} title="Delete"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA3B4', fontSize: 16, padding: '2px 4px', flexShrink: 0 }}>✕</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
