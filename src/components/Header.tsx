import React from 'react';
import { APP_LOGO } from '../data/mockData';
import { ScreenType, UserSubscription, AuthUser, Employee, AdminUser } from '../types/matrimony';

interface HeaderProps {
  currentScreen: ScreenType;
  selectedCity: string;
  selectedLanguage: string;
  currentUser: AuthUser | null;
  userSubscription?: UserSubscription;
  activeEmployee?: Employee | null;
  authenticatedAdmin?: AdminUser | null;
  onEmployeeLogout?: () => void;
  onAdminLogout?: () => void;
  onOpenCityModal: () => void;
  onOpenLanguageModal: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenAuthModal: () => void;
  onNavigate: (screen: ScreenType) => void;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  selectedCity,
  currentUser,
  userSubscription,
  activeEmployee,
  authenticatedAdmin,
  onEmployeeLogout,
  onAdminLogout,
  onOpenCityModal,
  onOpenSubscriptionModal,
  onOpenAuthModal,
  onNavigate,
  onBack,
}) => {
  // If we are on stack screens, show consistent back bar
  const isStackScreen = ['biodata', 'filter', 'plans', 'register', 'stories', 'admin', 'employee-portal'].includes(currentScreen);

  if (isStackScreen) {
    let title = 'Biodata Details';
    if (currentScreen === 'filter') title = 'Kundali Match';
    if (currentScreen === 'plans') title = 'Membership Plans';
    if (currentScreen === 'register') title = 'New Registration / Sign In';
    if (currentScreen === 'stories') title = 'Success Stories';
    if (currentScreen === 'admin') title = 'Admin Console';
    if (currentScreen === 'employee-portal') title = 'Employee Attendance Portal';

    return (
      <header className="fixed top-0 w-full z-40 pt-safe bg-[#fff8f3]/95 backdrop-blur-xl border-b border-[#e3bfb4]/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack || (() => onNavigate('dashboard'))}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#1f1b14] hover:bg-[#f1e7db] active:scale-95 transition-all"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <img
              src={APP_LOGO}
              alt="Shubh Bandhan Logo"
              className="h-8 w-auto object-contain cursor-pointer"
              onClick={onBack || (() => onNavigate('dashboard'))}
            />
            <h1 className="font-semibold text-[17px] text-[#1f1b14] tracking-tight truncate max-w-[190px]">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Employee Session indicator */}
            {currentScreen === 'employee-portal' && activeEmployee && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 hidden sm:inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  {activeEmployee.name}
                </span>
                {onEmployeeLogout && (
                  <button
                    onClick={onEmployeeLogout}
                    className="h-8 px-2.5 rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold flex items-center gap-1 transition-colors border border-red-200 active:scale-95"
                    title="Safe Log Out from Employee Portal"
                  >
                    <span className="material-symbols-outlined text-[15px]">logout</span>
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            )}

            {/* Active Admin Session indicator */}
            {currentScreen === 'admin' && authenticatedAdmin && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded-full border border-amber-300 hidden sm:inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  {authenticatedAdmin.name}
                </span>
                {onAdminLogout && (
                  <button
                    onClick={onAdminLogout}
                    className="h-8 px-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors active:scale-95 shadow-xs"
                    title="Lock Admin Console"
                  >
                    <span className="material-symbols-outlined text-[15px]">lock</span>
                    <span>Lock Console</span>
                  </button>
                )}
              </div>
            )}

            {/* If neither employee nor admin is active, show standard membership pill */}
            {!activeEmployee && !authenticatedAdmin && (
              <button
                onClick={onOpenSubscriptionModal}
                className="h-8 px-2.5 rounded-full bg-gradient-to-r from-[#ffdcc3] to-[#ffdbd0] text-[#6e3900] border border-[#e3bfb4] flex items-center gap-1 text-[11px] font-bold shadow-xs active:scale-95 transition-all"
                title="View Membership Plans"
              >
                <span className="material-symbols-outlined text-[15px] text-[#ab3100]">
                  workspace_premium
                </span>
                <span>
                  {userSubscription?.isActive
                    ? `${userSubscription.contactsRemaining} Credits`
                    : 'Plans'}
                </span>
              </button>
            )}

            {/* User Session / Account Button (only when logged in) */}
            {currentUser && !activeEmployee && !authenticatedAdmin && (
              <button
                onClick={onOpenAuthModal}
                className="relative flex items-center justify-center p-0.5 rounded-full ring-2 ring-[#ab3100]/20 hover:ring-[#ab3100] transition-all"
                title="Account Settings & Session"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Primary Tab Header (Dashboard, Feed, Chats, Profile)
  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-[#fff8f3]/95 backdrop-blur-xl border-b border-[#e3bfb4]/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 px-4 max-w-xl mx-auto flex items-center justify-between">
        {/* Brand Section */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => onNavigate('dashboard')}
        >
          <img
            src={APP_LOGO}
            alt="Shubh Bandhan Logo"
            className="h-9 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[20px] text-[#ab3100] tracking-tight font-['Noto_Sans']">
                Shubh Bandhan
              </span>
            </div>
            <span className="text-[12px] text-[#5a4139] font-medium tracking-wide">
              Trusted Matrimonial Network
            </span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar ml-2">
          {/* Employee, Admin, and New Registration / Sign In Tabs: Only visible before user signs in */}
          {!currentUser && (
            <>
              {/* Employee Attendance Panel Button (Login-based attendance system) */}
              <button
                onClick={() => onNavigate('employee-portal')}
                className="h-8 px-2.5 bg-[#1b5e20] hover:bg-[#144818] text-white rounded-full flex items-center gap-1 text-[11px] font-bold shadow-xs active:scale-95 transition-all shrink-0"
                title="Employee Daily Attendance Portal"
              >
                <span className="material-symbols-outlined text-[15px]">badge</span>
                <span>Employee</span>
              </button>

              {/* Admin Panel Quick Access Button */}
              <button
                onClick={() => onNavigate('admin')}
                className="h-8 px-2.5 bg-[#3a2215] hover:bg-[#25150d] text-[#ffdbd0] rounded-full flex items-center gap-1 text-[11px] font-bold shadow-xs active:scale-95 transition-all shrink-0"
                title="Admin Management Console"
              >
                <span className="material-symbols-outlined text-[15px] text-[#ffdcc3]">admin_panel_settings</span>
                <span>Admin</span>
              </button>

              {/* New Registration / Sign In Button */}
              <button
                onClick={() => onNavigate('register')}
                className="h-8 px-2.5 bg-[#ab3100] hover:bg-[#852400] text-white rounded-full flex items-center gap-1 text-[11px] font-bold shadow-xs active:scale-95 transition-all whitespace-nowrap shrink-0"
                title="New Registration / Sign In"
              >
                <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
                <span>New Registration / Sign In</span>
              </button>
            </>
          )}

          {/* Subscription Action Pill */}
          <button
            onClick={onOpenSubscriptionModal}
            className="h-8 px-2 bg-gradient-to-r from-[#ffdcc3] to-[#ffdbd0] hover:from-[#ffb77d] hover:to-[#ffdcc3] border border-[#e3bfb4] rounded-full flex items-center gap-0.5 text-[#6e3900] active:scale-95 transition-all shadow-xs shrink-0"
            title="Membership Plans & Contact Credits"
          >
            <span
              className="material-symbols-outlined text-[15px] text-[#ab3100]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              workspace_premium
            </span>
            <span className="text-[10px] font-bold">
              {userSubscription?.isActive
                ? `${userSubscription.contactsRemaining} Credits`
                : 'Plans'}
            </span>
          </button>

          {/* City Selector */}
          <button
            onClick={onOpenCityModal}
            className="h-8 px-2 bg-[#f1e7db] hover:bg-[#ebe1d6] rounded-full flex items-center gap-0.5 text-[#5a4139] hover:text-[#1f1b14] transition-colors active:scale-95 shadow-xs shrink-0"
            title="Select District"
          >
            <span className="material-symbols-outlined text-[15px] text-[#ab3100]">location_on</span>
            <span className="text-[10px] font-semibold">{selectedCity}</span>
            <span className="material-symbols-outlined text-[12px]">keyboard_arrow_down</span>
          </button>

          {/* User Account / Session (only when logged in) */}
          {currentUser && (
            <button
              onClick={onOpenAuthModal}
              className="relative flex items-center justify-center p-0.5 rounded-full ring-2 ring-[#ab3100]/20 hover:ring-[#ab3100] active:scale-95 transition-all"
              title={`Account: ${currentUser.name}`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-600 rounded-full border-2 border-[#fff8f3]"></span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
