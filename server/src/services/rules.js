import { extractDomain, hashDomain } from '../utils/crypto.js';
import { db } from '../db/index.js';
import { parseUPI, analyzeUPI } from './upi.js';

// Top brands frequently targeted by phishing
const PROTECTED_BRANDS = [
  'google', 'paytm', 'phonepe', 'sbi', 'onlinesbi', 'hdfc', 'hdfcbank',
  'icici', 'icicibank', 'amazon', 'flipkart', 'irctc', 'netflix', 'paypal',
  'apple', 'microsoft', 'axisbank', 'punjabnationalbank', 'canarabank',
  'kotak', 'incometax', 'uidai', 'whatsapp', 'telegram', 'facebook', 'instagram'
];

// Suspicious TLDs
const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'click', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'loan',
  'racing', 'bid', 'party', 'review', 'country', 'kim', 'buzz', 'surf',
  'monster', 'rest', 'fit', 'quest'
]);

// URL Shorteners
const SHORTENER_DOMAINS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly', 'ow.ly',
  'rebrand.ly', 'shorturl.at', 'cutt.ly', 'tiny.cc', 'bl.ink', 'rb.gy'
]);

/**
 * Levenshtein distance algorithm for detecting typosquatting / lookalike domains
 */
function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Checks for typosquatting / brand spoofing against protected brands
 */
function checkBrandImpersonation(domain) {
  if (!domain) return null;
  const domainParts = domain.split('.');
  const sld = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : domainParts[0];

  for (const brand of PROTECTED_BRANDS) {
    // If it literally is the official brand domain, skip
    if (domain === `${brand}.com` || domain === `${brand}.co.in` || domain === `${brand}.org` || domain === `${brand}.in` || domain.endsWith(`.${brand}.com`) || domain.endsWith(`.${brand}.co.in`)) {
      continue;
    }

    // 1. Brand embedded inside another domain (e.g. sbi-verification-update.com, paytm-refund.xyz)
    if (domain.includes(brand) && !domain.endsWith(`.${brand}.com`)) {
      return {
        brand,
        type: 'embedded',
        evidence: `Domain "${domain}" includes official brand name "${brand}" inside an unauthorized domain.`
      };
    }

    // 2. Levenshtein typosquatting (e.g. paytmm, gooogle, hdfcbannk)
    const dist = levenshteinDistance(sld, brand);
    if (dist > 0 && dist <= 2 && Math.abs(sld.length - brand.length) <= 2) {
      return {
        brand,
        type: 'typosquat',
        evidence: `Domain SLD "${sld}" is dangerously close to known brand "${brand}" (Levenshtein distance ${dist}). Possible typosquatting.`
      };
    }
  }

  return null;
}

/**
 * Analyzes URL patterns deterministically
 */
