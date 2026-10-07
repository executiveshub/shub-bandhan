export interface Profile {
  id: string;
  code: string; // e.g. "SB-94821"
  name: string;
  age: number;
  height: string; // e.g. "5 फीट 3 इंच (160 सेमी)"
  gotra: string;
  maternalGotra?: string;
  community: string; // e.g. "सनातन ब्राह्मण (भारद्वाज गोत्र)"
  education: string;
  profession: string;
  professionTag?: string; // e.g. "सहायक अध्यापिका (सरकारी स्कूल, अयोध्या)"
  isGovtJob?: boolean;
  nativePlace: string; // "बीकापुर, ज़िला अयोध्या (उ.प्र.)"
  nativeDistrict: string; // "अयोध्या"
  currentCity: string; // "लखनऊ (आशियाना) में सपरिवार"
  diet: 'शुद्ध शाकाहारी' | 'सात्विक' | 'शाकाहारी' | 'Vegetarian' | 'Pure Vegetarian' | 'Satvik' | string;
  familyValues: string;
  familySummary: string;
  familyType: 'संयुक्त' | 'एकल' | 'दोनों' | 'Joint Family' | 'Nuclear Family' | 'Both' | string;
  landProperty: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  siblings: string;
  paternalVillage: string; // दादाल
  maternalVillage: string; // ननिहाल
  paternalPravara?: string;
  maternalBranch?: string;
  gunScore: number; // e.g. 30 (out of 36)
  gunSummary: string; // "अति उत्तम मंगल मिलान (30/36 गुण) • नाड़ी दोष मुक्त"
  birthDate: string; // "14 अक्टूबर 2000, 06:15 AM"
  birthPlace: string; // "अयोध्या, उत्तर प्रदेश"
  manglikStatus: 'मांगलिक नहीं' | 'मांगलिक' | 'आंशिक मांगलिक' | 'Non-Manglik' | 'Manglik' | 'Anshik Manglik' | string;
  rashiNakshatra: string; // "मेष राशि • अश्विनी"
  partnerAgeRange: string;
  partnerHeightRange: string;
  partnerEducationJob: string;
  partnerDiet: string;
  partnerValues: string;
  photos: string[];
  badges: string[];
  managedBy: 'माता-पिता द्वारा संचालित' | 'भाई द्वारा संचालित' | 'पिता द्वारा संचालित' | 'अभिभावक द्वारा संचालित' | 'Managed by Parents' | 'Managed by Father' | 'Managed by Brother' | 'Managed by Self' | string;
  guardianName: string;
  guardianPhone: string;
  guardianWhatsApp: string;
  isShortlisted?: boolean;
  proposalStatus?: 'none' | 'sent' | 'received' | 'accepted' | 'declined';
  audioNoteDuration?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  verificationLevel?: string;
  verificationCode?: string;
  verifiedDate?: string;
  gender?: 'bride' | 'groom';
  email?: string; // Optional email for bride/groom
  state?: 'Uttar Pradesh' | 'Bihar' | string;
  religion?: 'Hindu' | 'Muslim' | 'Sikh' | 'Christian' | 'Jain' | 'Buddhist' | string;
  caste?: string;
  partnerAgeMin?: number;
  partnerAgeMax?: number;
  partnerLocation?: string;
  partnerCastePreference?: string;
  bdeCode?: string;
  bdeEmployeeName?: string;
  bdeBranch?: string;
  registeredAt?: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  revenueGenerated?: number;
  planSubscribed?: string;
  createdDate?: string;
}

export interface FilterState {
  state: string; // 'all' | 'Uttar Pradesh' | 'Bihar'
  districts: string[];
  religion?: string; // 'all' | 'Hindu' | 'Muslim' | 'Sikh' | 'Christian' | 'Jain' | 'Buddhist'
  caste?: string;
  radius50km: boolean;
  community: string;
  excludeSelfGotra: boolean;
  excludeMaternalGotra: boolean;
  diet: string[];
  jobTypes: string[];
  manglik: string;
  minGun: number;
  familyType: string;
  guardianManagedOnly: boolean;
}

export type ScreenType =
  | 'feed'
  | 'dashboard'
  | 'biodata'
  | 'chats'
  | 'filter'
  | 'profile'
  | 'plans'
  | 'register'
  | 'stories'
  | 'admin'
  | 'employee-portal';

