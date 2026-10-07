import React, { useState } from 'react';
import { UP_CITIES_LIST, BIHAR_CITIES_LIST } from '../data/mockData';

interface CityModalProps {
  isOpen: boolean;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onClose: () => void;
}

export const CityModal: React.FC<CityModalProps> = ({
  isOpen,
  selectedCity,
  onSelectCity,
  onClose,
}) => {
  const [activeStateTab, setActiveStateTab] = useState<'UP' | 'BIHAR'>('UP');

  if (!isOpen) return null;

  const currentCities = activeStateTab === 'UP' ? UP_CITIES_LIST : BIHAR_CITIES_LIST;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#353028]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#fff8f3] rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-[#e3bfb4]/50 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#e3bfb4]/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ab3100]">location_on</span>
            <h3 className="font-bold text-[17px] text-[#1f1b14]">अपना पसंदीदा ज़िला चुनें</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f1e7db] flex items-center justify-center text-[#1f1b14]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* State Tabs: Uttar Pradesh & Bihar */}
        <div className="bg-[#f1e7db] p-1 rounded-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveStateTab('UP')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              activeStateTab === 'UP'
                ? 'bg-[#ab3100] text-white shadow-xs'
                : 'text-[#5a4139] hover:text-[#1f1b14]'
            }`}
          >
            उत्तर प्रदेश (UP)
          </button>
          <button
            type="button"
            onClick={() => setActiveStateTab('BIHAR')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              activeStateTab === 'BIHAR'
                ? 'bg-[#ab3100] text-white shadow-xs'
                : 'text-[#5a4139] hover:text-[#1f1b14]'
            }`}
          >
            बिहार (Bihar)
          </button>
        </div>

        <p className="text-[12px] text-[#5a4139]">
          {activeStateTab === 'UP'
            ? 'उत्तर प्रदेश (अवध व पूर्वांचल क्षेत्र के प्रमुख ज़िले):'
            : 'बिहार (पटना, मिथिला, मगध व शाहाबाद क्षेत्र के प्रमुख ज़िले):'}
        </p>

        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
          {currentCities.map((city) => {
            const isSelected = city === selectedCity;
            return (
              <button
                key={city}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`py-2 px-3 rounded-xl text-[13px] font-semibold text-center transition-all ${
                  isSelected
                    ? 'bg-[#ab3100] text-white shadow-xs'
                    : 'bg-white hover:bg-[#f1e7db] text-[#1f1b14] border border-[#e3bfb4]/50'
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface LanguageModalProps {
  isOpen: boolean;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  selectedLanguage,
  onSelectLanguage,
  onClose,
}) => {
  if (!isOpen) return null;

  const languages = [
    { code: 'hi', name: 'हिन्दी (मानक)' },
    { code: 'aw', name: 'अवधी (पारंपरिक)' },
    { code: 'bh', name: 'भोजपुरी (पूर्वांचल)' },
    { code: 'en', name: 'English' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#353028]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#fff8f3] rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-[#e3bfb4]/50 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#e3bfb4]/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ab3100]">translate</span>
            <h3 className="font-bold text-[17px] text-[#1f1b14]">भाषा चुनें (Select Language)</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f1e7db] flex items-center justify-center text-[#1f1b14]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                onSelectLanguage(l.name);
                onClose();
              }}
              className={`py-3 px-4 rounded-xl text-[14px] font-semibold text-left flex items-center justify-between transition-all ${
                selectedLanguage === l.name
                  ? 'bg-[#ab3100] text-white shadow-xs'
                  : 'bg-white hover:bg-[#f1e7db] text-[#1f1b14] border border-[#e3bfb4]/50'
              }`}
            >
              <span>{l.name}</span>
              {selectedLanguage === l.name && (
                <span className="material-symbols-outlined text-[18px]">check</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
