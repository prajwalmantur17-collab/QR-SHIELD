import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  DollarSign, 
  MessageSquare, 
  QrCode, 
  Briefcase, 
  Laptop, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  Shield,
  Lightbulb
} from 'lucide-react';

export const SCAM_GUIDES = [
  {
    id: 'upi-scam',
    title: 'Disguised UPI "Collect" QR Codes',
    category: 'Payment Scams',
    icon: DollarSign,
    iconColor: 'text-status-warning bg-status-warning-bg',
    summary: 'Scammers send a QR code claiming "Scan to receive payment or cashback". The QR code is secretly an authorized collect/debit request.',
    howItWorks: 'In the UPI protocol, entering your MPIN is ONLY used to AUTHORIZE MONEY LEAVING YOUR ACCOUNT. You never need to enter a PIN to receive funds from anyone.',
    signs: [
      'The sender insists: "Scan this and enter your 4 or 6-digit PIN to receive the money".',
      'The QR payload URL starts with `upi://collect` rather than `upi://pay`.',
      'The Payee Name looks like an official desk ("Electricity_Refund_Dept") on a personal Gmail/YBL handle.',
      'The transaction note includes bait words like "Cashback Approved" or "Prize Refund".'
    ],
    preventionSteps: [
      'Never enter your UPI PIN unless you are actively paying someone for a purchase you initiated.',
      'Check the top banner on your UPI app (Google Pay, PhonePe, Paytm): if it says "Paying ₹..." it will deduct money.',
      'Decline any request where the other person claims they need your PIN to send you money.'
    ],
    ruleOfThumb: 'GOLDEN RULE: You NEVER enter your UPI PIN to receive money. Any prompt asking for a PIN is a withdrawal.'
  },
  {
    id: 'kyc-sms',
    title: 'Urgent Bank / KYC Suspension SMS',
    category: 'Phishing & KYC',
    icon: MessageSquare,
    iconColor: 'text-status-danger bg-status-danger-bg',
    summary: 'Urgent messages pretending your bank account, PAN, or SIM card will be deactivated within 24 hours unless you click an embedded link.',
    howItWorks: 'The link opens a fake web form mimicking net banking login forms, prompting you for your username, password, card CVV, and incoming OTP to empty your account.',
    signs: [
      'Artificial deadline pressure: "Within 24 hours" or "Immediately to prevent freeze".',
      'Sender ID is a random 10-digit mobile number rather than an official bank alphanumeric sender header (e.g. AD-HDFCBK).',
      'Link points to a non-bank domain (e.g. sbi-kyc-portal.xyz, tinyurl.com, or bit.ly).',
      'Asks for Aadhaar, PAN card, ATM PIN, or card CVV on an unauthenticated page.'
    ],
    preventionSteps: [
      'Never click links in SMS messages regarding banking or KYC updates.',
      'Always type your bank website directly in your browser or use their official app from the app store.',
      'Banks never ask for OTP, passwords, or PINs over SMS or phone calls.'
    ],
    ruleOfThumb: 'Banks NEVER send unprompted links to update KYC via SMS. Visit your branch or use the verified official mobile banking app.'
  },
  {
    id: 'parking-qr',
    title: 'Physical Sticker Tampering (Quishing)',
    category: 'Physical Quishing',
    icon: QrCode,
    iconColor: 'text-brand-teal bg-brand-teal-subtle',
    summary: 'Fraudsters stick counterfeit QR code stickers over legitimate parking meters, restaurant menus, and monument ticket kiosks.',
    howItWorks: 'You scan the sticker expecting to pay a parking fee or view a menu, but the fake QR redirects to an imitation page capturing credit card credentials.',
    signs: [
      'The QR code is a physical sticker visibly placed over an older sticker or sign.',
      'Scanned URL redirects through unfamiliar domain names or uses suspicious extensions (.top, .xyz).',
      'The website requests unusually detailed personal info or asks you to download an app file (.APK).',
      'Edges of the QR code look recently peeled or misaligned with the official sign.'
    ],
    preventionSteps: [
      'Inspect physical signs for evidence of a sticker pasted on top of the original plate.',
      'Check the destination URL in your camera app preview before tapping to open it.',
      'Pay parking fees through official municipal parking apps or cash whenever available.'
    ],
    ruleOfThumb: 'Always inspect physical QR signs. If a sticker looks pasted over existing hardware, verify the URL before entering payment details.'
  },
  {
    id: 'task-job-scam',
    title: 'Telegram "YouTube Video Like" Job Scam',
    category: 'Job Scams',
    icon: Briefcase,
    iconColor: 'text-brand-blue bg-brand-blue-subtle',
    summary: 'WhatsApp message offering ₹3,000 to ₹10,000/day for trivial tasks like liking YouTube videos or rating Google Maps locations.',
    howItWorks: 'They pay ₹150 for the first few tasks to gain your confidence, then move you to a Telegram group where you must "invest" money to unlock higher tiered payouts.',
    signs: [
      'Unrealistic compensation for zero skills (e.g. ₹500 for clicking 3 links).',
      'Recruiter contacts you unsolicited via WhatsApp from an international country code (+62, +84, +234).',
      'Communication swiftly transitions from WhatsApp to Telegram channels.',
      'Requires prepaid "security deposits" or cryptocurrency transfers to release your earnings.'
    ],
    preventionSteps: [
      'Block and report unsolicited messages offering easy daily earnings.',
      'Never send money to an employer or platform to "unlock" work or commissions.',
      'Research company names on official career boards, not messaging apps.'
    ],
    ruleOfThumb: 'Legitimate employers never hire over unsolicited WhatsApp texts and never ask you to pay money to receive pay.'
  },
  {
    id: 'remote-access-trap',
    title: 'AnyDesk / Screen Share Customer Care Trap',
    category: 'Remote Access',
    icon: Laptop,
    iconColor: 'text-status-danger bg-status-danger-bg',
    summary: 'Scammer poses as utility support or bank executive and convinces you to install AnyDesk, TeamViewer, or QuickSupport to "fix your issue".',
    howItWorks: 'Once installed, they instruct you to read out the 9-digit remote code, granting them full view and control of your phone screen while you open bank apps.',
    signs: [
      'Caller instructs you to install AnyDesk, TeamViewer QuickSupport, or RustDesk from the Play Store.',
      'They ask you to open your mobile banking app while the screen share is active.',
      'They ask you to read out the 9-digit code displayed on your screen.',
      'Caller claims your electricity will be disconnected tonight unless you pay a small fee.'
    ],
    preventionSteps: [
      'Hang up immediately if an inbound caller instructs you to install any app.',
      'Never share the 9-digit pairing code from AnyDesk or TeamViewer with anyone.',
      'Uninstall any screen sharing app you did not install for your own verified use.'
    ],
    ruleOfThumb: 'NEVER install remote control software on the instructions of any caller. Real bank and utility reps will never ask to view your screen.'
  }
];

