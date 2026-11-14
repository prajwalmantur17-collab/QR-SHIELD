import { linkScanSchema, qrScanSchema, messageScanSchema } from '../schemas/index.js';
import { hashContent, hashDomain, extractDomain, maskSensitiveInfo } from '../utils/crypto.js';
import { expandUrlSafely } from '../services/redirect.js';
import { evaluateUrlRules, evaluateMessageRules } from '../services/rules.js';
import { parseUPI, analyzeUPI } from '../services/upi.js';
import { analyzeWithGemini } from '../services/ai.js';
import { mergeVerdicts } from '../services/merge.js';
import { db } from '../db/index.js';

/**
 * Link Scanner Endpoint: POST /api/scan/link
 */
export async function scanLink(req, res) {
  try {
    const parse = linkScanSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0]?.message || 'Invalid URL' });
    }

    let url = parse.data.url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const contentHash = hashContent(url);
    const domain = extractDomain(url);
    const domainHash = hashDomain(domain);
    const userId = req.user ? req.user.id : null;

    // 1. Check 24-hour Cache
    const cachedScan = await db.findScanByContentHash(contentHash);
    if (cachedScan) {
      return res.json({
        cached: true,
        inputType: 'link',
        contentHash,
        domainHash,
        domain,
        verdict: cachedScan.verdict,
        risk_score: cachedScan.risk_score,
        scam_category: cachedScan.scam_category,
        ai_used: cachedScan.ai_used,
        recommended_action: cachedScan.recommended_action,
        signals: cachedScan.signals || [],
        hops: [url],
        hopCount: 0,
        isHttps: url.startsWith('https://'),
        created_at: cachedScan.created_at
      });
    }

    // 2. Expand redirects safely (SSRF protected)
    const redirectInfo = await expandUrlSafely(url, 5);

    // 3. Evaluate Rule Engine
    const ruleResult = await evaluateUrlRules(redirectInfo.finalUrl, redirectInfo);

    // 4. Run AI Analysis via Gemini (backend only, minimum masked data)
    const aiResult = await analyzeWithGemini({
      inputType: 'link',
      content: redirectInfo.finalUrl,
      context: {
        originalUrl: url,
        hopsCount: redirectInfo.hopCount,
        isHttps: redirectInfo.isHttps,
        tldRisk: redirectInfo.tldRisk,
        ruleScore: ruleResult.score
      }
    });

    // 5. Merge Rule & AI Verdicts
    const verdictData = mergeVerdicts({
      ruleResult,
      aiResult,
      inputType: 'link'
    });

    // 6. Save Scan & Signals (Privacy guarantee: NO raw URL stored)
    await db.saveScan({
      userId,
      inputType: 'link',
      contentHash,
      domainHash,
      verdict: verdictData.verdict,
      riskScore: verdictData.risk_score,
      scamCategory: verdictData.scam_category,
      aiUsed: verdictData.ai_used,
      recommendedAction: verdictData.recommended_action,
      signals: verdictData.signals
    });

    return res.json({
      cached: false,
      inputType: 'link',
      contentHash,
      domainHash,
      domain: redirectInfo.finalDomain || domain,
      verdict: verdictData.verdict,
      risk_score: verdictData.risk_score,
      scam_category: verdictData.scam_category,
      ai_used: verdictData.ai_used,
      confidence: verdictData.confidence,
      recommended_action: verdictData.recommended_action,
      signals: verdictData.signals,
      hops: redirectInfo.hops,
      hopCount: redirectInfo.hopCount,
      isShortened: redirectInfo.isShortened,
      isHttps: redirectInfo.isHttps,
      tldRisk: redirectInfo.tldRisk
    });
  } catch (error) {
    console.error('scanLink error:', error);
    return res.status(500).json({ error: 'Server error analyzing link' });
  }
}

/**
 * QR Scanner Endpoint: POST /api/scan/qr
 */
