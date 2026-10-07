import React, { useState } from 'react';
import { DEMO_USERS } from '../data/mockData';
import { AuthUser } from '../types/matrimony';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  onLogin,
  onLogout,
  onClose,
  onToast,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      onToast('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
    onToast(`OTP 9821 sent to ${phoneNumber} (Demo OTP: 9821)`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Log in with user account
    const matched = DEMO_USERS[0];
    onLogin({
      ...matched,
      phone: `+91 ${phoneNumber}`,
    });
    onToast(`Successfully signed in! Welcome, ${matched.name}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#353028]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#fff8f3] rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-[#e3bfb4]/60 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e3bfb4]/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ab3100] text-[24px]">
              account_circle
            </span>
            <div>
              <h3 className="font-bold text-[17px] text-[#1f1b14]">
                {currentUser ? 'User Account & Session' : 'Member & Visitor Sign In'}
              </h3>
              <p className="text-[11px] text-[#5a4139]">
                Secure member & family authentication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f1e7db] hover:bg-[#ebe1d6] flex items-center justify-center text-[#1f1b14] transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Current Active Session Info if Logged In */}
        {currentUser ? (
          <div className="p-4 rounded-xl bg-white border border-[#e3bfb4]/60 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#d3430c]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-[15px] text-[#1f1b14] truncate">
                    {currentUser.name}
                  </h4>
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                </div>
                <p className="text-[12px] text-[#5a4139]">{currentUser.role} • {currentUser.city}</p>
                <p className="text-[11px] text-[#ab3100] font-semibold mt-0.5">
                  Candidate: {currentUser.candidateName}
                </p>
              </div>
            </div>

            {/* BDE Referral Tag on User */}
            {currentUser.bdeCode && (
              <div className="p-2 rounded-lg bg-[#fdf2e6] border border-[#e3bfb4]/40 text-[11px] flex items-center justify-between">
                <span className="text-[#5a4139]">Assigned BDE / BDM Code:</span>
                <span className="font-mono font-bold text-[#ab3100] bg-white px-2 py-0.5 rounded border border-[#e3bfb4]">
                  {currentUser.bdeCode}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                onLogout();
                onToast('You have safely logged out.');
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/20 text-[#ba1a1a] font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Safe Log Out</span>
            </button>
          </div>
        ) : (
          /* Single Consolidated Visitor Sign In Form (Mobile OTP) */
          <div className="p-4 rounded-xl bg-white border border-[#e3bfb4]/60 space-y-3">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="text-[12px] font-semibold text-[#5a4139] block mb-1">
                    Enter Registered Mobile Number:
                  </label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 rounded-xl bg-[#f1e7db] text-[#1f1b14] text-[13px] font-bold flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      className="flex-1 px-3 py-2.5 rounded-xl border border-[#e3bfb4] text-[14px] text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#ab3100]/30"
                      maxLength={10}
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-[#8e7067] mt-1.5">
                    For quick demo testing, you can enter any 10-digit number or select a test account below.
                  </p>
                </div>

                {/* Quick 1-Click Demo Profiles */}
                <div className="pt-2 border-t border-[#e3bfb4]/50">
                  <span className="text-[10px] font-bold text-[#8e4b00] uppercase tracking-wider block mb-1.5">
                    1-Click Demo Member Sign In:
                  </span>
                  <div className="space-y-1.5">
                    {DEMO_USERS.map((usr) => (
                      <button
                        key={usr.id}
                        type="button"
                        onClick={() => {
                          onLogin(usr);
                          onToast(`Signed in as ${usr.name}! Welcome.`);
                          onClose();
                        }}
                        className="w-full p-2 rounded-xl bg-[#fdfaf7] hover:bg-[#f1e7db] border border-[#e3bfb4] flex items-center justify-between text-left transition-all active:scale-98"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={usr.avatar}
                            alt={usr.name}
                            className="w-7 h-7 rounded-full object-cover border border-[#ab3100]"
                          />
                          <div>
                            <p className="text-[12px] font-bold text-[#1f1b14] leading-tight">
                              {usr.name}
                            </p>
                            <p className="text-[10px] text-[#5a4139]">
                              {usr.candidateName} • {usr.city}
                            </p>
                            <p className="text-[9px] font-bold text-[#ab3100]">
                              {usr.candidateGender === 'groom' ? '👦 वर (Seeking Bride)' : '👧 वधू (Seeking Groom)'} • {usr.isPaidMember ? '👑 Paid Plan' : '🆓 Free Plan'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#ab3100] bg-white px-2 py-0.5 rounded-full border border-[#e3bfb4]">
                          Sign In
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all cursor-pointer mt-2"
                >
                  <span className="material-symbols-outlined text-[18px]">sms</span>
                  <span>Get OTP</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12px] font-semibold text-[#5a4139]">
                      Enter 4-Digit OTP:
                    </label>
                    <span className="text-[11px] text-[#ab3100] font-bold">
                      Demo OTP: 9821
                    </span>
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="9821"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e3bfb4] text-center tracking-widest text-[18px] font-bold text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#ab3100]/30"
                    maxLength={4}
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 py-2 rounded-xl bg-[#f1e7db] hover:bg-[#ebe1d6] text-[#5a4139] text-[12px] font-semibold transition-colors"
                  >
                    Change Number
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-2 rounded-xl bg-[#ab3100] text-white text-[13px] font-bold shadow-xs hover:bg-[#852400] transition-colors"
                  >
                    Verify & Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

