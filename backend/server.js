const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

function parseAllowedOrigins(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Fail fast in production if critical env vars are missing (never prints secret values)
if ((process.env.NODE_ENV || 'development') === 'production') {
  requireEnv([
    'MONGO_URI',
    'JWT_SECRET',
    'EMAIL_USERNAME',
    'EMAIL_PASSWORD',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'CORS_ORIGINS',
  ]);
}

// Connect to database
connectDB();

const app = express();

// Needed for correct req.ip behind proxies (Render/Vercel/etc)
if ((process.env.NODE_ENV || 'development') === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
app.use(express.json());
const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGINS);
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser clients (no Origin header)
      if (!origin) return cb(null, true);

      // In dev, allow localhost by default to avoid DX pain
      const isDev = (process.env.NODE_ENV || 'development') !== 'production';
      const devAllow = ['http://localhost:5173', 'http://127.0.0.1:5173'];
      const allowList = isDev ? [...allowedOrigins, ...devAllow] : allowedOrigins;

      if (allowList.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/public', require('./routes/public'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Basic error handler (covers CORS origin errors)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS blocked: origin not allowed' });
  }
  return res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
