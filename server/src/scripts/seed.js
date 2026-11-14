import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { hashContent, hashDomain } from '../utils/crypto.js';

export const DEMO_SAMPLES = {
  fakeKycSms: {
    type: 'message',
    title: 'Fake KYC Bank Alert',
    content: 'Dear SBI Customer, your YONO account will be blocked within 24 hours. Please click http://sbi-kyc-update.xyz to update your PAN and Aadhaar immediately or call customer care.',
    verdict: 'dangerous',
    riskScore: 92,
    category: 'Fake KYC / Bank Alert'
  },
  lookalikeBankUrl: {
    type: 'link',
    title: 'Lookalike Typosquat URL',
    content: 'http://paytmm-secure-cashback.top/login?verify=kyc',
    verdict: 'dangerous',
    riskScore: 88,
    category: 'Brand Impersonation / Phishing'
  },
  maliciousUpiQr: {
    type: 'qr',
    title: 'Malicious Disguised UPI Collect',
    content: 'upi://collect?pa=refund-desk-online99@paytm&pn=Electricity_Bill_Refund&am=4999&cu=INR&tn=Cashback_Refund_Approved',
    verdict: 'dangerous',
    riskScore: 95,
    category: 'UPI Payment Fraud'
  },
  safeSite: {
    type: 'link',
    title: 'Legitimate Safe Website',
    content: 'https://github.com',
    verdict: 'safe',
    riskScore: 5,
    category: 'Legitimate'
  }
};

async function seed() {
  // The demo account uses a publicly documented password, so never create it on a production deployment.
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    console.error('Refusing to seed demo data in production (set ALLOW_PRODUCTION_SEED=true to override).');
    process.exitCode = 1;
    return;
  }

  console.log('🌱 Seeding QR Shield database with demo accounts and statistics...');

  try {
    // 1. Create Demo User
    const demoEmail = 'demo@qrshield.sec';
    let user = await db.findUserByEmail(demoEmail);

    if (!user) {
      const password_hash = await bcrypt.hash('ShieldSecure2026!', 10);
      user = await db.createUser({
        name: 'Alex Security Auditor',
        email: demoEmail,
        password_hash
      });
      console.log(`✅ Demo User created: ${demoEmail} / ShieldSecure2026!`);
    } else {
      console.log(`ℹ️ Demo User already exists: ${demoEmail}`);
    }

    // 2. Seed Community Reports
    const scamDomains = [
      'sbi-kyc-update.xyz',
      'paytmm-secure-cashback.top',
      'electricity-bill-alert.loan',
      'free-crypto-giveaway.click'
    ];

    for (const dom of scamDomains) {
      const domHash = hashDomain(dom);
      await db.incrementCommunityReport(domHash);
      await db.incrementCommunityReport(domHash);
    }
    console.log(`✅ Community blacklist seeded with ${scamDomains.length} known scam domain hashes.`);

    // 3. Seed historical scans for rich dashboard charts
    const sampleScans = [
      {
        inputType: 'message',
        content: 'Your electricity power will be disconnected tonight at 9:30 PM. Call officer on 9876543210 immediately.',
        verdict: 'dangerous',
        riskScore: 86,
        scamCategory: 'Fake Utility Disconnection'
      },
      {
        inputType: 'upi',
        content: 'upi://collect?pa=support-desk@okhdfcbank&pn=HDFC_Reward_Claim&am=2500&cu=INR&tn=Reward_Claim',
        verdict: 'dangerous',
        riskScore: 90,
        scamCategory: 'UPI Payment Fraud'
      },
      {
        inputType: 'link',
        content: 'https://wikipedia.org',
        verdict: 'safe',
        riskScore: 2,
        scamCategory: 'Legitimate'
      },
      {
        inputType: 'link',
        content: 'http://bit.ly/3xFakeLotteryLink',
        verdict: 'suspicious',
        riskScore: 55,
        scamCategory: 'Suspicious Shortened Link'
      },
      {
        inputType: 'message',
        content: 'Congratulations! You won Rs 25,00,000 in KBC Lucky Draw. Send WhatsApp to claim.',
        verdict: 'dangerous',
        riskScore: 94,
        scamCategory: 'Lottery / Job Task Bait'
      },
      {
        inputType: 'link',
        content: 'https://google.com',
        verdict: 'safe',
        riskScore: 0,
        scamCategory: 'Legitimate'
      }
    ];

    for (const item of sampleScans) {
      const contentHash = hashContent(item.content);
      const domain = item.content.startsWith('http') ? new URL(item.content).hostname : null;
      const domainHash = domain ? hashDomain(domain) : null;

      await db.saveScan({
        userId: user.id,
        inputType: item.inputType,
        contentHash,
        domainHash,
        verdict: item.verdict,
        riskScore: item.riskScore,
        scamCategory: item.scamCategory,
        aiUsed: true,
        recommendedAction: item.verdict === 'safe' ? 'Safe to proceed.' : 'Do not interact with this content.',
        signals: [
          { source: 'rule', label: 'Heuristic Rule Triggered', detail: `Analyzed pattern for ${item.scamCategory}` },
          { source: 'ai', label: 'AI Risk Assessment', detail: 'Pattern match confirmed high similarity to known social engineering schemes.' }
        ]
      });
    }

    console.log(`✅ Seeded ${sampleScans.length} historical scans for user ${user.email}.`);
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exitCode = 1; // report failure to CI / the shell instead of always exiting 0
  }
}

seed().then(() => process.exit(process.exitCode || 0));
