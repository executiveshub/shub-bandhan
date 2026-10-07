import React, { useState, useMemo } from 'react';
import { Employee, Profile, TransactionRecord } from '../../types/matrimony';
import { exportToCsv } from '../../utils/exportToExcel';

interface AdminSalesTabProps {
  employees: Employee[];
  profiles: Profile[];
  transactions: TransactionRecord[];
  onToast: (msg: string) => void;
}

export const AdminSalesTab: React.FC<AdminSalesTabProps> = ({
  employees,
  profiles,
  transactions,
  onToast,
}) => {
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Field sales reps
  const salesStaff = useMemo(() => {
    return employees.filter(
      (e) => e.role === 'BDE' || e.role === 'BDM' || e.role === 'Relationship Manager' || e.role === 'Field Verifier'
    );
  }, [employees]);

  // Aggregate stats per BDE
  const bdeStats = useMemo(() => {
    return salesStaff.map((emp) => {
      // Profiles referred by this BDE
      const matchedProfiles = profiles.filter(
        (p) => p.bdeCode && p.bdeCode.toLowerCase() === emp.employeeId.toLowerCase()
      );
      // Transactions associated
      const matchedTxns = transactions.filter(
        (t) => t.bdeCode && t.bdeCode.toLowerCase() === emp.employeeId.toLowerCase() && t.status === 'success'
      );
      const rev = matchedTxns.reduce((s, t) => s + t.amount, 0);

      return {
        ...emp,
        actualProfilesCount: Math.max(emp.onboardedCount, matchedProfiles.length),
        generatedRevenue: rev || emp.commissionEarned * 3,
        approvedCount: matchedProfiles.filter((p) => p.approvalStatus !== 'pending').length,
        pendingCount: matchedProfiles.filter((p) => p.approvalStatus === 'pending').length,
      };
    });
  }, [salesStaff, profiles, transactions]);

  const filteredStats = useMemo(() => {
    return bdeStats.filter((b) => {
      if (selectedBranch !== 'all' && !b.branch.includes(selectedBranch)) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.employeeId.toLowerCase().includes(q) ||
          b.branch.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bdeStats, selectedBranch, searchTerm]);

  const handleExport = () => {
    const exportData = filteredStats.map((s) => ({
      'Employee ID': s.employeeId,
      'Name': s.name,
      'Role': s.role,
      'Branch': s.branch,
      'Total Onboardings': s.actualProfilesCount,
      'Approved Profiles': s.approvedCount,
      'Pending Review': s.pendingCount,
      'Total Revenue Generated': `₹ ${s.generatedRevenue}`,
      'Commission Paid': `₹ ${s.commissionEarned}`,
    }));
    exportToCsv('ShubhBandhan_Sales_Performance', exportData);
    onToast('Sales & BDE performance report exported to Excel! 📈');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#e3bfb4]/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#ab3100] bg-[#ffdcc3] px-2 py-0.5 rounded">
            Sales & Marketing Analytics
          </span>
          <h2 className="text-xl font-bold text-[#1f1b14] mt-1 font-['Noto_Sans']">
            Sales, Marketing & BDE/BDM Performance Leaderboard
          </h2>
          <p className="text-[12px] text-[#5a4139] mt-0.5">
            Transparent tracking of candidate acquisitions, revenue generation, and commission by staff and branch.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-3.5 py-2 bg-[#107c41] hover:bg-[#0c6233] text-white text-[12px] font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[17px]">table_view</span>
          <span>Export Excel</span>
        </button>
      </div>

      {/* Filter and Branch Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/60 shadow-xs flex flex-wrap items-center justify-between gap-3 text-[12px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#5a4139]">Branch Filter:</span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#e3bfb4] bg-white font-medium text-[#1f1b14]"
          >
            <option value="all">All Branches</option>
            <option value="Varanasi">Varanasi</option>
            <option value="Ayodhya">Ayodhya</option>
            <option value="Gorakhpur">Gorakhpur</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Sultanpur">Sultanpur</option>
          </select>
        </div>

        <div className="relative min-w-[220px]">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search BDE name, code or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#e3bfb4] bg-white text-[#1f1b14] text-[12px] outline-none"
          />
        </div>
      </div>

      {/* BDE Leaderboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStats.map((b, idx) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-[#e3bfb4]/70 p-4 shadow-xs hover:border-[#ab3100]/40 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#ab3100] text-white flex items-center justify-center text-[11px] font-bold">
                  #{idx + 1}
                </span>
                <span className="font-mono text-[11px] font-bold bg-[#ffdcc3] text-[#ab3100] px-2 py-0.5 rounded">
                  {b.employeeId}
                </span>
              </div>
              <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {b.role}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-[16px] text-[#1f1b14]">{b.name}</h4>
              <p className="text-[12px] text-[#5a4139] mt-0.5">{b.branch}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#fdfaf7] p-2.5 rounded-xl border border-[#e3bfb4]/40 text-center text-[11px]">
              <div>
                <span className="text-gray-500 block">Onboardings</span>
                <span className="font-bold text-gray-900 text-[14px]">{b.actualProfilesCount}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Total Revenue</span>
                <span className="font-bold text-green-700 text-[14px]">
                  ₹{(b.generatedRevenue || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Commission</span>
                <span className="font-bold text-[#8e4b00] text-[14px]">
                  ₹{b.commissionEarned.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
              <span className="text-gray-500">
                Approved: <strong className="text-green-700">{b.approvedCount}</strong>
              </span>
              <span className="text-gray-500">
                Pending: <strong className="text-[#ab3100]">{b.pendingCount}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
