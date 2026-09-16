const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4, // Force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const COMPANY = 'Elbow Grease Business Solutions Pvt. Ltd.';
const SUPPORT = 'elbowgreasecrm42@gmail.com';
const PHONE = '8306533349';

const emailTemplates = {

  // ── 1. NEW CLIENT REGISTERED ──────────────────
  clientRegistered: (client) => ({
    subject: `Your file has been registered — ${COMPANY}`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin:0; padding:0; background:#F1F5F9; font-family:Arial,sans-serif; }
  .wrapper { max-width:600px; margin:0 auto; padding:24px 16px; }
  .card { background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
  .header { background:#0F172A; padding:28px 32px; text-align:center; }
  .header h1 { color:#ffffff; margin:0; font-size:22px; letter-spacing:-0.5px; }
  .header p { color:#94A3B8; margin:6px 0 0; font-size:13px; }
  .body { padding:32px; }
  .greeting { font-size:18px; font-weight:700; color:#0F172A; margin-bottom:8px; }
  .intro { font-size:14px; color:#64748B; line-height:1.7; margin-bottom:24px; }
  .details-box { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:20px; margin-bottom:24px; }
  .details-title { font-size:11px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.08em; margin-bottom:14px; }
  .detail-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #E2E8F0; font-size:13px; }
  .detail-row:last-child { border-bottom:none; }
  .detail-label { color:#64748B; font-weight:500; }
  .detail-value { color:#0F172A; font-weight:600; text-align:right; }
  .steps { margin-bottom:24px; }
  .step { display:flex; gap:12px; margin-bottom:12px; align-items:flex-start; }
  .step-num { width:24px; height:24px; background:#2563EB; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
  .step-text { font-size:13px; color:#475569; line-height:1.6; padding-top:2px; }
  .badge { display:inline-block; background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE; border-radius:20px; padding:4px 14px; font-size:12px; font-weight:600; margin-bottom:20px; }
  .contact-box { background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:16px 20px; margin-bottom:24px; }
  .contact-box p { margin:0; font-size:13px; color:#1E40AF; line-height:1.7; }
  .footer { background:#F8FAFC; padding:20px 32px; text-align:center; border-top:1px solid #E2E8F0; }
  .footer p { margin:0; font-size:12px; color:#94A3B8; line-height:1.7; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>🤝 Elbow Grease</h1>
      <p>Business Solutions Pvt. Ltd.</p>
    </div>
    <div class="body">
      <div class="badge">✅ File Successfully Registered</div>
      <div class="greeting">Dear ${client.contactPerson},</div>
      <p class="intro">
        Welcome to Elbow Grease Business Solutions! Your file has been successfully 
        registered in our system and our team has started working on your case.
      </p>

      <div class="details-box">
        <div class="details-title">Your File Details</div>
        <div class="detail-row">
          <span class="detail-label">Company Name</span>
          <span class="detail-value">${client.companyName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Contact Person</span>
          <span class="detail-value">${client.contactPerson}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Scheme Applied</span>
          <span class="detail-value">${client.scheme}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Registered On</span>
          <span class="detail-value">${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Current Status</span>
          <span class="detail-value" style="color:#2563EB;">In Progress</span>
        </div>
      </div>

      <div class="steps">
        <p style="font-size:13px;font-weight:700;color:#0F172A;margin-bottom:12px;">What happens next?</p>
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text">Our accounts team will prepare your MOU and invoice</div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text">Certification team will handle your government registrations</div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-text">Content team will build your professional pitch deck</div>
        </div>
        <div class="step">
          <div class="step-num">4</div>
          <div class="step-text">Your file will be submitted to the government portal</div>
        </div>
        <div class="step">
          <div class="step-num">5</div>
          <div class="step-text">We will groom you for the interview and notify you when received</div>
        </div>
      </div>

      <div class="contact-box">
        <p>
          <strong>Need help?</strong> Contact us anytime.<br>
          📧 ${SUPPORT}<br>
          📞 ${PHONE}<br>
          You can also track your file status on our client portal.
        </p>
      </div>
    </div>
    <div class="footer">
      <p>${COMPANY}<br>This is an automated email. Please do not reply to this email.</p>
    </div>
  </div>
</div>
</body>
</html>
    `,
  }),

  // ── 2. FILE SUBMITTED ─────────────────────────
  fileSubmitted: (client) => ({
    subject: `Your file has been submitted — ${COMPANY}`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body{margin:0;padding:0;background:#F1F5F9;font-family:Arial,sans-serif;}
  .wrapper{max-width:600px;margin:0 auto;padding:24px 16px;}
  .card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#0F172A;padding:28px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:22px;}
  .header p{color:#94A3B8;margin:6px 0 0;font-size:13px;}
  .body{padding:32px;}
  .badge{display:inline-block;background:#D1FAE5;color:#065F46;border:1px solid #A7F3D0;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:600;margin-bottom:20px;}
  .greeting{font-size:18px;font-weight:700;color:#0F172A;margin-bottom:8px;}
  .intro{font-size:14px;color:#64748B;line-height:1.7;margin-bottom:24px;}
  .highlight{background:#F0FDF4;border:1px solid #86EFAC;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;}
  .highlight h2{margin:0 0 8px;font-size:20px;color:#15803D;}
  .highlight p{margin:0;font-size:13px;color:#166534;}
  .info{font-size:14px;color:#475569;line-height:1.8;margin-bottom:24px;}
  .contact-box{background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:16px 20px;margin-bottom:24px;}
  .contact-box p{margin:0;font-size:13px;color:#1E40AF;line-height:1.7;}
  .footer{background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;}
  .footer p{margin:0;font-size:12px;color:#94A3B8;line-height:1.7;}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>🤝 Elbow Grease</h1>
      <p>Business Solutions Pvt. Ltd.</p>
    </div>
    <div class="body">
      <div class="badge">📁 File Submitted to Portal</div>
      <div class="greeting">Dear ${client.contactPerson},</div>
      <p class="intro">Great news! Your complete file has been successfully submitted to the government portal. Our team has done a thorough quality check before submission.</p>

      <div class="highlight">
        <h2>🎯 File Submitted!</h2>
        <p>Your ${client.scheme} application is now live on the government portal</p>
      </div>

      <p class="info">
        <strong>What happens now?</strong><br>
        The government portal typically takes <strong>45-60 days</strong> to process applications 
        and send interview notifications. Our team will notify you immediately when your 
        interview is scheduled.<br><br>
        In the meantime, our grooming team will prepare you for the interview to maximize 
        your chances of success.
      </p>

      <div class="contact-box">
        <p>
          <strong>Stay updated</strong> — Track your file on our client portal.<br>
          📧 ${SUPPORT} &nbsp;|&nbsp; 📞 ${PHONE}
        </p>
      </div>
    </div>
    <div class="footer">
      <p>${COMPANY}<br>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</div>
</body>
</html>
    `,
  }),

  // ── 3. INTERVIEW RECEIVED ─────────────────────
  interviewReceived: (client) => ({
    subject: `🎉 Congratulations! Interview received — ${COMPANY}`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body{margin:0;padding:0;background:#F1F5F9;font-family:Arial,sans-serif;}
  .wrapper{max-width:600px;margin:0 auto;padding:24px 16px;}
  .card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#065F46;padding:32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:24px;}
  .header p{color:#A7F3D0;margin:6px 0 0;font-size:13px;}
  .body{padding:32px;}
  .congrats{text-align:center;margin-bottom:28px;}
  .congrats .emoji{font-size:52px;display:block;margin-bottom:12px;}
  .congrats h2{margin:0;font-size:24px;color:#065F46;}
  .congrats p{margin:8px 0 0;font-size:14px;color:#64748B;}
  .details-box{background:#F0FDF4;border:1px solid #86EFAC;border-radius:8px;padding:20px;margin-bottom:24px;}
  .details-title{font-size:11px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px;}
  .detail-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #BBF7D0;font-size:13px;}
  .detail-row:last-child{border-bottom:none;}
  .detail-label{color:#166534;}
  .detail-value{color:#14532D;font-weight:700;}
  .tips{margin-bottom:24px;}
  .tip{display:flex;gap:10px;margin-bottom:10px;font-size:13px;color:#475569;line-height:1.6;}
  .tip-icon{font-size:16px;flex-shrink:0;}
  .contact-box{background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:16px 20px;margin-bottom:24px;}
  .contact-box p{margin:0;font-size:13px;color:#1E40AF;line-height:1.7;}
  .footer{background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;}
  .footer p{margin:0;font-size:12px;color:#94A3B8;line-height:1.7;}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>🤝 Elbow Grease</h1>
      <p>Business Solutions Pvt. Ltd.</p>
    </div>
    <div class="body">
      <div class="congrats">
        <span class="emoji">🎉</span>
        <h2>Congratulations ${client.contactPerson}!</h2>
        <p>Your file has received an interview from the government portal</p>
      </div>

      <div class="details-box">
        <div class="details-title">Interview Details</div>
        <div class="detail-row">
          <span class="detail-label">Company</span>
          <span class="detail-value">${client.companyName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Scheme</span>
          <span class="detail-value">${client.scheme}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value" style="color:#059669;">Interview Received ✅</span>
        </div>
      </div>

      <div class="tips">
        <p style="font-size:13px;font-weight:700;color:#0F172A;margin-bottom:12px;">Tips for your interview:</p>
        <div class="tip"><span class="tip-icon">⏰</span>Be on time — arrive 10-15 minutes early</div>
        <div class="tip"><span class="tip-icon">👔</span>Dress professionally and confidently</div>
        <div class="tip"><span class="tip-icon">📊</span>Know your financials — projections, funding use, market size</div>
        <div class="tip"><span class="tip-icon">🎯</span>Practice your pitch — our team will help you prepare</div>
        <div class="tip"><span class="tip-icon">📱</span>Our team will contact you with exact date, time and venue</div>
      </div>

      <div class="contact-box">
        <p>
          <strong>Our team will call you shortly</strong> with the interview schedule.<br>
          📧 ${SUPPORT} &nbsp;|&nbsp; 📞 ${PHONE}
        </p>
      </div>
    </div>
    <div class="footer">
      <p>${COMPANY}<br>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</div>
</body>
</html>
    `,
  }),

  // ── 4. INTERVIEW REJECTED ─────────────────────
  interviewRejected: (client) => ({
    subject: `Update on your file — ${COMPANY}`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body{margin:0;padding:0;background:#F1F5F9;font-family:Arial,sans-serif;}
  .wrapper{max-width:600px;margin:0 auto;padding:24px 16px;}
  .card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#0F172A;padding:28px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:22px;}
  .header p{color:#94A3B8;margin:6px 0 0;font-size:13px;}
  .body{padding:32px;}
  .badge{display:inline-block;background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:600;margin-bottom:20px;}
  .greeting{font-size:18px;font-weight:700;color:#0F172A;margin-bottom:8px;}
  .intro{font-size:14px;color:#64748B;line-height:1.7;margin-bottom:24px;}
  .promise-box{background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:20px;margin-bottom:24px;}
  .promise-box h3{margin:0 0 10px;font-size:15px;color:#92400E;}
  .promise-box p{margin:0;font-size:13px;color:#78350F;line-height:1.7;}
  .steps{margin-bottom:24px;}
  .step{display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;}
  .step-num{width:24px;height:24px;background:#F59E0B;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;}
  .step-text{font-size:13px;color:#475569;line-height:1.6;padding-top:2px;}
  .contact-box{background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:16px 20px;margin-bottom:24px;}
  .contact-box p{margin:0;font-size:13px;color:#1E40AF;line-height:1.7;}
  .footer{background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;}
  .footer p{margin:0;font-size:12px;color:#94A3B8;line-height:1.7;}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>🤝 Elbow Grease</h1>
      <p>Business Solutions Pvt. Ltd.</p>
    </div>
    <div class="body">
      <div class="badge">⚠️ Interview Result Update</div>
      <div class="greeting">Dear ${client.contactPerson},</div>
      <p class="intro">
        We understand this is disappointing news. Unfortunately, the interview result 
        was not in our favour this time. But please do not worry — this is very common 
        and we have a strong plan to resubmit your file with improvements.
      </p>

      <div class="promise-box">
        <h3>🤝 Our Promise to You</h3>
        <p>
          We will identify the exact weak points, improve your PPT and content, 
          do intensive re-grooming sessions, and resubmit your file. 
          We are committed to your success.
        </p>
      </div>

      <div class="steps">
        <p style="font-size:13px;font-weight:700;color:#0F172A;margin-bottom:12px;">What we will do next:</p>
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text">Identify all weak points from the rejection feedback</div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text">Revise your PPT and content to address all issues</div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-text">Intensive re-grooming sessions to prepare you better</div>
        </div>
        <div class="step">
          <div class="step-num">4</div>
          <div class="step-text">Resubmit your file with full improvements</div>
        </div>
      </div>

      <div class="contact-box">
        <p>
          <strong>Our team will contact you shortly</strong> to discuss the next steps.<br>
          📧 ${SUPPORT} &nbsp;|&nbsp; 📞 ${PHONE}
        </p>
      </div>
    </div>
    <div class="footer">
      <p>${COMPANY}<br>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</div>
</body>
</html>
    `,
  }),

  // ── 5. FINAL CLOSURE ─────────────────────────
  finalClosure: (client) => ({
    subject: `File closure update — ${COMPANY}`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body{margin:0;padding:0;background:#F1F5F9;font-family:Arial,sans-serif;}
  .wrapper{max-width:600px;margin:0 auto;padding:24px 16px;}
  .card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#0F172A;padding:28px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:22px;}
  .header p{color:#94A3B8;margin:6px 0 0;font-size:13px;}
  .body{padding:32px;}
  .badge{display:inline-block;background:#FEE2E2;color:#991B1B;border:1px solid #FECACA;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:600;margin-bottom:20px;}
  .greeting{font-size:18px;font-weight:700;color:#0F172A;margin-bottom:8px;}
  .intro{font-size:14px;color:#64748B;line-height:1.7;margin-bottom:24px;}
  .summary-box{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:20px;margin-bottom:24px;}
  .summary-box h3{margin:0 0 10px;font-size:14px;color:#475569;}
  .summary-box p{margin:0;font-size:13px;color:#64748B;line-height:1.7;}
  .contact-box{background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:16px 20px;margin-bottom:24px;}
  .contact-box p{margin:0;font-size:13px;color:#1E40AF;line-height:1.7;}
  .footer{background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;}
  .footer p{margin:0;font-size:12px;color:#94A3B8;line-height:1.7;}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>🤝 Elbow Grease</h1>
      <p>Business Solutions Pvt. Ltd.</p>
    </div>
    <div class="body">
      <div class="badge">📁 File Closed</div>
      <div class="greeting">Dear ${client.contactPerson},</div>
      <p class="intro">
        We are writing to inform you that your file has been officially closed 
        after completing the maximum number of interview attempts as per our agreement.
        Our team worked hard throughout this journey and we appreciate your trust in us.
      </p>

      <div class="summary-box">
        <h3>Summary of work completed:</h3>
        <p>
          ✅ MOU and documentation completed<br>
          ✅ All government certifications obtained<br>
          ✅ Professional pitch deck created<br>
          ✅ File submitted to government portal<br>
          ✅ Grooming and interview preparation done<br>
          ✅ Maximum 2 interview attempts completed
        </p>
      </div>

      <p style="font-size:14px;color:#64748B;line-height:1.7;margin-bottom:24px;">
        Our team member will contact you shortly for a final discussion. 
        We hope to work with you again in the future on other schemes and opportunities.
      </p>

      <div class="contact-box">
        <p>
          <strong>For any queries:</strong><br>
          📧 ${SUPPORT} &nbsp;|&nbsp; 📞 ${PHONE}
        </p>
      </div>
    </div>
    <div class="footer">
      <p>${COMPANY}<br>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</div>
</body>
</html>
    `,
  }),

};

const sendEmail = async (to, template) => {
  if (!to) {
    console.log('⚠️ No email address provided — skipping email');
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Elbow Grease Business Solutions" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email error:', err.message);
    // Don't throw — email failure should not break the main flow
  }
};

module.exports = { sendEmail, emailTemplates };