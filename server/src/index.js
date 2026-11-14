import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Fail fast in production instead of silently falling back to public, in-repo default secrets
// (a known JWT secret lets anyone forge login tokens; a known salt makes stored hashes guessable).
if (IS_PRODUCTION) {
  const missing = ['JWT_SECRET', 'HASH_SALT'].filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variable(s) in production: ${missing.join(', ')}`);
    process.exit(1);
  }
} else if (!process.env.JWT_SECRET || !process.env.HASH_SALT) {
  console.warn('WARN: JWT_SECRET / HASH_SALT not set - using insecure development defaults. Do not deploy like this.');
}

// Number of reverse proxies in front of this server (Render = 1; Vercel rewrite + Render = 2).
// Needed so rate limiting sees each visitor's real IP instead of the proxy's IP.
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS) || 1);

// Security Headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
// Exact-match allow-list. FRONTEND_URL and ALLOWED_ORIGINS accept comma-separated origins.
const splitList = (value) => (value || '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
const allowedOrigins = [
  ...splitList(FRONTEND_URL),
  ...splitList(process.env.ALLOWED_ORIGINS),
  ...(IS_PRODUCTION ? [] : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'])
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin proxy, curl, health checks) or an allow-listed origin.
    // Anything else is simply not granted CORS headers, so browsers block the response.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with 100kb limit
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  // Never leak internal error details for server faults in production
  const message = status >= 500 && IS_PRODUCTION ? 'Internal server error' : (err.message || 'Internal server error');
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString()
  });
});

// Catch uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🛡️  QR Shield Security Engine listening on 0.0.0.0:${PORT}`);
  console.log(`🔒 Privacy Engine: SHA-256 Content Hashing Active (No Raw Content Stored)`);
  console.log(`🤖 AI Engine: Google Gemini API ready (fallback: deterministic rule engine)`);
});