export async function scanQR(req, res) {
  try {
    const parse = qrScanSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0]?.message || 'Invalid QR content' });
    }

    const content = parse.data.content.trim();
    const contentHash = hashContent(content);
    const userId = req.user ? req.user.id : null;

    // Check 24-hour Cache
    const cachedScan = await db.findScanByContentHash(contentHash);
    if (cachedScan) {
      return res.json({
        cached: true,
        inputType: cachedScan.input_type,
        contentHash,
        domainHash: cachedScan.domain_hash,
        verdict: cachedScan.verdict,
        risk_score: cachedScan.risk_score,
        scam_category: cachedScan.scam_category,
        ai_used: cachedScan.ai_used,
        recommended_action: cachedScan.recommended_action,
        signals: cachedScan.signals || [],
        created_at: cachedScan.created_at
      });
    }

    // Determine type: UPI vs URL vs Text
    const upiData = parseUPI(content);
    const isUpi = Boolean(upiData && upiData.isUPI);
    const isUrl = /^https?:\/\//i.test(content) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(content);

    let inputType = 'qr';
    let ruleResult = { signals: [], score: 0 };
    let redirectInfo = null;
    let domainHash = null;
    let upiDetails = null;

    if (isUpi) {
      inputType = 'upi';
      const upiAnalysis = analyzeUPI(upiData);
      upiDetails = upiAnalysis.upiDetails;
      ruleResult.signals = upiAnalysis.signals.map(s => ({ ...s, source: 'rule' }));
      ruleResult.score = upiAnalysis.riskScore;
    } else if (isUrl) {
      let url = content;
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      redirectInfo = await expandUrlSafely(url, 5);
      const urlRules = await evaluateUrlRules(redirectInfo.finalUrl, redirectInfo);
      ruleResult = urlRules;
      domainHash = urlRules.domainHash;
    } else {
      // Plain text or payload in QR
      const msgRules = evaluateMessageRules(content);
      ruleResult = msgRules;
    }

    // AI Analysis
    const aiResult = await analyzeWithGemini({
      inputType,
      content,
      context: {
        isUpi,
        upiDetails,
        redirectInfo: redirectInfo ? { hops: redirectInfo.hopCount, finalDomain: redirectInfo.finalDomain } : null,
        ruleScore: ruleResult.score
      }
    });

    // Merge Verdicts
    const verdictData = mergeVerdicts({
      ruleResult,
      aiResult,
      inputType
    });

    // Save Scan (Zero raw content stored)
    await db.saveScan({
      userId,
      inputType,
      contentHash,
      domainHash,
      verdict: verdictData.verdict,
      riskScore: verdictData.risk_score,
      scamCategory: verdictData.scam_category,
      aiUsed: verdictData.ai_used,
      recommendedAction: verdictData.recommended_action,
      signals: verdictData.signals
    });

    return res.json({
      cached: false,
      inputType,
      contentHash,
      domainHash,
      verdict: verdictData.verdict,
      risk_score: verdictData.risk_score,
      scam_category: verdictData.scam_category,
      ai_used: verdictData.ai_used,
      confidence: verdictData.confidence,
      recommended_action: verdictData.recommended_action,
      signals: verdictData.signals,
      upiDetails,
      hops: redirectInfo ? redirectInfo.hops : undefined,
      hopCount: redirectInfo ? redirectInfo.hopCount : undefined
    });
  } catch (error) {
    console.error('scanQR error:', error);
    return res.status(500).json({ error: 'Server error analyzing QR code' });
  }
}

/**
 * Message Scanner Endpoint: POST /api/scan/message
 */
export async function scanMessage(req, res) {
  try {
    const parse = messageScanSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0]?.message || 'Invalid message' });
    }

    const message = parse.data.message.trim();
    const contentHash = hashContent(message);
    const userId = req.user ? req.user.id : null;

    // 1. Check 24-hour Cache
    const cachedScan = await db.findScanByContentHash(contentHash);
    if (cachedScan) {
      return res.json({
        cached: true,
        inputType: 'message',
        contentHash,
        domainHash: cachedScan.domain_hash,
        verdict: cachedScan.verdict,
        risk_score: cachedScan.risk_score,
        scam_category: cachedScan.scam_category,
        ai_used: cachedScan.ai_used,
        recommended_action: cachedScan.recommended_action,
        signals: cachedScan.signals || [],
        created_at: cachedScan.created_at
      });
    }

    // 2. Run Message Rules
    const msgRules = evaluateMessageRules(message);
    let combinedSignals = [...msgRules.signals];
    let totalRuleScore = msgRules.score;
    let extractedDomains = [];
    let domainHash = null;

    // 3. If URLs found inside message, evaluate them as well
    if (msgRules.urlsFound && msgRules.urlsFound.length > 0) {
      const firstUrl = msgRules.urlsFound[0];
      const redirectInfo = await expandUrlSafely(firstUrl, 3);
      const urlRules = await evaluateUrlRules(redirectInfo.finalUrl, redirectInfo);

      combinedSignals = combinedSignals.concat(urlRules.signals);
      totalRuleScore = Math.max(totalRuleScore, urlRules.score);
      domainHash = urlRules.domainHash;
      extractedDomains.push(redirectInfo.finalDomain);
    }

    const ruleResult = {
      signals: combinedSignals,
      score: totalRuleScore
    };

    // 4. Run Gemini AI with masked text
    const aiResult = await analyzeWithGemini({
      inputType: 'message',
      content: message,
      context: {
        urlsFoundCount: msgRules.urlsFound.length,
        extractedDomains,
        ruleScore: totalRuleScore
      }
    });

    // 5. Merge Verdicts
    const verdictData = mergeVerdicts({
      ruleResult,
      aiResult,
      inputType: 'message'
    });

    // 6. Save Scan (Zero raw message stored)
    await db.saveScan({
      userId,
      inputType: 'message',
      contentHash,
      domainHash,
      verdict: verdictData.verdict,
      riskScore: verdictData.risk_score,
      scamCategory: verdictData.scam_category,
      aiUsed: verdictData.ai_used,
      recommendedAction: verdictData.recommended_action,
      signals: verdictData.signals
    });

    return res.json({
      cached: false,
      inputType: 'message',
      contentHash,
      domainHash,
      verdict: verdictData.verdict,
      risk_score: verdictData.risk_score,
      scam_category: verdictData.scam_category,
      ai_used: verdictData.ai_used,
      confidence: verdictData.confidence,
      recommended_action: verdictData.recommended_action,
      signals: verdictData.signals,
      urlsFound: msgRules.urlsFound.length
    });
  } catch (error) {
    console.error('scanMessage error:', error);
    return res.status(500).json({ error: 'Server error analyzing message' });
  }
}
