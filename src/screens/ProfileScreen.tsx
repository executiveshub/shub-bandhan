import React, { useState } from 'react';
import { USER_FAMILY_PROFILE, USER_FATHER_AVATAR } from '../data/mockData';
import { ScreenType, UserSubscription, AuthUser, Profile } from '../types/matrimony';

interface ProfileScreenProps {
  currentUser?: AuthUser | null;
  profiles?: Profile[];
  userSubscription: UserSubscription;
  onNavigate: (screen: ScreenType) => void;
  onOpenSubscriptionModal: () => void;
  onOpenCounselorModal: () => void;
  onOpenAuthModal?: () => void;
  onToast: (msg: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  profiles,
  userSubscription,
  onNavigate,
  onOpenSubscriptionModal,
  onOpenCounselorModal,
  onOpenAuthModal,
  onToast,
}) => {
  const [showVerificationAudit, setShowVerificationAudit] = useState(false);

  // Derive candidate details from registered profiles or currentUser
  const matchingRegisteredProfile = profiles?.find((p) =>
    currentUser?.candidateName ? p.name.includes(currentUser.candidateName.split(' ')[0]) || currentUser.candidateName.includes(p.name) : false
  );

  const displayName = currentUser?.name || USER_FAMILY_PROFILE.fatherName;
  const displayRole = currentUser?.role || USER_FAMILY_PROFILE.fatherRole;
  const displayCity = currentUser?.city || USER_FAMILY_PROFILE.fatherCity;
  const displayAvatar = currentUser?.avatar || USER_FATHER_AVATAR;

  const candidateTitle = currentUser?.candidateGender === 'bride' ? 'कन्या विवरण (सुपुत्री की प्रोफ़ाइल)' : 'वर विवरण (सुपुत्र की प्रोफ़ाइल)';
  const candidateName = matchingRegisteredProfile?.name || currentUser?.candidateName || USER_FAMILY_PROFILE.sonName;
  const candidateAge = matchingRegisteredProfile?.age ? `${matchingRegisteredProfile.age} वर्ष` : `${USER_FAMILY_PROFILE.sonAge} वर्ष`;
  const candidateHeight = matchingRegisteredProfile?.height || USER_FAMILY_PROFILE.sonHeight;
  const candidateEducation = matchingRegisteredProfile?.education || USER_FAMILY_PROFILE.sonEducation;
  const candidateJob = matchingRegisteredProfile?.profession || USER_FAMILY_PROFILE.sonJob;
  const candidateGotra = matchingRegisteredProfile?.gotra || 'भारद्वाज गोत्र';
  const candidateNative = matchingRegisteredProfile?.nativePlace || USER_FAMILY_PROFILE.familyNative;
  const candidateCurrent = matchingRegisteredProfile?.currentCity || USER_FAMILY_PROFILE.familyCurrent;

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-28 pt-20">
      {/* Header Profile Identity Card */}
      <section className="px-4 pt-3 pb-2">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e3bfb4]/50 flex flex-col gap-4 relative overflow-hidden">
          {/* Top Auspicious Banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ab3100] via-[#8e4b00] to-[#d3430c]" />

          <div className="flex items-start gap-4 pt-1">
            <div className="relative shrink-0">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-18 h-18 rounded-full object-cover border-2 border-[#d3430c] shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-600 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <span className="text-[11px] font-bold text-[#ab3100] uppercase tracking-wider block">
                  {displayRole}
                </span>
                {/* Official Verified Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px] shadow-xs">
                  <span
                    className="material-symbols-outlined text-[14px] text-emerald-700"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span>सत्यापित परिवार (Verified)</span>
                </span>
              </div>
              <h2 className="font-bold text-[19px] text-[#1f1b14] leading-tight mt-0.5">
                {displayName}
              </h2>
              <p className="text-[12px] text-[#5a4139] mt-0.5">
                {displayCity}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fdf2e6] text-[#8e4b00] text-[11px] font-semibold border border-[#e3bfb4]/60">
                <span className="material-symbols-outlined text-[15px] text-[#ab3100]">
                  shield_with_heart
                </span>
                <span>शुभ बंधन पारिवारिक सुरक्षा सत्यापन पूर्ण</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Candidate Matrimonial Biodata Card */}
      <div className="px-4 flex flex-col gap-4 mt-2">
        <div className="p-4 rounded-2xl bg-white shadow-xs border border-[#e3bfb4]/40 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#e3bfb4]/40 pb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ab3100] text-[22px]">badge</span>
              <h3 className="font-bold text-[16px] text-[#1f1b14]">
                {candidateTitle}
              </h3>
            </div>
            
            {/* Prominent Verified Badge on Candidate */}
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold shadow-xs">
                <span
                  className="material-symbols-outlined text-[14px] text-emerald-700"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span>सत्यापित प्रोफ़ाइल (Verified)</span>
              </span>
              <span className="text-[11px] font-bold bg-[#ffdcc3] text-[#6e3900] px-2 py-0.5 rounded-full">
                {candidateGotra}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-[13px] text-[#5a4139]">
            <div className="flex justify-between items-center">
              <span className="font-medium">नाम व आयु:</span>
              <div className="flex items-center gap-1.5">
                <strong className="text-[#1f1b14]">
                  {candidateName} ({candidateAge}, {candidateHeight})
                </strong>
                <span
                  className="material-symbols-outlined text-emerald-600 text-[16px]"
                  title="Aadhaar & Service Verified"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">शिक्षा:</span>
              <strong className="text-[#1f1b14]">{candidateEducation}</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">वर्तमान पद:</span>
              <strong className="text-[#1f1b14] text-right">{candidateJob}</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">वार्षिक आय:</span>
              <strong className="text-[#ab3100] font-bold">{USER_FAMILY_PROFILE.sonSalary}</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">कुंडली व नक्षत्र:</span>
              <strong className="text-green-800 text-right">{USER_FAMILY_PROFILE.sonKundali}</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">पैतृक निवास:</span>
              <strong className="text-[#1f1b14]">{candidateNative}</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">वर्तमान आवास:</span>
              <strong className="text-[#1f1b14]">{candidateCurrent}</strong>
            </div>
          </div>

          {/* Quick Filter Edit Action */}
          <button
            onClick={() => onNavigate('filter')}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#fdf2e6] hover:bg-[#f7ece1] text-[#ab3100] font-bold text-[13px] flex items-center justify-center gap-1.5 border border-[#e3bfb4]/60 active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>जीवनसाथी की प्राथमिकताएं संशोधित करें</span>
          </button>
        </div>

        {/* Membership & Subscription Status Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#ffdcc3] to-[#ffdbd0] border border-[#e3bfb4] shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ab3100] text-[22px]">
                workspace_premium
              </span>
              <div>
                <h4 className="font-bold text-[15px] text-[#3a0b00]">
                  सदस्यता व संपर्क क्रेडिट्स (Membership)
                </h4>
                <p className="text-[11px] text-[#6e3900]">
                  वर-वधू पक्ष से सीधा फ़ोन व WhatsApp संपर्क स्थिति
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-white text-[#ab3100] text-[11px] font-bold shadow-xs">
              {userSubscription.isActive ? 'सक्रिय योजना ✓' : 'निःशुल्क मोड'}
            </span>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-[#e3bfb4]/50 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#5a4139] block">वर्तमान योजना:</span>
              <strong className="text-[14px] text-[#1f1b14]">
                {userSubscription.isActive ? userSubscription.planName : 'निःशुल्क अवलोकन (Free Browsing)'}
              </strong>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#5a4139] block">अनलॉक क्रेडिट्स शेष:</span>
              <span className="text-[18px] font-black text-[#ab3100]">
                {userSubscription.contactsRemaining}
              </span>
              <span className="text-[11px] text-[#5a4139] ml-1">परिवार</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onOpenSubscriptionModal}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              <span>
                {userSubscription.isActive ? 'योजना अपग्रेड करें' : 'सदस्यता लें और नंबर देखें'}
              </span>
            </button>

            <button
              onClick={() => onNavigate('plans')}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#f1e7db] text-[#1f1b14] text-[13px] font-semibold flex items-center justify-center border border-[#e3bfb4]"
            >
              योजनाएं तुलना करें
            </button>
          </div>
        </div>

        {/* Dedicated Verification Status Field Block for Platform Credibility */}
        <section className="p-4 rounded-2xl bg-gradient-to-br from-[#fdf2e6] via-white to-[#f7ece1] shadow-xs border border-[#e3bfb4]/70 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#e3bfb4]/40 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
              </div>
              <div>
                <h4 className="font-bold text-[15px] text-[#1f1b14]">
                  सत्यापन स्थिति (Verification Status)
                </h4>
                <p className="text-[11px] text-[#5a4139]">
                  मंच विश्वसनीयता एवं प्रामाणिकता विवरण
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowVerificationAudit(!showVerificationAudit);
                onToast(showVerificationAudit ? 'ऑडिट विवरण बंद किया गया' : 'सत्यापन ऑडिट रिपोर्ट खुली');
              }}
              className="text-[12px] text-[#ab3100] font-bold flex items-center gap-0.5 hover:underline"
            >
              <span>{showVerificationAudit ? 'संक्षिप्त करें' : 'विस्तार देखें'}</span>
              <span className="material-symbols-outlined text-[16px]">
                {showVerificationAudit ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>

          {/* Status Key-Value Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12px]">
            {/* Primary Status Field */}
            <div className="p-2.5 rounded-xl bg-white border border-[#e3bfb4]/50 flex flex-col gap-1">
              <span className="text-[11px] text-[#5a4139] font-medium">सत्यापन स्थिति (Status):</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span className="font-bold text-emerald-800 text-[13px]">
                  {USER_FAMILY_PROFILE.verificationStatus}
                </span>
              </div>
            </div>

            {/* Trust Level Field */}
            <div className="p-2.5 rounded-xl bg-white border border-[#e3bfb4]/50 flex flex-col gap-1">
              <span className="text-[11px] text-[#5a4139] font-medium">विश्वास स्तर (Trust Tier):</span>
              <div className="flex items-center gap-1 text-[#8e4b00] font-bold">
                <span
                  className="material-symbols-outlined text-[16px] text-amber-600"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
                <span className="text-[13px]">{USER_FAMILY_PROFILE.verificationLevel}</span>
              </div>
            </div>

            {/* Verification Code Field */}
            <div className="p-2.5 rounded-xl bg-white border border-[#e3bfb4]/50 flex flex-col gap-1">
              <span className="text-[11px] text-[#5a4139] font-medium">प्रमाणीकरण संदर्भ कोड:</span>
              <span className="font-mono font-bold text-[#ab3100] text-[13px]">
                {USER_FAMILY_PROFILE.verificationCode}
              </span>
            </div>

            {/* Verified Date Field */}
            <div className="p-2.5 rounded-xl bg-white border border-[#e3bfb4]/50 flex flex-col gap-1">
              <span className="text-[11px] text-[#5a4139] font-medium">सत्यापन तिथि व वैधता:</span>
              <span className="font-semibold text-[#1f1b14] text-[13px]">
                {USER_FAMILY_PROFILE.verifiedDate}
              </span>
            </div>
          </div>

          {/* Credibility Score Meter */}
          <div className="p-3 rounded-xl bg-white border border-[#e3bfb4]/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700 text-[20px]">
                task_alt
              </span>
              <div>
                <span className="text-[12px] font-bold text-[#1f1b14]">
                  प्लेटफ़ॉर्म विश्वसनीयता स्कोर (Trust Score)
                </span>
                <p className="text-[10px] text-[#5a4139]">
                  बायोमेट्रिक, सेवा, आवासीय व गोत्र सत्यापन के आधार पर
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[16px] font-black text-emerald-700">100 / 100</span>
              <span className="text-[10px] text-emerald-800 font-bold block">उच्चतम प्रामाणिक</span>
            </div>
          </div>

          {/* Detailed Verified Credentials (Expandable/Audit) */}
          {showVerificationAudit && (
            <div className="space-y-1.5 pt-1 border-t border-[#e3bfb4]/40 animate-in fade-in duration-200">
              <p className="text-[11px] font-bold text-[#1f1b14]">
                जांचे गए आधिकारिक दस्तावेज़ व स्रोत:
              </p>
              {USER_FAMILY_PROFILE.verifiedBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2 rounded-lg bg-white border border-[#e3bfb4]/30 text-[12px]"
                >
                  <span className="text-[#1f1b14] font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">
                      verified
                    </span>
                    {badge.title}
                  </span>
                  <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    ✓ {badge.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Helpline CTA */}
        <div className="p-4 rounded-2xl bg-[#f1e7db] border border-[#e3bfb4]/60 space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ab3100] text-[24px]">support_agent</span>
            <h4 className="font-bold text-[15px] text-[#1f1b14]">व्यक्तिगत संबंध प्रबंधक</h4>
          </div>
          <p className="text-[12px] text-[#5a4139]">
            यदि आप किसी योग्य कन्या के परिवार से प्रत्यक्ष मुलाक़ात तय करना चाहते हैं, तो हमारे वरिष्ठ सलाहकार आपकी सहायता करेंगे।
          </p>
          <button
            onClick={onOpenCounselorModal}
            className="w-full py-2.5 rounded-xl bg-[#ab3100] text-white font-semibold text-[13px] hover:bg-[#852400] active:scale-98 transition-all"
          >
            पंडित राधेश्याम जी से निःशुल्क बात करें 📞
          </button>
        </div>

        <button
          onClick={() => onToast('लॉगआउट सिमुलेशन: आप सुरक्षित रूप से लॉग-इन हैं।')}
          className="py-2.5 text-[#8e7067] text-[13px] font-semibold text-center hover:underline"
        >
          शुभ बंधन से सुरक्षित बाहर निकलें (Log out)
        </button>
      </div>
    </div>
  );
};
