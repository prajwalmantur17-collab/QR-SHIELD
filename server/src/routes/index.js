import { Router } from 'express';
import { register, login, getMe, deleteMyData } from '../controllers/authController.js';
import { scanLink, scanQR, scanMessage } from '../controllers/scanController.js';
import { reportScam } from '../controllers/reportController.js';
import { handleSafePreview } from '../controllers/previewController.js';
import { getStats, getHistory } from '../controllers/statsController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authLimiter, scanLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'QR Shield API Engine',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
router.post('/auth/register', authLimiter, register);
router.post('/auth/login', authLimiter, login);
router.get('/auth/me', authenticate, getMe);
router.delete('/me/data', authenticate, deleteMyData);

// Scanning routes (supports both guest with rate limit and authenticated)
router.post('/scan/link', optionalAuth, scanLimiter, scanLink);
router.post('/scan/qr', optionalAuth, scanLimiter, scanQR);
router.post('/scan/message', optionalAuth, scanLimiter, scanMessage);

// Isolated Safe Link Preview
router.post('/preview', optionalAuth, scanLimiter, handleSafePreview);

// Community reporting
router.post('/report', optionalAuth, reportScam);

// Dashboard & stats
router.get('/stats', optionalAuth, getStats);
router.get('/history', authenticate, getHistory);

export default router;
