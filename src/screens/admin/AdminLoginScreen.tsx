import React, { useState } from 'react';
import { AdminUser } from '../../types/matrimony';
import { APP_LOGO } from '../../data/mockData';

interface AdminLoginScreenProps {
  adminUsers: AdminUser[];
  onAdminLoginSuccess: (admin: AdminUser) => void;
  onNavigateHome: () => void;
  onToast: (msg: string) => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  adminUsers,
  onAdminLoginSuccess,
  onNavigateHome,
  onToast,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId) {
      setErrorMessage('Please enter your Admin Email, Staff ID or Phone number.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Please enter your Administrative Security Password.');
      return;
    }

    setIsSubmitting(true);

    // Simulate verification delay for security feel
    setTimeout(() => {
      // Find matching admin user
      const matchedUser = adminUsers.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          u.phone.replace(/[^0-9]/g, '').endsWith(cleanId.replace(/[^0-9]/g, '')) ||
          u.id.toLowerCase() === cleanId ||
          u.name.toLowerCase().includes(cleanId)
      );

      // Default accepted passwords for admin users: 'admin123', 'admin', '1234', 'shubh2026'
      const isValidPassword =
        cleanPass === 'admin123' ||
        cleanPass === 'admin' ||
        cleanPass === '1234' ||
        cleanPass === 'shubh2026';

      if (!matchedUser) {
        setErrorMessage('Unrecognized administrator identifier. Please check your staff credentials or use a test account below.');
        setIsSubmitting(false);
        return;
      }

      if (!isValidPassword) {
        setErrorMessage('Invalid administrative password. (Default security password for testing: admin123 or 1234)');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onToast(`Authentication successful! Welcome, ${matchedUser.name}.`);
      onAdminLoginSuccess(matchedUser);
    }, 400);
  };

  const handleQuickLogin = (admin: AdminUser) => {
    setIdentifier(admin.email);
    setPassword('admin123');
    setErrorMessage(null);
    onToast(`Selected credentials for ${admin.name} (${admin.roleTitle})`);
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] flex flex-col justify-center items-center pt-24 pb-16 px-4 sm:px-6">
      {/* Background Ambience */}
      <div className="w-full max-w-md">
        {/* Brand & Security Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#3a2215] to-[#1f1b14] text-white shadow-md mb-3 ring-4 ring-[#ffdcc3]/50">
            <span className="material-symbols-outlined text-[34px] text-[#ffdbd0]">
              admin_panel_settings
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#1f1b14] tracking-tight font-['Noto_Sans']">
            Shubh Bandhan Admin Portal
          </h1>
          <p className="text-xs text-[#5a4139] mt-1 font-medium">
            Central Administrative & Enterprise Management Console
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1e7db] text-[11px] font-semibold text-[#6e3900]">
            <span className="material-symbols-outlined text-[14px] text-green-700">lock</span>
            <span>Restricted Access: Authorized Personnel Only</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e3bfb4]/70 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e3bfb4]/30">
            <div>
              <h2 className="text-base font-bold text-[#1f1b14]">Administrator Sign In</h2>
              <p className="text-[11px] text-[#5a4139]">Enter your authorized credentials to continue</p>
            </div>
            <img src={APP_LOGO} alt="Shubh Bandhan" className="h-7 w-auto object-contain" />
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Identifier Input */}
            <div>
              <label className="block text-xs font-bold text-[#1f1b14] mb-1">
                Admin Email / Staff ID / Phone
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-gray-400">
                  person
                </span>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin.head@shubhbandhan.in"
                  className="w-full pl-9.5 pr-3 py-2 rounded-xl border border-[#e3bfb4] text-xs text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#ab3100] focus:border-transparent bg-white"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#1f1b14]">
                  Security Password / PIN
                </label>
                <span className="text-[10px] text-gray-500">Default: admin123</span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-gray-400">
                  key
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9.5 pr-10 py-2 rounded-xl border border-[#e3bfb4] text-xs text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#ab3100] focus:border-transparent bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#5a4139]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#ab3100] focus:ring-[#ab3100] h-4 w-4"
                />
                <span>Remember session on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white text-xs font-bold shadow-sm transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>Authenticate & Enter Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Accounts */}
          <div className="mt-6 pt-5 border-t border-[#e3bfb4]/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#5a4139] uppercase tracking-wider">
                Quick Test Admin Logins (1-Click Fill)
              </span>
              <span className="text-[10px] text-gray-400">Click to fill</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {adminUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickLogin(user)}
                  className="text-left px-3 py-2 rounded-xl bg-[#faf6f0] hover:bg-[#f3ebe1] border border-[#e3bfb4]/60 transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-[11px] text-[#1f1b14] truncate font-bold group-hover:text-[#ab3100]">
                        {user.name}
                      </strong>
                      <span className="text-[10px] font-semibold text-[#8e4b00] px-1.5 py-0.2 rounded bg-[#ffdcc3]">
                        {user.allowedModule === 'all' ? 'Super Admin' : user.allowedModule.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {user.email}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-[#ab3100] shrink-0">
                    login
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Return to Portal Button */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs font-semibold text-[#5a4139] hover:text-[#1f1b14] inline-flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Back to Public Matrimonial Portal</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-[10px] text-gray-400 mt-4">
          All administrative sessions are logged for audit compliance. IP & device telemetry protected.
        </p>
      </div>
    </div>
  );
};
