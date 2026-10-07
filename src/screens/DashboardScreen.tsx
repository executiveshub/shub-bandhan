import React, { useState, useMemo, useEffect } from 'react';
import { Profile, ScreenType, UserSubscription, AuthUser } from '../types/matrimony';
import { DEMO_USERS } from '../data/mockData';

interface DashboardScreenProps {
  currentUser: AuthUser | null;
  profiles: Profile[];
  userSubscription: UserSubscription;
  onLogin?: (user: AuthUser) => void;
  onNavigate: (screen: ScreenType) => void;
  onSelectProfile: (profile: Profile) => void;
  onSendProposal: (profile: Profile) => void;
  onOpenSubscriptionModal: (candidateName?: string) => void;
  onOpenCounselorModal: () => void;
  onOpenAuthModal: () => void;
  onOpenPdfModal: (profile: Profile) => void;
  onUpgradeToPaid?: (tier?: any, instantDemo?: boolean) => void;
  onToast: (msg: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  currentUser,
  profiles,
  userSubscription,
  onLogin,
  onNavigate,
  onSelectProfile,
  onSendProposal,
  onOpenSubscriptionModal,
  onOpenCounselorModal,
  onOpenAuthModal,
  onOpenPdfModal,
  onUpgradeToPaid,
  onToast,
}) => {
  // Visitor & Directory Filter States
  const [genderFilter, setGenderFilter] = useState<'all' | 'bride' | 'groom'>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [religionFilter, setReligionFilter] = useState<string>('all');
  const [casteFilter, setCasteFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visitorPromptProfile, setVisitorPromptProfile] = useState<Profile | null>(null);

  // User's Candidate Attributes & Required Match Gender
  // If registered candidate is 'groom' (son), family is looking for 'bride' (वधू)
  // If registered candidate is 'bride' (daughter), family is looking for 'groom' (वर)
  const candidateGender = currentUser?.candidateGender || 'groom';
  const targetGender: 'bride' | 'groom' = candidateGender === 'groom' ? 'bride' : 'groom';
  const targetRecommendationGender = targetGender;

  const isPaidUser = !!(
    currentUser?.isPaidMember ||
    (userSubscription && userSubscription.tier !== 'free')
  );

  const userCandidateAge = currentUser?.candidateAge || (candidateGender === 'groom' ? 27 : 24);
  const userCandidateState = currentUser?.state || (currentUser?.city?.includes('बिहार') || currentUser?.city?.includes('पटना') ? 'Bihar' : 'Uttar Pradesh');
  const userCandidateCity = currentUser?.city?.split(' ')[0]?.replace('(', '') || 'वाराणसी';
  const userCandidateCaste = currentUser?.caste || 'Brahmin';
  const userCandidateReligion = currentUser?.religion || 'Hindu';

  // Registered preferences mentioned at the time of Registration
  const registeredMinAge = currentUser?.preferredAgeMin || (targetGender === 'bride' ? 21 : 25);
  const registeredMaxAge = currentUser?.preferredAgeMax || (targetGender === 'bride' ? 26 : 30);
  const registeredLocation = currentUser?.preferredLocation || userCandidateCity;
  const registeredCaste = currentUser?.preferredCaste || userCandidateCaste;

  // Dynamic Matching Preferences (Pre-populated from user's registration interests)
  const [prefAgeRange, setPrefAgeRange] = useState<[number, number]>([registeredMinAge, registeredMaxAge]);
  const [prefLocationMode, setPrefLocationMode] = useState<'all' | 'same_state' | 'same_district'>('same_district');
  const [prefCasteMode, setPrefCasteMode] = useState<'same_caste' | 'all'>('same_caste');
  const [showAllRecommendations, setShowAllRecommendations] = useState<boolean>(false);

  // Keep state synchronized with current user's registration interests
  useEffect(() => {
    if (currentUser) {
      const minA = currentUser.preferredAgeMin || (currentUser.candidateGender === 'groom' ? 21 : 25);
      const maxA = currentUser.preferredAgeMax || (currentUser.candidateGender === 'groom' ? 26 : 30);
      setPrefAgeRange([minA, maxA]);
      setPrefLocationMode(
        currentUser.preferredLocation && currentUser.preferredLocation !== 'all' ? 'same_district' : 'same_state'
      );
      setPrefCasteMode(
        currentUser.preferredCaste && currentUser.preferredCaste !== 'all' ? 'same_caste' : 'same_caste'
      );
    }
  }, [currentUser]);

  const handleResetToRegistrationPrefs = () => {
    setPrefAgeRange([registeredMinAge, registeredMaxAge]);
    setPrefLocationMode(currentUser?.preferredLocation && currentUser.preferredLocation !== 'all' ? 'same_district' : 'same_state');
    setPrefCasteMode(currentUser?.preferredCaste && currentUser.preferredCaste !== 'all' ? 'same_caste' : 'same_caste');
    onToast('पंजीकरण प्राथमिकताएं रीसेट की गईं (Reset to Registration Interests)');
  };

  // Matching Algorithm: Computes match score (0-100%) based on Age, Location, Caste & Religion
  const recommendedMatches = useMemo(() => {
    const candidatePool = profiles.filter(
      (p) => p.gender === targetRecommendationGender && p.approvalStatus !== 'pending'
    );

    return candidatePool.map((p) => {
      // 1. AGE SCORE (Max 35 points)
      const [minAge, maxAge] = prefAgeRange;
      let ageScore = 0;
      let ageTag = '';
      if (p.age >= minAge && p.age <= maxAge) {
        ageScore = 35;
        ageTag = `🎯 आयु: ${p.age} वर्ष (अनुकूल)`;
      } else if (Math.abs(p.age - minAge) <= 1 || Math.abs(p.age - maxAge) <= 1) {
        ageScore = 24;
        ageTag = `🎯 आयु: ${p.age} वर्ष (निकटतम)`;
      } else if (Math.abs(p.age - minAge) <= 3 || Math.abs(p.age - maxAge) <= 3) {
        ageScore = 14;
        ageTag = `🎯 आयु: ${p.age} वर्ष`;
      } else {
        ageScore = 6;
        ageTag = `🎯 आयु: ${p.age} वर्ष`;
      }

      // 2. LOCATION SCORE (Max 35 points)
      let locationScore = 0;
      let locationTag = '';
      const pDist = (p.nativeDistrict || '').toLowerCase();
      const uCity = userCandidateCity.toLowerCase();
      const pState = p.state || (['पटना', 'गया', 'मुजफ्फरपुर', 'भागलपुर', 'दरभंगा'].some(c => pDist.includes(c.toLowerCase())) ? 'Bihar' : 'Uttar Pradesh');
      const isSameDistrict = pDist.includes(uCity) || uCity.includes(pDist);
      const isSameState = pState === userCandidateState;

      if (isSameDistrict) {
        locationScore = 35;
        locationTag = `📍 ${p.nativeDistrict} (गृह ज़िला)`;
      } else if (isSameState) {
        locationScore = 26;
        locationTag = `📍 ${pState === 'Bihar' ? 'बिहार' : 'उ.प्र.'} • ${p.nativeDistrict}`;
      } else {
        locationScore = 15;
        locationTag = `📍 ${pState === 'Bihar' ? 'बिहार' : 'उ.प्र.'}`;
      }

      if (prefLocationMode === 'same_district' && !isSameDistrict) {
        locationScore = Math.max(0, locationScore - 18);
      } else if (prefLocationMode === 'same_state' && !isSameState) {
        locationScore = Math.max(0, locationScore - 12);
      }

      // 3. CASTE & RELIGION SCORE (Max 30 points)
      let casteScore = 0;
      let casteTag = '';
      const pCaste = (p.caste || '').toLowerCase();
      const uCaste = userCandidateCaste.toLowerCase();
      const pRel = (p.religion || '').toLowerCase();
      const uRel = userCandidateReligion.toLowerCase();
      const isSameCaste = pCaste.includes(uCaste) || uCaste.includes(pCaste);
      const isSameReligion = pRel === uRel;

      if (isSameReligion && isSameCaste) {
        casteScore = 30;
        casteTag = `🪷 ${p.caste} (समान जाति)`;
      } else if (isSameReligion) {
        casteScore = prefCasteMode === 'same_caste' ? 14 : 24;
        casteTag = `🪷 ${p.caste || p.community} (सर्वसमाज)`;
      } else {
        casteScore = 8;
        casteTag = `🪷 ${p.religion || ''} • ${p.caste || ''}`;
      }

      if (prefCasteMode === 'same_caste' && !isSameCaste) {
        casteScore = Math.max(0, casteScore - 10);
      }

      const totalScore = Math.min(100, Math.round(ageScore + locationScore + casteScore));

      return {
        profile: p,
        totalScore,
        ageScore,
        locationScore,
        casteScore,
        ageTag,
        locationTag,
        casteTag,
      };
    }).sort((a, b) => b.totalScore - a.totalScore || b.profile.gunScore - a.profile.gunScore);
  }, [
    profiles,
    targetRecommendationGender,
    prefAgeRange,
    prefLocationMode,
    prefCasteMode,
    userCandidateCity,
    userCandidateState,
    userCandidateCaste,
    userCandidateReligion,
  ]);

  // Live user activity calculations
  const matchingProfiles = profiles.filter((p) => p.gender === targetGender);
  const matchingCount = matchingProfiles.length;
  const receivedCount = profiles.filter((p) => p.proposalStatus === 'received').length;
  const sentCount = profiles.filter((p) => p.proposalStatus === 'sent').length;
  const acceptedCount = profiles.filter((p) => p.proposalStatus === 'accepted').length;
  const shortlistedCount = profiles.filter((p) => p.isShortlisted).length;
  const unlockedCount = userSubscription.unlockedProfiles.length;

  // Counts for tabs (visitor mode)
  const bridesCount = profiles.filter((p) => p.gender === 'bride').length;
  const groomsCount = profiles.filter((p) => p.gender === 'groom').length;

  // Unique districts for filter
  const districts = Array.from(
    new Set(profiles.map((p) => p.nativeDistrict).filter(Boolean))
  );

  // Filtered profiles:
  // After login: strictly only show profiles matching user's needed target gender!
  // (Looking for Groom -> ONLY grooms, NO brides; Looking for Bride -> ONLY brides, NO grooms)
  const displayedProfiles = profiles.filter((p) => {
    if (p.approvalStatus === 'pending') return false;
    if (currentUser) {
      if (p.gender !== targetGender) return false;
    } else {
      if (genderFilter !== 'all' && p.gender !== genderFilter) return false;
    }
    if (stateFilter !== 'all' && p.state && p.state.toLowerCase() !== stateFilter.toLowerCase()) return false;
    if (religionFilter !== 'all' && p.religion && p.religion.toLowerCase() !== religionFilter.toLowerCase()) return false;
    if (casteFilter !== 'all') {
      const pCaste = (p.caste || '').toLowerCase();
      const pComm = (p.community || '').toLowerCase();
      const fCaste = casteFilter.toLowerCase();
      if (!pCaste.includes(fCaste) && !fCaste.includes(pCaste) && !pComm.includes(fCaste)) return false;
    }
    if (districtFilter !== 'all') {
      const pDist = (p.nativeDistrict || '').toLowerCase();
      const fDist = districtFilter.toLowerCase();
      if (!pDist.includes(fDist) && !fDist.includes(pDist)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.nativeDistrict.toLowerCase().includes(q) ||
        (p.state && p.state.toLowerCase().includes(q)) ||
        (p.religion && p.religion.toLowerCase().includes(q)) ||
        (p.caste && p.caste.toLowerCase().includes(q)) ||
        p.profession.toLowerCase().includes(q) ||
        (p.education && p.education.toLowerCase().includes(q)) ||
        (p.gotra && p.gotra.toLowerCase().includes(q)) ||
        (p.community && p.community.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleProposalAction = (profile: Profile) => {
    if (!currentUser) {
      setVisitorPromptProfile(profile);
    } else {
      onSendProposal(profile);
    }
  };

  const handleConnectAction = (profile: Profile) => {
    if (!currentUser) {
      setVisitorPromptProfile(profile);
    } else if (!userSubscription.isActive) {
      onOpenSubscriptionModal(profile.name);
    } else {
      onSelectProfile(profile);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-32 pt-20 px-4">
      {/* 1. TOP HERO / GREETING SECTION */}
      {currentUser ? (
        // Logged-in User Header
        <section className="bg-gradient-to-r from-[#ab3100] via-[#8e4b00] to-[#d3430c] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-bold text-[18px] leading-tight">
                    Welcome, {currentUser.name}
                  </h2>
                </div>
                <p className="text-[12px] text-[#ffdcc3] mt-0.5">
                  {currentUser.candidateName} • {currentUser.city}
                </p>
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  <span>100% Verified Family Account</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAuthModal}
              className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors"
              title="Switch Account or Log Out"
            >
              <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
              <span>Account</span>
            </button>
          </div>

          {/* Auspicious Muhurat Banner */}
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-1.5 text-[#ffdcc3]">
              <span className="material-symbols-outlined text-[17px]">wb_sunny</span>
              <span>Today's Auspicious Muhurat: 02:15 PM to 04:30 PM</span>
            </div>
            <span className="text-[11px] font-bold bg-white text-[#ab3100] px-2 py-0.5 rounded-full shadow-xs">
              Auspicious Timing
            </span>
          </div>
        </section>
      ) : (
        // Visitor First Landing Hero: High-Impact Matrimonial Showcase
        <section className="bg-gradient-to-br from-[#ab3100] via-[#852400] to-[#5a1800] text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🪷</span>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#ffdcc3]">
                Traditional & Verified Matchmaking
              </span>
            </div>

            <h1 className="text-[22px] sm:text-[24px] font-extrabold leading-tight font-['Noto_Sans']">
              Bihar & Eastern UP's Most Trusted Multi-Faith & Multi-Caste Directory
            </h1>

            <p className="text-[12px] text-[#faefe4] mt-1.5 leading-relaxed">
              Explore 5,400+ verified brides & grooms across Bihar (Patna, Gaya, Muzaffarpur, Bhagalpur, Begusarai, etc.) and UP. Welcoming all religions (Hindu, Muslim, Sikh, Christian, Jain, Buddhist) and all castes with authentic family biodatas!
            </p>

            {/* Quick Conversion CTA Bar */}
            <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNavigate('register')}
                className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-white text-[#ab3100] hover:bg-[#fff0eb] text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                <span>New Registration / Sign In</span>
              </button>

              <button
                onClick={() => onNavigate('plans')}
                className="py-2.5 px-3 rounded-xl bg-[#ffdcc3] hover:bg-[#ffb77d] text-[#6e3900] text-xs font-bold transition-transform active:scale-95 flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                <span>Get Plans</span>
              </button>
            </div>

            {/* Trust Highlights */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-[#faefe4]/90">
              <div className="bg-white/10 rounded-lg p-1.5 backdrop-blur-xs">
                <strong className="block text-white text-[11px] font-bold">100% Verified</strong>
                <span>Aadhaar & Field BDE</span>
              </div>
              <div className="bg-white/10 rounded-lg p-1.5 backdrop-blur-xs">
                <strong className="block text-white text-[11px] font-bold">5,400+ Profiles</strong>
                <span>Active Brides & Grooms</span>
              </div>
              <div className="bg-white/10 rounded-lg p-1.5 backdrop-blur-xs">
                <strong className="block text-white text-[11px] font-bold">Direct Access</strong>
                <span>Phone & WhatsApp</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. ACTIVITY & KEY METRICS (For Paid Members Only) */}
      {currentUser && (
        userSubscription.isActive ? (
          <section className="mt-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[16px] text-[#1f1b14] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#ab3100] text-[20px]">
                    analytics
                  </span>
                  <span>Activity & Key Metrics</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1b5e20] text-white flex items-center gap-0.5 shadow-xs">
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span>{userSubscription.planName} Member</span>
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Member Metrics
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Card 1: Compatible Matches */}
              <div
                onClick={() => onNavigate('feed')}
                className="p-3.5 rounded-2xl bg-white border border-[#e3bfb4]/60 shadow-xs hover:border-[#ab3100] cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] text-[#5a4139] font-semibold">Compatible Matches</span>
                  <span className="material-symbols-outlined text-[#ab3100] text-[20px]">favorite</span>
                </div>
                <div className="mt-2">
                  <span className="text-[24px] font-black text-[#ab3100]">{matchingCount}</span>
                  <span className="text-[10px] text-emerald-700 block font-medium">
                    {matchingCount > 0 ? `For ${currentUser.candidateName}` : 'Browse Matches'}
                  </span>
                </div>
              </div>

              {/* Card 2: Received Proposals */}
              <div
                onClick={() => onNavigate('chats')}
                className="p-3.5 rounded-2xl bg-white border border-[#e3bfb4]/60 shadow-xs hover:border-[#ab3100] cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] text-[#5a4139] font-semibold">Proposals Received</span>
                  <span className="material-symbols-outlined text-[#8e4b00] text-[20px]">incoming_mail</span>
                </div>
                <div className="mt-2">
                  <span className="text-[24px] font-black text-[#8e4b00]">{receivedCount}</span>
                  <span className="text-[10px] text-amber-800 block font-medium">
                    {receivedCount > 0 ? `${receivedCount} Pending Decision` : '0 Pending Decision'}
                  </span>
                </div>
              </div>

              {/* Card 3: Sent Proposals */}
              <div
                onClick={() => onNavigate('chats')}
                className="p-3.5 rounded-2xl bg-white border border-[#e3bfb4]/60 shadow-xs hover:border-[#ab3100] cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] text-[#5a4139] font-semibold">Proposals Sent</span>
                  <span className="material-symbols-outlined text-[#4e5e82] text-[20px]">outgoing_mail</span>
                </div>
                <div className="mt-2">
                  <span className="text-[24px] font-black text-[#4e5e82]">{sentCount}</span>
                  <span className="text-[10px] text-[#4e5e82] block font-medium">
                    {sentCount > 0 ? `${sentCount} Active Proposals` : '0 Sent Proposals'}
                  </span>
                </div>
              </div>

              {/* Card 4: Active Direct Chats */}
              <div
                onClick={() => onNavigate('chats')}
                className="p-3.5 rounded-2xl bg-white border border-[#e3bfb4]/60 shadow-xs hover:border-[#ab3100] cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] text-[#5a4139] font-semibold">Accepted Chats</span>
                  <span className="material-symbols-outlined text-green-700 text-[20px]">chat</span>
                </div>
                <div className="mt-2">
                  <span className="text-[24px] font-black text-green-800">{acceptedCount}</span>
                  <span className="text-[10px] text-green-700 block font-medium">
                    {acceptedCount > 0 ? `${acceptedCount} Direct Lines Open` : '0 Accepted Chats'}
                  </span>
                </div>
              </div>

              {/* Card 5: Subscription Contact Credits */}
              <div
                onClick={() => onOpenSubscriptionModal()}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-[#ffdcc3] to-[#ffdbd0] border border-[#e3bfb4] shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] text-[#6e3900] font-bold">Contact Credits</span>
                  <span className="material-symbols-outlined text-[#ab3100] text-[20px]">workspace_premium</span>
                </div>
                <div className="mt-2">
                  <span className="text-[24px] font-black text-[#ab3100]">
                    {userSubscription.contactsRemaining}
                  </span>
                  <span className="text-[10px] text-[#6e3900] block font-bold">
                    {unlockedCount > 0 ? `${unlockedCount} Unlocked • ${userSubscription.contactsRemaining} Left` : `${userSubscription.contactsRemaining} Credits Available`}
                  </span>
                </div>
              </div>

              {/* Card 6: Saved Shortlists */}
              <div
                onClick={() => onNavigate('feed')}
                className="p-3.5 rounded-2xl bg-white border border-[#e3bfb4]/60 shadow-xs hover:border-[#ab3100] cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] text-[#5a4139] font-semibold">Saved Shortlists</span>
                  <span className="material-symbols-outlined text-[#ab3100] text-[20px]">bookmark</span>
                </div>
                <div className="mt-2">
                  <span className="text-[24px] font-black text-[#ab3100]">{shortlistedCount}</span>
                  <span className="text-[10px] text-[#5a4139] block font-medium">
                    {shortlistedCount > 0 ? `${shortlistedCount} Bookmarked Profiles` : '0 Saved Profiles'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-4 p-4 rounded-2xl bg-white border border-[#e3bfb4]/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fff0eb] text-[#ab3100] border border-[#e3bfb4] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ab3100] text-white uppercase tracking-wider">
                    Paid Members Only
                  </span>
                  <h4 className="font-bold text-[13px] text-[#1f1b14]">
                    Activity & Key Metrics
                  </h4>
                </div>
                <p className="text-[11px] text-[#5a4139] mt-0.5">
                  Activate a membership plan to track live proposals, direct line unlocks and chat privileges.
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenSubscriptionModal()}
              className="px-3.5 py-2 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white text-[11px] font-bold shadow-xs active:scale-95 shrink-0"
            >
              Upgrade to Paid Plan
            </button>
          </section>
        )
      )}

      {/* 2.5 RECOMMENDED MATCHES SECTION (Exclusive for Paid Users; Locked Gate for Free Users; Teaser for Visitors) */}
      {currentUser ? (
        isPaidUser ? (
          /* ACTIVE RECOMMENDED MATCHES FOR PAID MEMBERS */
          <section className="mt-5 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#fff2e8] via-[#fffaf5] to-[#ffece0] border-2 border-[#e3bfb4] shadow-sm flex flex-col gap-4">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#e3bfb4]/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ab3100] to-[#e65100] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-extrabold text-[17px] text-[#1f1b14] font-['Noto_Sans']">
                      अनुशंसित रिश्ते • Recommended Matches
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#ab3100] text-white">
                      {recommendedMatches.length} Matches Found
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">workspace_premium</span>
                      <span>👑 Paid Access</span>
                    </span>
                  </div>
                  <p className="text-[12px] text-[#5a4139]">
                    पंजीकरण प्राथमिकताओं पर आधारित मिलान: {targetGender === 'groom' ? 'वर' : 'वधू'} (उम्र: {prefAgeRange[0]}-{prefAgeRange[1]} वर्ष • स्थान: {userCandidateCity}, {userCandidateState} • जाति: {userCandidateCaste})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-bold text-[#ab3100] bg-white px-2.5 py-1 rounded-full border border-[#e3bfb4] shadow-2xs">
                  🎯 Smart Algorithm Active
                </span>
              </div>
            </div>

            {/* Interactive Match Preference Controls */}
            <div className="p-3 bg-white/80 rounded-2xl border border-[#e3bfb4]/60 flex flex-col gap-2.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#8e4b00] flex-wrap gap-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Tweak Match Preferences (पसंद समायोजित करें):</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetToRegistrationPrefs}
                  className="text-[10px] text-[#ab3100] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  title="Reset to interests filled during registration"
                >
                  <span className="material-symbols-outlined text-[12px]">restart_alt</span>
                  <span>पंजीकरण प्राथमिकताएं लागू करें (Reset to Reg Prefs)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Age Range Control */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[#5a4139]">
                    Age Preference ({prefAgeRange[0]} - {prefAgeRange[1]} yrs):
                  </label>
                  <div className="flex gap-1">
                    {[
                      { label: '21-25', range: [21, 25] as [number, number] },
                      { label: '23-27', range: [23, 27] as [number, number] },
                      { label: '25-29', range: [25, 29] as [number, number] },
                      { label: '27-31', range: [27, 31] as [number, number] },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => setPrefAgeRange(btn.range)}
                        className={`flex-1 py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all ${
                          prefAgeRange[0] === btn.range[0] && prefAgeRange[1] === btn.range[1]
                            ? 'bg-[#ab3100] text-white shadow-2xs'
                            : 'bg-[#f7ece1] text-[#5a4139] hover:bg-[#efe0d3]'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Mode Control */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[#5a4139]">
                    Location Preference:
                  </label>
                  <div className="flex gap-1">
                    {[
                      { id: 'same_district', label: `ज़िला (${userCandidateCity})` },
                      { id: 'same_state', label: `राज्य (${userCandidateState === 'Bihar' ? 'बिहार' : 'UP'})` },
                      { id: 'all', label: 'बिहार + UP' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setPrefLocationMode(btn.id as any)}
                        className={`flex-1 py-1 px-1 text-[10px] font-bold rounded-lg transition-all truncate ${
                          prefLocationMode === btn.id
                            ? 'bg-[#ab3100] text-white shadow-2xs'
                            : 'bg-[#f7ece1] text-[#5a4139] hover:bg-[#efe0d3]'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Caste Mode Control */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[#5a4139]">
                    Caste Preference:
                  </label>
                  <div className="flex gap-1">
                    {[
                      { id: 'same_caste', label: `समान जाति (${userCandidateCaste})` },
                      { id: 'all', label: 'सर्वसमाज (All)' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setPrefCasteMode(btn.id as any)}
                        className={`flex-1 py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all ${
                          prefCasteMode === btn.id
                            ? 'bg-[#ab3100] text-white shadow-2xs'
                            : 'bg-[#f7ece1] text-[#5a4139] hover:bg-[#efe0d3]'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Matches Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(showAllRecommendations ? recommendedMatches : recommendedMatches.slice(0, 4)).map(
                ({ profile: p, totalScore, ageTag, locationTag, casteTag }) => {
                  const scoreColor =
                    totalScore >= 90
                      ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white'
                      : totalScore >= 75
                      ? 'bg-gradient-to-r from-[#ab3100] to-[#e65100] text-white'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white';

                  const scoreLabel =
                    totalScore >= 90
                      ? '🔥 उत्तम मिलान (Excellent Match)'
                      : totalScore >= 75
                      ? '🌟 श्रेष्ठ मिलान (High Match)'
                      : '✨ शुभ मिलान (Good Match)';

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-white border border-[#e3bfb4]/80 shadow-xs hover:shadow-md hover:border-[#ab3100] transition-all flex flex-col justify-between gap-3 relative overflow-hidden"
                    >
                      {/* Top Match Score Badge Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1 ${scoreColor}`}>
                          <span>{totalScore}% Match</span>
                          <span className="opacity-90">• {scoreLabel}</span>
                        </span>

                        <span className="text-[10px] font-bold text-[#8e4b00] bg-[#fdf2e6] px-2 py-0.5 rounded-full border border-[#e3bfb4]/50">
                          ⭐ गुण: {p.gunScore}/36
                        </span>
                      </div>

                      {/* Candidate Quick Profile Card */}
                      <div className="flex gap-3 items-start">
                        <div className="relative shrink-0">
                          <img
                            src={p.photos[0]}
                            alt={p.name}
                            className="w-16 h-16 rounded-xl object-cover border border-[#e3bfb4] shadow-2xs"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-0.5 text-[10px] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              verified
                            </span>
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[14px] text-[#1f1b14] leading-tight truncate">
                            {p.name}
                          </h4>
                          <p className="text-[11px] text-[#8e4b00] font-semibold mt-0.5">
                            {p.professionTag || p.profession}
                          </p>
                          <p className="text-[10px] text-[#5a4139] truncate">
                            {p.education} • {p.gotra ? `${p.gotra} गोत्र` : ''}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5">
                            पिताजी: {p.fatherOccupation}
                          </p>
                        </div>
                      </div>

                      {/* 3 Pill Reasons why recommended */}
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-semibold flex items-center gap-0.5">
                          {ageTag}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-900 border border-sky-200 font-semibold flex items-center gap-0.5">
                          {locationTag}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold flex items-center gap-0.5">
                          {casteTag}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-[#f1e7db] flex items-center gap-2">
                        <button
                          onClick={() => handleProposalAction(p)}
                          type="button"
                          className="flex-1 py-1.5 px-2 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white text-[11px] font-bold shadow-2xs transition-transform active:scale-95 flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">send</span>
                          <span>प्रस्ताव भेजें</span>
                        </button>

                        <button
                          onClick={() => onSelectProfile(p)}
                          type="button"
                          className="py-1.5 px-2.5 rounded-xl bg-[#f1e7db] hover:bg-[#ebe1d6] text-[#5a4139] text-[11px] font-bold transition-colors"
                          title="View Full Biodata"
                        >
                          विवरण
                        </button>

                        <button
                          onClick={() => handleConnectAction(p)}
                          type="button"
                          className="py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition-colors flex items-center gap-0.5"
                          title="Connect Family"
                        >
                          <span className="material-symbols-outlined text-[14px]">call</span>
                          <span>संपर्क</span>
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Show More / Show Less Toggle */}
            {recommendedMatches.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                className="w-full py-2 rounded-xl bg-white hover:bg-[#fdf2e6] border border-[#e3bfb4] text-[#ab3100] text-[12px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showAllRecommendations ? 'expand_less' : 'expand_more'}
                </span>
                <span>
                  {showAllRecommendations
                    ? 'कम रिश्ते दिखाएं (Show Less)'
                    : `और अनुशंसित रिश्ते देखें (${recommendedMatches.length - 4} और विकल्प उपलब्ध)`}
                </span>
              </button>
            )}
          </section>
        ) : (
          /* EXCLUSIVE FEATURE GATE FOR FREE LOGGED-IN USERS */
          <section className="mt-5 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#fff8f3] via-white to-[#fef2e7] border-2 border-[#e3bfb4] shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e3bfb4]/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ab3100] to-[#e65100] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-extrabold text-[17px] text-[#1f1b14] font-['Noto_Sans']">
                      अनुशंसित रिश्ते • Recommended Matches
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#8e4b00] text-white">
                      👑 Paid Members Exclusive
                    </span>
                  </div>
                  <p className="text-[12px] text-[#5a4139]">
                    सशुल्क सदस्यों के लिए विशेष अल्गोरिदम मिलान सेवा (Exclusive for Paid Members)
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-[#ab3100] bg-[#ffdcc3] px-2.5 py-1 rounded-full border border-[#e3bfb4] self-start sm:self-auto flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <span>{recommendedMatches.length} Matches Found</span>
              </span>
            </div>

            {/* Explanatory Info Card */}
            <div className="p-3.5 bg-gradient-to-r from-[#fef5ec] to-white rounded-2xl border border-[#e3bfb4]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase text-[#ab3100] tracking-wider block mb-0.5">
                  🎯 पंजीकरण प्राथमिकताओं पर आधारित मिलान (Registration Interests)
                </span>
                <p className="text-[13px] font-bold text-[#1f1b14]">
                  {currentUser.candidateName} के लिए {recommendedMatches.length} उच्च-सटीक {targetGender === 'groom' ? 'वर' : 'वधू'} रिश्ते खोजे गए हैं!
                </p>
                <p className="text-[11px] text-[#5a4139] mt-0.5">
                  पंजीकरण में दी गई आयु ({prefAgeRange[0]}-{prefAgeRange[1]} वर्ष), स्थान ({userCandidateCity}, {userCandidateState}) एवं जाति ({userCandidateCaste}) प्राथमिकताओं के अनुसार तैयार।
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => onOpenSubscriptionModal()}
                  className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white text-[12px] font-bold shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                  <span>योजनाएं देखें (View Plans)</span>
                </button>

                {onUpgradeToPaid && (
                  <button
                    type="button"
                    onClick={() => onUpgradeToPaid('gold', false)}
                    className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#ab3100] to-[#e65100] hover:from-[#852400] hover:to-[#bf360c] text-white text-[11px] font-bold shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                    title="पेमेंट गेटवे खोलें (Open Payment Gateway)"
                  >
                    <span className="material-symbols-outlined text-[15px]">credit_card</span>
                    <span>💳 पेमेंट गेटवे (Pay Online)</span>
                  </button>
                )}

                {onUpgradeToPaid && (
                  <button
                    type="button"
                    onClick={() => onUpgradeToPaid('gold', true)}
                    className="w-full sm:w-auto py-2.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 text-[11px] font-black shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                    title="1-Click Instant Demo Paid Upgrade"
                  >
                    <span>⭐ 1-Click Test</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sample Blurred Match Preview Card */}
            {recommendedMatches.length > 0 && (
              <div className="relative p-3.5 rounded-2xl bg-white border border-[#e3bfb4]/80 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-700 text-white flex items-center gap-1 shadow-2xs">
                    <span>{recommendedMatches[0].totalScore}% Match</span>
                    <span>• {recommendedMatches[0].totalScore >= 90 ? '🔥 उत्तम मिलान' : '🌟 श्रेष्ठ मिलान'}</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#8e4b00] bg-[#fdf2e6] px-2 py-0.5 rounded-full border border-[#e3bfb4]/50">
                    ⭐ गुण: {recommendedMatches[0].profile.gunScore}/36
                  </span>
                </div>

                <div className="flex gap-3 items-start filter blur-[3px] select-none pointer-events-none opacity-60">
                  <img
                    src={recommendedMatches[0].profile.photos[0]}
                    alt="Preview"
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-[14px] text-[#1f1b14]">
                      {recommendedMatches[0].profile.name.charAt(0)}******* (सत्यापित बायोडाटा)
                    </h4>
                    <p className="text-[11px] text-[#8e4b00] font-semibold">
                      {recommendedMatches[0].profile.profession}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      📍 {recommendedMatches[0].profile.nativeDistrict} • 🪷 {recommendedMatches[0].profile.caste}
                    </p>
                  </div>
                </div>

                {/* Lock Overlay on Card */}
                <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
                  <div className="bg-[#fff8f3] border border-[#e3bfb4] p-3 rounded-xl shadow-md max-w-xs flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-[#ab3100] text-[24px]">lock</span>
                    <span className="text-[12px] font-bold text-[#1f1b14]">
                      सशुल्क योजना में अनलॉक करें (Locked for Free Plan)
                    </span>
                    <span className="text-[10px] text-[#5a4139]">
                      अनुशंसित रिश्तों के संपर्क नंबर, कुंडली एवं पूर्ण विवरण देखने के लिए सशुल्क योजना चुनें।
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenSubscriptionModal()}
                      className="mt-1 px-3 py-1 rounded-lg bg-[#ab3100] text-white text-[11px] font-bold hover:bg-[#852400] transition-colors"
                    >
                      योजनाएं देखें (View Plans)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )
      ) : (
        /* Visitor Teaser for Recommended Matches Algorithm with 1-Click Interactive Demos */
        <section className="mt-5 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#fdf2e6] via-white to-[#fff2e8] border border-[#e3bfb4] shadow-xs flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#ab3100] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black tracking-wider uppercase text-[#ab3100] bg-[#ffdcc3] px-2 py-0.5 rounded-full inline-block mb-1">
                AI Matching Engine • उम्र, ज़िला व जाति मिलान
              </span>
              <h3 className="font-extrabold text-[16px] text-[#1f1b14] leading-tight">
                Get Personalized 'Recommended Matches' for Your Family
              </h3>
              <p className="text-[12px] text-[#5a4139] mt-1 leading-relaxed">
                Log in to experience our matching algorithm that computes 100% personalized compatibility scores based on candidate age, location (Bihar / UP districts), and caste/community traditions.
              </p>
            </div>
          </div>

          {/* 1-Click Test Demo Logins */}
          <div className="p-3 bg-[#fff8f3] rounded-2xl border border-[#e3bfb4]/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span className="text-[11px] font-bold text-[#8e4b00]">
              🎯 Test Algorithm Now (तुरंत देखें):
            </span>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (onLogin) {
                    onLogin(DEMO_USERS[0]);
                    onToast('Logged in as राहुल शर्मा (वर, वाराणसी). Showing recommended bride matches!');
                  } else {
                    onOpenAuthModal();
                  }
                }}
                className="flex-1 sm:flex-initial py-2 px-3 rounded-xl bg-[#ab3100] text-white text-[11px] font-bold hover:bg-[#852400] transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>UP Groom Match (राहुल - वर)</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onLogin && DEMO_USERS[2]) {
                    onLogin(DEMO_USERS[2]);
                    onToast('Logged in as अनन्य श्रीवास्तव (वधू, पटना बिहार). Showing recommended groom matches!');
                  } else if (onLogin) {
                    onLogin(DEMO_USERS[1]);
                    onToast('Logged in as अंजलि शर्मा (वधू). Showing recommended groom matches!');
                  } else {
                    onOpenAuthModal();
                  }
                }}
                className="flex-1 sm:flex-initial py-2 px-3 rounded-xl bg-[#1b5e20] text-white text-[11px] font-bold hover:bg-[#124116] transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Bihar Bride Match (अनन्य - पटना)</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. PROFILES DIRECTORY: VISITOR SHOWCASE vs LOGGED-IN TAILORED PARTNER LIST */}
      <section className="mt-5 flex flex-col gap-3">
        {!currentUser ? (
          /* VISITOR SHOWCASE GALLERY (Before Login) */
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#ab3100] text-[22px]">favorite</span>
                  <h2 className="font-bold text-[18px] text-[#1f1b14] font-['Noto_Sans']">
                    Brides & Grooms Showcase Gallery
                  </h2>
                </div>
                <p className="text-[12px] text-[#5a4139] mt-0.5">
                  Verified prospective profiles with full names, age, native districts, and family credentials
                </p>
              </div>

              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#f1e7db] text-[#6e3900] self-start sm:self-auto">
                {displayedProfiles.length} Profiles Available
              </span>
            </div>

            {/* Filter Controls: Gender Segmented Tabs for Visitors ONLY */}
            <div className="bg-white p-1 rounded-2xl border border-[#e3bfb4] shadow-xs flex items-center gap-1">
              <button
                onClick={() => setGenderFilter('all')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  genderFilter === 'all'
                    ? 'bg-[#ab3100] text-white shadow-xs'
                    : 'text-[#5a4139] hover:bg-[#faf6f0]'
                }`}
              >
                <span>All Profiles</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  genderFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {profiles.length}
                </span>
              </button>

              <button
                onClick={() => setGenderFilter('bride')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  genderFilter === 'bride'
                    ? 'bg-[#ab3100] text-white shadow-xs'
                    : 'text-[#5a4139] hover:bg-[#faf6f0]'
                }`}
              >
                <span>👰 Brides (वधू)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  genderFilter === 'bride' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {bridesCount}
                </span>
              </button>

              <button
                onClick={() => setGenderFilter('groom')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  genderFilter === 'groom'
                    ? 'bg-[#ab3100] text-white shadow-xs'
                    : 'text-[#5a4139] hover:bg-[#faf6f0]'
                }`}
              >
                <span>🤵 Grooms (वर)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  genderFilter === 'groom' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {groomsCount}
                </span>
              </button>
            </div>
          </>
        ) : (
          /* LOGGED-IN TAILORED PARTNER DIRECTORY (NO Brides & Grooms Showcase Gallery! NO Gender Tabs!) */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#fef5ec] via-white to-[#fff8f3] border border-[#e3bfb4]">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ab3100] text-[22px]">how_to_reg</span>
                <h2 className="font-bold text-[18px] text-[#1f1b14] font-['Noto_Sans']">
                  {targetGender === 'groom' ? 'वर प्रोफाइल सूची • Tailored Groom Profiles' : 'वधू प्रोफाइल सूची • Tailored Bride Profiles'}
                </h2>
              </div>
              <p className="text-[12px] text-[#5a4139] mt-0.5">
                पंजीकरण के अनुसार केवल {targetGender === 'groom' ? 'वर (Groom)' : 'वधू (Bride)'} के सत्यापित रिश्ते प्रदर्शित हैं (क्योंकि आपने पहले ही चयन कर लिया है)।
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#ab3100] text-white shadow-2xs">
                {targetGender === 'groom' ? 'केवल वर (Grooms Only)' : 'केवल वधू (Brides Only)'} • {displayedProfiles.length} उपलब्ध
              </span>
            </div>
          </div>
        )}

        {/* Religion Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All Religions (सभी धर्म)' },
            { id: 'Hindu', label: '🕉️ Hindu (हिंदू)' },
            { id: 'Muslim', label: '☪️ Muslim (मुस्लिम)' },
            { id: 'Sikh', label: 'ੴ Sikh (सिख)' },
            { id: 'Jain', label: '🪷 Jain (जैन)' },
            { id: 'Christian', label: '✝️ Christian (ईसाई)' },
            { id: 'Buddhist', label: '☸️ Buddhist (बौद्ध)' },
          ].map((rel) => (
            <button
              key={rel.id}
              onClick={() => setReligionFilter(rel.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                religionFilter === rel.id
                  ? 'bg-[#ab3100] text-white shadow-xs'
                  : 'bg-white text-[#5a4139] border border-[#e3bfb4]/60 hover:bg-[#faf6f0]'
              }`}
            >
              {rel.label}
            </button>
          ))}
        </div>

        {/* Caste / Community Filter Pills (Multi-Caste Inclusive) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All Castes (सभी जातियां)' },
            { id: 'Brahmin', label: 'ब्राह्मण (Brahmin)' },
            { id: 'Rajput', label: 'राजपूत (Rajput)' },
            { id: 'Bhumihar', label: 'भूमिहार (Bhumihar)' },
            { id: 'Kayastha', label: 'कायस्थ (Kayastha)' },
            { id: 'Yadav', label: 'यादव / अहीर (Yadav)' },
            { id: 'Kurmi', label: 'कुर्मी / पटेल (Kurmi)' },
            { id: 'Kushwaha', label: 'कुशवाहा / मौर्य (Kushwaha)' },
            { id: 'Vaishya', label: 'वैश्य / गुप्ता / बनिया' },
            { id: 'Teli', label: 'तेली / साहू (Teli/Sahu)' },
            { id: 'Paswan', label: 'पासवान / दुसाध' },
            { id: 'Ravidas', label: 'रविदास / जाटव' },
            { id: 'Nishad', label: 'निषाद / सहनी' },
            { id: 'Muslim', label: 'मुस्लिम समुदाय' },
            { id: 'Sikh', label: 'सिख समुदाय' },
            { id: 'Jain', label: 'जैन समुदाय' },
            { id: 'Christian', label: 'ईसाई समुदाय' },
            { id: 'Buddhist', label: 'बौद्ध समुदाय' },
          ].map((cst) => (
            <button
              key={cst.id}
              onClick={() => setCasteFilter(cst.id)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all shrink-0 ${
                casteFilter === cst.id
                  ? 'bg-[#8e4b00] text-white shadow-xs'
                  : 'bg-white text-[#5a4139] border border-[#e3bfb4]/60 hover:bg-[#faf6f0]'
              }`}
            >
              {cst.label}
            </button>
          ))}
        </div>

        {/* Search & Location Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-gray-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, district, caste, profession..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e3bfb4] bg-white text-xs text-[#1f1b14] focus:outline-none focus:ring-1 focus:ring-[#ab3100]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* State Filter Dropdown */}
          <div className="relative">
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setDistrictFilter('all');
              }}
              className="w-full px-2.5 py-2 rounded-xl border border-[#e3bfb4] bg-white text-xs text-[#1f1b14] font-medium focus:outline-none focus:ring-1 focus:ring-[#ab3100]"
            >
              <option value="all">🌐 All States</option>
              <option value="Uttar Pradesh">उत्तर प्रदेश (UP)</option>
              <option value="Bihar">बिहार (Bihar)</option>
            </select>
          </div>

          {/* District Filter Dropdown */}
          <div className="relative">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-[#e3bfb4] bg-white text-xs text-[#1f1b14] font-medium focus:outline-none focus:ring-1 focus:ring-[#ab3100]"
            >
              <option value="all">📍 All Locations</option>
              {districts
                .filter((d) => {
                  if (stateFilter === 'Bihar') {
                    return ['पटना', 'गया', 'मुजफ्फरपुर', 'भागलपुर', 'दरभंगा', 'पूर्णिया', 'बेगूसराय', 'आरा', 'छपरा', 'समस्तीपुर', 'नालंदा', 'बेतिया'].some(
                      (bd) => d.includes(bd) || bd.includes(d)
                    );
                  }
                  if (stateFilter === 'Uttar Pradesh') {
                    return ['वाराणसी', 'अयोध्या', 'गोरखपुर', 'लखनऊ', 'प्रयागराज', 'कानपुर', 'सुल्तानपुर', 'बस्ती'].some(
                      (ud) => d.includes(ud) || ud.includes(d)
                    );
                  }
                  return true;
                })
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Profiles Cards List */}
        <div className="flex flex-col gap-3.5 mt-1">
          {displayedProfiles.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-[#e3bfb4] p-6">
              <span className="material-symbols-outlined text-[40px] text-gray-300">person_search</span>
              <h4 className="text-sm font-bold text-[#1f1b14] mt-2">No profiles matched your filter</h4>
              <p className="text-xs text-[#5a4139] mt-1">Try resetting the district or search keyword.</p>
              <button
                onClick={() => {
                  if (!currentUser) setGenderFilter('all');
                  setDistrictFilter('all');
                  setReligionFilter('all');
                  setCasteFilter('all');
                  setSearchQuery('');
                }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-[#ab3100] text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            displayedProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-2xl border border-[#e3bfb4]/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Profile Top Banner: Photo & Primary Info */}
                <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                  {/* Photo Container */}
                  <div
                    onClick={() => onSelectProfile(profile)}
                    className="relative w-full sm:w-28 h-48 sm:h-32 rounded-xl overflow-hidden cursor-pointer shrink-0 border border-[#e3bfb4]/60 bg-[#fdf2e6]"
                  >
                    <img
                      src={profile.photos[0]}
                      alt={profile.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Photo count badge */}
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold flex items-center gap-0.5 backdrop-blur-xs">
                      <span className="material-symbols-outlined text-[12px]">photo_camera</span>
                      <span>{profile.photos.length}</span>
                    </span>

                    {/* Gender badge */}
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-[#ab3100] text-white text-[10px] font-bold shadow-xs">
                      {profile.gender === 'bride' ? 'वधू • Bride' : 'वर • Groom'}
                    </span>
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {/* Name & Age */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => onSelectProfile(profile)}
                            className="font-bold text-[16px] text-[#1f1b14] hover:text-[#ab3100] cursor-pointer font-['Noto_Sans'] truncate"
                          >
                            {profile.name}
                          </h3>
                          <span className="text-[12px] font-bold text-[#8e4b00] px-2 py-0.2 rounded-full bg-[#ffdcc3]">
                            {profile.age} Yrs • {profile.height.split(' ')[0] || "5'4\""}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            profile.state === 'Bihar'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-orange-50 text-orange-900 border-orange-200'
                          }`}>
                            📍 {profile.nativeDistrict}, {profile.state || 'उत्तर प्रदेश'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {profile.religion === 'Muslim' ? '☪️ मुस्लिम' :
                             profile.religion === 'Sikh' ? 'ੴ सिख' :
                             profile.religion === 'Christian' ? '✝️ ईसाई' :
                             profile.religion === 'Jain' ? '🪷 जैन' :
                             profile.religion === 'Buddhist' ? '☸️ बौद्ध' : '🕉️ हिंदू'}
                          </span>
                          {profile.caste && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                              {profile.caste}
                            </span>
                          )}
                        </div>

                        {/* Location */}
                        <p className="text-[12px] text-[#5a4139] mt-0.5 flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-[15px] text-[#ab3100]">location_on</span>
                          <span>{profile.nativeDistrict}, {profile.state || 'उत्तर प्रदेश'} (मूल निवासी: {profile.nativePlace || profile.currentCity})</span>
                        </p>
                      </div>

                      {/* Guna Score Badge */}
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-extrabold text-[#ab3100] block">
                          ⭐ {profile.gunScore}/36 Guna
                        </span>
                        <span className="text-[10px] text-gray-500 block">
                          {profile.manglikStatus}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#5a4139] bg-[#faf6f0] p-2 rounded-xl border border-[#e3bfb4]/40">
                      <div className="truncate">
                        <strong className="text-gray-700">💼 Profession: </strong>
                        <span>{profile.professionTag || profile.profession}</span>
                      </div>
                      <div className="truncate">
                        <strong className="text-gray-700">🎓 Education: </strong>
                        <span>{profile.education}</span>
                      </div>
                      <div className="truncate">
                        <strong className="text-gray-700">🪷 Gotra / Caste: </strong>
                        <span>{profile.gotra} गोत्र • {profile.community}</span>
                      </div>
                      <div className="truncate">
                        <strong className="text-gray-700">👨‍👩‍👧 Family: </strong>
                        <span>{profile.familySummary || `${profile.fatherOccupation}`}</span>
                      </div>
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => onSelectProfile(profile)}
                        className="py-1.5 px-3 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">badge</span>
                        <span>View Full Biodata</span>
                      </button>

                      <button
                        onClick={() => handleProposalAction(profile)}
                        className="py-1.5 px-3 rounded-xl bg-white hover:bg-[#fff0eb] border border-[#ab3100] text-[#ab3100] text-xs font-bold active:scale-95 transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">favorite</span>
                        <span>Send Proposal</span>
                      </button>

                      <button
                        onClick={() => handleConnectAction(profile)}
                        className="py-1.5 px-2.5 rounded-xl bg-[#ffdcc3] hover:bg-[#ffb77d] text-[#6e3900] text-xs font-bold active:scale-95 transition-all flex items-center gap-1 ml-auto"
                        title="Unlock Phone & WhatsApp Contact"
                      >
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        <span>Connect</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. MID-PAGE HIGH-CONVERTING INCENTIVE BANNER */}
      <section className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-[#ffdcc3] via-[#ffebd9] to-[#ffdbd0] border border-[#e3bfb4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ab3100] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[26px]">groups</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ab3100] block">
              Easy 3-Step Matchmaking
            </span>
            <h3 className="font-bold text-[15px] text-[#3a2215]">
              Attracted to Our Verified Candidates?
            </h3>
            <p className="text-[11px] text-[#5a4139] mt-0.5 leading-snug">
              Complete free registration to unlock contact telephone numbers, horoscope birth charts, and send direct marriage proposals!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('register')}
            className="py-2.5 px-3.5 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white text-xs font-bold shadow-xs active:scale-95 transition-all whitespace-nowrap"
          >
            Register Free Now
          </button>
          <button
            onClick={() => onNavigate('plans')}
            className="py-2.5 px-3.5 rounded-xl bg-white border border-[#ab3100] text-[#ab3100] text-xs font-bold shadow-xs active:scale-95 transition-all whitespace-nowrap"
          >
            Membership Plans
          </button>
        </div>
      </section>

      {/* 5. FAST ACTION LAUNCHPAD */}
      <section className="mt-6 flex flex-col gap-2.5">
        <h3 className="font-bold text-[16px] text-[#1f1b14] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#ab3100] text-[20px]">rocket_launch</span>
          <span>Action Launchpad</span>
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Action 1: New Registration */}
          <button
            onClick={() => onNavigate('register')}
            className="p-3.5 rounded-2xl bg-[#ab3100] hover:bg-[#852400] text-white text-left shadow-xs flex flex-col justify-between active:scale-98 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white mb-2">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <div>
              <strong className="text-[13px] block font-bold">Register New Biodata</strong>
              <span className="text-[10px] text-[#ffdcc3] block">With BDE referral code</span>
            </div>
          </button>

          {/* Action 2: Kundali Filter */}
          <button
            onClick={() => onNavigate('filter')}
            className="p-3.5 rounded-2xl bg-white hover:bg-[#fdf2e6] border border-[#e3bfb4] text-left shadow-xs flex flex-col justify-between active:scale-98 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-[#fdf2e6] flex items-center justify-center text-[#ab3100] mb-2">
              <span className="material-symbols-outlined text-[20px]">filter_alt</span>
            </div>
            <div>
              <strong className="text-[13px] text-[#1f1b14] block font-bold">Horoscope & Filters</strong>
              <span className="text-[10px] text-[#5a4139] block">Gotra & Kundali filters</span>
            </div>
          </button>

          {/* Action 3: Subscription Plans */}
          <button
            onClick={() => onNavigate('plans')}
            className="p-3.5 rounded-2xl bg-white hover:bg-[#fdf2e6] border border-[#e3bfb4] text-left shadow-xs flex flex-col justify-between active:scale-98 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-[#ffdcc3] flex items-center justify-center text-[#8e4b00] mb-2">
              <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
            </div>
            <div>
              <strong className="text-[13px] text-[#1f1b14] block font-bold">Membership Plans</strong>
              <span className="text-[10px] text-[#5a4139] block">Unlock direct contacts</span>
            </div>
          </button>

          {/* Action 4: Success Stories */}
          <button
            onClick={() => onNavigate('stories')}
            className="p-3.5 rounded-2xl bg-white hover:bg-[#fdf2e6] border border-[#e3bfb4] text-left shadow-xs flex flex-col justify-between active:scale-98 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 mb-2">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
            </div>
            <div>
              <strong className="text-[13px] text-[#1f1b14] block font-bold">Success Stories</strong>
              <span className="text-[10px] text-[#5a4139] block">2,450+ verified marriages</span>
            </div>
          </button>
        </div>
      </section>

      {/* 6. DEDICATED RELATIONSHIP MANAGER / COUNSELOR CARD */}
      <section className="mt-5 p-4 rounded-2xl bg-[#fdf2e6] border border-[#e3bfb4] shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#ab3100] shrink-0">
            <span className="material-symbols-outlined text-[26px]">support_agent</span>
          </div>
          <div>
            <h4 className="font-bold text-[14px] text-[#1f1b14]">
              Pandit Radheshyam (Senior Counselor)
            </h4>
            <p className="text-[11px] text-[#5a4139]">
              Personalized guidance on horoscope matching & family meetings.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenCounselorModal}
          className="px-3.5 py-2 rounded-xl bg-[#1f1b14] text-white text-[12px] font-bold hover:bg-black active:scale-95 shrink-0"
        >
          Consult Now 📞
        </button>
      </section>

      {/* 7. VISITOR PROMPT MODAL (WHEN UNREGISTERED VISITOR CLICKS INTERACTIVE BUTTONS) */}
      {visitorPromptProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-xl border border-[#e3bfb4] relative">
            <button
              onClick={() => setVisitorPromptProfile(null)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>

            {/* Candidate Quick Highlight */}
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-[#e3bfb4]/50">
              <img
                src={visitorPromptProfile.photos[0]}
                alt={visitorPromptProfile.name}
                className="w-14 h-14 rounded-2xl object-cover border border-[#e3bfb4]"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#ffdcc3] text-[#ab3100]">
                  {visitorPromptProfile.gender === 'bride' ? 'वधू' : 'वर'}
                </span>
                <h4 className="font-bold text-[15px] text-[#1f1b14] truncate mt-0.5">
                  {visitorPromptProfile.name}
                </h4>
                <p className="text-[11px] text-[#5a4139] truncate">
                  {visitorPromptProfile.age} Yrs • {visitorPromptProfile.nativeDistrict}
                </p>
              </div>
            </div>

            <div className="text-center my-3">
              <div className="w-12 h-12 rounded-full bg-[#fff0eb] text-[#ab3100] mx-auto flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[26px]">how_to_reg</span>
              </div>
              <h3 className="font-bold text-[16px] text-[#1f1b14]">
                Register Free to Connect & Send Proposals
              </h3>
              <p className="text-[12px] text-[#5a4139] mt-1 leading-snug">
                To respect family privacy and ensure 100% genuine alliances, please complete free registration or sign in to connect with {visitorPromptProfile.name}.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => {
                  setVisitorPromptProfile(null);
                  onNavigate('register');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white text-xs font-bold shadow-sm transition-transform active:scale-98 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                <span>New Registration / Sign In (Free)</span>
              </button>

              <button
                onClick={() => {
                  setVisitorPromptProfile(null);
                  onOpenSubscriptionModal(visitorPromptProfile.name);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#ffdcc3] hover:bg-[#ffb77d] text-[#6e3900] text-xs font-bold transition-transform active:scale-98 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                <span>View Membership Plans</span>
              </button>

              <button
                onClick={() => {
                  setVisitorPromptProfile(null);
                  onSelectProfile(visitorPromptProfile);
                }}
                className="w-full py-2 px-4 rounded-xl text-xs font-medium text-[#5a4139] hover:bg-gray-50 transition-colors"
              >
                Preview Full Biodata Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
