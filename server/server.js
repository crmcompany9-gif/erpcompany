const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-role'],
}));

// Handle preflight
app.options('*', cors());
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/clients',   require('./routes/clients'));
app.use('/api/tasks',     require('./routes/tasks'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ Elbow Grease API is running!', version: '2.0' });
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`   Routes: auth | clients | tasks | employees`);
    });
  })
  .catch((err) => {
    console.log('❌ MongoDB connection error:', err.message);
  });