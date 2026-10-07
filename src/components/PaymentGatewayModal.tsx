import React, { useState, useEffect } from 'react';
import { SubscriptionPlan, AuthUser, TransactionRecord } from '../types/matrimony';
import { APP_LOGO } from '../data/mockData';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  plan: SubscriptionPlan | null;
  currentUser: AuthUser | null;
  candidateName?: string;
  onPaymentSuccess: (plan: SubscriptionPlan, txnRecord: TransactionRecord) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'wallet';
type GatewayStep = 'checkout' | 'processing' | 'otp_verification' | 'upi_waiting' | 'success';

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  plan,
  currentUser,
  candidateName,
  onPaymentSuccess,
  onClose,
  onToast,
}) => {
  if (!isOpen || !plan) return null;

  // Selected payment method & details
  const [activeMethod, setActiveMethod] = useState<PaymentMethodType>('upi');
  const [upiSubTab, setUpiSubTab] = useState<'qr' | 'vpa' | 'apps'>('qr');
  const [upiVpa, setUpiVpa] = useState<string>(currentUser?.phone ? `${currentUser.phone.replace(/[^0-9]/g, '').slice(-10)}@upi` : 'user@oksbi');
  
  // Card details
  const [cardNumber, setCardNumber] = useState<string>('4315 2891 0482 4291');
  const [cardExpiry, setCardExpiry] = useState<string>('08/29');
  const [cardCvv, setCardCvv] = useState<string>('842');
  const [cardHolder, setCardHolder] = useState<string>(currentUser?.name || 'श्री रामेश्वर शर्मा');
  const [saveCard, setSaveCard] = useState<boolean>(true);

  // Net banking details
  const [selectedBank, setSelectedBank] = useState<string>('sbi');

  // Wallet details
  const [selectedWallet, setSelectedWallet] = useState<string>('paytm');

  // Coupon code state
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string>('');

  // Flow State
  const [currentStep, setCurrentStep] = useState<GatewayStep>('checkout');
  const [timerSeconds, setTimerSeconds] = useState<number>(300); // 5 mins QR expiry
  const [otpValue, setOtpValue] = useState<string>('8492');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState<boolean>(false);
  const [completedTxn, setCompletedTxn] = useState<TransactionRecord | null>(null);

  // Dynamic calculations
  const basePrice = plan.price;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalPayable = Math.max(1, basePrice - couponDiscount);
  const orderId = `ORD_SB_${Date.now().toString().slice(-8)}`;

  // QR Timer Countdown
  useEffect(() => {
    if (!isOpen || currentStep !== 'checkout') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, currentStep]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Coupon Application
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError('');
    if (code === 'SHUBH10' || code === 'BDE10') {
      const disc = Math.round(basePrice * 0.1);
      setAppliedCoupon({ code, discount: disc });
      setCouponCode(code);
      onToast(`कूपन '${code}' लागू हुआ! ₹${disc} की छूट मिली 🎉`);
    } else if (code === 'FESTIVE500') {
      const disc = Math.min(500, basePrice - 100);
      setAppliedCoupon({ code, discount: disc });
      setCouponCode(code);
      onToast(`कूपन '${code}' लागू हुआ! ₹${disc} की छूट मिली 🎉`);
    } else if (code === 'FIRSTMATCH') {
      const disc = 300;
      setAppliedCoupon({ code, discount: disc });
      setCouponCode(code);
      onToast(`कूपन '${code}' लागू हुआ! ₹${disc} की छूट मिली 🎉`);
    } else {
      setCouponError('अमान्य कूपन कोड। कृपया SHUBH10 या FESTIVE500 आज़माएँ।');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Card formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('6') || clean.startsWith('508')) return 'RuPay';
    return 'Card';
  };

  // Trigger Payment
  const handleInitiatePayment = () => {
    setCurrentStep('processing');

    setTimeout(() => {
      if (activeMethod === 'upi') {
        setCurrentStep('upi_waiting');
      } else {
        // Card or Netbanking -> 3D Secure ACS
        setCurrentStep('otp_verification');
      }
    }, 1200);
  };

  // Confirm Payment (from OTP or UPI approval)
  const handleFinalizeSuccess = () => {
    const randomTxnId = `TXN-SB-${Math.floor(100000 + Math.random() * 900000)}`;
    const randomGatewayRef = `pay_live_${Math.random().toString(36).substring(2, 11)}`;

    let methodLabel = 'UPI (QR Code)';
    if (activeMethod === 'upi') {
      methodLabel = upiSubTab === 'vpa' ? `UPI VPA (${upiVpa})` : upiSubTab === 'apps' ? 'UPI (App Intent)' : 'UPI (Dynamic QR)';
    } else if (activeMethod === 'card') {
      methodLabel = `${getCardBrand(cardNumber)} Card (•••• ${cardNumber.slice(-4)})`;
    } else if (activeMethod === 'netbanking') {
      const bankNames: Record<string, string> = {
        sbi: 'State Bank of India',
        hdfc: 'HDFC Bank',
        icici: 'ICICI Bank',
        pnb: 'Punjab National Bank',
        axis: 'Axis Bank',
        bob: 'Bank of Baroda',
        kotak: 'Kotak Mahindra Bank',
      };
      methodLabel = `NetBanking (${bankNames[selectedBank] || selectedBank.toUpperCase()})`;
    } else if (activeMethod === 'wallet') {
      methodLabel = `Wallet (${selectedWallet.toUpperCase()})`;
    }

    const newTxn: TransactionRecord = {
      id: `txn-${Date.now()}`,
      txnId: randomTxnId,
      timestamp: new Date().toLocaleDateString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      userId: currentUser?.id || `user-${Date.now()}`,
      userName: currentUser?.name || 'पंजीकृत परिवार',
      userPhone: currentUser?.phone || '+91 98391 20455',
      candidateName: candidateName || currentUser?.candidateName || 'वर/वधू प्रत्याशी',
      planId: plan.id,
      planName: `${plan.hindiTitle} (${plan.title})`,
      amount: finalPayable,
      paymentMethod: methodLabel,
      status: 'success',
      bdeCode: currentUser?.bdeCode,
      gatewayRef: randomGatewayRef,
    };

    setCompletedTxn(newTxn);
    setCurrentStep('success');
    onPaymentSuccess(plan, newTxn);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#231b14]/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e3bfb4] overflow-hidden flex flex-col my-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gateway Security Header Bar */}
        <div className="bg-gradient-to-r from-[#ab3100] via-[#8e4b00] to-[#5a1800] text-white px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <img
              src={APP_LOGO}
              alt="Shubh Bandhan"
              className="h-7 w-auto object-contain bg-white/10 rounded px-1"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[15px] tracking-tight font-['Noto_Sans']">
                  Shubh Bandhan Pay
                </span>
                <span className="text-[10px] bg-white/20 text-[#ffdcc3] px-1.5 py-0.2 rounded font-bold uppercase">
                  Gateway
                </span>
              </div>
              <p className="text-[10px] text-[#faefe4]/90 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-emerald-300">lock</span>
                <span>256-bit Bank Grade SSL • PCI-DSS Level 1 • NPCI Certified</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="बंद करें"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* STEP 1: CHECKOUT VIEW */}
        {currentStep === 'checkout' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            {/* Top Order & Plan Header */}
            <div className="p-3.5 rounded-2xl bg-[#fff8f3] border border-[#e3bfb4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#ab3100] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-[16px] text-[#1f1b14]">
                      {plan.hindiTitle} ({plan.title})
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-[#ffdcc3] text-[#ab3100]">
                      {plan.durationMonths} माह वैधता
                    </span>
                  </div>
                  <p className="text-[12px] text-[#5a4139] mt-0.5">
                    {candidateName ? `प्रत्याशी: ${candidateName}` : currentUser?.candidateName ? `प्रत्याशी: ${currentUser.candidateName}` : 'वर/वधू प्रत्याशी'} • {plan.contactCredits} सीधे परिवार नंबर अनलॉक
                  </p>
                </div>
              </div>

              <div className="text-right self-end sm:self-center">
                <span className="text-[10px] text-gray-500 line-through block">
                  ₹{plan.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[22px] font-black text-[#ab3100]">
                  ₹{finalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Coupon Code Strip */}
            <div className="p-3 rounded-xl bg-white border border-[#e3bfb4]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="material-symbols-outlined text-[#8e4b00] text-[20px]">sell</span>
                <span className="text-[12px] font-bold text-[#1f1b14]">कूपन / डिस्काउंट कोड:</span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-[12px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    <span>'{appliedCoupon.code}' लागू (₹{appliedCoupon.discount} छूट)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] text-red-600 hover:underline font-bold"
                  >
                    हटाएं
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="SHUBH10 या BDE10"
                    className="flex-1 sm:w-36 px-2.5 py-1.5 rounded-lg border border-[#e3bfb4] text-[12px] uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#ab3100]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-3 py-1.5 rounded-lg bg-[#ab3100] text-white text-[11px] font-bold hover:bg-[#852400] transition-colors"
                  >
                    लागू करें
                  </button>
                </div>
              )}
            </div>

            {couponError && (
              <p className="text-[11px] text-red-600 font-semibold -mt-2">{couponError}</p>
            )}

            {/* Quick Coupon Suggestions */}
            {!appliedCoupon && (
              <div className="flex items-center gap-2 -mt-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] text-gray-500 shrink-0">ऑफ़र कोड:</span>
                {[
                  { code: 'SHUBH10', label: '10% छूट (SHUBH10)' },
                  { code: 'FESTIVE500', label: '₹500 छूट (FESTIVE500)' },
                  { code: 'BDE10', label: 'BDE रेफ़रल (BDE10)' },
                ].map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleApplyCoupon(c.code)}
                    className="px-2 py-0.5 rounded-md bg-[#fff8f3] border border-dashed border-[#ab3100] text-[#ab3100] text-[10px] font-bold hover:bg-[#fdeee4] shrink-0 cursor-pointer"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {/* Payment Method Selector Tabs */}
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#1f1b14] flex items-center justify-between">
                <span>भुगतान माध्यम चुनें (Select Payment Option):</span>
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  <span>Instant 0% Gateway Fee</span>
                </span>
              </span>

              <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#f5ede4] rounded-2xl border border-[#e3bfb4]/70">
                {[
                  { id: 'upi' as PaymentMethodType, name: 'UPI / QR', icon: 'qr_code_scanner', badge: 'Fastest' },
                  { id: 'card' as PaymentMethodType, name: 'Cards', icon: 'credit_card', badge: 'All Banks' },
                  { id: 'netbanking' as PaymentMethodType, name: 'NetBanking', icon: 'account_balance', badge: '50+ Banks' },
                  { id: 'wallet' as PaymentMethodType, name: 'Wallets', icon: 'account_balance_wallet', badge: 'Paytm/Amazon' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveMethod(tab.id)}
                    className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      activeMethod === tab.id
                        ? 'bg-white text-[#ab3100] font-black shadow-xs ring-1 ring-[#ab3100]/30'
                        : 'text-[#5a4139] hover:bg-white/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                    <span className="text-[11px] font-bold leading-tight">{tab.name}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.1 rounded-full ${
                      activeMethod === tab.id ? 'bg-[#ffdcc3] text-[#ab3100]' : 'bg-white/60 text-gray-600'
                    }`}>
                      {tab.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT 1: UPI */}
            {activeMethod === 'upi' && (
              <div className="p-4 rounded-2xl bg-white border border-[#e3bfb4] flex flex-col gap-3 shadow-xs">
                {/* UPI Sub-Tabs */}
                <div className="flex border-b border-gray-100 pb-2 gap-2">
                  {[
                    { id: 'qr' as const, label: '📷 Scan QR Code' },
                    { id: 'vpa' as const, label: '✍️ Enter UPI ID / VPA' },
                    { id: 'apps' as const, label: '📱 1-Click UPI Apps' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setUpiSubTab(sub.id)}
                      className={`text-[12px] font-bold pb-1 px-2 transition-all cursor-pointer border-b-2 ${
                        upiSubTab === sub.id
                          ? 'border-[#ab3100] text-[#ab3100]'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {upiSubTab === 'qr' && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                    {/* Dynamic QR Code Render */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="p-3 bg-white rounded-2xl border-2 border-[#ab3100] shadow-md relative">
                        {/* Realistic SVG UPI QR Pattern */}
                        <svg className="w-36 h-36" viewBox="0 0 140 140" fill="none">
                          <rect width="140" height="140" fill="white" />
                          {/* Corner Squares */}
                          <rect x="10" y="10" width="35" height="35" stroke="#1f1b14" strokeWidth="6" rx="4" />
                          <rect x="20" y="20" width="15" height="15" fill="#ab3100" rx="2" />
                          <rect x="95" y="10" width="35" height="35" stroke="#1f1b14" strokeWidth="6" rx="4" />
                          <rect x="105" y="20" width="15" height="15" fill="#ab3100" rx="2" />
                          <rect x="10" y="95" width="35" height="35" stroke="#1f1b14" strokeWidth="6" rx="4" />
                          <rect x="20" y="105" width="15" height="15" fill="#ab3100" rx="2" />
                          {/* Simulated QR matrix dots */}
                          <circle cx="55" cy="20" r="4" fill="#1f1b14" />
                          <circle cx="70" cy="20" r="4" fill="#ab3100" />
                          <circle cx="80" cy="20" r="4" fill="#1f1b14" />
                          <circle cx="60" cy="35" r="4" fill="#1f1b14" />
                          <circle cx="75" cy="35" r="4" fill="#1f1b14" />
                          <circle cx="20" cy="60" r="4" fill="#1f1b14" />
                          <circle cx="35" cy="60" r="4" fill="#ab3100" />
                          <circle cx="50" cy="60" r="4" fill="#1f1b14" />
                          <circle cx="65" cy="60" r="4" fill="#1f1b14" />
                          <circle cx="80" cy="60" r="4" fill="#ab3100" />
                          <circle cx="95" cy="60" r="4" fill="#1f1b14" />
                          <circle cx="110" cy="60" r="4" fill="#1f1b14" />
                          <circle cx="125" cy="60" r="4" fill="#ab3100" />
                          <circle cx="20" cy="75" r="4" fill="#ab3100" />
                          <circle cx="35" cy="75" r="4" fill="#1f1b14" />
                          <circle cx="50" cy="75" r="4" fill="#1f1b14" />
                          <circle cx="70" cy="70" r="10" fill="#ab3100" />
                          <text x="70" y="74" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">₹</text>
                          <circle cx="90" cy="75" r="4" fill="#1f1b14" />
                          <circle cx="105" cy="75" r="4" fill="#1f1b14" />
                          <circle cx="120" cy="75" r="4" fill="#1f1b14" />
                          <circle cx="55" cy="95" r="4" fill="#1f1b14" />
                          <circle cx="70" cy="95" r="4" fill="#ab3100" />
                          <circle cx="85" cy="95" r="4" fill="#1f1b14" />
                          <circle cx="105" cy="95" r="4" fill="#1f1b14" />
                          <circle cx="120" cy="95" r="4" fill="#ab3100" />
                          <circle cx="55" cy="115" r="4" fill="#1f1b14" />
                          <circle cx="75" cy="115" r="4" fill="#1f1b14" />
                          <circle cx="95" cy="115" r="4" fill="#ab3100" />
                          <circle cx="115" cy="115" r="4" fill="#1f1b14" />
                        </svg>

                        <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#1b5e20] text-white text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-xs">
                          NPCI Verified UPI
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 mt-1">
                        <span className="material-symbols-outlined text-[14px]">timer</span>
                        <span>QR मान्य समय: {formatTimer(timerSeconds)}</span>
                      </div>
                    </div>

                    {/* QR Instructions & App logos */}
                    <div className="flex-1 space-y-2.5">
                      <div>
                        <h4 className="font-bold text-[14px] text-[#1f1b14]">
                          किसी भी UPI ऐप से स्कैन करें (Scan with Any App)
                        </h4>
                        <p className="text-[12px] text-[#5a4139] mt-0.5">
                          Google Pay, PhonePe, Paytm, BHIM या CRED ऐप खोलें और इस QR कोड को स्कैन करके ₹{finalPayable} का भुगतान करें।
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'CRED'].map((app) => (
                          <span
                            key={app}
                            className="px-2 py-1 bg-[#fdf2e6] border border-[#e3bfb4] rounded-lg text-[11px] font-bold text-[#8e4b00]"
                          >
                            {app}
                          </span>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                        <strong>ऑटो-डिटेक्ट एक्टिव:</strong> भुगतान होते ही आपकी योजना तुरंत सक्रिय हो जाएगी और सभी संपर्क क्रेडिट्स जुड़ जाएंगे।
                      </div>
                    </div>
                  </div>
                )}

                {upiSubTab === 'vpa' && (
                  <div className="space-y-3 py-1">
                    <div>
                      <label className="text-[12px] font-bold text-[#1f1b14] block mb-1">
                        Enter UPI ID / Virtual Payment Address (VPA):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          placeholder="e.g. 9839120455@ybl or user@oksbi"
                          className="flex-1 px-3 py-2 rounded-xl border border-[#e3bfb4] text-[13px] font-semibold text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#ab3100]/30"
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        A payment request of ₹{finalPayable} will be sent to your UPI app.
                      </p>
                    </div>

                    {/* VPA Fast Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-500">Quick Suffix:</span>
                      {['@oksbi', '@okhdfcbank', '@paytm', '@ybl', '@axl'].map((suf) => (
                        <button
                          key={suf}
                          type="button"
                          onClick={() => {
                            const prefix = upiVpa.split('@')[0] || '9839120455';
                            setUpiVpa(prefix + suf);
                          }}
                          className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-gray-700"
                        >
                          {suf}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {upiSubTab === 'apps' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
                    {[
                      { name: 'Google Pay', icon: 'payments', desc: 'Instant UPI' },
                      { name: 'PhonePe', icon: 'account_balance_wallet', desc: 'Direct UPI' },
                      { name: 'Paytm UPI', icon: 'qr_code', desc: 'Fast Pay' },
                      { name: 'CRED UPI', icon: 'credit_score', desc: 'Rewards' },
                    ].map((app) => (
                      <button
                        key={app.name}
                        type="button"
                        onClick={handleInitiatePayment}
                        className="p-3 rounded-xl border border-[#e3bfb4] hover:border-[#ab3100] hover:bg-[#fff8f3] text-left transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <span className="material-symbols-outlined text-[#ab3100] text-[24px] mb-1">
                          {app.icon}
                        </span>
                        <div>
                          <strong className="text-[12px] text-[#1f1b14] block leading-tight">{app.name}</strong>
                          <span className="text-[10px] text-gray-500">{app.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: CARDS */}
            {activeMethod === 'card' && (
              <div className="p-4 rounded-2xl bg-white border border-[#e3bfb4] flex flex-col gap-3 shadow-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[12px] font-bold text-[#1f1b14]">Card Number:</label>
                    <span className="text-[11px] font-extrabold text-[#ab3100] bg-[#ffdcc3] px-2 py-0.2 rounded">
                      {getCardBrand(cardNumber)}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4315 2891 0482 4291"
                    maxLength={19}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3bfb4] font-mono text-[14px] font-bold text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#ab3100]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-bold text-[#1f1b14] block mb-1">Valid Thru (MM/YY):</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="08/29"
                      maxLength={5}
                      className="w-full px-3 py-2 rounded-xl border border-[#e3bfb4] font-mono text-[13px] font-bold text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#ab3100]/30 text-center"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[12px] font-bold text-[#1f1b14]">CVV:</label>
                      <span className="text-[10px] text-gray-400">3 digits on back</span>
                    </div>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full px-3 py-2 rounded-xl border border-[#e3bfb4] font-mono text-[13px] font-bold text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#ab3100]/30 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-[#1f1b14] block mb-1">Name on Card:</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="CARDHOLDER NAME"
                    className="w-full px-3 py-2 rounded-xl border border-[#e3bfb4] text-[13px] font-semibold text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#ab3100]/30"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="accent-[#ab3100] w-4 h-4 rounded"
                  />
                  <span className="text-[11px] text-[#5a4139]">
                    Securely save card for future faster renewals as per RBI tokenization guidelines.
                  </span>
                </label>
              </div>
            )}

            {/* TAB CONTENT 3: NET BANKING */}
            {activeMethod === 'netbanking' && (
              <div className="p-4 rounded-2xl bg-white border border-[#e3bfb4] flex flex-col gap-3 shadow-xs">
                <span className="text-[12px] font-bold text-[#1f1b14]">Popular Indian Banks:</span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'sbi', name: 'State Bank of India', tag: 'SBI' },
                    { id: 'hdfc', name: 'HDFC Bank', tag: 'HDFC' },
                    { id: 'icici', name: 'ICICI Bank', tag: 'ICICI' },
                    { id: 'pnb', name: 'Punjab National Bank', tag: 'PNB' },
                    { id: 'axis', name: 'Axis Bank', tag: 'AXIS' },
                    { id: 'bob', name: 'Bank of Baroda', tag: 'BOB' },
                    { id: 'kotak', name: 'Kotak Mahindra', tag: 'KOTAK' },
                    { id: 'canara', name: 'Canara Bank', tag: 'CANARA' },
                  ].map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedBank === bank.id
                          ? 'bg-[#ab3100]/10 border-[#ab3100] text-[#ab3100] font-black'
                          : 'border-gray-200 text-[#5a4139] hover:bg-gray-50'
                      }`}
                    >
                      <strong className="text-[13px] block">{bank.tag}</strong>
                      <span className="text-[10px] truncate block opacity-90">{bank.name}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                    Or select from 50+ other banks:
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3bfb4] text-[12px] bg-white font-medium text-[#1f1b14]"
                  >
                    <option value="sbi">State Bank of India (SBI)</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="pnb">Punjab National Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="bob">Bank of Baroda</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                    <option value="union">Union Bank of India</option>
                    <option value="idbi">IDBI Bank</option>
                    <option value="indusind">IndusInd Bank</option>
                    <option value="yes">Yes Bank</option>
                    <option value="rbl">RBL Bank</option>
                    <option value="central">Central Bank of India</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: WALLETS */}
            {activeMethod === 'wallet' && (
              <div className="p-4 rounded-2xl bg-white border border-[#e3bfb4] flex flex-col gap-3 shadow-xs">
                <span className="text-[12px] font-bold text-[#1f1b14]">Select Wallet or PayLater:</span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'paytm', name: 'Paytm Wallet', icon: 'account_balance_wallet' },
                    { id: 'phonepe', name: 'PhonePe Wallet', icon: 'payments' },
                    { id: 'amazon', name: 'Amazon Pay', icon: 'shopping_bag' },
                    { id: 'mobikwik', name: 'MobiKwik', icon: 'wallet' },
                    { id: 'simpl', name: 'Simpl PayLater', icon: 'credit_card' },
                    { id: 'lazypay', name: 'LazyPay', icon: 'schedule' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedWallet(w.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedWallet === w.id
                          ? 'bg-[#ab3100]/10 border-[#ab3100] text-[#ab3100] font-black'
                          : 'border-gray-200 text-[#5a4139] hover:bg-gray-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] mb-1">{w.icon}</span>
                      <strong className="text-[12px] block">{w.name}</strong>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Action Bar */}
            <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="material-symbols-outlined text-green-700 text-[20px]">verified_user</span>
                <div className="text-[11px] text-[#5a4139]">
                  <strong>100% सुरक्षित भुगतान:</strong> RBI दिशानिर्देशों के अनुसार 256-bit एन्क्रिप्टेड
                </div>
              </div>

              <button
                type="button"
                onClick={handleInitiatePayment}
                className="w-full sm:w-auto min-w-[200px] py-3 px-5 rounded-2xl bg-[#ab3100] hover:bg-[#852400] text-white text-[14px] font-black shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>₹{finalPayable.toLocaleString('en-IN')} का भुगतान करें</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GATEWAY CONNECTING / PROCESSING */}
        {currentStep === 'processing' && (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-[#fff0eb] text-[#ab3100] flex items-center justify-center relative">
              <span className="material-symbols-outlined text-[36px] animate-spin">progress_activity</span>
            </div>
            <div>
              <h3 className="font-extrabold text-[18px] text-[#1f1b14]">
                बैंक भुगतान गेटवे से सुरक्षित संपर्क हो रहा है...
              </h3>
              <p className="text-[12px] text-[#5a4139] mt-1 max-w-sm mx-auto">
                कृपया विंडो को रीफ़्रेश या बंद न करें। 256-bit बैंक सुरक्षा प्रोटोकॉल आरंभ हो रहा है।
              </p>
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded-full text-[11px] font-mono text-gray-600">
              OrderID: {orderId} • Amount: ₹{finalPayable}
            </div>
          </div>
        )}

        {/* STEP 3A: UPI APPROVAL WAITING SCREEN */}
        {currentStep === 'upi_waiting' && (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center gap-4 text-center my-auto">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center relative">
              <span className="material-symbols-outlined text-[36px] animate-pulse">phonelink_ring</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase text-[#ab3100] bg-[#ffdcc3] px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                UPI Payment Request Sent
              </span>
              <h3 className="font-extrabold text-[18px] text-[#1f1b14]">
                अपने UPI ऐप में भुगतान को स्वीकृति दें (Approve in UPI App)
              </h3>
              <p className="text-[12px] text-[#5a4139] mt-1 max-w-md mx-auto">
                आपके UPI ऐप (Google Pay / PhonePe / Paytm) पर ₹{finalPayable} का अनुरोध भेजा गया है। कृपया ऐप खोलकर UPI PIN दर्ज करें।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fff8f3] border border-[#e3bfb4] text-left max-w-md w-full space-y-1.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Payee:</span>
                <strong className="text-[#1f1b14]">Shubh Bandhan Matrimony Ltd</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">UPI Ref:</span>
                <strong className="font-mono text-[#ab3100]">shubhbandhan@icici</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <strong className="font-bold text-emerald-800">₹{finalPayable.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Simulation and fallback button */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md mt-2">
              <button
                type="button"
                onClick={handleFinalizeSuccess}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1b5e20] hover:bg-[#124116] text-white text-[13px] font-bold shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>✅ Simulate UPI Approval (तुरंत स्वीकृत करें)</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('checkout')}
                className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-semibold transition-colors cursor-pointer"
              >
                रद्द करें / माध्यम बदलें
              </button>
            </div>
          </div>
        )}

        {/* STEP 3B: CARD / NETBANKING 3D-SECURE BANK OTP VIEW */}
        {currentStep === 'otp_verification' && (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center gap-4 text-center my-auto">
            {/* Authentic Bank 3D Secure ACS Header */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white w-full max-w-md flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px]">account_balance</span>
                <div className="text-left">
                  <h4 className="font-bold text-[13px] leading-tight">
                    {activeMethod === 'card' ? `${getCardBrand(cardNumber)} 3D Secure ACS` : 'State Bank of India Secure OTP'}
                  </h4>
                  <span className="text-[10px] text-blue-200">Verified by Visa / RuPay PaySecure</span>
                </div>
              </div>
              <span className="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded">
                OTP-3DS
              </span>
            </div>

            <div className="max-w-md w-full text-left space-y-1">
              <h3 className="font-bold text-[16px] text-[#1f1b14]">
                वन-टाइम पासवर्ड (OTP) दर्ज करें
              </h3>
              <p className="text-[12px] text-[#5a4139]">
                आपके पंजीकृत मोबाइल नंबर पर 4-अंकीय बैंक सुरक्षा OTP भेजा गया है।
              </p>
            </div>

            <div className="max-w-md w-full space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-[12px]">
                <span className="text-gray-600">Merchant: Shubh Bandhan Matrimony</span>
                <strong className="text-emerald-800 font-bold">₹{finalPayable.toLocaleString('en-IN')}</strong>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-[11px]">
                  <span className="text-gray-600">Enter OTP (Demo OTP: 8492):</span>
                  <span className="text-[#ab3100] font-bold">Expires in 02:45</span>
                </div>
                <input
                  type="text"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  maxLength={6}
                  className="w-full py-2.5 px-3 rounded-xl border-2 border-[#ab3100] font-mono text-[20px] font-black tracking-widest text-center text-[#1f1b14] focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleFinalizeSuccess}
                  className="flex-1 py-3 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white text-[13px] font-black shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Submit OTP & Authorize Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToast('नया सुरक्षा OTP 8492 आपके फोन पर पुनः भेजा गया!')}
                  className="px-3 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS RECEIPT VIEW */}
        {currentStep === 'success' && completedTxn && (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center gap-4 text-center my-auto">
            {/* Animated Celebration Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-md animate-bounce">
              <span className="material-symbols-outlined text-[38px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full inline-block mb-1">
                Payment Received • 100% Confirmed
              </span>
              <h3 className="font-extrabold text-[20px] text-[#1f1b14]">
                बधाई हो! भुगतान सफल हुआ (Payment Successful)
              </h3>
              <p className="text-[13px] text-[#5a4139] mt-0.5">
                आपकी {plan.hindiTitle} सक्रिय हो गई है। {plan.contactCredits} अभिभावक संपर्क क्रेडिट्स आपके खाते में तुरंत जोड़ दिए गए हैं!
              </p>
            </div>

            {/* Official Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-[#fff8f3] border border-[#e3bfb4] text-left max-w-md w-full space-y-2 text-[12px] shadow-xs">
              <div className="flex justify-between border-b border-[#e3bfb4]/50 pb-1.5">
                <span className="text-gray-500">Transaction ID:</span>
                <strong className="font-mono text-[#ab3100]">{completedTxn.txnId}</strong>
              </div>
              <div className="flex justify-between border-b border-[#e3bfb4]/50 pb-1.5">
                <span className="text-gray-500">Gateway Ref:</span>
                <strong className="font-mono text-gray-700">{completedTxn.gatewayRef}</strong>
              </div>
              <div className="flex justify-between border-b border-[#e3bfb4]/50 pb-1.5">
                <span className="text-gray-500">Amount Paid:</span>
                <strong className="text-emerald-800 font-extrabold text-[14px]">
                  ₹{completedTxn.amount.toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between border-b border-[#e3bfb4]/50 pb-1.5">
                <span className="text-gray-500">Payment Mode:</span>
                <strong className="text-[#1f1b14]">{completedTxn.paymentMethod}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Timestamp:</span>
                <span className="text-gray-600 font-medium">{completedTxn.timestamp}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md">
              <button
                type="button"
                onClick={() => setIsInvoiceOpen(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-[#fff8f3] border-2 border-[#ab3100] text-[#ab3100] text-[13px] font-bold shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                <span>Tax Invoice देखें / प्रिंट करें</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white text-[13px] font-bold shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                <span>रिश्ते देखना शुरू करें</span>
              </button>
            </div>
          </div>
        )}

        {/* GST TAX INVOICE MODAL */}
        {isInvoiceOpen && completedTxn && (
          <div
            className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in"
            onClick={() => setIsInvoiceOpen(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative text-left overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsInvoiceOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700"
              >
                ✕
              </button>

              {/* Invoice Header */}
              <div className="border-b-2 border-[#ab3100] pb-3 mb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <img src={APP_LOGO} alt="Shubh Bandhan" className="h-8 w-auto object-contain" />
                    <div>
                      <h3 className="font-extrabold text-[16px] text-[#ab3100]">
                        शुभ बंधन मैट्रिमोनी प्राइवेट लिमिटेड
                      </h3>
                      <p className="text-[10px] text-gray-500 font-medium">
                        Shubh Bandhan Matrimonial Services Pvt. Ltd.
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    वाराणसी कार्यालय: कबीर चौरा, वाराणसी, उ.प्र. - 221001<br />
                    पटना कार्यालय: बेली रोड, पटना, बिहार - 800001
                  </p>
                  <p className="text-[10px] font-mono font-bold text-gray-700 mt-0.5">
                    GSTIN: 09AAECS8819Q1ZT • CIN: U74999UP2024PTC189210
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded uppercase">
                    Tax Invoice / रसीद
                  </span>
                  <p className="text-[11px] font-mono font-bold text-gray-800 mt-1">
                    INV-{completedTxn.txnId.replace('TXN-', '')}
                  </p>
                  <p className="text-[10px] text-gray-500">{completedTxn.timestamp.split(',')[0]}</p>
                </div>
              </div>

              {/* Bill To Info */}
              <div className="p-3 bg-gray-50 rounded-xl mb-4 text-[11px] space-y-0.5 border border-gray-200">
                <span className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">
                  Billed To (ग्राहक विवरण):
                </span>
                <p className="font-bold text-[13px] text-[#1f1b14]">{completedTxn.userName}</p>
                <p className="text-gray-600">प्रत्याशी: {completedTxn.candidateName}</p>
                <p className="text-gray-600 font-mono">फोन: {completedTxn.userPhone}</p>
                {completedTxn.bdeCode && (
                  <p className="text-[#8e4b00] font-bold">संबद्ध BDE कोड: {completedTxn.bdeCode}</p>
                )}
              </div>

              {/* Invoice Table */}
              <table className="w-full text-[11px] mb-4 border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-[#fff8f3] text-[#8e4b00] font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-2 text-left">विवरण (Description)</th>
                    <th className="p-2 text-center">SAC कोड</th>
                    <th className="p-2 text-right">राशि (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-2 font-medium">
                      {completedTxn.planName}
                      <span className="block text-[10px] text-gray-500">
                        {plan.contactCredits} संपर्क क्रेडिट्स • {plan.durationMonths} माह सदस्यता
                      </span>
                    </td>
                    <td className="p-2 text-center font-mono">998397</td>
                    <td className="p-2 text-right font-mono font-bold">
                      ₹{(completedTxn.amount / 1.18).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1.5 text-right text-gray-500">
                      CGST (9%):
                    </td>
                    <td className="p-1.5 text-right font-mono">
                      ₹{((completedTxn.amount - completedTxn.amount / 1.18) / 2).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1.5 text-right text-gray-500">
                      SGST (9%):
                    </td>
                    <td className="p-1.5 text-right font-mono">
                      ₹{((completedTxn.amount - completedTxn.amount / 1.18) / 2).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bg-[#fff8f3] font-black text-[12px]">
                    <td colSpan={2} className="p-2 text-right text-[#1f1b14]">
                      कुल भुगतान (Total Paid):
                    </td>
                    <td className="p-2 text-right text-[#ab3100] font-mono text-[14px]">
                      ₹{completedTxn.amount.toLocaleString('en-IN')}.00
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Method & Signatory Seal */}
              <div className="flex justify-between items-end text-[10px] pt-2 border-t border-gray-200">
                <div>
                  <span className="text-gray-500 block">भुगतान माध्यम:</span>
                  <strong className="text-gray-800 font-semibold">{completedTxn.paymentMethod}</strong>
                  <span className="text-gray-500 block font-mono mt-0.5">
                    Gateway Ref: {completedTxn.gatewayRef}
                  </span>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="w-20 h-10 border border-dashed border-emerald-600 rounded flex items-center justify-center text-emerald-800 text-[8px] font-black uppercase text-center leading-tight">
                    AUTHORIZED<br />DIGITAL SEAL
                  </div>
                  <span className="text-gray-500 mt-1">अधिकृत हस्ताक्षरकर्ता</span>
                </div>
              </div>

              {/* Print CTA */}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    onToast('Tax Invoice प्रिंट कमांड भेजी गई 🖨️');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#ab3100] text-white text-[12px] font-bold hover:bg-[#852400] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Print / Save as PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(false)}
                  className="py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-semibold"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
