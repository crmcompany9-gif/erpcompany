const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require("node:dns");

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://erp-b4qn.onrender.com',
  'https://erp-api-6fxu.onrender.com',
  'https://erp-portal-nk0s.onrender.com',
  'https://salestrack-server.onrender.com',
  'https://salestrack-client.onrender.com',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('CORS blocked:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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