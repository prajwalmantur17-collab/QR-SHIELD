import dns from 'dns';
import net from 'net';

/**
 * Shared SSRF guard used by the redirect follower and the safe-preview service.
 * - Blocks loopback, private, link-local, CGNAT, multicast, reserved and cloud-metadata ranges
 * - Handles IPv6 (loopback, ULA, link-local) and IPv4-mapped IPv6 (::ffff:a.b.c.d)
 * - `safeLookup` is passed to axios so the IP that is CONNECTED to is the IP that was VALIDATED
 *   (closes the DNS-rebinding window between a pre-check and the real request).
 */

function isRestrictedIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // private
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64.0.0/10
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 0) return true; // 192.0.0.0/24 + 192.0.2.0/24 (reserved/test)
  if (a === 192 && b === 168) return true; // private
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true; // multicast + reserved + broadcast
  return false;
}

function isRestrictedIPv6(ip) {
  const lower = ip.toLowerCase().replace(/^\[|\]$/g, '').split('%')[0];
  if (lower === '::' || lower === '::1') return true;

  // IPv4-mapped (::ffff:127.0.0.1 or ::ffff:7f00:1)
  const dotted = lower.match(/^(?:0{0,4}:){0,5}:?ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (dotted) return isRestrictedIPv4(dotted[1]);
  const hex = lower.match(/^(?:0{0,4}:){0,5}:?ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return isRestrictedIPv4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }

  const first = parseInt(lower.split(':')[0] || '0', 16);
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique-local
  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((first & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  return false;
}

/** True when the given IP literal or hostname must never be contacted. */
export function isRestrictedIpOrHost(target) {
  if (!target) return true;
  const lower = String(target).toLowerCase().trim().replace(/\.$/, '');
  if (!lower) return true;

  if (
    lower === 'localhost' ||
    lower.endsWith('.localhost') ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower === 'metadata.google.internal'
  ) {
    return true;
  }

  const bare = lower.replace(/^\[|\]$/g, '');
  const family = net.isIP(bare);
  if (family === 4) return isRestrictedIPv4(bare);
  if (family === 6) return isRestrictedIPv6(bare);
  return false;
}

/**
 * Drop-in `lookup` for http(s) agents / axios: resolves the host and refuses to
 * connect when ANY resolved address is in a restricted range.
 */
export function safeLookup(hostname, options, callback) {
  const opts = typeof options === 'function' ? {} : options || {};
  const cb = typeof options === 'function' ? options : callback;

  dns.lookup(hostname, { ...opts, all: true }, (err, addresses) => {
    if (err) return cb(err);
    const list = Array.isArray(addresses) ? addresses : [{ address: addresses, family: 4 }];
    for (const rec of list) {
      if (isRestrictedIpOrHost(rec.address)) {
        const blocked = new Error(`SSRF blocked: ${hostname} resolves to restricted address ${rec.address}`);
        blocked.code = 'ESSRF';
        return cb(blocked);
      }
    }
    if (opts.all) return cb(null, list);
    return cb(null, list[0].address, list[0].family);
  });
}
