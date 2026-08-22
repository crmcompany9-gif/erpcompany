const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  // What task is this
  title: { type: String, required: true },
  description: { type: String },

  // Which client this task belongs to
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clientName: { type: String }, // denormalized for quick display

  // Who it's assigned to
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedRole: { type: String }, // role name e.g. 'kam', 'accounts'
  department: { type: String },

  // Task details
  stage: { type: String }, // which client stage triggered this task
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Done', 'Overdue'],
    default: 'Pending',
  },

  // SLA deadline for this task
  dueDate: { type: Date },
  completedAt: { type: Date },

  // Who created it
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
addedByName: { type: String },

  isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);