export async function evaluateUrlRules(url, redirectInfo = null) {
  const signals = [];
  let score = 0;

  if (!url) return { signals, score };

  const parsedDomain = extractDomain(url);
  const domainHash = hashDomain(parsedDomain);

  // 1. Community Blacklist check
  if (domainHash) {
    const report = await db.getCommunityReport(domainHash);
    if (report && report.report_count > 0) {
      signals.push({
        id: 'rule_community_blacklist',
        source: 'rule',
        label: 'Community Reported Threat',
        weight: 60,
        detail: `This domain has been flagged and reported by ${report.report_count} user(s) in the community scam blacklist.`
      });
      score += 60;
    }
  }

  // 2. IP address instead of domain
  if (/^https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d+)?/i.test(url) || /^(\d{1,3}\.){3}\d{1,3}$/.test(parsedDomain)) {
    signals.push({
      id: 'rule_raw_ip_address',
      source: 'rule',
      label: 'Raw IP Address Host',
      weight: 45,
      detail: 'The URL uses a raw IP address instead of a registered domain name. Legitimate services virtually never use raw IP URLs.'
    });
    score += 45;
  }

  // 3. Punycode / Homograph attack
  if (url.includes('xn--') || /[^\u0000-\u007F]/.test(parsedDomain)) {
    signals.push({
      id: 'rule_punycode_homograph',
      source: 'rule',
      label: 'Punycode / Homograph Attack',
      weight: 50,
      detail: 'URL contains punycode or Cyrillic/non-ASCII homoglyph characters used to visually fake trusted domain names.'
    });
    score += 50;
  }

  // 4. Brand Lookalike / Typosquatting
  const brandCheck = checkBrandImpersonation(parsedDomain);
  if (brandCheck) {
    signals.push({
      id: 'rule_brand_impersonation',
      source: 'rule',
      label: `Brand Impersonation (${brandCheck.brand.toUpperCase()})`,
      weight: 50,
      detail: brandCheck.evidence
    });
    score += 50;
  }

  // 5. Suspicious TLD
  const parts = parsedDomain.split('.');
  const tld = parts.length > 1 ? parts[parts.length - 1] : '';
  if (SUSPICIOUS_TLDS.has(tld)) {
    signals.push({
      id: 'rule_suspicious_tld',
      source: 'rule',
      label: `High-Risk TLD (.${tld})`,
      weight: 30,
      detail: `The top-level domain .${tld} is frequently associated with disposable phishing campaigns and malware distribution.`
    });
    score += 30;
  }

  // 6. No HTTPS
  if (url.startsWith('http://')) {
    signals.push({
      id: 'rule_no_https',
      source: 'rule',
      label: 'Insecure Connection (HTTP)',
      weight: 20,
      detail: 'Website does not enforce TLS encryption (HTTPS). Any submitted passwords or payment information can be intercepted.'
    });
    score += 20;
  }

  // 7. URL Obfuscation: @ symbol (HTTP UserInfo trick)
  if (url.includes('@')) {
    signals.push({
      id: 'rule_at_symbol_deception',
      source: 'rule',
      label: 'Credential / @ Symbol Obfuscation',
      weight: 45,
      detail: 'URL contains an "@" symbol. Browsers treat text before "@" as username/password and actually navigate to what comes after.'
    });
    score += 45;
  }

  // 8. Too many subdomains or excessive hyphens
  const subdomains = parsedDomain.split('.');
  if (subdomains.length > 4) {
    signals.push({
      id: 'rule_deep_subdomains',
      source: 'rule',
      label: 'Excessive Subdomains',
      weight: 20,
      detail: `Domain has ${subdomains.length} subdomain levels, commonly used to hide the actual landing domain.`
    });
    score += 20;
  }

  const hyphenCount = (parsedDomain.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    signals.push({
      id: 'rule_excessive_hyphens',
      source: 'rule',
      label: 'Excessive Domain Hyphens',
      weight: 20,
      detail: `Domain contains ${hyphenCount} hyphens, a standard tactic used in fraudulent landing page domains.`
    });
    score += 20;
  }

  // 9. Phishing Keywords in path or domain
  const suspiciousKeywords = [
    'login', 'verify', 'kyc', 'update', 'secure', 'reward', 'claim',
    'free-gift', 'authenticate', 'banking', 'unblock', 'account-hold',
    'pan-card', 'aadhaar-link', 'lottery'
  ];
  const lowerUrl = url.toLowerCase();
  const matchedKeywords = suspiciousKeywords.filter(kw => lowerUrl.includes(kw));
  if (matchedKeywords.length > 0) {
    // If not a recognized legitimate site
    if (!['google.com', 'microsoft.com', 'apple.com', 'github.com'].some(trusted => parsedDomain.endsWith(trusted))) {
      signals.push({
        id: 'rule_phishing_keywords',
        source: 'rule',
        label: 'Sensitive Action Keywords',
        weight: 25,
        detail: `URL path contains keywords commonly targeted by credential harvesters: [${matchedKeywords.join(', ')}].`
      });
      score += 25;
    }
  }

  // 10. URL Shortener check
  if (SHORTENER_DOMAINS.has(parsedDomain) || (redirectInfo && redirectInfo.isShortened)) {
    signals.push({
      id: 'rule_url_shortener',
      source: 'rule',
      label: 'Obfuscated Shortened Link',
      weight: 25,
      detail: 'URL uses a shortening service that obscures the real destination website.'
    });
    score += 25;
  }

  // 11. Long Redirect Chain
  if (redirectInfo && redirectInfo.hopCount > 2) {
    signals.push({
      id: 'rule_deep_redirects',
      source: 'rule',
      label: 'Multi-Hop Redirect Chain',
      weight: 30,
      detail: `URL bounced through ${redirectInfo.hopCount} redirect hops, typical of cloaking techniques.`
    });
    score += 30;
  }

  return {
    signals,
    score: Math.min(score, 100),
    domainHash,
    parsedDomain
  };
}

/**
 * Analyzes Message text patterns (WhatsApp, SMS, Email, Telegram)
 */
