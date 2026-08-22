const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  // Basic Info
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  gst: { type: String },
  leadSource: {
    type: String,
    enum: ['Direct Enquiry', 'Referral', 'WhatsApp', 'Website', 'Social Media'],
    default: 'Direct Enquiry',
  },

  // Scheme Details
  scheme: {
    type: String,
    enum: [
      'Seed Funding 20L',
      'Seed Funding 50L',
      'Nidhi Seed Support',
      'MSME Innovation',
      'State Grant',
      'DPIIT Recognition',
      'Startup India Registration',
    ],
    required: true,
  },

  // Current Stage in Pipeline
stage: {
  type: String,
  enum: [
    'Accounts & MOU',
    'Certification',
    'Content & PPT',
    'File Submission',
    'Interview',
    'Rejected - Revision',
    'Re-Grooming',
    'PPT Revision',
    'Resubmission',
    'Retention',
    'Final Closure',
    'Completed',
  ],
  default: 'Accounts & MOU',
},

  // Assigned Team Members
  assignedkam: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedPOC: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // SLA Tracking
  stageStartedAt: { type: Date, default: Date.now },
  slaDeadline: { type: Date },
  slaStatus: {
    type: String,
    enum: ['On Track', 'At Risk', 'Breached'],
    default: 'On Track',
  },

  // Notes and Updates
  notes: { type: String },

updates: [
  {
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedByName: { type: String },
    department: { type: String },
    note: { type: String },
    stageChanged: { type: String },
    createdAt: { type: Date, default: Date.now },
    fileUrl: { type: String },    // ← ADD THIS
fileName: { type: String },   // ← ADD THIS
  },
],

  // Documents
 documents: [
  {
    name: { type: String },
    type: { type: String },
    url: { type: String },        // ← ADD THIS
    publicId: { type: String },   // ← ADD THIS
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedByName: { type: String }, // ← ADD THIS
    status: { type: String, enum: ['Pending','Uploaded','Signed','Sent'], default: 'Uploaded' },
    uploadedAt: { type: Date, default: Date.now },
  },
],

  // Communication Log
communications: [
  {
    type: { type: String, enum: ['WhatsApp', 'Call', 'Email', 'Meeting'] },
    note: { type: String },
    loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    loggedByName: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
],
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
addedByName: { type: String },

  isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);