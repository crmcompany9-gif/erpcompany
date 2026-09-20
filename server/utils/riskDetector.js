const { detectClientRisks } = require('./aiService');
const { sendEmail } = require('./emailService');
const Client = require('../models/Client');
const Task = require('../models/Task');

// Store latest risks in memory
let latestRisks = [];
let lastChecked = null;

const runRiskDetection = async () => {
  try {
    console.log('🔍 Running AI Risk Detection...');

    const activeStages = [
      'Accounts & MOU','Certification','Content & PPT',
      'File Submission','Grooming','Interview',
      'Rejected - Revision','PPT Revision','Resubmission',
      'Re-Grooming','Retention'
    ];

    const clients = await Client.find({
      isActive: true,
      stage: { $in: activeStages }
    });

    if (clients.length === 0) {
      console.log('No active clients to check');
      latestRisks = [];
      lastChecked = new Date();
      return;
    }

    const tasks = await Task.find({ isActive: true });
    const risks = await detectClientRisks(clients, tasks);

    latestRisks = risks;
    lastChecked = new Date();

    console.log(`✅ Risk detection complete — ${risks.length} clients at risk`);

    // Send email if any HIGH risk clients
    const highRisk = risks.filter(r => r.risk === 'HIGH');
    if (highRisk.length > 0) {
      const MANAGER_EMAIL = process.env.MANAGER_EMAIL;
      const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });

      const template = {
        subject: `🚨 ${highRisk.length} High Risk Client(s) — GrowTrack ERP — ${today}`,
        html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body{margin:0;padding:0;background:#F1F5F9;font-family:Arial,sans-serif;}
  .wrapper{max-width:620px;margin:0 auto;padding:24px 16px;}
  .card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#7F1D1D;padding:24px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:20px;}
  .header p{color:#FCA5A5;margin:6px 0 0;font-size:12px;}
  .body{padding:28px 32px;}
  .risk-card{border-radius:8px;padding:14px 16px;margin-bottom:12px;}
  .high-risk{background:#FEF2F2;border:1px solid #FECACA;border-left:4px solid #EF4444;}
  .medium-risk{background:#FFFBEB;border:1px solid #FDE68A;border-left:4px solid #F59E0B;}
  .risk-company{font-size:14px;font-weight:700;color:#0F172A;margin-bottom:4px;}
  .risk-badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;margin-bottom:8px;}
  .badge-red{background:#FEE2E2;color:#DC2626;}
  .badge-gold{background:#FEF3C7;color:#D97706;}
  .risk-reason{font-size:12px;color:#475569;margin-bottom:6px;line-height:1.6;}
  .risk-action{font-size:12px;color:#1D4ED8;font-weight:600;}
  .footer{background:#F8FAFC;padding:16px 32px;text-align:center;border-top:1px solid #E2E8F0;}
  .footer p{margin:0;font-size:11px;color:#94A3B8;}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>🚨 Risk Alert — Action Required</h1>
      <p>${highRisk.length} high risk client(s) detected — ${today}</p>
    </div>
    <div class="body">
      <p style="font-size:13px;color:#64748B;margin-bottom:20px;">
        The AI Risk Detector has identified clients that need immediate attention. 
        Please review and take action today.
      </p>

      ${risks.map(r => `
        <div class="risk-card ${r.risk === 'HIGH' ? 'high-risk' : 'medium-risk'}">
          <div class="risk-company">${r.company}</div>
          <span class="risk-badge ${r.risk === 'HIGH' ? 'badge-red' : 'badge-gold'}">
            ${r.risk === 'HIGH' ? '🔴 HIGH RISK' : '🟡 MEDIUM RISK'}
          </span>
          <div class="risk-reason">⚠️ ${r.reason}</div>
          <div class="risk-action">→ Action: ${r.action}</div>
        </div>
      `).join('')}

    </div>
    <div class="footer">
      <p>GrowTrack ERP · AI Risk Detector · Elbow Grease Business Solutions</p>
    </div>
  </div>
</div>
</body>
</html>
        `,
      };

      await sendEmail(MANAGER_EMAIL, template);
    }

  } catch (err) {
    console.error('Risk detection error:', err.message);
  }
};

const getLatestRisks = () => ({ risks: latestRisks, lastChecked });

module.exports = { runRiskDetection, getLatestRisks };