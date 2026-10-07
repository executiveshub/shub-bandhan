import { useState, useMemo } from 'react';
import {
  Profile,
  ScreenType,
  FilterState,
  UserSubscription,
  SubscriptionPlan,
  SubscriptionTier,
  AuthUser,
  AdminUser,
  Employee,
  TransactionRecord,
  AttendanceRecord,
  MonthlyPayrollRecord,
  AbandonedRegistrationLead,
} from './types/matrimony';
import {
  PROFILES_DATA,
  INITIAL_FILTERS,
  INITIAL_USER_SUBSCRIPTION,
  SUBSCRIPTION_PLANS,
  DEMO_USERS,
  INITIAL_ADMIN_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_TRANSACTIONS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_ABANDONED_LEADS,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardScreen } from './screens/DashboardScreen';
import { FeedScreen } from './screens/FeedScreen';
import { BiodataScreen } from './screens/BiodataScreen';
import { ChatsScreen } from './screens/ChatsScreen';
import { FilterScreen } from './screens/FilterScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SubscriptionScreen } from './screens/SubscriptionScreen';
import { RegistrationScreen } from './screens/RegistrationScreen';
import { StoriesScreen } from './screens/StoriesScreen';
import { AdminScreen } from './screens/AdminScreen';
import { AdminLoginScreen } from './screens/admin/AdminLoginScreen';
import { EmployeePortalScreen } from './screens/EmployeePortalScreen';
import { KundaliModal } from './components/KundaliModal';
import { BiodataPdfModal } from './components/BiodataPdfModal';
import { ContactModal } from './components/ContactModal';
import { CounselorModal } from './components/CounselorModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { AuthModal } from './components/AuthModal';
import { CityModal, LanguageModal } from './components/CityLanguageModals';
import { Toast } from './components/Toast';
import { ModuleLockModal, ModuleLockState } from './components/ModuleLockModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [previousScreen, setPreviousScreen] = useState<ScreenType>('dashboard');

  // Active Logged-in User Session (Default: null for Guest Visit Mode as requested)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Active Logged-in Employee Session
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

  // Module Lock Guard State
  const [moduleLockState, setModuleLockState] = useState<ModuleLockState | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Matrimonial profiles state (including dynamically onboarded candidates)
  const [profiles, setProfiles] = useState<Profile[]>(PROFILES_DATA);
  const [selectedProfile, setSelectedProfile] = useState<Profile>(PROFILES_DATA[0]);

  // Subscription plan & business model state
  const [userSubscription, setUserSubscription] = useState<UserSubscription>(
    INITIAL_USER_SUBSCRIPTION
  );
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [subscriptionTargetCandidate, setSubscriptionTargetCandidate] = useState<string | undefined>();
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(null);
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState<boolean>(false);
  const [activePaymentPlan, setActivePaymentPlan] = useState<SubscriptionPlan | null>(null);

  // Filter states
  const [selectedFilterChip, setSelectedFilterChip] = useState<string>('all');
  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTERS);

  // Localization and Location
  const [selectedCity, setSelectedCity] = useState<string>('वाराणसी');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('हिन्दी (मानक)');

  // Modals state
  const [activeKundaliProfile, setActiveKundaliProfile] = useState<Profile | null>(null);
  const [activePdfProfile, setActivePdfProfile] = useState<Profile | null>(null);
  const [activeContactProfile, setActiveContactProfile] = useState<Profile | null>(null);
  const [isCounselorOpen, setIsCounselorOpen] = useState<boolean>(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin Panel Enterprise States
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [authenticatedAdmin, setAuthenticatedAdmin] = useState<AdminUser | null>(null);
  const [activeAdminUser, setActiveAdminUser] = useState<AdminUser>(INITIAL_ADMIN_USERS[0]);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [payrollRecords, setPayrollRecords] = useState<MonthlyPayrollRecord[]>(INITIAL_PAYROLL_RECORDS);
  const [abandonedLeads, setAbandonedLeads] = useState<AbandonedRegistrationLead[]>(INITIAL_ABANDONED_LEADS);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const navigateTo = (screen: ScreenType) => {
    // MODULE RESTRICTION RULE 1: If an employee is logged in, cannot leave employee-portal without logging out
    if (activeEmployee && screen !== 'employee-portal') {
      setModuleLockState({
        targetScreen: screen,
        sourceModule: 'employee',
        activeEmployee,
      });
      return;
    }

    // MODULE RESTRICTION RULE 2: If an admin is logged in, cannot leave admin without logging out
    if (authenticatedAdmin && screen !== 'admin') {
      setModuleLockState({
        targetScreen: screen,
        sourceModule: 'admin',
        activeAdmin: authenticatedAdmin,
      });
      return;
    }

    // MODULE RESTRICTION RULE 3: If a member user is logged in, cannot access employee-portal, admin, or register without logging out
    if (currentUser && (screen === 'admin' || screen === 'employee-portal' || screen === 'register')) {
      setModuleLockState({
        targetScreen: screen,
        sourceModule: 'user',
        activeUser: currentUser,
      });
      return;
    }

    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    // If employee is logged in, cannot exit employee-portal
    if (activeEmployee && currentScreen === 'employee-portal') {
      setModuleLockState({
        targetScreen: 'dashboard',
        sourceModule: 'employee',
        activeEmployee,
      });
      return;
    }

    // If admin is logged in, cannot exit admin
    if (authenticatedAdmin && currentScreen === 'admin') {
      setModuleLockState({
        targetScreen: 'dashboard',
        sourceModule: 'admin',
        activeAdmin: authenticatedAdmin,
      });
      return;
    }

    const stackScreens = ['biodata', 'filter', 'plans', 'register', 'stories', 'admin', 'employee-portal'];
    if (stackScreens.includes(previousScreen)) {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen(previousScreen);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmModuleLogoutAndProceed = (targetScreen: ScreenType) => {
    if (!moduleLockState) return;

    if (moduleLockState.sourceModule === 'employee') {
      const empName = activeEmployee?.name || 'Employee';
      setActiveEmployee(null);
      showToast(`${empName} logged out safely.`);
    } else if (moduleLockState.sourceModule === 'admin') {
      const admName = authenticatedAdmin?.name || 'Admin';
      setAuthenticatedAdmin(null);
      showToast(`${admName} session locked and signed out.`);
    } else if (moduleLockState.sourceModule === 'user') {
      const usrName = currentUser?.name || 'Member';
      handleLogout();
      showToast(`${usrName} logged out safely.`);
    }

    setModuleLockState(null);
    setPreviousScreen(currentScreen);
    setCurrentScreen(targetScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEmployeeLogout = () => {
    if (activeEmployee) {
      showToast(`Thank you ${activeEmployee.name}! Safely logged out of Employee Portal.`);
    }
    setActiveEmployee(null);
    setCurrentScreen('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    if (authenticatedAdmin) {
      showToast('Admin session locked and logged out.');
    }
    setAuthenticatedAdmin(null);
    setCurrentScreen('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Abandoned / Help Request Lead capture
  const handleRecordAbandonedLead = (lead: AbandonedRegistrationLead) => {
    setAbandonedLeads((prev) => [
      lead,
      ...prev.filter((l) => l.id !== lead.id && l.phone !== lead.phone),
    ]);
  };

  const handleUpdateLeadStatus = (
    leadId: string,
    status: 'pending_callback' | 'in_touch' | 'converted'
  ) => {
    setAbandonedLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
  };

  // User Login & Logout
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.isPaidMember) {
      setUserSubscription({
        tier: (user.membershipPlan as any) || 'gold',
        planName: user.membershipPlan === 'platinum' ? 'प्लैटिनम योजना (Platinum Plan)' : 'गोल्ड योजना (Gold Plan)',
        isActive: true,
        contactsRemaining: 15,
        totalContacts: 15,
        activatedOn: 'सक्रिय सदस्यता (Active)',
        expiresOn: '6 महीने बाद',
        unlockedProfiles: ['shreya-mishra', 'priya-pandey'],
      });
    }
    // REQUIREMENT: When any user signs in from anywhere, redirect them to their own profile page!
    navigateTo('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserSubscription(INITIAL_USER_SUBSCRIPTION);
  };

  // Helper to activate a subscription
  const activateSubscription = (plan: SubscriptionPlan) => {
    setUserSubscription((prev) => {
      const updatedUnlocked = [...prev.unlockedProfiles];
      if (activeContactProfile && !updatedUnlocked.includes(activeContactProfile.id)) {
        updatedUnlocked.push(activeContactProfile.id);
      }

      return {
        tier: plan.id,
        planName: plan.hindiTitle,
        isActive: true,
        contactsRemaining: plan.contactCredits - (activeContactProfile ? 1 : 0),
        totalContacts: plan.contactCredits,
        activatedOn: 'आज (सक्रिय)',
        expiresOn: `${plan.durationMonths} महीने बाद`,
        unlockedProfiles: updatedUnlocked,
      };
    });

    showToast(`बधाई हो! ${plan.hindiTitle} सक्रिय हो गया। आपको ${plan.contactCredits} संपर्क क्रेडिट्स मिले 🎉`);
  };

  const handleUpgradeToPaid = (planTier: SubscriptionTier = 'gold', instantDemo: boolean = false) => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planTier) || SUBSCRIPTION_PLANS[1];
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (instantDemo) {
      activateSubscription(plan);
      setCurrentUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isPaidMember: true,
          membershipPlan: plan.id,
        };
      });
      showToast(`⭐ डेमो अपग्रेड सफल! ${plan.hindiTitle} सक्रिय हो गया। अब आप अनुशंसित रिश्ते (Recommended Matches) देख सकते हैं 🎉`);
      return;
    }

    setActivePaymentPlan(plan);
    setIsPaymentGatewayOpen(true);
  };

  // New Bride / Groom Registration with BDE Referral Code (starts as pending for Admin review)
  const handleRegisterProfile = (newProfile: Profile) => {
    const pendingProfile: Profile = {
      ...newProfile,
      approvalStatus: 'pending',
    };
    setProfiles((prev) => [pendingProfile, ...prev]);
    setSelectedProfile(pendingProfile);

    // Link to session or establish new user session for newly registered user
    const regInterests = {
      candidateAge: newProfile.age,
      caste: newProfile.caste,
      religion: newProfile.religion,
      state: newProfile.state,
      city: newProfile.nativeDistrict,
      preferredAgeMin: newProfile.partnerAgeMin,
      preferredAgeMax: newProfile.partnerAgeMax,
      preferredLocation: newProfile.partnerLocation,
      preferredCaste: newProfile.partnerCastePreference,
    };

    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        candidateName: `${newProfile.name} (${newProfile.gender === 'bride' ? 'सुपुत्री' : 'सुपुत्र'})`,
        candidateGender: newProfile.gender || 'bride',
        bdeCode: newProfile.bdeCode,
        bdeEmployeeName: newProfile.bdeEmployeeName,
        ...regInterests,
      });
    } else {
      setCurrentUser({
        id: `user-${Date.now()}`,
        name: newProfile.guardianName || newProfile.name,
        phone: newProfile.guardianPhone,
        avatar: newProfile.photos[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        role: 'family_guardian',
        candidateName: `${newProfile.name} (${newProfile.gender === 'bride' ? 'Bride' : 'Groom'})`,
        candidateGender: newProfile.gender || 'bride',
        bdeCode: newProfile.bdeCode,
        bdeEmployeeName: newProfile.bdeEmployeeName,
        isPaidMember: !!pendingPlan,
        membershipPlan: pendingPlan ? pendingPlan.id : 'free',
        ...regInterests,
      });
    }

    // If user attempted a direct plan purchase prior to registration, activate it automatically now
    if (pendingPlan) {
      activateSubscription(pendingPlan);
      setPendingPlan(null);
    }
  };

  // Admin Moderation actions
  const handleApproveProfile = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, approvalStatus: 'approved' } : p))
    );
  };

  const handleRejectProfile = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, approvalStatus: 'rejected' } : p))
    );
  };

  const handleAdminAddProfile = (newProfile: Profile) => {
    setProfiles((prev) => [newProfile, ...prev]);
  };

  const handleAdminDeleteProfile = (profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
  };

  // Accounts actions
  const handleAddTransaction = (txn: TransactionRecord) => {
    setTransactions((prev) => [txn, ...prev]);
  };

  const handleUpdateTxnStatus = (
    txnId: string,
    status: 'success' | 'pending' | 'refunded'
  ) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status } : t))
    );
  };

  // HR Employee actions
  const handleAddEmployee = (emp: Employee) => {
    setEmployees((prev) => [emp, ...prev]);
  };

  const handleUpdateEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
  };

  const handleDeleteEmployee = (empId: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== empId));
  };

  // Admin Users & RBAC actions
  const handleAddAdminUser = (user: AdminUser) => {
    setAdminUsers((prev) => [user, ...prev]);
  };

  const handleDeleteAdminUser = (userId: string) => {
    setAdminUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Attendance & Payroll actions
  const handleAddAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => [record, ...prev]);
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === record.id ? record : r))
    );
  };

  const handleSendPayrollToAccounts = (records: MonthlyPayrollRecord[]) => {
    setPayrollRecords((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newItems = records.filter((r) => !existingIds.has(r.id));
      const updatedExisting = prev.map((p) => {
        const found = records.find((r) => r.id === p.id);
        return found ? found : p;
      });
      return [...newItems, ...updatedExisting];
    });
  };

  const handleUpdatePayrollStatus = (
    payrollId: string,
    status: 'disbursed' | 'approved' | 'submitted_by_hr',
    utrRef?: string
  ) => {
    setPayrollRecords((prev) =>
      prev.map((p) => {
        if (p.id === payrollId) {
          return {
            ...p,
            status,
            utrRef: utrRef || p.utrRef,
            disbursedDate:
              status === 'disbursed'
                ? new Date().toLocaleDateString('hi-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : p.disbursedDate,
          };
        }
        return p;
      })
    );
  };

  // Open Subscription Modal with target candidate context
  const handleOpenSubscriptionModal = (candidateName?: string) => {
    setSubscriptionTargetCandidate(candidateName);
    setIsSubscriptionModalOpen(true);
  };

  // User activates / buys a subscription plan (from SubscriptionScreen or SubscriptionModal)
  const handleSelectPlan = (plan: SubscriptionPlan, _paymentMethod: string) => {
    // REQUIREMENT: When any user directly attempts to purchase any plan without registration,
    // redirect them to complete their matrimonial registration first!
    if (!currentUser) {
      setIsSubscriptionModalOpen(false);
      setPendingPlan(plan);
      showToast(`योजना खरीदने से पहले कृपया वर/वधू बायोडाटा का निःशुल्क पंजीकरण पूरा करें 🙏 (Please register first to purchase ${plan.hindiTitle})`);
      navigateTo('register');
      return;
    }

    // Launch Shubh Bandhan Payment Gateway Modal
    setIsSubscriptionModalOpen(false);
    setActivePaymentPlan(plan);
    setIsPaymentGatewayOpen(true);
  };

  const handlePaymentSuccess = (plan: SubscriptionPlan, txnRecord: TransactionRecord) => {
    activateSubscription(plan);
    setCurrentUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isPaidMember: true,
        membershipPlan: plan.id,
      };
    });
    setTransactions((prev) => [txnRecord, ...prev]);
    setIsPaymentGatewayOpen(false);
    showToast(`भुगतान सफल! (रसीद: ${txnRecord.txnId}) ${plan.hindiTitle} सक्रिय हो गया 🎉 अब आप अनुशंसित रिश्ते (Recommended Matches) देख सकते हैं`);
  };

  // Unlocking a specific candidate's phone / WhatsApp contact using 1 credit
  const handleUnlockContact = (profile: Profile) => {
    setUserSubscription((prev) => {
      if (prev.contactsRemaining <= 0) return prev;
      return {
        ...prev,
        contactsRemaining: prev.contactsRemaining - 1,
        unlockedProfiles: [...prev.unlockedProfiles, profile.id],
      };
    });
  };

  // Profile Selection for full Biodata Screen
  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setPreviousScreen(currentScreen);
    setCurrentScreen('biodata');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Send Proposal action
  const handleSendProposal = (targetProfile: Profile) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === targetProfile.id) {
          return { ...p, proposalStatus: 'sent' };
        }
        return p;
      })
    );
    setSelectedProfile((curr) =>
      curr.id === targetProfile.id ? { ...curr, proposalStatus: 'sent' } : curr
    );
    showToast(`${targetProfile.name} जी के परिवार को आपका प्रस्ताव भेज दिया गया है 🙏`);
  };

  // Shortlist toggle
  const handleToggleShortlist = (targetProfile: Profile) => {
    const isNowShortlisted = !targetProfile.isShortlisted;
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === targetProfile.id ? { ...p, isShortlisted: isNowShortlisted } : p
      )
    );
    setSelectedProfile((curr) =>
      curr.id === targetProfile.id ? { ...curr, isShortlisted: isNowShortlisted } : curr
    );
    showToast(
      isNowShortlisted
        ? `${targetProfile.name} की प्रोफ़ाइल पसंदीदा सूची (Shortlist) में सहेजी गई ⭐`
        : `${targetProfile.name} की प्रोफ़ाइल पसंदीदा सूची से हटाई गई`
    );
  };

  // Accept Proposal
  const handleAcceptProposal = (targetProfile: Profile) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === targetProfile.id ? { ...p, proposalStatus: 'accepted' } : p
      )
    );
    showToast(`${targetProfile.name} जी का रिश्ता स्वीकार किया गया! संपर्क विवरण साझा कर दिया गया है 🎉`);
  };

  // Decline Proposal
  const handleDeclineProposal = (targetProfile: Profile) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === targetProfile.id ? { ...p, proposalStatus: 'declined' } : p
      )
    );
    showToast(`${targetProfile.name} जी का रिश्ता सम्मानपूर्वक अस्वीकार किया गया।`);
  };

  // Filter application from FilterScreen
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilterState(newFilters);
    setSelectedFilterChip('all');
    setCurrentScreen('feed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setFilterState(INITIAL_FILTERS);
    setSelectedFilterChip('all');
  };

  // Filtered profiles derivation
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // Pending review BDE profiles must not appear on public feed until approved by admin
      if (p.approvalStatus === 'pending') return false;

      // If user is signed in: strictly filter by target gender needed!
      // If candidate is bride -> user looking for groom -> only grooms
      // If candidate is groom -> user looking for bride -> only brides
      if (currentUser) {
        const targetGender = currentUser.candidateGender === 'groom' ? 'bride' : 'groom';
        if (p.gender !== targetGender) return false;
      }

      // Quick Chip filter
      if (selectedFilterChip === 'govt' && !p.isGovtJob) return false;
      if (selectedFilterChip === 'district' && p.nativeDistrict !== selectedCity) return false;
      if (selectedFilterChip === 'veg' && !p.diet.includes('शाकाहारी')) return false;
      if (selectedFilterChip === 'guna28' && p.gunScore < 28) return false;

      // Advanced filters check
      if (filterState.districts.length > 0 && !filterState.districts.includes(p.nativeDistrict)) {
        if (!filterState.radius50km) return false;
      }
      if (p.gunScore < filterState.minGun) return false;
      if (filterState.manglik === 'केवल गैर-मांगलिक' && p.manglikStatus !== 'मांगलिक नहीं') {
        return false;
      }
      return true;
    });
  }, [profiles, selectedFilterChip, filterState, selectedCity]);

  // Badges count
  const shortlistCount = profiles.filter((p) => p.isShortlisted).length;
  const chatsCount = profiles.filter(
    (p) => p.proposalStatus === 'received' || p.proposalStatus === 'accepted'
  ).length;

  const isStackScreen = ['biodata', 'filter', 'plans', 'register', 'stories', 'admin', 'employee-portal'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#1f1b14] flex flex-col font-['Noto_Sans',sans-serif]">
      {/* Top Universal Header */}
      <Header
        currentScreen={currentScreen}
        selectedCity={selectedCity}
        selectedLanguage={selectedLanguage}
        currentUser={currentUser}
        userSubscription={userSubscription}
        activeEmployee={activeEmployee}
        authenticatedAdmin={authenticatedAdmin}
        onEmployeeLogout={handleEmployeeLogout}
        onAdminLogout={handleAdminLogout}
        onOpenCityModal={() => setIsCityModalOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenSubscriptionModal={() => handleOpenSubscriptionModal()}
        onOpenAuthModal={() => {
          if (activeEmployee) {
            setModuleLockState({
              targetScreen: 'profile',
              sourceModule: 'employee',
              activeEmployee,
            });
            return;
          }
          if (authenticatedAdmin) {
            setModuleLockState({
              targetScreen: 'profile',
              sourceModule: 'admin',
              activeAdmin: authenticatedAdmin,
            });
            return;
          }
          setIsAuthModalOpen(true);
        }}
        onNavigate={navigateTo}
        onBack={handleBack}
      />

      {/* Main Screen Swapper */}
      <main className="flex-1 w-full bg-[#fff8f3] relative">
        {/* Fully Functional Integrated Dashboard Screen */}
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            currentUser={currentUser}
            profiles={profiles}
            userSubscription={userSubscription}
            onLogin={handleLogin}
            onNavigate={navigateTo}
            onSelectProfile={handleSelectProfile}
            onSendProposal={handleSendProposal}
            onOpenSubscriptionModal={handleOpenSubscriptionModal}
            onOpenCounselorModal={() => setIsCounselorOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenPdfModal={(p) => setActivePdfProfile(p)}
            onUpgradeToPaid={handleUpgradeToPaid}
            onToast={showToast}
          />
        )}

        {/* Feed Screen */}
        {currentScreen === 'feed' && (
          <FeedScreen
            profiles={filteredProfiles}
            selectedFilterChip={selectedFilterChip}
            userSubscription={userSubscription}
            onSelectFilterChip={(chip) => {
              setSelectedFilterChip(chip);
              showToast(`फ़िल्टर बदला गया: ${chip}`);
            }}
            onSelectProfile={handleSelectProfile}
            onSendProposal={handleSendProposal}
            onToggleShortlist={handleToggleShortlist}
            onOpenFatherCall={(p) => setActiveContactProfile(p)}
            onOpenKundali={(p) => setActiveKundaliProfile(p)}
            onOpenCounselorModal={() => setIsCounselorOpen(true)}
            onNavigate={navigateTo}
            onToast={showToast}
          />
        )}

        {/* Biodata Details Screen */}
        {currentScreen === 'biodata' && (
          <BiodataScreen
            profile={selectedProfile}
            userSubscription={userSubscription}
            onSendProposal={handleSendProposal}
            onToggleShortlist={handleToggleShortlist}
            onOpenFatherCall={(p) => setActiveContactProfile(p)}
            onOpenKundali={(p) => setActiveKundaliProfile(p)}
            onOpenPdfModal={(p) => setActivePdfProfile(p)}
            onToast={showToast}
          />
        )}

        {/* Chats & Requests Screen */}
        {currentScreen === 'chats' && (
          <ChatsScreen
            profiles={profiles}
            currentUser={currentUser}
            onSelectProfile={handleSelectProfile}
            onAcceptProposal={handleAcceptProposal}
            onDeclineProposal={handleDeclineProposal}
            onOpenFatherCall={(p) => setActiveContactProfile(p)}
            onOpenCounselorModal={() => setIsCounselorOpen(true)}
            onToast={showToast}
          />
        )}

        {/* Filter Screen */}
        {currentScreen === 'filter' && (
          <FilterScreen
            filterState={filterState}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            onToast={showToast}
          />
        )}

        {/* Profile Screen */}
        {currentScreen === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
            profiles={profiles}
            userSubscription={userSubscription}
            onNavigate={navigateTo}
            onOpenSubscriptionModal={() => handleOpenSubscriptionModal()}
            onOpenCounselorModal={() => setIsCounselorOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onToast={showToast}
          />
        )}

        {/* Subscription Plans Screen */}
        {currentScreen === 'plans' && (
          <SubscriptionScreen
            userSubscription={userSubscription}
            isRegistered={!!currentUser}
            onSelectPlan={(plan, method) => {
              handleSelectPlan(plan, method);
              if (currentUser) {
                navigateTo('dashboard');
              }
            }}
            onToast={showToast}
          />
        )}

        {/* Bride & Groom Registration Screen with BDE Code Tracking & Abandoned Lead Capture */}
        {currentScreen === 'register' && (
          <RegistrationScreen
            onRegisterProfile={handleRegisterProfile}
            onRecordAbandonedLead={handleRecordAbandonedLead}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            pendingPlan={pendingPlan}
            onNavigate={navigateTo}
            onToast={showToast}
          />
        )}

        {/* Success Stories Screen */}
        {currentScreen === 'stories' && (
          <StoriesScreen
            onNavigate={navigateTo}
            onToast={showToast}
          />
        )}

        {/* Login-based Employee Attendance Panel */}
        {currentScreen === 'employee-portal' && (
          <EmployeePortalScreen
            employees={employees}
            attendanceRecords={attendanceRecords}
            activeEmployee={activeEmployee}
            onSetEmployee={(emp) => setActiveEmployee(emp)}
            onAddAttendance={handleAddAttendance}
            onNavigate={navigateTo}
            onToast={showToast}
          />
        )}

        {/* Central Enterprise Admin Panel with Authentication Gate */}
        {currentScreen === 'admin' && (
          !authenticatedAdmin ? (
            <AdminLoginScreen
              adminUsers={adminUsers}
              onAdminLoginSuccess={(admin) => {
                setAuthenticatedAdmin(admin);
                setActiveAdminUser(admin);
              }}
              onNavigateHome={() => navigateTo('dashboard')}
              onToast={showToast}
            />
          ) : (
            <AdminScreen
              profiles={profiles}
              adminUsers={adminUsers}
              employees={employees}
              transactions={transactions}
              activeAdminUser={activeAdminUser}
              attendanceRecords={attendanceRecords}
              payrollRecords={payrollRecords}
              abandonedLeads={abandonedLeads}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onNavigate={navigateTo}
              onApproveProfile={handleApproveProfile}
              onRejectProfile={handleRejectProfile}
              onAddProfile={handleAdminAddProfile}
              onDeleteProfile={handleAdminDeleteProfile}
              onAddTransaction={handleAddTransaction}
              onUpdateTxnStatus={handleUpdateTxnStatus}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onAddAttendance={handleAddAttendance}
              onUpdateAttendance={handleUpdateAttendance}
              onSendPayrollToAccounts={handleSendPayrollToAccounts}
              onUpdatePayrollStatus={handleUpdatePayrollStatus}
              onSelectActiveAdmin={(u) => setActiveAdminUser(u)}
              onAddAdminUser={handleAddAdminUser}
              onDeleteAdminUser={handleDeleteAdminUser}
              onToast={showToast}
              onAdminLogout={() => {
                setAuthenticatedAdmin(null);
                showToast('Admin session locked and logged out.');
                navigateTo('dashboard');
              }}
            />
          )
        )}
      </main>

      {/* Persistent Bottom Nav (shown on primary tabs) */}
      {!isStackScreen && (
        <BottomNav
          currentScreen={currentScreen}
          shortlistCount={shortlistCount}
          chatsCount={chatsCount}
          onNavigate={navigateTo}
        />
      )}

      {/* User Auth & Login/Logout Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onClose={() => setIsAuthModalOpen(false)}
        onToast={showToast}
      />

      {/* Kundali Lagna Chakra Modal */}
      <KundaliModal
        profile={activeKundaliProfile}
        onClose={() => setActiveKundaliProfile(null)}
      />

      {/* Formatted Lagna Patrika Biodata PDF Modal */}
      <BiodataPdfModal
        profile={activePdfProfile}
        onClose={() => setActivePdfProfile(null)}
        onToast={showToast}
      />

      {/* Direct Contact Modal with Subscription Unlock Gate */}
      <ContactModal
        profile={activeContactProfile}
        userSubscription={userSubscription}
        onUnlockContact={handleUnlockContact}
        onOpenSubscriptionModal={(candName) => handleOpenSubscriptionModal(candName)}
        onClose={() => setActiveContactProfile(null)}
        onToast={showToast}
      />

      {/* Subscription Paywall Checkout Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        userSubscription={userSubscription}
        candidateName={subscriptionTargetCandidate}
        isRegistered={!!currentUser}
        onSelectPlan={handleSelectPlan}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onToast={showToast}
      />

      {/* Integrated Shubh Bandhan Payment Gateway Modal (UPI QR, Cards 3D-Secure, NetBanking, Wallets) */}
      <PaymentGatewayModal
        isOpen={isPaymentGatewayOpen}
        plan={activePaymentPlan}
        currentUser={currentUser}
        candidateName={subscriptionTargetCandidate || currentUser?.candidateName}
        onPaymentSuccess={handlePaymentSuccess}
        onClose={() => setIsPaymentGatewayOpen(false)}
        onToast={showToast}
      />

      {/* Counselor Callback Modal */}
      <CounselorModal
        isOpen={isCounselorOpen}
        onClose={() => setIsCounselorOpen(false)}
        onToast={showToast}
      />

      {/* City and Language Modals */}
      <CityModal
        isOpen={isCityModalOpen}
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          setSelectedCity(city);
          showToast(`ज़िला बदलकर ${city} किया गया`);
        }}
        onClose={() => setIsCityModalOpen(false)}
      />

      <LanguageModal
        isOpen={isLanguageModalOpen}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={(lang) => {
          setSelectedLanguage(lang);
          showToast(`भाषा बदलकर ${lang} की गई`);
        }}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* Toast Notification Banner */}
      <Toast message={toastMessage} />

      {/* Cross-Module Navigation Lock & Protection Modal */}
      <ModuleLockModal
        lockState={moduleLockState}
        onClose={() => setModuleLockState(null)}
        onConfirmLogoutAndProceed={handleConfirmModuleLogoutAndProceed}
      />
    </div>
  );
}
