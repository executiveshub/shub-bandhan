import React, { useState } from 'react';
import { PANDIT_JI_AVATAR } from '../data/mockData';

interface CounselorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const CounselorModal: React.FC<CounselorModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [requestSent, setRequestSent] = useState(false);

  if (!isOpen) return null;

  const handleRequestCall = () => {
    setRequestSent(true);
    onToast('पंडित राधेश्याम जी को आपका अनुरोध भेजा गया है। 15 मिनट में कॉल आएगी।');
    setTimeout(() => {
      setRequestSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#353028]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#fff8f3] rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-[#e3bfb4]/50 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e3bfb4]/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ab3100] text-[24px]">support_agent</span>
            <h3 className="font-bold text-[17px] text-[#1f1b14]">
              पारिवारिक सहायता कक्ष (निःशुल्क)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f1e7db] flex items-center justify-center text-[#1f1b14] active:scale-90"
            aria-label="बंद करें"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Counselor Intro */}
        <div className="flex gap-3 items-center bg-white p-3.5 rounded-xl border border-[#e3bfb4]/60">
          <img
            src={PANDIT_JI_AVATAR}
            alt="पंडित राधेश्याम जी"
            className="w-14 h-14 rounded-full object-cover border-2 border-[#d3430c] shrink-0"
          />
          <div>
            <div className="flex items-center gap-1">
              <h4 className="font-bold text-[15px] text-[#1f1b14]">पंडित राधेश्याम जी</h4>
              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
                वरिष्ठ सलाहकार
              </span>
            </div>
            <p className="text-[12px] text-[#5a4139] mt-0.5">
              20+ वर्षों का पारंपरिक वैदिक संबंध मार्गदर्शन अनुभव
            </p>
          </div>
        </div>

        <div className="bg-[#fdf2e6] p-3 rounded-lg text-[12px] text-[#5a4139] space-y-1">
          <p className="font-semibold text-[#1f1b14]">सलाहकार आपको निम्नलिखित में सहायता करेंगे:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>दोनों परिवारों के बीच गरिमापूर्ण बातचीत की शुरुआत</li>
            <li>विस्तृत कुंडली व नाड़ी दोष निवारण परामर्श</li>
            <li>गोत्र व वंशावली सत्यापन में पूर्ण सहयोग</li>
          </ul>
        </div>

        {/* Instant Dial Direct */}
        <a
          href="tel:1800202303"
          className="w-full min-h-[46px] rounded-xl bg-[#1f1b14] text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-black active:scale-98 shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[20px] text-[#ffdcc3]">call</span>
          <span>सीधे टोल-फ्री कॉल करें: 1800-202-303</span>
        </a>

        {/* Request callback form */}
        <div className="space-y-2 border-t border-[#e3bfb4]/40 pt-3">
          <label className="text-[12px] font-semibold text-[#5a4139] block">
            या अपने नंबर पर तुरंत कॉल-बैक पाएं:
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 text-[14px] px-3 py-2.5 rounded-xl border border-[#e3bfb4] bg-white text-[#1f1b14]"
              placeholder="10 अंकों का मोबाइल नंबर"
            />
            <button
              onClick={handleRequestCall}
              disabled={requestSent}
              className="px-4 py-2.5 rounded-xl bg-[#ab3100] text-white font-semibold text-[13px] hover:bg-[#852400] active:scale-95 transition-all shrink-0"
            >
              {requestSent ? 'अनुरोध भेजा गया...' : 'कॉल-बैक मांगें'}
            </button>
          </div>
          <span className="text-[11px] text-[#5a4139] block text-center">
            समय: प्रतिदिन सुबह 9:00 से रात 8:00 बजे तक
          </span>
        </div>
      </div>
    </div>
  );
};
