const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Task = require('../models/Task');
const { getSLADeadline, getSLAStatus } = require('../utils/slaHelper');
const { generateTasksForStage } = require('../utils/taskGenerator');

// GET all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find({ isActive: true })
      .populate('assignedkam', 'name email')
      .populate('assignedPOC', 'name email')
      .sort({ createdAt: -1 });

    // Auto-refresh SLA status
    const updated = await Promise.all(clients.map(async (client) => {
      const status = getSLAStatus(client.slaDeadline);
      if (status !== client.slaStatus) {
        client.slaStatus = status;
        await client.save();
      }
      return client;
    }));

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single client
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('assignedkam', 'name email')
      .populate('assignedPOC', 'name email')
      .populate('updates.updatedBy', 'name role');
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST add new client — auto generates onboarding tasks
router.post('/', async (req, res) => {
  try {
    // Only KAM (Vinit) and Accounts (Riya) can add clients
    const allowedRoles = ['kam', 'accounts', 'hod', 'manager'];
    if (req.body.userRole && !allowedRoles.includes(req.body.userRole)) {
      return res.status(403).json({ message: '❌ You do not have permission to add clients' });
    }
    const client = new Client(req.body);
    client.stageStartedAt = new Date();
    client.slaDeadline = getSLADeadline('Accounts & MOU');
    client.slaStatus = 'On Track';
    await client.save();

    // Try to generate tasks but don't fail if it errors
    try {
      await generateTasksForStage(client, 'Accounts & MOU', req.body.createdBy);
    } catch (taskErr) {
      console.log('Task generation warning:', taskErr.message);
    }

    res.status(201).json({ message: '✅ Client added successfully', client });
  } catch (err) {
    console.error('❌ Client save error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update client stage — auto generates tasks for new stage
router.put('/:id/stage', async (req, res) => {
  try {
    const { stage, note, updatedBy, department, updatedByName, userRole } = req.body;

    const roleStages = {
      accounts:     ['Accounts & MOU'],
      certification:['Certification'],
      content:      ['Content & PPT', 'PPT Revision'],
      kam:          ['File Submission'],
      poc:          ['Grooming', 'Interview', 'Rejected - Revision', 'Re-Grooming', 'Resubmission', 'Retention'],
      retention:    ['Re-Grooming', 'Final Closure'],
    };

    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const interviewStages = ['Interview', 'Retention', 'Grooming'];
    if (userRole && roleStages[userRole] && !interviewStages.includes(client.stage)) {
      const allowed = roleStages[userRole];
      if (!allowed.includes(client.stage)) {
        return res.status(403).json({
          message: `❌ You can only update clients at your department stage. Current stage is: ${client.stage}`,
        });
      }
    }

    const prevStage = client.stage;
    client.stage = stage;
    client.stageStartedAt = new Date();
    client.slaDeadline = getSLADeadline(stage);
    client.slaStatus = getSLAStatus(client.slaDeadline);

    client.updates.push({
      updatedBy,
      updatedByName,
      department,
      note,
      stageChanged: prevStage !== stage ? `${prevStage} → ${stage}` : null,
      createdAt: new Date(),
    });

    await client.save();

    if (prevStage !== stage) {
      try {
        await generateTasksForStage(client, stage, updatedBy);
      } catch (taskErr) {
        console.error('Task gen error:', taskErr.message);
      }
    }

    res.json({ message: '✅ Stage updated & new tasks created', client });
  } catch (err) {
    console.error('Stage update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT log communication
router.put('/:id/communication', async (req, res) => {
  try {
    const { type, note, loggedBy } = req.body;
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
   client.communications.push({ 
  type, 
  note, 
  loggedBy, 
  loggedByName: req.body.loggedByName 
});
    await client.save();
    res.json({ message: '✅ Communication logged', client });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET dashboard summary stats
router.get('/stats/summary', async (req, res) => {
  try {
    const all = await Client.find({ isActive: true });
    res.json({
      total: all.length,
      active: all.filter(c => !['Done', 'Rejected'].includes(c.stage)).length,
      done: all.filter(c => c.stage === 'Done').length,
      rejected: all.filter(c => c.stage === 'Rejected').length,
      breached: all.filter(c => c.slaStatus === 'Breached').length,
      atRisk: all.filter(c => c.slaStatus === 'At Risk').length,
      byStage: {
        'Onboarding': all.filter(c => c.stage === 'Onboarding').length,
        'Content Collection': all.filter(c => c.stage === 'Content Collection').length,
        'Pitch Deck': all.filter(c => c.stage === 'Pitch Deck').length,
        'Submitted': all.filter(c => c.stage === 'Submitted').length,
        'Grooming': all.filter(c => c.stage === 'Grooming').length,
        'Done': all.filter(c => c.stage === 'Done').length,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// DELETE — Manager/HOD only
router.delete('/:id', async (req, res) => {
  try {
    // Remove client
    await Client.findByIdAndUpdate(req.params.id, { isActive: false });

    // Remove ALL tasks for this client
    await Task.updateMany(
      { client: req.params.id },
      { isActive: false }
    );

    res.json({ message: '✅ Client and all related tasks removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST — receive client from SalesTrack integration
// This route is called by SalesTrack backend, not the frontend
router.post('/from-salestrack', async (req, res) => {
  try {
    // Secret key check — only SalesTrack can call this
    const secret = req.headers['x-salestrack-secret'];
    if (secret !== process.env.SALESTRACK_SECRET) {
      return res.status(401).json({ message: '❌ Unauthorised — invalid secret key' });
    }

    const { companyName, contactPerson, phone, city, scheme } = req.body;

    // Check if client with same phone already exists
    const existing = await Client.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: '⚠️ Client with this phone already exists in ERP', client: existing });
    }

    // Create client at Stage 1
    const client = new Client({
      companyName:   companyName || 'Unknown',
      contactPerson: contactPerson || companyName || 'Unknown',
      phone,
      leadSource:    'Direct Enquiry',
      scheme:        scheme || 'DPIIT Recognition',
      stage:         'Accounts & MOU',
      stageStartedAt: new Date(),
      slaDeadline:   getSLADeadline('Accounts & MOU'),
      slaStatus:     'On Track',
      notes:         `Auto-imported from SalesTrack. City: ${city || 'N/A'}`,
      addedByName:   'SalesTrack Integration',
    });

    await client.save();

    // Generate initial tasks
    try {
      await generateTasksForStage(client, 'Accounts & MOU', null);
    } catch (taskErr) {
      console.log('Task generation warning:', taskErr.message);
    }

    res.status(201).json({ message: '✅ Client imported from SalesTrack successfully', client });
  } catch (err) {
    console.error('❌ SalesTrack import error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;