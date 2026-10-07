import React, { useState, useMemo } from 'react';
import { Employee, AttendanceRecord, MonthlyPayrollRecord } from '../../types/matrimony';
import { exportToCsv } from '../../utils/exportToExcel';

interface AdminHrTabProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  onAddAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onSendPayrollToAccounts: (records: MonthlyPayrollRecord[]) => void;
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  onToast: (msg: string) => void;
}

export const AdminHrTab: React.FC<AdminHrTabProps> = ({
  employees,
  attendanceRecords,
  onAddAttendance,
  onUpdateAttendance,
  onSendPayrollToAccounts,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onToast,
}) => {
  const [subView, setSubView] = useState<'employees' | 'attendance'>('employees');

  // Directory Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Attendance Filters
  const [attendanceDate, setAttendanceDate] = useState('2026-10-06');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');
  const [selectedDiscrepancyOnly, setSelectedDiscrepancyOnly] = useState(false);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedEmpForVerify, setSelectedEmpForVerify] = useState<Employee | null>(null);
  const [previewCvEmployee, setPreviewCvEmployee] = useState<Employee | null>(null);
  const [previewPhotoEmp, setPreviewPhotoEmp] = useState<Employee | null>(null);
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState(false);
  const [resolvingDiscrepancyRecord, setResolvingDiscrepancyRecord] = useState<AttendanceRecord | null>(null);

  // Salary & Deduction / Bonus Adjustment State
  const [salaryAdjustments, setSalaryAdjustments] = useState<
    Record<
      string,
      {
        customBaseSalary: number;
        customBonus: number;
        customDeduction: number;
        remarks: string;
      }
    >
  >({});
  const [editingSalaryEmp, setEditingSalaryEmp] = useState<Employee | null>(null);
  const [editSalaryValue, setEditSalaryValue] = useState<number>(30000);
  const [editBonusValue, setEditBonusValue] = useState<number>(0);
  const [editDeductionValue, setEditDeductionValue] = useState<number>(0);
  const [editAdjustmentRemarks, setEditAdjustmentRemarks] = useState<string>('');

  // Mark Attendance Form
  const [attEmpId, setAttEmpId] = useState(employees[0]?.employeeId || '');
  const [attStatus, setAttStatus] = useState<AttendanceRecord['status']>('present');
  const [attCheckIn, setAttCheckIn] = useState('09:15 AM');
  const [attCheckOut, setAttCheckOut] = useState('06:30 PM');
  const [attLocation, setAttLocation] = useState('Varanasi Main Branch');
  const [attNotes, setAttNotes] = useState('');

  // Resolve Discrepancy Form
  const [resolveAction, setResolveAction] = useState<'present' | 'field_duty' | 'leave'>('present');
  const [resolveNotes, setResolveNotes] = useState('HR Resolution: Verified client onboarding field duty');

  // New Employee Form
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<Employee['role']>('BDE');
  const [formBranch, setFormBranch] = useState('Varanasi Main Branch');
  const [formPhone, setFormPhone] = useState('+91 ');
  const [formEmail, setFormEmail] = useState('');
  const [formAadhaar, setFormAadhaar] = useState('');
  const [formSalary, setFormSalary] = useState(30000);
  const [formCvFile, setFormCvFile] = useState('Employee_Updated_CV_2026.pdf');
  const [formPhotoUrl, setFormPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
  const [formTarget, setFormTarget] = useState(40);

  // System ID Generator
  const generateEmployeeId = (role: string, branch: string) => {
    let rolePrefix = 'BDE';
    if (role === 'BDM') rolePrefix = 'BDM';
    else if (role === 'Relationship Manager') rolePrefix = 'RM';
    else if (role === 'Accounts Officer') rolePrefix = 'ACC';
    else if (role === 'HR Manager') rolePrefix = 'HR';
    else if (role === 'Field Verifier') rolePrefix = 'FV';

    let branchPrefix = 'UP';
    const bLower = branch.toLowerCase();
    if (bLower.includes('varanasi') || branch.includes('वाराणसी')) branchPrefix = 'VRN';
    else if (bLower.includes('ayodhya') || branch.includes('अयोध्या')) branchPrefix = 'AYO';
    else if (bLower.includes('gorakhpur') || branch.includes('गोरखपुर')) branchPrefix = 'GKP';
    else if (bLower.includes('lucknow') || branch.includes('लखनऊ')) branchPrefix = 'LKO';
    else if (bLower.includes('sultanpur') || branch.includes('सुल्तानपुर')) branchPrefix = 'SLT';

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `SB-${rolePrefix}-${branchPrefix}-${randomSuffix}`;
  };

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
      if (branchFilter !== 'all') {
        const matchBranch =
          emp.branch.toLowerCase().includes(branchFilter.toLowerCase()) ||
          (branchFilter === 'Varanasi' && emp.branch.includes('वाराणसी')) ||
          (branchFilter === 'Ayodhya' && emp.branch.includes('अयोध्या')) ||
          (branchFilter === 'Gorakhpur' && emp.branch.includes('गोरखपुर')) ||
          (branchFilter === 'Lucknow' && emp.branch.includes('लखनऊ')) ||
          (branchFilter === 'Sultanpur' && emp.branch.includes('सुल्तानपुर'));
        if (!matchBranch) return false;
      }
      if (verificationFilter === 'verified') {
        if (!emp.isAadhaarVerified || !emp.isEmailVerified || !emp.isPhoneVerified) return false;
      }
      if (verificationFilter === 'pending') {
        if (emp.isAadhaarVerified && emp.isEmailVerified && emp.isPhoneVerified) return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          emp.name.toLowerCase().includes(q) ||
          emp.employeeId.toLowerCase().includes(q) ||
          emp.phone.includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.aadhaarNumber.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [employees, roleFilter, branchFilter, verificationFilter, searchTerm]);

  // Filtered Attendance Records
  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      if (attendanceDate && rec.date !== attendanceDate) return false;
      if (attendanceStatusFilter !== 'all' && rec.status !== attendanceStatusFilter) return false;
      if (selectedDiscrepancyOnly && !rec.isDiscrepancy) return false;
      return true;
    });
  }, [attendanceRecords, attendanceDate, attendanceStatusFilter, selectedDiscrepancyOnly]);

  // Month-end Salary Calculation per Employee with custom Bonus / Deduction adjustments
  const monthlySalaryCalculation = useMemo(() => {
    const totalMonthDays = 30; // standard month working days

    return employees.map((emp) => {
      const adjustment = salaryAdjustments[emp.employeeId];
      const effectiveBaseSalary = adjustment?.customBaseSalary ?? emp.monthlySalary;
      const customBonus = adjustment?.customBonus ?? 0;
      const customDeduction = adjustment?.customDeduction ?? 0;
      const adjustmentRemarks = adjustment?.remarks ?? '';

      const empAtt = attendanceRecords.filter((r) => r.employeeId === emp.employeeId);
      const presentCount = empAtt.filter((r) => r.status === 'present').length;
      const fieldDutyCount = empAtt.filter((r) => r.status === 'field_duty').length;
      const halfDayCount = empAtt.filter((r) => r.status === 'half_day').length;
      const leaveCount = empAtt.filter((r) => r.status === 'leave').length;
      const absentCount = empAtt.filter((r) => r.status === 'absent').length;

      // Unmarked days defaulted to present/working days
      const recordedDays = presentCount + fieldDutyCount + halfDayCount + leaveCount + absentCount;
      const assumedRegularDays = Math.max(0, totalMonthDays - recordedDays);

      const effectivePresent = presentCount + fieldDutyCount + assumedRegularDays;
      const payableDays = effectivePresent + leaveCount + (halfDayCount * 0.5);

      const perDaySalary = effectiveBaseSalary / totalMonthDays;
      const basePayable = Math.round(perDaySalary * payableDays);
      const calculatedIncentives = Math.round((emp.onboardedCount || 0) * 500); // BDE incentive formula
      const calculatedAbsenceDeductions = Math.round((absentCount + (halfDayCount * 0.5)) * perDaySalary);

      const totalIncentives = calculatedIncentives + customBonus;
      const totalDeductions = calculatedAbsenceDeductions + customDeduction;
      const netPayable = Math.max(0, basePayable + totalIncentives - totalDeductions);

      const hasDiscrepancy = empAtt.some((r) => r.isDiscrepancy && !r.discrepancyResolved);

      return {
        employee: emp,
        totalMonthDays,
        payableDays,
        presentCount: effectivePresent,
        fieldDutyCount,
        leaveCount,
        absentCount,
        halfDayCount,
        baseSalary: effectiveBaseSalary,
        basePayable,
        incentives: totalIncentives,
        customBonus,
        deductions: totalDeductions,
        customDeduction,
        netPayable,
        hasDiscrepancy,
        adjustmentRemarks,
      };
    });
  }, [employees, attendanceRecords, salaryAdjustments]);

  // Hand-off calculated salary figures to Accounts module
  const handleSendMonthlySalariesToAccounts = () => {
    // Check if there are unresolved discrepancies
    const unresolvedCount = monthlySalaryCalculation.filter((m) => m.hasDiscrepancy).length;
    if (unresolvedCount > 0) {
      if (!confirm(`Warning: ${unresolvedCount} employee attendance records have pending discrepancies. Do you still wish to submit these payroll figures to the Accountant?`)) {
        return;
      }
    }

    const payrollRecords: MonthlyPayrollRecord[] = monthlySalaryCalculation.map((m) => ({
      id: `pay-2026-10-${m.employee.id}`,
      monthYear: 'October 2026',
      employeeId: m.employee.employeeId,
      employeeName: m.employee.name,
      role: m.employee.role,
      branch: m.employee.branch,
      photoUrl: m.employee.photoUrl,
      baseSalary: m.baseSalary,
      totalWorkingDays: m.totalMonthDays,
      presentDays: m.presentCount,
      leaveDays: m.leaveCount,
      absentDays: m.absentCount,
      payableDays: m.payableDays,
      incentives: m.incentives,
      deductions: m.deductions,
      netPayableAmount: m.netPayable,
      status: 'submitted_by_hr',
      hrRemarks: m.adjustmentRemarks
        ? `HR Adjustment: ${m.adjustmentRemarks} (Bonus: +₹${m.customBonus}, Deduction: -₹${m.customDeduction})`
        : 'Verified by HR based on attendance records; submitted for disbursement',
    }));

    onSendPayrollToAccounts(payrollRecords);
    onToast(`Success! October 2026 payroll sheet (${payrollRecords.length} staff records, including bonus/deductions) submitted to Accountant! 💼🎉`);
  };

  const handleOpenSalaryModal = (emp: Employee) => {
    const adj = salaryAdjustments[emp.employeeId];
    setEditingSalaryEmp(emp);
    setEditSalaryValue(adj?.customBaseSalary ?? emp.monthlySalary);
    setEditBonusValue(adj?.customBonus ?? 0);
    setEditDeductionValue(adj?.customDeduction ?? 0);
    setEditAdjustmentRemarks(adj?.remarks ?? '');
  };

  const handleSaveSalaryAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSalaryEmp) return;

    // Persist new base salary on employee object if edited
    onUpdateEmployee({
      ...editingSalaryEmp,
      monthlySalary: Number(editSalaryValue),
    });

    // Save adjustment record
    setSalaryAdjustments((prev) => ({
      ...prev,
      [editingSalaryEmp.employeeId]: {
        customBaseSalary: Number(editSalaryValue),
        customBonus: Number(editBonusValue) || 0,
        customDeduction: Number(editDeductionValue) || 0,
        remarks: editAdjustmentRemarks.trim(),
      },
    }));

    onToast(`Employee ${editingSalaryEmp.name}'s salary (₹${editSalaryValue}), bonus (+₹${editBonusValue}), and deduction (-₹${editDeductionValue}) updated successfully! 💼`);
    setEditingSalaryEmp(null);
  };

  const handleRegisterEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formAadhaar.trim()) {
      onToast('Please enter full name, phone number, and Aadhaar number');
      return;
    }

    const generatedId = generateEmployeeId(formRole, formBranch);
    const now = new Date();
    const joiningStr = `${now.getDate()} Oct ${now.getFullYear()}`;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employeeId: generatedId,
      name: formName.trim(),
      role: formRole,
      branch: formBranch,
      phone: formPhone.trim(),
      email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '')}@shubhbandhan.in`,
      photoUrl: formPhotoUrl,
      monthlySalary: Number(formSalary),
      cvFileName: formCvFile.trim() || 'Updated_CV.pdf',
      cvUploadedDate: 'Today (Verified)',
      aadhaarNumber: formAadhaar.trim(),
      isAadhaarVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      onboardedCount: 0,
      monthlyTarget: Number(formTarget),
      commissionEarned: 0,
      status: 'active',
      joiningDate: joiningStr,
    };

    onAddEmployee(newEmp);
    setIsRegisterModalOpen(false);
    setFormName('');
    setFormPhone('+91 ');
    setFormEmail('');
    setFormAadhaar('');
    onToast(`Employee ${newEmp.name} registered! Passport photo, salary (₹${newEmp.monthlySalary}), and CV attached. Employee ID: ${generatedId} 🎉`);
  };

  const handleMarkAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = employees.find((e) => e.employeeId === attEmpId) || employees[0];

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: targetEmp.employeeId,
      employeeName: targetEmp.name,
      date: attendanceDate,
      checkInTime: attCheckIn,
      checkOutTime: attCheckOut,
      status: attStatus,
      location: attLocation,
      notes: attNotes,
      isDiscrepancy: attStatus === 'half_day' || attStatus === 'absent',
      discrepancyResolved: false,
    };

    onAddAttendance(newRecord);
    setIsMarkAttendanceOpen(false);
    onToast(`Attendance for ${targetEmp.name} (${attStatus.toUpperCase()}) recorded successfully!`);
  };

  const handleResolveDiscrepancy = () => {
    if (!resolvingDiscrepancyRecord) return;

    const updated: AttendanceRecord = {
      ...resolvingDiscrepancyRecord,
      status: resolveAction,
      isDiscrepancy: false,
      discrepancyResolved: true,
      notes: `${resolvingDiscrepancyRecord.notes || ''} [HR Resolution: ${resolveNotes}]`,
    };

    onUpdateAttendance(updated);
    setResolvingDiscrepancyRecord(null);
    onToast(`Discrepancy resolved! Attendance regularized as ${resolveAction.toUpperCase()}.`);
  };

  const handleExportDirectory = () => {
    const exportData = filteredEmployees.map((e) => ({
      'Passport Photo URL': e.photoUrl,
      'Employee ID': e.employeeId,
      'Name': e.name,
      'Designation / Role': e.role,
      'Branch': e.branch,
      'Monthly Base Salary': `₹ ${e.monthlySalary}`,
      'Updated CV File': e.cvFileName,
      'Phone': e.phone,
      'Email': e.email,
      'Aadhaar Number': e.aadhaarNumber,
      'Onboardings': e.onboardedCount,
      'Joining Date': e.joiningDate,
    }));
    exportToCsv('ShubhBandhan_HR_Directory', exportData);
    onToast('HR Employee Directory exported to Excel! 👥');
  };

  const handleExportAttendance = () => {
    const exportData = filteredAttendance.map((a) => ({
      'Date': a.date,
      'Employee ID': a.employeeId,
      'Employee Name': a.employeeName,
      'Check In Time': a.checkInTime,
      'Check Out Time': a.checkOutTime || '—',
      'Status': a.status,
      'Location': a.location,
      'Discrepancy Flag': a.isDiscrepancy ? 'Yes' : 'No',
      'Notes': a.notes || '—',
    }));
    exportToCsv(`ShubhBandhan_Attendance_${attendanceDate}`, exportData);
    onToast('Attendance records exported to Excel! 📅');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#e3bfb4]/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#ab3100] bg-[#ffdcc3] px-2 py-0.5 rounded">
            Human Resources Management & Verification Module
          </span>
          <h2 className="text-xl font-bold text-[#1f1b14] mt-1 font-['Noto_Sans']">
            HR Directory, Attendance & Month-End Payroll
          </h2>
          <p className="text-[12px] text-[#5a4139] mt-0.5">
            Passport photos, base salary, PDF CVs, daily attendance tracking & Accountant payroll handoff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subView === 'employees' ? (
            <>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-3.5 py-2 bg-[#ab3100] hover:bg-[#852400] text-white text-[12px] font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-[17px]">person_add</span>
                <span>+ Register New Employee</span>
              </button>
              <button
                onClick={handleExportDirectory}
                className="px-3.5 py-2 bg-[#107c41] hover:bg-[#0c6233] text-white text-[12px] font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">table_view</span>
                <span>Excel</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsMarkAttendanceOpen(true)}
                className="px-3.5 py-2 bg-[#ab3100] hover:bg-[#852400] text-white text-[12px] font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-[17px]">how_to_reg</span>
                <span>+ Mark Attendance</span>
              </button>
              <button
                onClick={handleSendMonthlySalariesToAccounts}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white text-[12px] font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                title="Send verified month-end salary sheet to Accountant"
              >
                <span className="material-symbols-outlined text-[17px]">send</span>
                <span>Send Payroll to Accountant</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub-navigation Tabs: Directory vs Attendance */}
      <div className="flex items-center gap-2 p-1.5 bg-[#fdfaf7] rounded-xl border border-[#e3bfb4]/60 w-fit text-[12px]">
        <button
          onClick={() => setSubView('employees')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
            subView === 'employees'
              ? 'bg-[#ab3100] text-white shadow-xs'
              : 'text-[#5a4139] hover:bg-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">badge</span>
          <span>1. Employee Records, Photo, Salary & C.V. ({employees.length})</span>
        </button>

        <button
          onClick={() => setSubView('attendance')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
            subView === 'attendance'
              ? 'bg-[#ab3100] text-white shadow-xs'
              : 'text-[#5a4139] hover:bg-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">calendar_month</span>
          <span>2. Attendance Tracking & Payroll Engine</span>
          {attendanceRecords.some((r) => r.isDiscrepancy && !r.discrepancyResolved) && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* VIEW 1: EMPLOYEES DIRECTORY WITH PASSPORT PHOTO, SALARY, AND PDF C.V. */}
      {subView === 'employees' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-[#e3bfb4]/60 shadow-xs flex flex-wrap items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#5a4139]">Filters:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#e3bfb4] bg-white font-medium text-[#1f1b14]"
              >
                <option value="all">All Roles</option>
                <option value="BDM">BDM</option>
                <option value="BDE">BDE</option>
                <option value="Relationship Manager">Relationship Manager</option>
                <option value="Accounts Officer">Accounts Officer</option>
                <option value="HR Manager">HR Manager</option>
                <option value="Field Verifier">Field Verifier</option>
              </select>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
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
                placeholder="Search name, ID, phone, Aadhaar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#e3bfb4] bg-white text-[#1f1b14] text-[12px] outline-none"
              />
            </div>
          </div>

          {/* Directory Table with Passport Photo, Salary, and CV Column */}
          <div className="bg-white rounded-2xl border border-[#e3bfb4]/70 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e3bfb4]/40 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[15px] text-[#1f1b14]">
                  Employee Directory (Official Records)
                </h4>
                <p className="text-[11px] text-[#5a4139]">
                  Passport photos, base salary, and updated C.V. (PDF) dossiers
                </p>
              </div>
              <span className="text-[11px] font-bold text-gray-500">
                Total displayed: {filteredEmployees.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#f6eee3] text-[#5a4139] border-b border-[#e3bfb4]/50 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 text-center">Passport Photo</th>
                    <th className="py-3 px-3">Employee ID & Name</th>
                    <th className="py-3 px-3">Role & Branch</th>
                    <th className="py-3 px-3 text-right">Monthly Base Salary</th>
                    <th className="py-3 px-3">Updated C.V. (PDF)</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3bfb4]/30">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#fff9f5] transition-colors">
                      {/* Column 1: Passport Size Photograph */}
                      <td className="py-3 px-3 text-center">
                        <div
                          onClick={() => setPreviewPhotoEmp(emp)}
                          className="w-12 h-14 mx-auto rounded-lg overflow-hidden border-2 border-[#ab3100]/30 shadow-xs cursor-pointer hover:scale-105 transition-transform group relative bg-gray-100"
                          title="Zoom Passport Photo"
                        >
                          <img
                            src={emp.photoUrl}
                            alt={emp.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-500 block mt-0.5 font-medium">Passport</span>
                      </td>

                      {/* Column 2: Employee ID & Name */}
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-[#ab3100] text-[11px] bg-[#ffdcc3] px-2 py-0.5 rounded">
                          {emp.employeeId}
                        </span>
                        <p className="font-bold text-gray-900 text-[13px] mt-1">{emp.name}</p>
                        <p className="text-[11px] text-gray-500 font-mono">{emp.phone}</p>
                      </td>

                      {/* Column 3: Designation & Branch */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                          {emp.role}
                        </span>
                        <p className="text-gray-600 text-[11px] mt-1">{emp.branch}</p>
                        <p className="text-[10px] text-gray-400">Joining: {emp.joiningDate}</p>
                      </td>

                      {/* Column 4: Salary Column */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-[14px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 inline-block">
                          ₹{emp.monthlySalary.toLocaleString('en-IN')}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenSalaryModal(emp)}
                          className="text-[10px] text-[#ab3100] hover:underline font-bold block mt-1 ml-auto"
                          title="Edit Base Salary, Bonus or Deductions"
                        >
                          Edit Salary ✎
                        </button>
                      </td>

                      {/* Column 5: Updated C.V. in PDF Format */}
                      <td className="py-3 px-3">
                        <div
                          onClick={() => setPreviewCvEmployee(emp)}
                          className="flex items-center gap-1.5 p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer transition-colors max-w-[180px]"
                          title="View / Download CV in PDF Format"
                        >
                          <span className="material-symbols-outlined text-red-600 text-[20px]">
                            picture_as_pdf
                          </span>
                          <div className="truncate text-[11px]">
                            <span className="font-bold text-red-900 block truncate">{emp.cvFileName}</span>
                            <span className="text-[9px] text-red-600">Updated PDF CV</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 6: Verification Status */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <p className="font-mono text-[10px] text-gray-700">Aadhaar: {emp.aadhaarNumber}</p>
                          <div className="flex items-center gap-1">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${emp.isAadhaarVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                              UIDAI {emp.isAadhaarVerified ? '✓' : '✗'}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${emp.isPhoneVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                              Phone {emp.isPhoneVerified ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedEmpForVerify(emp)}
                            className="p-1.5 rounded-lg bg-[#fff0eb] hover:bg-[#ffdcc3] text-[#ab3100]"
                            title="Verification Details"
                          >
                            <span className="material-symbols-outlined text-[16px]">verified_user</span>
                          </button>
                          <button
                            onClick={() => {
                              onDeleteEmployee(emp.id);
                              onToast(`Employee ${emp.name}'s record deleted`);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
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

      {/* VIEW 2: SYSTEMATIC ATTENDANCE MODULE & MONTH-END SALARY CALCULATOR */}
      {subView === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
              <span className="text-[12px] font-bold text-gray-500">Selected Date</span>
              <p className="text-xl font-bold text-[#ab3100] mt-1 font-mono">{attendanceDate}</p>
              <p className="text-[11px] text-gray-500 mt-1">Daily Attendance Cycle</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
              <span className="text-[12px] font-bold text-green-700">Present / Field Duty</span>
              <p className="text-xl font-bold text-green-700 mt-1">
                {filteredAttendance.filter((r) => r.status === 'present' || r.status === 'field_duty').length} Staff
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Biometric & field visits recorded</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs">
              <span className="text-[12px] font-bold text-amber-700">Attendance Discrepancies</span>
              <p className="text-xl font-bold text-amber-700 mt-1">
                {attendanceRecords.filter((r) => r.isDiscrepancy && !r.discrepancyResolved).length} Pending
              </p>
              <button
                onClick={() => setSelectedDiscrepancyOnly(!selectedDiscrepancyOnly)}
                className="text-[11px] font-bold text-amber-800 hover:underline mt-1"
              >
                {selectedDiscrepancyOnly ? 'Show All Records' : 'Filter Discrepancies Only'}
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/70 shadow-xs flex flex-col justify-between">
              <span className="text-[12px] font-bold text-[#5a4139]">Monthly Payroll Handoff</span>
              <button
                onClick={handleSendMonthlySalariesToAccounts}
                className="w-full py-2 bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px]">send</span>
                <span>Send to Accountant</span>
              </button>
            </div>
          </div>

          {/* Daily Attendance Log Table with Discrepancy Action */}
          <div className="bg-white rounded-2xl border border-[#e3bfb4]/70 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e3bfb4]/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-[15px] text-[#1f1b14]">
                  Daily Attendance Log (Biometric & Field Punches)
                </h4>
                <p className="text-[11px] text-[#5a4139]">
                  Individual check-in/out stamps, location tagging & anomaly flagging
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#e3bfb4] rounded-lg text-[12px] bg-white font-mono"
                />

                <select
                  value={attendanceStatusFilter}
                  onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#e3bfb4] rounded-lg text-[12px] bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="present">Present (Full Day)</option>
                  <option value="field_duty">Field Duty (BDE)</option>
                  <option value="half_day">Half Day</option>
                  <option value="leave">Approved Leave</option>
                  <option value="absent">Absent</option>
                </select>

                <button
                  onClick={handleExportAttendance}
                  className="px-3 py-1.5 bg-[#107c41] text-white text-[11px] font-bold rounded-lg flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">table_view</span>
                  <span>Excel</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#f6eee3] text-[#5a4139] border-b border-[#e3bfb4]/50 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Check-in</th>
                    <th className="py-2.5 px-3">Check-out</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Location & Notes</th>
                    <th className="py-2.5 px-3">Discrepancy / HR Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3bfb4]/30">
                  {filteredAttendance.map((rec) => (
                    <tr
                      key={rec.id}
                      className={`hover:bg-[#fff9f5] ${
                        rec.isDiscrepancy && !rec.discrepancyResolved ? 'bg-amber-50/70' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <p className="font-bold text-gray-900">{rec.employeeName}</p>
                        <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1 py-0.2 rounded">
                          {rec.employeeId}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-gray-800 font-medium">
                        {rec.checkInTime}
                      </td>

                      <td className="py-3 px-3 font-mono text-gray-800 font-medium">
                        {rec.checkOutTime || '—'}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rec.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : rec.status === 'field_duty'
                              ? 'bg-blue-100 text-blue-800'
                              : rec.status === 'half_day'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {rec.status === 'present'
                            ? 'Present'
                            : rec.status === 'field_duty'
                            ? 'Field Duty'
                            : rec.status === 'half_day'
                            ? 'Half Day'
                            : 'Leave / Absent'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <p className="text-gray-800 text-[11px] font-medium">{rec.location}</p>
                        {rec.notes && <p className="text-[10px] text-gray-500">{rec.notes}</p>}
                      </td>

                      <td className="py-3 px-3">
                        {rec.isDiscrepancy && !rec.discrepancyResolved ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200 text-amber-900 animate-pulse">
                              Discrepancy
                            </span>
                            <button
                              onClick={() => setResolvingDiscrepancyRecord(rec)}
                              className="px-2.5 py-1 rounded bg-[#ab3100] text-white text-[10px] font-bold hover:bg-[#852400] transition-colors"
                            >
                              Resolve
                            </button>
                          </div>
                        ) : rec.discrepancyResolved ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                            Regularized by HR ✓
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Month-End Salary Calculation Sheet for Accountant Handoff */}
          <div className="bg-white rounded-2xl border border-[#e3bfb4]/70 shadow-xs overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-[#2c1d11] to-[#452718] text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#ffdcc3] bg-white/20 px-2 py-0.5 rounded">
                  End of Month Payroll Engine
                </span>
                <h4 className="font-bold text-[16px] text-white mt-1">
                  Attendance-Based Month-End Salary Calculation Sheet (October 2026)
                </h4>
                <p className="text-[12px] text-gray-300">
                  On the basis of this verified data, HR provides the exact amount figures to the Accountant for releasing salaries.
                </p>
              </div>

              <button
                onClick={handleSendMonthlySalariesToAccounts}
                className="px-4 py-2.5 bg-[#ab3100] hover:bg-[#852400] text-white rounded-xl text-[12px] font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Send Verified Payroll to Accountant</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#f6eee3] text-[#5a4139] border-b border-[#e3bfb4]/50 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3">Employee Name & Role</th>
                    <th className="py-3 px-3 text-right">Base Salary</th>
                    <th className="py-3 px-3 text-center">Month Days</th>
                    <th className="py-3 px-3 text-center">Payable Days</th>
                    <th className="py-3 px-3 text-right">Incentives / Bonus</th>
                    <th className="py-3 px-3 text-right">Deductions</th>
                    <th className="py-3 px-3 text-right font-bold">Net Payable Amount</th>
                    <th className="py-3 px-3 text-center">HR Audit Status</th>
                    <th className="py-3 px-3 text-center">Edit Salary/Bonus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3bfb4]/30">
                  {monthlySalaryCalculation.map((m) => (
                    <tr key={m.employee.id} className="hover:bg-[#fff9f5]">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={m.employee.photoUrl}
                            alt={m.employee.name}
                            className="w-7 h-7 rounded-full object-cover border"
                          />
                          <div>
                            <p className="font-bold text-gray-900">{m.employee.name}</p>
                            <span className="text-[10px] text-gray-500 font-mono">{m.employee.employeeId}</span>
                            {m.adjustmentRemarks && (
                              <span className="block text-[9px] text-[#ab3100] italic">
                                * {m.adjustmentRemarks}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-gray-900">
                        ₹{m.baseSalary.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-gray-700">
                        {m.totalMonthDays} d
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-blue-800 bg-blue-50/50">
                        {m.payableDays} d
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-green-700">
                        +₹{m.incentives.toLocaleString('en-IN')}
                        {m.customBonus > 0 && (
                          <span className="block text-[9px] text-green-800 font-bold">
                            (Bonus: +₹{m.customBonus})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-red-600">
                        -₹{m.deductions.toLocaleString('en-IN')}
                        {m.customDeduction > 0 && (
                          <span className="block text-[9px] text-red-800 font-bold">
                            (Deduction: -₹{m.customDeduction})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-[14px] text-emerald-900 bg-emerald-50">
                        ₹{m.netPayable.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {m.hasDiscrepancy ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Discrepancy Pending ⚠️
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                            Verified ✓
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenSalaryModal(m.employee)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-200 flex items-center gap-1 mx-auto transition-colors"
                          title="Edit Base Salary, Bonus or Deductions"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit_note</span>
                          <span>Edit ✎</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE ATTENDANCE DISCREPANCY MODAL */}
      {resolvingDiscrepancyRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-[17px] text-[#1f1b14]">
                Resolve Attendance Discrepancy
              </h3>
              <button
                onClick={() => setResolvingDiscrepancyRecord(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-[#fff8f3] p-3 rounded-xl border border-[#e3bfb4] text-[12px] space-y-1">
              <p><strong>Employee:</strong> {resolvingDiscrepancyRecord.employeeName} ({resolvingDiscrepancyRecord.employeeId})</p>
              <p><strong>Date:</strong> {resolvingDiscrepancyRecord.date}</p>
              <p><strong>Current Status:</strong> {resolvingDiscrepancyRecord.status.toUpperCase()}</p>
              <p><strong>Original Notes:</strong> {resolvingDiscrepancyRecord.notes || 'Absence / late punch recorded'}</p>
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Regularized Status:</label>
                <select
                  value={resolveAction}
                  onChange={(e) => setResolveAction(e.target.value as any)}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="present">Regularize as Full Day Present</option>
                  <option value="field_duty">Validate as Field Duty (BDE Onboarding Visit)</option>
                  <option value="leave">Approve as Paid Leave</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">HR Resolution Remarks:</label>
                <textarea
                  rows={2}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g. Field visit verified with client, regularized as full day present"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setResolvingDiscrepancyRecord(null)}
                className="px-4 py-2 border rounded-xl text-gray-700 font-bold text-[12px]"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveDiscrepancy}
                className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold text-[12px] shadow-xs"
              >
                Resolve Discrepancy & Update Payable Days
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SALARY, BONUS & DEDUCTIONS MODAL */}
      {editingSalaryEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <div>
                <h3 className="font-bold text-[17px] text-[#1f1b14]">
                  Edit Salary, Bonus & Deductions
                </h3>
                <p className="text-[12px] text-[#5a4139]">
                  {editingSalaryEmp.name} ({editingSalaryEmp.employeeId}) • {editingSalaryEmp.role}
                </p>
              </div>
              <button
                onClick={() => setEditingSalaryEmp(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSalaryAdjustment} className="space-y-3.5 text-[12px]">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Monthly Base Salary (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editSalaryValue}
                  onChange={(e) => setEditSalaryValue(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-lg font-mono text-[14px] font-bold"
                />
                <span className="text-[11px] text-gray-500">
                  Current master salary: ₹{editingSalaryEmp.monthlySalary.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-green-700 block mb-1">
                    Bonus / Extra Incentive (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editBonusValue}
                    onChange={(e) => setEditBonusValue(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg font-mono text-green-800"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="font-bold text-red-600 block mb-1">
                    Custom Deduction (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editDeductionValue}
                    onChange={(e) => setEditDeductionValue(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg font-mono text-red-800"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Adjustment Reason / Remarks
                </label>
                <input
                  type="text"
                  value={editAdjustmentRemarks}
                  onChange={(e) => setEditAdjustmentRemarks(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g. Festival bonus / Unapproved absence penalty"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingSalaryEmp(null)}
                  className="px-4 py-2 border rounded-xl text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Salary Adjustments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW C.V. (PDF) MODAL */}
      {previewCvEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-[#e3bfb4]">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-[26px]">
                  picture_as_pdf
                </span>
                <div>
                  <h3 className="font-bold text-[17px] text-gray-900">
                    {previewCvEmployee.cvFileName}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Updated C.V. • Uploaded: {previewCvEmployee.cvUploadedDate || 'Verified'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewCvEmployee(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Formal Simulated PDF Document Paper View */}
            <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-inner font-serif text-[13px] leading-relaxed space-y-4">
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h2 className="font-bold text-xl text-gray-900 tracking-wide font-sans">{previewCvEmployee.name}</h2>
                  <p className="text-gray-600 font-sans">{previewCvEmployee.role} • {previewCvEmployee.branch}</p>
                  <p className="text-gray-500 text-[11px] font-sans mt-0.5">
                    Phone: {previewCvEmployee.phone} | Email: {previewCvEmployee.email}
                  </p>
                </div>
                <img
                  src={previewCvEmployee.photoUrl}
                  alt={previewCvEmployee.name}
                  className="w-16 h-20 rounded object-cover border-2 border-gray-400"
                />
              </div>

              <div>
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b pb-1 font-sans">
                  Professional Summary & Experience
                </h4>
                <p className="text-gray-700 mt-1.5 text-[12px]">
                  Serving as {previewCvEmployee.role} at Shubh Bandhan. Skilled in matrimonial profile verification, candidate onboarding, and family matchmaking.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[12px]">
                <div>
                  <h5 className="font-bold text-gray-900 font-sans">Education & Qualifications:</h5>
                  <p className="text-gray-600">Postgraduate (MBA / M.A) • Recognized University</p>
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 font-sans">Government Identity:</h5>
                  <p className="text-gray-600 font-mono">Aadhaar: {previewCvEmployee.aadhaarNumber}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded border text-[11px] font-sans">
                <span className="font-bold text-emerald-800 block">HR Verification Certificate:</span>
                This C.V. and passport photograph are verified and digitally signed by Shubh Bandhan Human Resources Division.
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-500">Verified PDF Document (Adobe Acrobat Standard Compatible)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewCvEmployee(null)}
                  className="px-4 py-2 border rounded-xl text-gray-700 text-[12px] font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                    onToast('C.V. download / print window opened 📄');
                  }}
                  className="px-4 py-2 bg-[#ab3100] hover:bg-[#852400] text-white rounded-xl text-[12px] font-bold flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW PASSPORT PHOTO FULL MODAL */}
      {previewPhotoEmp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="font-bold text-[15px] text-gray-900">
                Passport Photo: {previewPhotoEmp.name}
              </h4>
              <button onClick={() => setPreviewPhotoEmp(null)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="w-48 h-60 mx-auto rounded-xl overflow-hidden border-4 border-gray-200 shadow-md">
              <img
                src={previewPhotoEmp.photoUrl}
                alt={previewPhotoEmp.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-[12px] text-gray-600">
              <p className="font-bold text-gray-900">{previewPhotoEmp.employeeId}</p>
              <p>{previewPhotoEmp.role} • {previewPhotoEmp.branch}</p>
              <p className="text-emerald-700 font-bold mt-1">Salary: ₹{previewPhotoEmp.monthlySalary.toLocaleString('en-IN')} / month</p>
            </div>

            <button
              onClick={() => setPreviewPhotoEmp(null)}
              className="w-full py-2 bg-[#ab3100] text-white rounded-xl text-[12px] font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MARK ATTENDANCE MODAL */}
      {isMarkAttendanceOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-[17px] text-[#1f1b14]">
                + Mark Daily Attendance
              </h3>
              <button onClick={() => setIsMarkAttendanceOpen(false)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleMarkAttendanceSubmit} className="space-y-3 text-[12px]">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Employee:</label>
                <select
                  value={attEmpId}
                  onChange={(e) => setAttEmpId(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId} - {emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Attendance Status:</label>
                  <select
                    value={attStatus}
                    onChange={(e) => setAttStatus(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="present">Present (Full Day)</option>
                    <option value="field_duty">Field Duty (BDE)</option>
                    <option value="half_day">Half Day</option>
                    <option value="leave">Approved Leave</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Date:</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Check-in Time:</label>
                  <input
                    type="text"
                    value={attCheckIn}
                    onChange={(e) => setAttCheckIn(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Check-out Time:</label>
                  <input
                    type="text"
                    value={attCheckOut}
                    onChange={(e) => setAttCheckOut(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Location / Branch / Field Duty Details:</label>
                <input
                  type="text"
                  value={attLocation}
                  onChange={(e) => setAttLocation(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g. Varanasi Main Branch / Ayodhya Client Meeting"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Notes / Verification Remarks:</label>
                <input
                  type="text"
                  value={attNotes}
                  onChange={(e) => setAttNotes(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g. Biometric punch verified / Client visit approved"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsMarkAttendanceOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ab3100] text-white rounded-xl font-bold"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER EMPLOYEE MODAL (WITH PASSPORT PHOTO, SALARY, AND PDF CV ATTACHMENT) */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-[17px] text-[#1f1b14]">
                  + Register New Employee (Passport Photo, Salary & C.V.)
                </h3>
                <p className="text-[12px] text-[#5a4139] mt-0.5">
                  System will automatically issue an official Employee ID upon registration.
                </p>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleRegisterEmployee} className="space-y-3.5 text-[12px]">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Kumar Singh"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Designation / Role:</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="BDE">BDE (Business Development Executive)</option>
                    <option value="BDM">BDM (Business Development Manager)</option>
                    <option value="Relationship Manager">Relationship Manager (RM)</option>
                    <option value="Accounts Officer">Accounts Officer</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Field Verifier">Field Verifier</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Branch / Location:</label>
                  <select
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="Varanasi Main Branch">Varanasi Main Branch</option>
                    <option value="Ayodhya Division">Ayodhya Division</option>
                    <option value="Gorakhpur Regional Office">Gorakhpur Regional Office</option>
                    <option value="Lucknow Gomti Nagar">Lucknow Gomti Nagar</option>
                    <option value="Sultanpur District Office">Sultanpur District Office</option>
                    <option value="Head Office (Lucknow)">Head Office (Lucknow)</option>
                  </select>
                </div>
              </div>

              {/* Salary and C.V. fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Monthly Base Salary (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg font-mono"
                    placeholder="30000"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Updated C.V. (PDF File) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCvFile}
                    onChange={(e) => setFormCvFile(e.target.value)}
                    className="w-full p-2 border rounded-lg font-mono text-red-800"
                    placeholder="Employee_Resume_2026.pdf"
                  />
                </div>
              </div>

              {/* Passport Photo URL */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Passport Size Photo (Photo URL / File) *
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    className="w-full p-2 border rounded-lg text-[11px]"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <img
                    src={formPhotoUrl}
                    alt="Passport Preview"
                    className="w-10 h-12 rounded object-cover border shrink-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 94150..."
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Aadhaar Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="1234-5678-9012"
                    value={formAadhaar}
                    onChange={(e) => setFormAadhaar(e.target.value)}
                    className="w-full p-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ab3100] hover:bg-[#852400] text-white rounded-xl font-bold shadow-xs"
                >
                  Register Employee & Issue ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
