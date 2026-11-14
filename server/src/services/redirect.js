import axios from 'axios';
import { extractDomain } from '../utils/crypto.js';

// Suspicious / high-risk TLD list
const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'click', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'loan',
  'racing', 'bid', 'party', 'review', 'country', 'kim', 'buzz', 'surf',
  'tokyo', 'vip', 'monster', 'rest', 'fit', 'beauty', 'hair', 'quest'
]);

// Well-known shorteners
const KNOWN_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly', 'ow.ly',
  'rebrand.ly', 'shorturl.at', 'cutt.ly', 'tiny.cc', 'bl.ink', 'rb.gy'
]);

/**
 * Checks if an IP or host is private, loopback or link-local (SSRF prevention)
 */
function isRestrictedHost(host) {
  if (!host) return true;
  const lower = host.toLowerCase().trim();

  if (
    lower === 'localhost' ||
    lower.endsWith('.localhost') ||
    lower === 'metadata.google.internal' ||
    lower.includes('169.254.169.254')
  ) {
    return true;
  }

  // IPv4 regex checks
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [_, a, b, c, d] = ipv4Match.map(Number);
    // 0.0.0.0/8
    if (a === 0) return true;
    // 127.0.0.0/8 (loopback)
    if (a === 127) return true;
    // 10.0.0.0/8 (private)
    if (a === 10) return true;
    // 172.16.0.0/12 (private)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 (private)
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 (link-local, cloud metadata)
    if (a === 169 && b === 254) return true;
    // Broadcast
    if (a === 255) return true;
  }

  // IPv6 loopback
  if (lower === '::1' || lower === '[::1]' || lower.startsWith('fe80:') || lower.startsWith('fc00:')) {
    return true;
  }

  return false;
}

/**
 * Safely expands a URL following redirects up to maxHops with strict SSRF protection.
 */
export async function expandUrlSafely(initialUrl, maxHops = 5) {
  const hops = [initialUrl];
  let currentUrl = initialUrl;
  let isShortened = false;

  try {
    for (let hop = 0; hop < maxHops; hop++) {
      let parsed;
      try {
        parsed = new URL(currentUrl);
      } catch {
        break;
      }

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        break;
      }

      const hostname = parsed.hostname;
      if (isRestrictedHost(hostname)) {
        throw new Error('SSRF Attempt Blocked: Restricted address space');
      }

      const domain = extractDomain(currentUrl);
      if (KNOWN_SHORTENERS.has(domain)) {
        isShortened = true;
      }

      try {
        const response = await axios({
          method: 'HEAD',
          url: currentUrl,
          maxRedirects: 0,
          timeout: 3000,
          validateStatus: (status) => status >= 200 && status < 400,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) QRShield-Security-Auditor/1.0'
          }
        });

        // If redirect status code
        if ([301, 302, 303, 307, 308].includes(response.status)) {
          const location = response.headers.location;
          if (!location) break;

          const nextUrl = new URL(location, currentUrl).href;
          if (hops.includes(nextUrl)) {
            // Redirect cycle detected
            break;
          }

          hops.push(nextUrl);
          currentUrl = nextUrl;
        } else {
          // Reached destination
          break;
        }
      } catch (reqErr) {
        // Axios throws on 3xx when maxRedirects is 0 if validateStatus isn't met or network error
        if (reqErr.response && [301, 302, 303, 307, 308].includes(reqErr.response.status)) {
          const location = reqErr.response.headers.location;
          if (location) {
            const nextUrl = new URL(location, currentUrl).href;
            if (!hops.includes(nextUrl)) {
              hops.push(nextUrl);
              currentUrl = nextUrl;
              continue;
            }
          }
        }
        // If HEAD fails, stop following
        break;
      }
    }
  } catch (error) {
    // If SSRF or error caught, stop and preserve whatever hops were safe
  }

  const finalUrl = hops[hops.length - 1];
  const finalDomain = extractDomain(finalUrl);
  const isHttps = finalUrl.toLowerCase().startsWith('https://');

  // Check TLD risk
  const parts = finalDomain.split('.');
  const tld = parts.length > 1 ? parts[parts.length - 1] : '';
  const tldRisk = SUSPICIOUS_TLDS.has(tld);

  return {
    initialUrl,
    finalUrl,
    finalDomain,
    hops,
    hopCount: hops.length - 1,
    isShortened,
    isHttps,
    tld,
    tldRisk
  };
}
