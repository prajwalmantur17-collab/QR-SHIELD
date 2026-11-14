/**
 * Merge Engine
 * Blends deterministic rules (55%) and AI assessment (45%).
 * Enforces critical safety overrides and synthesizes explainable verdicts.
 */

export function mergeVerdicts({ ruleResult, aiResult, inputType }) {
  const { signals: ruleSignals = [], score: ruleScore = 0 } = ruleResult;
  const isAiUsed = Boolean(aiResult && aiResult.ai_used && aiResult.data);
  const aiData = isAiUsed ? aiResult.data : null;

  let blendedScore = 0;

  if (isAiUsed) {
    blendedScore = Math.round((ruleScore * 0.55) + (aiData.risk_score * 0.45));
  } else {
    blendedScore = ruleScore;
  }

  // Check for critical rule triggers
  const hasCriticalOtp = ruleSignals.some(s => s.id === 'msg_otp_pin_request');
  const hasBlacklist = ruleSignals.some(s => s.id === 'rule_community_blacklist');
  const hasUpiFraud = ruleSignals.some(s => s.id === 'upi_collect_fraud');
  const hasIpHost = ruleSignals.some(s => s.id === 'rule_raw_ip_address');
  const hasRemoteAccess = ruleSignals.some(s => s.id === 'msg_remote_access_app');
  const hasDigitalArrest = ruleSignals.some(s => s.id === 'msg_digital_arrest_threat');

  const isCriticalTriggered = hasCriticalOtp || hasBlacklist || hasUpiFraud || hasRemoteAccess || hasDigitalArrest;

  if (isCriticalTriggered) {
    // Force at least Suspicious (70) or Dangerous (85+)
    if (hasCriticalOtp || hasUpiFraud || hasBlacklist || hasDigitalArrest) {
      blendedScore = Math.max(blendedScore, 85);
    } else {
      blendedScore = Math.max(blendedScore, 70);
    }
  }

  // Clamp score
  const finalScore = Math.max(0, Math.min(100, blendedScore));

  // Determine final verdict
  let finalVerdict = 'safe';
  if (finalScore >= 70) {
    finalVerdict = 'dangerous';
  } else if (finalScore >= 30) {
    finalVerdict = 'suspicious';
  } else {
    finalVerdict = 'safe';
  }

  // Consolidate signals for explainability
  const allSignals = [];

  // 1. Add rule signals
  for (const sig of ruleSignals) {
    allSignals.push({
      source: 'rule',
      label: sig.label,
      detail: sig.detail || sig.evidence
    });
  }

  // 2. Add AI reasons as AI-sourced signals
  if (isAiUsed && aiData.reasons && Array.isArray(aiData.reasons)) {
    for (const reason of aiData.reasons) {
      allSignals.push({
        source: 'ai',
        label: 'AI Threat Insight',
        detail: reason
      });
    }
  } else if (!isAiUsed) {
    if (finalScore === 0) {
      allSignals.push({
        source: 'rule',
        label: 'No Known Threat Signatures',
        detail: 'Checked against phishing heuristics, brand impersonation databases, and community blacklist.'
      });
    }
  }

  // Determine scam category
  let scamCategory = 'Legitimate';
  if (isAiUsed && aiData.scam_category && aiData.scam_category !== 'Legitimate') {
    scamCategory = aiData.scam_category;
  } else if (hasUpiFraud) {
    scamCategory = 'UPI Payment Fraud';
  } else if (hasCriticalOtp) {
    scamCategory = 'OTP / Credential Theft';
  } else if (hasRemoteAccess) {
    scamCategory = 'Remote Access Scam';
  } else if (hasDigitalArrest) {
    scamCategory = 'Law Enforcement Extortion';
  } else if (ruleSignals.some(s => s.id === 'rule_brand_impersonation')) {
    scamCategory = 'Brand Impersonation / Phishing';
  } else if (ruleSignals.some(s => s.id === 'msg_lottery_job_bait')) {
    scamCategory = 'Lottery / Job Task Bait';
  } else if (ruleSignals.some(s => s.id === 'msg_fake_kyc_bank')) {
    scamCategory = 'Fake KYC / Bank Alert';
  } else if (finalVerdict !== 'safe') {
    scamCategory = 'Suspicious Activity';
  }

  // Recommended Action
  let recommendedAction = '';
  if (isAiUsed && aiData.recommended_action) {
    recommendedAction = aiData.recommended_action;
  } else {
    if (finalVerdict === 'dangerous') {
      if (hasCriticalOtp) {
        recommendedAction = 'NEVER share your OTP or PIN with anyone. Block this sender immediately and report to cybercrime.gov.in.';
      } else if (hasUpiFraud) {
        recommendedAction = 'Do NOT authorize this UPI request or enter your PIN. You never enter a PIN to receive money.';
      } else if (hasRemoteAccess) {
        recommendedAction = 'Do NOT install AnyDesk or TeamViewer. Disconnect any active call immediately.';
      } else {
        recommendedAction = 'Do NOT click this link, scan this QR, or provide any credentials. Delete and report the message.';
      }
    } else if (finalVerdict === 'suspicious') {
      recommendedAction = 'Proceed with caution. Verify the sender through official verified phone numbers or direct bookmarks, not this link.';
    } else {
      recommendedAction = 'No immediate threats detected. Standard security hygiene is still advised.';
    }
  }

  return {
    verdict: finalVerdict,
    risk_score: finalScore,
    scam_category: scamCategory,
    ai_used: isAiUsed,
    confidence: isAiUsed ? aiData.confidence : (finalScore > 50 ? 0.85 : 0.95),
    signals: allSignals,
    recommended_action: recommendedAction
  };
}
