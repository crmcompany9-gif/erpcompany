const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const dns = require("node:dns");
const { runRiskDetection } = require('./utils/riskDetector');
const User = require('./models/User');

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);
dotenv.config();

const app = express();
app.set('trust proxy', 1);

// ── SECURITY ─────────────────────────────────────

// Helmet — sets secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://erpcompany.onrender.com"],
    },
  },
  xFrameOptions: { action: 'SAMEORIGIN' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: false,
}));

// Permissions Policy
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  next();
});

// Rate limit — max 100 requests per 15 mins per IP
// Rate limit — max 500 requests per 15 mins per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: '❌ Too many requests. Try again in 15 minutes.' },
  skip: (req) => req.path === '/',
});
app.use(globalLimiter);

// Login rate limit — max 20 attempts per 15 mins per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: '❌ Too many login attempts. Try again in 15 minutes.' }
});
app.use('/api/auth/login', loginLimiter);

// Middleware

const allowedOrigins = [
  'http://localhost:3000', 
  'https://erpcompany.onrender.com',
  'https://erpportal-lqux.onrender.com',
];
app.options('*', cors());
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
app.use('/api/upload',    require('./routes/upload'));
app.use('/api/notices',   require('./routes/notices'));

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

  // Auto mark offline — runs every 5 minutes
setInterval(async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    await User.updateMany(
      { isOnline: true, lastSeen: { $lt: tenMinutesAgo } },
      { isOnline: false }
    );
  } catch (err) {
    console.error('Auto offline error:', err.message);
  }
}, 5 * 60 * 1000);
console.log('👁 Employee presence tracking active');

  // Run risk detection every day at 8am
const scheduleRiskDetection = () => {
  const msUntil8am = () => {
    const now = new Date();
    const next = new Date();
    next.setHours(8, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next - now;
  };
  setTimeout(() => {
    runRiskDetection();
    setInterval(runRiskDetection, 24 * 60 * 60 * 1000);
  }, msUntil8am());
  console.log('🔍 AI Risk Detector scheduled for every day at 8am');
};
scheduleRiskDetection();

  // Keep alive — prevents Render free tier from sleeping
const https = require('https');
setInterval(() => {
  https.get('https://erpcompany.onrender.com/', () => {
    console.log('✅ Keep alive ping');
  }).on('error', () => {});
}, 14 * 60 * 1000);