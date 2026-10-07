import React from 'react';
import { ScreenType, AuthUser, Employee, AdminUser } from '../types/matrimony';

export interface ModuleLockState {
  targetScreen: ScreenType;
  sourceModule: 'user' | 'employee' | 'admin';
  activeUser?: AuthUser | null;
  activeEmployee?: Employee | null;
  activeAdmin?: AdminUser | null;
}

interface ModuleLockModalProps {
  lockState: ModuleLockState | null;
  onClose: () => void;
  onConfirmLogoutAndProceed: (targetScreen: ScreenType) => void;
}

export const ModuleLockModal: React.FC<ModuleLockModalProps> = ({
  lockState,
  onClose,
  onConfirmLogoutAndProceed,
}) => {
  if (!lockState) return null;

  const { targetScreen, sourceModule, activeUser, activeEmployee, activeAdmin } = lockState;

  let title = 'Module Session Lock';
  let badgeText = 'Active Session';
  let icon = 'lock';
  let bannerColor = 'from-[#ab3100] to-[#801b00]';
  let message = '';
  let entityName = '';
  let entityRole = '';
  let entityModule = '';
  let targetModuleName = 'another module';

  if (targetScreen === 'admin') targetModuleName = 'Admin Console';
  else if (targetScreen === 'employee-portal') targetModuleName = 'Employee Portal';
  else if (targetScreen === 'register') targetModuleName = 'New Registration / Sign Up';
  else if (targetScreen === 'dashboard') targetModuleName = 'Public Dashboard';
  else targetModuleName = `${targetScreen.toUpperCase()} Module`;

  if (sourceModule === 'employee' && activeEmployee) {
    title = 'Employee Module Locked (सक्रिय कर्मचारी सत्र)';
    badgeText = 'Employee Portal Active';
    icon = 'badge';
    bannerColor = 'from-[#1b5e20] to-[#0d3810]';
    entityName = activeEmployee.name;
    entityRole = `${activeEmployee.role} • ${activeEmployee.branch}`;
    entityModule = 'Employee Attendance Portal';
    message = `You are currently clocked in as ${activeEmployee.name}. To maintain strict attendance and reporting security, you cannot navigate to ${targetModuleName} or log into another module without first safely logging out.`;
  } else if (sourceModule === 'admin' && activeAdmin) {
    title = 'Admin Console Locked (सक्रिय व्यवस्थापक सत्र)';
    badgeText = 'Admin Console Active';
    icon = 'admin_panel_settings';
    bannerColor = 'from-[#3a2215] to-[#1f120a]';
    entityName = activeAdmin.name;
    entityRole = `${activeAdmin.roleTitle} (${activeAdmin.allowedModule === 'all' ? 'Super Admin' : activeAdmin.allowedModule.toUpperCase()})`;
    entityModule = 'Central Admin Console';
    message = `You are currently logged into the Central Admin Console as ${activeAdmin.name}. Administrative privileges cannot remain active when switching to ${targetModuleName}. Please sign out and lock your console.`;
  } else if (sourceModule === 'user' && activeUser) {
    title = 'Member Module Active (सक्रिय सदस्य खाता)';
    badgeText = 'Member Account Active';
    icon = 'account_circle';
    bannerColor = 'from-[#ab3100] to-[#731f00]';
    entityName = activeUser.name;
    entityRole = `Member • ${activeUser.city} (${activeUser.candidateName})`;
    entityModule = 'Matrimonial Member Portal';
    message = `You are currently signed in as member ${activeUser.name}. To access the ${targetModuleName}, you must log out of your active member session first.`;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[#29221d]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#fff8f3] rounded-2xl shadow-2xl border border-[#e3bfb4] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className={`bg-gradient-to-r ${bannerColor} text-white p-4.5 flex items-start gap-3`}>
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
            <span className="material-symbols-outlined text-[24px] text-white">{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>{badgeText}</span>
            </div>
            <h3 className="font-bold text-[16px] leading-snug">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Active Session Info Card */}
          <div className="p-3.5 rounded-xl bg-white border border-[#e3bfb4]/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f1e7db] text-[#ab3100] font-black text-sm flex items-center justify-center shrink-0 border border-[#e3bfb4]">
              {entityName.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#8e4b00] tracking-wider block">
                Current Active Session:
              </span>
              <h4 className="font-bold text-[14px] text-[#1f1b14] truncate">{entityName}</h4>
              <p className="text-[11px] text-[#5a4139] truncate">{entityRole}</p>
            </div>
          </div>

          {/* Explanation Alert */}
          <div className="p-3 rounded-xl bg-[#fff2eb] border border-[#ffccb6] text-[12px] text-[#5a2c1b] leading-relaxed flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#ab3100] text-[20px] shrink-0 mt-0.5">
              security
            </span>
            <div>
              <p className="font-bold text-[12px] text-[#ab3100] mb-0.5">
                Module Restriction Policy
              </p>
              <p>{message}</p>
            </div>
          </div>

          {/* Decision Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#f1e7db] hover:bg-[#ebe1d6] text-[#5a4139] text-[13px] font-bold transition-all text-center"
            >
              Stay in {sourceModule === 'employee' ? 'Employee Portal' : sourceModule === 'admin' ? 'Admin Console' : 'Member Portal'}
            </button>

            <button
              onClick={() => onConfirmLogoutAndProceed(targetScreen)}
              type="button"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#ba1a1a] hover:bg-[#9c1414] text-white text-[13px] font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Log Out & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
