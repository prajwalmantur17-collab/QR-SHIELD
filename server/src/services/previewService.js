import axios from 'axios';
import dns from 'dns';
import crypto from 'crypto';
import { extractDomain } from '../utils/crypto.js';
import { isRestrictedIpOrHost, safeLookup } from '../utils/ssrf.js';

// Re-exported for backwards compatibility with existing imports
export { isRestrictedIpOrHost };

const REDIRECT_STATUSES = [301, 302, 303, 307, 308];

/**
 * Validates protocol, hostname, and resolves DNS to prevent DNS rebinding SSRF.
 * (Every outbound request below additionally uses `safeLookup`, so the address that is
 * connected to is the address that was validated.)
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

    let location = null;
    try {
      const response = await axios({
        method: 'HEAD',
        url: currentUrl,
        maxRedirects: 0,
        timeout: 4000,
        lookup: safeLookup,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) QRShield-Isolated-Auditor/1.0',
          'Accept': '*/*'
        }
      });
      if (REDIRECT_STATUSES.includes(response.status)) location = response.headers.location;
    } catch (err) {
      if (err.response && REDIRECT_STATUSES.includes(err.response.status)) {
        location = err.response.headers.location;
      }
    }

    if (!location) break; // destination reached, error, or no Location header

    const nextUrl = new URL(location, currentUrl).href;
    if (hops.includes(nextUrl)) break; // loop
    await validateTargetWithDns(nextUrl);
    hops.push(nextUrl);
    currentUrl = nextUrl;
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
 * Extracts metadata (title, favicon, description) safely without executing scripts.
 * Redirects are NOT followed here: the final URL was already resolved and validated hop by hop.
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
      maxRedirects: 0, // a redirect here would bypass the per-hop SSRF validation
      lookup: safeLookup,
      responseType: 'text',
      transformResponse: [(data) => data],
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
    // If GET fails, is redirected, or times out, continue with domain-level fallback
  }

  if (!title) {
    title = extractDomain(targetUrl);
  }

  return { title, description, favicon, ogImage };
}

/**
 * Removes credentials (user:pass@) before a URL is shared with a third-party renderer.
 */
function stripCredentials(rawUrl) {
  try {
    const u = new URL(rawUrl);
    u.username = '';
    u.password = '';
    return u.href;
  } catch {
    return rawUrl;
  }
}

/**
 * Fetches a visual snapshot from isolated third-party rendering endpoints
 * (Microlink -> thum.io -> WordPress mshots),
 * verifies it is a valid image, and returns it as a Base64 data URL.
 * PRIVACY NOTE: the destination URL (without credentials) is sent to these third-party services.
 * Strictly detects and rejects asynchronous placeholders (e.g. WordPress mshots "Generating Preview...").
 */
export async function getIsolatedSnapshotImage(targetUrl, domain) {
  const shareableUrl = stripCredentials(targetUrl);

  // 1. Try Microlink headless Chromium API (fast, reliable, handles SPAs & dashboards)
  try {
    const microUrl = `https://api.microlink.io/?url=${encodeURIComponent(shareableUrl)}&screenshot=true&meta=false`;
    const res = await axios({
      method: 'GET',
      url: microUrl,
      timeout: 5500,
      headers: { 'User-Agent': 'QRShield-PreviewBot/1.0' }
    });

    const screenshotUrl = res.data?.data?.screenshot?.url;
    if (screenshotUrl) {
      const imgRes = await axios({
        method: 'GET',
        url: screenshotUrl,
        timeout: 4500,
        responseType: 'arraybuffer',
        maxContentLength: 3 * 1024 * 1024
      });
      const contentType = imgRes.headers['content-type'] || 'image/png';
      if (imgRes.data && imgRes.data.length > 5000) {
        const base64 = Buffer.from(imgRes.data).toString('base64');
        return `data:${contentType};base64,${base64}`;
      }
    }
  } catch {
    // Microlink unavailable or timed out, fallback to thum.io
  }

  // 2. Try thum.io screenshot renderer
  try {
    const thumUrl = `https://image.thum.io/get/width/1024/crop/650/noanimate/${shareableUrl}`;
    const res = await axios({
      method: 'GET',
      url: thumUrl,
      timeout: 6500,
      responseType: 'arraybuffer',
      maxContentLength: 3 * 1024 * 1024,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) QRShield-PreviewBot/1.0' }
    });

    const contentType = res.headers['content-type'] || '';
    if (contentType.startsWith('image/') && res.data.length > 10000) {
      const base64 = Buffer.from(res.data).toString('base64');
      return `data:${contentType};base64,${base64}`;
    }
  } catch {
    // thum.io unavailable, fallback to mshots
  }

  // 3. Try WordPress mshots with strict placeholder rejection
  // Known placeholder hashes & exact sizes from WordPress mshots "Generating Preview..."
  const KNOWN_PLACEHOLDER_HASHES = new Set([
    '782825ccff8b414b6b69d649f0d20593', // 70,867 bytes "Generating Preview..."
    'e89e34619e53928489a0c703c761cd58', // 8,700 bytes
    'd41d8cd98f00b204e9800998ecf8427e'  // empty
  ]);

  const mshotsUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(shareableUrl)}?w=1024&h=650`;
  for (let attempt = 0; attempt < 2; attempt++) {
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

      const isPlaceholder = len === 70867 || len < 10000 || KNOWN_PLACEHOLDER_HASHES.has(hash);

      if (contentType.startsWith('image/') && !isPlaceholder) {
        const base64 = Buffer.from(res.data).toString('base64');
        return `data:${contentType};base64,${base64}`;
      }
    } catch {
      // Retry
    }

    if (attempt < 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // If external renderers are unreachable or target blocks bots,
  // return null so the UI cleanly renders the verified metadata card
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

  // Step 4: Fetch visual snapshot
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
