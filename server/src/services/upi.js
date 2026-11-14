/**
 * UPI QR Parser and Threat Analyzer
 * Detects common UPI scams:
 * - Collect request masquerading as payment receipt
 * - Deceptive payee names ("Electricity Dept", "Customer Care", "Refund Desk")
 * - Unusually high requested amount without context
 * - Suspicious / newly generated VPA patterns
 */

export function parseUPI(qrText) {
  if (!qrText || typeof qrText !== 'string') return null;
  const trimmed = qrText.trim();
  if (!trimmed.toLowerCase().startsWith('upi://')) {
    return null;
  }

  try {
    // Normalise upi://pay?... or upi://collect?...
    const isCollect = trimmed.toLowerCase().startsWith('upi://collect');
    const urlObj = new URL(trimmed.replace(/^upi:\/\//i, 'http://dummy.com/'));
    const params = urlObj.searchParams;

    const pa = params.get('pa') || ''; // Payee VPA
    const pn = params.get('pn') || ''; // Payee Name
    const am = params.get('am') || null; // Amount
    const cu = params.get('cu') || 'INR'; // Currency
    const tn = params.get('tn') || ''; // Transaction note
    const mc = params.get('mc') || ''; // Merchant code
    const tr = params.get('tr') || ''; // Transaction ref
    const mode = params.get('mode') || '';

    return {
      isUPI: true,
      isCollect,
      pa,
      pn,
      am: am ? parseFloat(am) : null,
      cu,
      tn,
      mc,
      tr,
      mode,
      raw: trimmed
    };
  } catch {
    return {
      isUPI: true,
      isCollect: false,
      pa: '',
      pn: '',
      am: null,
      cu: 'INR',
      tn: '',
      mc: '',
      tr: '',
      mode: '',
      raw: qrText
    };
  }
}

export function analyzeUPI(upiData) {
  const signals = [];
  let riskScore = 0;

  if (!upiData || !upiData.isUPI) {
    return { signals, riskScore, isSuspicious: false };
  }

  // 1. Collect request disguised as Pay QR
  if (upiData.isCollect || upiData.mode === '02') {
    signals.push({
      id: 'upi_collect_fraud',
      label: 'Disguised UPI Collect Request',
      weight: 45,
      evidence: 'This QR initiates a collect/debit request from your account instead of sending money to you.'
    });
    riskScore += 45;
  }

  // 2. Impersonation in Payee Name
  const deceptiveKeywords = [
    'refund', 'customercare', 'customer care', 'support', 'helpline',
    'lottery', 'reward', 'cashback', 'electricity', 'bill desk', 'kyc',
    'bank help', 'paytm help', 'phonepe refund', 'gpay reward'
  ];
  const lowerPn = (upiData.pn || '').toLowerCase();
  const lowerTn = (upiData.tn || '').toLowerCase();

  for (const keyword of deceptiveKeywords) {
    if (lowerPn.includes(keyword) || lowerTn.includes(keyword)) {
      signals.push({
        id: 'upi_deceptive_name',
        label: 'Suspicious Payee Name / Note',
        weight: 35,
        evidence: `Payee name or note contains high-risk impersonation keyword: "${keyword}". Legitimate utilities never use personal UPI VPAs.`
      });
      riskScore += 35;
      break;
    }
  }

  // 3. Fake Cashback / "Receive Money" Note
  if (/received?|congratulations|prize|won|claim/i.test(lowerTn)) {
    signals.push({
      id: 'upi_fake_cashback',
      label: 'Fake Cashback / Prize Note',
      weight: 40,
      evidence: 'Note claims you are receiving money. Remember: YOU NEVER ENTER YOUR UPI PIN TO RECEIVE MONEY.'
    });
    riskScore += 40;
  }

  // 4. Missing Payee Name with preset high amount
  if (!upiData.pn && upiData.am && upiData.am > 5000) {
    signals.push({
      id: 'upi_unnamed_high_amount',
      label: 'Unnamed High-Value Request',
      weight: 25,
      evidence: `QR requests ₹${upiData.am} without identifying the payee name.`
    });
    riskScore += 25;
  }

  // 5. Free personal handle pretending to be a company/merchant
  if (upiData.pa) {
    const isPersonalHandle = /@(okhdfcbank|okaxis|okicici|oksbi|ybl|ibl|paytm|apl)$/i.test(upiData.pa);
    if (isPersonalHandle && /official|bank|gov|support|refund/i.test(upiData.pa.toLowerCase())) {
      signals.push({
        id: 'upi_spoofed_vpa',
        label: 'Deceptive Personal VPA Handle',
        weight: 30,
        evidence: `VPA address "${upiData.pa}" uses an official brand keyword on a personal consumer UPI handle.`
      });
      riskScore += 30;
    }
  }

  return {
    signals,
    riskScore: Math.min(riskScore, 100),
    isSuspicious: riskScore >= 35,
    upiDetails: {
      payeeName: upiData.pn || 'Not specified',
      vpa: upiData.pa || 'Not specified',
      amount: upiData.am !== null ? `₹${upiData.am}` : 'Variable / User entered',
      note: upiData.tn || 'None'
    }
  };
}
