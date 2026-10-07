import React from 'react';
import { Profile, ScreenType, UserSubscription } from '../types/matrimony';

interface FeedScreenProps {
  profiles: Profile[];
  selectedFilterChip: string;
  userSubscription?: UserSubscription;
  onSelectFilterChip: (chip: string) => void;
  onSelectProfile: (profile: Profile) => void;
  onSendProposal: (profile: Profile) => void;
  onToggleShortlist: (profile: Profile) => void;
  onOpenFatherCall: (profile: Profile) => void;
  onOpenKundali: (profile: Profile) => void;
  onOpenCounselorModal: () => void;
  onNavigate: (screen: ScreenType) => void;
  onToast: (msg: string) => void;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({
  profiles,
  selectedFilterChip,
  userSubscription,
  onSelectFilterChip,
  onSelectProfile,
  onSendProposal,
  onToggleShortlist,
  onOpenFatherCall,
  onOpenKundali,
  onOpenCounselorModal,
  onNavigate,
  onToast,
}) => {
  const filterChips = [
    { id: 'all', label: 'सभी (12)' },
    { id: 'govt', label: 'सरकारी नौकरी (4)', icon: 'workspace_premium', iconColor: 'text-[#8e4b00]' },
    { id: 'district', label: 'अपने जिले के (6)', icon: 'pin_drop', iconColor: 'text-[#ab3100]' },
    { id: 'veg', label: 'शाकाहारी (8)', icon: 'spa', iconColor: 'text-green-700' },
    { id: 'guna28', label: 'कुंडली 28+ गुण (5)', icon: 'verified', iconColor: 'text-[#8e4b00]' },
  ];

  const handleShareProfile = (profile: Profile) => {
    if (navigator.share) {
      navigator
        .share({
          title: `${profile.name} का बायोडाटा - शुभ बंधन`,
          text: `शुभ बंधन पर ${profile.name} का प्रामाणिक बायोडाटा देखें।`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      onToast(`बायोडाटा लिंक कॉपी किया गया (${profile.name}) - WhatsApp पर भेजें`);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-28 pt-20">
      {/* Parent Greeting & Daily Auspicious Header */}
      <section className="px-4 pt-3 pb-2">
        <div className="bg-[#fdf2e6] rounded-xl p-4 shadow-xs border border-[#e3bfb4]/40">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[19px] text-[#1f1b14]">
                  नमस्ते रामेश्वर जी
                </span>
                <span className="text-xl">🙏</span>
              </div>
              <p className="text-[14px] text-[#5a4139] mt-1 leading-snug">
                आपके सुपुत्र{' '}
                <span className="text-[#ab3100] font-bold">राहुल</span> के लिए
                आज के{' '}
                <span className="text-[#1f1b14] font-bold underline decoration-[#d3430c] decoration-2">
                  12 नए रिश्ते
                </span>{' '}
                प्राप्त हुए हैं।
              </p>
            </div>
            <button
              onClick={() => onNavigate('filter')}
              className="w-11 h-11 rounded-full bg-[#ffdcc3] flex items-center justify-center text-[#6e3900] shadow-xs shrink-0 hover:bg-[#ffb77d] active:scale-95 transition-all"
              title="पसंद व संस्कार फ़िल्टर"
            >
              <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            </button>
          </div>

          {/* Shubh Muhurat Daily Tip Strip */}
          <div className="mt-3 bg-white rounded-lg p-2.5 flex items-center gap-2 border border-[#e3bfb4]/40">
            <span className="material-symbols-outlined text-[20px] text-[#8e4b00] shrink-0">
              wb_sunny
            </span>
            <p className="text-[13px] text-[#5a4139] truncate">
              आज का शुभ मुहूर्त: दोपहर 02:15 से 04:30 तक (रिश्ता चर्चा हेतु उत्तम)
            </p>
          </div>
        </div>
      </section>

      {/* Quick Filter Chips (Scrollable for Parents) */}
      <section className="w-full overflow-x-auto no-scrollbar px-4 py-2 flex items-center gap-2">
        {filterChips.map((chip) => {
          const isActive = selectedFilterChip === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => onSelectFilterChip(chip.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                isActive
                  ? 'bg-[#ab3100] text-white shadow-xs'
                  : 'bg-[#f1e7db] text-[#5a4139] hover:text-[#1f1b14] hover:bg-[#ebe1d6]'
              }`}
            >
              {chip.icon && (
                <span className={`material-symbols-outlined text-[17px] ${isActive ? 'text-white' : chip.iconColor}`}>
                  {chip.icon}
                </span>
              )}
              <span>{chip.label}</span>
            </button>
          );
        })}
        {/* Open Advanced Filter Button */}
        <button
          onClick={() => onNavigate('filter')}
          className="shrink-0 px-3 py-1.5 rounded-full bg-[#fdf2e6] border border-[#ab3100]/40 text-[#ab3100] text-[13px] font-semibold flex items-center gap-1 active:scale-95"
        >
          <span className="material-symbols-outlined text-[17px]">tune</span>
          <span>सभी फ़िल्टर</span>
        </button>
      </section>

      {/* Profiles Feed Container */}
      <div className="px-4 flex flex-col gap-6 mt-2">
        {profiles.map((profile, index) => {
          const isSent = profile.proposalStatus === 'sent' || profile.proposalStatus === 'accepted';
          return (
            <article
              key={profile.id}
              className="bg-white rounded-2xl shadow-sm border border-[#e3bfb4]/50 overflow-hidden relative transition-all hover:shadow-md"
            >
              {/* Auspicious Top Garland Pattern Strip */}
              <div
                className={`h-2 w-full ${
                  index % 2 === 0
                    ? 'bg-gradient-to-r from-[#ab3100] via-[#8e4b00] to-[#d3430c]'
                    : 'bg-gradient-to-r from-[#4e5e82] via-[#ab3100] to-[#8e4b00]'
                }`}
              />

              {/* Photo & Badges Area */}
              <div
                className="relative w-full aspect-[4/3] bg-[#f7ece1] cursor-pointer"
                onClick={() => onSelectProfile(profile)}
              >
                <img
                  src={profile.photos[0]}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Trust Badges Over Image */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100/95 text-green-900 text-[11px] font-bold shadow-xs backdrop-blur-xs">
                    <span
                      className="material-symbols-outlined text-[15px] text-green-800"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                    {profile.badges[0] || '100% आधार सत्यापित'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#d8e2ff]/95 text-[#071b3b] text-[11px] font-semibold shadow-xs backdrop-blur-xs">
                    <span className="material-symbols-outlined text-[15px]">supervisor_account</span>
                    {profile.managedBy}
                  </span>
                </div>

                {/* Kundali Quick Pill Overlay Bottom */}
                <div className="absolute bottom-3 right-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fff8f3]/95 text-[#8e4b00] shadow-md backdrop-blur-xs">
                    <span
                      className="material-symbols-outlined text-[17px] text-[#8e4b00]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      stars
                    </span>
                    <span className="text-[13px] font-bold">{profile.gunScore} गुण मिलान</span>
                  </span>
                </div>
              </div>

              {/* Card Content Details */}
              <div className="p-4 flex flex-col gap-3">
                {/* Name, Age, Height & Shortlist */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="cursor-pointer"
                    onClick={() => onSelectProfile(profile)}
                  >
                    <h2 className="font-bold text-[20px] text-[#1f1b14] leading-tight hover:text-[#ab3100] transition-colors">
                      {profile.name}
                    </h2>
                    <p className="text-[13px] text-[#5a4139] font-medium mt-0.5">
                      {profile.age} वर्ष • {profile.height}
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleShortlist(profile)}
                    aria-label="पसंद करें"
                    className="w-11 h-11 rounded-full bg-[#f7ece1] hover:bg-[#f1e7db] flex items-center justify-center text-[#5a4139] active:scale-90 transition-all shrink-0"
                    title={profile.isShortlisted ? 'पसंद से हटाएं' : 'पसंद में जोड़ें'}
                  >
                    <span
                      className={`material-symbols-outlined text-[24px] ${
                        profile.isShortlisted ? 'text-[#ab3100]' : ''
                      }`}
                      style={{
                        fontVariationSettings: profile.isShortlisted ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      {profile.isShortlisted ? 'bookmark' : 'bookmark_border'}
                    </span>
                  </button>
                </div>

                {/* Job & Education Highlight */}
                <div className="bg-[#fdf2e6] rounded-xl p-3 flex items-start gap-2.5 border border-[#e3bfb4]/40">
                  <span className="material-symbols-outlined text-[22px] text-[#ab3100] shrink-0 mt-0.5">
                    {profile.isGovtJob ? 'school' : 'storefront'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-[#1f1b14] font-semibold truncate">
                      {profile.education}
                    </p>
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-medium">
                      <span className="material-symbols-outlined text-[14px]">work</span>
                      <span className="truncate">{profile.professionTag || profile.profession}</span>
                    </div>
                  </div>
                </div>

                {/* Lineage & Family Context Data List */}
                <div className="flex flex-col gap-1.5 text-[13px] text-[#5a4139]">
                  <div className="flex items-start gap-2 py-0.5">
                    <span className="material-symbols-outlined text-[19px] text-[#ab3100] shrink-0">
                      cottage
                    </span>
                    <span>
                      <strong className="text-[#1f1b14]">मूल निवास:</strong> {profile.nativePlace}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 py-0.5">
                    <span className="material-symbols-outlined text-[19px] text-[#ab3100] shrink-0">
                      location_city
                    </span>
                    <span>
                      <strong className="text-[#1f1b14]">वर्तमान:</strong> {profile.currentCity}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 py-0.5">
                    <span className="material-symbols-outlined text-[19px] text-[#ab3100] shrink-0">
                      diversity_1
                    </span>
                    <span>
                      <strong className="text-[#1f1b14]">समुदाय:</strong> {profile.community}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 py-0.5">
                    <span className="material-symbols-outlined text-[19px] text-[#ab3100] shrink-0">
                      family_restroom
                    </span>
                    <span>
                      <strong className="text-[#1f1b14]">परिवार:</strong> {profile.familySummary}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 py-0.5">
                    <span className="material-symbols-outlined text-[19px] text-green-700 shrink-0">
                      eco
                    </span>
                    <span>
                      <strong className="text-[#1f1b14]">आहार व संस्कार:</strong> {profile.diet}, {profile.familyValues.slice(0, 35)}...
                    </span>
                  </div>
                </div>

                {/* Kundali Shubh Banner */}
                <div className="bg-[#ffdcc3]/70 rounded-xl p-2.5 flex items-center justify-between gap-1.5 border border-[#e3bfb4]/40">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="material-symbols-outlined text-[19px] text-[#6e3900] shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      grade
                    </span>
                    <span className="text-[12px] text-[#6e3900] font-medium truncate">
                      {profile.gunSummary}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenKundali(profile)}
                    className="text-[12px] text-[#8e4b00] font-bold underline shrink-0 hover:text-[#ab3100]"
                  >
                    पत्रिका खोलें
                  </button>
                </div>

                {/* Family Friendly Action Buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  {/* Primary CTA: Rishta Bhejo */}
                  <button
                    onClick={() => onSendProposal(profile)}
                    className={`w-full min-h-[50px] rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all ${
                      isSent
                        ? 'bg-green-700 text-white'
                        : 'bg-[#ab3100] text-white hover:bg-[#852400]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isSent ? 'check_circle' : 'favorite'}
                    </span>
                    <span>
                      {isSent
                        ? 'रिश्ता प्रस्ताव भेजा गया 🙏'
                        : '🙏 रिश्ता भेजें (Send Proposal)'}
                    </span>
                  </button>

                  {/* Dual Secondary Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectProfile(profile)}
                      className="min-h-[46px] rounded-xl bg-[#f1e7db] text-[#1f1b14] font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:bg-[#ebe1d6] active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#4e5e82]">
                        description
                      </span>
                      <span>पूरा बायोडाटा</span>
                    </button>

                    {index % 2 === 0 ? (
                      <button
                        onClick={() => onOpenFatherCall(profile)}
                        className={`min-h-[46px] rounded-xl text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs ${
                          userSubscription?.unlockedProfiles.includes(profile.id)
                            ? 'bg-green-700 hover:bg-green-800'
                            : 'bg-[#4e5e82] hover:bg-[#364669]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {userSubscription?.unlockedProfiles.includes(profile.id) ? 'call' : 'lock'}
                        </span>
                        <span>
                          {userSubscription?.unlockedProfiles.includes(profile.id)
                            ? 'पिताजी से बात करें'
                            : 'पिताजी से बात करें (🔒)'}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleShareProfile(profile)}
                        className="min-h-[46px] rounded-xl bg-[#f1e7db] text-[#1f1b14] font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:bg-[#ebe1d6] active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#ab3100]">
                          share
                        </span>
                        <span>परिवार को भेजें</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Traditional Festive Divider Motif */}
      <div className="flex items-center justify-center gap-2 py-6 opacity-80">
        <div className="h-0.5 w-16 bg-[#e3bfb4]"></div>
        <span className="text-xl">🪷</span>
        <span className="text-[12px] font-semibold text-[#8e7067] tracking-widest">
          शुभं करोति कल्याणम्
        </span>
        <span className="text-xl">🪷</span>
        <div className="h-0.5 w-16 bg-[#e3bfb4]"></div>
      </div>

      {/* Parivarik Salahkar (Trust & Elder Helpline Banner) */}
      <section className="px-4 mb-4">
        <div className="bg-[#f1e7db] rounded-2xl p-4 shadow-xs border border-[#e3bfb4]/50">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#ab3100] shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[28px]">support_agent</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-[#ab3100] uppercase tracking-wider block">
                पारिवारिक सहायता कक्ष
              </span>
              <h3 className="font-bold text-[16px] text-[#1f1b14] mt-0.5">
                कोई संशय या परेशानी है?
              </h3>
              <p className="text-[12px] text-[#5a4139] mt-0.5">
                हमारे वरिष्ठ विवाह सलाहकार से फोन पर मुफ्त मार्गदर्शन लें।
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#e3bfb4]/50 flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              onClick={onOpenCounselorModal}
              className="w-full sm:w-auto min-h-[46px] px-5 rounded-full bg-[#1f1b14] hover:bg-black text-[#fff8f3] text-[13px] font-semibold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[19px] text-[#ffdcc3]">call</span>
              <span>1800-202-303 (निःशुल्क)</span>
            </button>
            <span className="text-[11px] text-[#5a4139] text-center sm:text-right">
              समय: सुबह 9:00 से रात 8:00 बजे तक
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
