import React, { useState } from 'react';
import { 
  BookOpen, 
  DollarSign, 
  MessageSquare, 
  QrCode, 
  Briefcase, 
  Gift, 
  Laptop, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const SCAM_GUIDES = [
  {
    id: 'upi-scam',
    title: 'Disguised UPI "Collect" QR Codes',
    category: 'Payment Fraud',
    icon: DollarSign,
    iconColor: 'text-amber-400 bg-amber-500/15',
    summary: 'Scammers send a QR code claiming "Scan to receive payment or cashback". The QR code is secretly an authorized collect/debit request.',
    howItWorks: 'In the UPI protocol, entering your MPIN is ONLY used to AUTHORIZE MONEY LEAVING YOUR ACCOUNT. You never need to enter a PIN to receive funds.',
    signs: [
      'The sender insists: "Scan this and enter your 4 or 6-digit PIN to receive the money".',
      'The QR payload URL starts with `upi://collect` rather than `upi://pay`.',
      'The Payee Name looks like an official desk ("Electricity_Refund_Dept") on a personal Gmail/YBL handle.',
      'The transaction note includes bait words like "Cashback Approved" or "Prize Refund".'
    ],
    ruleOfThumb: 'GOLDEN RULE: You NEVER enter your UPI PIN to receive money. Any prompt asking for a PIN is a withdrawal.'
  },
  {
    id: 'kyc-sms',
    title: 'Urgent Bank / KYC Suspension SMS',
    category: 'Phishing & Credential Theft',
    icon: MessageSquare,
    iconColor: 'text-rose-400 bg-rose-500/15',
    summary: 'Urgent messages pretending your bank account, PAN, or SIM card will be deactivated within 24 hours unless you click a link.',
    howItWorks: 'The link opens a pixel-perfect replica of net banking login forms, prompting you for your username, password, and incoming OTP to drain your account.',
    signs: [
      'Artificial deadline pressure: "Within 24 hours" or "Immediately to prevent freeze".',
      'Sender ID is a random 10-digit mobile number rather than an official bank alphanumeric sender header (e.g., AD-HDFCBK).',
      'Link points to a non-bank domain (e.g., sbi-kyc-portal.xyz or tinyurl.com).',
      'Asks for Aadhaar, PAN card, ATM PIN, or card CVV on an unauthenticated page.'
    ],
    ruleOfThumb: 'Banks NEVER send unprompted links to update KYC via SMS. Visit your bank branch or use the verified official app.'
  },
  {
    id: 'parking-qr',
    title: 'Physical Sticker Tampering (Quishing)',
    category: 'Physical Social Engineering',
    icon: QrCode,
    iconColor: 'text-brand-cyan bg-brand-cyan/15',
    summary: 'Fraudsters stick fraudulent QR code stickers over legitimate parking meters, restaurant menus, and monument ticket kiosks.',
    howItWorks: 'You scan the sticker expecting to pay a parking fee or view a menu, but the fake QR redirects to a phishing page capturing credit card data.',
    signs: [
      'The QR code is a physical sticker visibly placed over an older sticker or sign.',
      'The scanned URL redirects through multiple unfamiliar domains or uses suspicious TLDs (.top, .xyz).',
      'The website requests unusually detailed personal info or asks you to download an .APK file.',
      'Edges of the QR code look recently peeled or misaligned with the official sign.'
    ],
    ruleOfThumb: 'Always inspect physical QR signs. If a sticker looks pasted over existing hardware, pay via cash or the city official app.'
  },
  {
    id: 'task-job-scam',
    title: 'Telegram "YouTube Video Like" Job Scam',
    category: 'Pretexting & Pig Butchering',
    icon: Briefcase,
    iconColor: 'text-indigo-400 bg-indigo-500/15',
    summary: 'WhatsApp message offering ₹3,000 to ₹10,000/day for trivial tasks like liking YouTube videos or rating Google Maps locations.',
    howItWorks: 'They pay ₹150 for the first 3 tasks to earn your trust, then invite you to a VIP Telegram group where you must "invest" or deposit money to unlock high returns.',
    signs: [
      'Unrealistic compensation for zero skills (e.g. ₹500 for clicking 3 links).',
      'Recruiter contacts you unsolicited via WhatsApp from an international country code (+62, +84, +234).',
      'Communication swiftly transitions from WhatsApp to Telegram channels.',
      'Requires prepaid "security deposits" or cryptocurrency transfers to release your earnings.'
    ],
    ruleOfThumb: 'Legitimate employers never hire over unsolicited WhatsApp texts and never ask you to pay money to receive pay.'
  },
  {
    id: 'remote-access-trap',
    title: 'AnyDesk / Screen Share Customer Care Trap',
    category: 'Device Compromise',
    icon: Laptop,
    iconColor: 'text-verdict-dangerous bg-rose-500/15',
    summary: 'Scammer poses as utility support or bank executive and convinces you to install AnyDesk or TeamViewer to "fix your issue".',
    howItWorks: 'Once installed, they instruct you to read out the 9-digit remote code, granting them full view and control of your phone screen while you open bank apps.',
    signs: [
      'Caller instructs you to install AnyDesk, TeamViewer QuickSupport, or RustDesk from the Play Store.',
      'They ask you to open your mobile banking app while the screen share is active.',
      'They ask you to read out the 9-digit code displayed on your screen.',
      'Caller claims your electricity will be disconnected tonight unless you pay ₹10 for an app update.'
    ],
    ruleOfThumb: 'NEVER install remote control software on the instructions of any caller. Real bank and utility reps will never ask to view your screen.'
  }
];

export default function AwarenessPage() {
  const [expandedCard, setExpandedCard] = useState('upi-scam');

  const toggleExpand = (id) => {
    setExpandedCard(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono text-brand-cyan bg-brand-indigo/10 border border-brand-indigo/30">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Scam Defense Playbook</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-dark-text tracking-tight">
          How to Spot Common Cyber Scams
        </h1>
        <p className="text-xs sm:text-sm text-dark-muted">
          Study the exact anatomy and red flags used by cybercriminals across QR codes, UPI payments, and messaging apps.
        </p>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {SCAM_GUIDES.map((guide) => {
          const Icon = guide.icon;
          const isExpanded = expandedCard === guide.id;

          return (
            <div
              key={guide.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-dark-surface border-brand-indigo/50 shadow-glow'
                  : 'bg-dark-surface/70 border-dark-border hover:border-dark-border/80'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleExpand(guide.id)}
                className="w-full p-6 text-left flex items-start justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${guide.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-dark-muted font-bold">
                      {guide.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-dark-text">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-dark-muted line-clamp-2">
                      {guide.summary}
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-dark-elevated text-dark-muted flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-dark-border/60 space-y-5 text-xs">
                  <div>
                    <h4 className="font-bold uppercase tracking-wider text-dark-text text-[11px] mb-1">
                      Anatomy of the Attack:
                    </h4>
                    <p className="text-dark-muted leading-relaxed">
                      {guide.howItWorks}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-brand-cyan text-[11px]">
                      Spot the Signs (Checklist):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {guide.signs.map((sign, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-dark-elevated/70 border border-dark-border flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-dark-text leading-tight">{sign}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Golden Rule Callout */}
                  <div className="p-4 rounded-xl bg-brand-indigo/10 border border-brand-indigo/30 text-brand-cyan font-medium flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span>{guide.ruleOfThumb}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
