import crypto from 'crypto';

const SALT = process.env.HASH_SALT || 'qrshield_default_secure_salt_2026';

/**
 * Computes salted SHA-256 hash for raw content.
 * Guarantees zero storage of raw URLs, text, or phone numbers.
 */
export function hashContent(content) {
  if (!content) return '';
  return crypto.createHmac('sha256', SALT).update(String(content).trim()).digest('hex');
}

/**
 * Extracts and normalizes the domain from a URL string.
 */
export function extractDomain(urlString) {
  try {
    let normalized = urlString.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
    const parsed = new URL(normalized);
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }
    return hostname;
  } catch {
    return '';
  }
}

/**
 * Computes salted SHA-256 hash for a normalized domain.
 */
export function hashDomain(domain) {
  if (!domain) return null;
  const cleanDomain = domain.toLowerCase().trim();
  return crypto.createHmac('sha256', SALT).update(cleanDomain).digest('hex');
}

/**
 * Masks sensitive information (phone numbers, emails, OTPs) from text
 * so that any data processed by AI or displayed in logs adheres to privacy principles.
 */
export function maskSensitiveInfo(text) {
  if (!text) return '';
  let masked = String(text);

  // Mask phone numbers (10 digits, with optional country code)
  masked = masked.replace(/(\+?\d{1,3}[-.\s]?)?(\d{2,3})[-.\s]?(\d{3,4})[-.\s]?(\d{4})/g, (match, prefix, p1, p2, p3) => {
    return `${prefix || ''}${p1}****${p3}`;
  });

  // Mask email addresses
  masked = masked.replace(/([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g, (match, user, domain) => {
    const maskedUser = user.length <= 2 ? user[0] + '*' : user.slice(0, 2) + '***' + user.slice(-1);
    return `${maskedUser}@${domain}`;
  });

  // Mask 4-8 digit OTP / PIN codes
  masked = masked.replace(/\b(\d{4,8})\b/g, (match, digits) => {
    return '***OTP***';
  });

  return masked;
}
