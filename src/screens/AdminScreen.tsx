import React, { useState, useEffect } from 'react';
import {
  Profile,
  ScreenType,
  AdminUser,
  Employee,
  TransactionRecord,
  AdminModule,
  AttendanceRecord,
  MonthlyPayrollRecord,
  AbandonedRegistrationLead,
} from '../types/matrimony';
import { AdminDashboardTab } from './admin/AdminDashboardTab';
import { AdminModerationTab } from './admin/AdminModerationTab';
import { AdminAccountsTab } from './admin/AdminAccountsTab';
import { AdminHrTab } from './admin/AdminHrTab';
import { AdminSalesTab } from './admin/AdminSalesTab';
import { AdminUsersTab } from './admin/AdminUsersTab';

interface AdminScreenProps {
  profiles: Profile[];
  adminUsers: AdminUser[];
  employees: Employee[];
  transactions: TransactionRecord[];
  activeAdminUser: AdminUser;
  attendanceRecords: AttendanceRecord[];
  payrollRecords: MonthlyPayrollRecord[];
  abandonedLeads?: AbandonedRegistrationLead[];
  onUpdateLeadStatus?: (leadId: string, status: 'pending_callback' | 'in_touch' | 'converted') => void;
  onNavigate: (screen: ScreenType) => void;
  onApproveProfile: (profileId: string) => void;
  onRejectProfile: (profileId: string) => void;
  onAddProfile: (profile: Profile) => void;
  onDeleteProfile: (profileId: string) => void;
  onAddTransaction: (txn: TransactionRecord) => void;
  onUpdateTxnStatus: (txnId: string, status: 'success' | 'pending' | 'refunded') => void;
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  onAddAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onSendPayrollToAccounts: (records: MonthlyPayrollRecord[]) => void;
  onUpdatePayrollStatus: (payrollId: string, status: 'disbursed' | 'approved' | 'submitted_by_hr', utrRef?: string) => void;
  onSelectActiveAdmin: (user: AdminUser) => void;
  onAddAdminUser: (user: AdminUser) => void;
  onDeleteAdminUser: (userId: string) => void;
  onToast: (msg: string) => void;
  onAdminLogout?: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  profiles,
  adminUsers,
  employees,
  transactions,
  activeAdminUser,
  attendanceRecords,
  payrollRecords,
  abandonedLeads = [],
  onUpdateLeadStatus,
  onNavigate,
  onApproveProfile,
  onRejectProfile,
  onAddProfile,
  onDeleteProfile,
  onAddTransaction,
  onUpdateTxnStatus,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddAttendance,
  onUpdateAttendance,
  onSendPayrollToAccounts,
  onUpdatePayrollStatus,
  onSelectActiveAdmin,
  onAddAdminUser,
  onDeleteAdminUser,
  onToast,
  onAdminLogout,
}) => {
  // Determine initial tab based on user's allowedModule permission
  const getInitialTab = (module: AdminModule) => {
    if (module === 'all') return 'dashboard';
    if (module === 'moderation') return 'moderation';
    if (module === 'accounts') return 'accounts';
    if (module === 'hr') return 'hr';
    if (module === 'sales') return 'sales';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<string>(() => getInitialTab(activeAdminUser.allowedModule));

  // Sync tab if active user permissions change
  useEffect(() => {
    if (activeAdminUser.allowedModule !== 'all') {
      setActiveTab(activeAdminUser.allowedModule);
    }
  }, [activeAdminUser]);

  // Tab definitions with RBAC checks
  const allTabs = [
    {
      id: 'dashboard',
      label: 'Overview & Analytics',
      icon: 'dashboard',
      module: 'all' as AdminModule,
    },
    {
      id: 'moderation',
      label: 'Profile Moderation',
      icon: 'verified_user',
      badge: profiles.filter((p) => p.approvalStatus === 'pending').length,
      module: 'moderation' as AdminModule,
    },
    {
      id: 'accounts',
      label: 'Accounts & Finance',
      icon: 'account_balance',
      badge: transactions.filter((t) => t.status === 'pending').length,
      module: 'accounts' as AdminModule,
    },
    {
      id: 'hr',
      label: 'HR & Attendance',
      icon: 'badge',
      module: 'hr' as AdminModule,
    },
    {
      id: 'sales',
      label: 'Sales & BDE',
      icon: 'trending_up',
      module: 'sales' as AdminModule,
    },
    {
      id: 'permissions',
      label: 'RBAC & Permissions',
      icon: 'shield_person',
      module: 'all' as AdminModule,
    },
  ];

  // Filter tabs accessible to the active admin user
  const accessibleTabs = allTabs.filter((tab) => {
    if (activeAdminUser.allowedModule === 'all') return true;
    return tab.id === activeAdminUser.allowedModule;
  });

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto pb-24 pt-20 px-3 sm:px-6">
      {/* Admin Top Navigation & Status Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-[#e3bfb4]/70 shadow-xs mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#ab3100] to-[#e65100] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-[20px] text-[#1f1b14] leading-tight font-['Noto_Sans']">
                Shubh Bandhan • Central Administrative Console
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                Live System
              </span>
            </div>
            <p className="text-[12px] text-[#5a4139] mt-0.5">
              User management, BDE moderation, accounting ledger, HR payroll & RBAC permissions
            </p>
          </div>
        </div>

        {/* User Session Pill & Return Button */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Active Admin Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#fdfaf7] border border-[#e3bfb4]">
            <div className="w-6 h-6 rounded-full bg-[#ab3100] text-white flex items-center justify-center text-[10px] font-bold">
              {activeAdminUser.name.charAt(0)}
            </div>
            <div className="text-left text-[11px] leading-tight">
              <span className="font-bold text-gray-900 block truncate max-w-[130px]">
                {activeAdminUser.name}
              </span>
              <span className="text-[#ab3100] font-semibold text-[10px]">
                {activeAdminUser.allowedModule === 'all'
                  ? 'Super Admin (Full Access)'
                  : `${activeAdminUser.allowedModule.toUpperCase()} Module Only`}
              </span>
            </div>
          </div>

          {/* Sign Out / Lock Console Button */}
          {onAdminLogout ? (
            <button
              onClick={onAdminLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white shadow-xs text-[12px] font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
              title="Sign Out from Administrative Session"
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Sign Out & Lock Console</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-2 bg-[#f1e7db] hover:bg-[#ebe1d6] text-[#5a4139] text-[12px] font-bold rounded-xl transition-colors flex items-center gap-1"
              title="Return to main portal"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Return to Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* Single Module Restriction Warning if not Super Admin */}
      {activeAdminUser.allowedModule !== 'all' && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-700 text-[18px]">lock</span>
            <span>
              <strong>Restricted Access:</strong> Your staff account is assigned to the{' '}
              <strong className="uppercase underline">{activeAdminUser.allowedModule}</strong> module only.
            </span>
          </div>
          <button
            onClick={() => {
              const superAdmin = adminUsers.find((u) => u.allowedModule === 'all');
              if (superAdmin) {
                onSelectActiveAdmin(superAdmin);
                onToast('Switched to Super Admin account');
              }
            }}
            className="text-[11px] font-bold text-[#ab3100] underline"
          >
            Switch to Super Admin
          </button>
        </div>
      )}

      {/* Module Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-hide border-b border-[#e3bfb4]/50">
        {accessibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-[12px] flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#ab3100] text-white shadow-xs'
                  : 'bg-white text-[#5a4139] hover:bg-[#fff0eb] border border-[#e3bfb4]/60'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-[#ab3100]' : 'bg-[#ab3100] text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {activeTab === 'dashboard' && (
          <AdminDashboardTab
            profiles={profiles}
            transactions={transactions}
            employees={employees}
            abandonedLeads={abandonedLeads}
            onUpdateLeadStatus={onUpdateLeadStatus}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onToast={onToast}
          />
        )}

        {activeTab === 'moderation' && (
          <AdminModerationTab
            profiles={profiles}
            onApproveProfile={onApproveProfile}
            onRejectProfile={onRejectProfile}
            onAddProfile={onAddProfile}
            onDeleteProfile={onDeleteProfile}
            onToast={onToast}
          />
        )}

        {activeTab === 'accounts' && (
          <AdminAccountsTab
            transactions={transactions}
            payrollRecords={payrollRecords}
            onAddTransaction={onAddTransaction}
            onUpdateTxnStatus={onUpdateTxnStatus}
            onUpdatePayrollStatus={onUpdatePayrollStatus}
            onToast={onToast}
          />
        )}

        {activeTab === 'hr' && (
          <AdminHrTab
            employees={employees}
            attendanceRecords={attendanceRecords}
            onAddAttendance={onAddAttendance}
            onUpdateAttendance={onUpdateAttendance}
            onSendPayrollToAccounts={onSendPayrollToAccounts}
            onAddEmployee={onAddEmployee}
            onUpdateEmployee={onUpdateEmployee}
            onDeleteEmployee={onDeleteEmployee}
            onToast={onToast}
          />
        )}

        {activeTab === 'sales' && (
          <AdminSalesTab
            employees={employees}
            profiles={profiles}
            transactions={transactions}
            onToast={onToast}
          />
        )}

        {activeTab === 'permissions' && (
          <AdminUsersTab
            adminUsers={adminUsers}
            activeAdminUser={activeAdminUser}
            onSelectActiveAdmin={onSelectActiveAdmin}
            onAddAdminUser={onAddAdminUser}
            onDeleteAdminUser={onDeleteAdminUser}
            onToast={onToast}
          />
        )}
      </div>
    </div>
  );
};
