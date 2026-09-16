const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ── GET all employees
// GET /api/employees
router.get('/', async (req, res) => {
  try {
   const employees = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── CREATE employee (HOD only)
// POST /api/employees
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword, role, department });
    await user.save();

    res.status(201).json({ message: '✅ Employee created', user: { id: user._id, name: user.name, role: user.role, department: user.department } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── TOGGLE employee active/inactive
// PUT /api/employees/:id/toggle
router.put('/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `Employee ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── RESET password
// PUT /api/employees/:id/reset-password
router.put('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(req.params.id, { password: hashed });
    res.json({ message: '✅ Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id/edit', async (req, res) => {
  try {
    const { name, role, department, specialty, isActive } = req.body;
    await User.findByIdAndUpdate(req.params.id, {
      name, role, department,
      specialty: specialty || null,
      ...(isActive !== undefined && { isActive }),
    });
    res.json({ message: '✅ Employee updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST — Create client login account


// POST — Create client login account
router.post('/create-client-login', async (req, res) => {
  try {
    const { name, email, password, clientId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'client',
      department: 'Client',
      linkedClient: clientId,
    });

    await user.save();
    res.status(201).json({ message: '✅ Client login created', user: { id: user._id, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// Check if client login exists
router.get('/check-client-login/:clientId', async (req, res) => {
  try {
    const user = await User.findOne({ 
      linkedClient: req.params.clientId, 
      role: 'client' 
    });
    res.json({ exists: !!user, email: user?.email });
  } catch (err) {
    res.status(500).json({ exists: false });
  }
});


module.exports = router;