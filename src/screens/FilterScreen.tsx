import React, { useState } from 'react';
import { FilterState } from '../types/matrimony';

interface FilterScreenProps {
  filterState: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  onToast: (msg: string) => void;
}

export const FilterScreen: React.FC<FilterScreenProps> = ({
  filterState,
  onApplyFilters,
  onResetFilters,
  onToast,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filterState);
  const [radiusSwitch, setRadiusSwitch] = useState(localFilters.radius50km);
  const [gunaValue, setGunaValue] = useState(localFilters.minGun);
  const [selectedState, setSelectedState] = useState<string>(localFilters.state || 'all');
  const [selectedReligion, setSelectedReligion] = useState<string>(localFilters.religion || 'all');
  const [selectedCaste, setSelectedCaste] = useState<string>(localFilters.caste || 'all');

  const upDistricts = ['वाराणसी', 'अयोध्या', 'गोरखपुर', 'लखनऊ', 'सुल्तानपुर', 'बस्ती', 'प्रयागराज', 'कानपुर'];
  const biharDistricts = [
    'पटना',
    'गया',
    'मुजफ्फरपुर',
    'भागलपुर',
    'दरभंगा',
    'पूर्णिया',
    'बेगूसराय',
    'आरा (भोजपुर)',
    'छपरा (सारण)',
    'समस्तीपुर',
    'नालंदा (बिहार शरीफ)',
    'बेतिया (पश्चिम चंपारण)',
    'कटिहार',
    'मोतिहारी',
    'मुंगेर',
    'सहरसा',
    'सीवान',
    'बक्सर',
    'सासाराम',
    'सीतामढ़ी',
    'औरंगाबाद',
    'जहानाबाद',
    'नवादा',
    'हाजीपुर (वैशाली)',
  ];
  const availableDistricts =
    selectedState === 'Bihar'
      ? biharDistricts
      : selectedState === 'Uttar Pradesh'
      ? upDistricts
      : [...upDistricts, ...biharDistricts];

  const toggleDistrict = (district: string) => {
    setLocalFilters((prev) => {
      const exists = prev.districts.includes(district);
      const updated = exists
        ? prev.districts.filter((d) => d !== district)
        : [...prev.districts, district];
      return { ...prev, districts: updated };
    });
  };

  const toggleJobType = (job: string) => {
    setLocalFilters((prev) => {
      const exists = prev.jobTypes.includes(job);
      const updated = exists
        ? prev.jobTypes.filter((j) => j !== job)
        : [...prev.jobTypes, job];
      return { ...prev, jobTypes: updated };
    });
  };

  const handleApply = () => {
    const updated: FilterState = {
      ...localFilters,
      state: selectedState,
      religion: selectedReligion,
      caste: selectedCaste,
      radius50km: radiusSwitch,
      minGun: gunaValue,
    };
    onApplyFilters(updated);
    onToast(`फ़िल्टर लागू किए गए! (${localFilters.districts.length} ज़िले, ${selectedState !== 'all' ? selectedState : 'सभी राज्य'})`);
  };

  const handleReset = () => {
    setRadiusSwitch(true);
    setGunaValue(24);
    setSelectedState('all');
    setSelectedReligion('all');
    setSelectedCaste('all');
    onResetFilters();
    onToast('सभी फ़िल्टर प्रारंभिक अवस्था में रीसेट किए गए।');
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-36 pt-16">
      {/* Festive & Auspicious Banner Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[#ab3100]">
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              filter_alt
            </span>
            <span className="text-[12px] uppercase tracking-wider font-bold">
              पसंद व संस्कार
            </span>
          </div>
          <h2 className="font-bold text-[20px] text-[#1f1b14] mt-0.5">जीवनसाथी की पसंद</h2>
          <p className="text-[12px] text-[#5a4139]">
            अपने रीति-रिवाज़ और पसंद के अनुसार रिश्ते खोजें
          </p>
        </div>

        <button
          onClick={handleReset}
          type="button"
          className="px-3.5 py-1.5 rounded-full bg-[#f1e7db] text-[#ab3100] hover:bg-[#ebe1d6] transition-colors flex items-center gap-1 active:scale-95 shadow-xs font-semibold text-[13px]"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>शुरुआत से करें</span>
        </button>
      </div>

      {/* Main Filter Sections */}
      <div className="px-4 flex flex-col gap-4 mt-2">
        {/* Active Criteria Snippet Banner with Traditional Motif */}
        <div className="rounded-2xl bg-[#fdf2e6] p-3.5 shadow-xs border border-[#e3bfb4]/40 relative overflow-hidden flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#ab3100] shrink-0 shadow-xs">
            <span
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              family_restroom
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[14px] text-[#1f1b14] truncate">
              कुटुंब एवं संस्कार आधारित खोज
            </h3>
            <p className="text-[12px] text-[#5a4139] truncate">
              अवध व पूर्वांचल के सम्मानित परिवारों के रिश्ते
            </p>
          </div>
          <span className="material-symbols-outlined text-[#ab3100] text-[24px] opacity-40">
            spa
          </span>
        </div>

        {/* Filter Group 1: मूल निवास व ज़िला */}
        <div className="rounded-2xl bg-white p-4 shadow-xs border border-[#e3bfb4]/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#ab3100] shrink-0">
                <span className="material-symbols-outlined text-[18px]">pin_drop</span>
              </span>
              <div>
                <h4 className="font-bold text-[15px] text-[#1f1b14]">मूल निवास व ज़िला</h4>
                <p className="text-[12px] text-[#5a4139]">अपना गृह क्षेत्र चुनें</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f7ece1] text-[#5a4139] text-[11px] font-bold">
              {localFilters.districts.length} चुने गए
            </span>
          </div>

          {/* State Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#5a4139]">राज्य (State)</label>
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'सभी राज्य (All)' },
                { id: 'Uttar Pradesh', label: 'उत्तर प्रदेश (UP)' },
                { id: 'Bihar', label: 'बिहार (Bihar)' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedState(st.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedState === st.id
                      ? 'bg-[#ab3100] text-white shadow-xs'
                      : 'bg-[#fdf2e6] text-[#5a4139] border border-[#e3bfb4]/50 hover:bg-[#f1e7db]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* District Multi-select Chips */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#5a4139]">
              पसंदीदा ज़िले (Districts - {selectedState === 'Bihar' ? 'बिहार' : selectedState === 'Uttar Pradesh' ? 'उत्तर प्रदेश' : 'सभी'})
            </label>
            <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto no-scrollbar">
              {availableDistricts.map((d) => {
                const isSelected = localFilters.districts.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDistrict(d)}
                    className={`h-9 px-3.5 rounded-full flex items-center gap-1.5 text-[13px] font-semibold transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#ab3100] text-white shadow-xs'
                        : 'bg-[#f7ece1] text-[#1f1b14] hover:bg-[#f1e7db]'
                    }`}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                    <span>{d}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Radius Inclusion Toggle */}
          <div className="mt-1 p-3 rounded-xl bg-[#fdf2e6] flex items-center justify-between gap-3 border border-[#e3bfb4]/40">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#8e4b00] text-[20px] mt-0.5">
                near_me
              </span>
              <div>
                <p className="text-[13px] font-bold text-[#1f1b14]">50 किमी का दायरा जोड़ें</p>
                <p className="text-[11px] text-[#5a4139]">
                  आस-पास के 50 किमी के गाँव और कस्बे भी शामिल करें
                </p>
              </div>
            </div>
            {/* Native Toggle Button */}
            <button
              type="button"
              aria-label="दायरा टॉगल करें"
              onClick={() => setRadiusSwitch(!radiusSwitch)}
              className={`w-12 h-7 rounded-full relative p-0.5 transition-colors shrink-0 ${
                radiusSwitch ? 'bg-[#ab3100]' : 'bg-[#e2d8cd]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  radiusSwitch ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Filter Group 2: धर्म, जाति, समुदाय व गोत्र */}
        <div className="rounded-2xl bg-white p-4 shadow-xs border border-[#e3bfb4]/50 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#ffdcc3] flex items-center justify-center text-[#8e4b00] shrink-0">
              <span className="material-symbols-outlined text-[18px]">diversity_3</span>
            </span>
            <div>
              <h4 className="font-bold text-[15px] text-[#1f1b14]">धर्म, समुदाय व जाति</h4>
              <p className="text-[12px] text-[#5a4139]">सर्वधर्म व सर्वजाति रिश्ते उपलब्ध</p>
            </div>
          </div>

          {/* Religion Multi-select Chips */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#5a4139]">धर्म (Religion)</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'सभी धर्म (All)' },
                { id: 'Hindu', label: '🕉️ हिंदू' },
                { id: 'Muslim', label: '☪️ मुस्लिम' },
                { id: 'Sikh', label: 'ੴ सिख' },
                { id: 'Christian', label: '✝️ ईसाई' },
                { id: 'Jain', label: '🪷 जैन' },
                { id: 'Buddhist', label: '☸️ बौद्ध' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReligion(r.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedReligion === r.id
                      ? 'bg-[#ab3100] text-white shadow-xs'
                      : 'bg-[#fdf2e6] text-[#5a4139] border border-[#e3bfb4]/60 hover:bg-[#f1e7db]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Caste & Community Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#5a4139]">जाति / समुदाय (Caste / Community)</label>
            <select
              value={selectedCaste}
              onChange={(e) => setSelectedCaste(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e3bfb4] bg-[#fdf2e6] text-xs text-[#1f1b14] font-medium focus:outline-none focus:ring-1 focus:ring-[#ab3100]"
            >
              <option value="all">🌟 सभी जातियां व समुदाय (All Castes)</option>
              <option value="Brahmin">ब्राह्मण (Brahmin)</option>
              <option value="Rajput">क्षत्रिय / राजपूत (Rajput)</option>
              <option value="Bhumihar">भूमिहार (Bhumihar)</option>
              <option value="Kayastha">कायस्थ (Kayastha)</option>
              <option value="Yadav">यादव / अहीर (Yadav)</option>
              <option value="Vaishya">वैश्य / बनिया / गुप्ता (Vaishya)</option>
              <option value="Kurmi">कुर्मी / पटेल / महतो (Kurmi)</option>
              <option value="Kushwaha">कुशवाहा / मौर्य / कोईरी (Kushwaha)</option>
              <option value="Teli">तेली / साहू / मोदी (Teli / Sahu)</option>
              <option value="Paswan">पासवान / दुसाध (Paswan)</option>
              <option value="Ravidas">रविदास / जाटव / चमार (Ravidas)</option>
              <option value="Nishad">निषाद / सहनी / मल्लाह (Nishad)</option>
              <option value="Jat">जाट / गुर्जर (Jat / Gurjar)</option>
              <option value="Muslim">मुस्लिम समुदाय (Ansari / Siddiqui / Khan)</option>
              <option value="Sikh">सिख समुदाय (Sikh Community)</option>
              <option value="Jain">जैन समुदाय (Jain Community)</option>
              <option value="Christian">ईसाई समुदाय (Christian Community)</option>
              <option value="Buddhist">बौद्ध समुदाय (Buddhist Community)</option>
            </select>
          </div>

          {/* Gotra Exclusion Flags */}
          <div className="flex flex-col gap-2 pt-0.5">
            <label className="p-3 rounded-xl bg-[#fdf2e6] flex items-center justify-between gap-2.5 cursor-pointer border border-[#e3bfb4]/40">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ab3100] text-[20px]">shield</span>
                <div>
                  <p className="text-[13px] font-bold text-[#1f1b14]">स्व-गोत्र छोड़ें (भारद्वाज)</p>
                  <p className="text-[11px] text-[#5a4139]">अपने कुल के रिश्ते शामिल न करें</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localFilters.excludeSelfGotra}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, excludeSelfGotra: e.target.checked }))
                }
                className="w-5 h-5 rounded accent-[#ab3100] cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-xl bg-[#fdf2e6] flex items-center justify-between gap-2.5 cursor-pointer border border-[#e3bfb4]/40">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ab3100] text-[20px]">account_tree</span>
                <div>
                  <p className="text-[13px] font-bold text-[#1f1b14]">ननिहाल गोत्र छोड़ें (कश्यप)</p>
                  <p className="text-[11px] text-[#5a4139]">मातृ पक्ष का गोत्र भी सुरक्षित बाहर रखें</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localFilters.excludeMaternalGotra}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, excludeMaternalGotra: e.target.checked }))
                }
                className="w-5 h-5 rounded accent-[#ab3100] cursor-pointer"
              />
            </label>
          </div>

          {/* Diet Selection */}
          <div className="p-3 rounded-xl bg-[#f7ece1] flex flex-col gap-1.5 border border-[#e3bfb4]/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8e4b00] text-[20px]">eco</span>
              <span className="text-[13px] font-bold text-[#1f1b14]">खान-पान (Diet) नियम</span>
            </div>
            <p className="text-[11px] text-[#5a4139]">शुद्ध शाकाहारी (कोई अंडा या मांसाहार नहीं)</p>
            <div className="flex gap-2 pt-1">
              <span className="px-3.5 py-1 rounded-full bg-[#ab3100] text-white text-[12px] font-semibold">
                शुद्ध शाकाहारी (सख्त)
              </span>
              <span className="px-3.5 py-1 rounded-full bg-white text-[#1f1b14] text-[12px] font-semibold border border-[#e3bfb4]">
                सात्विक
              </span>
            </div>
          </div>
        </div>

        {/* Filter Group 3: शिक्षा एवं पेशा */}
        <div className="rounded-2xl bg-white p-4 shadow-xs border border-[#e3bfb4]/50 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#c4d4fe] flex items-center justify-center text-[#4e5e82] shrink-0">
              <span className="material-symbols-outlined text-[18px]">work</span>
            </span>
            <div>
              <h4 className="font-bold text-[15px] text-[#1f1b14]">शिक्षा एवं पेशा</h4>
              <p className="text-[12px] text-[#5a4139]">आजीविका व स्थिरता</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { label: 'सरकारी नौकरी (Government Job)', desc: 'शिक्षक, रेलवे, बैंक, सिविल सेवा, पुलिस आदि' },
              { label: 'प्रतिष्ठित प्राइवेट नौकरी', desc: 'इंजीनियर, डॉक्टर, एमएनसी, बैंक अधिकारी' },
              { label: 'स्वयं का पुश्तैनी व्यापार / कृषि', desc: 'पारिवारिक व्यवसाय, आढ़त, या उत्तम खेती-बाड़ी' },
              { label: 'अन्य स्वतंत्र कार्य', desc: 'सीए, अधिवक्ता, सलाहकार' },
            ].map((item) => {
              const isChecked = localFilters.jobTypes.includes(item.label);
              return (
                <label
                  key={item.label}
                  className="p-3 rounded-xl bg-[#fdf2e6] flex items-start gap-3 cursor-pointer hover:bg-[#f7ece1] transition-colors border border-[#e3bfb4]/40"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleJobType(item.label)}
                    className="w-5 h-5 mt-0.5 rounded accent-[#ab3100] cursor-pointer shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#1f1b14]">{item.label}</span>
                    <span className="text-[11px] text-[#5a4139]">{item.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Filter Group 4: कुंडली व मांगलिक विचार */}
        <div className="rounded-2xl bg-white p-4 shadow-xs border border-[#e3bfb4]/50 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#ffdcc3] flex items-center justify-center text-[#8e4b00] shrink-0">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </span>
            <div>
              <h4 className="font-bold text-[15px] text-[#1f1b14]">कुंडली व मांगलिक विचार</h4>
              <p className="text-[12px] text-[#5a4139]">ग्रह मिलान व शुभ गुण</p>
            </div>
          </div>

          {/* Manglik Segmented Tabs */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#5a4139]">मांगलिक प्राथमिकता</label>
            <div className="p-1 rounded-xl bg-[#f7ece1] grid grid-cols-3 gap-1 text-center">
              {['केवल गैर-मांगलिक', 'मांगलिक मान्य', 'कोई परहेज़ नहीं'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLocalFilters((prev) => ({ ...prev, manglik: m }))}
                  className={`py-2 px-1 rounded-lg text-[12px] font-bold transition-all ${
                    localFilters.manglik === m
                      ? 'bg-[#ab3100] text-white shadow-xs'
                      : 'text-[#1f1b14] hover:bg-[#f1e7db]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Guna Match Interactive Slider */}
          <div className="p-3.5 rounded-xl bg-[#fdf2e6] flex flex-col gap-2 border border-[#e3bfb4]/40">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#1f1b14]">न्यूनतम गुण मिलान</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffdbd0] text-[#3a0b00] text-[12px] font-bold">
                {gunaValue} से 36 गुण
              </span>
            </div>
            <p className="text-[12px] text-[#ab3100] font-semibold">
              उत्तम मिलान (36 में से {gunaValue}+ शुभ)
            </p>

            {/* Slider Input */}
            <input
              type="range"
              min="18"
              max="36"
              value={gunaValue}
              onChange={(e) => setGunaValue(Number(e.target.value))}
              className="w-full accent-[#ab3100] h-2 bg-[#ebe1d6] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#5a4139] px-1 font-medium">
              <span>सामान्य (18)</span>
              <span>उत्तम (24)</span>
              <span>सर्वश्रेष्ठ (36)</span>
            </div>
          </div>
        </div>

        {/* Filter Group 5: पारिवारिक व्यवस्था */}
        <div className="rounded-2xl bg-white p-4 shadow-xs border border-[#e3bfb4]/50 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#c4d4fe] flex items-center justify-center text-[#4e5e82] shrink-0">
              <span className="material-symbols-outlined text-[18px]">cottage</span>
            </span>
            <div>
              <h4 className="font-bold text-[15px] text-[#1f1b14]">पारिवारिक व्यवस्था व संस्कार</h4>
              <p className="text-[12px] text-[#5a4139]">घर-परिवार की रूपरेखा</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#5a4139]">परिवार का प्रकार</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'संयुक्त परिवार (Joint Family)' },
                { id: 'एकल परिवार (Nuclear Family)' },
                { id: 'दोनों स्वीकार्य (खुले विचार)' },
              ].map((f) => (
                <label
                  key={f.id}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer border transition-colors ${
                    localFilters.familyType === f.id
                      ? 'bg-[#ab3100]/10 border-[#ab3100]'
                      : 'bg-[#fdf2e6] border-[#e3bfb4]/40'
                  }`}
                >
                  <span
                    className={`text-[13px] ${
                      localFilters.familyType === f.id
                        ? 'text-[#ab3100] font-bold'
                        : 'text-[#1f1b14] font-medium'
                    }`}
                  >
                    {f.id}
                  </span>
                  <input
                    type="radio"
                    name="family_type"
                    checked={localFilters.familyType === f.id}
                    onChange={() =>
                      setLocalFilters((prev) => ({ ...prev, familyType: f.id }))
                    }
                    className="w-5 h-5 accent-[#ab3100] cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Eldership Management Tag */}
          <div className="p-3 rounded-xl bg-[#c4d4fe]/30 flex items-start gap-2.5 border border-[#e3bfb4]/40">
            <span className="material-symbols-outlined text-[#4e5e82] text-[22px] mt-0.5">
              verified_user
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#1f1b14]">
                  अभिभावक द्वारा संचालित
                </span>
                <input
                  type="checkbox"
                  checked={localFilters.guardianManagedOnly}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      guardianManagedOnly: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded accent-[#4e5e82] cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-[#5a4139] mt-0.5 leading-snug">
                केवल वही रिश्ते दिखाएं जिन्हें माता-पिता, ताऊ-चाचा या बड़े भाई संभालते हों (सुरक्षित एवं गंभीर प्रस्ताव)
              </p>
            </div>
          </div>
        </div>

        {/* Folk Assurance Notice */}
        <div className="flex items-center justify-center gap-1.5 text-[#5a4139] pb-4">
          <span className="material-symbols-outlined text-[16px] text-[#8e4b00]">lock</span>
          <span className="text-[12px] text-center">
            सभी फ़िल्टर आपकी पारिवारिक गरिमा और शुचिता का सम्मान करते हैं
          </span>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-[#e3bfb4]/50 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex flex-col gap-2">
        <div className="max-w-xl mx-auto w-full flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 animate-pulse"></span>
              <span className="text-[13px] text-[#1f1b14]">
                <strong className="text-[#ab3100] font-bold">18</strong> रिश्ते उपलब्ध हैं
              </span>
            </div>
            <span className="text-[11px] text-[#5a4139]">सत्यापित कुंडली मिलान</span>
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="w-full h-[52px] rounded-full bg-[#ab3100] text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#852400] active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">manage_search</span>
            <span>फ़िल्टर लागू करें और रिश्ते देखें (18)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
