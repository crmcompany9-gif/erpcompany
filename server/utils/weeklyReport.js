const { generateWeeklyReport } = require('./aiService');
const { sendEmail } = require('./emailService');
const Client = require('../models/Client');
const Task = require('../models/Task');

const MANAGER_EMAIL = process.env.MANAGER_EMAIL || 'manager@elbowgrease.in';

const sendWeeklyReport = async () => {
  try {
    console.log('📊 Generating weekly AI report...');

    const clients = await Client.find({ isActive: true });
    const tasks = await Task.find({ isActive: true });

    if (clients.length === 0) {
      console.log('No clients found — skipping report');
      return;
    }

    const aiReport = await generateWeeklyReport(clients, tasks);
    if (!aiReport) {
      console.log('AI report generation failed');
      return;
    }

    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    const breachedClients = clients.filter(c => c.slaStatus === 'Breached');
    const atRiskClients = clients.filter(c => c.slaStatus === 'At Risk');
    const completedClients = clients.filter(c => c.stage === 'Completed');
    const activeClients = clients.filter(c =>
      c.stage !== 'Completed' && c.stage !== 'Final Closure'
    );

    const template = {
      subject: `📊 Weekly Report — GrowTrack ERP — ${today}`,
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body{margin:0;padding:0;background:#F1F5F9;font-family:Arial,sans-serif;}
  .wrapper{max-width:650px;margin:0 auto;padding:24px 16px;}
  .card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#0F172A;padding:24px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:20px;}
  .header p{color:#94A3B8;margin:6px 0 0;font-size:12px;}
  .body{padding:28px 32px;}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px;}
  .stat{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px;text-align:center;}
  .stat-num{font-size:24px;font-weight:700;margin-bottom:4px;}
  .stat-label{font-size:10px;color:#64748B;text-transform:uppercase;letter-spacing:.06em;}
  .section{margin-bottom:20px;}
  .section-title{font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #E2E8F0;}
  .ai-box{background:linear-gradient(135deg,#EFF6FF,#F5F3FF);border:1px solid #C4B5FD;border-radius:8px;padding:16px 20px;margin-bottom:20px;font-size:13px;color:#1E293B;line-height:1.8;white-space:pre-wrap;}
  .ai-label{font-size:10px;font-weight:700;color:#7C3AED;margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em;}
  .client-row{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-bottom:1px solid #F1F5F9;font-size:12px;}
  .client-row:last-child{border-bottom:none;}
  .badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;}
  .badge-red{background:#FEE2E2;color:#DC2626;}
  .badge-gold{background:#FEF3C7;color:#D97706;}
  .badge-green{background:#D1FAE5;color:#065F46;}
  .badge-blue{background:#EFF6FF;color:#2563EB;}
  .footer{background:#F8FAFC;padding:16px 32px;text-align:center;border-top:1px solid #E2E8F0;}
  .footer p{margin:0;font-size:11px;color:#94A3B8;}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>📊 GrowTrack ERP — Weekly Report</h1>
      <p>Week ending ${today} · Elbow Grease Business Solutions</p>
    </div>
    <div class="body">

      <!-- Stats -->
      <div class="stats">
        <div class="stat">
          <div class="stat-num" style="color:#2563EB;">${clients.length}</div>
          <div class="stat-label">Total Clients</div>
        </div>
        <div class="stat">
          <div class="stat-num" style="color:#10B981;">${activeClients.length}</div>
          <div class="stat-label">Active</div>
        </div>
        <div class="stat">
          <div class="stat-num" style="color:#EF4444;">${breachedClients.length}</div>
          <div class="stat-label">SLA Breached</div>
        </div>
        <div class="stat">
          <div class="stat-num" style="color:#10B981;">${completedClients.length}</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>

      <!-- AI Analysis -->
      <div class="section">
        <div class="section-title">🤖 AI Analysis</div>
        <div class="ai-box">
          <div class="ai-label">Gemini AI Weekly Summary</div>
          ${aiReport}
        </div>
      </div>

      <!-- Breached Clients -->
      ${breachedClients.length > 0 ? `
      <div class="section">
        <div class="section-title">🚨 SLA Breached — Needs Immediate Attention</div>
        ${breachedClients.map(c => `
          <div class="client-row">
            <div>
              <div style="font-weight:600;color:#0F172A;">${c.companyName}</div>
              <div style="color:#64748B;font-size:11px;">${c.stage}</div>
            </div>
            <span class="badge badge-red">Breached</span>
          </div>
        `).join('')}
      </div>` : ''}

      <!-- At Risk -->
      ${atRiskClients.length > 0 ? `
      <div class="section">
        <div class="section-title">⚠️ SLA At Risk</div>
        ${atRiskClients.map(c => `
          <div class="client-row">
            <div>
              <div style="font-weight:600;color:#0F172A;">${c.companyName}</div>
              <div style="color:#64748B;font-size:11px;">${c.stage}</div>
            </div>
            <span class="badge badge-gold">At Risk</span>
          </div>
        `).join('')}
      </div>` : ''}

      <!-- All Active Clients -->
      <div class="section">
        <div class="section-title">📋 All Active Clients</div>
        ${activeClients.map(c => `
          <div class="client-row">
            <div>
              <div style="font-weight:600;color:#0F172A;">${c.companyName}</div>
              <div style="color:#64748B;font-size:11px;">${c.scheme}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px;color:#475569;">${c.stage}</div>
              <span class="badge ${c.slaStatus === 'Breached' ? 'badge-red' : c.slaStatus === 'At Risk' ? 'badge-gold' : 'badge-green'}">${c.slaStatus}</span>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
    <div class="footer">
      <p>GrowTrack ERP · Elbow Grease Business Solutions Pvt. Ltd.<br>
      This is an automated weekly report generated every Monday.</p>
    </div>
  </div>
</div>
</body>
</html>
      `,
    };

    await sendEmail(MANAGER_EMAIL, template);
    console.log('✅ Weekly report sent to', MANAGER_EMAIL);

  } catch (err) {
    console.error('Weekly report error:', err.message);
  }
};

module.exports = { sendWeeklyReport };