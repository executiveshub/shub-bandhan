import React, { useState } from 'react';
import { Profile, UserSubscription } from '../types/matrimony';

interface ContactModalProps {
  profile: Profile | null;
  userSubscription: UserSubscription;
  onUnlockContact: (profile: Profile) => void;
  onOpenSubscriptionModal: (candidateName?: string) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  profile,
  userSubscription,
  onUnlockContact,
  onOpenSubscriptionModal,
  onClose,
  onToast,
}) => {
  if (!profile) return null;

  const isUnlocked =
    userSubscription.unlockedProfiles.includes(profile.id) ||
    userSubscription.tier === 'platinum';

  const defaultMessage = `सादर प्रणाम ${profile.guardianName} जी, हमने शुभ बंधन पर आपकी सुपुत्री ${profile.name} जी का बायोडाटा देखा। हमारे सुपुत्र राहुल शर्मा (वरिष्ठ प्रबंधक, SBI) के रिश्ते हेतु हम आपसे पारिवारिक चर्चा करना चाहते हैं। सादर, रामेश्वर नाथ शर्मा (वाराणसी)।`;

  const [messageText, setMessageText] = useState(defaultMessage);

  const handleCall = () => {
    if (!isUnlocked) {
      onOpenSubscriptionModal(profile.name);
      return;
    }
    window.location.href = `tel:${profile.guardianPhone.replace(/\s+/g, '')}`;
    onToast(`${profile.guardianName} जी को कॉल मिलाई जा रही है...`);
  };

  const handleWhatsApp = () => {
    if (!isUnlocked) {
      onOpenSubscriptionModal(profile.name);
      return;
    }
    const cleanPhone = profile.guardianWhatsApp.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
    onToast(`${profile.guardianName} जी को WhatsApp संदेश भेजा जा रहा है...`);
  };

  const handleUnlockClick = () => {
    if (userSubscription.contactsRemaining > 0) {
      onUnlockContact(profile);
      onToast(`1 क्रेडिट उपयोग हुआ! ${profile.name} जी का संपर्क नंबर अनलॉक हो गया।`);
    } else {
      onOpenSubscriptionModal(profile.name);
    }
  };

  // Masked phone display for unsubscribed users
  const maskedPhone = `${profile.guardianPhone.slice(0, 8)} ••••• (सुरक्षित / लॉक्ड)`;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#353028]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#fff8f3] rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-[#e3bfb4]/50 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e3bfb4]/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800">
              <span className="material-symbols-outlined text-[22px]">contact_phone</span>
            </div>
            <div>
              <h3 className="font-bold text-[17px] text-[#1f1b14]">
                सीधे परिवार से संपर्क करें
              </h3>
              <p className="text-[12px] text-[#5a4139]">
                {profile.name} जी का परिवार
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f1e7db] flex items-center justify-center text-[#1f1b14] active:scale-90"
            aria-label="बंद करें"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Guardian details card */}
        <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/60 shadow-xs space-y-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-[#5a4139] block font-medium">अभिभावक / संपर्क सूत्र:</span>
              <h4 className="text-[16px] font-bold text-[#1f1b14]">{profile.guardianName}</h4>
              <p className="text-[12px] text-[#5a4139]">{profile.managedBy} • {profile.nativeDistrict}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-900 text-[10px] font-bold">
              ✓ 100% सत्यापित नंबर
            </span>
          </div>

          {/* Number Display - Unlocked vs Locked */}
          {isUnlocked ? (
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-green-800 font-bold block">सत्यापित मोबाइल नंबर (अनलॉक्ड):</span>
                <p className="text-[16px] font-black text-[#ab3100] tracking-wide">
                  {profile.guardianPhone}
                </p>
              </div>
              <span className="material-symbols-outlined text-green-700 text-[24px]">
                lock_open
              </span>
            </div>
          ) : (
            <div className="pt-2 flex items-center justify-between bg-[#fdf2e6] p-2.5 rounded-lg border border-[#e3bfb4]">
              <div>
                <span className="text-[11px] text-[#8e4b00] font-bold block">
                  मोबाइल नंबर (सदस्यता द्वारा सुरक्षित):
                </span>
                <p className="text-[15px] font-bold text-[#5a4139] tracking-wider font-mono">
                  {maskedPhone}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#8e4b00] text-[22px]">
                lock
              </span>
            </div>
          )}
        </div>

        {/* Subscription Gate or Unlock Trigger */}
        {!isUnlocked && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#ffdcc3] to-[#ffdbd0] border border-[#e3bfb4] flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#ab3100] text-[20px] shrink-0 mt-0.5">
                workspace_premium
              </span>
              <div>
                <h5 className="font-bold text-[13px] text-[#3a0b00]">
                  {userSubscription.contactsRemaining > 0
                    ? `आपके खाते में ${userSubscription.contactsRemaining} संपर्क क्रेडिट उपलब्ध हैं`
                    : 'नंबर अनलॉक करने हेतु सदस्यता योजना आवश्यक है'}
                </h5>
                <p className="text-[11px] text-[#6e3900] mt-0.5 leading-snug">
                  बिना सदस्यता के वर-वधू पक्ष से सीधा फोन या WhatsApp संपर्क संभव नहीं है।
                </p>
              </div>
            </div>

            {userSubscription.contactsRemaining > 0 ? (
              <button
                onClick={handleUnlockClick}
                className="w-full py-2.5 rounded-lg bg-[#ab3100] hover:bg-[#852400] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">lock_open</span>
                <span>1 क्रेडिट उपयोग कर नंबर अनलॉक करें ({userSubscription.contactsRemaining} शेष)</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenSubscriptionModal(profile.name)}
                className="w-full py-2.5 rounded-lg bg-[#ab3100] hover:bg-[#852400] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                <span>सदस्यता योजना चुनें और तुरंत नंबर देखें (₹1,499 से शुरू)</span>
              </button>
            )}
          </div>
        )}

        {/* Message preview (Available when unlocked) */}
        {isUnlocked && (
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-[#5a4139] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-green-700">chat</span>
              <span>WhatsApp संदेश (संपादित कर सकते हैं):</span>
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={3}
              className="w-full text-[13px] p-2.5 rounded-xl border border-[#e3bfb4] bg-white text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#ab3100]/30 resize-none"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleWhatsApp}
            className={`w-full min-h-[48px] rounded-xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-98 shadow-sm transition-all ${
              isUnlocked
                ? 'bg-green-700 hover:bg-green-800'
                : 'bg-green-700/80 hover:bg-green-700'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span>{isUnlocked ? 'WhatsApp पर बात शुरू करें' : 'WhatsApp अनलॉक करें (सदस्यता)'}</span>
          </button>

          <button
            onClick={handleCall}
            className={`w-full min-h-[46px] rounded-xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-98 shadow-sm transition-all ${
              isUnlocked
                ? 'bg-[#4e5e82] hover:bg-[#364669]'
                : 'bg-[#4e5e82]/80 hover:bg-[#4e5e82]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">call</span>
            <span>{isUnlocked ? `सीधे फोन कॉल करें (${profile.guardianPhone})` : 'सीधे फोन कॉल अनलॉक करें'}</span>
          </button>
        </div>

        <p className="text-[11px] text-center text-[#5a4139]">
          🔒 आपकी पारिवारिक मर्यादा व गोपनीयता पूरी तरह सुरक्षित है।
        </p>
      </div>
    </div>
  );
};
