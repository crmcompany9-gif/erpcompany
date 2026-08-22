const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    // Each employee has a role matching their department
    enum: ['hod', 'manager', 'accounts', 'kam', 'certification', 'retention', 'poc', 'content', 'grooming', 'it', 'legal'],
    default: 'kam',
  },
  department: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);