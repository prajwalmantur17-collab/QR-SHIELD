import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const linkScanSchema = z.object({
  url: z.string().min(1, 'URL cannot be empty').max(2048, 'URL too long')
});

export const qrScanSchema = z.object({
  content: z.string().min(1, 'QR content cannot be empty').max(8192, 'QR content too long')
});

export const messageScanSchema = z.object({
  message: z.string().min(1, 'Message content cannot be empty').max(10000, 'Message too long')
});

export const previewSchema = z.object({
  url: z.string().min(1, 'URL cannot be empty').max(2048, 'URL too long')
});

export const reportSchema = z.object({
  target: z.string().min(1, 'Target URL or domain is required').max(2048, 'Target too long'),
  reason: z.string().max(500, 'Reason too long').optional()
});

export const aiVerdictSchema = z.object({
  verdict: z.enum(['safe', 'suspicious', 'dangerous']),
  risk_score: z.number().min(0).max(100),
  scam_category: z.string(),
  reasons: z.array(z.string()).max(5),
  recommended_action: z.string(),
  confidence: z.number().min(0).max(1)
});
