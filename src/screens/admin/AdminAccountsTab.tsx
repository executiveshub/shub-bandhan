import React, { useState, useMemo } from 'react';
import { TransactionRecord, SubscriptionTier, MonthlyPayrollRecord } from '../../types/matrimony';
import { exportToCsv } from '../../utils/exportToExcel';

interface AdminAccountsTabProps {
  transactions: TransactionRecord[];
  payrollRecords: MonthlyPayrollRecord[];
  onAddTransaction: (txn: TransactionRecord) => void;
  onUpdateTxnStatus: (txnId: string, status: 'success' | 'pending' | 'refunded') => void;
  onUpdatePayrollStatus: (payrollId: string, status: 'disbursed' | 'approved' | 'submitted_by_hr', utrRef?: string) => void;
  onToast: (msg: string) => void;
}

export const AdminAccountsTab: React.FC<AdminAccountsTabProps> = ({
  transactions,
  payrollRecords,
  onAddTransaction,
  onUpdateTxnStatus,
  onUpdatePayrollStatus,
  onToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'salaries'>('transactions');

  // Transactions Tab States
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'pending' | 'refunded'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [discrepancyOnly, setDiscrepancyOnly] = useState(false);
  const [activeReceiptTxn, setActiveReceiptTxn] = useState<TransactionRecord | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Salaries Tab States
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [salarySearchTerm, setSalarySearchTerm] = useState('');
  const [salaryStatusFilter, setSalaryStatusFilter] = useState<string>('all');
  const [disbursingPayroll, setDisbursingPayroll] = useState<MonthlyPayrollRecord | null>(null);
  const [disburseUtr, setDisburseUtr] = useState('');
  const [disburseMode, setDisburseMode] = useState('Bank Transfer NEFT');

  // Manual Txn Form
  const [manualUser, setManualUser] = useState('');
  const [manualCandidate, setManualCandidate] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualPlan, setManualPlan] = useState<SubscriptionTier>('gold');
  const [manualAmount, setManualAmount] = useState(2999);
  const [manualBde, setManualBde] = useState('BDM-UP-1042');
  const [manualMethod, setManualMethod] = useState('BDE Field Cash Receipt');

  // Filtered Transactions
  const filteredTxns = useMemo(() => {
    return transactions.filter((t) => {
      if (discrepancyOnly && t.status !== 'pending' && !t.gatewayRef.includes('DISCREPANCY')) {
        return false;
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          t.txnId.toLowerCase().includes(q) ||
          t.gatewayRef.toLowerCase().includes(q) ||
          t.userName.toLowerCase().includes(q) ||
          t.candidateName.toLowerCase().includes(q) ||
          t.userPhone.includes(q) ||
          (t.bdeCode && t.bdeCode.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [transactions, statusFilter, searchTerm, discrepancyOnly]);

  // Filtered Payroll Records
  const filteredPayroll = useMemo(() => {
    return payrollRecords.filter((p) => {
      if (selectedMonth !== 'all' && !p.monthYear.includes(selectedMonth)) return false;
      if (salaryStatusFilter !== 'all' && p.status !== salaryStatusFilter) return false;
      if (salarySearchTerm.trim()) {
        const q = salarySearchTerm.toLowerCase();
        const match =
          p.employeeName.toLowerCase().includes(q) ||
          p.employeeId.toLowerCase().includes(q) ||
          p.branch.toLowerCase().includes(q) ||
          (p.utrRef && p.utrRef.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [payrollRecords, selectedMonth, salaryStatusFilter, salarySearchTerm]);

  const totalSuccessAmount = transactions
    .filter((t) => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  // Salaries stats
  const totalSalariesDisbursed = payrollRecords
    .filter((p) => p.status === 'disbursed')
    .reduce((sum, p) => sum + p.netPayableAmount, 0);

  const pendingSalariesAmount = payrollRecords
    .filter((p) => p.status !== 'disbursed')
    .reduce((sum, p) => sum + p.netPayableAmount, 0);

  const handleExportTxns = () => {
    const exportData = filteredTxns.map((t) => ({
      'Txn ID': t.txnId,
      'Date & Time': t.timestamp,
      'Payer Name': t.userName,
      'Phone': t.userPhone,
      'Candidate': t.candidateName,
      'Plan': t.planName,
      'Amount': `₹ ${t.amount}`,
      'Payment Method': t.paymentMethod,
      'Gateway Ref': t.gatewayRef,
      'BDE Code': t.bdeCode || 'Organic',
      'Status': t.status,
    }));
    exportToCsv(`ShubhBandhan_Transactions`, exportData);
    onToast(`Transaction ledger exported to Excel (${filteredTxns.length} records) 📊`);
  };

  const handleExportSalaries = () => {
    const exportData = filteredPayroll.map((p) => ({
      'Month': p.monthYear,
      'Employee ID': p.employeeId,
      'Name': p.employeeName,
      'Role': p.role,
      'Branch': p.branch,
      'Base Salary': `₹ ${p.baseSalary}`,
      'Total Working Days': p.totalWorkingDays,
      'Payable Days': p.payableDays,
      'Incentives': `₹ ${p.incentives}`,
      'Deductions': `₹ ${p.deductions}`,
      'Net Payable Amount': `₹ ${p.netPayableAmount}`,
      'Status': p.status === 'disbursed' ? 'Disbursed' : 'Pending Accountant Action',
      'Bank UTR / Ref': p.utrRef || '—',
      'Disbursed Date': p.disbursedDate || '—',
    }));
    exportToCsv(`ShubhBandhan_Monthly_Salaries`, exportData);
    onToast(`Monthly employee salaries exported to Excel! 💰`);
  };

  const handleCreateManualTxn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUser.trim() || !manualCandidate.trim()) {
      onToast('Please enter payer and candidate names');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleTimeString('en-US')}`;
    const codeNum = Math.floor(1000 + Math.random() * 9000);

    const newTxn: TransactionRecord = {
      id: `txn-manual-${Date.now()}`,
      txnId: `TXN-${now.getFullYear()}${codeNum}`,
      timestamp: formattedDate,
      userId: `user-${Date.now()}`,
      userName: manualUser.trim(),
      userPhone: manualPhone.trim() || '+91 94150 00000',
      candidateName: manualCandidate.trim(),
      planId: manualPlan,
      planName: manualPlan === 'platinum' ? 'Platinum VIP (₹5,999)' : manualPlan === 'gold' ? 'Gold Royal (₹2,999)' : 'Silver Base (₹1,499)',
      amount: Number(manualAmount),
      paymentMethod: manualMethod,
      status: 'success',
      bdeCode: manualBde.trim() || 'BDM-UP-1042',
      gatewayRef: `MANUAL_RCPT_${codeNum}`,
    };

    onAddTransaction(newTxn);
    setIsManualModalOpen(false);
    onToast(`Offline transaction ${newTxn.txnId} (₹${newTxn.amount}) recorded!`);
  };

  const handleConfirmDisbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disbursingPayroll) return;

    const utr = disburseUtr.trim() || `UTR${Date.now().toString().slice(-8)}`;
    onUpdatePayrollStatus(disbursingPayroll.id, 'disbursed', utr);
    setDisbursingPayroll(null);
    setDisburseUtr('');
    onToast(`Salary disbursed! ₹${disbursingPayroll.netPayableAmount.toLocaleString('en-IN')} paid to ${disbursingPayroll.employeeName} via Bank UTR: ${utr} ✅`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#e3bfb4]/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#ab3100] bg-[#ffdcc3] px-2 py-0.5 rounded">
            Accounts, Financial Records & Payroll Module
          </span>
          <h2 className="text-xl font-bold text-[#1f1b14] mt-1 font-['Noto_Sans']">
            Accounts, Revenue Ledger & Monthly Salaries Record
          </h2>
          <p className="text-[12px] text-[#5a4139] mt-0.5">
            Client subscription receipts, discrepancy tracing & month-end employee salaries records for administration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'transactions' ? (
            <>
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="px-3.5 py-2 bg-[#ab3100] hover:bg-[#852400] text-white text-[12px] font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-[17px]">add_card</span>
                <span>+ Record Receipt</span>
              </button>
              <button
                onClick={handleExportTxns}
                className="px-3.5 py-2 bg-[#107c41] hover:bg-[#0c6233] text-white text-[12px] font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">table_view</span>
                <span>Excel</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleExportSalaries}
              className="px-3.5 py-2 bg-[#107c41] hover:bg-[#0c6233] text-white text-[12px] font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">table_view</span>
              <span>Export Salaries to Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs Switcher: User Revenue vs Employee Salaries */}
      <div className="flex items-center gap-2 p-1.5 bg-[#fdfaf7] rounded-xl border border-[#e3bfb4]/60 w-fit text-[12px]">
        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'transactions'
              ? 'bg-[#ab3100] text-white shadow-xs'
              : 'text-[#5a4139] hover:bg-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">receipt_long</span>
          <span>1. Customer Subscription Revenue & Tracing ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('salaries')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'salaries'
              ? 'bg-[#ab3100] text-white shadow-xs'
              : 'text-[#5a4139] hover:bg-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">payments</span>
          <span>2. Employee Monthly Salaries Record ({payrollRecords.length})</span>
          {payrollRecords.some((p) => p.status !== 'disbursed') && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* SUB-TAB 1: TRANSACTIONS & REVENUE */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-6">
          {/* Metric Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
              <span className="text-[12px] font-bold text-green-700">Total Collections (Successful)</span>
              <p className="text-2xl font-bold text-green-700 mt-1">₹{totalSuccessAmount.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-[#5a4139] mt-1 font-medium">
                {transactions.filter((t) => t.status === 'success').length} successful transactions
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
              <span className="text-[12px] font-bold text-amber-700">Pending / Discrepancy Amount</span>
              <p className="text-2xl font-bold text-amber-700 mt-1">₹{pendingAmount.toLocaleString('en-IN')}</p>
              <button
                onClick={() => {
                  setDiscrepancyOnly(true);
                  setStatusFilter('pending');
                }}
                className="text-[11px] font-bold text-amber-800 hover:underline mt-1 flex items-center gap-1"
              >
                <span>Trace Discrepancies ({transactions.filter((t) => t.status === 'pending').length})</span>
                <span className="material-symbols-outlined text-[13px]">search</span>
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
              <span className="text-[12px] font-bold text-[#8e4b00]">BDE Attributed Revenue</span>
              <p className="text-2xl font-bold text-[#8e4b00] mt-1">
                ₹{transactions.filter((t) => Boolean(t.bdeCode) && t.status === 'success').reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#5a4139] mt-1 font-medium">Field force revenue contribution</p>
            </div>
          </div>

          {/* Discrepancy Tracing Box */}
          <div className="bg-[#fff9f4] p-4 rounded-2xl border border-[#e3bfb4] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ab3100] text-[20px]">manage_search</span>
                <h3 className="font-bold text-[14px] text-[#1f1b14]">
                  Transaction Discrepancy Tracing Engine
                </h3>
              </div>
              <button
                onClick={() => {
                  setDiscrepancyOnly(!discrepancyOnly);
                  if (!discrepancyOnly) setStatusFilter('pending');
                  else setStatusFilter('all');
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                  discrepancyOnly ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">flag</span>
                <span>{discrepancyOnly ? 'Discrepancy Mode Active' : 'Filter Discrepancies'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 text-[12px]">
              <div className="relative flex-1 w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Trace by Txn ID, Gateway Ref, Phone, or BDE Code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e3bfb4] bg-white text-[#1f1b14] outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-[#e3bfb4] bg-white text-[#1f1b14] font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending / Discrepancy</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-[#e3bfb4]/70 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e3bfb4]/40 flex items-center justify-between">
              <h4 className="font-bold text-[15px] text-[#1f1b14]">
                Financial Transaction Ledger ({filteredTxns.length} records)
              </h4>
              <span className="text-[11px] text-gray-500">Recorded with exact timestamps & gateway refs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#f6eee3] text-[#5a4139] border-b border-[#e3bfb4]/50 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3">Txn ID / Timestamp</th>
                    <th className="py-3 px-3">Payer / Candidate</th>
                    <th className="py-3 px-3">Plan & Method</th>
                    <th className="py-3 px-3">Gateway Ref</th>
                    <th className="py-3 px-3">BDE Code</th>
                    <th className="py-3 px-3 text-right">Amount (₹)</th>
                    <th className="py-3 px-3 text-center">Status / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3bfb4]/30">
                  {filteredTxns.map((t) => (
                    <tr
                      key={t.id}
                      className={`hover:bg-[#fff9f5] ${t.status === 'pending' ? 'bg-[#fff5ee]' : ''}`}
                    >
                      <td className="py-3 px-3">
                        <p className="font-mono font-bold text-[#ab3100]">{t.txnId}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{t.timestamp}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-gray-900">{t.userName}</p>
                        <p className="text-[11px] text-gray-600">{t.candidateName} • {t.userPhone}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-gray-900">{t.planName}</p>
                        <p className="text-[11px] text-gray-500">{t.paymentMethod}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded border">
                          {t.gatewayRef}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] font-bold text-[#8e4b00] bg-[#ffdcc3] px-1.5 py-0.5 rounded">
                          {t.bdeCode || 'Organic'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono font-bold text-[14px] text-gray-900">
                          ₹{t.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {t.status === 'success' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                              Success
                            </span>
                          )}
                          {t.status === 'pending' && (
                            <button
                              onClick={() => {
                                onUpdateTxnStatus(t.id, 'success');
                                onToast(`Discrepancy resolved: ${t.txnId} marked as successful!`);
                              }}
                              className="px-2 py-0.5 rounded bg-green-600 text-white text-[10px] font-bold"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => setActiveReceiptTxn(t)}
                            className="p-1 text-gray-500 hover:text-[#ab3100]"
                            title="View Receipt"
                          >
                            <span className="material-symbols-outlined text-[17px]">receipt</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MONTHLY SALARIES / PAYROLL RECORDS */}
      {activeSubTab === 'salaries' && (
        <div className="space-y-6">
          {/* Payroll KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
              <span className="text-[12px] font-bold text-green-700">Total Disbursed Salaries</span>
              <p className="text-2xl font-bold text-green-700 mt-1">₹{totalSalariesDisbursed.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-[#5a4139] mt-1 font-medium">Released via Bank NEFT / IMPS</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
              <span className="text-[12px] font-bold text-amber-700">Pending Disbursement</span>
              <p className="text-2xl font-bold text-amber-700 mt-1">₹{pendingSalariesAmount.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-[#5a4139] mt-1 font-medium">
                {payrollRecords.filter((p) => p.status !== 'disbursed').length} employee salaries awaiting release
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
              <span className="text-[12px] font-bold text-[#8e4b00]">HR Attendance Audit Status</span>
              <p className="text-2xl font-bold text-[#1f1b14] mt-1">100% Verified</p>
              <p className="text-[11px] text-[#5a4139] mt-1 font-medium">Payable days authenticated by HR</p>
            </div>
          </div>

          {/* Month & Filter Controls */}
          <div className="bg-white p-3.5 rounded-xl border border-[#e3bfb4]/60 shadow-xs flex flex-wrap items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#5a4139]">Payroll Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2.5 py-1.5 border border-[#e3bfb4] rounded-lg bg-white font-medium"
              >
                <option value="all">All Months</option>
                <option value="October">October 2026 (Current Month)</option>
                <option value="September">September 2026 (Previous Month)</option>
              </select>

              <select
                value={salaryStatusFilter}
                onChange={(e) => setSalaryStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-[#e3bfb4] rounded-lg bg-white font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="disbursed">Disbursed (Paid)</option>
                <option value="submitted_by_hr">Submitted by HR (Pending)</option>
              </select>
            </div>

            <div className="relative min-w-[220px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search staff name, ID, branch or UTR..."
                value={salarySearchTerm}
                onChange={(e) => setSalarySearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#e3bfb4] bg-white text-[12px] outline-none"
              />
            </div>
          </div>

          {/* Monthly Payroll Records Table */}
          <div className="bg-white rounded-2xl border border-[#e3bfb4]/70 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e3bfb4]/40 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[15px] text-[#1f1b14]">
                  Monthly Employee Salaries & Disbursement Records
                </h4>
                <p className="text-[11px] text-[#5a4139]">
                  Every month's salary records are preserved here; administrators and accountants can retrieve them whenever needed.
                </p>
              </div>
              <span className="text-[11px] font-bold text-gray-500">
                Total Records: {filteredPayroll.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#f6eee3] text-[#5a4139] border-b border-[#e3bfb4]/50 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3">Month / Passport Photo</th>
                    <th className="py-3 px-3">Employee Name & Role</th>
                    <th className="py-3 px-3 text-right">Base Salary</th>
                    <th className="py-3 px-3 text-center">Payable Days / Total</th>
                    <th className="py-3 px-3 text-right">Incentives / Deductions</th>
                    <th className="py-3 px-3 text-right font-bold">Net Payable Amount</th>
                    <th className="py-3 px-3">Payment Status & UTR</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3bfb4]/30">
                  {filteredPayroll.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        No salary records found for this filter. Submit monthly payroll from HR module.
                      </td>
                    </tr>
                  ) : (
                    filteredPayroll.map((pay) => (
                      <tr key={pay.id} className="hover:bg-[#fff9f5]">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={pay.photoUrl}
                              alt={pay.employeeName}
                              className="w-10 h-12 rounded object-cover border-2 border-gray-200 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-[#ab3100] block">{pay.monthYear}</span>
                              <span className="text-[10px] text-gray-500 font-mono">{pay.employeeId}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-bold text-gray-900">{pay.employeeName}</p>
                          <span className="text-[11px] text-gray-600">{pay.role} • {pay.branch}</span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-medium">
                          ₹{pay.baseSalary.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                            {pay.payableDays} / {pay.totalWorkingDays} days
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="text-green-700 block font-mono">+₹{pay.incentives}</span>
                          {pay.deductions > 0 && (
                            <span className="text-red-600 block font-mono text-[10px]">-₹{pay.deductions}</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="font-mono font-bold text-[14px] text-emerald-900 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 inline-block">
                            ₹{pay.netPayableAmount.toLocaleString('en-IN')}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {pay.status === 'disbursed' ? (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                                Disbursed (Paid) ✓
                              </span>
                              <p className="font-mono text-[10px] text-gray-600 mt-0.5">
                                UTR: {pay.utrRef}
                              </p>
                              <p className="text-[9px] text-gray-400">{pay.disbursedDate}</p>
                            </div>
                          ) : (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                                Submitted by HR (Pending)
                              </span>
                              <p className="text-[10px] text-gray-500 mt-0.5">Awaiting release</p>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {pay.status !== 'disbursed' ? (
                            <button
                              onClick={() => {
                                setDisbursingPayroll(pay);
                                setDisburseUtr(`HDFC${Date.now().toString().slice(-8)}`);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold shadow-xs transition-colors"
                            >
                              Release Salary
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                onToast(`${pay.employeeName}'s salary disbursement receipt UTR: ${pay.utrRef}`);
                              }}
                              className="p-1 text-gray-500 hover:text-[#ab3100]"
                              title="Disbursement Voucher"
                            >
                              <span className="material-symbols-outlined text-[18px]">receipt</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DISBURSE SALARY WITH UTR MODAL */}
      {disbursingPayroll && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-[17px] text-[#1f1b14]">
                Disburse Salary & Enter Bank UTR
              </h3>
              <button onClick={() => setDisbursingPayroll(null)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-[#fff8f3] p-3.5 rounded-xl border border-[#e3bfb4] text-[12px] space-y-1">
              <div className="flex items-center gap-3">
                <img
                  src={disbursingPayroll.photoUrl}
                  alt={disbursingPayroll.employeeName}
                  className="w-12 h-14 rounded object-cover border"
                />
                <div>
                  <p className="font-bold text-[14px] text-gray-900">{disbursingPayroll.employeeName}</p>
                  <p className="text-gray-600 font-mono">{disbursingPayroll.employeeId} • {disbursingPayroll.role}</p>
                  <p className="text-[11px] text-[#ab3100] font-bold">{disbursingPayroll.monthYear}</p>
                </div>
              </div>

              <div className="pt-2 border-t mt-2 flex justify-between font-bold text-[14px]">
                <span>Net Payable Amount:</span>
                <span className="text-emerald-800 font-mono">₹{disbursingPayroll.netPayableAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmDisbursement} className="space-y-3 text-[12px]">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Payment Mode:</label>
                <select
                  value={disburseMode}
                  onChange={(e) => setDisburseMode(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="Bank Transfer NEFT">Bank Transfer (NEFT)</option>
                  <option value="Bank Transfer IMPS">Bank Transfer (IMPS)</option>
                  <option value="Bank RTGS">Bank Transfer (RTGS)</option>
                  <option value="UPI Corporate Payout">UPI Corporate Payout</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Bank UTR / Transaction Reference *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC202610060982"
                  value={disburseUtr}
                  onChange={(e) => setDisburseUtr(e.target.value)}
                  className="w-full p-2 border rounded-lg font-mono text-[13px] font-bold text-emerald-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setDisbursingPayroll(null)}
                  className="px-4 py-2 border rounded-xl text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  Confirm & Release Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Receipt Modal */}
      {activeReceiptTxn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#e3bfb4]">
            <div className="text-center pb-3 border-b border-gray-200">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#ab3100]">
                Shubh Bandhan India • Official Payment Receipt
              </span>
              <h3 className="font-bold text-[18px] text-gray-900 mt-1">Membership Subscription Receipt</h3>
              <p className="font-mono text-[12px] text-gray-500 mt-0.5">{activeReceiptTxn.txnId}</p>
            </div>

            <div className="text-[12px] space-y-2">
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-gray-500">Date & Time:</span>
                <span className="font-medium text-gray-900">{activeReceiptTxn.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-gray-500">Guardian / Payer:</span>
                <span className="font-bold text-gray-900">{activeReceiptTxn.userName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-gray-500">Candidate:</span>
                <span className="font-medium text-gray-900">{activeReceiptTxn.candidateName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-gray-500">Selected Plan:</span>
                <span className="font-bold text-[#ab3100]">{activeReceiptTxn.planName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-gray-500">Gateway Ref:</span>
                <span className="font-mono text-gray-800">{activeReceiptTxn.gatewayRef}</span>
              </div>
              <div className="flex justify-between py-2 text-[14px] font-bold bg-[#fff8f3] px-2 rounded-lg">
                <span>Total Received Amount:</span>
                <span className="text-green-700">₹{activeReceiptTxn.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveReceiptTxn(null)}
                className="px-4 py-2 border rounded-xl text-gray-700 text-[12px] font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  onToast('Receipt print / download window opened');
                }}
                className="px-4 py-2 bg-[#ab3100] text-white rounded-xl text-[12px] font-bold"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Txn Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-[17px] text-[#1f1b14]">
                + Record Offline Cash / Field Receipt
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateManualTxn} className="space-y-3 text-[12px]">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Guardian / Payer Name:</label>
                <input
                  type="text"
                  required
                  value={manualUser}
                  onChange={(e) => setManualUser(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Candidate Name:</label>
                <input
                  type="text"
                  required
                  value={manualCandidate}
                  onChange={(e) => setManualCandidate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Membership Plan:</label>
                  <select
                    value={manualPlan}
                    onChange={(e) => {
                      const p = e.target.value as SubscriptionTier;
                      setManualPlan(p);
                      if (p === 'silver') setManualAmount(1499);
                      if (p === 'gold') setManualAmount(2999);
                      if (p === 'platinum') setManualAmount(5999);
                    }}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="silver">Silver (₹1,499)</option>
                    <option value="gold">Gold (₹2,999)</option>
                    <option value="platinum">Platinum (₹5,999)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Amount (₹):</label>
                  <input
                    type="number"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ab3100] text-white rounded-xl font-bold"
                >
                  Save Receipt & Issue Txn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
