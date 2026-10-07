import React, { useState, useMemo } from 'react';
import {
  Profile,
  TransactionRecord,
  Employee,
  SubscriptionTier,
  AbandonedRegistrationLead,
} from '../../types/matrimony';
import { exportToCsv } from '../../utils/exportToExcel';

interface AdminDashboardTabProps {
  profiles: Profile[];
  transactions: TransactionRecord[];
  employees: Employee[];
  abandonedLeads?: AbandonedRegistrationLead[];
  onUpdateLeadStatus?: (leadId: string, status: 'pending_callback' | 'in_touch' | 'converted') => void;
  onNavigateTab: (tab: string) => void;
  onToast: (msg: string) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  profiles,
  transactions,
  employees,
  abandonedLeads = [],
  onUpdateLeadStatus,
  onNavigateTab,
  onToast,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'brides' | 'grooms' | 'pending' | 'bde'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Abandoned leads filter & search
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'pending_callback' | 'in_touch' | 'converted'>('all');
  const [leadSearchTerm, setLeadSearchTerm] = useState<string>('');

  // Core metrics
  const totalUsers = profiles.length;
  const bridesCount = profiles.filter((p) => p.gender === 'bride').length;
  const groomsCount = profiles.filter((p) => p.gender === 'groom').length;
  const pendingCount = profiles.filter((p) => p.approvalStatus === 'pending').length;
  const liveCount = profiles.filter((p) => p.approvalStatus !== 'pending').length;
  const bdeCount = profiles.filter((p) => Boolean(p.bdeCode)).length;

  // Abandoned leads metrics
  const totalAbandonedCount = abandonedLeads.length;
  const pendingLeadsCount = abandonedLeads.filter((l) => l.status === 'pending_callback').length;
  const inTouchLeadsCount = abandonedLeads.filter((l) => l.status === 'in_touch').length;
  const convertedLeadsCount = abandonedLeads.filter((l) => l.status === 'converted').length;

