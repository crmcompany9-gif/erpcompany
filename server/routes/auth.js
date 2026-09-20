const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── REGISTER (only HOD can create employees)
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department,
    });

    await user.save();

    res.status(201).json({ message: '✅ Employee created successfully', user: { id: user._id, name: user.name, role: user.role } });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── LOGIN
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact HOD.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

  const token = jwt.sign(
  { id: user._id, role: user.role, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: '8h' }
);

// Record login time
const now = new Date();
const existingUser = await User.findById(user._id);

// Only reset loginAt if it's a new day or first login
const isNewDay = !existingUser.loginAt || 
  new Date(existingUser.loginAt).toDateString() !== now.toDateString();

await User.findByIdAndUpdate(user._id, {
  lastSeen: now,
  loginAt: isNewDay ? now : existingUser.loginAt,
  isOnline: true,
});

    res.json({
      message: '✅ Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET CURRENT USER (verify token)
// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});
// GET client portal data — only their own file
router.get('/client-portal', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (user.role !== 'client') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!user.linkedClient) {
      return res.status(404).json({ message: 'No client linked to this account' });
    }

    const Client = require('../models/Client');
    const client = await Client.findById(user.linkedClient)
      .populate('updates.updatedBy', 'name')
      .populate('communications.loggedBy', 'name');

    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Only send safe data to client
    res.json({
      companyName: client.companyName,
      contactPerson: client.contactPerson,
      scheme: client.scheme,
      stage: client.stage,
      slaStatus: client.slaStatus,
      createdAt: client.createdAt,
      addedByName: client.addedByName,
      updates: client.updates.map(u => ({
        department: u.department,
        note: u.note,
        stageChanged: u.stageChanged,
        updatedByName: u.updatedByName,
        fileUrl: u.fileUrl,
        fileName: u.fileName,
        createdAt: u.createdAt,
      })),
      communications: client.communications.map(c => ({
        type: c.type,
        note: c.note,
        loggedByName: c.loggedByName,
        createdAt: c.createdAt,
      })),
      documents: client.documents.map(d => ({
        name: d.name,
        type: d.type,
        url: d.url,
        uploadedByName: d.uploadedByName,
        uploadedAt: d.uploadedAt,
        status: d.status,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Heartbeat — called every 5 mins from frontend
router.post('/heartbeat', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await User.findByIdAndUpdate(decoded.id, {
      lastSeen: new Date(),
      isOnline: true,
    });

    res.json({ ok: true });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout — record logout time
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ ok: true });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await User.findByIdAndUpdate(decoded.id, {
      isOnline: false,
      lastSeen: new Date(),
    });

    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

module.exports = router;