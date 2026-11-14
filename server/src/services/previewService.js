import axios from 'axios';
import dns from 'dns';
import crypto from 'crypto';
import { extractDomain } from '../utils/crypto.js';

// Suspicious / high-risk TLDs
const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'click', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'loan',
  'racing', 'bid', 'party', 'review', 'country', 'kim', 'buzz', 'surf',
  'tokyo', 'vip', 'monster', 'rest', 'fit', 'beauty', 'hair', 'quest'
]);

/**
 * Checks if an IP or host is private, loopback, link-local, or cloud metadata
 */
export function isRestrictedIpOrHost(target) {
  if (!target) return true;
  const lower = target.toLowerCase().trim();

  // Hostname string checks
  if (
    lower === 'localhost' ||
    lower.endsWith('.localhost') ||
    lower === 'metadata.google.internal' ||
    lower.includes('metadata.internal') ||
    lower.includes('169.254.169.254')
  ) {
    return true;
  }

  // IPv4 validation
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [_, a, b, c, d] = ipv4Match.map(Number);
    if (a < 0 || a > 255 || b < 0 || b > 255 || c < 0 || c > 255 || d < 0 || d > 255) return true;
    if (a === 0) return true;                           // 0.0.0.0/8
    if (a === 127) return true;                         // 127.0.0.0/8 (loopback)
    if (a === 10) return true;                          // 10.0.0.0/8 (private)
    if (a === 172 && b >= 16 && b <= 31) return true;   // 172.16.0.0/12 (private)
    if (a === 192 && b === 168) return true;           // 192.168.0.0/16 (private)
    if (a === 169 && b === 254) return true;           // 169.254.0.0/16 (link-local, cloud metadata)
    if (a >= 224 && a <= 239) return true;             // 224.0.0.0/4 (multicast)
    if (a === 255) return true;                         // broadcast
  }

  // IPv6 validation
  if (
    lower === '::1' ||
    lower === '[::1]' ||
    lower.startsWith('fe80:') ||
    lower.startsWith('fc00:') ||
    lower.startsWith('fd00:')
  ) {
    return true;
  }

  return false;
}

/**
 * Validates protocol, hostname, and resolves DNS to prevent DNS rebinding SSRF
 */
