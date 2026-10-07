import React, { useState } from 'react';
import { Profile, UserSubscription } from '../types/matrimony';

interface BiodataScreenProps {
  profile: Profile;
  userSubscription?: UserSubscription;
  onSendProposal: (profile: Profile) => void;
  onToggleShortlist: (profile: Profile) => void;
  onOpenFatherCall: (profile: Profile) => void;
  onOpenKundali: (profile: Profile) => void;
  onOpenPdfModal: (profile: Profile) => void;
  onToast: (msg: string) => void;
}

export const BiodataScreen: React.FC<BiodataScreenProps> = ({
  profile,
  userSubscription,
  onSendProposal,
  onToggleShortlist,
  onOpenFatherCall,
  onOpenKundali,
  onOpenPdfModal,
  onToast,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);

  const isUnlocked = userSubscription?.unlockedProfiles.includes(profile.id);

  const photos = profile.photos && profile.photos.length > 0 ? profile.photos : [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCf5dmQRpwPxLfTD2fJjiW__9rwdWkbddccIHcjN1x4Yn4eEy9gN4CR5eQwtl_ZpJgnKT8dXkUoKA_Lfzg9lvnKR3ToEmt5swJrklQxESfs58dxcxbPdjQ-_iu0aJfy1U08AOKEm3KSF01qtaK6uKarLCCGGmVl8kln-Z1BsbDt0swr1845clBAJQ3efD7Sb8NOWGARpkk-yMYLRlbCmwK8J_ncI6lgjpYMoSn7lx8JhArdHNKe4yCy'
  ];

  const handleNextPhoto = (idx: number) => {
    setPhotoIndex(idx);
    onToast(`फोटो क्रमांक ${idx + 1} प्रदर्शित की गई।`);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-32 pt-16">
      {/* Top Profile Visual Stage & Photo Carousel */}
      <div className="relative w-full overflow-hidden bg-[#fdf2e6]">
        <div className="relative w-full aspect-[4/5] max-h-[440px] overflow-hidden">
          <img
            id="main-profile-img"
            src={photos[photoIndex % photos.length]}
            alt={profile.name}
            className="w-full h-full object-cover transition-transform duration-500"
          />

          {/* Ambient Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f1b14]/80 via-transparent to-transparent pointer-events-none" />

          {/* Floating Gallery Tag & Privacy Seal */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
            <span className="px-3 py-1 rounded-full bg-[#fff8f3]/90 backdrop-blur-md text-[#1f1b14] text-[12px] font-semibold shadow-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#ab3100]">photo_library</span>
              <span id="photo-counter">{photoIndex + 1}/{Math.max(photos.length, 4)} फोटो</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#fff8f3]/90 backdrop-blur-md text-[#ab3100] text-[12px] font-bold shadow-xs flex items-center gap-1">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <span>गोपनीयता सुरक्षित</span>
            </span>
          </div>

          {/* Photo Privacy Notice Overlaid at Base of Image */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1 text-white">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#ffdcc3] drop-shadow-xs">
              <span className="material-symbols-outlined text-[15px]">lock</span>
              <span>परिवार की अनुमति पर सभी फोटो उपलब्ध</span>
            </div>
          </div>
        </div>

        {/* Gallery Thumbnail Nav Dots */}
        <div className="flex justify-center items-center gap-2 py-2.5 bg-[#fdf2e6]">
          {[0, 1, 2, 3].map((dot) => (
            <button
              key={dot}
              aria-label={`फोटो ${dot + 1}`}
              onClick={() => handleNextPhoto(dot)}
              className={`rounded-full transition-all duration-300 ${
                dot === photoIndex
                  ? 'w-3 h-3 bg-[#ab3100]'
                  : 'w-2 h-2 bg-[#e3bfb4] hover:bg-[#8e7067]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Candidate Identity Headline Card */}
      <div className="px-4 pt-3">
        <div className="p-4 rounded-2xl bg-white shadow-xs border border-[#e3bfb4]/40 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-[22px] text-[#1f1b14] tracking-tight">
                  {profile.name}
                </h1>
                {/* Prominent Verified Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold shadow-xs">
                  <span
                    className="material-symbols-outlined text-[14px] text-emerald-700"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span>सत्यापित (Verified)</span>
                </span>
              </div>
              <p className="text-[14px] text-[#5a4139] font-medium mt-0.5">
                उम्र: {profile.age} वर्ष • कद: {profile.height}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#ffdcc3] text-[#6e3900] text-[12px] font-bold tracking-wide">
              {profile.gotra} गोत्र
            </span>
          </div>

          <div className="mt-1 pt-1.5 border-t border-[#e3bfb4]/30 flex flex-wrap items-center justify-between text-[#5a4139] text-[12px] gap-y-1">
            <span className="flex items-center gap-1 text-[#1f1b14]">
              <span className="material-symbols-outlined text-[16px] text-[#8e4b00]">badge</span>
              <span>
                आईडी: <strong className="text-[#ab3100] font-semibold">{profile.code}</strong>
              </span>
            </span>
            <span className="flex items-center gap-1 text-[#4e5e82]">
              <span className="material-symbols-outlined text-[16px]">supervisor_account</span>
              <span>प्रोफ़ाइल {profile.managedBy}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Trust Verification Bar with Verification Status Field */}
      <div className="px-4 mt-3">
        <div className="p-4 rounded-2xl bg-[#f1e7db] flex flex-col gap-2.5 border border-[#e3bfb4]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#1f1b14] text-[13px] font-bold">
              <span
                className="material-symbols-outlined text-[18px] text-[#ab3100]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield_with_heart
              </span>
              <span>शुभ बंधन 100% पारिवारिक सुरक्षा सत्यापन</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
              ✓ पूर्णतः सत्यापित
            </span>
          </div>

          {/* Verification Status Field Summary */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5 border-t border-[#e3bfb4]/40">
            <div>
              <span className="text-[#5a4139] block">सत्यापन स्थिति (Status):</span>
              <strong className="text-emerald-800 font-bold">सक्रिय व 100% प्रमाणित</strong>
            </div>
            <div>
              <span className="text-[#5a4139] block">सत्यापन संदर्भ कोड:</span>
              <strong className="text-[#ab3100] font-mono font-bold">VRF-{profile.code}</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#4e5e82] text-[11px] font-semibold shadow-xs">
              <span
                className="material-symbols-outlined text-[15px] text-[#ab3100]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span>आधार कार्ड सत्यापित</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#4e5e82] text-[11px] font-semibold shadow-xs">
              <span
                className="material-symbols-outlined text-[15px] text-[#ab3100]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span>फोन नंबर सत्यापित</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#4e5e82] text-[11px] font-semibold shadow-xs">
              <span
                className="material-symbols-outlined text-[15px] text-[#ab3100]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span>गृह पता सत्यापित</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Floating Talk CTA */}
      <div className="px-4 mt-3">
        <button
          onClick={() => onOpenFatherCall(profile)}
          className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold text-[15px] shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all ${
            isUnlocked
              ? 'bg-green-700 hover:bg-green-800'
              : 'bg-[#4e5e82] hover:bg-[#364669]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {isUnlocked ? 'lock_open' : 'contact_phone'}
          </span>
          <span>
            {isUnlocked
              ? 'सीधे परिवार से बात करें (नंबर अनलॉक्ड ✓)'
              : 'सीधे परिवार से बात करें (WhatsApp / फ़ोन 🔒)'}
          </span>
        </button>
      </div>

      {/* Section 1: पारिवारिक पृष्ठभूमि (Family Background) */}
      <section className="px-4 mt-5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 rounded-full bg-[#ab3100]"></span>
          <h2 className="font-bold text-[18px] text-[#1f1b14]">
            पारिवारिक पृष्ठभूमि (Family Background)
          </h2>
        </div>
        <div className="p-4 rounded-2xl bg-white shadow-xs border border-[#e3bfb4]/40 flex flex-col gap-3.5">
          {/* Father Details */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f1e7db] flex items-center justify-center shrink-0 text-[#ab3100]">
              <span className="material-symbols-outlined text-[22px]">person</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#1f1b14]">पिताजी का विवरण</span>
              <p className="text-[14px] text-[#1f1b14] font-medium">{profile.fatherName}</p>
              <p className="text-[12px] text-[#5a4139]">{profile.fatherOccupation}</p>
            </div>
          </div>

          {/* Mother Details */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f1e7db] flex items-center justify-center shrink-0 text-[#ab3100]">
              <span className="material-symbols-outlined text-[22px]">person_4</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#1f1b14]">माताजी का विवरण</span>
              <p className="text-[14px] text-[#1f1b14] font-medium">{profile.motherName}</p>
              <p className="text-[12px] text-[#5a4139]">{profile.motherOccupation}</p>
            </div>
          </div>

          {/* Siblings */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f1e7db] flex items-center justify-center shrink-0 text-[#ab3100]">
              <span className="material-symbols-outlined text-[22px]">groups</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#1f1b14]">भाई एवं बहन</span>
              <p className="text-[13px] text-[#1f1b14] font-medium leading-relaxed">{profile.siblings}</p>
            </div>
          </div>

          {/* Family Values */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f1e7db] flex items-center justify-center shrink-0 text-[#ab3100]">
              <span className="material-symbols-outlined text-[22px]">temple_hindu</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#1f1b14]">पारिवारिक मूल्य व स्वभाव</span>
              <p className="text-[12px] text-[#5a4139] leading-relaxed">
                {profile.familyValues}
              </p>
            </div>
          </div>

          {/* Property & Land */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f1e7db] flex items-center justify-center shrink-0 text-[#ab3100]">
              <span className="material-symbols-outlined text-[22px]">real_estate_agent</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#1f1b14]">पैतृक संपत्ति व स्थिति</span>
              <p className="text-[12px] text-[#5a4139] leading-relaxed">
                {profile.landProperty}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: मूल निवास एवं संबंध (Roots & Lineage) */}
      <section className="px-4 mt-5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 rounded-full bg-[#8e4b00]"></span>
          <h2 className="font-bold text-[18px] text-[#1f1b14]">
            मूल निवास एवं संबंध (Roots & Lineage)
          </h2>
        </div>
        <div className="p-4 rounded-2xl bg-white shadow-xs border border-[#e3bfb4]/40 flex flex-col gap-3">
          {/* Dadahal */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffdcc3] flex items-center justify-center shrink-0 text-[#6e3900]">
              <span className="material-symbols-outlined text-[20px]">cottage</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#1f1b14]">दादाल (पिता का मूल गाँव)</span>
              <p className="text-[14px] text-[#1f1b14] font-semibold">{profile.paternalVillage}</p>
            </div>
          </div>

          {/* Nanihal */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffdcc3] flex items-center justify-center shrink-0 text-[#6e3900]">
              <span className="material-symbols-outlined text-[20px]">location_home</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#1f1b14]">ननिहाल (माता का मायका)</span>
              <p className="text-[14px] text-[#1f1b14] font-semibold">{profile.maternalVillage}</p>
            </div>
          </div>

          {/* Gotra Lineage Micro-grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-3 rounded-xl bg-[#f1e7db] flex flex-col">
              <span className="text-[11px] text-[#5a4139] font-medium">पैतृक गोत्र</span>
              <span className="font-bold text-[17px] text-[#ab3100] mt-0.5">{profile.gotra}</span>
              <span className="text-[11px] text-[#5a4139]">प्रवर: {profile.paternalPravara || 'त्रय प्रवर'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#f1e7db] flex flex-col">
              <span className="text-[11px] text-[#5a4139] font-medium">मातृक गोत्र (ननिहाल)</span>
              <span className="font-bold text-[17px] text-[#8e4b00] mt-0.5">{profile.maternalGotra || 'कश्यप'}</span>
              <span className="text-[11px] text-[#5a4139]">शाखा: {profile.maternalBranch || 'माध्यंदिन'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: कुंडली व ग्रह विवरण (Horoscope) */}
      <section className="px-4 mt-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 rounded-full bg-[#d3430c]"></span>
            <h2 className="font-bold text-[18px] text-[#1f1b14]">
              कुंडली व ग्रह विवरण (Horoscope)
            </h2>
          </div>
          <button
            onClick={() => onOpenKundali(profile)}
            className="text-[13px] text-[#ab3100] flex items-center gap-1 font-semibold hover:underline"
          >
            <span>कुंडली चक्र</span>
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </button>
        </div>

        {/* Match Score Card Highlight */}
        <div className="p-4 rounded-2xl bg-white shadow-xs border border-[#e3bfb4]/40 flex flex-col gap-3">
          <div className="p-3.5 rounded-xl bg-[#c4d4fe]/40 text-[#4b5b7f] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[28px] text-[#4e5e82]">stars</span>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#1f1b14]">गुण मिलान परिणाम</span>
                <span className="text-[12px] text-[#5a4139]">राहुल जी के साथ बहुत शुभ संयोग</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-black text-[24px] text-[#4e5e82]">{profile.gunScore}/36</span>
              <span className="text-[11px] font-bold text-[#1f1b14]">गुण शुभ</span>
            </div>
          </div>

          {/* Astrological Data Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1 text-[#1f1b14]">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#5a4139]">जन्म तिथि व समय</span>
              <span className="text-[13px] font-semibold">{profile.birthDate}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#5a4139]">जन्म स्थान</span>
              <span className="text-[13px] font-semibold">{profile.birthPlace}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#5a4139]">मांगलिक स्थिति</span>
              <span className="text-[13px] font-semibold text-green-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>{profile.manglikStatus} (दोष रहित)</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#5a4139]">राशि एवं नक्षत्र</span>
              <span className="text-[13px] font-semibold">{profile.rashiNakshatra}</span>
            </div>
          </div>

          {/* Action to open full Kundali chart */}
          <button
            onClick={() => onOpenKundali(profile)}
            className="w-full py-2.5 rounded-xl bg-[#f1e7db] text-[#1f1b14] font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:bg-[#ebe1d6] active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-[#ab3100]">auto_graph</span>
            <span>विस्तृत लग्न एवं नवमांश चक्र देखें</span>
          </button>
        </div>
      </section>

      {/* Section 4: जीवनसाथी से अपेक्षाएं (Partner Preferences) */}
      <section className="px-4 mt-5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 rounded-full bg-[#4e5e82]"></span>
          <h2 className="font-bold text-[18px] text-[#1f1b14]">
            जीवनसाथी से अपेक्षाएं (Partner Preferences)
          </h2>
        </div>
        <div className="p-4 rounded-2xl bg-white shadow-xs border border-[#e3bfb4]/40 flex flex-col gap-3">
          {/* Age & Height */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f1e7db] flex items-center justify-center shrink-0 text-[#4e5e82]">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#1f1b14]">आयु एवं कद सीमा</span>
              <p className="text-[13px] text-[#5a4139]">{profile.partnerAgeRange} • कद {profile.partnerHeightRange}</p>
            </div>
          </div>

          {/* Profession & Education */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f1e7db] flex items-center justify-center shrink-0 text-[#4e5e82]">
              <span className="material-symbols-outlined text-[20px]">work</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#1f1b14]">शिक्षा व व्यवसाय</span>
              <p className="text-[13px] text-[#5a4139] leading-relaxed">{profile.partnerEducationJob}</p>
            </div>
          </div>

          {/* Diet & Habits */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f1e7db] flex items-center justify-center shrink-0 text-[#4e5e82]">
              <span className="material-symbols-outlined text-[20px]">restaurant</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#1f1b14]">खान-पान एवं दैनिक आदतें</span>
              <p className="text-[13px] text-[#5a4139]">{profile.partnerDiet}</p>
            </div>
          </div>

          {/* Value Systems */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f1e7db] flex items-center justify-center shrink-0 text-[#4e5e82]">
              <span className="material-symbols-outlined text-[20px]">diversity_1</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#1f1b14]">पारिवारिक विचार</span>
              <p className="text-[13px] text-[#5a4139] leading-relaxed">{profile.partnerValues}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Elder-Friendly Bottom Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#fff8f3]/95 backdrop-blur-lg border-t border-[#e3bfb4]/50 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-2.5 pb-safe">
        <div className="max-w-xl mx-auto flex items-center gap-2">
          {/* Shortlist Button */}
          <button
            onClick={() => onToggleShortlist(profile)}
            className={`flex-1 min-h-[48px] py-2 px-1 rounded-xl flex flex-col items-center justify-center active:scale-95 transition-all ${
              profile.isShortlisted
                ? 'bg-[#ffdcc3] text-[#6e3900]'
                : 'bg-[#f1e7db] text-[#1f1b14]'
            }`}
            title="शॉर्टलिस्ट करें"
          >
            <span
              className="material-symbols-outlined text-[20px] text-[#8e4b00]"
              style={{ fontVariationSettings: profile.isShortlisted ? "'FILL' 1" : "'FILL' 0" }}
            >
              {profile.isShortlisted ? 'star' : 'bookmark_add'}
            </span>
            <span className="text-[11px] font-bold truncate">
              {profile.isShortlisted ? 'सहेजा गया ⭐' : 'सहेजें ⭐'}
            </span>
          </button>

          {/* PDF Download Button */}
          <button
            onClick={() => onOpenPdfModal(profile)}
            className="flex-1 min-h-[48px] py-2 px-1 rounded-xl bg-[#f1e7db] text-[#1f1b14] hover:bg-[#ebe1d6] flex flex-col items-center justify-center active:scale-95 transition-all"
            title="बायोडाटा PDF"
          >
            <span className="material-symbols-outlined text-[20px] text-[#4e5e82]">
              picture_as_pdf
            </span>
            <span className="text-[11px] font-bold truncate">बायोडाटा 📄</span>
          </button>

          {/* Main Primary Action: Send Proposal */}
          <button
            onClick={() => onSendProposal(profile)}
            className="flex-[2.4] min-h-[50px] py-2.5 px-3 rounded-xl bg-[#ab3100] text-white text-[14px] font-bold shadow-md flex items-center justify-center gap-1.5 hover:bg-[#852400] active:scale-95 transition-all"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              volunteer_activism
            </span>
            <span className="truncate">
              {profile.proposalStatus === 'sent' || profile.proposalStatus === 'accepted'
                ? 'रिश्ता भेजा गया ✓'
                : 'रिश्ता आगे बढ़ाएं 💍'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
