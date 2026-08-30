// server/utils/taskGenerator.js
const Task = require('../models/Task');
const User = require('../models/User');

const STAGE_TASKS = {

  // ── STAGE 1: RIYA — Accounts & MOU ────────────────────────
  'Accounts & MOU': [
    {
      title: 'Generate Invoice for Client',
      description: 'Create and send invoice to client within 24 hours of onboarding.',
      role: 'accounts', department: 'Accounts',
      priority: 'High', hoursUntilDue: 24,
    },
    {
      title: 'Prepare MOU Document',
      description: 'Prepare MOU with client name, company name, GST, scope of services, commercial terms, signatures and annexures.',
      role: 'accounts', department: 'Accounts',
      priority: 'High', hoursUntilDue: 24,
    },
    {
      title: 'Send MOU to Client for Signature',
      description: 'Send MOU to client via WhatsApp or email. Client must return signed copy.',
      role: 'accounts', department: 'Accounts',
      priority: 'High', hoursUntilDue: 26,
    },
    {
      title: 'Verify Payment from Client',
      description: 'Confirm payment received. Match with invoice amount. Update payment status.',
      role: 'accounts', department: 'Accounts',
      priority: 'Urgent', hoursUntilDue: 48,
    },
    {
      title: 'Collect Signed MOU from Client',
      description: 'Follow up and collect signed MOU from client. Day 1: reminder. Day 2: call. Day 3: final reminder.',
      role: 'accounts', department: 'Accounts',
      priority: 'High', hoursUntilDue: 72,
    },
  ],

  // ── STAGE 2: LOVELY — Certification ───────────────────────
  'Certification': [
    {
      title: 'Incubation Certificate',
      description: 'Apply and obtain incubation certificate for the client from relevant incubation center.',
      role: 'certification', department: 'Certification',
      priority: 'Urgent', hoursUntilDue: 24,
    },
    {
      title: 'Startup India Registration',
      description: 'Register client on Startup India portal. Get DPIIT recognition number.',
      role: 'certification', department: 'Certification',
      priority: 'High', hoursUntilDue: 48,
    },
    {
      title: 'MSME Registration / Certification',
      description: 'Complete Udyam/MSME registration for the client on government portal.',
      role: 'certification', department: 'Certification',
      priority: 'High', hoursUntilDue: 72,
    },
    {
      title: 'FSSAI Certificate',
      description: 'Apply for FSSAI food license if client is in food/beverage sector.',
      role: 'certification', department: 'Certification',
      priority: 'Medium', hoursUntilDue: 72,
    },
    {
      title: 'Import / Export Certificate (if applicable)',
      description: 'Apply for IEC (Import Export Code) if client deals in import/export.',
      role: 'certification', department: 'Certification',
      priority: 'Medium', hoursUntilDue: 96,
    },
    {
      title: 'Integration & Other Government Certifications',
      description: 'Complete any additional scheme-specific certifications required for the client.',
      role: 'certification', department: 'Certification',
      priority: 'High', hoursUntilDue: 100,
    },
    {
      title: 'Send Certification Update to Client',
      description: 'Inform client about all completed certifications with official copies.',
      role: 'certification', department: 'Certification',
      priority: 'Medium', hoursUntilDue: 108,
    },
    {
      title: 'Collect All Certification Documents',
      description: 'Gather all obtained certificates, registration numbers, and acknowledgements into one complete file.',
      role: 'certification', department: 'Certification',
      priority: 'High', hoursUntilDue: 115,
    },
  ],

  // ── STAGE 3: TANMAY — Content & PPT ───────────────────────
  'Content & PPT': [
    {
      title: 'Collect All Client Information',
      description: 'Collect business details, founder info, financial data, product info, market details and all supporting documents from client.',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 24,
    },
    {
      title: 'Design & Build PPT Presentation',
      description: 'Design professional PPT with proper branding, all required slides, scheme-specific format and financial charts.',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 48,
    },
    {
      title: 'Self Quality Check — Content & PPT',
      description: 'Check grammar, financial accuracy, branding, scheme alignment, all slides complete and business model consistency.',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 60,
    },
    {
      title: 'Send PPT & Docs to Client for Approval',
      description: 'Share PPT and all documents with client. Explain each section. Get written approval before submission.',
      role: 'content', department: 'Content',
      priority: 'Urgent', hoursUntilDue: 66,
    },
    {
      title: 'Send Content to Client for Approval',
      description: 'Send full content document to client for review. Follow up within 24 hours if no response.',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 70,
    },
  ],

  // ── STAGE 4: VINIT — File Submission ───────────────────────
  'File Submission': [
    {
      title: 'Complete All Information from All Employees',
      description: 'Collect and verify all documents from all departments: MOU from Riya, certificates from Lovely, PPT from Tanmay. Everything must be ready.',
      role: 'kam', department: 'KAM',
      priority: 'Urgent', hoursUntilDue: 6,
    },
    {
      title: 'Send Google Form to Client',
      description: 'Send the required Google Form to client for filling additional information needed for portal submission.',
      role: 'kam', department: 'KAM',
      priority: 'High', hoursUntilDue: 8,
    },
    {
      title: 'Final File Quality Check Before Submission',
      description: 'FINAL CHECK: All documents present? Client approved PPT? Certificates attached? MOU signed? Google form filled? Everything in correct format?',
      role: 'kam', department: 'KAM',
      priority: 'Urgent', hoursUntilDue: 10,
    },
    {
      title: 'Submit File on Portal',
      description: 'Submit complete file on the relevant government scheme portal. Save confirmation and reference number.',
      role: 'kam', department: 'KAM',
      priority: 'Urgent', hoursUntilDue: 12,
    },
    {
      title: 'Send Submission Confirmation to Client via Mail or WhatsApp',
      description: 'Inform client: file submitted, reference number, expected interview timeline (45-60 days), next steps. Use both mail and WhatsApp.',
      role: 'kam', department: 'KAM',
      priority: 'High', hoursUntilDue: 14,
    },
  ],

  // ── STAGE 5: INTERVIEW (SUCCESS) — Laxmi ──────────────────
'Interview': [
  {
    title: 'Interview Decision Required',
    description: 'Government portal has sent interview notification. Check result and click Interview Accepted or Interview Rejected button on the client page.',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'Urgent', hoursUntilDue: 6,
  },
],

  // ── STAGE 6: COMPLETED ─────────────────────────────────────
  'Completed': [
  {
    title: 'Tell Client Congratulations — Interview Received',
    description: 'Call and message client immediately. Congratulate them. Tell them they received the interview mail.',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'Urgent', hoursUntilDue: 6,
  },
  {
    title: 'Inform Client About Interview Date & Time',
    description: 'Share all interview details: date, time, venue/online link, panel details, what to bring.',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'Urgent', hoursUntilDue: 12,
  },
  {
    title: 'Prepare Client — Be Ready & On Time',
    description: 'Coach client: be on time, dress professionally, be confident, review the PPT.',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'High', hoursUntilDue: 24,
  },
  {
    title: 'Day Before Interview — Final Reminder',
    description: 'Call client day before. Final pep talk. Confirm they are ready.',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'High', hoursUntilDue: 36,
  },
  {
    title: 'Post Interview Follow-up',
    description: 'Call client after interview. How did it go? Any feedback from panel?',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'High', hoursUntilDue: 48,
  },
  {
    title: 'Collect Client Testimonial',
    description: 'Ask happy client for written testimonial and Google/social media review.',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'Low', hoursUntilDue: 72,
  },
],

  // ── STAGE 7: INTERVIEW REJECTED — Rohit ───────────────────
'Rejected - Revision': [
  {
    title: 'Identify Weak Points from Rejection',
    description: 'Deep analysis of why interview was rejected. Document every weak point noted by the panel.',
    role: 'poc', assignTo: 'Rohit', department: 'POC',
    priority: 'Urgent', hoursUntilDue: 12,
  },
  {
    title: 'Send Re-Grooming Feedback Report to Client',
    description: 'Send detailed report: what went wrong, what needs to improve, the plan.',
    role: 'poc', assignTo: 'Rohit', department: 'POC',
    priority: 'High', hoursUntilDue: 24,
  },
  {
    title: 'Focused on Weak Areas — Action Plan',
    description: 'Create targeted improvement plan for areas that caused rejection.',
    role: 'poc', assignTo: 'Rohit', department: 'POC',
    priority: 'High', hoursUntilDue: 36,
  },
  {
    title: 'Update Client on Rejection — Be Empathetic',
    description: 'Call client immediately. Be empathetic. Explain rejection reason clearly. Assure them we will fix.',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'Urgent', hoursUntilDue: 12,
  },
  {
    title: 'Talk with Client — Inform Them of Next Steps',
    description: 'Full call with client. Walk through complete plan. Keep them motivated.',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'High', hoursUntilDue: 48,
  },
],

  // ── STAGE 8: PPT REVISION — Tanmay ────────────────────────
  'PPT Revision': [
    {
      title: 'Re-PPT Work — Revise Based on Rejection Feedback',
      description: 'Update PPT addressing all rejection points. Fix financials, update content, improve presentation quality based on panel feedback.',
      role: 'content', department: 'Content',
      priority: 'Urgent', hoursUntilDue: 36,
    },
    {
      title: 'Coordinate with Client — Review Changes',
      description: 'Walk client through all the changes made. Explain why each change was made. Get their input and suggestions.',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 48,
    },
    {
      title: 'Get Client Approval on Revised PPT',
      description: 'Share revised PPT with client. Get written approval before resubmission. No resubmission without approval.',
      role: 'content', department: 'Content',
      priority: 'Urgent', hoursUntilDue: 60,
    },
    {
      title: 'Final Quality Check on Revised Content',
      description: 'Last check: all rejection points addressed? Financials updated? Content improved? Client approved?',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 66,
    },
  ],

  // ── STAGE 9: RESUBMISSION — Laxmi ─────────────────────────
'Resubmission': [
  {
    title: 'Tell Client We Are Resubmitting Their File',
    description: 'Call and message client. Tell them we fixed everything and resubmitting.',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'Urgent', hoursUntilDue: 6,
  },
  {
    title: 'Check All Work is Complete Before Resubmission',
    description: 'Verify all rejection points fixed, PPT revised, client approved.',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'Urgent', hoursUntilDue: 8,
  },
  {
    title: 'Get Final Approvals',
    description: 'Get final approvals from all departments and client before resubmit.',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'High', hoursUntilDue: 10,
  },
],

  // ── STAGE 10: RE-GROOMING — Ankit + Rohit ─────────────────
 'Re-Grooming': [
  {
    title: 'Check Mistakes from Previous Grooming',
    description: 'Review what went wrong. Identify specific mistakes and weak areas.',
    role: 'retention', assignTo: 'Ankit', department: 'Retention',
    priority: 'Urgent', hoursUntilDue: 24,
  },
  {
    title: 'Tell Client We Will Work Again — Keep Motivated',
    description: 'Call client. Keep them positive and motivated. Explain the new plan.',
    role: 'retention', assignTo: 'Ankit', department: 'Retention',
    priority: 'Urgent', hoursUntilDue: 24,
  },
  {
    title: 'Re-Grooming Session with Client',
    description: 'Full intensive re-grooming session. Focus on weak areas. Mock interviews.',
    role: 'retention', assignTo: 'Ankit', department: 'Retention',
    priority: 'High', hoursUntilDue: 48,
  },
],

  // ── STAGE 11: RETENTION — (Interview received after resubmission)
 'Retention': [
  {
    title: '2nd Interview Decision Required',
    description: 'Government portal has sent 2nd interview notification. Check result and click Interview Accepted or Interview Rejected on the client page.',
    role: 'poc', assignTo: 'Laxmi', department: 'POC',
    priority: 'Urgent', hoursUntilDue: 6,
  },
],

  // ── STAGE 12: FINAL CLOSURE — Yash ────────────────────────
 'Final Closure': [
  {
    title: 'Final Talk with Client — Work Complete',
    description: 'Final professional call with client. Review everything done. Be respectful and kind.',
    role: 'retention', assignTo: 'Yash', department: 'Retention',
    priority: 'Urgent', hoursUntilDue: 24,
  },
  {
    title: 'Resolve Client Problems — Final Attempt',
    description: 'Make one last genuine attempt to resolve client concerns before closing.',
    role: 'retention', assignTo: 'Yash', department: 'Retention',
    priority: 'High', hoursUntilDue: 36,
  },
  {
    title: 'Inform Client — Maximum 2 Interviews Completed',
    description: 'Explain that we completed both interview attempts as per agreement. Work is complete.',
    role: 'retention', assignTo: 'Yash', department: 'Retention',
    priority: 'High', hoursUntilDue: 48,
  },
  {
    title: 'Send Official Closure Communication',
    description: 'Send formal closure via email and WhatsApp. Summary of all work done.',
    role: 'retention', assignTo: 'Yash', department: 'Retention',
    priority: 'High', hoursUntilDue: 48,
  },
  {
    title: 'Final File Archive — Case Closed',
    description: 'Archive complete client file. Document closure reason. Mark case as finally closed.',
    role: 'retention', assignTo: 'Yash', department: 'Retention',
    priority: 'Medium', hoursUntilDue: 72,
  },
],

};

const generateTasksForStage = async (client, stage, createdBy) => {
  try {
    const templates = STAGE_TASKS[stage];
    if (!templates) return [];

    const createdTasks = [];

    for (const template of templates) {
      let assignedUser;
if (template.assignTo) {
  // Assign to specific person by name
  assignedUser = await User.findOne({ 
    name: { $regex: template.assignTo, $options: 'i' }, 
    isActive: true 
  });
}
if (!assignedUser) {
  assignedUser = await User.findOne({ role: template.role, isActive: true });
}

      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + template.hoursUntilDue);

      const task = new Task({
        title: template.title,
        description: template.description,
        client: client._id,
        clientName: client.companyName,
        assignedTo: assignedUser?._id || null,
        assignedRole: template.role,
        department: template.department,
        stage,
        priority: template.priority,
        status: 'Pending',
        dueDate,
        createdBy,
      });

      await task.save();
      createdTasks.push(task);
    }

    console.log(`✅ Created ${createdTasks.length} tasks for ${client.companyName} — Stage: ${stage}`);
    return createdTasks;
  } catch (err) {
    console.error('Task generation error:', err.message);
    return [];
  }
};

module.exports = { generateTasksForStage, STAGE_TASKS };