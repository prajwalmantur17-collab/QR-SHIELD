import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert,
  ShieldCheck,
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
  Lightbulb,
  Check,
  X,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Filter,
  Layers,
  Compass,
  FileText,
  AlertCircle
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { SAMPLES } from '../components/scan/SampleCards';

// Preserved & Enriched Scam Intelligence Guides
export const SCAM_GUIDES = [
  {
    id: 'upi-scam',
    title: 'Disguised UPI "Collect" QR Codes',
    category: 'Payment Scams',
    icon: DollarSign,
    badgeVariant: 'danger',
    riskLevel: 'Critical Risk',
    attackVector: 'Payment Protocol Deception',
    targetMedium: 'UPI / Mobile Banking',
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
    badgeVariant: 'danger',
    riskLevel: 'Critical Risk',
    attackVector: 'Credential Harvesting',
    targetMedium: 'SMS / Fake Portals',
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
    badgeVariant: 'warning',
    riskLevel: 'High Risk',
    attackVector: 'Counterfeit Physical Media',
    targetMedium: 'Public Signs / Meters',
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
    badgeVariant: 'warning',
    riskLevel: 'High Risk',
    attackVector: 'Task Advance-Fee Fraud',
    targetMedium: 'WhatsApp / Telegram',
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
    badgeVariant: 'danger',
    riskLevel: 'Critical Risk',
    attackVector: 'Remote Device Takeover',
    targetMedium: 'Phone Call / Remote Apps',
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

// Preserved & Expanded Interactive Scenarios (All Original Answers Retained)
const CHALLENGE_SCENARIOS = [
  {
    id: 1,
    category: 'Payment Scams',
    question: '"A buyer on OLX sends you a QR code and says: \'Scan this QR in Google Pay and enter your 4-digit UPI PIN to receive the ₹2,500 advance.\' What should you do?"',
    options: [
      { id: 'a', label: 'A. Scan it and enter PIN to accept funds', isCorrect: false },
      { id: 'b', label: 'B. Decline immediately — PIN is NEVER required to receive money', isCorrect: true }
    ],
    correctExplanation: 'In the UPI architecture, entering your PIN only authorizes a debit. Scammers disguise payment requests as refunds to drain victims.',
    incorrectExplanation: 'Entering your UPI PIN authorizes money leaving your bank account. You would have immediately transferred ₹2,500 to the scammer.'
  },
  {
    id: 2,
    category: 'Phishing & KYC',
    question: '"You receive an urgent SMS: \'SBI Alert: Your NetBanking will be suspended in 24 hours. Update PAN immediately at http://sbi-kyc-portal.xyz/pan\'. What is the safest action?"',
    options: [
      { id: 'a', label: 'A. Click the link quickly to verify PAN before your account is frozen', isCorrect: false },
      { id: 'b', label: 'B. Ignore the link, delete the SMS, and verify with your official bank app', isCorrect: true }
    ],
    correctExplanation: 'Banks never send unprompted links with short deadlines or use suspicious non-bank domains (.xyz). Official KYC is handled inside authenticated apps or branches.',
    incorrectExplanation: 'Urgency is a psychological coercion tactic. Clicking the link takes you to an imitation site designed to steal your credentials and OTP.'
  },
  {
    id: 3,
    category: 'Physical Quishing',
    question: '"At a municipal parking station, you notice a glossy QR code sticker taped over the metallic payment plate on the machine. How should you proceed?"',
    options: [
      { id: 'a', label: 'A. Do not scan the sticker; pay via official city app or physical meter kiosk', isCorrect: true },
      { id: 'b', label: 'B. Scan the sticker because parking vendors frequently paste updated rate stickers', isCorrect: false }
    ],
    correctExplanation: 'Physical Quishing relies on overlay stickers placed over legitimate infrastructure. Fraudulent stickers redirect drivers to fake credit card portals.',
    incorrectExplanation: 'Counterfeit stickers are a rampant real-world threat. Entering payment on a tampered sticker sends your card credentials directly to attackers.'
  },
  {
    id: 4,
    category: 'Remote Access',
    question: '"A caller claiming to represent your electricity board says your power will be cut tonight unless you install \'AnyDesk\' to clear a ₹10 unpaid surcharge. What do you do?"',
    options: [
      { id: 'a', label: 'A. Install AnyDesk so the support technician can verify the meter slip', isCorrect: false },
      { id: 'b', label: 'B. Terminate the call immediately; real utilities never ask to view your device', isCorrect: true }
    ],
    correctExplanation: 'AnyDesk grants remote screen observation and full device control. Attackers watch you open banking applications and intercept two-factor OTPs.',
    incorrectExplanation: 'Utility customer care will NEVER ask you to install screen-sharing software. Installing remote software exposes your banking apps to full takeover.'
  },
  {
    id: 5,
    category: 'Job Scams',
    question: '"A recruiter on WhatsApp offers you ₹8,000/day for rating restaurants, but asks you to join Telegram and deposit a ₹1,000 \'refundable security bond\' first. What is this?"',
    options: [
      { id: 'a', label: 'A. A classic task advance-fee scam; block and report the sender immediately', isCorrect: true },
      { id: 'b', label: 'B. A legitimate freelance onboarding verification bond', isCorrect: false }
    ],
    correctExplanation: 'Legitimate employers never demand upfront cash to unlock job tasks. Once deposits are made to Telegram handles, the funds can never be recovered.',
    incorrectExplanation: 'Paying money to earn money is the hallmark of advance-fee task scams. Any deposited funds are permanently lost.'
  }
];

export default function AwarenessPage() {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState('upi-scam');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Interactive Readiness Challenge State
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeFinished, setChallengeFinished] = useState(false);

  const categories = ['All', 'Payment Scams', 'Phishing & KYC', 'Physical Quishing', 'Job Scams', 'Remote Access'];

  // Filtered threat guides
  const filteredGuides = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SCAM_GUIDES.filter((guide) => {
      const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const inTitle = guide.title.toLowerCase().includes(q);
      const inSummary = guide.summary.toLowerCase().includes(q);
      const inCategory = guide.category.toLowerCase().includes(q);
      const inHowItWorks = guide.howItWorks.toLowerCase().includes(q);
      const inRule = guide.ruleOfThumb.toLowerCase().includes(q);
      const inAttackVector = guide.attackVector.toLowerCase().includes(q);
      const inSigns = guide.signs.some((s) => s.toLowerCase().includes(q));
      const inPrevention = guide.preventionSteps.some((p) => p.toLowerCase().includes(q));

      return inTitle || inSummary || inCategory || inHowItWorks || inRule || inAttackVector || inSigns || inPrevention;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  // Interactive Challenge Handlers
  const currentScenario = CHALLENGE_SCENARIOS[currentScenarioIndex];

  const handleSelectOption = (optionId) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
    setIsAnswerSubmitted(true);

    const chosenOption = currentScenario.options.find((opt) => opt.id === optionId);
    if (chosenOption && chosenOption.isCorrect) {
      setChallengeScore((prev) => prev + 1);
    }
  };

  const handleNextScenario = () => {
    if (currentScenarioIndex < CHALLENGE_SCENARIOS.length - 1) {
      setCurrentScenarioIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      setChallengeFinished(true);
    }
  };

  const handleRestartChallenge = () => {
    setCurrentScenarioIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setChallengeScore(0);
    setChallengeFinished(false);
  };

  const handleRunSimulation = (sample) => {
    navigate('/scan', { state: { sample } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      
      {/* ============================================================
          SECTION 01: COMPACT PAGE HEADER
          ============================================================ */}
      <header className="pb-5 border-b border-border dark:border-dark-border flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-brand-teal text-white flex items-center justify-center shadow-subtle">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-brand-teal">
              Security Intelligence Platform
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary dark:text-dark-primary tracking-tight">
            Scam Awareness & Threat Intelligence
          </h1>
          
          <p className="text-xs sm:text-sm text-content-secondary dark:text-dark-secondaryText leading-relaxed">
            Understand modern scams, recognize deceptive tactics and learn how to protect yourself from digital threats.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <Badge variant="teal" size="sm" dot>
            {SCAM_GUIDES.length} Verified Modules
          </Badge>
          <Badge variant="neutral" size="sm">
            Zero-Knowledge Defense
          </Badge>
        </div>
      </header>


      {/* ============================================================
          SECTION 02: SECURITY AWARENESS CHALLENGE
          ============================================================ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-brand-teal" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-content-primary dark:text-dark-primary font-mono">
              TEST YOUR SECURITY AWARENESS
            </h2>
          </div>
          <span className="text-[11px] text-content-muted dark:text-dark-muted font-mono">
            Identify scams before they compromise your security
          </span>
        </div>

        <Card padding="md" className="border-border dark:border-dark-border shadow-card overflow-hidden">
          {!challengeFinished ? (
            <div className="space-y-4">
              {/* Challenge Top Navigation / Stepper */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-border dark:border-dark-border">
                <div className="flex items-center space-x-2">
                  <Badge variant="teal" size="xs">
                    Scenario {currentScenarioIndex + 1} of {CHALLENGE_SCENARIOS.length}
                  </Badge>
                  <span className="text-content-muted dark:text-dark-muted">•</span>
                  <span className="font-semibold text-content-secondary dark:text-dark-secondaryText">
                    {currentScenario.category}
                  </span>
                </div>

                <div className="flex items-center space-x-2 font-mono text-[11px] text-content-secondary dark:text-dark-secondaryText">
                  <span>Score:</span>
                  <strong className="text-brand-teal font-bold">{challengeScore}</strong>
                  <span>/ {CHALLENGE_SCENARIOS.length}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 rounded-full bg-canvas-subtle dark:bg-dark-secondary overflow-hidden">
                <motion.div
                  className="h-full bg-brand-teal rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentScenarioIndex + 1) / CHALLENGE_SCENARIOS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Scenario Prompt */}
              <div className="p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
                <p className="text-xs sm:text-sm font-semibold text-content-primary dark:text-dark-primary leading-relaxed">
                  {currentScenario.question}
                </p>

                {/* Answer Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {currentScenario.options.map((option) => {
                    const isSelected = selectedOptionId === option.id;
                    const showCorrect = isAnswerSubmitted && option.isCorrect;
                    const showWrong = isAnswerSubmitted && isSelected && !option.isCorrect;

                    let btnClass = 'bg-white dark:bg-dark-surface border-border dark:border-dark-border hover:border-brand-teal hover:bg-canvas-subtle text-content-primary dark:text-dark-primary';
                    if (showCorrect) {
                      btnClass = 'bg-status-success-bg text-status-success-text border-status-success-border font-bold shadow-subtle';
                    } else if (showWrong) {
                      btnClass = 'bg-status-danger-bg text-status-danger-text border-status-danger-border font-bold shadow-subtle';
                    } else if (isSelected) {
                      btnClass = 'bg-brand-teal-subtle text-brand-teal-text border-brand-teal font-semibold';
                    }

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectOption(option.id)}
                        disabled={isAnswerSubmitted}
                        className={`p-3 rounded-lg text-left text-xs border font-medium transition-all flex items-start space-x-2 ${btnClass} disabled:cursor-default`}
                      >
                        <span className="flex-1">{option.label}</span>
                        {showCorrect && <Check className="w-4 h-4 text-status-success flex-shrink-0 mt-0.5" />}
                        {showWrong && <X className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Rationale Feedback */}
              <AnimatePresence>
                {isAnswerSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="space-y-3"
                  >
                    {(() => {
                      const selectedOpt = currentScenario.options.find((o) => o.id === selectedOptionId);
                      const isCorrect = selectedOpt && selectedOpt.isCorrect;

                      return (
                        <div
                          className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs ${
                            isCorrect
                              ? 'bg-status-success-bg border-status-success-border text-status-success-text'
                              : 'bg-status-danger-bg border-status-danger-border text-status-danger-text'
                          }`}
                        >
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-status-success flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-0.5 flex-1">
                            <p className="font-bold">
                              {isCorrect ? 'Correct! Golden Rule Confirmed.' : 'Incorrect! Severe Trap Identified.'}
                            </p>
                            <p className="text-[11px] leading-relaxed text-content-secondary dark:text-dark-secondaryText">
                              {isCorrect ? currentScenario.correctExplanation : currentScenario.incorrectExplanation}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Next Question Button */}
                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        variant="primary"
                        icon={ArrowRight}
                        onClick={handleNextScenario}
                      >
                        {currentScenarioIndex < CHALLENGE_SCENARIOS.length - 1 ? 'Next Scenario' : 'View Challenge Summary'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Challenge Completed Summary */
            <div className="py-6 px-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center mx-auto shadow-subtle">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-content-primary dark:text-dark-primary">
                  Security Awareness Challenge Complete!
                </h3>
                <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
                  You scored <strong className="text-brand-teal font-bold">{challengeScore}</strong> out of{' '}
                  <strong>{CHALLENGE_SCENARIOS.length}</strong>. Understanding these 5 core deception mechanics significantly reduces your exposure to social engineering and financial fraud.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={RotateCcw}
                  onClick={handleRestartChallenge}
                >
                  Restart Challenge
                </Button>
              </div>
            </div>
          )}
        </Card>
      </section>


      {/* ============================================================
          SECTION 03 & 04: THREAT DISCOVERY, SEARCH & CATEGORIES
          ============================================================ */}
      <section className="space-y-4">
        {/* Search Bar */}
        <div className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scams, threat indicators, attack methods or tactics..."
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-xs sm:text-sm text-content-primary dark:text-dark-primary placeholder:text-content-muted focus:outline-none focus:border-brand-teal shadow-subtle transition-all"
            />
            <Search className="w-4 h-4 text-content-muted absolute left-3.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-md text-content-muted hover:text-content-primary hover:bg-canvas-subtle absolute right-3 transition-colors"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-content-muted dark:text-dark-muted px-1 font-mono">
            <span>
              Showing {filteredGuides.length} of {SCAM_GUIDES.length} threat intelligence modules
            </span>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-brand-teal hover:underline font-sans font-semibold"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Pills (Horizontal scroll on mobile) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === 'All' 
              ? SCAM_GUIDES.length 
              : SCAM_GUIDES.filter((g) => g.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-brand-teal text-white shadow-subtle'
                    : 'bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-content-secondary dark:text-dark-secondaryText hover:text-content-primary hover:bg-canvas-subtle'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-canvas-subtle text-content-muted'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>


      {/* ============================================================
          SECTION 05: THREAT INTELLIGENCE ENCYCLOPEDIA (CORE SECTION)
          ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-brand-teal" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-content-primary dark:text-dark-primary font-mono">
              THREAT INTELLIGENCE ENCYCLOPEDIA
            </h2>
          </div>
          <span className="text-[11px] text-content-muted dark:text-dark-muted font-mono">
            Detailed Attack Profiles & Countermeasures
          </span>
        </div>

        <div className="space-y-4">
          {filteredGuides.length > 0 ? (
            filteredGuides.map((guide) => {
              const Icon = guide.icon;
              const isExpanded = expandedCard === guide.id;

              return (
                <div
                  key={guide.id}
                  className={`rounded-2xl bg-white dark:bg-dark-surface border transition-all duration-200 overflow-hidden shadow-subtle ${
                    isExpanded 
                      ? 'border-brand-teal shadow-card ring-1 ring-brand-teal/20' 
                      : 'border-border dark:border-dark-border hover:border-brand-teal/40 hover:shadow-card'
                  }`}
                >
                  {/* Collapsed Header / Trigger */}
                  <div
                    onClick={() => toggleExpand(guide.id)}
                    className="p-5 sm:p-6 cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-canvas-subtle dark:bg-dark-secondary text-brand-teal flex items-center justify-center flex-shrink-0 border border-border dark:border-dark-border shadow-subtle">
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={guide.badgeVariant} size="xs" dot>
                            {guide.riskLevel}
                          </Badge>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-canvas-subtle dark:bg-dark-secondary text-content-secondary dark:text-dark-secondaryText border border-border dark:border-dark-border">
                            {guide.category}
                          </span>
                          <span className="text-content-muted text-[10px] font-mono hidden md:inline">
                            Vector: {guide.attackVector}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-content-primary dark:text-dark-primary tracking-tight">
                          {guide.title}
                        </h3>

                        <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed max-w-2xl">
                          {guide.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-center flex-shrink-0">
                      <span className="text-xs font-semibold text-brand-teal">
                        {isExpanded ? 'Hide Profile' : 'View Intelligence Profile'}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-canvas-subtle dark:bg-dark-secondary text-content-muted flex items-center justify-center border border-border dark:border-dark-border">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-brand-teal" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Structured Expanded Threat Profile */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-border dark:border-dark-border bg-canvas/40 dark:bg-dark-surface/50"
                      >
                        <div className="p-5 sm:p-7 space-y-6">
                          
                          {/* A. MECHANICS OF DECEPTION */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-brand-teal" />
                              <h4 className="text-xs font-bold uppercase tracking-wider text-content-primary dark:text-dark-primary font-mono">
                                Mechanics of Deception
                              </h4>
                            </div>
                            <div className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
                              <p className="text-xs sm:text-sm text-content-primary dark:text-dark-primary leading-relaxed">
                                {guide.howItWorks}
                              </p>
                            </div>
                          </div>

                          {/* B. KEY RED FLAGS */}
                          <div className="space-y-2.5">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-status-danger" />
                              <h4 className="text-xs font-bold uppercase tracking-wider text-status-danger font-mono">
                                Key Red Flags & Warning Signs
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              {guide.signs.map((sign, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 rounded-xl bg-status-danger-bg/40 border border-status-danger-border flex items-start space-x-3 text-xs"
                                >
                                  <span className="w-5 h-5 rounded-md bg-status-danger text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                    !
                                  </span>
                                  <span className="text-status-danger-text leading-relaxed font-medium">
                                    {sign}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* C. TACTICAL DEFENSE CHECKLIST */}
                          <div className="space-y-2.5">
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                              <h4 className="text-xs font-bold uppercase tracking-wider text-status-success font-mono">
                                Tactical Defense Checklist
                              </h4>
                            </div>

                            <div className="space-y-2">
                              {guide.preventionSteps.map((step, idx) => (
                                <div
                                  key={idx}
                                  className="p-3.5 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border flex items-start space-x-3 text-xs shadow-subtle"
                                >
                                  <div className="w-5 h-5 rounded-md bg-status-success-bg text-status-success flex items-center justify-center flex-shrink-0 mt-0.5 border border-status-success-border">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="space-y-0.5 flex-1">
                                    <span className="font-semibold text-content-primary dark:text-dark-primary">
                                      Step {idx + 1}:
                                    </span>
                                    <p className="text-content-secondary dark:text-dark-secondaryText leading-relaxed">
                                      {step}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* D. DEFINITIVE RULE OF THUMB */}
                          <div className="p-4 sm:p-5 rounded-2xl bg-brand-teal-subtle text-brand-teal-text border border-brand-teal/30 space-y-1.5 shadow-subtle">
                            <div className="flex items-center space-x-1.5 text-brand-teal">
                              <Lightbulb className="w-4 h-4" />
                              <span className="font-bold text-[11px] uppercase font-mono tracking-wider">
                                Definitive Rule of Thumb
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                              {guide.ruleOfThumb}
                            </p>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <Card padding="lg" className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-canvas-subtle dark:bg-dark-secondary text-content-muted flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-content-primary dark:text-dark-primary">
                  No Threat Modules Found
                </h4>
                <p className="text-xs text-content-secondary dark:text-dark-secondaryText">
                  No scam guides matched your search for "{searchQuery}". Try searching for terms like "UPI", "KYC", "parking", or "AnyDesk".
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                Clear Filters & Reset
              </Button>
            </Card>
          )}
        </div>
      </section>


      {/* ============================================================
          SECTION 06: SECURITY DEFENSE GUIDES (EXECUTIVE SUMMARY)
          ============================================================ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-content-primary dark:text-dark-primary font-mono">
              TACTICAL DEFENSE FRAMEWORK
            </h2>
          </div>
          <span className="text-[11px] text-content-muted dark:text-dark-muted font-mono">
            3 Universal Safety Heuristics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card padding="md" className="space-y-2 border-border dark:border-dark-border">
            <div className="w-8 h-8 rounded-lg bg-brand-teal-subtle text-brand-teal flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-content-primary dark:text-dark-primary">
              1. The PIN Rule (UPI)
            </h4>
            <p className="text-[11px] text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Entering your UPI MPIN is strictly for money exiting your account. Receiving funds or refunds never requires entering a PIN.
            </p>
          </Card>

          <Card padding="md" className="space-y-2 border-border dark:border-dark-border">
            <div className="w-8 h-8 rounded-lg bg-brand-blue-subtle text-brand-blue flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-content-primary dark:text-dark-primary">
              2. The Isolation Rule (Links)
            </h4>
            <p className="text-[11px] text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Never follow unprompted KYC links in SMS messages. Inspect destinations using Safe Link Preview or direct browser navigation.
            </p>
          </Card>

          <Card padding="md" className="space-y-2 border-border dark:border-dark-border">
            <div className="w-8 h-8 rounded-lg bg-brand-teal-subtle text-brand-teal flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-content-primary dark:text-dark-primary">
              3. The Physical Check (QR)
            </h4>
            <p className="text-[11px] text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Physically inspect public kiosks and meters. Overlaid stickers with mismatched edges should be treated as malicious quishing traps.
            </p>
          </Card>
        </div>
      </section>


      {/* ============================================================
          SECTION 07: ONE-CLICK SECURITY SIMULATIONS
          ============================================================ */}
      <section className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-teal" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-content-primary dark:text-dark-primary font-mono">
              ONE-CLICK SECURITY SIMULATIONS
            </h2>
          </div>
          <span className="text-[11px] text-content-muted dark:text-dark-muted font-mono">
            Explore realistic attack scenarios & detection heuristics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLES.map((sample) => {
            const Icon = sample.icon;
            return (
              <div
                key={sample.id}
                className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border hover:border-brand-teal shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-canvas-subtle dark:bg-dark-secondary text-brand-teal group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant={sample.badgeVariant} size="xs">
                      {sample.badge}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-content-primary dark:text-dark-primary group-hover:text-brand-teal transition-colors">
                      {sample.title}
                    </h4>
                    <p className="text-[11px] text-content-secondary dark:text-dark-secondaryText mt-1 line-clamp-2 leading-relaxed">
                      {sample.desc}
                    </p>
                  </div>
                </div>

                <Button
                  size="xs"
                  variant="outline"
                  icon={ArrowRight}
                  onClick={() => handleRunSimulation(sample)}
                  className="w-full justify-center group-hover:border-brand-teal"
                >
                  Load Simulation
                </Button>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
