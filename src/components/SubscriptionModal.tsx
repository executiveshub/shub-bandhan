import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '../data/mockData';
import { SubscriptionPlan, SubscriptionTier, UserSubscription } from '../types/matrimony';

interface SubscriptionModalProps {
  isOpen: boolean;
  userSubscription: UserSubscription;
  candidateName?: string;
  isRegistered?: boolean;
  onSelectPlan: (plan: SubscriptionPlan, paymentMethod: string) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  candidateName,
  isRegistered = true,
  onSelectPlan,
  onClose,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionTier>('gold');
  const [paymentMethod, setPaymentMethod] = useState<string>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];

  const handlePay = () => {
    if (!isRegistered) {
      onSelectPlan(selectedPlan, paymentMethod);
      onClose();
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
      onSelectPlan(selectedPlan, paymentMethod);
    }, 250);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#353028]/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#fff8f3] rounded-t-3xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto flex flex-col gap-4 shadow-2xl border-2 border-[#d3430c]/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e3bfb4]/50 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-[#ab3100]">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                workspace_premium
              </span>
              <span className="text-[12px] font-bold uppercase tracking-wider">
                शुभ बंधन सदस्यता योजना
              </span>
            </div>
            <h3 className="font-bold text-[19px] text-[#1f1b14] mt-0.5">
              {candidateName
                ? `${candidateName} जी के परिवार से सीधा संपर्क अनलॉक करें`
                : 'वर-वधू के अभिभावकों से सीधा संपर्क शुरू करें'}
            </h3>
            <p className="text-[12px] text-[#5a4139] mt-0.5">
              बिना सदस्यता के परिवारों से सीधा फोन व WhatsApp संपर्क संभव नहीं है।
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f1e7db] hover:bg-[#ebe1d6] flex items-center justify-center text-[#1f1b14] shrink-0"
            aria-label="बंद करें"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Reason / Notice Strip */}
        <div className="p-3 rounded-xl bg-[#ffdcc3]/50 border border-[#e3bfb4] flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#8e4b00] text-[22px] shrink-0">
            lock
          </span>
          <p className="text-[12px] text-[#6e3900] leading-snug">
            <strong>सुरक्षा व गोपनीयता नियम:</strong> केवल गंभीर व सत्यापित सदस्यों को ही अभिभावकों (माता-पिता/भाई) के सीधे मोबाइल नंबर उपलब्ध कराए जाते हैं।
          </p>
        </div>

        {/* If user is not registered yet, display registration required notice */}
        {!isRegistered && (
          <div className="p-3.5 rounded-xl bg-[#fff3e0] border-2 border-[#ffb74d] text-[#4e2600] flex items-start gap-2.5 shadow-xs">
            <span className="material-symbols-outlined text-[#e65100] text-[22px] shrink-0 mt-0.5">
              assignment_ind
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#ff6f00] text-white uppercase">
                  पंजीकरण आवश्यक
                </span>
                <p className="font-bold text-[12px]">पहले निःशुल्क पंजीकरण पूरा करें</p>
              </div>
              <p className="text-[11px] text-[#6d3800] mt-0.5 leading-snug">
                बिना पंजीकरण के सीधा प्लान सक्रिय नहीं हो सकता। 'पंजीकरण के लिए आगे बढ़ें' दबाने पर आपको सीधे पंजीकरण फॉर्म पर भेजा जाएगा। फॉर्म सबमिट होते ही आपकी योजना सक्रिय हो जाएगी।
              </p>
            </div>
          </div>
        )}

        {/* Plans Selector Cards */}
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-bold text-[#1f1b14]">
            अपनी सुविधानुसार योजना चुनें:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative p-3.5 rounded-2xl cursor-pointer transition-all border-2 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-[#ab3100] shadow-md ring-2 ring-[#ab3100]/20'
                      : 'bg-[#fdf2e6] border-[#e3bfb4]/60 hover:bg-white'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#ab3100] text-white text-[10px] font-bold whitespace-nowrap shadow-xs">
                      ⭐ सर्वाधिक लोकप्रिय
                    </span>
                  )}

                  <div>
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-[15px] text-[#1f1b14]">{plan.hindiTitle}</h4>
                      <input
                        type="radio"
                        name="plan_choice"
                        checked={isSelected}
                        onChange={() => setSelectedPlanId(plan.id)}
                        className="accent-[#ab3100] w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-[#5a4139] mt-0.5">{plan.badge}</p>

                    <div className="mt-2">
                      <span className="text-[20px] font-black text-[#ab3100]">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-[#8e7067] line-through ml-1.5">
                        ₹{plan.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ffdcc3] text-[#6e3900] text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[13px]">contact_phone</span>
                      <span>{plan.contactCredits} सीधे परिवार नंबर</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#5a4139] mt-2 border-t border-[#e3bfb4]/40 pt-1.5 line-clamp-2">
                    {plan.tagline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Plan Features List */}
        <div className="bg-white p-4 rounded-2xl border border-[#e3bfb4]/60 space-y-2">
          <div className="flex justify-between items-center">
            <h5 className="font-bold text-[14px] text-[#1f1b14]">
              {selectedPlan.hindiTitle} में मिलने वाली सुविधाएं:
            </h5>
            <span className="text-[11px] font-bold text-green-800 bg-green-50 px-2 py-0.5 rounded">
              {selectedPlan.contactCredits} संपर्क अनलॉक क्रेडिट्स
            </span>
          </div>

          <ul className="space-y-1.5 text-[12px] text-[#5a4139]">
            {selectedPlan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-green-700 shrink-0 mt-0.5">
                  check_circle
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Methods Selection */}
        <div className="space-y-2">
          <span className="text-[12px] font-bold text-[#1f1b14] block">
            सुरक्षित भारतीय भुगतान माध्यम (UPI / NetBanking / Cards):
          </span>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'gpay', name: 'Google Pay', icon: 'payments' },
              { id: 'phonepe', name: 'PhonePe', icon: 'account_balance_wallet' },
              { id: 'paytm', name: 'Paytm / UPI', icon: 'qr_code_scanner' },
              { id: 'card', name: 'NetBanking / कार्ड', icon: 'credit_card' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === method.id
                    ? 'bg-[#ab3100]/10 border-[#ab3100] text-[#ab3100] font-bold'
                    : 'bg-white border-[#e3bfb4]/60 text-[#5a4139] hover:bg-[#fdf2e6]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{method.icon}</span>
                <span className="text-[11px] truncate w-full">{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="pt-2 border-t border-[#e3bfb4]/50 flex flex-col gap-2">
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full min-h-[50px] rounded-xl bg-[#ab3100] text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#852400] active:scale-98 transition-all shadow-md disabled:opacity-75"
          >
            {!isRegistered ? (
              <>
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                <span>
                  पंजीकरण करें एवं ₹{selectedPlan.price.toLocaleString('en-IN')} में प्लान सक्रिय करें
                </span>
              </>
            ) : isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
                <span>भुगतान व सदस्यता सक्रिय हो रही है...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">verified</span>
                <span>
                  ₹{selectedPlan.price.toLocaleString('en-IN')} में {selectedPlan.hindiTitle} सक्रिय करें
                </span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-3 text-[11px] text-[#5a4139]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-green-700">lock</span>
              100% सुरक्षित 256-bit एन्क्रिप्शन
            </span>
            <span>•</span>
            <span>तुरंत नंबर अनलॉक</span>
            <span>•</span>
            <span>30 दिन संतुष्टि गारंटी</span>
          </div>
        </div>
      </div>
    </div>
  );
};