export interface AbandonedRegistrationLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender: 'bride' | 'groom';
  district: string;
  abandonedStage: string; // e.g. "व्यक्तिगत विवरण भरते समय छोड़ा", "फ़ोटो स्लॉट पर छोड़ा", "अभिभावक विवरण पर रुका", "सहायता अनुरोध"
  timestamp: string;
  assignedBde?: string;
  status: 'pending_callback' | 'in_touch' | 'converted';
  notes?: string;
  leadSource?: 'form_dropoff' | 'help_request_call' | 'support_click';
}

export type AdminModule = 'all' | 'moderation' | 'accounts' | 'hr' | 'sales';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleTitle: string;
  allowedModule: AdminModule;
  status: 'active' | 'inactive';
  lastActive: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  role: 'BDM' | 'BDE' | 'Relationship Manager' | 'Accounts Officer' | 'HR Manager' | 'Field Verifier';
  branch: string;
  phone: string;
  email: string;
  photoUrl: string; // Official Passport size photograph
  monthlySalary: number; // Monthly Base Salary (₹)
  cvFileName: string; // e.g. "Amit_Singh_CV_2026.pdf"
  cvFileUrl?: string;
  cvUploadedDate?: string;
  aadhaarNumber: string;
  isAadhaarVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  onboardedCount: number;
  monthlyTarget: number;
  status: 'active' | 'probation' | 'suspended';
  joiningDate: string;
  commissionEarned: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // "2026-10-06"
  checkInTime: string; // "09:28 AM"
  checkOutTime?: string; // "06:35 PM"
  status: 'present' | 'half_day' | 'leave' | 'absent' | 'field_duty';
  location: string;
  notes?: string;
  isDiscrepancy?: boolean;
  discrepancyResolved?: boolean;
}

export interface MonthlyPayrollRecord {
  id: string;
  monthYear: string; // e.g. "अक्टूबर 2026"
  employeeId: string;
  employeeName: string;
  role: string;
  branch: string;
  photoUrl: string;
  baseSalary: number;
  totalWorkingDays: number;
  presentDays: number;
  leaveDays: number;
  absentDays: number;
  payableDays: number;
  incentives: number;
  deductions: number;
  netPayableAmount: number;
  status: 'draft' | 'submitted_by_hr' | 'approved' | 'disbursed';
  disbursedDate?: string;
  paymentMode?: string;
  utrRef?: string;
  hrRemarks?: string;
}

export interface TransactionRecord {
  id: string;
  txnId: string;
  timestamp: string;
  userId: string;
  userName: string;
  userPhone: string;
  candidateName: string;
  planId: SubscriptionTier;
  planName: string;
  amount: number;
  paymentMethod: string;
  status: 'success' | 'pending' | 'refunded';
  bdeCode?: string;
  gatewayRef: string;
}

export interface SuccessStory {
  id: string;
  coupleNames: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  location: string;
  gunScore: number;
  storyHindi: string;
  parentQuote: string;
  parentName: string;
  photo: string;
  bdeAssisted?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  city: string;
  candidateName: string;
  candidateGender: 'groom' | 'bride';
  avatar: string;
  bdeCode?: string;
  bdeEmployeeName?: string;
  isPaidMember?: boolean;
  membershipPlan?: string;
  candidateAge?: number;
  caste?: string;
  religion?: string;
  state?: 'Uttar Pradesh' | 'Bihar' | string;
  preferredAgeMin?: number;
  preferredAgeMax?: number;
  preferredLocation?: string;
  preferredCaste?: string;
}

export interface MatchScoreBreakdown {
  totalScore: number; // 0 to 100 percentage
  ageScore: number; // max 35
  locationScore: number; // max 35
  casteScore: number; // max 30
  ageReason: string;
  locationReason: string;
  casteReason: string;
}

export type SubscriptionTier = 'free' | 'silver' | 'gold' | 'platinum';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  title: string;
  hindiTitle: string;
  tagline: string;
  price: number;
  originalPrice: number;
  durationMonths: number;
  contactCredits: number; // e.g. 15, 40, unlimited (-1)
  popular?: boolean;
  badge?: string;
  features: string[];
  rmAssist?: boolean;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  planName: string;
  isActive: boolean;
  contactsRemaining: number;
  totalContacts: number;
  activatedOn?: string;
  expiresOn?: string;
  unlockedProfiles: string[]; // IDs of bride/groom profiles whose contact has been unlocked
}
