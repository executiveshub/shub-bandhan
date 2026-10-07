import React from 'react';
import { Profile } from '../types/matrimony';

interface KundaliModalProps {
  profile: Profile | null;
  onClose: () => void;
}

export const KundaliModal: React.FC<KundaliModalProps> = ({ profile, onClose }) => {
  if (!profile) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#353028]/60 backdrop-blur-xs flex flex-col justify-end p-0 sm:p-4 sm:justify-center sm:items-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#fff8f3] rounded-t-3xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto flex flex-col gap-4 shadow-2xl border border-[#e3bfb4]/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e3bfb4]/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ab3100] text-[26px]">auto_graph</span>
            <div>
              <h3 className="font-bold text-[18px] text-[#1f1b14]">
                लग्न कुंडली चक्र ({profile.nativeDistrict} लग्न)
              </h3>
              <p className="text-[12px] text-[#5a4139]">
                {profile.name} • {profile.rashiNakshatra}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f1e7db] hover:bg-[#ebe1d6] flex items-center justify-center text-[#1f1b14] active:scale-90 transition-all"
            aria-label="बंद करें"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Gun Milan Badge */}
        <div className="bg-[#c4d4fe]/40 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4e5e82] text-[24px]">stars</span>
            <div>
              <span className="text-[13px] font-bold text-[#1f1b14]">अष्टकूट गुण मिलान</span>
              <p className="text-[11px] text-[#4b5b7f]">राहुल शर्मा जी के साथ मिलान</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[20px] font-black text-[#4e5e82]">{profile.gunScore}/36</span>
            <span className="text-[11px] font-bold text-green-800 block">शुभ व अनुकूल</span>
          </div>
        </div>

        {/* Traditional Vedic Kundali Graphic Representation */}
        <div className="relative w-full aspect-square max-w-[310px] mx-auto p-2 bg-white rounded-xl shadow-xs border border-[#e3bfb4]/60 flex items-center justify-center">
          <svg className="w-full h-full text-[#8e7067]" viewBox="0 0 300 300">
            {/* Outer Box */}
            <rect x="5" y="5" width="290" height="290" fill="#fffdfb" stroke="currentColor" strokeWidth="2" />
            {/* Diagonal Cross Lines */}
            <line x1="5" y1="5" x2="295" y2="295" stroke="currentColor" strokeWidth="2" />
            <line x1="295" y1="5" x2="5" y2="295" stroke="currentColor" strokeWidth="2" />
            {/* Inner Diamond */}
            <polygon points="150,5 295,150 150,295 5,150" fill="none" stroke="currentColor" strokeWidth="2" />

            {/* Houses & Planets */}
            {/* House 1 (Top Center) */}
            <text x="150" y="70" textAnchor="middle" fill="#ab3100" fontWeight="bold" fontSize="13" fontFamily="sans-serif">
              1 (सूर्य/बुध)
            </text>
            {/* House 2 */}
            <text x="75" y="45" textAnchor="middle" fill="#5a4139" fontSize="11" fontFamily="sans-serif">
              2
            </text>
            {/* House 3 */}
            <text x="45" y="75" textAnchor="middle" fill="#5a4139" fontSize="11" fontFamily="sans-serif">
              3
            </text>
            {/* House 4 (Center Left) */}
            <text x="75" y="150" textAnchor="middle" fill="#4e5e82" fontWeight="bold" fontSize="13" fontFamily="sans-serif">
              4 (चंद्र)
            </text>
            {/* House 5 */}
            <text x="45" y="225" textAnchor="middle" fill="#5a4139" fontSize="11" fontFamily="sans-serif">
              5
            </text>
            {/* House 6 */}
            <text x="75" y="255" textAnchor="middle" fill="#5a4139" fontSize="11" fontFamily="sans-serif">
              6
            </text>
            {/* House 7 (Bottom Center) */}
            <text x="150" y="230" textAnchor="middle" fill="#8e4b00" fontWeight="bold" fontSize="13" fontFamily="sans-serif">
              7 (बृहस्पति)
            </text>
            {/* House 8 */}
            <text x="225" y="255" textAnchor="middle" fill="#5a4139" fontSize="11" fontFamily="sans-serif">
              8
            </text>
            {/* House 9 */}
            <text x="255" y="225" textAnchor="middle" fill="#5a4139" fontSize="11" fontFamily="sans-serif">
              9 (शुक्र)
            </text>
            {/* House 10 (Center Right) */}
            <text x="225" y="150" textAnchor="middle" fill="#ab3100" fontWeight="bold" fontSize="13" fontFamily="sans-serif">
              10 (मंगल)
            </text>
            {/* House 11 */}
            <text x="255" y="75" textAnchor="middle" fill="#5a4139" fontSize="11" fontFamily="sans-serif">
              11
            </text>
            {/* House 12 */}
            <text x="225" y="45" textAnchor="middle" fill="#5a4139" fontSize="11" fontFamily="sans-serif">
              12 (शनि/राहु)
            </text>
          </svg>
        </div>

        {/* Astrological Parameters List */}
        <div className="grid grid-cols-2 gap-2 text-[12px] bg-[#fdf2e6] p-3 rounded-xl border border-[#e3bfb4]/40">
          <div>
            <span className="text-[#5a4139] block text-[11px]">जन्म विवरण:</span>
            <span className="font-semibold text-[#1f1b14]">{profile.birthDate}</span>
          </div>
          <div>
            <span className="text-[#5a4139] block text-[11px]">जन्म स्थान:</span>
            <span className="font-semibold text-[#1f1b14]">{profile.birthPlace}</span>
          </div>
          <div>
            <span className="text-[#5a4139] block text-[11px]">मांगलिक स्थिति:</span>
            <span className="font-semibold text-green-800">{profile.manglikStatus}</span>
          </div>
          <div>
            <span className="text-[#5a4139] block text-[11px]">नाड़ी व गण:</span>
            <span className="font-semibold text-[#1f1b14]">मध्य नाड़ी • देव गण</span>
          </div>
        </div>

        {/* Astrological Note */}
        <div className="p-3 rounded-lg bg-[#f1e7db] text-[#5a4139] text-[12px] leading-relaxed text-center">
          🚩 <strong className="text-[#1f1b14]">ज्योतिषीय विश्लेषण:</strong> लग्न चक्र में बृहस्पति सप्तम भाव में स्वगृही होने से वैवाहिक सुख व दीर्घायु योग प्रबल है। नाड़ी दोष रहित व संतान सुख उत्तम।
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#ab3100] text-white font-semibold text-[14px] hover:bg-[#852400] active:scale-98 transition-all shadow-sm"
        >
          विवरण समझ आ गया (बंद करें)
        </button>
      </div>
    </div>
  );
};
