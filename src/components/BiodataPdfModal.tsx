import React from 'react';
import { Profile } from '../types/matrimony';

interface BiodataPdfModalProps {
  profile: Profile | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const BiodataPdfModal: React.FC<BiodataPdfModalProps> = ({
  profile,
  onClose,
  onToast,
}) => {
  if (!profile) return null;

  const handlePrintOrDownload = () => {
    window.print();
    onToast('बायोडाटा प्रिंट / PDF सहेजने का विकल्प खोला गया।');
  };

  const handleShareWhatsApp = () => {
    const text = `शुभ बंधन - वैवाहिक परिचय पत्र\nनाम: ${profile.name}\nउम्र/कद: ${profile.age} वर्ष, ${profile.height}\nशिक्षा: ${profile.education}\nपेशा: ${profile.profession}\nमूल निवास: ${profile.nativePlace}\nगोत्र: ${profile.gotra}\nगुण मिलान: ${profile.gunScore}/36\nअभिभावक: ${profile.guardianName} (${profile.guardianPhone})`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onToast('WhatsApp पर बायोडाटा साझा किया गया');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#353028]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl border-2 border-[#d3430c]/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Printable Paper Canvas */}
        <div className="p-6 bg-[#fffdfb] relative" id="printable-biodata">
          {/* Auspicious Top Header Border */}
          <div className="border-2 border-[#d3430c] p-5 rounded-xl bg-[#fff8f3] relative">
            <div className="text-center pb-3 border-b border-[#e3bfb4]">
              <span className="text-[#ab3100] font-bold text-sm tracking-widest block">
                ॥ श्री गणेशाय नमः ॥
              </span>
              <h2 className="text-2xl font-bold text-[#ab3100] mt-1 font-['Noto_Sans']">
                वैवाहिक परिचय पत्र (Biodata)
              </h2>
              <span className="text-xs text-[#5a4139] block mt-0.5">
                शुभ बंधन प्रामाणिक वैवाहिक अभिलेख • पहचान कोड: {profile.code}
              </span>
            </div>

            {/* Candidate Photo & Basic Info */}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start pt-4 border-b border-[#e3bfb4] pb-4">
              <img
                src={profile.photos[0]}
                alt={profile.name}
                className="w-28 h-36 rounded-lg object-cover border-2 border-[#d3430c]/40 shadow-xs shrink-0"
              />
              <div className="flex-1 text-sm space-y-1.5 w-full">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-xl font-bold text-[#1f1b14]">{profile.name}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#ffdcc3] text-[#6e3900]">
                    {profile.gotra} गोत्र
                  </span>
                </div>
                <p className="text-[#5a4139]">
                  <strong className="text-[#1f1b14]">जन्म विवरण:</strong> {profile.birthDate}
                </p>
                <p className="text-[#5a4139]">
                  <strong className="text-[#1f1b14]">जन्म स्थान:</strong> {profile.birthPlace}
                </p>
                <p className="text-[#5a4139]">
                  <strong className="text-[#1f1b14]">उम्र व कद:</strong> {profile.age} वर्ष, {profile.height}
                </p>
                <p className="text-[#5a4139]">
                  <strong className="text-[#1f1b14]">शिक्षा:</strong> {profile.education}
                </p>
                <p className="text-[#5a4139]">
                  <strong className="text-[#1f1b14]">वर्तमान पद/व्यवसाय:</strong> {profile.profession}
                </p>
              </div>
            </div>

            {/* Lineage & Gotra Details */}
            <div className="py-3 border-b border-[#e3bfb4] text-xs space-y-1.5">
              <h4 className="font-bold text-sm text-[#ab3100]">कुटुंब, गोत्र व कुल संबंध:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-[#fdf2e6] p-2 rounded">
                  <span className="font-semibold block text-[#1f1b14]">पैतृक गोत्र (दादाल):</span>
                  <span>{profile.community} (प्रवर: {profile.paternalPravara || 'त्रय प्रवर'})</span>
                  <span className="block text-[#5a4139] mt-0.5">मूल गाँव: {profile.paternalVillage}</span>
                </div>
                <div className="bg-[#fdf2e6] p-2 rounded">
                  <span className="font-semibold block text-[#1f1b14]">मातृक गोत्र (ननिहाल):</span>
                  <span>{profile.maternalGotra || 'कश्यप'}</span>
                  <span className="block text-[#5a4139] mt-0.5">मायका: {profile.maternalVillage}</span>
                </div>
              </div>
            </div>

            {/* Family Background */}
            <div className="py-3 border-b border-[#e3bfb4] text-xs space-y-1.5">
              <h4 className="font-bold text-sm text-[#ab3100]">पारिवारिक पृष्ठभूमि:</h4>
              <p><strong className="text-[#1f1b14]">पिताजी:</strong> {profile.fatherName} ({profile.fatherOccupation})</p>
              <p><strong className="text-[#1f1b14]">माताजी:</strong> {profile.motherName} ({profile.motherOccupation})</p>
              <p><strong className="text-[#1f1b14]">भाई व बहन:</strong> {profile.siblings}</p>
              <p><strong className="text-[#1f1b14]">पैतृक स्थिति व भूमि:</strong> {profile.landProperty}</p>
            </div>

            {/* Horoscope Summary */}
            <div className="py-3 border-b border-[#e3bfb4] text-xs space-y-1 bg-[#ffdcc3]/30 p-2.5 rounded-lg mt-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-[#8e4b00]">कुंडली व ग्रह विवरण:</h4>
                <span className="font-bold text-[#ab3100] text-sm">{profile.gunScore}/36 गुण शुभ</span>
              </div>
              <p>राशि व नक्षत्र: {profile.rashiNakshatra} • मांगलिक स्थिति: {profile.manglikStatus}</p>
              <p className="text-[#6e3900] italic">टिप्पणी: {profile.gunSummary}</p>
            </div>

            {/* Contact Footer */}
            <div className="pt-3 text-xs flex flex-col sm:flex-row justify-between items-center text-[#5a4139] gap-2">
              <div>
                <strong className="text-[#1f1b14]">संपर्क अभिभावक:</strong> {profile.guardianName}
                <span className="block text-[#ab3100] font-bold text-sm">{profile.guardianPhone}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] bg-green-100 text-green-900 px-2 py-0.5 rounded-full font-semibold">
                  ✓ 100% सत्यापित पारिवारिक विवरण
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="p-4 bg-[#f1e7db] border-t border-[#e3bfb4] flex flex-wrap gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white text-[#1f1b14] font-semibold text-xs border border-[#8e7067]/40 hover:bg-gray-50 active:scale-95"
          >
            बंद करें
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 rounded-xl bg-green-700 text-white font-semibold text-xs hover:bg-green-800 flex items-center gap-1.5 active:scale-95 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>WhatsApp पर भेजें</span>
          </button>
          <button
            onClick={handlePrintOrDownload}
            className="px-4 py-2.5 rounded-xl bg-[#ab3100] text-white font-semibold text-xs hover:bg-[#852400] flex items-center gap-1.5 active:scale-95 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>बायोडाटा PDF सहेजें / प्रिंट</span>
          </button>
        </div>
      </div>
    </div>
  );
};
