import React, { useState } from 'react';
import { AdminUser, AdminModule } from '../../types/matrimony';
import { exportToCsv } from '../../utils/exportToExcel';

interface AdminUsersTabProps {
  adminUsers: AdminUser[];
  activeAdminUser: AdminUser;
  onSelectActiveAdmin: (user: AdminUser) => void;
  onAddAdminUser: (user: AdminUser) => void;
  onDeleteAdminUser: (userId: string) => void;
  onToast: (msg: string) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  adminUsers,
  activeAdminUser,
  onSelectActiveAdmin,
  onAddAdminUser,
  onDeleteAdminUser,
  onToast,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [roleTitle, setRoleTitle] = useState('Accounts Officer');
  const [allowedModule, setAllowedModule] = useState<AdminModule>('accounts');

  const moduleLabels: Record<AdminModule, string> = {
    all: 'Super Admin - All Modules',
    moderation: 'Moderation & Profile Verification Only',
    accounts: 'Accounts & Transactions Only',
    hr: 'Human Resources (HR) Only',
    sales: 'Sales & Marketing Only',
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      onToast('Please enter both name and email');
      return;
    }

    const newUser: AdminUser = {
      id: `admin-user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      roleTitle: roleTitle.trim(),
      allowedModule,
      status: 'active',
      lastActive: 'Just registered',
    };

    onAddAdminUser(newUser);
    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    onToast(`Admin user ${newUser.name} created with ${allowedModule.toUpperCase()} permission! ✅`);
  };

  const handleExport = () => {
    const exportData = adminUsers.map((u) => ({
      'Name': u.name,
      'Email': u.email,
      'Phone': u.phone,
      'Role': u.roleTitle,
      'Allowed Module': moduleLabels[u.allowedModule],
      'Status': u.status,
      'Last Active': u.lastActive,
    }));
    exportToCsv('ShubhBandhan_Admin_Users_RBAC', exportData);
    onToast('Admin users list exported to Excel');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#e3bfb4]/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#ab3100] bg-[#ffdcc3] px-2 py-0.5 rounded">
            Role-Based Access Control (RBAC) & Permissions
          </span>
          <h2 className="text-xl font-bold text-[#1f1b14] mt-1 font-['Noto_Sans']">
            Admin Users & Access Management
          </h2>
          <p className="text-[12px] text-[#5a4139] mt-0.5">
            Super Admin can grant staff access to the entire portal or restrict them to a single department module (Accounts, HR, Sales, Moderation).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#ab3100] hover:bg-[#852400] text-white text-[12px] font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">security</span>
            <span>+ Add Admin User</span>
          </button>
          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-[#107c41] hover:bg-[#0c6233] text-white text-[12px] font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">table_view</span>
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Active Session Indicator */}
      <div className="bg-gradient-to-r from-[#2c1d11] to-[#452718] text-white p-4.5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#ab3100] flex items-center justify-center font-bold text-white text-[16px] shadow-xs">
            {activeAdminUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#ffdcc3] uppercase font-bold tracking-wider">
                Current Active Session:
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-green-500 text-white">
                Logged In
              </span>
            </div>
            <h4 className="font-bold text-[16px] leading-tight mt-0.5">{activeAdminUser.name}</h4>
            <p className="text-[12px] text-gray-300">
              {activeAdminUser.roleTitle} • <strong>Access: {moduleLabels[activeAdminUser.allowedModule]}</strong>
            </p>
          </div>
        </div>

        <div className="bg-white/10 px-3 py-2 rounded-xl text-[11px] text-[#ffdcc3] border border-white/20">
          Click any user below to simulate or test their specific department permissions in live view.
        </div>
      </div>

      {/* Admin Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminUsers.map((user) => {
          const isActive = user.id === activeAdminUser.id;

          return (
            <div
              key={user.id}
              className={`bg-white rounded-2xl border p-4.5 shadow-xs transition-all space-y-3.5 ${
                isActive ? 'border-[#ab3100] ring-2 ring-[#ab3100]/20 bg-[#fffdfb]' : 'border-[#e3bfb4]/70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[16px] text-gray-900">{user.name}</h4>
                    {isActive && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#ab3100] text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#ab3100] font-semibold mt-0.5">{user.roleTitle}</p>
                  <p className="text-[11px] text-gray-500">{user.email} • {user.phone}</p>
                </div>

                {user.id !== 'admin-super-1' && (
                  <button
                    onClick={() => {
                      onDeleteAdminUser(user.id);
                      onToast(`Admin account for ${user.name} removed`);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Account"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
              </div>

              {/* Permission pill */}
              <div className="p-2.5 rounded-xl bg-[#fdfaf7] border border-[#e3bfb4]/50 text-[12px]">
                <span className="text-gray-500 block text-[11px] font-bold">Allowed Department Module:</span>
                <span className="font-bold text-[#8e4b00] mt-0.5 block">
                  {moduleLabels[user.allowedModule]}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-400">Activity: {user.lastActive}</span>
                <button
                  onClick={() => {
                    onSelectActiveAdmin(user);
                    onToast(`Session switched: You are now working as ${user.name} (${user.roleTitle})`);
                  }}
                  disabled={isActive}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                    isActive
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : 'bg-[#fff0eb] hover:bg-[#ffdcc3] text-[#ab3100] active:scale-95'
                  }`}
                >
                  {isActive ? 'Current Active Role' : 'Switch to this User'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Admin User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-[17px] text-[#1f1b14]">
                + Create New Admin User
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-[12px]">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Kumar Gupta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Official Email ID:</label>
                <input
                  type="email"
                  required
                  placeholder="accounts@shubhbandhan.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Mobile Number:</label>
                <input
                  type="text"
                  placeholder="+91 9839..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Role Title:</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* Module Permission Choice */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Module Access Permission:
                </label>
                <select
                  value={allowedModule}
                  onChange={(e) => setAllowedModule(e.target.value as AdminModule)}
                  className="w-full p-2 border rounded-lg bg-white font-medium"
                >
                  <option value="all">Super Admin (All Modules)</option>
                  <option value="accounts">Accounts & Transactions Only</option>
                  <option value="hr">Human Resources (HR) Only</option>
                  <option value="sales">Sales & Marketing Only</option>
                  <option value="moderation">Moderation & Verification Only</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  * If a single module is selected, the staff member can only view and operate that department.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ab3100] hover:bg-[#852400] text-white rounded-xl font-bold shadow-xs"
                >
                  Create User & Apply Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