  // Filtered abandoned leads
  const filteredAbandonedLeads = useMemo(() => {
    return abandonedLeads.filter((lead) => {
      if (leadStatusFilter !== 'all' && lead.status !== leadStatusFilter) return false;
      if (leadSearchTerm.trim()) {
        const q = leadSearchTerm.toLowerCase();
        const matches =
          lead.name.toLowerCase().includes(q) ||
          lead.phone.includes(q) ||
          (lead.email && lead.email.toLowerCase().includes(q)) ||
          lead.district.toLowerCase().includes(q) ||
          lead.abandonedStage.toLowerCase().includes(q) ||
          (lead.assignedBde && lead.assignedBde.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [abandonedLeads, leadStatusFilter, leadSearchTerm]);

  // Revenue calculations
  const totalRevenue = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'success')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const silverCount = profiles.filter((p) => p.planSubscribed === 'silver').length;
  const goldCount = profiles.filter((p) => p.planSubscribed === 'gold').length;
  const platinumCount = profiles.filter((p) => p.planSubscribed === 'platinum').length;
  const payingUsersCount = silverCount + goldCount + platinumCount;
  const arpu = payingUsersCount > 0 ? Math.round(totalRevenue / payingUsersCount) : 0;

  // Filtered categorized users
  const filteredUsers = useMemo(() => {
    return profiles.filter((p) => {
      if (categoryFilter === 'brides' && p.gender !== 'bride') return false;
      if (categoryFilter === 'grooms' && p.gender !== 'groom') return false;
      if (categoryFilter === 'pending' && p.approvalStatus !== 'pending') return false;
      if (categoryFilter === 'bde' && !p.bdeCode) return false;
      if (districtFilter !== 'all') {
        const d = p.nativeDistrict.toLowerCase();
        const f = districtFilter.toLowerCase();
        const match =
          d === f ||
          (f === 'varanasi' && p.nativeDistrict.includes('वाराणसी')) ||
          (f === 'ayodhya' && p.nativeDistrict.includes('अयोध्या')) ||
          (f === 'gorakhpur' && p.nativeDistrict.includes('गोरखपुर')) ||
          (f === 'lucknow' && p.nativeDistrict.includes('लखनऊ')) ||
          (f === 'sultanpur' && p.nativeDistrict.includes('सुल्तानपुर')) ||
          (f === 'basti' && p.nativeDistrict.includes('बस्ती')) ||
          d.includes(f);
        if (!match) return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.guardianPhone.includes(q) ||
          (p.bdeCode && p.bdeCode.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [profiles, categoryFilter, districtFilter, searchTerm]);

  // Export to Excel / CSV
  const handleExportUsers = () => {
    const exportData = filteredUsers.map((p) => ({
      'Profile Code': p.code,
      'Name': p.name,
      'Gender': p.gender === 'groom' ? 'Groom' : 'Bride',
      'Age': `${p.age} yrs`,
      'Community / Caste': p.community,
      'District': p.nativeDistrict,
      'Approval Status': p.approvalStatus === 'pending' ? 'Pending Review' : 'Live Approved',
      'BDE Staff Code': p.bdeCode || 'Organic / Direct',
      'BDE Employee Name': p.bdeEmployeeName || '—',
      'Subscribed Plan': p.planSubscribed ? p.planSubscribed.toUpperCase() : 'FREE',
      'Revenue Generated': `₹ ${p.revenueGenerated || 0}`,
      'Guardian Phone': p.guardianPhone,
    }));

    exportToCsv(`ShubhBandhan_Users_${categoryFilter}`, exportData);
    onToast(`Candidate user data exported to Excel/CSV (${filteredUsers.length} records) 📊`);
  };

  // Export Abandoned Registration Leads
  const handleExportAbandonedLeads = () => {
    const exportData = filteredAbandonedLeads.map((l) => ({
      'Lead ID': l.id,
      'Name': l.name,
      'Phone': l.phone,
      'Email': l.email || '—',
      'Type': l.gender === 'groom' ? 'Groom' : 'Bride',
      'District': l.district,
      'Drop-off Stage': l.abandonedStage,
      'Timestamp': l.timestamp,
      'Assigned BDE': l.assignedBde || '—',
      'Status':
        l.status === 'pending_callback'
          ? 'Pending Callback'
          : l.status === 'in_touch'
          ? 'In Touch'
          : 'Converted',
      'Notes': l.notes || '',
    }));

    exportToCsv('ShubhBandhan_Abandoned_Registration_Leads', exportData);
    onToast(`Abandoned leads exported to Excel/CSV (${filteredAbandonedLeads.length} records) 📊`);
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
          <div className="flex items-center justify-between text-[#8e4b00]">
            <span className="text-[12px] font-bold">Total Registered Users</span>
            <span className="material-symbols-outlined text-[20px]">groups</span>
          </div>
          <p className="text-2xl font-bold text-[#1f1b14] mt-1">{totalUsers}</p>
          <div className="flex items-center gap-2 text-[11px] text-[#5a4139] mt-1.5 font-medium">
            <span className="text-pink-700">Brides: {bridesCount}</span>
            <span>•</span>
            <span className="text-blue-700">Grooms: {groomsCount}</span>
          </div>
        </div>

        {/* Abandoned / Incomplete Registrations KPI Card */}
        <div className="bg-white p-4 rounded-xl border-2 border-amber-500/50 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-900">
            <span className="text-[12px] font-bold">Incomplete Registrations</span>
            <span className="material-symbols-outlined text-[20px] text-amber-700 animate-pulse">
              contact_support
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-1">{totalAbandonedCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-800 mt-1.5 font-medium">
            <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
              Pending: {pendingLeadsCount}
            </span>
            <span>•</span>
            <span className="text-emerald-800 font-bold">Converted: {convertedLeadsCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
          <div className="flex items-center justify-between text-[#ab3100]">
            <span className="text-[12px] font-bold">Pending Review (BDE)</span>
            <span className="material-symbols-outlined text-[20px]">pending_actions</span>
          </div>
          <p className="text-2xl font-bold text-[#ab3100] mt-1">{pendingCount}</p>
          <button
            onClick={() => onNavigateTab('moderation')}
            className="text-[11px] text-[#ab3100] hover:underline font-bold mt-1.5 flex items-center gap-0.5"
          >
            <span>Review & Approve</span>
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
          <div className="flex items-center justify-between text-green-700">
            <span className="text-[12px] font-bold">Total Revenue Collected</span>
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </div>
          <p className="text-2xl font-bold text-green-700 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-[#5a4139] mt-1.5 font-medium">
            Paid Users: {payingUsersCount} • ARPU: ₹{arpu}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
          <div className="flex items-center justify-between text-[#6e3900]">
            <span className="text-[12px] font-bold">Active BDE Field Force</span>
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </div>
          <p className="text-2xl font-bold text-[#1f1b14] mt-1">{employees.length}</p>
          <p className="text-[11px] text-[#5a4139] mt-1.5 font-medium">
            BDE Sourced Profiles: {bdeCount} ({Math.round((bdeCount / (totalUsers || 1)) * 100)}%)
          </p>
        </div>
      </div>

      {/* Plan Breakdown & Revenue Distribution */}
      <div className="bg-white p-5 rounded-2xl border border-[#e3bfb4]/60 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[16px] text-[#1f1b14]">Revenue & Tier Breakdown</h3>
            <p className="text-[12px] text-[#5a4139]">Subscription distribution and aggregate earnings</p>
          </div>
          <button
            onClick={() => onNavigateTab('accounts')}
            className="text-[12px] font-bold text-[#ab3100] bg-[#fff0eb] hover:bg-[#ffdcc3] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">receipt_long</span>
            <span>View Accounts Module</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-gray-700">Silver Tier (₹1,499)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-800">15 Credits</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-2">{silverCount} Users</p>
            <p className="text-[11px] text-gray-600 mt-0.5">Revenue: ₹{(silverCount * 1499).toLocaleString('en-IN')}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#fff9ed] border border-[#f4cf75]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#8e4b00]">Gold Tier (₹2,999)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdcc3] text-[#8e4b00]">40 Credits</span>
            </div>
            <p className="text-xl font-bold text-[#8e4b00] mt-2">{goldCount} Users</p>
            <p className="text-[11px] text-[#5a4139] mt-0.5">Revenue: ₹{(goldCount * 2999).toLocaleString('en-IN')}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#fdf2e9] border border-[#e3bfb4]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#ab3100]">Platinum VIP (₹5,999)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ab3100] text-white">100 + RM Assist</span>
            </div>
            <p className="text-xl font-bold text-[#ab3100] mt-2">{platinumCount} Users</p>
            <p className="text-[11px] text-[#5a4139] mt-0.5">Revenue: ₹{(platinumCount * 5999).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* CORE ENTERPRISE FEATURE: Abandoned / Incomplete Registration Leads Table */}
      <div className="bg-white rounded-2xl border-2 border-amber-500/50 shadow-sm overflow-hidden">
        {/* Table Header with Stats and Excel Export */}
        <div className="p-4 bg-gradient-to-r from-[#3e2723] via-[#4e342e] to-[#271a13] text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">contact_support</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[16px] text-white font-['Noto_Sans']">
                  Incomplete Registration Leads (Abandoned Form Tracker)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-black">
                  Sales & Marketing Pipeline ({filteredAbandonedLeads.length})
                </span>
              </div>
              <p className="text-[12px] text-amber-100/90 mt-0.5">
                Visitors who began registration or requested assistance but dropped off before submitting. Contact immediately to onboard.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={handleExportAbandonedLeads}
              className="px-3.5 py-2 bg-[#107c41] hover:bg-[#0c6233] text-white text-[12px] font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 active:scale-95"
              title="Download Leads to Excel / CSV"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
              <span>Export Leads Excel</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3.5 bg-amber-50/40 border-b border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-[12px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#5a4139]">Status Filter:</span>
            <div className="flex items-center bg-white p-1 rounded-lg border border-[#e3bfb4]">
              <button
                onClick={() => setLeadStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  leadStatusFilter === 'all'
                    ? 'bg-[#ab3100] text-white shadow-xs'
                    : 'text-[#5a4139] hover:bg-gray-100'
                }`}
              >
                All Leads ({abandonedLeads.length})
              </button>
              <button
                onClick={() => setLeadStatusFilter('pending_callback')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  leadStatusFilter === 'pending_callback'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                Pending Callback ({pendingLeadsCount})
              </button>
              <button
                onClick={() => setLeadStatusFilter('in_touch')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  leadStatusFilter === 'in_touch'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-900 hover:bg-blue-100'
                }`}
              >
                In Touch ({inTouchLeadsCount})
              </button>
              <button
                onClick={() => setLeadStatusFilter('converted')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  leadStatusFilter === 'converted'
                    ? 'bg-green-700 text-white shadow-xs'
                    : 'text-green-900 hover:bg-green-100'
                }`}
              >
                Converted ({convertedLeadsCount})
              </button>
            </div>
          </div>

          <div className="relative min-w-[220px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, phone, district, drop-off stage..."
              value={leadSearchTerm}
              onChange={(e) => setLeadSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#e3bfb4] bg-white text-[#1f1b14] text-[12px] outline-none"
            />
          </div>
        </div>

        {/* Abandoned Leads Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-[#f9f3eb] text-[#5a4139] border-b border-[#e3bfb4]/60 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Candidate / Guardian</th>
                <th className="py-3 px-3">Contact (Phone & Email)</th>
                <th className="py-3 px-3">District & Type</th>
                <th className="py-3 px-3">Drop-off Stage</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Assigned BDE</th>
                <th className="py-3 px-3 text-center">Follow-up Status</th>
                <th className="py-3 px-3 text-center">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {filteredAbandonedLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    <span className="material-symbols-outlined text-[36px] text-gray-300 block mb-1">
                      inbox
                    </span>
                    No incomplete registration leads found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredAbandonedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-amber-50/30 transition-colors">
                    {/* Candidate / Guardian Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ${
                          lead.gender === 'bride' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {lead.gender === 'bride' ? '👰' : '🤵'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-[13px]">{lead.name}</p>
                          <span className="text-[10px] text-gray-500 font-mono">ID: {lead.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Phone & Email */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <a
                          href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                          className="font-mono font-bold text-[#ab3100] hover:underline flex items-center gap-1"
                          title="Direct Call"
                        >
                          <span className="material-symbols-outlined text-[14px]">call</span>
                          <span>{lead.phone}</span>
                        </a>
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-[11px] text-gray-600 hover:text-[#ab3100] flex items-center gap-1 font-mono truncate max-w-[170px]"
                            title={lead.email}
                          >
                            <span className="material-symbols-outlined text-[13px]">mail</span>
                            <span className="truncate">{lead.email}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">No email provided</span>
                        )}
                      </div>
                    </td>

                    {/* District & Gender */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        {lead.district}
                      </span>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {lead.gender === 'bride' ? 'Bride' : 'Groom'}
                      </p>
                    </td>

                    {/* Stage Left */}
                    <td className="py-3 px-3">
                      <div className="max-w-[200px]">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 inline-block">
                          ⚠️ {lead.abandonedStage}
                        </span>
                        {lead.notes && (
                          <p className="text-[10px] text-gray-500 mt-0.5 truncate" title={lead.notes}>
                            {lead.notes}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 text-gray-600 text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-gray-400">schedule</span>
                        <span>{lead.timestamp}</span>
                      </div>
                    </td>

                    {/* Assigned BDE */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[#ab3100] text-[10px] bg-[#ffdcc3] px-1.5 py-0.5 rounded">
                        {lead.assignedBde || 'BDM-UP-1042'}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-3 text-center">
                      <select
                        value={lead.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as any;
                          onUpdateLeadStatus?.(lead.id, newStatus);
                          onToast(`Lead (${lead.name}) status updated to: ${newStatus}`);
                        }}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                          lead.status === 'pending_callback'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : lead.status === 'in_touch'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-green-100 text-green-900 border-green-300'
                        }`}
                      >
                        <option value="pending_callback">⏳ Pending Callback</option>
                        <option value="in_touch">📞 In Touch</option>
                        <option value="converted">✅ Converted</option>
                      </select>
                    </td>

                    {/* Quick Contact Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                          className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-colors"
                          title="Direct Call"
                        >
                          <span className="material-symbols-outlined text-[16px]">call</span>
                        </a>

                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.name}, we noticed you started registration on Shubh Bandhan Matrimony. Can our onboarding advisor assist you with completing your profile?`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          title="Send WhatsApp Message"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                        </a>

                        <button
                          onClick={() => {
                            onUpdateLeadStatus?.(lead.id, 'converted');
                            onToast(`Lead ${lead.name} successfully marked as onboarded! 🎉`);
                          }}
                          className="p-1.5 rounded-lg bg-[#fff0eb] hover:bg-[#ffdcc3] text-[#ab3100] border border-[#e3bfb4] transition-colors"
                          title="Mark as Onboarded"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Categorised & Filterable Table */}
      <div className="bg-white rounded-2xl border border-[#e3bfb4]/70 shadow-xs overflow-hidden">
        {/* Table Top Controls & Excel Export Button */}
        <div className="p-4 border-b border-[#e3bfb4]/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-[16px] text-[#1f1b14]">
              Candidate User Directory (Categorized & Filterable)
            </h3>
            <p className="text-[12px] text-[#5a4139]">
              Showing: {filteredUsers.length} / {totalUsers} profiles
            </p>
          </div>

          {/* Export to Excel Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportUsers}
              className="px-3.5 py-2 bg-[#107c41] hover:bg-[#0c6233] text-white text-[12px] font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 active:scale-95"
              title="Download Data to Microsoft Excel / CSV"
            >
              <span className="material-symbols-outlined text-[17px]">table_view</span>
              <span>Export to Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3.5 bg-[#fdfaf7] border-b border-[#e3bfb4]/40 flex flex-wrap items-center gap-2.5 text-[12px]">
          {/* Category Tabs */}
          <div className="flex items-center bg-white p-1 rounded-lg border border-[#e3bfb4]/60">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                categoryFilter === 'all' ? 'bg-[#ab3100] text-white shadow-xs' : 'text-[#5a4139] hover:bg-gray-100'
              }`}
            >
              All ({totalUsers})
            </button>
            <button
              onClick={() => setCategoryFilter('brides')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                categoryFilter === 'brides' ? 'bg-pink-700 text-white shadow-xs' : 'text-[#5a4139] hover:bg-gray-100'
              }`}
            >
              Brides ({bridesCount})
            </button>
            <button
              onClick={() => setCategoryFilter('grooms')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                categoryFilter === 'grooms' ? 'bg-blue-700 text-white shadow-xs' : 'text-[#5a4139] hover:bg-gray-100'
              }`}
            >
              Grooms ({groomsCount})
            </button>
            <button
              onClick={() => setCategoryFilter('pending')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                categoryFilter === 'pending' ? 'bg-[#ab3100] text-white shadow-xs' : 'text-[#ab3100] hover:bg-[#ffdcc3]'
              }`}
            >
              Pending Review ({pendingCount})
            </button>
            <button
              onClick={() => setCategoryFilter('bde')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                categoryFilter === 'bde' ? 'bg-[#8e4b00] text-white shadow-xs' : 'text-[#5a4139] hover:bg-gray-100'
              }`}
            >
              BDE Sourced ({bdeCount})
            </button>
          </div>

          {/* District Filter */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#e3bfb4] bg-white text-[#1f1b14] font-medium text-[12px] outline-none"
          >
            <option value="all">All Districts</option>
            <option value="Varanasi">Varanasi</option>
            <option value="Ayodhya">Ayodhya</option>
            <option value="Gorakhpur">Gorakhpur</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Sultanpur">Sultanpur</option>
            <option value="Basti">Basti</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, code, phone or BDE code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#e3bfb4] bg-white text-[#1f1b14] text-[12px] outline-none focus:ring-1 focus:ring-[#ab3100]"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-[#f6eee3] text-[#5a4139] border-b border-[#e3bfb4]/50 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Profile Code & Name</th>
                <th className="py-3 px-3">Gender / Age</th>
                <th className="py-3 px-3">Community & District</th>
                <th className="py-3 px-3">BDE Reference</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Revenue Generated</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3bfb4]/30">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5a4139]">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#fff9f5] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.photos[0] || 'https://via.placeholder.com/80'}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#e3bfb4]"
                        />
                        <div>
                          <p className="font-bold text-[#1f1b14]">{user.name}</p>
                          <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1 py-0.2 rounded">
                            {user.code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span
                          className={`font-semibold text-[11px] ${
                            user.gender === 'groom' ? 'text-blue-700' : 'text-pink-700'
                          }`}
                        >
                          {user.gender === 'groom' ? 'Groom' : 'Bride'}
                        </span>
                        <span className="text-gray-600">{user.age} yrs • {user.height.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <p className="text-gray-900 font-medium truncate max-w-[150px]">{user.community}</p>
                        <p className="text-gray-500 text-[11px]">{user.nativeDistrict}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {user.bdeCode ? (
                        <div>
                          <span className="font-mono font-bold text-[#ab3100] text-[11px] bg-[#ffdcc3] px-1.5 py-0.5 rounded">
                            {user.bdeCode}
                          </span>
                          <p className="text-[10px] text-gray-500 mt-0.5">{user.bdeEmployeeName || 'BDE Staff'}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Organic / Direct</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {user.approvalStatus === 'pending' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ffdcc3] text-[#ab3100] inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ab3100] animate-pulse"></span>
                          Pending Review
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                          Live Approved
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-mono font-bold text-gray-900">
                        ₹{(user.revenueGenerated || 0).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-500">
                        {user.planSubscribed || 'FREE'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onNavigateTab('moderation')}
                        className="p-1 rounded text-[#ab3100] hover:bg-[#ffdcc3] transition-colors"
                        title="Open in Moderation Module"
                      >
                        <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
