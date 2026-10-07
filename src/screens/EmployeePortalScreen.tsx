import React, { useState, useMemo, useEffect } from 'react';
import { Employee, AttendanceRecord, ScreenType } from '../types/matrimony';

interface EmployeePortalScreenProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  activeEmployee?: Employee | null;
  onSetEmployee?: (emp: Employee | null) => void;
  onAddAttendance: (record: AttendanceRecord) => void;
  onNavigate: (screen: ScreenType) => void;
  onToast: (msg: string) => void;
}

export const EmployeePortalScreen: React.FC<EmployeePortalScreenProps> = ({
  employees,
  attendanceRecords,
  activeEmployee: activeEmployeeProp,
  onSetEmployee,
  onAddAttendance,
  onNavigate,
  onToast,
}) => {
  // Active logged-in employee session
  const [internalEmployee, setInternalEmployee] = useState<Employee | null>(null);
  const activeEmployee = activeEmployeeProp !== undefined ? activeEmployeeProp : internalEmployee;
  const setActiveEmployee = (emp: Employee | null) => {
    setInternalEmployee(emp);
    onSetEmployee?.(emp);
  };

  // Login form state
  const [empInputId, setEmpInputId] = useState('');
  const [empPassword, setEmpPassword] = useState('1234');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<{ title: string; subtitle: string } | null>(null);

  // Current active date for attendance
  const todayDateStr = '2026-10-06';

  // Dynamic calendar selected date
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayDateStr);

  // Check if attendance already marked today for active employee
  const todayAttendanceRecord = useMemo(() => {
    if (!activeEmployee) return null;
    return attendanceRecords.find(
      (r) => r.employeeId === activeEmployee.employeeId && r.date === todayDateStr
    );
  }, [activeEmployee, attendanceRecords, todayDateStr]);

  // Handle Employee Login and Auto Attendance Punch-in
  const handleEmployeeLogin = (emp: Employee) => {
    setActiveEmployee(emp);

    // Auto mark attendance for today if not already present
    const existingToday = attendanceRecords.find(
      (r) => r.employeeId === emp.employeeId && r.date === todayDateStr
    );

    if (!existingToday || existingToday.status !== 'present') {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const newRecord: AttendanceRecord = {
        id: `att-login-${Date.now()}`,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        date: todayDateStr,
        checkInTime: timeStr || '09:30 AM',
        checkOutTime: '06:30 PM',
        status: 'present',
        location: `${emp.branch} (Employee Portal Biometric)`,
        notes: 'Attendance automatically marked upon Employee Portal login',
        isDiscrepancy: false,
        discrepancyResolved: true,
      };

      onAddAttendance(newRecord);
    }

    // Set user-specified greeting message
    const greetingTitle = `Hello Mr/Mrs. ${emp.name}`;
    const greetingSubtitle = 'Your today attendance as marked as present!';

    setLoginSuccessMsg({
      title: greetingTitle,
      subtitle: greetingSubtitle,
    });

    onToast(`${greetingTitle}! ${greetingSubtitle} 🎉`);
  };

  // Safe Logout
  const handleSafeLogout = () => {
    if (activeEmployee) {
      onToast(`Thank you ${activeEmployee.name}! You have been safely logged out. Have a great day! 🙏`);
    }
    setActiveEmployee(null);
    setLoginSuccessMsg(null);
    setEmpInputId('');
  };

  // Calculate statistics for active employee
  const employeeAttendanceStats = useMemo(() => {
    if (!activeEmployee) {
      return { totalPresent: 0, totalAbsent: 0, totalLeave: 0, totalField: 0, totalDays: 30 };
    }

    const empRecords = attendanceRecords.filter((r) => r.employeeId === activeEmployee.employeeId);
    const presentCount = empRecords.filter((r) => r.status === 'present').length;
    const fieldCount = empRecords.filter((r) => r.status === 'field_duty').length;
    const leaveCount = empRecords.filter((r) => r.status === 'leave').length;
    const absentCount = empRecords.filter((r) => r.status === 'absent').length;

    // Default base present days simulation for month of October
    const basePresent = Math.max(25, presentCount + fieldCount + 22);
    const baseLeave = Math.max(2, leaveCount);
    const baseAbsent = Math.max(1, absentCount);

    return {
      totalPresent: basePresent,
      totalAbsent: baseAbsent,
      totalLeave: baseLeave,
      totalField: Math.max(4, fieldCount),
      totalDays: 31,
    };
  }, [activeEmployee, attendanceRecords]);

  // Days in October 2026 for Dynamic Calendar
  const octoberDays = useMemo(() => {
    const days = [];
    const englishDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 1; i <= 31; i++) {
      const dayStr = i < 10 ? `0${i}` : `${i}`;
      const dateKey = `2026-10-${dayStr}`;

      // Check record
      let status: 'present' | 'absent' | 'leave' | 'field_duty' | 'half_day' = 'present';
      if (activeEmployee) {
        const found = attendanceRecords.find(
          (r) => r.employeeId === activeEmployee.employeeId && r.date === dateKey
        );
        if (found) {
          status = found.status;
        } else if (i === 11 || i === 18 || i === 25) {
          status = 'leave'; // Sunday
        } else if (i === 4 && activeEmployee.role === 'BDE') {
          status = 'half_day';
        } else if (i === 2) {
          status = 'field_duty';
        } else if (i > 6) {
          status = 'present';
        }
      }

      days.push({
        dayNumber: i,
        dateKey,
        isToday: dateKey === todayDateStr,
        status,
        dayName: englishDayNames[(i + 3) % 7],
      });
    }
    return days;
  }, [activeEmployee, attendanceRecords, todayDateStr]);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-28 pt-20 px-3 sm:px-6">
      {/* Top Banner Navigation */}
      <div className="bg-white p-4.5 rounded-2xl border border-[#e3bfb4]/70 shadow-xs mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#1b5e20] to-[#2e7d32] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[28px]">badge</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-[19px] text-[#1f1b14] leading-tight font-['Noto_Sans']">
                Employee Daily Attendance Portal
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Login-based Attendance
              </span>
            </div>
            <p className="text-[12px] text-[#5a4139] mt-0.5">
              Login to start your work; your attendance is automatically punched and recorded.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {activeEmployee ? (
            <button
              onClick={handleSafeLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
              title="Safely Logout to Exit"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Safe Logout & Exit</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-2 bg-[#f1e7db] hover:bg-[#ebe1d6] text-[#5a4139] text-[12px] font-bold rounded-xl transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: EMPLOYEE LOGIN SCREEN (WHEN NOT LOGGED IN) */}
      {!activeEmployee ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Login Card */}
          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-[#e3bfb4]/70 shadow-xs space-y-5">
            <div className="border-b border-[#e3bfb4]/40 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ab3100] bg-[#ffdcc3] px-2 py-0.5 rounded">
                Daily Workday Authentication
              </span>
              <h2 className="text-xl font-bold text-[#1f1b14] mt-1 font-['Noto_Sans']">
                Employee Sign In & Punch In
              </h2>
              <p className="text-[12px] text-[#5a4139] mt-1">
                Every employee must log in using their credentials before starting work. Upon login, today's attendance will be recorded as 'Present'.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const found = employees.find(
                  (emp) =>
                    emp.employeeId.toLowerCase() === empInputId.trim().toLowerCase() ||
                    emp.phone.includes(empInputId.trim()) ||
                    emp.email.toLowerCase() === empInputId.trim().toLowerCase()
                );
                if (found) {
                  handleEmployeeLogin(found);
                } else {
                  onToast('Please enter a valid Employee ID or phone number (or select from list below)');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[12px] font-bold text-[#5a4139] block mb-1.5">
                  Employee ID / Mobile Number:
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#ab3100] text-[20px]">
                    badge
                  </span>
                  <input
                    type="text"
                    required
                    value={empInputId}
                    onChange={(e) => setEmpInputId(e.target.value)}
                    placeholder="e.g. SB-BDM-VRN-1042 or +91 94150 10420"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e3bfb4] bg-[#fffaf5] text-[13px] text-[#1f1b14] font-medium outline-none focus:ring-2 focus:ring-[#ab3100]/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#5a4139] block mb-1.5">
                  Password / PIN:
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    placeholder="••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e3bfb4] bg-[#fffaf5] text-[13px] text-[#1f1b14] outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[12px] flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700 text-[20px]">
                  verified
                </span>
                <span>
                  <strong>Auto-Attendance Rule:</strong> As soon as you log in, your today's attendance, in-time, and branch location are recorded automatically.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#ab3100] to-[#e65100] hover:from-[#852400] hover:to-[#bf360c] text-white rounded-xl font-bold text-[14px] shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                <span>Log In & Mark Today's Attendance</span>
              </button>
            </form>
          </div>

          {/* 1-Click Fast Demo Switcher for Active Employees */}
          <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-[#e3bfb4]/70 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#e3bfb4]/40">
                <span className="text-[11px] font-bold text-[#ab3100]">Quick Employee Selection (1-Click Test)</span>
                <span className="text-[10px] text-gray-500">Live Staff Directory</span>
              </div>
              <p className="text-[11px] text-[#5a4139] mt-1 mb-2.5">
                Click any employee below to instantly test login and attendance:
              </p>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => handleEmployeeLogin(emp)}
                    className="p-2.5 rounded-xl border border-[#e3bfb4]/60 hover:border-[#ab3100] bg-[#fffaf5] hover:bg-[#fff0eb] cursor-pointer transition-all flex items-center gap-3 group"
                  >
                    <img
                      src={emp.photoUrl}
                      alt={emp.name}
                      className="w-10 h-11 object-cover rounded-lg border border-[#e3bfb4]"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[13px] text-[#1f1b14] truncate group-hover:text-[#ab3100]">
                          {emp.name}
                        </span>
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#ffdcc3] text-[#ab3100]">
                          {emp.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono">{emp.employeeId}</p>
                      <p className="text-[10px] text-gray-600 truncate">{emp.branch.split(' ')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-[#8e4b00] bg-[#fff8f3] p-2 rounded-lg text-center">
              💡 Month-end payroll calculations will be computed directly from this verified attendance data for Accounts.
            </p>
          </div>
        </div>
      ) : (
        /* VIEW 2: EMPLOYEE DASHBOARD & DYNAMIC ATTENDANCE CALENDAR (WHEN LOGGED IN) */
        <div className="space-y-6">
          {/* USER SPECIFIED SHORT MESSAGE POPUP / BANNER */}
          {loginSuccessMsg && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white shadow-md flex items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[28px]">check_circle</span>
                </div>
                <div>
                  <h3 className="font-bold text-[17px] leading-tight font-['Noto_Sans']">
                    {loginSuccessMsg.title}
                  </h3>
                  <p className="text-[13px] text-emerald-100 font-medium mt-0.5">
                    "{loginSuccessMsg.subtitle}"
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold">
                  {todayDateStr} • {todayAttendanceRecord?.checkInTime || '09:30 AM'}
                </span>
              </div>
            </div>
          )}

          {/* Employee Profile & Quick Overview Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#e3bfb4]/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={activeEmployee.photoUrl}
                  alt={activeEmployee.name}
                  className="w-16 h-18 rounded-xl object-cover border-2 border-[#ab3100] shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" title="Present (Online)"></span>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-[18px] text-[#1f1b14]">{activeEmployee.name}</h2>
                  <span className="font-mono text-[11px] font-bold bg-[#ffdcc3] text-[#ab3100] px-2 py-0.5 rounded">
                    {activeEmployee.employeeId}
                  </span>
                  <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                    {activeEmployee.role}
                  </span>
                </div>
                <p className="text-[12px] text-[#5a4139]">{activeEmployee.branch}</p>
                <p className="text-[11px] text-gray-500">
                  Monthly Base Salary: <strong className="text-emerald-800">₹{activeEmployee.monthlySalary.toLocaleString('en-IN')}</strong> • Joined: {activeEmployee.joiningDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={handleSafeLogout}
                className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl text-[12px] font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[17px]">logout</span>
                <span>Safe Logout</span>
              </button>
            </div>
          </div>

          {/* Small KPI Attendance Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/30">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-[12px] font-bold">Total Present Days</span>
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{employeeAttendanceStats.totalPresent} Days</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">October 2026</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs bg-red-50/30">
              <div className="flex items-center justify-between text-red-700">
                <span className="text-[12px] font-bold">Total Absent Days</span>
                <span className="material-symbols-outlined text-[20px]">cancel</span>
              </div>
              <p className="text-2xl font-bold text-red-800 mt-1">{employeeAttendanceStats.totalAbsent} Days</p>
              <p className="text-[11px] text-red-600 mt-0.5">Unexcused Absences</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs bg-purple-50/30">
              <div className="flex items-center justify-between text-purple-700">
                <span className="text-[12px] font-bold">On Leave Days</span>
                <span className="material-symbols-outlined text-[20px]">event_busy</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-1">{employeeAttendanceStats.totalLeave} Days</p>
              <p className="text-[11px] text-purple-700 mt-0.5">Approved Paid Leaves</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs bg-blue-50/30">
              <div className="flex items-center justify-between text-blue-700">
                <span className="text-[12px] font-bold">Field Duty Days</span>
                <span className="material-symbols-outlined text-[20px]">pin_drop</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">{employeeAttendanceStats.totalField} Days</p>
              <p className="text-[11px] text-blue-700 mt-0.5">Client Meetings & Verifications</p>
            </div>
          </div>

          {/* DYNAMIC ATTENDANCE CALENDAR */}
          <div className="bg-white p-5 rounded-2xl border border-[#e3bfb4]/70 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e3bfb4]/40 pb-3">
              <div>
                <h3 className="font-bold text-[16px] text-[#1f1b14] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab3100]">calendar_month</span>
                  <span>Dynamic Attendance Calendar</span>
                </h3>
                <p className="text-[12px] text-[#5a4139]">
                  October 2026 • Daily punch records, attendance status, and field visits
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2.5 flex-wrap text-[11px]">
                <span className="flex items-center gap-1 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>Present</span>
                </span>
                <span className="flex items-center gap-1 text-blue-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>Field Duty</span>
                </span>
                <span className="flex items-center gap-1 text-purple-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  <span>Leave</span>
                </span>
                <span className="flex items-center gap-1 text-red-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  <span>Absent</span>
                </span>
              </div>
            </div>

            {/* Monthly Calendar Grid (October 2026 - 31 Days) */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {octoberDays.map((d) => {
                const isSelected = selectedCalendarDate === d.dateKey;

                return (
                  <div
                    key={d.dateKey}
                    onClick={() => setSelectedCalendarDate(d.dateKey)}
                    className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#ab3100] shadow-sm'
                        : 'hover:bg-[#fff9f5]'
                    } ${
                      d.status === 'present'
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                        : d.status === 'field_duty'
                        ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                        : d.status === 'leave'
                        ? 'bg-purple-50/70 border-purple-300 text-purple-900'
                        : d.status === 'half_day'
                        ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                        : 'bg-red-50/70 border-red-300 text-red-900'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-80">
                      <span>{d.dayName}</span>
                      {d.isToday && (
                        <span className="bg-[#ab3100] text-white px-1 rounded text-[8px] font-bold">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-[17px] font-bold mt-0.5">{d.dayNumber}</p>
                    <span className="text-[9px] font-bold block mt-0.5 uppercase tracking-tight">
                      {d.status === 'present'
                        ? '✓ Present'
                        : d.status === 'field_duty'
                        ? 'Field'
                        : d.status === 'leave'
                        ? 'Leave'
                        : d.status === 'half_day'
                        ? 'Half Day'
                        : 'Absent'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selected Date Detail Card */}
            <div className="p-3.5 rounded-xl bg-[#fff8f3] border border-[#e3bfb4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
              <div>
                <span className="font-bold text-[#ab3100]">Selected Date Record ({selectedCalendarDate}):</span>
                <p className="text-gray-700 mt-0.5">
                  Check In: <strong>09:30 AM</strong> • Check Out: <strong>06:30 PM</strong> • Location: <strong>{activeEmployee.branch}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Biometric Verified ✓
                </span>
                <button
                  onClick={handleSafeLogout}
                  className="px-3 py-1 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white font-bold transition-colors"
                >
                  Safe Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
