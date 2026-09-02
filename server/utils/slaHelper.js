// server/utils/slaHelper.js

const SLA_HOURS = {
  'Accounts & MOU':     48,   // Riya — MOU + Invoice within 48 hours
  'Certification':      120,  // Lovely — 5 working days
  'Content & PPT':      72,   // Tanmay — 3 working days
 'File Submission':    24,   // Vinit — submit within 24 hours
'Grooming':           72,   // Rohit — groom client within 3 days
'Interview':          null, // Depends on government portal
  'Rejected - Revision': 48,  // Ankit — review within 48 hours
  'Re-Grooming':        72,   // Rohit — grooming within 3 days
  'PPT Revision':       48,   // Tanmay — revised PPT within 48 hours
  'Resubmission':       24,   // Vinit — resubmit within 24 hours
  'Retention':          72,   // Laxmi — retention within 3 days
  'Final Closure':      48,   // Yash — close within 48 hours
  'Completed':          null, // No SLA
};

const getSLADeadline = (stage, startDate = new Date()) => {
  const hours = SLA_HOURS[stage];
  if (!hours) return null;
  const deadline = new Date(startDate);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
};

const getSLAStatus = (deadline) => {
  if (!deadline) return 'On Track';
  const now = new Date();
  const hoursLeft = (deadline - now) / (1000 * 60 * 60);
  if (hoursLeft < 0) return 'Breached';
  if (hoursLeft < 6) return 'At Risk';
  return 'On Track';
};

const getHoursRemaining = (deadline) => {
  if (!deadline) return null;
  const now = new Date();
  return Math.round((deadline - now) / (1000 * 60 * 60));
};

const formatTimeRemaining = (hours) => {
  if (hours === null) return '—';
  if (hours < 0) return `Overdue by ${Math.abs(hours)}h`;
  if (hours < 24) return `${hours}h remaining`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return `${days}d ${rem}h remaining`;
};

module.exports = { getSLADeadline, getSLAStatus, getHoursRemaining, formatTimeRemaining, SLA_HOURS };