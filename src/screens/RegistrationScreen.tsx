import React, { useState } from 'react';
import { COMPANY_BDE_DIRECTORY } from '../data/mockData';
import { Profile, ScreenType, AbandonedRegistrationLead, SubscriptionPlan } from '../types/matrimony';

interface RegistrationScreenProps {
  onRegisterProfile: (newProfile: Profile) => void;
  onNavigate: (screen: ScreenType) => void;
  onToast: (msg: string) => void;
  onRecordAbandonedLead?: (lead: AbandonedRegistrationLead) => void;
  onOpenAuthModal?: () => void;
  pendingPlan?: SubscriptionPlan | null;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  onRegisterProfile,
  onNavigate,
  onToast,
  onRecordAbandonedLead,
  onOpenAuthModal,
  pendingPlan,
}) => {
  const [gender, setGender] = useState<'bride' | 'groom'>('bride');
  const [managedBy, setManagedBy] = useState<'माता-पिता द्वारा संचालित' | 'भाई द्वारा संचालित' | 'पिता द्वारा संचालित' | 'अभिभावक द्वारा संचालित'>('माता-पिता द्वारा संचालित');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Optional email for bride/groom
  const [age, setAge] = useState(24);
  const [height, setHeight] = useState("5 फीट 3 इंच (160 सेमी)");
  const [education, setEducation] = useState('');
  const [profession, setProfession] = useState('');
  const [isGovtJob, setIsGovtJob] = useState(false);
  const [candidateState, setCandidateState] = useState<'Uttar Pradesh' | 'Bihar'>('Uttar Pradesh');
  const [religion, setReligion] = useState<string>('Hindu');
  const [caste, setCaste] = useState<string>('Brahmin');
  const [gotra, setGotra] = useState('');
  const [maternalGotra, setMaternalGotra] = useState('');
  const [community, setCommunity] = useState('सनातन ब्राह्मण (सरयूपारीण)');
  const [nativeDistrict, setNativeDistrict] = useState('वाराणसी');
  const [nativePlace, setNativePlace] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [birthDate, setBirthDate] = useState('15 अक्टूबर 2000, 07:30 AM');
  const [birthPlace, setBirthPlace] = useState('वाराणसी, उत्तर प्रदेश');
  const [manglikStatus, setManglikStatus] = useState<'मांगलिक नहीं' | 'मांगलिक' | 'आंशिक मांगलिक'>('मांगलिक नहीं');
  const [rashiNakshatra, setRashiNakshatra] = useState('तुला राशि • स्वाति');
  const [fatherName, setFatherName] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherOccupation] = useState('कुशल गृहणी');
  const [siblings, setSiblings] = useState('1 भाई, 1 बहन');
  const [landProperty, setLandProperty] = useState('अपना निजी पक्का आवास एवं 6 बीघा कृषि भूमि');
  const [guardianPhone, setGuardianPhone] = useState('+91 94150 99882');
  const [diet, setDiet] = useState<'शुद्ध शाकाहारी' | 'सात्विक' | 'शाकाहारी'>('शुद्ध शाकाहारी');

  // Partner Preferences for Matching Algorithm (captured at registration)
  const [partnerMinAge, setPartnerMinAge] = useState<number>(22);
  const [partnerMaxAge, setPartnerMaxAge] = useState<number>(26);
  const [partnerLocationPref, setPartnerLocationPref] = useState<'same_district' | 'same_state' | 'all'>('same_state');
  const [partnerCastePref, setPartnerCastePref] = useState<'same_caste' | 'all'>('same_caste');
  const [partnerJobPref, setPartnerJobPref] = useState('उच्च शिक्षित, सरकारी नौकरी, बैंक अथवा प्रतिष्ठित व्यापार');
  const [partnerDietPref, setPartnerDietPref] = useState('शुद्ध शाकाहारी');

  // BDE / BDM Reference Code (Core company tracking requirement)
  const [bdeCode, setBdeCode] = useState('BDM-UP-1042');
  const [customBdeInput, setCustomBdeInput] = useState('');

  // Post Card Size Photographs (Mandatory: Min 1, Max 3)
  const BRIDE_POSTCARD_PRESETS = [
    {
      id: 'b-1',
      label: 'पारंपरिक साड़ी मुखाकृति (पोर्ट्रेट 1)',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf5dmQRpwPxLfTD2fJjiW__9rwdWkbddccIHcjN1x4Yn4eEy9gN4CR5eQwtl_ZpJgnKT8dXkUoKA_Lfzg9lvnKR3ToEmt5swJrklQxESfs58dxcxbPdjQ-_iu0aJfy1U08AOKEm3KSF01qtaK6uKarLCCGGmVl8kln-Z1BsbDt0swr1845clBAJQ3efD7Sb8NOWGARpkk-yMYLRlbCmwK8J_ncI6lgjpYMoSn7lx8JhArdHNKe4yCy',
    },
    {
      id: 'b-2',
      label: 'उत्सव वेशभूषा (पूर्ण कद 2)',
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'b-3',
      label: 'शालीन पारिवारिक चित्र (3)',
      url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const GROOM_POSTCARD_PRESETS = [
    {
      id: 'g-1',
      label: 'पारंपरिक कुर्ता पायजामा (पोर्ट्रेट 1)',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKoEM-Z9bgHxFQ1n6mU1GUY8g3szSmFqsodajWoAtMpRLOQxmibog7YkYDuEoWPQDSsN8Sq6WzRfd300EB7C5dxN3z31uRo2Wi6mI_-RImWh7KpblArI4TFEPG_P_AdkZV4eoe2-cfLRL2_ax4nXlDPJsgLQ2hCaCzpuNthaklUtQrjzDqFEYYd54oL9VQqc_Piws9Uyx89xBQjOexASMrRgCnTIuhe-wy7kT42VgA_bVdLSbkDZV8',
    },
    {
      id: 'g-2',
      label: 'औपचारिक कोट / ब्लेज़र (2)',
      url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'g-3',
      label: 'शालीन पारिवारिक स्वरूप (3)',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const [postCardPhotos, setPostCardPhotos] = useState<string[]>([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCf5dmQRpwPxLfTD2fJjiW__9rwdWkbddccIHcjN1x4Yn4eEy9gN4CR5eQwtl_ZpJgnKT8dXkUoKA_Lfzg9lvnKR3ToEmt5swJrklQxESfs58dxcxbPdjQ-_iu0aJfy1U08AOKEm3KSF01qtaK6uKarLCCGGmVl8kln-Z1BsbDt0swr1845clBAJQ3efD7Sb8NOWGARpkk-yMYLRlbCmwK8J_ncI6lgjpYMoSn7lx8JhArdHNKe4yCy',
  ]);
  const [customPhotoUrlInput, setCustomPhotoUrlInput] = useState('');
  const [previewModalPhoto, setPreviewModalPhoto] = useState<string | null>(null);

  // Sync default photo and partner age defaults when user changes gender
  const handleGenderChange = (newGender: 'bride' | 'groom') => {
    setGender(newGender);
    if (newGender === 'bride') {
      setPostCardPhotos([BRIDE_POSTCARD_PRESETS[0].url]);
      setPartnerMinAge(25);
      setPartnerMaxAge(30);
    } else {
      setPostCardPhotos([GROOM_POSTCARD_PRESETS[0].url]);
      setPartnerMinAge(22);
      setPartnerMaxAge(26);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (postCardPhotos.length >= 3) {
      onToast('अधिकतम 3 पोस्ट कार्ड फोटो ही स्वीकार्य हैं। किसी एक को हटाकर नई फोटो जोड़ें।');
      return;
    }

    const availableSlots = 3 - postCardPhotos.length;
    const filesToProcess = Array.from(files).slice(0, availableSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const resultUrl = loadEvent.target?.result as string;
        if (resultUrl) {
          setPostCardPhotos((prev) => {
            if (prev.length < 3) {
              return [...prev, resultUrl];
            }
            return prev;
          });
        }
      };
      reader.readAsDataURL(file);
    });

    onToast(`${filesToProcess.length} पोस्ट कार्ड फोटो सफलतापूर्वक अपलोड की गई! 📸`);
    e.target.value = '';
  };

  const handleAddPresetPhoto = (url: string) => {
    if (postCardPhotos.includes(url)) {
      onToast('यह फोटो पहले से संलग्न है');
      return;
    }
    if (postCardPhotos.length >= 3) {
      onToast('अधिकतम 3 पोस्ट कार्ड फोटो ही संलग्न की जा सकती हैं।');
      return;
    }
    setPostCardPhotos((prev) => [...prev, url]);
    onToast(`पोस्ट कार्ड फोटो #${postCardPhotos.length + 1} संलग्न की गई!`);
  };

  const handleAddUrlPhoto = () => {
    if (!customPhotoUrlInput.trim()) return;
    if (postCardPhotos.length >= 3) {
      onToast('अधिकतम 3 पोस्ट कार्ड फोटो सीमा पूर्ण हो चुकी है');
      return;
    }
    setPostCardPhotos((prev) => [...prev, customPhotoUrlInput.trim()]);
    setCustomPhotoUrlInput('');
    onToast('वेब फोटो लिंक सफलतापूर्वक जोड़ी गई!');
  };

  const handleRemovePhoto = (index: number) => {
    if (postCardPhotos.length <= 1) {
      onToast('⚠️ न्यूनतम 1 पोस्ट कार्ड साइज़ फोटो अनिवार्य है। आप इसे हटा नहीं सकते।');
      return;
    }
    setPostCardPhotos((prev) => prev.filter((_, i) => i !== index));
    onToast('फोटो हटाई गई।');
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setPostCardPhotos((prev) => {
      const target = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [target, ...remaining];
    });
    onToast('यह फोटो मुख्य पोस्ट कार्ड (Primary) के रूप में निर्धारित की गई! ⭐');
  };

  const matchedBde = COMPANY_BDE_DIRECTORY.find(
    (b) => b.code.toLowerCase() === (customBdeInput || bdeCode).trim().toLowerCase()
  );

  // Handle Help / Support & Abandoned Registration Lead Capture
  const handleRecordLead = (
    stage: string,
    source: 'form_dropoff' | 'help_request_call' | 'support_click',
    customNotes?: string
  ) => {
    const leadName = name.trim() || 'आगंतुक अभिभावक / उम्मीदवार';
    const leadPhone = guardianPhone || '+91 94150 99882';
    const randomLeadId = Math.floor(1000 + Math.random() * 9000);

    const lead: AbandonedRegistrationLead = {
      id: `lead-user-${Date.now()}-${randomLeadId}`,
      name: leadName,
      phone: leadPhone,
      email: email.trim() || undefined,
      gender,
      district: nativeDistrict || 'वाराणसी',
      abandonedStage: stage,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      assignedBde: matchedBde ? `${matchedBde.code} (${matchedBde.name})` : 'BDM-UP-1042 (अमित कुमार सिंह)',
      status: 'pending_callback',
      notes:
        customNotes ||
        `पंजीकरण में सहायता अपेक्षित। चरण: ${stage}। वर/वधू: ${gender === 'bride' ? 'कन्या' : 'वर'}।`,
      leadSource: source,
    };

    onRecordAbandonedLead?.(lead);
  };

  const handleHelpClick = (type: 'call' | 'support_button') => {
    handleRecordLead(
      type === 'call' ? 'हेल्पलाइन कॉल पर सहायता अनुरोध' : 'पंजीकरण सहायता अनुरोध (क्लिक)',
      type === 'call' ? 'help_request_call' : 'support_click',
      'उपयोगकर्ता ने पंजीकरण हेतु सहायता का अनुरोध किया है। सेल्स/मार्केटिंग टीम द्वारा तत्काल संपर्क अपेक्षित।'
    );
    onToast(
      'धन्यवाद! सहायता अनुरोध सेल्स व ऑनबोर्डिंग टीम को प्रेषित कर दिया गया है। हमारे प्रतिनिधि शीघ्र संपर्क करेंगे! 📞'
    );
  };

  const handleSaveAndExit = () => {
    handleRecordLead(
      name.trim() ? `नाम (${name}) भरा, अपूर्ण छोड़कर बाहर निकले` : 'फॉर्म भरना प्रारंभ कर अधूरा छोड़ा',
      'form_dropoff',
      'फॉर्म भरते समय बीच में छोड़ा गया। शेष विवरण हेतु फॉलो-अप कॉल करें।'
    );
    onToast('सहायता टीम को सूचना प्रेषित! ऑनबोर्डिंग में मदद हेतु सेल्स प्रतिनिधि संपर्क करेंगे। 🙏');
    onNavigate('dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onToast('कृपया वर/वधू का नाम दर्ज करें');
      return;
    }

    // VALIDATION: Post card photograph minimum 1 and maximum 3 photos
    if (postCardPhotos.length < 1) {
      onToast('❌ त्रुटि: कम से कम 1 पोस्ट कार्ड साइज़ फ़ोटो अवश्य संलग्न करें (न्यूनतम 1, अधिकतम 3 अनिवार्य है)');
      return;
    }
    if (postCardPhotos.length > 3) {
      onToast('❌ त्रुटि: अधिकतम 3 पोस्ट कार्ड फ़ोटो ही संलग्न की जा सकती हैं।');
      return;
    }

    const assignedCode = customBdeInput.trim() || bdeCode;
    const matchedEmployee = COMPANY_BDE_DIRECTORY.find((b) => b.code === assignedCode);

    const randomIdNumber = Math.floor(10000 + Math.random() * 90000);
    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      code: `SB-${randomIdNumber}`,
      name: name.trim(),
      age: Number(age),
      height,
      gotra: gotra.trim() || 'शांडिल्य',
      maternalGotra: maternalGotra.trim() || 'कश्यप',
      community,
      education: education.trim() || 'स्नातकोत्तर (M.A, B.Ed)',
      profession: profession.trim() || 'अध्यापिका / बैंकिंग सेवा',
      professionTag: profession.trim() || 'अध्यापिका (प्रतिष्ठित संस्थान)',
      isGovtJob,
      nativePlace: nativePlace.trim() || `${nativeDistrict} (उ.प्र.)`,
      nativeDistrict,
      currentCity: currentCity.trim() || `${nativeDistrict} में सपरिवार`,
      diet,
      familyValues: 'सुसंस्कृत, धार्मिक विचारों वाला सनातन परिवार, मर्यादा व संस्कारों का आदर।',
      familySummary: `पिताजी: ${fatherName || 'अभिभावक'}, परिवार में संस्कार व सामाजिक प्रतिष्ठा`,
      familyType: 'संयुक्त',
      landProperty,
      fatherName: fatherName.trim() || 'श्री रामप्रसाद जी',
      fatherOccupation: fatherOccupation.trim() || 'सेवानिवृत्त शासकीय सेवा / प्रतिष्ठित व्यवसाय',
      motherName: motherName.trim() || 'श्रीमती उर्मिला देवी',
      motherOccupation,
      siblings,
      paternalVillage: `गाँव ${nativePlace || nativeDistrict}`,
      maternalVillage: 'गाँव जगदीशपुर (ननिहाल)',
      gunScore: 30,
      gunSummary: '30 गुण शुभ मिलान • उत्तम गृहस्थ योग',
      birthDate,
      birthPlace,
      manglikStatus,
      rashiNakshatra,
      partnerAgeRange: `${partnerMinAge} से ${partnerMaxAge} वर्ष`,
      partnerHeightRange: gender === 'bride' ? "5'6\" से 6'0\"" : "5'2\" से 5'7\"",
      partnerEducationJob: partnerJobPref,
      partnerDiet: partnerDietPref,
      partnerValues: 'पारिवारिक मर्यादा व बड़ों का आदर करने वाला परिवार।',
      partnerAgeMin: partnerMinAge,
      partnerAgeMax: partnerMaxAge,
      partnerLocation: partnerLocationPref === 'same_district' ? nativeDistrict : partnerLocationPref === 'same_state' ? candidateState : 'all',
      partnerCastePreference: partnerCastePref === 'same_caste' ? caste : 'all',
      photos: postCardPhotos,
      badges: ['100% आधार सत्यापित', managedBy, `${postCardPhotos.length} पोस्ट कार्ड फोटो सत्यापित`],
      managedBy,
      guardianName: fatherName.trim() || 'अभिभावक जी',
      guardianPhone,
      guardianWhatsApp: guardianPhone,
      isShortlisted: false,
      proposalStatus: 'none',
      isVerified: true,
      verificationStatus: 'पूर्णतः सत्यापित (BDE Field Verified)',
      verificationLevel: 'Tier-1 Gold Trust',
      verificationCode: `SB-VRF-${randomIdNumber}`,
      verifiedDate: 'आज (सक्रिय)',
      gender,
      state: candidateState,
      religion,
      caste,
      email: email.trim() || undefined,
      bdeCode: assignedCode,
      bdeEmployeeName: matchedEmployee ? `${matchedEmployee.name} (${matchedEmployee.branch})` : 'फील्ड कर्मचारी सत्यापित',
      bdeBranch: matchedEmployee ? matchedEmployee.branch : `${nativeDistrict} शाखा`,
      registeredAt: 'आज'
    };

    onRegisterProfile(newProfile);
    onToast(`नया बायोडाटा SB-${randomIdNumber} (${name}) ${postCardPhotos.length} पोस्ट कार्ड फोटो सहित पंजीकृत हुआ! BDE कोड ${assignedCode} संबद्ध किया गया 🎉`);
    onNavigate('profile');
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-32 pt-20 px-4">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#ab3100] via-[#8e4b00] to-[#d3430c] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ffdcc3] block">
              नया पंजीकरण प्रपत्र
            </span>
            <h2 className="font-bold text-[22px] mt-0.5 font-['Noto_Sans']">
              वर/वधू बायोडाटा ऑनबोर्डिंग
            </h2>
            <p className="text-[12px] text-[#faefe4] mt-1">
              पारिवारिक वंशावली, गोत्र शुद्धि, कुंडली विवरण एवं कर्मचारी संदर्भ द्वारा सुरक्षित पंजीकरण
            </p>
          </div>
          <span className="text-3xl">🪷</span>
        </div>
      </div>

      {/* Plan Purchase Redirect Notification (if user attempted direct purchase without registering) */}
      {pendingPlan && (
        <div className="mt-3.5 p-4 rounded-2xl bg-[#fff8e1] border-2 border-[#ffb300] text-[#4e2600] shadow-sm flex items-start gap-3 animate-in fade-in">
          <div className="w-10 h-10 rounded-xl bg-[#ff8f00] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6f00] text-white uppercase tracking-wider">
                Registration Required
              </span>
              <h4 className="font-bold text-[14px] text-[#3e2723]">
                {pendingPlan.hindiTitle} ({pendingPlan.title}) सक्रिय करने हेतु पंजीकरण आवश्यक
              </h4>
            </div>
            <p className="text-[12px] text-[#5d4037] mt-1 leading-snug">
              आपने <strong>₹{pendingPlan.price.toLocaleString('en-IN')}</strong> की सदस्यता योजना चुनी है। किसी भी योजना को सक्रिय करने से पहले वर/वधू बायोडाटा का पंजीकरण अनिवार्य है। फॉर्म सबमिट होते ही आपकी योजना तुरंत सक्रिय हो जाएगी!
            </p>
          </div>
        </div>
      )}

      {/* Existing Member / Registered User Sign In Section */}
      {onOpenAuthModal && (
        <div className="mt-3.5 p-3.5 rounded-2xl bg-white border border-[#e3bfb4]/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#fff0eb] text-[#ab3100] flex items-center justify-center shrink-0 border border-[#e3bfb4]">
              <span className="material-symbols-outlined text-[22px]">login</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ab3100] bg-[#ffdcc3] px-1.5 py-0.2 rounded">
                  Existing Member
                </span>
                <h4 className="font-bold text-[13px] text-[#1f1b14]">
                  पहले से पंजीकृत हैं? (Already Registered?)
                </h4>
              </div>
              <p className="text-[11px] text-[#5a4139] mt-0.5">
                पुराने उपयोगकर्ता यहाँ साइन इन करें — बायोडाटा देखने व चैट करने के लिए
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAuthModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ab3100] to-[#d3430c] hover:from-[#852400] hover:to-[#a02c00] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0"
            title="पुराने सदस्य: साइन इन करें"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>साइन इन करें (Sign In)</span>
          </button>
        </div>
      )}

      {/* CORE FEATURE: Registration Help & Support (Helpline Call or 1-Click Support Lead) */}
      <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#fff3e0] via-[#ffe0b2] to-[#ffd180] border border-[#ffb74d] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#ab3100] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[22px]">support_agent</span>
          </div>
          <div>
            <h4 className="font-bold text-[13px] text-[#4e2600]">
              पंजीकरण फॉर्म भरने में सहायता चाहिए?
            </h4>
            <p className="text-[11px] text-[#6d3800]">
              कॉल करें या क्लिक करें — हमारी सेल्स व रिलेशनशिप टीम तुरंत आपकी निःशुल्क मदद करेगी।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:+919876543210"
            onClick={() => handleHelpClick('call')}
            className="px-3 py-1.5 rounded-xl bg-[#1b5e20] hover:bg-[#144818] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
            title="पंजीकरण सहायता हेल्पलाइन पर कॉल करें"
          >
            <span className="material-symbols-outlined text-[15px]">call</span>
            <span>1800-889-2024</span>
          </a>

          <button
            type="button"
            onClick={() => handleHelpClick('support_button')}
            className="px-3 py-1.5 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
            title="सहायता अनुरोध भेजें (सेल्स टीम तत्काल संपर्क करेगी)"
          >
            <span className="material-symbols-outlined text-[15px]">handshake</span>
            <span>सहायता अनुरोध</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-3.5 flex flex-col gap-4">
        {/* Section 0: Candidate Role & Managed By */}
        <div className="p-4 rounded-2xl bg-white border border-[#e3bfb4]/60 shadow-xs space-y-3">
          <h3 className="font-bold text-[15px] text-[#1f1b14] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ab3100] text-[20px]">person_add</span>
            <span>बायोडाटा किसके लिए है?</span>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleGenderChange('bride')}
              className={`p-3 rounded-xl border text-center font-bold text-[14px] flex items-center justify-center gap-2 transition-all ${
                gender === 'bride'
                  ? 'bg-[#ab3100] text-white border-[#ab3100] shadow-xs'
                  : 'bg-[#fdf2e6] text-[#1f1b14] border-[#e3bfb4]/60 hover:bg-white'
              }`}
            >
              <span>👰</span>
              <span>कन्या (Bride)</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenderChange('groom')}
              className={`p-3 rounded-xl border text-center font-bold text-[14px] flex items-center justify-center gap-2 transition-all ${
                gender === 'groom'
                  ? 'bg-[#ab3100] text-white border-[#ab3100] shadow-xs'
                  : 'bg-[#fdf2e6] text-[#1f1b14] border-[#e3bfb4]/60 hover:bg-white'
              }`}
            >
              <span>🤵</span>
              <span>वर (Groom)</span>
            </button>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
              प्रोफ़ाइल संचालक (Managed By):
            </label>
            <select
              value={managedBy}
              onChange={(e) => setManagedBy(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-[#e3bfb4] bg-white text-[13px] text-[#1f1b14]"
            >
              <option value="माता-पिता द्वारा संचालित">माता-पिता द्वारा संचालित</option>
              <option value="पिता द्वारा संचालित">पिता द्वारा संचालित</option>
              <option value="भाई द्वारा संचालित">भाई द्वारा संचालित</option>
              <option value="अभिभावक द्वारा संचालित">अभिभावक (ताऊ/चाचा) द्वारा संचालित</option>
            </select>
          </div>
        </div>

        {/* Section 1: Candidate Basic Information */}
        <div className="p-4 rounded-2xl bg-white border border-[#e3bfb4]/60 shadow-xs space-y-3">
          <h3 className="font-bold text-[15px] text-[#1f1b14] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ab3100] text-[20px]">badge</span>
            <span>व्यक्तिगत विवरण</span>
          </h3>

          <div className="space-y-2.5">
            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                पूरा नाम (Full Name) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा: अंजलि शर्मा / राहुल कुमार"
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#ab3100]/30"
              />
            </div>

            {/* Optional Email field requested by user: "add email option in bride/groom registration form but is not mandatory to fill" */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[12px] font-semibold text-[#5a4139]">
                  ईमेल आईडी (Email ID)
                </label>
                <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                  वैकल्पिक / Optional (भरना अनिवार्य नहीं)
                </span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="उदा: anjali.sharma@example.com (वैकल्पिक)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#ab3100]/30 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                  उम्र (वर्ष)
                </label>
                <input
                  type="number"
                  min={20}
                  max={45}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14]"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                  कद (Height)
                </label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="5 फीट 3 इंच (160 सेमी)"
                  className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                  शिक्षा (Education)
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="उदा: M.Sc, B.Tech, B.Ed"
                  className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14]"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                  पेशा / पद (Profession)
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="सहायक अध्यापिका, बैंक पीओ"
                  className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14]"
                />
              </div>
            </div>

            <label className="p-2.5 rounded-xl bg-[#fdf2e6] border border-[#e3bfb4]/40 flex items-center justify-between cursor-pointer">
              <span className="text-[12px] font-bold text-[#1f1b14]">
                क्या यह सरकारी नौकरी है? (Government Job)
              </span>
              <input
                type="checkbox"
                checked={isGovtJob}
                onChange={(e) => setIsGovtJob(e.target.checked)}
                className="w-5 h-5 accent-[#ab3100] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Section 2: Religion, Caste, Gotra & Astrology */}
        <div className="p-4 rounded-2xl bg-white border border-[#e3bfb4]/60 shadow-xs space-y-3">
          <h3 className="font-bold text-[15px] text-[#1f1b14] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8e4b00] text-[20px]">diversity_3</span>
            <span>धर्म, जाति, गोत्र व कुल परम्परा विवरण</span>
          </h3>

          {/* Religion and Caste Selectors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                धर्म (Religion) *
              </label>
              <select
                value={religion}
                onChange={(e) => {
                  setReligion(e.target.value);
                  if (e.target.value === 'Muslim') {
                    setCommunity('मुस्लिम (सुन्नी - शरीफ घराना)');
                    setCaste('Muslim');
                  } else if (e.target.value === 'Sikh') {
                    setCommunity('सिख (गुरसिख - आनंद कारज)');
                    setCaste('Sikh');
                  } else if (e.target.value === 'Christian') {
                    setCommunity('ईसाई (Christian Community)');
                    setCaste('Christian');
                  } else if (e.target.value === 'Jain') {
                    setCommunity('जैन (दिगंबर / श्वेतांबर)');
                    setCaste('Jain');
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14] font-medium bg-white"
              >
                <option value="Hindu">हिंदू (Hindu)</option>
                <option value="Muslim">मुस्लिम (Muslim)</option>
                <option value="Sikh">सिख (Sikh)</option>
                <option value="Christian">ईसाई (Christian)</option>
                <option value="Jain">जैन (Jain)</option>
                <option value="Buddhist">बौद्ध (Buddhist)</option>
                <option value="Other">अन्य (Other)</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                जाति (Caste / Category) *
              </label>
              <select
                value={caste}
                onChange={(e) => {
                  setCaste(e.target.value);
                  setCommunity(e.target.value);
                }}
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14] font-medium bg-white"
              >
                <option value="Brahmin">ब्राह्मण (Brahmin)</option>
                <option value="Rajput">क्षत्रिय / राजपूत (Rajput)</option>
                <option value="Bhumihar">भूमिहार (Bhumihar)</option>
                <option value="Kayastha">कायस्थ (Kayastha)</option>
                <option value="Yadav">यादव / अहीर (Yadav)</option>
                <option value="Vaishya">वैश्य / बनिया / गुप्ता / अग्रवाल (Vaishya)</option>
                <option value="Kurmi">कुर्मी / पटेल / महतो (Kurmi)</option>
                <option value="Kushwaha">कुशवाहा / मौर्य / कोईरी (Kushwaha)</option>
                <option value="Teli">तेली / साहू / मोदी (Teli / Sahu)</option>
                <option value="Paswan">पासवान / दुसाध (Paswan)</option>
                <option value="Ravidas">रविदास / जाटव / चमार (Ravidas)</option>
                <option value="Nishad">निषाद / सहनी / मल्लाह (Nishad)</option>
                <option value="Vishwakarma">विश्वकर्मा / जांगिड़ / शर्मा (Vishwakarma)</option>
                <option value="Dhanuk">धानुक / मंडल (Dhanuk / Mandal)</option>
                <option value="Jat">जाट / गुर्जर (Jat / Gurjar)</option>
                <option value="Muslim">मुस्लिम समुदाय (Ansari/Siddiqui/Syed/Khan)</option>
                <option value="Sikh">सिख समुदाय (Khatri/Arora/Ramgarhia)</option>
                <option value="Jain">जैन समुदाय (Digambar/Shwetambar)</option>
                <option value="Christian">ईसाई समुदाय (Christian)</option>
                <option value="Buddhist">बौद्ध समुदाय (Buddhist)</option>
                <option value="All Castes Welcome">सर्वसमाज / अंतरजातीय स्वीकार्य</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                पैतृक गोत्र / वंश परम्परा *
              </label>
              <input
                type="text"
                required
                value={gotra}
                onChange={(e) => setGotra(e.target.value)}
                placeholder="उदा: भारद्वाज, कश्यप, सूर्यवंशी, सिद्धिकी आदि"
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14]"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                ननिहाल गोत्र / कुल
              </label>
              <input
                type="text"
                value={maternalGotra}
                onChange={(e) => setMaternalGotra(e.target.value)}
                placeholder="उदा: वत्स, गौतम, कश्यप आदि"
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14]"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
              विस्तृत समुदाय व उपजाति (Community Details)
            </label>
            <input
              type="text"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              placeholder="उदा: सनातन ब्राह्मण, सूर्यवंशी राजपूत, भूमिहार, यादव, आदि"
              className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                जन्म तिथि व समय
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[12px] text-[#1f1b14]"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                मांगलिक स्थिति
              </label>
              <select
                value={manglikStatus}
                onChange={(e) => setManglikStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[12px] text-[#1f1b14]"
              >
                <option value="मांगलिक नहीं">मांगलिक नहीं (दोष रहित)</option>
                <option value="मांगलिक">मांगलिक</option>
                <option value="आंशिक मांगलिक">आंशिक मांगलिक</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Family Roots & Guardian Contact */}
        <div className="p-4 rounded-2xl bg-white border border-[#e3bfb4]/60 shadow-xs space-y-3">
          <h3 className="font-bold text-[15px] text-[#1f1b14] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ab3100] text-[20px]">family_restroom</span>
            <span>पारिवारिक पृष्ठभूमि व मूल निवास</span>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                पिताजी का नाम
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="श्री दिनेश शर्मा"
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14]"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                पिताजी का व्यवसाय/पद
              </label>
              <input
                type="text"
                value={fatherOccupation}
                onChange={(e) => setFatherOccupation(e.target.value)}
                placeholder="प्रधानाचार्य / अधिकारी / व्यापारी"
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                माताजी का नाम
              </label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="श्रीमती सरिता शर्मा"
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14]"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                गृह राज्य (State) *
              </label>
              <select
                value={candidateState}
                onChange={(e) => {
                  const newState = e.target.value as 'Uttar Pradesh' | 'Bihar';
                  setCandidateState(newState);
                  if (newState === 'Bihar') {
                    setNativeDistrict('पटना');
                  } else {
                    setNativeDistrict('वाराणसी');
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14] font-medium bg-white"
              >
                <option value="Uttar Pradesh">उत्तर प्रदेश (Uttar Pradesh)</option>
                <option value="Bihar">बिहार (Bihar)</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                गृह ज़िला (District) *
              </label>
              <select
                value={nativeDistrict}
                onChange={(e) => setNativeDistrict(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14] font-medium bg-white"
              >
                {candidateState === 'Uttar Pradesh' ? (
                  <>
                    <option value="वाराणसी">वाराणसी (Varanasi)</option>
                    <option value="अयोध्या">अयोध्या (Ayodhya)</option>
                    <option value="गोरखपुर">गोरखपुर (Gorakhpur)</option>
                    <option value="लखनऊ">लखनऊ (Lucknow)</option>
                    <option value="प्रयागराज">प्रयागराज (Prayagraj)</option>
                    <option value="कानपुर">कानपुर (Kanpur)</option>
                    <option value="सुल्तानपुर">सुल्तानपुर (Sultanpur)</option>
                    <option value="बस्ती">बस्ती (Basti)</option>
                  </>
                ) : (
                  <>
                    <option value="पटना">पटना (Patna)</option>
                    <option value="गया">गया (Gaya)</option>
                    <option value="मुजफ्फरपुर">मुजफ्फरपुर (Muzaffarpur)</option>
                    <option value="भागलपुर">भागलपुर (Bhagalpur)</option>
                    <option value="दरभंगा">दरभंगा (Darbhanga)</option>
                    <option value="पूर्णिया">पूर्णिया (Purnia)</option>
                    <option value="बेगूसराय">बेगूसराय (Begusarai)</option>
                    <option value="आरा (भोजपुर)">आरा / भोजपुर (Ara)</option>
                    <option value="छपरा (सारण)">छपरा / सारण (Chhapra)</option>
                    <option value="समस्तीपुर">समस्तीपुर (Samastipur)</option>
                    <option value="नालंदा (बिहार शरीफ)">नालंदा (Nalanda)</option>
                    <option value="बेतिया (पश्चिम चंपारण)">बेतिया (Bettiah)</option>
                    <option value="कटिहार">कटिहार (Katihar)</option>
                    <option value="मोतिहारी (पूर्वी चंपारण)">मोतिहारी (Motihari)</option>
                    <option value="मुंगेर">मुंगेर (Munger)</option>
                    <option value="सहरसा">सहरसा (Saharsa)</option>
                    <option value="सीवान">सीवान (Siwan)</option>
                    <option value="बक्सर">बक्सर (Buxar)</option>
                    <option value="सासाराम (रोहतास)">सासाराम / रोहतास (Sasaram)</option>
                    <option value="सीतामढ़ी">सीतामढ़ी (Sitamarhi)</option>
                    <option value="औरंगाबाद">औरंगाबाद (Aurangabad)</option>
                    <option value="जहानाबाद">जहानाबाद (Jehanabad)</option>
                    <option value="नवादा">नवादा (Nawada)</option>
                    <option value="हाजीपुर (वैशाली)">हाजीपुर / वैशाली (Hajipur)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                मूल गाँव (दादाल)
              </label>
              <input
                type="text"
                value={nativePlace}
                onChange={(e) => setNativePlace(e.target.value)}
                placeholder="गाँव पूरे मिश्रन, बीकापुर"
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14]"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                अभिभावक फ़ोन नंबर *
              </label>
              <input
                type="tel"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#e3bfb4] text-[13px] text-[#1f1b14]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: POST CARD SIZE PHOTOGRAPHS (MANDATORY: MINIMUM 1, MAXIMUM 3) */}
        <div className="p-4 rounded-2xl bg-white border-2 border-[#ab3100]/40 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ab3100] text-[24px]">
                photo_camera_back
              </span>
              <div>
                <h3 className="font-bold text-[15px] text-[#1f1b14] flex items-center gap-2">
                  <span>पोस्ट कार्ड साइज़ फ़ोटोग्राफ़ (Post Card Size Photos)</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ab3100] text-white">
                    अनिवार्य
                  </span>
                </h3>
                <p className="text-[11px] text-[#5a4139]">
                  पारंपरिक 4"×6" (10×15 सेमी) अनुपात • न्यूनतम 1 एवं अधिकतम 3 चित्र
                </p>
              </div>
            </div>

            {/* Counter Badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                postCardPhotos.length >= 1 && postCardPhotos.length <= 3
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {postCardPhotos.length >= 1 ? 'check_circle' : 'warning'}
              </span>
              <span>{postCardPhotos.length}/3 संलग्न</span>
            </span>
          </div>

          <div className="p-3 bg-[#fff8f3] rounded-xl border border-[#e3bfb4] text-[12px] text-[#6e3900] space-y-1">
            <p className="font-semibold flex items-center gap-1.5 text-[#ab3100]">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>पारंपरिक वैवाहिक शिष्टाचार नियम:</span>
            </p>
            <p className="leading-relaxed">
              सभ्य एवं कुलीन परिवारों में बायोडाटा विनिमय हेतु कम से कम <strong>1</strong> और अधिकतम <strong>3</strong> पोस्ट कार्ड साइज़ (4×6 इंच) की शालीन, मुखाकृति एवं पूर्ण कद की तस्वीरें अनिवार्य हैं। पहली फोटो मुख्य (Primary) बायोडाटा चित्र रहेगी।
            </p>
          </div>

          {/* 3 Post Card Photo Frames Grid (4x6 / 2:3 Ratio) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((slotIndex) => {
              const photoUrl = postCardPhotos[slotIndex];
              const isMandatory = slotIndex === 0;

              return (
                <div
                  key={slotIndex}
                  className={`relative flex flex-col rounded-xl overflow-hidden border-2 transition-all ${
                    photoUrl
                      ? slotIndex === 0
                        ? 'border-[#ab3100] bg-[#fffaf5] shadow-xs'
                        : 'border-[#e3bfb4] bg-[#fffaf5]'
                      : isMandatory
                      ? 'border-dashed border-red-400 bg-red-50/40'
                      : 'border-dashed border-gray-300 bg-gray-50'
                  }`}
                >
                  {/* Post Card Aspect Ratio Frame (4x6 / 2:3 vertical aspect ratio) */}
                  <div className="relative w-full aspect-[2/3] bg-gray-100 overflow-hidden flex items-center justify-center group">
                    {photoUrl ? (
                      <>
                        <img
                          src={photoUrl}
                          alt={`पोस्ट कार्ड फोटो #${slotIndex + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Traditional Post Card Corner Watermark Stamp */}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded tracking-widest uppercase">
                          4×6 POST CARD
                        </div>

                        {/* Overlay Actions on Hover/Tap */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity p-2">
                          <button
                            type="button"
                            onClick={() => setPreviewModalPhoto(photoUrl)}
                            className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-sm"
                            title="बड़ा देखें (Zoom)"
                          >
                            <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                          </button>
                          {slotIndex !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(slotIndex)}
                              className="p-2 rounded-full bg-[#ab3100] hover:bg-[#852400] text-white shadow-sm"
                              title="मुख्य फोटो बनाएं (Set Primary)"
                            >
                              <span className="material-symbols-outlined text-[18px]">star</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(slotIndex)}
                            className={`p-2 rounded-full shadow-sm ${
                              postCardPhotos.length <= 1
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                            title={postCardPhotos.length <= 1 ? 'न्यूनतम 1 फोटो अनिवार्य है' : 'हटाएं'}
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center text-gray-400">
                        <span className="material-symbols-outlined text-[32px] text-gray-300">
                          add_photo_alternate
                        </span>
                        <span className="text-[11px] font-bold text-gray-500 mt-1">
                          {isMandatory ? 'फ़ोटो #1 (मुख्य अनिवार्य)' : `फ़ोटो #${slotIndex + 1} (वैकल्पिक)`}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          पोस्ट कार्ड 4"×6"
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta Bar */}
                  <div className="p-2 bg-white border-t border-[#e3bfb4]/40 flex items-center justify-between text-[11px]">
                    <div className="truncate">
                      <span className="font-bold text-[#1f1b14] block">
                        {slotIndex === 0
                          ? '★ मुख्य पोस्ट कार्ड (1)'
                          : slotIndex === 1
                          ? 'अतिरिक्त दृश्य (2)'
                          : 'पूर्ण कद / पारिवारिक (3)'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {photoUrl ? 'संलग्न व सत्यापित' : isMandatory ? 'अनिवार्य' : 'खाली स्लॉट'}
                      </span>
                    </div>

                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewModalPhoto(photoUrl)}
                        className="text-[#ab3100] hover:underline font-bold text-[10px]"
                      >
                        देखें
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upload and Curated Selector Controls */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* File Upload Button */}
              <label className="flex-1 min-w-[200px] cursor-pointer py-2.5 px-3 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white font-bold text-[12px] flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-98">
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>अपने फोन / कंप्यूटर से पोस्ट कार्ड फोटो चुनें</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Status Hint */}
              <span className="text-[11px] text-[#5a4139] font-medium">
                JPG, PNG, WebP (पोर्ट्रेट 4:6)
              </span>
            </div>

            {/* Quick 1-Click Curated Presets for Bride / Groom */}
            <div className="bg-[#fcf8f5] p-3 rounded-xl border border-[#e3bfb4]/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#5a4139] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#ab3100] text-[16px]">collections</span>
                  <span>
                    सुझावित {gender === 'bride' ? 'कन्या (वधू)' : 'वर'} पोस्ट कार्ड पोर्ट्रेट्स (1-क्लिक से जोड़ें):
                  </span>
                </label>
                <span className="text-[10px] text-gray-500">स्टूडियो प्रमाणित</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(gender === 'bride' ? BRIDE_POSTCARD_PRESETS : GROOM_POSTCARD_PRESETS).map((preset) => {
                  const isAlreadyAdded = postCardPhotos.includes(preset.url);

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={isAlreadyAdded || postCardPhotos.length >= 3}
                      onClick={() => handleAddPresetPhoto(preset.url)}
                      className={`p-1.5 rounded-lg border text-left flex items-center gap-2 text-[11px] transition-all ${
                        isAlreadyAdded
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-80'
                          : postCardPhotos.length >= 3
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white hover:bg-[#fff0eb] border-[#e3bfb4] text-[#1f1b14]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-8 h-11 object-cover rounded border"
                      />
                      <div className="truncate flex-1">
                        <span className="block font-medium truncate">{preset.label}</span>
                        <span className="text-[10px] text-gray-500">
                          {isAlreadyAdded ? '✓ पहले से संलग्न' : '+ जोड़ें (4×6)'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Web URL Input */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={customPhotoUrlInput}
                onChange={(e) => setCustomPhotoUrlInput(e.target.value)}
                placeholder="या फोटो का सीधा वेब URL दर्ज करें..."
                className="flex-1 p-2 rounded-xl border border-[#e3bfb4] text-[12px] bg-white text-[#1f1b14] outline-none"
              />
              <button
                type="button"
                onClick={handleAddUrlPhoto}
                disabled={!customPhotoUrlInput.trim() || postCardPhotos.length >= 3}
                className="px-3 py-2 rounded-xl bg-[#5a4139] hover:bg-[#3a2215] text-white text-[12px] font-bold disabled:opacity-50 transition-colors"
              >
                URL जोड़ें
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: CORE COMPANY FEATURE - BDE / BDM Employee Reference Code */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#ffdcc3]/60 via-white to-[#ffdbd0]/60 border-2 border-[#d3430c]/40 shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ab3100] text-[24px]">
                badge
              </span>
              <div>
                <h3 className="font-bold text-[15px] text-[#1f1b14]">
                  BDE / BDM कर्मचारी संदर्भ कोड (Employee Referral)
                </h3>
                <p className="text-[11px] text-[#5a4139]">
                  कंपनी सत्यापन एवं कर्मचारी ऑनबोर्डिंग ट्रैकिंग हेतु
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-[#ab3100] text-white text-[10px] font-bold">
              कंपनी आंतरिक कोड
            </span>
          </div>

          <p className="text-[12px] text-[#6e3900] bg-[#fff8f3] p-2.5 rounded-xl border border-[#e3bfb4] leading-snug">
            📌 <strong>कंपनी सूचना:</strong> इस कोड के माध्यम से शुभ बंधन मुख्यालय यह सत्यापित करता है कि यह ऑनबोर्डिंग हमारे किस अधिकृत फील्ड अधिकारी (BDE / BDM) द्वारा कराई गई है।
          </p>

          {/* Quick Select Buttons from Company Directory */}
          <div>
            <label className="text-[11px] font-bold text-[#5a4139] block mb-1.5">
              अधिकृत शाखा अधिकारी चुनें:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {COMPANY_BDE_DIRECTORY.map((emp) => {
                const isSelected = (customBdeInput || bdeCode) === emp.code;
                return (
                  <button
                    key={emp.code}
                    type="button"
                    onClick={() => {
                      setBdeCode(emp.code);
                      setCustomBdeInput('');
                    }}
                    className={`p-2 rounded-xl text-left border text-[11px] transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#ab3100] text-white border-[#ab3100] font-bold shadow-xs'
                        : 'bg-white hover:bg-[#fdf2e6] border-[#e3bfb4]/60 text-[#1f1b14]'
                    }`}
                  >
                    <div>
                      <span className="font-mono block">{emp.code}</span>
                      <span className="truncate block opacity-90">{emp.name} ({emp.branch.split(' ')[0]})</span>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Or Manual Custom Code Input */}
          <div className="pt-1">
            <label className="text-[11px] font-bold text-[#5a4139] block mb-1">
              या अन्य कर्मचारी कोड दर्ज करें:
            </label>
            <input
              type="text"
              value={customBdeInput}
              onChange={(e) => setCustomBdeInput(e.target.value.toUpperCase())}
              placeholder="उदा: BDE-KSH-9901"
              className="w-full p-2.5 rounded-xl border border-[#e3bfb4] bg-white font-mono text-[13px] text-[#ab3100] font-bold"
            />
          </div>

          {/* Live Validation Banner */}
          {matchedBde ? (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[12px] flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700 text-[18px]">
                verified
              </span>
              <div>
                <strong>सत्यापित कर्मचारी:</strong> {matchedBde.name} ({matchedBde.role}) — {matchedBde.branch}
              </div>
            </div>
          ) : customBdeInput ? (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[12px] flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-700 text-[18px]">
                info
              </span>
              <div>
                कस्टम कर्मचारी कोड: <strong>{customBdeInput}</strong> (पंजीकरण के बाद मुख्यालय द्वारा सत्यापित होगा)
              </div>
            </div>
          ) : null}
        </div>

        {/* Submit & Help Actions */}
        <div className="pt-2 space-y-2.5">
          <button
            type="submit"
            className="w-full min-h-[52px] rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white font-bold text-[16px] shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
            <span>बायोडाटा सुरक्षित पंजीकृत करें (Register Profile)</span>
          </button>

          {/* Help / Save for Later Button */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSaveAndExit}
              className="py-2.5 px-3 rounded-xl border border-[#e3bfb4] bg-white hover:bg-[#fff0eb] text-[#5a4139] hover:text-[#ab3100] font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              title="फॉर्म बाद में पूरा करें / सहायता हेतु सहेजें"
            >
              <span className="material-symbols-outlined text-[17px] text-[#ab3100]">save_as</span>
              <span>सहायता चाहिए / बाद में भरें</span>
            </button>

            <a
              href="tel:+919876543210"
              onClick={() => handleHelpClick('call')}
              className="py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              title="सीधे हेल्पलाइन पर बात करें"
            >
              <span className="material-symbols-outlined text-[17px] text-emerald-700">call</span>
              <span>कॉल पर सहायता लें</span>
            </a>
          </div>

          <p className="text-[11px] text-[#5a4139] text-center mt-1">
            🔒 आपकी समस्त जानकारी गोपनीय है और केवल 100% सत्यापित परिवारों से साझा की जाएगी।
          </p>
        </div>
      </form>

      {/* Post Card Photograph Zoom / Full-Preview Modal (Authentic 4x6 / 10x15cm Frame) */}
      {previewModalPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewModalPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl relative border-4 border-[#fff3eb]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e3bfb4]/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ab3100]">photo_camera</span>
                <div>
                  <h4 className="font-bold text-[13px] text-[#1f1b14]">
                    पोस्ट कार्ड साइज़ फ़ोटोग्राफ़ (4"×6")
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    शुभ बंधन वैवाहिक संकलन • प्रामाणिक पारिवारिक दृश्य
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewModalPhoto(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Post Card Frame */}
            <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden border-2 border-[#ab3100]/30 shadow-md bg-gray-100">
              <img
                src={previewModalPhoto}
                alt="पोस्ट कार्ड पूर्वावलोकन"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-[#ab3100]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wider shadow-sm">
                4"×6" (10×15 सेमी) POST CARD
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded">
                सनातन वैवाहिक बायोडाटा
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-[#5a4139]">
              <span>प्रत्याशी: {name || 'नव पंजीकृत'} ({gender === 'bride' ? 'कन्या' : 'वर'})</span>
              <button
                type="button"
                onClick={() => setPreviewModalPhoto(null)}
                className="font-bold text-[#ab3100] hover:underline"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
