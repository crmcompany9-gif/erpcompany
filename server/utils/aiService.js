const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateClientSummary = async (clientData, tasks) => {
  try {
    const pendingTasks = tasks.filter(t => t.status !== 'Done');
    const overdueTasks = tasks.filter(t => t.status === 'Overdue');
    const doneTasks = tasks.filter(t => t.status === 'Done');

    const recentUpdates = clientData.updates
      ?.slice(-5)
      .map(u => `- ${u.department} (${u.updatedByName || 'Unknown'}): ${u.note} [${new Date(u.createdAt).toLocaleDateString('en-IN')}]`)
      .join('\n') || 'No updates yet';

    const prompt = `You are an AI assistant for Elbow Grease Business Solutions, a business consulting firm that helps startups get government funding.

Analyze this client file and give a smart, professional 3-4 sentence summary for the Manager. Focus on: current status, recent activity, any risks or issues, and what needs attention next.

CLIENT DETAILS:
- Company: ${clientData.companyName}
- Contact: ${clientData.contactPerson}
- Scheme: ${clientData.scheme}
- Current Stage: ${clientData.stage}
- SLA Status: ${clientData.slaStatus}
- Added On: ${new Date(clientData.createdAt).toLocaleDateString('en-IN')}

TASK STATUS:
- Pending Tasks: ${pendingTasks.length}
- Overdue Tasks: ${overdueTasks.length}
- Completed Tasks: ${doneTasks.length}

RECENT UPDATES (last 5):
${recentUpdates}

COMMUNICATIONS: ${clientData.communications?.length || 0} logged

Write a concise, professional summary in 3-4 sentences. Mention the current stage, what work has been done recently, any urgent issues (overdue tasks or SLA breach), and what should happen next. Write as a paragraph — no bullet points.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (err) {
    console.error('AI Summary error:', err.message);
    return null;
  }
};

const generateProfessionalNote = async (roughNote, stage, department, companyName) => {
  try {
    const prompt = `You are helping an employee of Elbow Grease Business Solutions write a professional client update note.

The employee works in the ${department} department and is updating a client at the ${stage} stage.
Client company: ${companyName}

Employee's rough note: "${roughNote}"

Rewrite this as a clear, professional 2-3 sentence note that:
- Explains exactly what was done
- Is formal but simple
- Mentions the client or relevant details
- Does not use bullet points
- Is suitable for a business CRM system

Write only the note — no extra text, no labels, no quotes.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (err) {
    console.error('AI Note error:', err.message);
    return null;
  }
};

const generateWeeklyReport = async (clients, tasks) => {
  try {
    const summary = clients.map(c => {
      const clientTasks = tasks.filter(t => t.client?.toString() === c._id?.toString());
      const pending = clientTasks.filter(t => t.status !== 'Done').length;
      const overdue = clientTasks.filter(t => t.status === 'Overdue').length;
      return `- ${c.companyName} | Stage: ${c.stage} | SLA: ${c.slaStatus} | Pending: ${pending} | Overdue: ${overdue}`;
    }).join('\n');

    const prompt = `You are an AI assistant for Elbow Grease Business Solutions.

Generate a professional weekly performance report for the Manager based on this client data:

TOTAL CLIENTS: ${clients.length}
ACTIVE CLIENTS: ${clients.filter(c => c.stage !== 'Completed' && c.stage !== 'Final Closure').length}
COMPLETED THIS WEEK: ${clients.filter(c => c.stage === 'Completed').length}
SLA BREACHED: ${clients.filter(c => c.slaStatus === 'Breached').length}
SLA AT RISK: ${clients.filter(c => c.slaStatus === 'At Risk').length}

CLIENT DETAILS:
${summary}

Write a professional weekly report with:
1. Executive Summary (2-3 sentences overview)
2. Key Highlights (what went well)
3. Issues & Risks (what needs attention)
4. Action Items for next week

Keep it concise and actionable. Use plain text — no markdown symbols like ** or ##.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (err) {
    console.error('AI Weekly Report error:', err.message);
    return null;
  }
};

module.exports = { generateClientSummary, generateProfessionalNote, generateWeeklyReport };

