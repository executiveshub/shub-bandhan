import React, { useState } from 'react';
import { Profile, AuthUser } from '../types/matrimony';
import { PANDIT_JI_AVATAR } from '../data/mockData';

interface ChatsScreenProps {
  profiles: Profile[];
  currentUser?: AuthUser | null;
  onSelectProfile: (profile: Profile) => void;
  onAcceptProposal: (profile: Profile) => void;
  onDeclineProposal: (profile: Profile) => void;
  onOpenFatherCall: (profile: Profile) => void;
  onOpenCounselorModal: () => void;
  onToast: (msg: string) => void;
}

export const ChatsScreen: React.FC<ChatsScreenProps> = ({
  profiles,
  currentUser,
  onSelectProfile,
  onAcceptProposal,
  onDeclineProposal,
  onOpenFatherCall,
  onOpenCounselorModal,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'accepted'>('received');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const targetGender = currentUser ? (currentUser.candidateGender === 'groom' ? 'bride' : 'groom') : null;
  const eligibleProfiles = targetGender ? profiles.filter((p) => p.gender === targetGender) : profiles;

  const receivedProfiles = eligibleProfiles.filter((p) => p.proposalStatus === 'received');
  const sentProfiles = eligibleProfiles.filter((p) => p.proposalStatus === 'sent');
  const acceptedProfiles = eligibleProfiles.filter((p) => p.proposalStatus === 'accepted');

  const toggleAudio = (profileId: string) => {
    if (playingAudioId === profileId) {
      setPlayingAudioId(null);
      onToast('ऑडियो परिचय रोका गया।');
    } else {
      setPlayingAudioId(profileId);
      onToast('दुबे परिवार का आडियो संदेश बज रहा है 🔊');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-28 pt-20">
      {/* Auspicious Header Motif */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[#ab3100] text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            diversity_3
          </span>
          <span className="font-bold text-[19px] text-[#1f1b14]">
            बातचीत व रिश्ते
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f7ece1] rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#ab3100] animate-pulse"></span>
          <span className="text-[12px] text-[#5a4139] font-medium">3 नए प्रस्ताव</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 mb-3">
        <div className="flex p-1 bg-[#f1e7db] rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-2 px-2 rounded-lg text-center text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeTab === 'received'
                ? 'bg-[#d3430c] text-white shadow-xs'
                : 'text-[#5a4139] hover:text-[#1f1b14]'
            }`}
          >
            <span>आए हुए रिश्ते</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === 'received'
                  ? 'bg-white text-[#ab3100]'
                  : 'bg-[#ebe1d6] text-[#5a4139]'
              }`}
            >
              {Math.max(receivedProfiles.length, 3)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-2 px-2 rounded-lg text-center text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeTab === 'sent'
                ? 'bg-[#d3430c] text-white shadow-xs'
                : 'text-[#5a4139] hover:text-[#1f1b14]'
            }`}
          >
            <span>भेजे गए रिश्ते</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-medium ${
                activeTab === 'sent'
                  ? 'bg-white text-[#ab3100]'
                  : 'bg-[#ebe1d6] text-[#5a4139]'
              }`}
            >
              {Math.max(sentProfiles.length, 2)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('accepted')}
            className={`flex-1 py-2 px-2 rounded-lg text-center text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeTab === 'accepted'
                ? 'bg-[#d3430c] text-white shadow-xs'
                : 'text-[#5a4139] hover:text-[#1f1b14]'
            }`}
          >
            <span>स्वीकृत बातचीत</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-medium ${
                activeTab === 'accepted'
                  ? 'bg-white text-[#ab3100]'
                  : 'bg-[#ebe1d6] text-[#5a4139]'
              }`}
            >
              {Math.max(acceptedProfiles.length, 4)}
            </span>
          </button>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Trust & Privacy Security Notice Banner */}
        <div className="bg-[#fdf2e6] rounded-2xl p-3.5 shadow-xs border border-[#e3bfb4]/40 flex items-start gap-3 relative overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-[#c4d4fe] flex items-center justify-center shrink-0 text-[#4b5b7f] mt-0.5">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 pr-1">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[14px] text-[#1f1b14]">
                परिवार की गोपनीयता सुरक्षा
              </span>
              <span className="material-symbols-outlined text-[15px] text-[#8e4b00]">lock</span>
            </div>
            <p className="text-[12px] text-[#5a4139] leading-relaxed">
              आपकी सुरक्षा हमारी प्राथमिकता है। केवल दोनों परिवारों की आपसी सहमति के बाद ही मोबाइल नंबर व WhatsApp संपर्क साझा किया जाता है।
            </p>
          </div>
        </div>

        {/* Tab 1: आए हुए रिश्ते (Received Proposals) */}
        {activeTab === 'received' && (
          <div className="flex flex-col gap-4">
            {receivedProfiles.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#e3bfb4]/40">
                <p className="text-[14px] text-[#5a4139]">वर्तमान में कोई नया प्रस्ताव प्रतीक्षित नहीं है।</p>
              </div>
            ) : (
              receivedProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-[#e3bfb4]/50 flex flex-col gap-3 relative overflow-hidden"
                >
                  {/* Subtle Top Accent Strip */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b26000] via-[#d3430c] to-[#8e4b00]" />

                  {/* Time & Status Tag */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="px-3 py-1 bg-[#ffdcc3] text-[#6e3900] rounded-full text-[11px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      कल शाम 6:30 बजे रिश्ता आया
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#f7ece1] text-[#5a4139] rounded-full text-[11px] font-medium">
                      निर्णय प्रतीक्षित
                    </span>
                  </div>

                  {/* Candidate Profile Header */}
                  <div className="flex gap-3.5 items-start">
                    <div
                      className="relative shrink-0 cursor-pointer"
                      onClick={() => onSelectProfile(profile)}
                    >
                      <img
                        src={profile.photos[0]}
                        alt={profile.name}
                        className="w-20 h-24 rounded-xl object-cover shadow-xs border border-[#e3bfb4]"
                      />
                      <span className="absolute -bottom-1.5 -right-1 px-1.5 py-0.5 bg-white text-[#8e4b00] rounded-full shadow-xs text-[10px] flex items-center gap-0.5 font-bold border border-[#e3bfb4]">
                        <span
                          className="material-symbols-outlined text-[12px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                        सत्यापित
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h2
                          className="font-bold text-[18px] text-[#1f1b14] truncate hover:text-[#ab3100] cursor-pointer"
                          onClick={() => onSelectProfile(profile)}
                        >
                          {profile.name}
                        </h2>
                        <span className="text-[13px] text-[#5a4139] shrink-0 font-medium">
                          {profile.age} वर्ष
                        </span>
                      </div>
                      <p className="text-[12px] text-[#5a4139] mt-0.5 line-clamp-1">
                        पिताजी: <span className="text-[#1f1b14] font-medium">{profile.fatherName}</span> ({profile.fatherOccupation})
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="px-2 py-0.5 bg-[#f1e7db] text-[#5a4139] rounded-full text-[11px] font-medium">
                          {profile.education}
                        </span>
                        <span className="px-2 py-0.5 bg-[#f1e7db] text-[#5a4139] rounded-full text-[11px] font-medium flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px] text-[#ab3100]">pin_drop</span>
                          {profile.nativeDistrict}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Kundali Match Highlight Box */}
                  <div className="bg-[#f7ece1] rounded-xl p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="material-symbols-outlined text-[#b26000] text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        auto_awesome
                      </span>
                      <span className="text-[13px] text-[#1f1b14] font-bold">
                        {profile.gunScore} गुण मिलान
                      </span>
                      <span className="text-[#5a4139] text-[12px]">• उत्तम शुभ योग</span>
                    </div>
                    <span className="px-2 py-0.5 bg-white text-[#5a4139] rounded-full text-[11px]">
                      {profile.manglikStatus}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-1">
                    {/* Primary Accept */}
                    <button
                      onClick={() => onAcceptProposal(profile)}
                      className="w-full min-h-[50px] bg-[#d3430c] hover:bg-[#ab3100] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
                    >
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <span>स्वीकार करें और नंबर साझा करें</span>
                    </button>

                    {/* Secondary Dual Bar */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectProfile(profile)}
                        className="min-h-[44px] bg-[#f7ece1] text-[#1f1b14] hover:bg-[#f1e7db] rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">contact_page</span>
                        <span>बायोडाटा देखें</span>
                      </button>
                      <button
                        onClick={() => onDeclineProposal(profile)}
                        className="min-h-[44px] bg-[#fdf2e6] text-[#5a4139] hover:bg-[#ebe1d6] rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                        <span>अस्वीकार करें</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: भेजे गए रिश्ते (Sent Proposals) */}
        {activeTab === 'sent' && (
          <div className="flex flex-col gap-3">
            {profiles
              .filter((p) => p.proposalStatus === 'sent' || p.id === 'anjali-sharma' || p.id === 'pooja-verma')
              .map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-[#e3bfb4]/40 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-[#8e4b00] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">outgoing_mail</span>
                      प्रस्ताव भेजा गया (2 दिन पहले)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-medium">
                      अभिभावक द्वारा देखा गया
                    </span>
                  </div>

                  <div className="flex gap-3 items-center">
                    <img
                      src={profile.photos[0]}
                      alt={profile.name}
                      className="w-16 h-16 rounded-xl object-cover border border-[#e3bfb4]"
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-bold text-[16px] text-[#1f1b14] hover:text-[#ab3100] cursor-pointer"
                        onClick={() => onSelectProfile(profile)}
                      >
                        {profile.name}
                      </h3>
                      <p className="text-[12px] text-[#5a4139]">{profile.age} वर्ष • {profile.professionTag || profile.profession}</p>
                      <p className="text-[11px] text-[#4e5e82] mt-0.5">अभिभावक: {profile.guardianName}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-[#e3bfb4]/30">
                    <button
                      onClick={() => onSelectProfile(profile)}
                      className="flex-1 py-2 bg-[#f7ece1] rounded-lg text-[12px] font-semibold text-[#1f1b14] hover:bg-[#f1e7db]"
                    >
                      बायोडाटा देखें
                    </button>
                    <button
                      onClick={() => onOpenFatherCall(profile)}
                      className="flex-1 py-2 bg-green-700 text-white rounded-lg text-[12px] font-semibold hover:bg-green-800"
                    >
                      पुनः स्मरण भेजें (Reminder)
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Tab 3: स्वीकृत बातचीत (Accepted Conversations) */}
        {activeTab === 'accepted' && (
          <div className="flex flex-col gap-4">
            {acceptedProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#e3bfb4]/50 flex flex-col gap-3 relative overflow-hidden"
              >
                {/* Auspicious Green Connection Banner */}
                <div className="bg-[#c4d4fe]/40 p-2.5 rounded-xl flex items-center gap-1.5 text-[#071b3b]">
                  <span
                    className="material-symbols-outlined text-[20px] text-[#4e5e82]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                  <span className="text-[13px] font-bold">
                    दोनों परिवारों ने रिश्ता पसंद किया है 🎉
                  </span>
                </div>

                {/* Candidate Profile Header */}
                <div className="flex gap-3.5 items-start">
                  <div
                    className="relative shrink-0 cursor-pointer"
                    onClick={() => onSelectProfile(profile)}
                  >
                    <img
                      src={profile.photos[0]}
                      alt={profile.name}
                      className="w-20 h-24 rounded-xl object-cover shadow-xs border border-[#e3bfb4]"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#b26000] text-white rounded-full flex items-center justify-center text-[12px] font-bold">
                      ✓
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h2
                        className="font-bold text-[18px] text-[#1f1b14] truncate hover:text-[#ab3100] cursor-pointer"
                        onClick={() => onSelectProfile(profile)}
                      >
                        {profile.name}
                      </h2>
                      <span className="text-[13px] text-[#5a4139] shrink-0 font-medium">
                        {profile.age} वर्ष
                      </span>
                    </div>
                    <p className="text-[12px] text-[#5a4139] mt-0.5">
                      पिताजी: <span className="text-[#1f1b14] font-medium">{profile.fatherName}</span> ({profile.fatherOccupation})
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 bg-[#f1e7db] text-[#5a4139] rounded-full text-[11px] font-medium flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px] text-[#ab3100]">location_city</span>
                        {profile.nativeDistrict}
                      </span>
                      <span className="px-2 py-0.5 bg-[#f1e7db] text-[#5a4139] rounded-full text-[11px] font-medium truncate">
                        {profile.professionTag || profile.profession}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audio Note Quick Listen Prompt */}
                <button
                  onClick={() => toggleAudio(profile.id)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all border border-[#e3bfb4]/40 ${
                    playingAudioId === profile.id
                      ? 'bg-[#ffdcc3] text-[#6e3900]'
                      : 'bg-[#f7ece1] hover:bg-[#f1e7db] text-[#1f1b14]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#d3430c] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {playingAudioId === profile.id ? 'pause' : 'play_arrow'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold truncate">
                        पारिवारिक परिचय ऑडियो सुनें 🎙️
                      </span>
                      <span className="text-[11px] text-[#5a4139]">
                        {profile.name.split(' ')[1] || 'पारिवारिक'} परिवार द्वारा साझा किया गया ({profile.audioNoteDuration || '1 मिनट 12 सेकंड'})
                      </span>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined text-[22px] ${playingAudioId === profile.id ? 'animate-pulse text-[#ab3100]' : 'text-[#5a4139]'}`}>
                    graphic_eq
                  </span>
                </button>

                {/* Direct Elder Family Communication Shortcuts */}
                <div className="flex flex-col gap-2">
                  {/* WhatsApp Action Button */}
                  <button
                    onClick={() => onOpenFatherCall(profile)}
                    className="w-full min-h-[50px] bg-[#4e5e82] hover:bg-[#364669] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.976.534 2.024.816 3.149.816 3.182 0 5.77-2.587 5.77-5.767.001-3.182-2.584-5.77-5.77-5.77zm0-1.672c4.103 0 7.438 3.336 7.438 7.438 0 4.104-3.335 7.442-7.438 7.442-1.282 0-2.522-.328-3.614-.951l-4.041 1.06 1.079-3.94c-.694-1.127-1.06-2.427-1.06-3.611 0-4.102 3.334-7.438 7.438-7.438z" />
                    </svg>
                    <span>WhatsApp पर बात शुरू करें</span>
                  </button>

                  {/* Direct Phone Call Button */}
                  <button
                    onClick={() => onOpenFatherCall(profile)}
                    className="w-full min-h-[46px] bg-[#f7ece1] text-[#1f1b14] hover:bg-[#f1e7db] rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  >
                    <span
                      className="material-symbols-outlined text-[19px] text-[#ab3100]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      call
                    </span>
                    <span>सीधे फोन करें (शाम 5-8 बजे सुविधानुसार)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Counselor Support Card: Pandit Radheshyam Ji */}
        <div className="bg-gradient-to-br from-[#fdf2e6] to-[#f7ece1] rounded-2xl p-4 shadow-xs border border-[#e3bfb4]/50 flex flex-col gap-3 relative overflow-hidden mt-2">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <img
                src={PANDIT_JI_AVATAR}
                alt="पंडित राधेश्याम जी"
                className="w-16 h-16 rounded-full object-cover shadow-xs border-2 border-[#d3430c]"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#d3430c] rounded-full border-2 border-white"></span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="font-bold text-[17px] text-[#1f1b14]">
                  पंडित राधेश्याम जी
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#8e4b00]">
                  workspace_premium
                </span>
              </div>
              <span className="text-[12px] text-[#b26000] font-bold">
                वरिष्ठ पारिवारिक सलाहकार
              </span>
              <p className="text-[12px] text-[#5a4139] mt-1 leading-relaxed">
                रिश्ते की बात आगे बढ़ाने में सहायता चाहिए? हमारे रिलेशनशिप मैनेजर से निःशुल्क मार्गदर्शन लें।
              </p>
            </div>
          </div>
          <button
            onClick={onOpenCounselorModal}
            className="w-full min-h-[48px] bg-white text-[#ab3100] hover:bg-[#f1e7db] active:scale-98 transition-all rounded-xl font-bold text-[14px] flex items-center justify-center gap-1.5 shadow-xs border border-[#e3bfb4]"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              support_agent
            </span>
            <span>सहायक से बात करें 📞</span>
          </button>
        </div>
      </div>
    </div>
  );
};