export function evaluateMessageRules(messageText) {
  const signals = [];
  let score = 0;

  if (!messageText || typeof messageText !== 'string') {
    return { signals, score };
  }

  const text = messageText.toLowerCase();

  // 1. Critical: OTP / PIN Theft Pattern
  const otpPatterns = [
    /share\s+otp/i,
    /send\s+(?:the\s+)?otp/i,
    /enter\s+(?:your\s+)?pin\s+to\s+receive/i,
    /provide\s+(?:the\s+)?(?:6|4)[\s-]digit\s+code/i,
    /tell\s+me\s+(?:the\s+)?otp/i,
    /forward\s+this\s+sms/i
  ];
  if (otpPatterns.some(p => p.test(text))) {
    signals.push({
      id: 'msg_otp_pin_request',
      source: 'rule',
      label: 'Critical: OTP / PIN Request Detected',
      weight: 60,
      detail: 'Message attempts to solicit an OTP or PIN. Legitimate banks and entities NEVER ask you to reveal an OTP.'
    });
    score += 60;
  }

  // 2. High Urgency & Threats
  const urgencyPatterns = [
    /within\s+(?:24|12|2|1)\s*hours?/i,
    /account\s+(?:will\s+be\s+)?(?:blocked|suspended|deactivated|closed)/i,
    /electricity\s+(?:power\s+)?will\s+be\s+disconnected\s+tonight/i,
    /sim\s+card\s+will\s+be\s+deactivated/i,
    /immediate\s+action\s+required/i,
    /urgent\s+notice/i,
    /penalty\s+of\s+rs/i
  ];
  if (urgencyPatterns.some(p => p.test(text))) {
    signals.push({
      id: 'msg_artificial_urgency',
      source: 'rule',
      label: 'High Urgency / Coercive Threat',
      weight: 40,
      detail: 'Message creates artificial urgency or threatens immediate disconnection/suspension to bypass your rational judgment.'
    });
    score += 40;
  }

  // 3. Fake KYC / Bank / Government Impersonation
  const kycPatterns = [
    /kyc\s+(?:verification|update|expired|mandatory)/i,
    /pan\s+card\s+(?:not\s+updated|blocked|linked)/i,
    /aadhaar\s+(?:link|verify|update)/i,
    /dear\s+customer\s+your\s+(?:sbi|hdfc|icici|pnb|bank)\s+account/i,
    /income\s+tax\s+refund\s+approved/i
  ];
  if (kycPatterns.some(p => p.test(text))) {
    signals.push({
      id: 'msg_fake_kyc_bank',
      source: 'rule',
      label: 'Fake KYC / Bank Impersonation',
      weight: 45,
      detail: 'Message impersonates bank or tax authorities requesting urgent KYC updates or claiming frozen accounts.'
    });
    score += 45;
  }

  // 4. Remote Access App Trap
  const remoteTools = ['anydesk', 'teamviewer', 'quicksupport', 'rustdesk', 'ultraviewer', 'screen share'];
  const hasRemoteTool = remoteTools.some(tool => text.includes(tool));
  if (hasRemoteTool) {
    signals.push({
      id: 'msg_remote_access_app',
      source: 'rule',
      label: 'Remote Access Tool Solicitation',
      weight: 55,
      detail: 'Message instructs you to install screen-sharing tools (e.g. AnyDesk, TeamViewer). Fraudsters use these to empty bank accounts.'
    });
    score += 55;
  }

  // 5. Fake Lottery / Cashback / Crypto / Easy Money
  const lotteryPatterns = [
    /congratulations\s+you\s+won/i,
    /kbc\s+(?:lottery|jackpot)/i,
    /won\s+rs\.?\s*\d+/i,
    /cashback\s+of\s+rs/i,
    /work\s+from\s+home\s+(?:earn|part\s*time)/i,
    /earn\s+(?:rs\.?|₹)\s*\d+\s*(?:daily|per\s+day)/i,
    /like\s+(?:youtube\s+)?videos\s+and\s+earn/i,
    /free\s+recharge/i
  ];
  if (lotteryPatterns.some(p => p.test(text))) {
    signals.push({
      id: 'msg_lottery_job_bait',
      source: 'rule',
      label: 'Lottery / Job Offer / Cashback Bait',
      weight: 40,
      detail: 'Message promises unrealistic financial rewards, lottery winnings, or high-paying tasks (e.g., YouTube liking tasks).'
    });
    score += 40;
  }

  // 6. Digital Arrest / Law Enforcement Impersonation
  const threatPatterns = [
    /digital\s+arrest/i,
    /customs\s+(?:parcel|seized|illegal\s+items)/i,
    /narcotics\s+control\s+bureau/i,
    /cbi\s+(?:fir|investigation|officer)/i,
    /police\s+(?:warrant|complaint|notice)/i,
    /court\s+summons/i
  ];
  if (threatPatterns.some(p => p.test(text))) {
    signals.push({
      id: 'msg_digital_arrest_threat',
      source: 'rule',
      label: 'Law Enforcement / Digital Arrest Scam',
      weight: 60,
      detail: 'Message uses fear tactics impersonating police/customs/CBI. Authorities never issue arrests or demand payments over messages.'
    });
    score += 60;
  }

  // 7. Presence of Links + Urgency Combination
  const urlRegex = /(https?:\/\/[^\s]+|bit\.ly\/[^\s]+|t\.co\/[^\s]+|tinyurl\.com\/[^\s]+)/gi;
  const urlsFound = messageText.match(urlRegex) || [];
  if (urlsFound.length > 0 && (score >= 30)) {
    signals.push({
      id: 'msg_suspicious_link_payload',
      source: 'rule',
      label: 'Urgent Action Linked to External URL',
      weight: 25,
      detail: `Message combines urgency/pressure with embedded link(s): ${urlsFound.slice(0, 2).join(', ')}`
    });
    score += 25;
  }

  return {
    signals,
    score: Math.min(score, 100),
    urlsFound
  };
}
