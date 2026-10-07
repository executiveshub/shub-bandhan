import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '../data/mockData';
import { SubscriptionPlan, SubscriptionTier, UserSubscription } from '../types/matrimony';

interface SubscriptionScreenProps {
  userSubscription: UserSubscription;
  isRegistered?: boolean;
  onSelectPlan: (plan: SubscriptionPlan, paymentMethod: string) => void;
  onToast: (msg: string) => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  userSubscription,
  isRegistered = true,
  onSelectPlan,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionTier>('gold');
  const [paymentMethod, setPaymentMethod] = useState<string>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];

  const handleSubscribe = () => {
    if (!isRegistered) {
      onSelectPlan(selectedPlan, paymentMethod);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSelectPlan(selectedPlan, paymentMethod);
    }, 250);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-32 pt-20 px-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#ab3100] via-[#8e4b00] to-[#d3430c] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ffdcc3] block">
              शुभ बंधन सदस्यता योजनाएं
            </span>
            <h2 className="font-bold text-[22px] mt-0.5 font-['Noto_Sans']">
              सीधे परिवारों से जुड़ें और रिश्ते तय करें
            </h2>
            <p className="text-[13px] text-[#faefe4] mt-1 leading-snug">
              बिना सदस्यता वर-वधू पक्ष से सीधा संपर्क संभव नहीं है। 100% सत्यापित माता-पिता और अभिभावकों के नंबर अनलॉक करें।
            </p>
          </div>
          <span className="text-3xl">🪷</span>
        </div>

        {/* Current Active Plan Status */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[12px]">
          <div>
            <span className="text-[#ffdcc3] block">आपकी वर्तमान योजना:</span>
            <strong className="text-white text-[14px]">
              {userSubscription.isActive ? userSubscription.planName : 'निःशुल्क अवलोकन (Free)'}
            </strong>
          </div>
          <div className="text-right">
            <span className="text-[#ffdcc3] block">शेष संपर्क क्रेडिट्स:</span>
            <strong className="text-white text-[15px] font-black">
              {userSubscription.contactsRemaining} परिवार
            </strong>
          </div>
        </div>
      </div>

      {/* Trust Guarantee Strip */}
      <div className="mt-4 p-3.5 rounded-xl bg-[#fdf2e6] border border-[#e3bfb4] flex items-center gap-3">
        <span className="material-symbols-outlined text-[#ab3100] text-[26px] shrink-0">
          verified_user
        </span>
        <div className="text-[12px] text-[#5a4139]">
          <strong className="text-[#1f1b14] block">100% पारिवारिक प्रामाणिकता गारंटी</strong>
          प्रत्येक नंबर सीधे कन्या या वर के माता-पिता या बड़े भाई का होता है। कोई नकली या अनधिकृत प्रोफ़ाइल नहीं।
        </div>
      </div>

      {/* If unregistered visitor attempts to buy plan directly */}
      {!isRegistered && (
        <div className="mt-4 p-4 rounded-2xl bg-[#fff3e0] border-2 border-[#ffb74d] text-[#4e2600] flex items-start gap-3 shadow-xs">
          <span className="material-symbols-outlined text-[#e65100] text-[24px] shrink-0 mt-0.5">
            assignment_ind
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ff6f00] text-white uppercase">
                पंजीकरण आवश्यक (Registration Required)
              </span>
              <p className="font-bold text-[13px]">प्लान खरीदने से पहले निःशुल्क पंजीकरण आवश्यक</p>
            </div>
            <p className="text-[12px] text-[#6d3800] mt-1 leading-snug">
              बिना पंजीकरण कोई भी सदस्यता योजना सीधे सक्रिय नहीं की जा सकती। नीचे दिए गए बटन पर क्लिक करने पर आपको सीधे वर/वधू पंजीकरण फॉर्म पर भेजा जाएगा। पंजीकरण सबमिट होते ही आपकी योजना सक्रिय हो जाएगी।
            </p>
          </div>
        </div>
      )}

      {/* Plans Stack */}
      <div className="flex flex-col gap-4 mt-5">
        <h3 className="font-bold text-[16px] text-[#1f1b14] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ab3100] text-[20px]">workspace_premium</span>
          <span>उपलब्ध सदस्यता योजनाएं:</span>
        </h3>

        {SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-4 rounded-2xl cursor-pointer border-2 transition-all relative ${
                isSelected
                  ? 'bg-white border-[#ab3100] shadow-md ring-2 ring-[#ab3100]/20'
                  : 'bg-white border-[#e3bfb4]/60 hover:bg-[#fdf2e6]'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-[#ab3100] text-white text-[11px] font-bold shadow-xs">
                  ⭐ सर्वाधिक लोकप्रिय
                </span>
              )}

              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[17px] text-[#1f1b14]">{plan.hindiTitle}</h4>
                    <span className="text-[11px] text-[#5a4139] bg-[#f1e7db] px-2 py-0.5 rounded-full font-medium">
                      {plan.durationMonths} महीने
                    </span>
                  </div>
                  <p className="text-[12px] text-[#5a4139] mt-0.5">{plan.tagline}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline gap-1.5 justify-end">
                    <span className="text-[22px] font-black text-[#ab3100]">
                      ₹{plan.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[12px] text-[#8e7067] line-through">
                      ₹{plan.originalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-[10px] text-green-700 font-bold block">50% की विशेष छूट</span>
                </div>
              </div>

              {/* Key Features summary */}
              <div className="mt-3 pt-3 border-t border-[#e3bfb4]/40 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ffdcc3] text-[#6e3900] text-[12px] font-bold">
                  <span className="material-symbols-outlined text-[16px]">contact_phone</span>
                  <span>{plan.contactCredits} सीधे परिवार फोन व WhatsApp नंबर अनलॉक</span>
                </div>

                <ul className="space-y-1 pt-1 text-[12px] text-[#5a4139]">
                  {plan.features.slice(0, 3).map((f, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-green-700 shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Radio selection */}
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                    isSelected
                      ? 'bg-[#ab3100] text-white'
                      : 'bg-[#f1e7db] text-[#1f1b14] hover:bg-[#ebe1d6]'
                  }`}
                >
                  {isSelected ? 'चयनित योजना ✓' : 'यह योजना चुनें'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment and Checkout Bar */}
      <div className="mt-5 bg-white p-4 rounded-2xl border border-[#e3bfb4]/60 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[13px] font-bold text-[#1f1b14]">
            चयनित: {selectedPlan.hindiTitle}
          </span>
          <span className="text-[18px] font-black text-[#ab3100]">
            ₹{selectedPlan.price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Payment selector */}
        <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
          {[
            { id: 'gpay', label: 'Google Pay' },
            { id: 'phonepe', label: 'PhonePe' },
            { id: 'paytm', label: 'Paytm' },
            { id: 'card', label: 'NetBanking' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setPaymentMethod(m.id)}
              className={`py-2 px-1 rounded-xl border font-semibold transition-all ${
                paymentMethod === m.id
                  ? 'bg-[#ab3100]/10 border-[#ab3100] text-[#ab3100]'
                  : 'bg-[#fdf2e6] border-[#e3bfb4]/50 text-[#5a4139]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubscribe}
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
              <span>सदस्यता सक्रिय हो रही है...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">credit_card</span>
              <span>
                ₹{selectedPlan.price.toLocaleString('en-IN')} भुगतान करें एवं तुरंत नंबर देखें
              </span>
            </>
          )}
        </button>

        <p className="text-[11px] text-[#5a4139] text-center">
          🔒 सुरक्षित UPI व बैंक गेटवे • 100% संतोषजनक सेवा
        </p>
      </div>
    </div>
  );
};