export async function validateTargetWithDns(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (err) {
    throw new Error('Malformed URL provided');
  }

  // Protocol check: only http and https allowed
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Forbidden protocol: ${parsed.protocol}. Only http: and https: are permitted.`);
  }

  const hostname = parsed.hostname;
  if (isRestrictedIpOrHost(hostname)) {
    throw new Error('Access to restricted host or private IP space is blocked.');
  }

  // Resolve DNS to verify actual IP address
  try {
    const lookupResult = await dns.promises.lookup(hostname, { all: true });
    for (const record of lookupResult) {
      if (isRestrictedIpOrHost(record.address)) {
        throw new Error(`SSRF blocked: Domain resolves to restricted IP ${record.address}`);
      }
    }
  } catch (dnsErr) {
    if (dnsErr.message.includes('SSRF blocked')) throw dnsErr;
    // If DNS resolution fails, domain doesn't exist
    throw new Error(`DNS resolution failed for ${hostname}: Domain not reachable.`);
  }

  return parsed;
}

/**
 * Follows redirect chain safely, performing DNS SSRF checks on every hop
 */
export async function expandWithStrictSsrf(initialUrl, maxHops = 5) {
  const hops = [initialUrl];
  let currentUrl = initialUrl;

  for (let hop = 0; hop < maxHops; hop++) {
    await validateTargetWithDns(currentUrl);

    try {
      const response = await axios({
        method: 'HEAD',
        url: currentUrl,
        maxRedirects: 0,
        timeout: 4000,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) QRShield-Isolated-Auditor/1.0',
          'Accept': '*/*'
        }
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.location;
        if (!location) break;
        const nextUrl = new URL(location, currentUrl).href;
        if (hops.includes(nextUrl)) break; // Loop
        await validateTargetWithDns(nextUrl);
        hops.push(nextUrl);
        currentUrl = nextUrl;
      } else {
        break; // Destination reached
      }
    } catch (err) {
      if (err.response && [301, 302, 303, 307, 308].includes(err.response.status)) {
        const location = err.response.headers.location;
        if (location) {
          const nextUrl = new URL(location, currentUrl).href;
          if (!hops.includes(nextUrl)) {
            await validateTargetWithDns(nextUrl);
            hops.push(nextUrl);
            currentUrl = nextUrl;
            continue;
          }
        }
      }
      break;
    }
  }

  const finalUrl = hops[hops.length - 1];
  const finalDomain = extractDomain(finalUrl);

  return {
    initialUrl,
    finalUrl,
    finalDomain,
    hops,
    hopCount: hops.length - 1
  };
}

/**
 * Extracts metadata (title, favicon, description) safely without executing scripts
 */
export async function fetchSafeMetadata(targetUrl) {
  await validateTargetWithDns(targetUrl);

  let title = '';
  let description = '';
  let favicon = '';
  let ogImage = '';

  try {
    const res = await axios({
      method: 'GET',
      url: targetUrl,
      timeout: 4000,
      maxContentLength: 512 * 1024, // 512 KB limit to prevent response bombs
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) QRShield-PreviewBot/1.0',
        'Accept': 'text/html,application/xhtml+xml',
        'Cache-Control': 'no-cache'
      }
    });

    const html = typeof res.data === 'string' ? res.data : '';

    // Title regex
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 150);
    }

    // Meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) ||
                      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].trim().slice(0, 250);
    }

    // Favicon
    const iconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']*)["']/i);
    if (iconMatch && iconMatch[1]) {
      try {
        favicon = new URL(iconMatch[1], targetUrl).href;
      } catch {}
    }
    if (!favicon) {
      try {
        favicon = new URL('/favicon.ico', targetUrl).href;
      } catch {}
    }

    // OpenGraph image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);
    if (ogMatch && ogMatch[1]) {
      try {
        ogImage = new URL(ogMatch[1], targetUrl).href;
      } catch {}
    }
  } catch (fetchErr) {
    // If GET fails or times out, continue with domain-level fallback
  }

  if (!title) {
    title = extractDomain(targetUrl);
  }

  return { title, description, favicon, ogImage };
}

/**
 * Fetches an isolated visual snapshot from a dedicated rendering endpoint,
 * verifies it is a valid image, and returns it as a Base64 data URL.
 * Automatically detects and bypasses asynchronous placeholders (e.g. WordPress mshots).
 */
export async function getIsolatedSnapshotImage(targetUrl, domain) {
  // 1. Try thum.io isolated screenshot renderer
  try {
    const thumUrl = `https://image.thum.io/get/width/1024/crop/650/noanimate/${targetUrl}`;
    const res = await axios({
      method: 'GET',
      url: thumUrl,
      timeout: 3500,
      responseType: 'arraybuffer',
      maxContentLength: 3 * 1024 * 1024
    });

    const contentType = res.headers['content-type'] || '';
    if (contentType.startsWith('image/') && res.data.length > 10000) {
      const base64 = Buffer.from(res.data).toString('base64');
      return `data:${contentType};base64,${base64}`;
    }
  } catch {
    // thum.io unavailable, fallback to mshots
  }

  // 2. Try WordPress mshots with polling retry to bypass async placeholder
  const mshotsUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(targetUrl)}?w=1024&h=650`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await axios({
        method: 'GET',
        url: mshotsUrl,
        timeout: 4500,
        responseType: 'arraybuffer',
        maxContentLength: 3 * 1024 * 1024
      });

      const contentType = res.headers['content-type'] || '';
      const len = res.data.length;
      const hash = crypto.createHash('md5').update(res.data).digest('hex');
      // WordPress mshots placeholder image is ~8.7KB with hash e89e34619e53928489a0c703c761cd58
      const isPlaceholder = len < 10000 || hash === 'e89e34619e53928489a0c703c761cd58';

      if (contentType.startsWith('image/') && !isPlaceholder) {
        const base64 = Buffer.from(res.data).toString('base64');
        return `data:${contentType};base64,${base64}`;
      }
    } catch {
      // Retry
    }

    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 1800));
    }
  }

  // If external renderers are unreachable or target blocks bots,
  // return null so the UI renders the verified metadata card
  return null;
}

/**
 * Generates full safe link preview
 */
export async function generateSafePreview(url) {
  let normalizedUrl = (url || '').trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  const previewId = `prev_${crypto.randomBytes(8).toString('hex')}`;

  // Step 1: Strict SSRF & DNS validation
  await validateTargetWithDns(normalizedUrl);

  // Step 2: Expand redirects safely with per-hop DNS checks
  const redirectInfo = await expandWithStrictSsrf(normalizedUrl, 5);
  const finalUrl = redirectInfo.finalUrl;
  const domain = redirectInfo.finalDomain;

  // Step 3: Fetch safe metadata (Title, Favicon, Description)
  const metadata = await fetchSafeMetadata(finalUrl);

  // Step 4: Fetch isolated screenshot snapshot
  const screenshot = await getIsolatedSnapshotImage(finalUrl, domain);

  return {
    success: true,
    previewId,
    initialUrl: url,
    finalUrl,
    domain,
    title: metadata.title,
    description: metadata.description,
    favicon: metadata.favicon,
    screenshot, // Base64 data URI or null
    hops: redirectInfo.hops,
    hopCount: redirectInfo.hopCount,
    isHttps: finalUrl.toLowerCase().startsWith('https://'),
    status: 'completed',
    securityWarning: 'This is an isolated visual preview. It does not guarantee that the website is safe.',
    isolatedAt: new Date().toISOString()
  };
}
