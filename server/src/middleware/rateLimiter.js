import rateLimit from 'express-rate-limit';

// Auth endpoints rate limiter: 10 requests per 15 mins
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Community report limiter: stops anonymous spam from poisoning the shared scam blacklist
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: (req) => (req.user ? 30 : 5),
  keyGenerator: (req) => (req.user && req.user.id ? `user_${req.user.id}` : req.ip || 'guest_client'),
  message: {
    error: 'Too many reports submitted. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Dedicated Voice announcement limiter: generous 120 per 15 mins (mostly cached in memory anyway)
export const voiceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  keyGenerator: (req) => (req.user && req.user.id ? `voice_user_${req.user.id}` : `voice_${req.ip || 'guest'}`),
  message: {
    error: 'Voice announcement rate limit reached. Please try again in a few minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Scan limiter: 5 scans / day for guests, 60 / hour for logged-in users (generous in development)
export const scanLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: (req) => {
    // If authenticated user, grant 60 per hour (or up to 1440/day)
    if (req.user) {
      return 1440;
    }
    // In local development, allow generous quota so testing is never blocked
    if (process.env.NODE_ENV === 'development') {
      return 500;
    }
    // Guest limit: 5 scans per day
    return 5;
  },
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return `user_${req.user.id}`;
    }
    // Guest IP fallback
    return req.ip || req.headers['x-forwarded-for'] || 'guest_client';
  },
  message: {
    error: 'Daily guest scan limit reached (5 scans/day). Please sign up for a free account to unlock higher scan limits!'
  },
  standardHeaders: true,
  legacyHeaders: false
});
