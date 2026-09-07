const express = require('express');
const Notice  = require('../models/Notice');

const router = express.Router();

// GET /api/notices — all notices
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).limit(20);
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notices — manager / hod only
router.post('/', async (req, res) => {
  const { title, message, type, postedByName, userRole } = req.body;
  const allowed = ['manager', 'hod'];
  if (userRole && !allowed.includes(userRole)) {
    return res.status(403).json({ message: 'Only manager or HOD can post notices' });
  }
  try {
    const notice = await Notice.create({ title, message, type: type || 'general', postedByName });
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/notices/:id
router.delete('/:id', async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