export default function AwarenessPage() {
  const [expandedCard, setExpandedCard] = useState('upi-scam');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Payment Scams', 'Phishing & KYC', 'Physical Quishing', 'Job Scams', 'Remote Access'];

  const filteredGuides = useMemo(() => {
    return SCAM_GUIDES.filter((guide) => {
      const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
      const matchesSearch = 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.signs.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id) => {
    setExpandedCard(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold text-brand-teal bg-brand-teal-subtle border border-brand-teal/20">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Scam Awareness & Prevention Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary dark:text-dark-primary tracking-tight">
          How to Spot Common Cyber Scams
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary dark:text-dark-secondaryText">
          Learn how attackers trick users through fake QR stickers, disguised UPI payments, and urgent text alerts.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scams, tactics, or keywords (e.g., UPI, KYC, parking, AnyDesk)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-xs sm:text-sm text-content-primary dark:text-dark-primary placeholder:text-content-muted focus:outline-none focus:border-brand-teal shadow-card transition-colors"
          />
          <Search className="w-4 h-4 text-content-muted absolute left-3.5 pointer-events-none" />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-teal text-white shadow-subtle'
                  : 'bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-content-secondary dark:text-dark-secondaryText hover:text-content-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scam Cards Accordion List */}
      <div className="space-y-4">
        {filteredGuides.length > 0 ? (
          filteredGuides.map((guide) => {
            const Icon = guide.icon;
            const isExpanded = expandedCard === guide.id;

            return (
              <div
                key={guide.id}
                className="rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface shadow-card overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(guide.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 focus:outline-none"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${guide.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted dark:text-dark-muted font-bold">
                        {guide.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-content-primary dark:text-dark-primary">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
                        {guide.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary text-content-muted flex-shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Sections */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-border dark:border-dark-border space-y-4 text-xs">
                    
                    {/* How It Works */}
                    <div className="space-y-1">
                      <h4 className="font-bold uppercase tracking-wider text-content-primary dark:text-dark-primary text-[11px]">
                        How This Scam Works:
                      </h4>
                      <p className="text-content-secondary dark:text-dark-secondaryText leading-relaxed">
                        {guide.howItWorks}
                      </p>
                    </div>

                    {/* Warning Signs */}
                    <div className="space-y-2">
                      <h4 className="font-bold uppercase tracking-wider text-status-danger text-[11px]">
                        Warning Signs to Look For:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {guide.signs.map((sign, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-status-danger flex-shrink-0 mt-0.5" />
                            <span className="text-content-primary dark:text-dark-primary leading-tight text-[11px]">{sign}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prevention Steps */}
                    <div className="space-y-2">
                      <h4 className="font-bold uppercase tracking-wider text-brand-teal text-[11px]">
                        How to Protect Yourself:
                      </h4>
                      <ul className="space-y-1.5 text-content-secondary dark:text-dark-secondaryText">
                        {guide.preventionSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="w-4 h-4 rounded-full bg-brand-teal-subtle text-brand-teal text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-[11px] leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Golden Rule Callout */}
                    <div className="p-3.5 rounded-xl bg-status-warning-bg border border-status-warning-border text-status-warning-text font-medium flex items-center space-x-2.5">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs leading-relaxed">{guide.ruleOfThumb}</span>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white dark:bg-dark-surface rounded-2xl border border-border dark:border-dark-border space-y-2 shadow-card">
            <p className="text-xs font-semibold text-content-primary dark:text-dark-primary">No matching guides found</p>
            <p className="text-[11px] text-content-secondary dark:text-dark-secondaryText">
              Try searching with different terms like "UPI", "Bank", or "QR".
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
