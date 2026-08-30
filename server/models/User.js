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
enum: ['hod','manager','accounts','kam','certification','retention','poc','content','grooming','it','legal','client'],
  default: 'kam',
},
// Add this field — links client user to their client record
linkedClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  department: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);