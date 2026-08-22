// server/utils/taskGenerator.js
const Task = require('../models/Task');
const User = require('../models/User');

const STAGE_TASKS = {

  // ── STAGE 1: RIYA ──────────────────────────────────────────
  'Accounts & MOU': [
    {
      title: 'Generate Invoice for Client',
      description: 'Create and send invoice to client within 24 hours of onboarding',
      role: 'accounts', department: 'Accounts',
      priority: 'High', hoursUntilDue: 24,
    },
    {
      title: 'Prepare MOU Document',
      description: 'Prepare MOU with: Client name, Company name, GST, Scope of services, Commercial terms, Signatures, Annexures',
      role: 'accounts', department: 'Accounts',
      priority: 'High', hoursUntilDue: 24,
    },
    {
      title: 'Send MOU to Client for Signature',
      description: 'Send MOU to client. Client must return signed MOU within 3 calendar days.',
      role: 'accounts', department: 'Accounts',
      priority: 'High', hoursUntilDue: 26,
    },
    {
      title: 'Collect Signed MOU from Client',
      description: 'Follow up and collect signed MOU. Day 1: Reminder. Day 2: Call. Day 3: Final reminder.',
      role: 'accounts', department: 'Accounts',
      priority: 'High', hoursUntilDue: 72,
    },
    {
      title: 'Verify Payment from Client',
      description: 'Confirm payment received. Match invoice amount. Update payment status.',
      role: 'accounts', department: 'Accounts',
      priority: 'Urgent', hoursUntilDue: 48,
    },
    {
      title: 'Quality Check — MOU Before Filing',
      description: 'Final check: All fields filled, terms correct, signatures present, annexures attached',
      role: 'accounts', department: 'Accounts',
      priority: 'High', hoursUntilDue: 47,
    },
  ],

  // ── STAGE 2: LOVELY ────────────────────────────────────────
  'Certification': [
    {
      title: 'Startup India Registration',
      description: 'Register client on Startup India portal. Get DPIIT recognition number.',
      role: 'certification', department: 'Certification',
      priority: 'Urgent', hoursUntilDue: 24,
    },
    {
      title: 'MSME Registration',
      description: 'Complete Udyam/MSME registration for the client on government portal',
      role: 'certification', department: 'Certification',
      priority: 'High', hoursUntilDue: 48,
    },
    {
      title: 'FSSAI Certificate (if applicable)',
      description: 'Apply for FSSAI food license if client is in food/beverage sector',
      role: 'certification', department: 'Certification',
      priority: 'Medium', hoursUntilDue: 72,
    },
    {
      title: 'Import/Export Certificate (if applicable)',
      description: 'Apply for IEC (Import Export Code) if client deals in import/export',
      role: 'certification', department: 'Certification',
      priority: 'Medium', hoursUntilDue: 72,
    },
    {
      title: 'Integration & Other Government Certifications',
      description: 'Complete any additional scheme-specific certifications required for the client',
      role: 'certification', department: 'Certification',
      priority: 'High', hoursUntilDue: 96,
    },
    {
      title: 'Collect All Certification Documents',
      description: 'Gather all obtained certificates, registration numbers, and acknowledgements into one file',
      role: 'certification', department: 'Certification',
      priority: 'High', hoursUntilDue: 110,
    },
    {
      title: 'Send Certification Update to Client',
      description: 'Inform client about all completed certifications with official copies',
      role: 'certification', department: 'Certification',
      priority: 'Medium', hoursUntilDue: 115,
    },
  ],

  // ── STAGE 3: TANMAY ────────────────────────────────────────
  'Content & PPT': [
    {
      title: 'Collect All Client Information',
      description: 'Collect: Business details, Founder info, Financial data, Product info, Market details, Supporting documents',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 24,
    },
    {
      title: 'Write Business Documentation',
      description: 'Write complete business document: Company overview, Problem statement, Solution, Market size, Business model, Revenue model, Team',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 48,
    },
    {
      title: 'Design & Build PPT Presentation',
      description: 'Design professional PPT with proper branding, all required slides, scheme-specific format, financial charts',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 60,
    },
    {
      title: 'Prepare Interview/Grooming Material',
      description: 'Prepare Q&A document, expected interview questions, pitch script, key talking points for client',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 64,
    },
    {
      title: 'Self Quality Check — Content & PPT',
      description: 'Check: Grammar, Financial accuracy, Branding, Scheme alignment, All slides complete, Business model consistency',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 68,
    },
    {
      title: 'Send PPT & Docs to Client for Approval',
      description: 'Share PPT and all documents with client. Explain each section. Get written approval before submission.',
      role: 'content', department: 'Content',
      priority: 'Urgent', hoursUntilDue: 70,
    },
    {
      title: 'Follow Up Client for Approval',
      description: 'If no response in 24 hours, follow up via WhatsApp and call. Get approval before proceeding.',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 72,
    },
  ],

  // ── STAGE 4: VINIT ─────────────────────────────────────────
  'File Submission': [
    {
      title: 'Compile Complete File Package',
      description: 'Collect and organize: Approved PPT + All Documents + All Certificates + MOU + Payment proof + Any other required documents',
      role: 'kam', department: 'KAM',
      priority: 'Urgent', hoursUntilDue: 6,
    },
    {
      title: 'Final File Quality Check Before Submission',
      description: 'FINAL CHECK: All documents present? Client approved PPT? Certificates attached? MOU signed? Everything in correct format?',
      role: 'kam', department: 'KAM',
      priority: 'Urgent', hoursUntilDue: 8,
    },
    {
      title: 'Submit File on Portal/Website',
      description: 'Submit complete file on the relevant government scheme portal or website. Save confirmation and reference number.',
      role: 'kam', department: 'KAM',
      priority: 'Urgent', hoursUntilDue: 12,
    },
    {
      title: 'Send Submission Confirmation to Client',
      description: 'Email client: Submission confirmed, Reference number, Expected interview timeline (45-60 days), Next steps',
      role: 'kam', department: 'KAM',
      priority: 'High', hoursUntilDue: 14,
    },
    {
      title: 'Monitor Portal for Interview Call',
      description: 'Check portal regularly for interview schedule or any government queries/deficiency letters',
      role: 'kam', department: 'KAM',
      priority: 'Medium', hoursUntilDue: 24,
    },
  ],

  // ── STAGE 5: INTERVIEW ─────────────────────────────────────
  'Interview': [
    {
      title: 'Conduct Interview Preparation Session',
      description: 'Full mock interview with client: Practice pitch, Q&A handling, Financial questions, Panel simulation',
      role: 'content', department: 'Content',
      priority: 'Urgent', hoursUntilDue: 24,
    },
    {
      title: 'Brief Client on Interview Format',
      description: 'Explain interview format, panel members, time duration, what to expect, key points to highlight',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 26,
    },
    {
      title: 'Final Grooming Before Interview',
      description: 'Last-minute coaching session: Confidence building, final pitch practice, key financials review',
      role: 'poc', department: 'POC',
      priority: 'Urgent', hoursUntilDue: 12,
    },
    {
      title: 'Coordinate Interview Logistics',
      description: 'Confirm interview date/time/venue with client. Send reminders. Ensure client is prepared and present.',
      role: 'poc', department: 'POC',
      priority: 'High', hoursUntilDue: 24,
    },
    {
      title: 'Post Interview Follow-up',
      description: 'Check with client after interview: How did it go? Any feedback from panel? Expected result timeline?',
      role: 'poc', department: 'POC',
      priority: 'High', hoursUntilDue: 48,
    },
  ],

  // ── STAGE 6: ANKIT ─────────────────────────────────────────
  'Rejected - Revision': [
    {
      title: 'Analyze Rejection Reason in Detail',
      description: 'Deep analysis of why file was rejected. Get official rejection letter. Document every deficiency noted by authority.',
      role: 'retention', department: 'Retention',
      priority: 'Urgent', hoursUntilDue: 24,
    },
    {
      title: 'Call Client About Rejection',
      description: 'Call client immediately. Be empathetic. Explain rejection reason clearly. Assure them we will fix and resubmit.',
      role: 'retention', department: 'Retention',
      priority: 'Urgent', hoursUntilDue: 12,
    },
    {
      title: 'Prepare Rejection Analysis Report',
      description: 'Write detailed report: What was rejected, Why it was rejected, What needs to be fixed, Action plan',
      role: 'retention', department: 'Retention',
      priority: 'High', hoursUntilDue: 36,
    },
    {
      title: 'Update File — Fix Rejection Issues',
      description: 'Fix all issues identified in rejection: Update documents, Correct errors, Add missing information',
      role: 'retention', department: 'Retention',
      priority: 'High', hoursUntilDue: 48,
    },
    {
      title: 'Coordinate with All Departments for Fixes',
      description: 'Coordinate with Lovely (certifications), Tanmay (PPT/content), Vinit (submission) to fix specific issues',
      role: 'retention', department: 'Retention',
      priority: 'High', hoursUntilDue: 30,
    },
  ],

  // ── STAGE 7: ROHIT ─────────────────────────────────────────
  'Re-Grooming': [
    {
      title: 'Re-Grooming Session with Client',
      description: 'Full re-grooming based on rejection feedback. Focus on weak areas identified from previous rejection.',
      role: 'poc', department: 'POC',
      priority: 'Urgent', hoursUntilDue: 48,
    },
    {
      title: 'Identify Weak Points from Rejection',
      description: 'Analyze what went wrong in interview/submission. Create targeted improvement plan for client.',
      role: 'poc', department: 'POC',
      priority: 'High', hoursUntilDue: 24,
    },
    {
      title: 'Mock Interview — Focused on Weak Areas',
      description: 'Conduct targeted mock interview focusing specifically on the areas that caused rejection',
      role: 'poc', department: 'POC',
      priority: 'High', hoursUntilDue: 60,
    },
    {
      title: 'Update Client on Re-grooming Progress',
      description: 'Keep client informed and motivated throughout re-grooming process. Share progress and improvements.',
      role: 'poc', department: 'POC',
      priority: 'Medium', hoursUntilDue: 72,
    },
    {
      title: 'Send Re-grooming Feedback Report',
      description: 'Send detailed feedback: What improved, What still needs work, Confidence level, Readiness assessment',
      role: 'poc', department: 'POC',
      priority: 'Medium', hoursUntilDue: 70,
    },
  ],

  // ── STAGE 8: TANMAY AGAIN ──────────────────────────────────
  'PPT Revision': [
    {
      title: 'Revise PPT Based on Rejection Feedback',
      description: 'Update PPT addressing all rejection points. Fix financials, update content, improve presentation quality.',
      role: 'content', department: 'Content',
      priority: 'Urgent', hoursUntilDue: 36,
    },
    {
      title: 'Update Business Documentation',
      description: 'Revise all business documents addressing deficiencies noted in rejection letter',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 40,
    },
    {
      title: 'Quality Check — Revised PPT & Docs',
      description: 'Thorough quality check of revised materials. Compare against rejection reasons to ensure all fixed.',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 44,
    },
    {
      title: 'Send Revised PPT to Client for Re-approval',
      description: 'Share revised PPT and documents with client. Explain what was changed and why. Get written approval.',
      role: 'content', department: 'Content',
      priority: 'Urgent', hoursUntilDue: 46,
    },
    {
      title: 'Follow Up Client for Re-approval',
      description: 'Follow up for approval within 24 hours. No resubmission without client written approval.',
      role: 'content', department: 'Content',
      priority: 'High', hoursUntilDue: 48,
    },
  ],

  // ── STAGE 9: VINIT AGAIN ───────────────────────────────────
  'Resubmission': [
    {
      title: 'Compile Revised File Package',
      description: 'Compile revised file: Updated PPT + Updated docs + Updated certificates + All previous + Client approval',
      role: 'kam', department: 'KAM',
      priority: 'Urgent', hoursUntilDue: 6,
    },
    {
      title: 'Final Check Before Resubmission',
      description: 'CRITICAL CHECK: All rejection points addressed? Client approved revised PPT? All updated docs included?',
      role: 'kam', department: 'KAM',
      priority: 'Urgent', hoursUntilDue: 8,
    },
    {
      title: 'Resubmit File on Portal',
      description: 'Resubmit complete revised file on government portal. Save new reference number and confirmation.',
      role: 'kam', department: 'KAM',
      priority: 'Urgent', hoursUntilDue: 12,
    },
    {
      title: 'Send Resubmission Confirmation to Client',
      description: 'Email client: Resubmission confirmed, New reference number, Updated timeline, Positive message',
      role: 'kam', department: 'KAM',
      priority: 'High', hoursUntilDue: 14,
    },
  ],

  // ── STAGE 10: LAXMI ────────────────────────────────────────
  'Retention': [
    {
      title: 'Personal Call to Client — Retention',
      description: 'Personal call to client. Listen to concerns. Understand their frustration. Show empathy and commitment.',
      role: 'poc', department: 'POC',
      priority: 'Urgent', hoursUntilDue: 12,
    },
    {
      title: 'Assess Client Situation',
      description: 'Understand exactly why client is unhappy or wants to leave. Document all concerns and complaints.',
      role: 'poc', department: 'POC',
      priority: 'High', hoursUntilDue: 24,
    },
    {
      title: 'Offer Resolution to Client',
      description: 'Offer concrete solutions: Timeline revision, Additional support, Process explanation, Compensation if needed',
      role: 'poc', department: 'POC',
      priority: 'High', hoursUntilDue: 36,
    },
    {
      title: 'Follow Up Daily for 3 Days',
      description: 'Day 1, 2, 3: Daily follow-up call/message. Show active engagement. Update client on every step.',
      role: 'poc', department: 'POC',
      priority: 'High', hoursUntilDue: 72,
    },
    {
      title: 'Retention Status Report to Manager',
      description: 'Report to HOD/Manager: Client status, What was offered, Client response, Likelihood of retaining',
      role: 'poc', department: 'POC',
      priority: 'High', hoursUntilDue: 48,
    },
  ],

  // ── STAGE 11: YASH ─────────────────────────────────────────
  'Final Closure': [
    {
      title: 'Final Apology & Closure Call to Client',
      description: 'Professional final call: Sincerely apologize for not meeting expectations. Thank them for the opportunity.',
      role: 'retention', department: 'Retention',
      priority: 'Urgent', hoursUntilDue: 24,
    },
    {
      title: 'Send Official Closure Email',
      description: 'Send formal closure email: Apology, Summary of work done, Refund details if applicable, Future assistance offer',
      role: 'retention', department: 'Retention',
      priority: 'High', hoursUntilDue: 36,
    },
    {
      title: 'Process Any Refund/Settlement',
      description: 'Coordinate with Riya (Accounts) for any refund or financial settlement as per MOU terms',
      role: 'retention', department: 'Retention',
      priority: 'High', hoursUntilDue: 48,
    },
    {
      title: 'Document Closure Reason',
      description: 'Document why case closed: Client dissatisfied, Multiple rejections, Client withdrew, etc. For future learning.',
      role: 'retention', department: 'Retention',
      priority: 'Medium', hoursUntilDue: 48,
    },
    {
      title: 'Final File Archive',
      description: 'Archive complete client file: All documents, correspondence, rejection letters, work done. Mark case closed.',
      role: 'retention', department: 'Retention',
      priority: 'Medium', hoursUntilDue: 72,
    },
    {
      title: 'CASE CLOSED — Final Record',
      description: 'YASH: Final confirmation that case is completely closed. All tasks done, client informed, file archived.',
      role: 'retention', department: 'Retention',
      priority: 'High', hoursUntilDue: 72,
    },
  ],

  // ── COMPLETED ──────────────────────────────────────────────
  'Completed': [
    {
      title: 'Client Success — Follow Up',
      description: 'Congratulate client on successful interview/approval. Ask for testimonial and referrals.',
      role: 'retention', department: 'Retention',
      priority: 'Medium', hoursUntilDue: 24,
    },
    {
      title: 'Collect Client Testimonial',
      description: 'Ask happy client for written testimonial and Google/social media review',
      role: 'retention', department: 'Retention',
      priority: 'Low', hoursUntilDue: 72,
    },
    {
      title: 'Ask for Referrals',
      description: 'Request referrals from satisfied client. Explain referral benefits if applicable.',
      role: 'retention', department: 'Retention',
      priority: 'Low', hoursUntilDue: 96,
    },
  ],
};

const generateTasksForStage = async (client, stage, createdBy) => {
  try {
    const templates = STAGE_TASKS[stage];
    if (!templates) return [];

    const createdTasks = [];

    for (const template of templates) {
      const assignedUser = await User.findOne({ role: template.role, isActive: true });

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