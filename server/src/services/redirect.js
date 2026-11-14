import axios from 'axios';
import { extractDomain } from '../utils/crypto.js';
import { isRestrictedIpOrHost, safeLookup } from '../utils/ssrf.js';

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

const REDIRECT_STATUSES = [301, 302, 303, 307, 308];

/**
 * Safely expands a URL following redirects up to maxHops with strict SSRF protection.
 * - Literal restricted hosts are rejected before any request is made.
 * - `lookup: safeLookup` makes the socket connect only to an IP that passed validation,
 *   so hostnames that resolve (or rebind) to private/metadata addresses are never contacted.
 */
export async function expandUrlSafely(initialUrl, maxHops = 5) {
  const hops = [initialUrl];
  let currentUrl = initialUrl;
  let isShortened = false;

  for (let hop = 0; hop < maxHops; hop++) {
    let parsed;
    try {
      parsed = new URL(currentUrl);
    } catch {
      break;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') break;
    if (isRestrictedIpOrHost(parsed.hostname)) break; // never contact restricted literals

    if (KNOWN_SHORTENERS.has(extractDomain(currentUrl))) {
      isShortened = true;
    }

    let location = null;
    try {
      const response = await axios({
        method: 'HEAD',
        url: currentUrl,
        maxRedirects: 0,
        timeout: 3000,
        lookup: safeLookup,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) QRShield-Security-Auditor/1.0'
        }
      });
      if (REDIRECT_STATUSES.includes(response.status)) location = response.headers.location;
    } catch (reqErr) {
      // With maxRedirects: 0 some axios versions surface 3xx as an error that still carries headers
      if (reqErr.response && REDIRECT_STATUSES.includes(reqErr.response.status)) {
        location = reqErr.response.headers.location;
      }
      // Network failure, timeout or SSRF block: stop following, keep the hops gathered so far
    }

    if (!location) break;

    let nextUrl;
    try {
      nextUrl = new URL(location, currentUrl).href;
    } catch {
      break;
    }
    if (hops.includes(nextUrl)) break; // redirect cycle

    hops.push(nextUrl);
    currentUrl = nextUrl;
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
