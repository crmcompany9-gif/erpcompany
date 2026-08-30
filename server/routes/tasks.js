const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Client = require('../models/Client');
const jwt = require('jsonwebtoken');

// Helper — get user from token
const getUserFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch { return null; }
};

// GET my tasks (role-based) — only for active clients
router.get('/my', async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // Get only active clients first
    const activeClients = await Client.find({ isActive: true }).select('_id');
    const activeClientIds = activeClients.map(c => c._id);
// Get client stages to filter tasks correctly
const clientList = await Client.find({ isActive: true }).select('_id stage');
const REJECTION_SET = new Set([
  'Rejected - Revision','PPT Revision','Resubmission',
  'Re-Grooming','Retention','Final Closure'
]);

// Build map of clientId → isRejectionPath
const clientStageMap = {};
clientList.forEach(c => {
  clientStageMap[c._id.toString()] = REJECTION_SET.has(c.stage);
});

let query = {
  isActive: true,
  client: { $in: activeClientIds },
};

    // HOD and Manager see all tasks
  if (user.role !== 'hod' && user.role !== 'manager') {
  query.$or = [
    { assignedTo: user.id },
    { assignedRole: user.role, assignedTo: null },
  ];
}

   const tasks = await Task.find(query)
  .populate('client', 'companyName stage')
  .populate('assignedTo', 'name')
  .sort({ dueDate: 1 });

// Filter out tasks from wrong path
const INTERVIEW_SUCCESS_STAGES = ['Interview', 'Completed'];
const INTERVIEW_REJECTION_STAGES = [
  'Rejected - Revision','PPT Revision','Resubmission',
  'Re-Grooming','Retention','Final Closure'
];

const filteredTasks = tasks.filter(task => {
  if (!task.client) return true;
  const isRejection = clientStageMap[task.client._id?.toString()];
  if (isRejection && INTERVIEW_SUCCESS_STAGES.includes(task.stage)) return false;
  if (!isRejection && INTERVIEW_REJECTION_STAGES.includes(task.stage)) return false;
  return true;
});
    // Auto-mark overdue
    const now = new Date();
    const updated = await Promise.all(tasks.map(async (task) => {
      if (task.status === 'Pending' && task.dueDate && task.dueDate < now) {
        task.status = 'Overdue';
        await task.save();
      }
      return task;
    }));

    // Apply path filter
const finalTasks = updated.filter(task => {
  if (!task.client) return true;
  const isRejection = clientStageMap[task.client._id?.toString()];
  if (isRejection && INTERVIEW_SUCCESS_STAGES.includes(task.stage)) return false;
  if (!isRejection && INTERVIEW_REJECTION_STAGES.includes(task.stage)) return false;
  return true;
});
res.json(finalTasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all tasks (HOD view) — only active clients
router.get('/', async (req, res) => {
  try {
    const activeClients = await Client.find({ isActive: true }).select('_id');
    const activeClientIds = activeClients.map(c => c._id);

    const tasks = await Task.find({
      isActive: true,
      client: { $in: activeClientIds },
    })
      .populate('client', 'companyName stage')
      .populate('assignedTo', 'name role')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/client/:clientId', async (req, res) => {
  try {
    const Client = require('../models/Client');
    const client = await Client.findById(req.params.clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const REJECTION_SET = new Set([
      'Rejected - Revision','PPT Revision','Resubmission',
      'Re-Grooming','Retention','Final Closure'
    ]);

    const isRejectionPath = REJECTION_SET.has(client.stage);

    // Success path — hide rejection stages tasks
    // Rejection path — hide interview success tasks
    const hiddenStages = isRejectionPath
      ? ['Interview', 'Completed']        // hide success tasks
      : ['Rejected - Revision', 'PPT Revision', 'Resubmission', 'Re-Grooming', 'Retention', 'Final Closure']; // hide rejection tasks

    const tasks = await Task.find({
      client: req.params.clientId,
      isActive: true,
      stage: { $nin: hiddenStages },
    })
      .populate('assignedTo', 'name role')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// GET task counts for notification badge
router.get('/counts/pending', async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const activeClients = await Client.find({ isActive: true }).select('_id');
    const activeClientIds = activeClients.map(c => c._id);

    let query = {
      isActive: true,
      client: { $in: activeClientIds },
      status: { $in: ['Pending', 'Overdue', 'In Progress'] },
    };

    if (user.role !== 'hod' && user.role !== 'manager') {
      query.$or = [{ assignedTo: user.id }, { assignedRole: user.role }];
    }

    const count = await Task.countDocuments(query);
    const overdue = await Task.countDocuments({ ...query, status: 'Overdue' });

    res.json({ pending: count, overdue });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT mark task as done
router.put('/:id/done', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.status = 'Done';
    task.completedAt = new Date();
    task.completedBy = req.body.completedBy || null;
    task.completedByName = req.body.completedByName || null;
    await task.save();
    res.json({ message: '✅ Task marked as done', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update task status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'Done' ? { completedAt: new Date() } : {}) },
      { new: true }
    );
    res.json({ message: '✅ Task updated', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;