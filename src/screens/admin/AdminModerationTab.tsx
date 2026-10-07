import React, { useState, useMemo } from 'react';
import { Profile } from '../../types/matrimony';
import { exportToCsv } from '../../utils/exportToExcel';

interface AdminModerationTabProps {
  profiles: Profile[];
  onApproveProfile: (profileId: string) => void;
  onRejectProfile: (profileId: string) => void;
  onAddProfile: (profile: Profile) => void;
  onDeleteProfile: (profileId: string) => void;
  onToast: (msg: string) => void;
}

export const AdminModerationTab: React.FC<AdminModerationTabProps> = ({
  profiles,
  onApproveProfile,
  onRejectProfile,
  onAddProfile,
  onDeleteProfile,
  onToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [filterGender, setFilterGender] = useState<'all' | 'bride' | 'groom'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectProfile, setInspectProfile] = useState<Profile | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Profile Form State
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'bride' | 'groom'>('bride');
  const [newAge, setNewAge] = useState(24);
  const [newCommunity, setNewCommunity] = useState('Sanatan Brahmin');
  const [newDistrict, setNewDistrict] = useState('Varanasi');
  const [newProfession, setNewProfession] = useState('Teacher / Banking Officer');
  const [newFatherName, setNewFatherName] = useState('Shri Ram Prasad');
  const [newPhone, setNewPhone] = useState('+91 94150 11223');
  const [newBdeCode, setNewBdeCode] = useState('BDM-UP-1042');
  const [newRevenue, setNewRevenue] = useState(2999);
  const [newPlan, setNewPlan] = useState('gold');

  // Post Card Photos for Admin Onboarding (Min 1, Max 3)
  const [newPostCardPhotos, setNewPostCardPhotos] = useState<string[]>([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCf5dmQRpwPxLfTD2fJjiW__9rwdWkbddccIHcjN1x4Yn4eEy9gN4CR5eQwtl_ZpJgnKT8dXkUoKA_Lfzg9lvnKR3ToEmt5swJrklQxESfs58dxcxbPdjQ-_iu0aJfy1U08AOKEm3KSF01qtaK6uKarLCCGGmVl8kln-Z1BsbDt0swr1845clBAJQ3efD7Sb8NOWGARpkk-yMYLRlbCmwK8J_ncI6lgjpYMoSn7lx8JhArdHNKe4yCy',
  ]);

  const filteredList = useMemo(() => {
    return profiles.filter((p) => {
      if (filterStatus === 'pending' && p.approvalStatus !== 'pending') return false;
      if (filterStatus === 'approved' && p.approvalStatus === 'pending') return false;
      if (filterGender !== 'all' && p.gender !== filterGender) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.bdeCode && p.bdeCode.toLowerCase().includes(q)) ||
          p.guardianPhone.includes(q)
        );
      }
      return true;
    });
  }, [profiles, filterStatus, filterGender, searchTerm]);

  const handleExport = () => {
    const exportData = filteredList.map((p) => ({
      'Profile Code': p.code,
      'Name': p.name,
      'Gender': p.gender === 'groom' ? 'Groom' : 'Bride',
      'Age': `${p.age} yrs`,
      'Community': p.community,
      'District': p.nativeDistrict,
      'Approval Status': p.approvalStatus === 'pending' ? 'Pending Review' : 'Approved Live',
      'BDE Code': p.bdeCode || 'Organic',
      'Guardian Phone': p.guardianPhone,
      'Revenue': `₹ ${p.revenueGenerated || 0}`,
    }));
    exportToCsv(`ShubhBandhan_Moderation_${filterStatus}`, exportData);
    onToast(`Moderation directory exported to Excel! 📑`);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      onToast('Please enter full name');
      return;
    }

    const codeNum = Math.floor(10000 + Math.random() * 90000);
    const createdProfile: Profile = {
      id: `admin-created-${Date.now()}`,
      code: `SB-${codeNum}`,
      name: newName.trim(),
      age: Number(newAge),
      height: "5 ft 4 in (162 cm)",
      gotra: 'Kashyap',
      community: newCommunity,
      education: 'Postgraduate (Master Degree)',
      profession: newProfession,
      professionTag: newProfession,
      nativePlace: `${newDistrict} (U.P.)`,
      nativeDistrict: newDistrict,
      currentCity: `${newDistrict}`,
      diet: 'Vegetarian',
      familyValues: 'Traditional cultured family with high values.',
      familySummary: `Father: ${newFatherName}, cultured family`,
      familyType: 'Joint Family',
      landProperty: `Residential and agricultural property in ${newDistrict}`,
      fatherName: newFatherName,
      fatherOccupation: 'Government Service / Business',
      motherName: 'Homemaker',
      motherOccupation: 'Homemaker',
      siblings: '1 Brother, 1 Sister',
      paternalVillage: `Village near ${newDistrict}`,
      maternalVillage: 'Maternal Family',
      gunScore: 30,
      gunSummary: '30 Guna Matching • Auspicious',
      birthDate: '15 Oct 2000, 07:00 AM',
      birthPlace: `${newDistrict}, Uttar Pradesh`,
      manglikStatus: 'Non-Manglik',
      rashiNakshatra: 'Tula Rashi • Swati',
      partnerAgeRange: '25 to 29 yrs',
      partnerHeightRange: "5'5\" to 6'0\"",
      partnerEducationJob: 'Well educated, professional or business background',
      partnerDiet: 'Vegetarian',
      partnerValues: 'Family values and cultural respect',
      photos: newPostCardPhotos.length > 0 ? newPostCardPhotos : [
        newGender === 'groom'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKoEM-Z9bgHxFQ1n6mU1GUY8g3szSmFqsodajWoAtMpRLOQxmibog7YkYDuEoWPQDSsN8Sq6WzRfd300EB7C5dxN3z31uRo2Wi6mI_-RImWh7KpblArI4TFEPG_P_AdkZV4eoe2-cfLRL2_ax4nXlDPJsgLQ2hCaCzpuNthaklUtQrjzDqFEYYd54oL9VQqc_Piws9Uyx89xBQjOexASMrRgCnTIuhe-wy7kT42VgA_bVdLSbkDZV8'
          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf5dmQRpwPxLfTD2fJjiW__9rwdWkbddccIHcjN1x4Yn4eEy9gN4CR5eQwtl_ZpJgnKT8dXkUoKA_Lfzg9lvnKR3ToEmt5swJrklQxESfs58dxcxbPdjQ-_iu0aJfy1U08AOKEm3KSF01qtaK6uKarLCCGGmVl8kln-Z1BsbDt0swr1845clBAJQ3efD7Sb8NOWGARpkk-yMYLRlbCmwK8J_ncI6lgjpYMoSn7lx8JhArdHNKe4yCy',
      ],
      badges: ['Admin Verified', 'Managed by Family', `${newPostCardPhotos.length} Post Card Photos`],
      managedBy: 'Managed by Parents',
      guardianName: newFatherName,
      guardianPhone: newPhone,
      guardianWhatsApp: newPhone,
      isShortlisted: false,
      proposalStatus: 'none',
      isVerified: true,
      verificationStatus: 'Admin Verified (Authentic)',
      verificationLevel: 'Tier-1 Gold Trust',
      verificationCode: `SB-ADM-VRF-${codeNum}`,
      verifiedDate: 'Today (Active)',
      gender: newGender,
      approvalStatus: 'approved', // Directly Live
      revenueGenerated: Number(newRevenue),
      planSubscribed: newPlan,
      bdeCode: newBdeCode,
      bdeEmployeeName: 'Direct Admin Onboarding',
      registeredAt: 'Today (Admin)',
      createdDate: new Date().toISOString().slice(0, 10),
    };

    onAddProfile(createdProfile);
    setIsAddModalOpen(false);
    setNewName('');
    onToast(`New profile ${createdProfile.code} (${createdProfile.name}) created and published live! 🎉`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white p-5 rounded-2xl border border-[#e3bfb4]/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#ab3100] bg-[#ffdcc3] px-2 py-0.5 rounded">
            User Moderation & Review Workflow
          </span>
          <h2 className="text-xl font-bold text-[#1f1b14] mt-1 font-['Noto_Sans']">
            Candidate Onboarding & Profile Moderation
          </h2>
          <p className="text-[12px] text-[#5a4139] mt-0.5">
            Profiles onboarded by BDEs go live only after administrative audit and approval.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#ab3100] hover:bg-[#852400] text-white text-[12px] font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">person_add</span>
            <span>+ Add New Profile</span>
          </button>
          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-[#107c41] hover:bg-[#0c6233] text-white text-[12px] font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">table_view</span>
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Status Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#e3bfb4]/60 shadow-xs flex flex-wrap items-center justify-between gap-3 text-[12px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#5a4139]">Status:</span>
          <div className="flex items-center bg-[#fdfaf7] p-1 rounded-lg border border-[#e3bfb4]/50">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                filterStatus === 'pending' ? 'bg-[#ab3100] text-white shadow-xs' : 'text-[#ab3100] hover:bg-[#ffdcc3]'
              }`}
            >
              Pending Review ({profiles.filter((p) => p.approvalStatus === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                filterStatus === 'approved' ? 'bg-green-700 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved / Live ({profiles.filter((p) => p.approvalStatus !== 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                filterStatus === 'all' ? 'bg-gray-800 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({profiles.length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-[#e3bfb4] bg-white text-[#1f1b14] font-medium"
          >
            <option value="all">All Genders</option>
            <option value="bride">Brides</option>
            <option value="groom">Grooms</option>
          </select>

          <input
            type="text"
            placeholder="Search by name, code, or BDE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#e3bfb4] bg-white text-[#1f1b14] min-w-[200px]"
          />
        </div>
      </div>

      {/* Moderation List / Cards */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#e3bfb4]/40 text-center text-[#5a4139]">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">fact_check</span>
            <p className="font-bold text-[15px]">No Profiles Found</p>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {filterStatus === 'pending'
                ? 'All candidate submissions have been reviewed and approved! No pending requests.'
                : 'No candidate records match the active filter criteria.'}
            </p>
          </div>
        ) : (
          filteredList.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border p-4.5 shadow-xs transition-all ${
                p.approvalStatus === 'pending'
                  ? 'border-[#ffb59e] bg-[#fffbf9]'
                  : 'border-[#e3bfb4]/60 hover:border-[#ab3100]/40'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Candidate Info */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={p.photos[0] || 'https://via.placeholder.com/100'}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#e3bfb4] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-[16px] text-[#1f1b14]">{p.name}</h4>
                      <span className="font-mono text-[11px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                        {p.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.gender === 'groom' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {p.gender === 'groom' ? 'Groom' : 'Bride'}
                      </span>
                      {p.approvalStatus === 'pending' ? (
                        <span className="text-[10px] font-bold bg-[#ffdcc3] text-[#ab3100] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ab3100] animate-ping"></span>
                          Pending Review
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Approved & Live
                        </span>
                      )}
                    </div>

                    <p className="text-[12px] text-[#5a4139] mt-1 font-medium">
                      {p.age} yrs • {p.community} • {p.nativeDistrict} • {p.profession}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-gray-600 mt-1.5 flex-wrap">
                      <span>Guardian: <strong className="text-gray-800">{p.fatherName}</strong> ({p.guardianPhone})</span>
                      <span>•</span>
                      <span>
                        BDE Code:{' '}
                        <strong className="text-[#ab3100] font-mono">{p.bdeCode || 'Organic'}</strong>
                        {p.bdeEmployeeName && ` (${p.bdeEmployeeName})`}
                      </span>
                      <span>•</span>
                      <span>
                        Revenue: <strong className="text-green-700">₹{p.revenueGenerated || 0}</strong> ({p.planSubscribed?.toUpperCase() || 'FREE'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setInspectProfile(p)}
                    className="px-3 py-1.5 rounded-lg border border-[#e3bfb4] hover:bg-[#fdf2e6] text-[#5a4139] text-[12px] font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Full Details</span>
                  </button>

                  {p.approvalStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          onApproveProfile(p.id);
                          onToast(`Verification complete! ${p.name} (${p.code}) approved and published live 🎉`);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[12px] font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Approve & Publish</span>
                      </button>

                      <button
                        onClick={() => {
                          onRejectProfile(p.id);
                          onToast(`${p.name}'s request rejected. Notified BDE.`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-[12px] font-bold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {/* Delete Profile button */}
                  <button
                    onClick={() => setDeleteConfirmId(p.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Permanently Delete Profile"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inspect Profile Modal */}
      {inspectProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-[18px] text-[#1f1b14]">
                Biodata Review: {inspectProfile.name} ({inspectProfile.code})
              </h3>
              <button
                onClick={() => setInspectProfile(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex gap-3">
              <img
                src={inspectProfile.photos[0]}
                alt={inspectProfile.name}
                className="w-20 h-24 rounded-xl object-cover border"
              />
              <div className="text-[12px] space-y-1">
                <p><strong>Age & Height:</strong> {inspectProfile.age} yrs, {inspectProfile.height}</p>
                <p><strong>Gotra:</strong> {inspectProfile.gotra} (Maternal: {inspectProfile.maternalGotra || '—'})</p>
                <p><strong>Community:</strong> {inspectProfile.community}</p>
                <p><strong>Education & Profession:</strong> {inspectProfile.education} • {inspectProfile.profession}</p>
                <p><strong>Native Place:</strong> {inspectProfile.nativePlace}</p>
              </div>
            </div>

            <div className="bg-[#fdfaf7] p-3 rounded-xl border border-[#e3bfb4]/40 text-[12px] space-y-1">
              <p><strong>Father / Guardian:</strong> {inspectProfile.fatherName} ({inspectProfile.fatherOccupation})</p>
              <p><strong>Mother:</strong> {inspectProfile.motherName} ({inspectProfile.motherOccupation})</p>
              <p><strong>Contact Phone:</strong> {inspectProfile.guardianPhone}</p>
              <p><strong>Property & Assets:</strong> {inspectProfile.landProperty}</p>
              <p><strong>BDE Representative:</strong> {inspectProfile.bdeCode || 'Organic'} ({inspectProfile.bdeEmployeeName || '—'})</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setInspectProfile(null)}
                className="px-4 py-2 border rounded-xl text-gray-700 text-[12px] font-bold"
              >
                Close
              </button>
              {inspectProfile.approvalStatus === 'pending' && (
                <button
                  onClick={() => {
                    onApproveProfile(inspectProfile.id);
                    setInspectProfile(null);
                    onToast(`Approved and published live: ${inspectProfile.name} 🎉`);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[12px] font-bold"
                >
                  Approve & Publish Live
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-gray-900">Permanently Delete Profile?</h3>
              <p className="text-[12px] text-gray-500 mt-1">
                Are you sure you want to permanently delete this user profile? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border rounded-xl text-gray-700 text-[12px] font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProfile(deleteConfirmId);
                  setDeleteConfirmId(null);
                  onToast('Profile deleted permanently');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[12px] font-bold shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Profile Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-[18px] text-[#1f1b14]">
                + Add New Candidate Profile (Admin Onboarding)
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-[12px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Gender:</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="bride">Bride (Female)</option>
                    <option value="groom">Groom (Male)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Age:</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                    min={18}
                    max={60}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Candidate Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma / Anjali Shukla"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Community:</label>
                  <input
                    type="text"
                    value={newCommunity}
                    onChange={(e) => setNewCommunity(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">District:</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="Varanasi">Varanasi</option>
                    <option value="Ayodhya">Ayodhya</option>
                    <option value="Gorakhpur">Gorakhpur</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Sultanpur">Sultanpur</option>
                    <option value="Basti">Basti</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Education & Profession:</label>
                <input
                  type="text"
                  value={newProfession}
                  onChange={(e) => setNewProfession(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g. Assistant Manager, Banking"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Father / Guardian Name:</label>
                  <input
                    type="text"
                    value={newFatherName}
                    onChange={(e) => setNewFatherName(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Guardian Phone:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">BDE Code:</label>
                  <input
                    type="text"
                    value={newBdeCode}
                    onChange={(e) => setNewBdeCode(e.target.value)}
                    className="w-full p-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Plan:</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
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
                    value={newRevenue}
                    onChange={(e) => setNewRevenue(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Post Card Photograph Selection (Min 1, Max 3) */}
              <div className="p-3 rounded-xl bg-[#fff8f3] border border-[#e3bfb4] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#ab3100] text-[12px] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    <span>Post Card Size Photographs (Minimum 1, Maximum 3 photos):</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ab3100] text-white">
                    {newPostCardPhotos.length}/3 attached
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {newPostCardPhotos.map((url, idx) => (
                    <div key={idx} className="relative w-14 aspect-[2/3] rounded-lg overflow-hidden border border-[#ab3100] shadow-xs group bg-gray-100">
                      <img src={url} alt={`Post Card ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-0.5 left-0.5 bg-black/70 text-white text-[8px] px-1 rounded font-bold">
                        #{idx + 1}
                      </div>
                      {newPostCardPhotos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setNewPostCardPhotos((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute bottom-0.5 right-0.5 p-0.5 rounded bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[12px]">delete</span>
                        </button>
                      )}
                    </div>
                  ))}

                  {newPostCardPhotos.length < 3 && (
                    <label className="w-14 aspect-[2/3] rounded-lg border-2 border-dashed border-[#ab3100]/50 hover:bg-[#ffece0] cursor-pointer flex flex-col items-center justify-center text-center p-1 text-[9px] text-[#ab3100] font-bold transition-colors">
                      <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                      <span>+ Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const res = ev.target?.result as string;
                              if (res && newPostCardPhotos.length < 3) {
                                setNewPostCardPhotos((prev) => [...prev, res]);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-gray-500">
                  4"×6" Post card ratio • Portrait and full-length view • First photo becomes the primary biodata picture
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
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
                  Save & Publish Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
